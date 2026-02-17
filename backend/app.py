from flask import Flask, request, jsonify, send_from_directory, session, redirect
from flask_cors import CORS
from pathlib import Path
from functools import wraps
from datetime import timedelta
import os

from models import db, User, Product, ShoppingList, ShoppingListItem

# ========== SETUP ==========

app = Flask(__name__)
BASE_DIR = Path(__file__).parent.parent

# Configuração
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{BASE_DIR / "data" / "feira.db"}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

# Inicializa banco
db.init_app(app)
CORS(app, supports_credentials=True)

# Cria tabelas
with app.app_context():
    db.create_all()


# ========== AUTENTICAÇÃO ==========

def login_required(f):
    """Decorator para proteger rotas privadas"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "Não autorizado"}), 401
        
        user = User.query.get(user_id)
        if not user:
            session.clear()
            return jsonify({"error": "Usuário não encontrado"}), 401
        
        request.user = user
        return f(*args, **kwargs)
    
    return decorated_function


# ========== AUTH ROUTES ==========

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Registra novo usuário"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        # Validação
        if not email or not password:
            return jsonify({"error": "Email e senha obrigatórios"}), 400
        
        if len(password) < 6:
            return jsonify({"error": "Senha deve ter mínimo 6 caracteres"}), 400
        
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email já registrado"}), 400
        
        # Cria usuário
        user = User(email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Login automático
        session['user_id'] = user.id
        session.permanent = True
        
        return jsonify({"message": "Registro bem-sucedido", "user": user.to_dict()}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """Faz login"""
    try:
        data = request.get_json()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({"error": "Email e senha obrigatórios"}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({"error": "Email ou senha incorretos"}), 401
        
        session['user_id'] = user.id
        session.permanent = True
        
        return jsonify({"message": "Login bem-sucedido", "user": user.to_dict()}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    """Faz logout"""
    session.clear()
    return jsonify({"message": "Logout bem-sucedido"}), 200


@app.route('/api/auth/me', methods=['GET'])
@login_required
def get_current_user():
    """Retorna usuário atual"""
    return jsonify(request.user.to_dict()), 200


@app.route('/api/auth/theme', methods=['PUT'])
@login_required
def update_theme():
    """Atualiza tema do usuário"""
    try:
        data = request.get_json()
        theme = data.get('theme', 'light')
        
        if theme not in ['light', 'dark']:
            return jsonify({"error": "Tema inválido"}), 400
        
        request.user.theme = theme
        db.session.commit()
        
        return jsonify({"message": "Tema atualizado", "theme": theme}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ========== PRODUTOS ==========

@app.route('/api/produtos', methods=['GET'])
@login_required
def list_produtos():
    """Lista produtos do usuário"""
    try:
        produtos = request.user.produtos.all()
        return jsonify([p.to_dict() for p in produtos]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/produtos', methods=['POST'])
@login_required
def create_produto():
    """Cria novo produto"""
    try:
        data = request.get_json()
        
        required_fields = ['nome', 'categoria', 'quantidade', 'unidade', 'preco_unidade']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Campos obrigatórios faltando"}), 400
        
        produto = Product(
            user_id=request.user.id,
            nome=data['nome'].strip(),
            categoria=data['categoria'].strip(),
            quantidade=float(data['quantidade']),
            unidade=data['unidade'],
            preco_unidade=float(data['preco_unidade']),
            descricao=data.get('descricao', '').strip()
        )
        
        db.session.add(produto)
        db.session.commit()
        
        return jsonify(produto.to_dict()), 201
    
    except ValueError as e:
        return jsonify({"error": f"Erro de validação: {str(e)}"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/produtos/<int:produto_id>', methods=['DELETE'])
@login_required
def delete_produto(produto_id):
    """Deleta produto"""
    try:
        produto = Product.query.filter_by(id=produto_id, user_id=request.user.id).first()
        
        if not produto:
            return jsonify({"error": "Produto não encontrado"}), 404
        
        db.session.delete(produto)
        db.session.commit()
        
        return jsonify({"message": "Produto deletado"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ========== LISTAS ==========

@app.route('/api/listas', methods=['GET'])
@login_required
def list_listas():
    """Lista todas as listas do usuário"""
    try:
        listas = request.user.listas.all()
        return jsonify([l.to_dict() for l in listas]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/listas', methods=['POST'])
@login_required
def create_lista():
    """Cria nova lista"""
    try:
        data = request.get_json()
        
        if 'nome' not in data:
            return jsonify({"error": "Nome obrigatório"}), 400
        
        lista = ShoppingList(
            user_id=request.user.id,
            nome=data['nome'].strip()
        )
        
        db.session.add(lista)
        db.session.commit()
        
        return jsonify(lista.to_dict()), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/listas/<int:lista_id>', methods=['GET'])
@login_required
def get_lista(lista_id):
    """Retorna lista específica"""
    try:
        lista = ShoppingList.query.filter_by(id=lista_id, user_id=request.user.id).first()
        
        if not lista:
            return jsonify({"error": "Lista não encontrada"}), 404
        
        return jsonify(lista.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/listas/<int:lista_id>/itens', methods=['POST'])
@login_required
def add_item(lista_id):
    """Adiciona item à lista"""
    try:
        lista = ShoppingList.query.filter_by(id=lista_id, user_id=request.user.id).first()
        
        if not lista:
            return jsonify({"error": "Lista não encontrada"}), 404
        
        data = request.get_json()
        
        if 'produto_id' not in data or 'quantidade' not in data:
            return jsonify({"error": "produto_id e quantidade obrigatórios"}), 400
        
        produto_id = int(data['produto_id'])
        
        # Valida se produto pertence ao usuário
        produto = Product.query.filter_by(id=produto_id, user_id=request.user.id).first()
        if not produto:
            return jsonify({"error": "Produto não encontrado"}), 404
        
        # Verifica se item já existe na lista
        item_existente = ShoppingListItem.query.filter_by(
            lista_id=lista_id,
            produto_id=produto_id
        ).first()
        
        if item_existente:
            # Atualiza quantidade se já existe
            item_existente.quantidade = float(data['quantidade'])
            item_existente.checked = False
        else:
            # Cria novo item
            novo_item = ShoppingListItem(
                lista_id=lista_id,
                produto_id=produto_id,
                quantidade=float(data['quantidade']),
                checked=False
            )
            db.session.add(novo_item)
        
        db.session.commit()
        return jsonify(lista.to_dict()), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/listas/<int:lista_id>/itens/<int:produto_id>/toggle', methods=['PUT'])
@login_required
def toggle_item(lista_id, produto_id):
    """Marca/desmarca item"""
    try:
        lista = ShoppingList.query.filter_by(id=lista_id, user_id=request.user.id).first()
        
        if not lista:
            return jsonify({"error": "Lista não encontrada"}), 404
        
        # Busca o item (valida que pertence ao usuário através da lista)
        item = ShoppingListItem.query.filter_by(
            lista_id=lista_id,
            produto_id=produto_id
        ).first()
        
        if not item:
            return jsonify({"error": "Item não encontrado"}), 404
        
        item.checked = not item.checked
        db.session.commit()
        
        return jsonify(lista.to_dict()), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/listas/<int:lista_id>/itens/<int:produto_id>/quantidade', methods=['PUT'])
@login_required
def update_item_quantidade(lista_id, produto_id):
    """Atualiza quantidade do item"""
    try:
        lista = ShoppingList.query.filter_by(id=lista_id, user_id=request.user.id).first()
        
        if not lista:
            return jsonify({"error": "Lista não encontrada"}), 404
        
        data = request.get_json()
        
        if 'quantidade' not in data:
            return jsonify({"error": "quantidade obrigatória"}), 400
        
        # Busca o item
        item = ShoppingListItem.query.filter_by(
            lista_id=lista_id,
            produto_id=produto_id
        ).first()
        
        if not item:
            return jsonify({"error": "Item não encontrado"}), 404
        
        item.quantidade = float(data['quantidade'])
        db.session.commit()
        
        return jsonify(lista.to_dict()), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/api/listas/<int:lista_id>/itens/<int:produto_id>', methods=['DELETE'])
@login_required
def remove_item(lista_id, produto_id):
    """Remove item da lista"""
    try:
        lista = ShoppingList.query.filter_by(id=lista_id, user_id=request.user.id).first()
        
        if not lista:
            return jsonify({"error": "Lista não encontrada"}), 404
        
        # Busca e deleta o item
        item = ShoppingListItem.query.filter_by(
            lista_id=lista_id,
            produto_id=produto_id
        ).first()
        
        if not item:
            return jsonify({"error": "Item não encontrado"}), 404
        
        db.session.delete(item)
        db.session.commit()
        
        return jsonify(lista.to_dict()), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ========== STATIC FILES ==========

@app.route('/')
def serve_index():
    """Serve o index.html (ou login.html se não autenticado)"""
    if not session.get('user_id'):
        return send_from_directory(BASE_DIR / 'frontend', 'login.html')
    return send_from_directory(BASE_DIR / 'frontend', 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Serve arquivos estáticos"""
    # Serve login.html se tentar acessar / sem autenticação
    if path == 'login' or path == 'login.html':
        return send_from_directory(BASE_DIR / 'frontend', 'login.html')
    return send_from_directory(BASE_DIR / 'frontend', path)


# ========== ERROR HANDLERS ==========

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Não encontrado"}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Erro interno do servidor"}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pathlib import Path
import os

from database import (
    get_all_produtos, get_produto, create_produto, update_produto, delete_produto,
    get_all_listas, get_lista, create_lista, add_item_to_lista,
    toggle_item_checked, update_item_quantidade, remove_item_from_lista
)

app = Flask(__name__)
CORS(app)

# Configuração para PythonAnywhere
BASE_DIR = Path(__file__).parent.parent
app.config['JSON_SORT_KEYS'] = False


# ========== ROUTES - PRODUTOS ==========

@app.route('/api/produtos', methods=['GET'])
def list_produtos():
    """Lista todos os produtos"""
    try:
        produtos = get_all_produtos()
        return jsonify(produtos), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/produtos/<produto_id>', methods=['GET'])
def get_produto_route(produto_id):
    """Retorna um produto específico"""
    try:
        produto = get_produto(produto_id)
        if not produto:
            return jsonify({"error": "Produto não encontrado"}), 404
        return jsonify(produto), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/produtos', methods=['POST'])
def create_produto_route():
    """Cria um novo produto"""
    try:
        data = request.get_json()
        
        # Validação básica
        required_fields = ['nome', 'categoria', 'quantidade', 'unidade', 'preco_unidade']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Campos obrigatórios faltando"}), 400
        
        produto = create_produto(
            nome=data['nome'],
            categoria=data['categoria'],
            quantidade=data['quantidade'],
            unidade=data['unidade'],
            preco_unidade=data['preco_unidade'],
            descricao=data.get('descricao', '')
        )
        
        return jsonify(produto), 201
    except ValueError as e:
        return jsonify({"error": f"Erro de validação: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/produtos/<produto_id>', methods=['PUT'])
def update_produto_route(produto_id):
    """Atualiza um produto"""
    try:
        data = request.get_json()
        produto = update_produto(produto_id, **data)
        
        if not produto:
            return jsonify({"error": "Produto não encontrado"}), 404
        
        return jsonify(produto), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/produtos/<produto_id>', methods=['DELETE'])
def delete_produto_route(produto_id):
    """Deleta um produto"""
    try:
        if delete_produto(produto_id):
            return jsonify({"message": "Produto deletado"}), 200
        return jsonify({"error": "Produto não encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========== ROUTES - LISTAS ==========

@app.route('/api/listas', methods=['GET'])
def list_listas():
    """Lista todas as listas"""
    try:
        listas = get_all_listas()
        return jsonify(listas), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/listas/<lista_id>', methods=['GET'])
def get_lista_route(lista_id):
    """Retorna uma lista específica"""
    try:
        lista = get_lista(lista_id)
        if not lista:
            return jsonify({"error": "Lista não encontrada"}), 404
        return jsonify(lista), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/listas', methods=['POST'])
def create_lista_route():
    """Cria uma nova lista"""
    try:
        data = request.get_json()
        
        if 'nome' not in data:
            return jsonify({"error": "Nome da lista é obrigatório"}), 400
        
        lista = create_lista(data['nome'])
        return jsonify(lista), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/listas/<lista_id>/itens', methods=['POST'])
def add_item_route(lista_id):
    """Adiciona um item a uma lista"""
    try:
        data = request.get_json()
        
        if 'produto_id' not in data or 'quantidade' not in data:
            return jsonify({"error": "produto_id e quantidade são obrigatórios"}), 400
        
        lista = add_item_to_lista(lista_id, data['produto_id'], data['quantidade'])
        
        if not lista:
            return jsonify({"error": "Lista não encontrada"}), 404
        
        return jsonify(lista), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/listas/<lista_id>/itens/<produto_id>/toggle', methods=['PUT'])
def toggle_item_route(lista_id, produto_id):
    """Marca/desmarca um item"""
    try:
        lista = toggle_item_checked(lista_id, produto_id)
        
        if not lista:
            return jsonify({"error": "Lista ou item não encontrado"}), 404
        
        return jsonify(lista), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/listas/<lista_id>/itens/<produto_id>/quantidade', methods=['PUT'])
def update_item_quantidade_route(lista_id, produto_id):
    """Atualiza a quantidade de um item"""
    try:
        data = request.get_json()
        
        if 'quantidade' not in data:
            return jsonify({"error": "quantidade é obrigatória"}), 400
        
        lista = update_item_quantidade(lista_id, produto_id, data['quantidade'])
        
        if not lista:
            return jsonify({"error": "Lista ou item não encontrado"}), 404
        
        return jsonify(lista), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/listas/<lista_id>/itens/<produto_id>', methods=['DELETE'])
def remove_item_route(lista_id, produto_id):
    """Remove um item de uma lista"""
    try:
        lista = remove_item_from_lista(lista_id, produto_id)
        
        if not lista:
            return jsonify({"error": "Lista não encontrada"}), 404
        
        return jsonify(lista), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========== STATIC FILES ==========

@app.route('/')
def serve_index():
    """Serve o arquivo index.html"""
    return send_from_directory(BASE_DIR / 'frontend', 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Serve arquivos estáticos"""
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

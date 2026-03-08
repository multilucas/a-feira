from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    """Usuário do sistema"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    first_name = db.Column(db.String(120), nullable=True)
    last_name = db.Column(db.String(120), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    theme = db.Column(db.String(10), default='light')  # 'light' ou 'dark'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    produtos = db.relationship('Product', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    listas = db.relationship('ShoppingList', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash seguro da senha"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verifica senha"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'theme': self.theme,
            'created_at': self.created_at.isoformat()
        }


class Product(db.Model):
    """Produto cadastrado pelo usuário"""
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    nome = db.Column(db.String(120), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    quantidade = db.Column(db.Float, nullable=False)
    unidade = db.Column(db.String(20), nullable=False)
    preco_unidade = db.Column(db.Float, nullable=False, default=0.0)
    descricao = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamento com itens de lista
    itens_listas = db.relationship('ShoppingListItem', backref='produto', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'categoria': self.categoria,
            'quantidade': self.quantidade,
            'unidade': self.unidade,
            'preco_unidade': self.preco_unidade,
            'descricao': self.descricao,
            'created_at': self.created_at.isoformat()
        }


class ShoppingList(db.Model):
    """Lista de compras do usuário"""
    __tablename__ = 'shopping_lists'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    nome = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamento com itens
    itens = db.relationship('ShoppingListItem', backref='lista', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        """Retorna lista com itens em formato JSON para o frontend"""
        return {
            'id': self.id,
            'nome': self.nome,
            'itens': [item.to_dict() for item in self.itens],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class ShoppingListItem(db.Model):
    """Item de uma lista de compras (relação entre lista e produto)"""
    __tablename__ = 'shopping_list_items'
    
    id = db.Column(db.Integer, primary_key=True)
    lista_id = db.Column(db.Integer, db.ForeignKey('shopping_lists.id'), nullable=False)
    produto_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    quantidade = db.Column(db.Float, nullable=False, default=1.0)
    checked = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Retorna item com dados do produto para o frontend"""
        return {
            'id': self.id,
            'produto_id': self.produto_id,
            'quantidade': self.quantidade,
            'checked': self.checked,
            'produto': self.produto.to_dict() if self.produto else None
        }


import json
import os
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

PRODUTOS_FILE = DATA_DIR / "produtos.json"
LISTAS_FILE = DATA_DIR / "listas.json"


def _load_json(filepath):
    """Carrega dados de um arquivo JSON"""
    if not filepath.exists():
        return {}
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}


def _save_json(filepath, data):
    """Salva dados em um arquivo JSON"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ========== PRODUTOS ==========

def get_all_produtos():
    """Retorna todos os produtos cadastrados"""
    data = _load_json(PRODUTOS_FILE)
    return list(data.values()) if data else []


def get_produto(produto_id):
    """Retorna um produto específico"""
    data = _load_json(PRODUTOS_FILE)
    return data.get(str(produto_id))


def create_produto(nome, categoria, quantidade, unidade, preco_unidade, descricao=""):
    """Cria um novo produto"""
    data = _load_json(PRODUTOS_FILE)
    
    # Gera ID simples baseado em timestamp
    produto_id = str(int(datetime.now().timestamp() * 1000))
    
    produto = {
        "id": produto_id,
        "nome": nome.strip(),
        "categoria": categoria.strip(),
        "quantidade": float(quantidade),
        "unidade": unidade,
        "preco_unidade": float(preco_unidade),
        "descricao": descricao.strip(),
        "created_at": datetime.now().isoformat()
    }
    
    data[produto_id] = produto
    _save_json(PRODUTOS_FILE, data)
    
    return produto


def update_produto(produto_id, **kwargs):
    """Atualiza um produto existente"""
    data = _load_json(PRODUTOS_FILE)
    produto_id = str(produto_id)
    
    if produto_id not in data:
        return None
    
    # Atualiza apenas campos fornecidos
    for key in ['nome', 'categoria', 'quantidade', 'unidade', 'preco_unidade', 'descricao']:
        if key in kwargs:
            if key in ['quantidade', 'preco_unidade']:
                data[produto_id][key] = float(kwargs[key])
            else:
                data[produto_id][key] = str(kwargs[key]).strip()
    
    _save_json(PRODUTOS_FILE, data)
    return data[produto_id]


def delete_produto(produto_id):
    """Deleta um produto"""
    data = _load_json(PRODUTOS_FILE)
    produto_id = str(produto_id)
    
    if produto_id in data:
        del data[produto_id]
        _save_json(PRODUTOS_FILE, data)
        return True
    
    return False


# ========== LISTAS ==========

def get_all_listas():
    """Retorna todas as listas de compras"""
    data = _load_json(LISTAS_FILE)
    return list(data.values()) if data else []


def get_lista(lista_id):
    """Retorna uma lista específica"""
    data = _load_json(LISTAS_FILE)
    return data.get(str(lista_id))


def create_lista(nome):
    """Cria uma nova lista de compras"""
    data = _load_json(LISTAS_FILE)
    
    lista_id = str(int(datetime.now().timestamp() * 1000))
    
    lista = {
        "id": lista_id,
        "nome": nome.strip(),
        "itens": [],
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat()
    }
    
    data[lista_id] = lista
    _save_json(LISTAS_FILE, data)
    
    return lista


def add_item_to_lista(lista_id, produto_id, quantidade):
    """Adiciona um item a uma lista"""
    data = _load_json(LISTAS_FILE)
    lista_id = str(lista_id)
    produto_id = str(produto_id)
    
    if lista_id not in data:
        return None
    
    # Verifica se produto já existe na lista
    for item in data[lista_id]["itens"]:
        if item["produto_id"] == produto_id:
            item["quantidade"] = float(quantidade)
            item["checked"] = False
            data[lista_id]["updated_at"] = datetime.now().isoformat()
            _save_json(LISTAS_FILE, data)
            return data[lista_id]
    
    # Adiciona novo item
    item = {
        "produto_id": produto_id,
        "quantidade": float(quantidade),
        "checked": False
    }
    
    data[lista_id]["itens"].append(item)
    data[lista_id]["updated_at"] = datetime.now().isoformat()
    _save_json(LISTAS_FILE, data)
    
    return data[lista_id]


def toggle_item_checked(lista_id, produto_id):
    """Marca/desmarca um item como comprado"""
    data = _load_json(LISTAS_FILE)
    lista_id = str(lista_id)
    produto_id = str(produto_id)
    
    if lista_id not in data:
        return None
    
    for item in data[lista_id]["itens"]:
        if item["produto_id"] == produto_id:
            item["checked"] = not item["checked"]
            data[lista_id]["updated_at"] = datetime.now().isoformat()
            _save_json(LISTAS_FILE, data)
            return data[lista_id]
    
    return None


def update_item_quantidade(lista_id, produto_id, quantidade):
    """Atualiza a quantidade de um item"""
    data = _load_json(LISTAS_FILE)
    lista_id = str(lista_id)
    produto_id = str(produto_id)
    
    if lista_id not in data:
        return None
    
    for item in data[lista_id]["itens"]:
        if item["produto_id"] == produto_id:
            item["quantidade"] = float(quantidade)
            data[lista_id]["updated_at"] = datetime.now().isoformat()
            _save_json(LISTAS_FILE, data)
            return data[lista_id]
    
    return None


def remove_item_from_lista(lista_id, produto_id):
    """Remove um item de uma lista"""
    data = _load_json(LISTAS_FILE)
    lista_id = str(lista_id)
    produto_id = str(produto_id)
    
    if lista_id not in data:
        return None
    
    data[lista_id]["itens"] = [
        item for item in data[lista_id]["itens"]
        if item["produto_id"] != produto_id
    ]
    
    data[lista_id]["updated_at"] = datetime.now().isoformat()
    _save_json(LISTAS_FILE, data)
    
    return data[lista_id]

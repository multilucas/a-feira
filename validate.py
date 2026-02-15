#!/usr/bin/env python3
"""
Script simples de validação do projeto
Executa verificações básicas antes de rodar a aplicação
"""

import sys
import json
from pathlib import Path

def check_structure():
    """Valida estrutura de pastas e arquivos"""
    required_files = [
        'backend/app.py',
        'backend/database.py',
        'backend/requirements.txt',
        'frontend/index.html',
        'frontend/app.js',
        'docs/feature-1-cadastro-produtos.md',
        'docs/feature-2-cadastro-listas.md',
        'docs/feature-3-comportamento-lista.md',
        'README.md'
    ]
    
    base_dir = Path(__file__).parent
    
    print("📁 Validando estrutura do projeto...")
    for file_path in required_files:
        full_path = base_dir / file_path
        if full_path.exists():
            print(f"  ✓ {file_path}")
        else:
            print(f"  ✗ {file_path} (FALTA!)")
            return False
    
    return True


def check_python():
    """Valida versão do Python"""
    print("\n🐍 Validando Python...")
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"  ✓ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"  ✗ Python 3.8+ necessário (você tem {version.major}.{version.minor})")
        return False


def check_dependencies():
    """Valida dependências instaladas"""
    print("\n📦 Validando dependências...")
    
    try:
        import flask
        print(f"  ✓ Flask {flask.__version__}")
    except ImportError:
        print("  ✗ Flask não instalado. Execute: pip install -r backend/requirements.txt")
        return False
    
    try:
        from flask_cors import CORS
        print(f"  ✓ Flask-CORS")
    except ImportError:
        print("  ✗ Flask-CORS não instalado. Execute: pip install -r backend/requirements.txt")
        return False
    
    return True


def check_json_files():
    """Valida arquivos JSON (ou cria vazios)"""
    print("\n📄 Validando arquivos de dados...")
    
    base_dir = Path(__file__).parent
    data_dir = base_dir / 'data'
    data_dir.mkdir(exist_ok=True)
    
    for filename in ['produtos.json', 'listas.json']:
        filepath = data_dir / filename
        if filepath.exists():
            try:
                with open(filepath, 'r') as f:
                    json.load(f)
                print(f"  ✓ {filename} (válido)")
            except json.JSONDecodeError:
                print(f"  ⚠️  {filename} (JSON inválido, será recriado)")
                filepath.write_text('{}')
        else:
            print(f"  ℹ️  {filename} (será criado ao usar)")
    
    return True


def main():
    print("=" * 50)
    print("🔍 VALIDAÇÃO DO PROJETO - A Feira")
    print("=" * 50)
    
    checks = [
        check_structure(),
        check_python(),
        check_dependencies(),
        check_json_files()
    ]
    
    print("\n" + "=" * 50)
    
    if all(checks):
        print("✅ Tudo ok! Pronto para rodar:\n")
        print("   cd backend")
        print("   python app.py")
        print("\n   Depois abra: http://localhost:5000")
        return 0
    else:
        print("❌ Corrija os problemas acima antes de rodar")
        return 1


if __name__ == '__main__':
    sys.exit(main())

#!/bin/bash

# A Feira - Quick Start Script
# Executa setup e inicia a aplicação

set -e

BASEDIR=$(dirname "$0")
cd "$BASEDIR"

echo ""
echo "=================================="
echo "🛒 A FEIRA - Quick Start"
echo "=================================="
echo ""

# Validar Python
echo "🔍 Validando..."
python3 validate.py

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
cd backend

# Criar venv se não existir
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar venv
echo "Ativando ambiente virtual..."
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null || true

# Instalar requirements
pip install -q -r requirements.txt

# Voltar para root
cd ..

echo ""
echo "🚀 Iniciando servidor..."
echo ""
echo "   App rodando em: http://localhost:5000"
echo "   Pressione Ctrl+C para parar"
echo ""

cd backend
python3 app.py

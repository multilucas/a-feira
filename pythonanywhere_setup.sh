#!/bin/bash

# Script para facilitar deploy no PythonAnywhere
# Uso: bash pythonanywhere_setup.sh

set -e  # Exit on error

echo "🚀 Setup do A Feira no PythonAnywhere"
echo "======================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no PythonAnywhere
if [[ ! -d "/var/www" ]]; then
    echo -e "${RED}❌ Este script deve ser executado no PythonAnywhere!${NC}"
    exit 1
fi

# Obter username
USERNAME=$(whoami)
echo -e "${GREEN}✓ Username: $USERNAME${NC}"

# Caminhos
PROJECT_DIR="/home/$USERNAME/a-feira"
VENV_PATH="/home/$USERNAME/.virtualenvs/a-feira-env"

echo ""
echo "📋 Passo 1: Verificar estrutura do projeto..."
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Diretório $PROJECT_DIR não encontrado!${NC}"
    echo "Clone o repositório primeiro:"
    echo "  git clone https://github.com/SEU_USUARIO/a-feira.git ~/a-feira"
    exit 1
fi
echo -e "${GREEN}✓ Projeto encontrado em $PROJECT_DIR${NC}"

echo ""
echo "🐍 Passo 2: Criar/ativar virtualenv..."
if [ ! -d "$VENV_PATH" ]; then
    echo "Criando virtualenv..."
    mkvirtualenv --python=/usr/bin/python3.13 a-feira-env
else
    echo -e "${GREEN}✓ Virtualenv já existe${NC}"
fi
source "$VENV_PATH/bin/activate"

echo ""
echo "📦 Passo 3: Instalar dependências..."
pip install --upgrade pip
pip install -r "$PROJECT_DIR/backend/requirements.txt"
echo -e "${GREEN}✓ Dependências instaladas${NC}"

echo ""
echo "📁 Passo 4: Criar diretório de dados..."
mkdir -p "$PROJECT_DIR/data"
chmod 755 "$PROJECT_DIR/data"
chmod 755 "$PROJECT_DIR"
echo -e "${GREEN}✓ Diretório de dados criado${NC}"

echo ""
echo "🔑 Passo 5: Gerar chave secreta..."
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
echo -e "${YELLOW}⚠️  Sua chave secreta (salve em lugar seguro):${NC}"
echo -e "${GREEN}$SECRET_KEY${NC}"

echo ""
echo "📝 Passo 6: Informações para WSGI manual..."
echo -e "${YELLOW}Substitua as seguintes informações no seu arquivo WSGI:${NC}"
echo ""
echo "  project_dir = '/home/$USERNAME/a-feira'"
echo "  activate_this = '/home/$USERNAME/.virtualenvs/a-feira-env/bin/activate_this.py'"
echo "  SECRET_KEY = '$SECRET_KEY'"
echo ""

echo ""
echo "📋 Próximos passos no painel do PythonAnywhere:"
echo "  1. Abra a aba 'Web'"
echo "  2. Configure Virtualenv: /home/$USERNAME/.virtualenvs/a-feira-env"
echo "  3. Cole o arquivo WSGI (veja wsgi_example.py)"
echo "  4. Configure Static files (URL: / → Directory: /home/$USERNAME/a-feira/frontend)"
echo "  5. Clique em 'Reload'"
echo ""
echo -e "${GREEN}✅ Setup concluído!${NC}"
echo "Visite https://$USERNAME.pythonanywhere.com para acessar sua app"

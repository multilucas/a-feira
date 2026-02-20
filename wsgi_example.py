# WSGI configuration file for PythonAnywhere
# Este é o arquivo que será criado automaticamente no PythonAnywhere
# Localization: /var/www/{username}_pythonanywhere_com.wsgi

import sys
import os
from datetime import timedelta

# ========== Configuração de Path ==========
# Substitua {username} pelo seu nome de usuário no PythonAnywhere
project_dir = '/home/{username}/a-feira'
sys.path.insert(0, project_dir)

# ========== Ativar Virtualenv ==========
activate_this = '/home/{username}/.virtualenvs/a-feira-env/bin/activate_this.py'
with open(activate_this) as f:
    code = compile(f.read(), activate_this, 'exec')
    exec(code, {'__file__': activate_this})

# ========== Variáveis de Ambiente ==========
# IMPORTANTE: Gere uma chave secreta com:
# python3 -c "import secrets; print(secrets.token_hex(32))"
os.environ['SECRET_KEY'] = 'SUA_CHAVE_SECRETA_AQUI'
os.environ['FLASK_ENV'] = 'production'

# ========== Criar Diretório de Dados ==========
# Garante que o diretório para banco de dados existe
data_dir = os.path.join(project_dir, 'data')
os.makedirs(data_dir, exist_ok=True)

# ========== Importar Aplicação Flask ==========
try:
    from backend.app import app
    application = app
    
    # ========== Configurações de Produção ==========
    application.config.update(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-key'),
        SQLALCHEMY_DATABASE_URI=f'sqlite:///{data_dir}/feira.db',
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        SESSION_COOKIE_SECURE=True,  # Ativa apenas com HTTPS
        PERMANENT_SESSION_LIFETIME=timedelta(days=30),
        ENV='production',
        DEBUG=False  # NUNCA ative DEBUG em produção!
    )
    
except ImportError as e:
    # Se der erro na importação, cria uma app de fallback
    def application(environ, start_response):
        status = '500 Internal Server Error'
        response_headers = [('Content-Type', 'text/plain')]
        start_response(status, response_headers)
        return [f'Erro ao carregar aplicação: {str(e)}'.encode('utf-8')]

# ========== Logging (Opcional) ==========
# import logging
# logging.basicConfig(
#     filename=f'{project_dir}/app.log',
#     level=logging.DEBUG,
#     format='%(asctime)s %(levelname)s: %(message)s'
# )

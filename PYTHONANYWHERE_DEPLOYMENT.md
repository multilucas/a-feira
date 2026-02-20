# Guia de Deploy no PythonAnywhere (Versão Gratuita)

## ✅ Boas Notícias Sobre Python 3.13 vs 3.14.3

A diferença entre Python 3.14.3 (local) e 3.13 (PythonAnywhere) **é mínima** e compatível.
- Suas dependências funcionarão perfeitamente
- Nenhuma alteração no código é necessária
- As bibliotecas usadas (Flask, SQLAlchemy) suportam ambas versões

## 📋 Pré-requisitos

Antes de começar, certifique-se que tem:
- ✅ Repositório Git no GitHub (você já tem `.git/`)
- ✅ `requirements.txt` com dependências
- ✅ Estrutura de projeto pronta

## 🚀 Passo 1: Clonar o Repositório no PythonAnywhere

Após fazer login no PythonAnywhere:

1. Abra o **Bash Console** (ou Terminal)
2. Clone seu repositório:
```bash
cd ~
git clone https://github.com/SEU_USUARIO/a-feira.git
cd a-feira
```

## 🔧 Passo 2: Criar Virtualenv no PythonAnywhere

No Bash Console do PythonAnywhere:
```bash
cd ~/a-feira
mkvirtualenv --python=/usr/bin/python3.13 a-feira-env
pip install --upgrade pip
pip install -r backend/requirements.txt
```

## 📁 Passo 3: Configurar WSGI Manual

No painel do PythonAnywhere:
1. Acesse **Web** → **Add a new web app**
2. Escolha **Manual configuration**
3. Selecione **Python 3.13**
4. Clique em **Next**
5. Você receberá um arquivo WSGI em `/var/www/seuusuario_pythonanywhere_com.wsgi`

## 📝 Passo 4: Editar Arquivo WSGI

No PythonAnywhere, abra o arquivo WSGI e **substitua todo o conteúdo** por:

```python
import sys
import os

# Adiciona o diretório do projeto ao path
project_dir = '/home/{username}/a-feira'
sys.path.insert(0, project_dir)

# Ativa o virtualenv
activate_this = '/home/{username}/.virtualenvs/a-feira-env/bin/activate_this.py'
exec(open(activate_this).read(), {'__file__': activate_this})

# Define variáveis de ambiente
os.environ['SECRET_KEY'] = 'sua-chave-secreta-aqui-mudepara-producao'
os.environ['FLASK_ENV'] = 'production'

# Importa a aplicação Flask
from backend.app import app
application = app
```

**Substitua `{username}` pelo seu nome de usuário do PythonAnywhere!**

## 🔐 Passo 5: Configurar Variáveis de Ambiente

Na seção **Web** do PythonAnywhere, procure por **Environment variables** e adicione:
```
SECRET_KEY = sua-chave-secreta-segura-aleatorizada
FLASK_ENV = production
```

## 📊 Passo 6: Configurar Virtualenv no Web App

Na aba **Web** do PythonAnywhere:
1. Procure por **Virtualenv:**
2. Digite o caminho completo: `/home/{username}/.virtualenvs/a-feira-env`
3. Salve

## 🗄️ Passo 7: Diretório de Banco de Dados

O banco SQLite precisa de permissões de escrita:

1. No Bash Console:
```bash
mkdir -p ~/a-feira/data
chmod 755 ~/a-feira/data
chmod 755 ~/a-feira
```

2. No WSGI, adicione esta linha após importar `app`:
```python
os.makedirs(os.path.expanduser('~/a-feira/data'), exist_ok=True)
```

## 🌐 Passo 8: Arquivos Estáticos (Frontend)

No PythonAnywhere - aba **Web**:
1. Procure por **Static files**
2. Adicione uma entrada:
   - **URL**: `/`
   - **Directory**: `/home/{username}/a-feira/frontend`

3. Salve e recarregue (clique em **Reload**)

## ♻️ Passo 9: Recarregar a Aplicação

Após todas as mudanças:
1. Clique em **Reload** (botão verde) na aba **Web**
2. Visite sua URL: `https://{username}.pythonanywhere.com`
3. Você deve ver a página de **Login**

## 🔄 Passo 10: Atualizar Código (Git Pull)

Para atualizar seu código após push no GitHub:

1. No Bash Console do PythonAnywhere:
```bash
cd ~/a-feira
git pull origin main  # ou sua branch
```

2. Se modificou `requirements.txt`:
```bash
source ~/.virtualenvs/a-feira-env/bin/activate
pip install -r backend/requirements.txt
```

3. Recarregue a web app no painel do PythonAnywhere

## ⚠️ Passo 11: Verificar Logs

Se algo der errado, verifique os logs em PythonAnywhere:
- **Error log**: `/var/log/seuusuario.pythonanywhere.com.error.log`
- **Access log**: `/var/log/seuusuario.pythonanywhere.com.access.log`

Ou no Bash Console:
```bash
tail -f /var/log/{username}.pythonanywhere.com.error.log
```

## 🔒 Considerações de Segurança

**IMPORTANTE - Antes de ir para produção:**

1. **Mude `SECRET_KEY`** para um valor aleatório:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

2. Adicione o domínio ao `ALLOWED_HOSTS` em `app.py`:
```python
app.config['ALLOWED_HOSTS'] = ['{username}.pythonanywhere.com']
```

3. Configure `SESSION_COOKIE_SECURE = True` em `app.py` (para HTTPS)

## 📌 Estrutura de Diretórios Esperada

```
/home/{username}/
└── a-feira/
    ├── backend/
    │   ├── app.py
    │   ├── models.py
    │   ├── database.py
    │   └── requirements.txt
    ├── frontend/
    │   ├── index.html
    │   ├── login.html
    │   └── app.js
    ├── data/
    │   └── feira.db (criado automaticamente)
    ├── .git/
    └── run.sh
```

## ✨ Próximas Etapas Após Deploy

1. Teste o registro de novo usuário
2. Teste criação de listas e produtos
3. Verifique se o banco de dados está sendo criado (`data/feira.db`)
4. Configure domínio customizado (se desejar)
5. Configure SSL/HTTPS (automático no PythonAnywhere)

## 🆘 Troubleshooting Comum

### Erro 500 ao acessar
- Verifique o error.log
- Certifique-se que virtualenv está configurado corretamente
- Verifique permissões do diretório `data/`

### Banco de dados não é criado
- Certifique-se que diretório `data/` existe e tem permissão de escrita
- Verifique se o caminho no `models.py` está correto para produção

### Arquivo WSGI não importa corretamente
- Verifique caminhos absolutos em `/home/{username}/`
- Teste no Bash: `cd ~/a-feira && python -c "from backend.app import app; print(app)"`

---

**Pronto para começar? Vou aguardar seu feedback após os primeiros passos!**

# ✅ Respostas às Suas Dúvidas - Deploy PythonAnywhere

## 1️⃣ Python 3.13 vs 3.14.3 - É compatível?

**SIM, 100% compatível!** ✅

- A diferença entre Python 3.14.3 e 3.13 é mínima
- Suas dependências funcionarão perfeitamente em 3.13
- **Nenhuma alteração** no seu código é necessária
- Flask, SQLAlchemy e todas as libs já suportam 3.13

## 2️⃣ O Projeto Precisa de Alterações?

**NÃO, está pronto para deploy!** ✅

Seu projeto já possui:
- ✅ `requirements.txt` com todas as dependências
- ✅ Estrutura Flask correta
- ✅ Banco de dados SQLite (funciona sem problemas no PythonAnywhere)
- ✅ Arquivos estáticos (frontend) organizados

**ÚNICA recomendação**: Criar um arquivo `.gitignore` para não fazer push de dados sensíveis.

## 3️⃣ Usar Git do GitHub é Bom?

**SIM, é a melhor prática!** ✅

**Vantagens:**
- Fácil manter código sincronizado
- Fazer push → git pull no PythonAnywhere → Reload
- Histórico de versões
- Fácil fazer rollback se necessário

**Passos resumidos:**
```bash
# No PythonAnywhere (Bash Console)
cd ~
git clone https://github.com/SEU_USUARIO/a-feira.git
cd a-feira
```

## 4️⃣ Próximas Orientações - Passo a Passo

### ✨ Primeira Etapa: Preparar Repositório GitHub

1. Certifique-se que seu `.git` está atualizado:
```bash
# Na sua máquina local
git add .
git commit -m "Preparando para deploy no PythonAnywhere"
git push origin main
```

2. Verifique que seu `.gitignore` contém (proteger dados):
```
.env
*.db
__pycache__/
*.pyc
venv/
.DS_Store
data/feira.db
```

### 🚀 Segunda Etapa: Criar Conta PythonAnywhere

1. Acesse: https://www.pythonanywhere.com
2. Crie conta gratuita
3. Confirme email
4. Abra o Bash Console

### 📥 Terceira Etapa: Clonar Repositório

**No Bash Console do PythonAnywhere:**
```bash
cd ~
git clone https://github.com/SEU_USUARIO/a-feira.git
cd a-feira
ls -la  # Verifique se está tudo aí
```

### 🐍 Quarta Etapa: Criar Virtualenv

**No Bash Console:**
```bash
cd ~/a-feira
mkvirtualenv --python=/usr/bin/python3.13 a-feira-env
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 🔧 Quinta Etapa: Configurar Web App Manual

1. No painel do PythonAnywhere
2. Acesse **Web**
3. Clique **Add a new web app**
4. Selecione **Manual configuration**
5. Escolha **Python 3.13**
6. Clique **Next**

Você receberá um arquivo WSGI em `/var/www/{username}_pythonanywhere_com.wsgi`

### 📝 Sexta Etapa: Editar Arquivo WSGI

1. No painel PythonAnywhere → **Web** → clique no arquivo WSGI
2. **Apague todo o conteúdo** e copie este template:

```python
import sys
import os
from datetime import timedelta

# Configuração de Path
project_dir = '/home/SEU_USERNAME_AQUI/a-feira'
sys.path.insert(0, project_dir)

# Ativar Virtualenv
activate_this = '/home/SEU_USERNAME_AQUI/.virtualenvs/a-feira-env/bin/activate_this.py'
with open(activate_this) as f:
    code = compile(f.read(), activate_this, 'exec')
    exec(code, {'__file__': activate_this})

# Variáveis de Ambiente
os.environ['SECRET_KEY'] = 'GERE_UMA_CHAVE_COM_PYTHON3_-c_import_secrets_print_secrets_token_hex_32'
os.environ['FLASK_ENV'] = 'production'

# Criar diretório de dados
data_dir = os.path.join(project_dir, 'data')
os.makedirs(data_dir, exist_ok=True)

# Importar aplicação
from backend.app import app
application = app

# Configurações de produção
application.config.update(
    SQLALCHEMY_DATABASE_URI=f'sqlite:///{data_dir}/feira.db',
    SESSION_COOKIE_SECURE=True,
    DEBUG=False
)
```

**IMPORTANTE: Substitua `SEU_USERNAME_AQUI` pelo seu nome de usuário!**

### 🔐 Sétima Etapa: Gerar Chave Secreta

**No Bash Console:**
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Copie o resultado e substitua em `SECRET_KEY` no arquivo WSGI.

### ⚙️ Oitava Etapa: Configurar Virtualenv na Web

1. Na aba **Web** do painel
2. Procure por **Virtualenv:**
3. Digite: `/home/SEU_USERNAME/a-livre-env`
4. Pressione Enter

### 📁 Nona Etapa: Configurar Arquivos Estáticos

1. Na aba **Web**, seção **Static files:**
2. Clique **Enter URL and directory locations below**
3. Adicione:
   - **URL**: `/`
   - **Directory**: `/home/SEU_USERNAME/a-feira/frontend`
4. Salve

### 🔄 Décima Etapa: Recarregar

1. Clique no botão verde **Reload** (topo da página)
2. Aguarde 10 segundos

## 5️⃣ Como Testar Depois de Deploy

### Teste Básico:
```bash
# Abra no navegador:
https://SEU_USERNAME.pythonanywhere.com
```

Você deve ver a página de **Login**.

### Testar Funcionalidades:
1. Registre um usuário novo
2. Crie uma lista
3. Adicione produtos
4. Verifique se funciona

### Se Algo Quebrar:

**Verifique o erro log:**
```bash
# No Bash Console do PythonAnywhere:
tail -f /var/log/SEU_USERNAME.pythonanywhere.com.error.log
```

## 6️⃣ Como Atualizar Código Futuramente

**Depois de fazer push no GitHub:**

```bash
# No Bash Console do PythonAnywhere:
cd ~/a-feira
git pull origin main

# Se mudou requirements.txt:
source ~/.virtualenvs/a-feira-env/bin/activate
pip install -r backend/requirements.txt
```

**No painel**: Clique **Reload**

## 7️⃣ Estrutura de Arquivos Esperada

```
/home/SEU_USERNAME/
└── a-feira/
    ├── backend/
    │   ├── app.py          ← Aplicação principal
    │   ├── models.py       ← Modelos do banco
    │   ├── requirements.txt
    │   └── __pycache__/
    ├── frontend/           ← Será servido como estático
    │   ├── index.html
    │   ├── login.html
    │   └── app.js
    ├── data/               ← Banco de dados (criado automaticamente)
    │   └── feira.db
    ├── .git/               ← Seu repositório
    └── wsgi_example.py     ← Exemplo do WSGI
```

## ⚠️ Observações Importantes

1. **Banco de Dados**: SQLite funciona perfeitamente em PythonAnywhere (versão gratuita)
2. **Arquivos**: Limite de upload é 100MB (seu projeto é menor)
3. **Domínio**: Você terá `username.pythonanywhere.com`
4. **HTTPS**: Automático no PythonAnywhere
5. **Limite de CPU**: Versão gratuita tem limite (suficiente para teste)

## ✅ Checklist Antes de Deploy

- [ ] Repositório GitHub atualizado com `git push`
- [ ] `requirements.txt` contém todas as dependências
- [ ] `.gitignore` protege arquivos sensíveis
- [ ] Testou localmente com `python backend/app.py`
- [ ] Conta PythonAnywhere criada
- [ ] Bash Console do PythonAnywhere acessível

---

**🎉 Pronto para começar o deploy?**

Avise quando chegar em cada etapa que eu ajudo com dúvidas específicas!

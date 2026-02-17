# Deployment Guide - A Feira

## Local Development

### 1. Clonar e Entrar no Diretório
```bash
cd /home/multilucas/Projetos/a-feira
```

### 2. Criar Virtual Environment (já existe)
```bash
python3 -m venv backend/venv
```

### 3. Ativar Virtual Environment
```bash
# Linux/Mac
source backend/venv/bin/activate

# Windows
backend\venv\Scripts\activate
```

### 4. Instalar Dependências
```bash
pip install -r backend/requirements.txt
```

### 5. Iniciar Servidor
```bash
cd backend
python app.py
```

Servidor estará em: **http://localhost:5000**

---

## Production Deployment (PythonAnywhere)

### 1. Upload do Código

```bash
# Via Git
git clone https://github.com/seu-usuario/a-feira.git /home/username/a-feira

# Ou via upload manual
# Coloque os arquivos em /home/username/a-feira/
```

### 2. Criar Virtual Environment

No console do PythonAnywhere:
```bash
cd /home/username/a-feira
mkvirtualenv a-feira --python=/usr/bin/python3.10
pip install -r backend/requirements.txt
```

### 3. Configurar WSGI

No PythonAnywhere → Web → Add a new web app:

1. **Select framework**: Python
2. **Select Python version**: 3.10
3. **WSGI configuration file**: Use este conteúdo:

```python
# /var/www/username_pythonanywhere_com_wsgi.py

import sys
path = '/home/username/a-feira'
if path not in sys.path:
    sys.path.append(path)

os.environ['SECRET_KEY'] = 'sua-chave-secreta-muito-longa-e-aleatoria'

from backend.app import app
application = app
```

### 4. Configurar SECRET_KEY

**IMPORTANTE**: Não use `dev-secret-key` em produção!

No PythonAnywhere, defina variável de ambiente:
```bash
export SECRET_KEY="chave-secreta-aleatoria-muito-longa"
```

Gerar chave segura:
```bash
python3 -c "import os; print(os.urandom(24).hex())"
```

### 5. Configurar Arquivo Estático

No PythonAnywhere → Web:
- **Static files**: `/static/` → `/home/username/a-feira/frontend/`

### 6. Recarregar Web App

No PythonAnywhere → Web → Reload app

### 7. Acessar Aplicação

```
https://username.pythonanywhere.com
```

---

## Produção com Gunicorn (VPS)

### 1. Instalar Gunicorn

```bash
pip install gunicorn
```

### 2. Rodar com Gunicorn

```bash
cd /home/username/a-feira/backend
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### 3. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 4. Systemd Service (Auto-start)

```ini
# /etc/systemd/system/a-feira.service
[Unit]
Description=A Feira Shopping List App
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/home/username/a-feira/backend
ExecStart=/home/username/a-feira/backend/venv/bin/gunicorn -w 4 -b 0.0.0.0:8000 app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable a-feira
sudo systemctl start a-feira
sudo systemctl status a-feira
```

---

## Database

### SQLite (Default - Development)

```
data/feira.db  # Auto-criado na primeira execução
```

Backup:
```bash
cp data/feira.db data/feira.db.backup
```

### Migrar para PostgreSQL (Opcional)

Se quiser escalar para PostgreSQL:

1. **Instalar psycopg2**:
```bash
pip install psycopg2-binary
```

2. **Mudar CONNECTION STRING** em `app.py`:
```python
# De:
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{BASE_DIR / "data" / "feira.db"}'

# Para:
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/a_feira'
```

3. **Criar database no PostgreSQL**:
```sql
CREATE DATABASE a_feira;
```

4. **Executar app** (tables criadas automaticamente):
```bash
python app.py
```

---

## Monitoramento

### Logs (PythonAnywhere)
- Error log: `/var/log/username_pythonanywhere_com.error.log`
- Access log: `/var/log/username_pythonanywhere_com.access.log`

### Logs (VPS com Systemd)
```bash
sudo journalctl -u a-feira -f
```

### Database Check
```bash
cd /home/username/a-feira
python3 -c "from backend.models import db, User; print(f'Users: {User.query.count()}')"
```

---

## Troubleshooting

### Erro: "No module named 'flask_sqlalchemy'"

**Solução**: Ativar venv
```bash
source venv/bin/activate
```

### Erro: "Port 5000 already in use"

**Solução**: Matar processo anterior ou usar porta diferente
```bash
lsof -i :5000
kill -9 <PID>

# Ou usar porta diferente
python app.py --port 5001
```

### Erro: "Database is locked"

**Solução**: Fechar todas conexões e reiniciar
```bash
# Aguarde alguns segundos
# SQLite é single-writer, se houver erro pode ficar locked
rm data/feira.db  # Se quiser resetar
```

### Erro: "SECRET_KEY not set"

**Solução**: Definir SECRET_KEY
```bash
export SECRET_KEY="sua-chave-aleatoria"
python app.py
```

---

## Backup

### Backup Manual

```bash
# Backup database
cp data/feira.db /backup/feira_$(date +%Y%m%d_%H%M%S).db

# Backup código
tar -czf a-feira_$(date +%Y%m%d).tar.gz /home/username/a-feira/
```

### Backup Automático (Cron)

```bash
# Adicionar ao crontab (daily backup)
0 2 * * * cp /home/username/a-feira/data/feira.db /backup/feira_$(date +\%Y\%m\%d).db
```

---

## SSL/HTTPS (PythonAnywhere)

PythonAnywhere fornece HTTPS grátis:
1. Web → Add a new web app
2. Force HTTPS em settings

---

## Performance Tips

1. **Usar PostgreSQL** em produção (melhor que SQLite para múltiplos users)
2. **Adicionar índices** em user_id:
```python
class Product(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), index=True)
```

3. **Usar Gunicorn** com 4 workers:
```bash
gunicorn -w 4 app:app
```

4. **Adicionar cache** para produtos:
```python
@app.cache.cached(timeout=300)
def list_produtos():
    ...
```

5. **Comprimir responses**:
```bash
pip install flask-compress
```

---

## Segurança em Produção

- ✅ Use SECRET_KEY forte (64 chars aleatória)
- ✅ Enable HTTPS (Let's Encrypt grátis)
- ✅ Não expose debug logs
- ✅ Update Flask/dependências regularmente
- ✅ Configure firewalls
- ✅ Backup regular do database
- ✅ Monitor para brute force (rate limiting)

---

## Checklist Pré-Deployment

- [ ] Requirements.txt atualizado
- [ ] SECRET_KEY configurado como env var
- [ ] Database criado e testado
- [ ] WSGI apontando para app.py correto
- [ ] Static files servindo (frontend/)
- [ ] SSL/HTTPS ativado
- [ ] Backup automático configurado
- [ ] Logs configurados e monitorados
- [ ] Testes manuais em produção
- [ ] Email para recovery (opcional)

---

## Contato & Suporte

Documentação:
- [AUTHENTICATION.md](docs/AUTHENTICATION.md) - Auth system
- [STATUS.md](STATUS.md) - Project status
- [TESTING.md](TESTING.md) - Testing guide
- [README.md](README.md) - Project overview

---

**Última atualização**: 17/02/2026  
**Versão**: 1.1.0

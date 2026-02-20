# 🚀 Checklist Rápido - Deploy PythonAnywhere

## Antes de Começar

### ✅ Seu Projeto Local
- [x] Repositório Git funcionando
- [x] `requirements.txt` completo  
- [x] `.gitignore` configurado
- [x] Código testado localmente
- [x] Último push para GitHub feito

```bash
# Rode antes de fazer push:
cd ~/Projetos/a-feira
git status          # Verifique arquivos
git add .
git commit -m "Pronto para PythonAnywhere"
git push origin main
```

---

## Na PythonAnywhere

### Passo 1: Preparação (5 min)
```bash
[ ] 1. Clique em "Bash Console" no painel
[ ] 2. Execute:
       cd ~
       git clone https://github.com/SEU_USUARIO/a-feira.git
       cd a-feira
       ls -la
```

### Passo 2: Virtualenv (3 min)
```bash
[ ] 3. Execute:
       mkvirtualenv --python=/usr/bin/python3.13 a-feira-env
       pip install --upgrade pip
       pip install -r backend/requirements.txt
       
[ ] 4. Verifique:
       python -c "from backend.app import app; print('✓ OK')"
```

### Passo 3: Criar Web App (2 min)
```bash
[ ] 5. No painel PythonAnywhere:
       - Clique em "Web"
       - Clique em "Add a new web app"
       - Escolha "Manual configuration"
       - Selecione "Python 3.13"
       - Clique "Next"
```

### Passo 4: Configurar WSGI (5 min)
```bash
[ ] 6. No painel, clique no arquivo WSGI gerado
[ ] 7. Apague TUDO e copie (substituindo USERNAME):
```

```python
import sys
import os
from datetime import timedelta

project_dir = '/home/USERNAME/a-feira'
sys.path.insert(0, project_dir)

activate_this = '/home/USERNAME/.virtualenvs/a-feira-env/bin/activate_this.py'
with open(activate_this) as f:
    code = compile(f.read(), activate_this, 'exec')
    exec(code, {'__file__': activate_this})

os.environ['SECRET_KEY'] = 'GERE_CHAVE_AQUI'
os.environ['FLASK_ENV'] = 'production'

data_dir = os.path.join(project_dir, 'data')
os.makedirs(data_dir, exist_ok=True)

from backend.app import app
application = app

application.config.update(
    SQLALCHEMY_DATABASE_URI=f'sqlite:///{data_dir}/feira.db',
    SESSION_COOKIE_SECURE=True,
    DEBUG=False
)
```

### Passo 5: Gerar Chave Secreta (1 min)
```bash
[ ] 8. No Bash Console:
       python3 -c "import secrets; print(secrets.token_hex(32))"
[ ] 9. Copie o resultado
[ ] 10. Cole em 'GERE_CHAVE_AQUI' do arquivo WSGI
[ ] 11. Salve o arquivo WSGI (Ctrl+S ou botão)
```

### Passo 6: Configurações Web (3 min)
```bash
[ ] 12. Na aba "Web":
        - Virtualenv: /home/USERNAME/.virtualenvs/a-feira-env
        (Digite o caminho completo e clique em "Check")
        
[ ] 13. Desça até "Static files"
        - URL: /
        - Directory: /home/USERNAME/a-feira/frontend
        - Clique "Add"
        
[ ] 14. Clique em "Save" se houver botão
```

### Passo 7: Recarregar (1 min)
```bash
[ ] 15. Clique no botão verde "Reload" no topo
[ ] 16. Aguarde a página ser recarregada
```

### Passo 8: Testar (2 min)
```bash
[ ] 17. Abra no navegador:
        https://USERNAME.pythonanywhere.com
        
[ ] 18. Você deve ver a página de LOGIN
        
[ ] 19. Registre um novo usuário
[ ] 20. Teste criar uma lista
```

---

## Se Algo Quebrar

### Log de Erro
```bash
# No Bash Console:
tail -f /var/log/USERNAME.pythonanywhere.com.error.log

# Ou no arquivo WSGI, na seção de comentários, veja:
# AssertionError, ImportError, etc.
```

### Problemas Comuns

**Erro: "ModuleNotFoundError: No module named 'flask'"**
- ❌ Virtualenv não está configurado
- ✅ Solução: Verifique o caminho do virtualenv na aba Web

**Erro: "Permission denied" para banco de dados**
- ❌ Diretório `data/` sem permissão
- ✅ Solução: No Bash Console:
  ```bash
  mkdir -p ~/a-feira/data
  chmod 755 ~/a-feira/data
  ```

**Erro 500 após reload**
- ❌ Arquivo WSGI com erro
- ✅ Solução: Verifique o error.log
- ✅ Verifique USERNAME no WSGI
- ✅ Verifique SECRET_KEY

**Aplicação carrega mas não funciona**
- ❌ Pode ser erro de importação
- ✅ Solução: No Bash:
  ```bash
  cd ~/a-feira
  python backend/app.py
  ```
  (Deve funcionar sem erros)

---

## Após Deploy Funcionar ✅

### Fazer Atualizações
```bash
# Na sua máquina local:
git add .
git commit -m "Novas mudanças"
git push origin main

# No PythonAnywhere Bash Console:
cd ~/a-feira
git pull origin main

# Se mudou requirements.txt:
source ~/.virtualenvs/a-feira-env/bin/activate
pip install -r backend/requirements.txt

# No painel: Clique em "Reload"
```

### Monitorar Logs
```bash
# Acesso:
tail -f /var/log/USERNAME.pythonanywhere.com.access.log

# Erros:
tail -f /var/log/USERNAME.pythonanywhere.com.error.log
```

---

## ⏱️ Tempo Total Estimado
- Preparação local: 5 min
- Configuração PythonAnywhere: 20 min
- Testes: 5 min
- **Total: ~30 minutos**

---

## 📞 Dúvidas Comuns

**P: Onde meu domínio será?**
A: `https://seuusername.pythonanywhere.com`

**P: Posso usar um domínio customizado?**
A: Sim, mas é pago (não disponível na versão gratuita)

**P: E se o banco de dados ficar grande?**
A: Na versão gratuita tem limite. Para produção, considere versão paga.

**P: Como fazer backup do banco?**
A: Download pelo Bash Console:
```bash
cp ~/a-feira/data/feira.db ~/feira.db.backup
```

**P: Preciso deixar rodando 24/7?**
A: Na versão gratuita, aplicação dorme após inatividade. Para sempre rodando, precisa de versão paga.

---

## ✨ Pronto!

Siga este checklist em ordem e sua app estará online em ~30 minutos.

**Boa sorte! 🚀**

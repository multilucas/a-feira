# ⚡ Respostas Rápidas - Deploy PythonAnywhere

## 1. Python 3.14.3 vs 3.13 - Pode usar 3.13?

✅ **SIM, totalmente compatível!**

- Diferença é mínima (patches)
- Todas as dependências suportam 3.13
- **Zero alterações** no código necessárias
- Recomendado usar 3.13 do PythonAnywhere

---

## 2. Preciso alterar algo no projeto?

✅ **NÃO, está 100% pronto!**

Seu projeto já possui:
- ✅ `requirements.txt` completo
- ✅ Estrutura Flask correta
- ✅ Banco SQLite (funciona perfeitamente)
- ✅ Frontend estático organizado
- ✅ Variáveis de ambiente configuradas

**Nenhuma mudança necessária no código.**

---

## 3. Usar Git do GitHub é bom para deploy?

✅ **SIM, é a melhor prática!**

**Por quê:**
- `git clone` no PythonAnywhere em 30 segundos
- `git pull` para atualizar sempre que fizer push
- Histórico e fácil rollback
- Não precisa mandar arquivos zip

**Comando simples:**
```bash
cd ~
git clone https://github.com/SEU_USUARIO/a-feira.git
```

---

## 4. Qual é o próximo passo?

### 📋 Ordem Recomendada:

**1. Local (Sua máquina) - 5 min:**
```bash
cd ~/Projetos/a-feira
git status          # Verifique tudo
git add .
git commit -m "Pronto para PythonAnywhere"
git push origin main
```

**2. PythonAnywhere - 25 min:**
1. Crie conta em https://www.pythonanywhere.com
2. Abra **Bash Console**
3. Clone repositório:
   ```bash
   cd ~
   git clone https://github.com/SEU_USUARIO/a-feira.git
   cd a-feira
   ```
4. Crie virtualenv:
   ```bash
   mkvirtualenv --python=/usr/bin/python3.13 a-feira-env
   pip install -r backend/requirements.txt
   ```
5. Configure web app manual (Python 3.13)
6. Edite arquivo WSGI (copie template do `wsgi_example.py`)
7. Configure arquivos estáticos (URL: `/` → Directory: `/home/USERNAME/a-feira/frontend`)
8. Clique **Reload**

**3. Teste - 2 min:**
Visite `https://seuusername.pythonanywhere.com`

---

## 5. E se der erro?

### Passos para Debugar:

**Passo 1: Verificar Logs**
```bash
# No PythonAnywhere Bash Console:
tail -f /var/log/SEU_USERNAME.pythonanywhere.com.error.log
```

**Passo 2: Testar Importação**
```bash
cd ~/a-feira
source ~/.virtualenvs/a-feira-env/bin/activate
python -c "from backend.app import app; print('✓ OK')"
```

**Passo 3: Verificar WSGI**
- USERNAME correto?
- Caminho virtualenv correto?
- Sintaxe Python correta? (sem erros de indentação)

**Passo 4: Recarregar**
Clique verde **Reload** no painel

---

## 6. Depois que der certo, como atualizo?

```bash
# Na sua máquina local:
git add .
git commit -m "Atualizações"
git push origin main

# No PythonAnywhere Bash Console:
cd ~/a-feira
git pull origin main

# Se mudou requirements.txt:
source ~/.virtualenvs/a-feira-env/bin/activate
pip install -r backend/requirements.txt

# No painel: Clique Reload
```

---

## 7. Checklist Antes de Começar

- [ ] Último `git push` feito
- [ ] Conta PythonAnywhere criada
- [ ] GitHub repo é público (ou você tem acesso)
- [ ] Leu `PYTHONANYWHERE_DEPLOYMENT.md`
- [ ] Tem `wsgi_example.py` como referência

---

## 8. Arquivos de Referência

📄 **Documentação Completa:**
- `PYTHONANYWHERE_DEPLOYMENT.md` - Guia passo a passo
- `PYTHONANYWHERE_FAQ.md` - FAQ completo
- `PYTHONANYWHERE_CHECKLIST.md` - Checklist interativo
- `wsgi_example.py` - Template WSGI

---

## 🎯 Resumo em 3 Linhas

1. **Seu projeto está 100% pronto** - sem alterações necessárias
2. **Use Python 3.13** do PythonAnywhere - compatível 100%
3. **Deploy em 30 min** - seguindo o checklist

---

## 📞 Dúvidas Frequentes Rápidas

**P: Quanto custa?**
A: Grátis (versão gratuita do PythonAnywhere)

**P: Posso usar meu próprio domínio?**
A: Sim, mas é pago (não necessário inicialmente)

**P: Banco de dados é seguro?**
A: Sim, SQLite funciona bem. Em produção grande, considere PostgreSQL

**P: Quantos usuários suporta?**
A: Versão gratuita = limite de CPU (ok para testes)

**P: Como fazer backup?**
A: `cp ~/a-feira/data/feira.db ~/feira.db.backup` no Bash

**P: Pode rodar 24/7?**
A: Versão gratuita dorme após inatividade. Pago = 24/7

---

## ✨ Próximo Passo?

**Crie sua conta no PythonAnywhere agora:**
https://www.pythonanywhere.com/accounts/signup/free/

Depois vem falar comigo quando chegar no passo de clonar o repositório! 🚀

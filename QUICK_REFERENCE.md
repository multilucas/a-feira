# 🎯 A Feira - Quick Reference Card

## ⚡ Iniciar Rápido (3 passos)

```bash
# 1. Ir ao diretório
cd /home/multilucas/Projetos/a-feira

# 2. Executar script
bash run.sh

# 3. Acessar
# Abra: http://localhost:5000
```

---

## 📱 Acessar de Outro Dispositivo

```
http://192.168.0.205:5000  # Substitua IP por seu
```

---

## 👤 Registrar Novo Usuário

1. Clique em **"Registrar"** tab
2. Digite email e senha (min 6 caracteres)
3. Clique **"Criar Conta"**
4. Pronto! Está logado

---

## 🛒 Usar Aplicação

### Criar Produto
1. Aba **"Produtos"**
2. Clique **"+ Novo Produto"**
3. Preencha informações
4. Clique **"Salvar"**

### Criar Lista
1. Aba **"Listas"**
2. Clique **"+ Nova Lista"**
3. Digite nome
4. Clique **"Criar"**

### Adicionar Item à Lista
1. Clique em lista (aba Listas)
2. Clique **"+ Adicionar Item"**
3. Busque ou crie produto
4. Digite quantidade
5. Clique **"Adicionar"**

### Toggle Item
- Clique ✓ checkbox para marcar/desmarcar
- Total do carrinho atualiza automático

### Deletar Produto
1. Aba **"Produtos"**
2. Clique **"🗑️ Deletar"** no produto

---

## 🌙 Trocar Tema

Clique no ícone no header: **🌙 ou ☀️**

Tema é salvo e persiste entre logout/login!

---

## 🚪 Logout

Clique botão **"Sair"** no header superior

---

## 📊 Totais Automáticos

- **Total da Lista**: Soma todos items
- **Total do Carrinho**: Soma items marcados com ✓

Atualiza em tempo real!

---

## 🔐 Segurança

✅ Senhas são criptografadas (PBKDF2)  
✅ Cada usuário só vê seus dados  
✅ Sessão expira em 30 dias  
✅ Logout limpa sessão completamente  

---

## 📁 Arquivos Importantes

```
a-feira/
├── backend/
│   ├── app.py          ← Servidor Flask
│   ├── models.py       ← Banco de dados
│   ├── venv/           ← Dependências Python
│   └── requirements.txt ← Pacotes necessários
├── frontend/
│   ├── index.html      ← App principal
│   ├── login.html      ← Login/Registro
│   └── app.js          ← Lógica JavaScript
├── data/
│   └── feira.db        ← Banco SQLite
├── docs/               ← Documentação
├── run.sh              ← Script iniciar servidor
└── README.md           ← Instruções
```

---

## 🛠️ Troubleshooting

### Servidor não inicia

```bash
# Verifique se porta 5000 está livre
lsof -i :5000

# Se ocupada, mate o processo
kill -9 <PID>

# Ou use outra porta (no app.py)
```

### Esqueceu a senha

Infelizmente não há reset por email ainda. Opções:

1. Criar novo usuário com email diferente
2. Deletar banco (data/feira.db) e recomeçar

### Tema não persiste

Deve estar logado! Tema é salvo por usuário no banco de dados.

### Dados não aparecem

1. Verifique se está logado
2. Cada usuário vê apenas seus dados
3. Tente criar novo produto

---

## 📚 Documentação

- **AUTHENTICATION.md** - Como auth funciona
- **STATUS.md** - Status completo
- **TESTING.md** - Como testar
- **DEPLOYMENT.md** - Como fazer deploy
- **IMPLEMENTATION_REPORT.md** - Detalhes técnicos
- **SUMMARY_v1.1.0.md** - Resumo executivo

---

## 🔗 Links Úteis

| Link | Descrição |
|------|-----------|
| http://localhost:5000 | App local |
| http://192.168.0.205:5000 | App via IP (mobile) |
| F12 | Developer tools |
| data/feira.db | Database |
| backend/app.py | Backend code |
| frontend/app.js | Frontend code |

---

## ✨ Dicas

1. **Tema em português**: Clique 🌙 para dark, ☀️ para light
2. **Quantidade flexível**: Use 0.5 para meio kg, 1.5 para 1,5L, etc.
3. **Categorias**: Use Laticínios, Padaria, Alimentos, Limpeza, etc.
4. **Busca rápida**: Ao adicionar item, comece digitando nome do produto
5. **Editar quantidade**: Direto no item da lista (sem reabrir modal)

---

## 🎓 Conceitos

- **User** = Usuário registrado
- **Produto** = Item que pode ser comprado
- **Lista** = Collection de itens a comprar
- **Item** = Produto na lista (com quantidade + checked)
- **Total da Lista** = Todos itens
- **Total do Carrinho** = Itens marcados com ✓

---

## 🚀 Próximos Passos (Opcional)

- [ ] Adicionar imagens de produtos
- [ ] Histórico de compras
- [ ] Compartilhar lista com outros usuários
- [ ] Mobile app nativo (React Native)
- [ ] Integração com supermercado (preços, disponibilidade)
- [ ] Recipe suggestions baseado na lista

---

## 📞 Suporte Rápido

**Problema**: Servidor não inicia
**Solução**: `bash run.sh` deve funcionar

**Problema**: Esqueceu senha
**Solução**: Crie novo usuário ou delete database

**Problema**: Tema não salva
**Solução**: Faça logout/login para sincronizar

---

**Última atualização**: 17/02/2026  
**Versão**: 1.1.0  
**Status**: ✅ Pronto para usar!

Aproveite! 🎉

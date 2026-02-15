# ❓ FAQ - Perguntas Frequentes

## 🚀 Setup e Execução

### P: Como rodar a aplicação?
**R:** Execute na pasta do projeto:
```bash
bash start.sh
```
Ou manualmente:
```bash
cd backend
pip install -r requirements.txt
python app.py
```
Depois abra `http://localhost:5000`

### P: Qual Python é necessário?
**R:** Python 3.8+. Verifique com:
```bash
python --version
```

### P: Preciso instalar npm ou node?
**R:** Não! Frontend é vanilla JavaScript sem dependências.

### P: A aplicação funciona offline?
**R:** Sim, totalmente. Os dados ficam no arquivo JSON local.

---

## 📦 Dados e Armazenamento

### P: Onde os dados são salvos?
**R:** Em arquivos JSON na pasta `data/`:
- `data/produtos.json` - Armazena todos os produtos
- `data/listas.json` - Armazena todas as listas

### P: Como faço backup dos dados?
**R:** Copie a pasta `data/`:
```bash
cp -r data/ data_backup_YYYYMMDD/
```

### P: Como limpar todos os dados?
**R:** Delete os arquivos JSON (ou renomeie a pasta `data/`):
```bash
rm data/produtos.json data/listas.json
```
Os arquivos serão recriados quando usar a app novamente.

### P: Os dados são criptografados?
**R:** Não nesta versão (MVP). Futuro: adicionar segurança conforme necessário.

### P: Posso editar o JSON diretamente?
**R:** Sim, mas tome cuidado com a formatação. Use editor que mantenha JSON válido.

---

## 🎨 Interface e Temas

### P: Como trocar de tema?
**R:** Clique no ícone 🌙/☀️ no canto superior direito do header.

### P: O tema é salvo?
**R:** Sim, em `localStorage` do navegador. Permanece após fechar o navegador.

### P: Quais navegadores são suportados?
**R:** Chrome, Firefox, Safari, Edge (todos modernos com suporte a ES6+).

### P: Como customizar cores?
**R:** Edite `frontend/index.html`. As cores Tailwind padrão usam `indigo` para primária, altere para `blue`, `purple`, etc.

---

## 📋 Produtos e Listas

### P: Posso ter dois produtos com o mesmo nome?
**R:** Sim, mas não é recomendado. Considere adicionar unidade ou marca ao nome.

### P: Como editar um produto existente?
**R:** Atualmente, delete e recrie. Feature de edição está no roadmap.

### P: Posso duplicar uma lista?
**R:** Não no MVP. Está no roadmap de curto prazo.

### P: Uma lista pode ter ilimitados itens?
**R:** Sim, sem limite. Considere usar múltiplas listas para organização.

### P: O que acontece se deletar um produto que está em uma lista?
**R:** O item desaparece da lista (referência quebrada). Cuidado ao deletar!

---

## 💰 Cálculos e Totais

### P: Como é calculado o "Total da Lista"?
**R:** Soma de TODOS os itens, independente de checkbox:
```
Total = Σ (preco_unidade × quantidade)
```

### P: E o "Total do Carrinho"?
**R:** Soma apenas dos itens com checkbox marcado:
```
Total Carrinho = Σ (preco × qtd) onde checkbox = true
```

### P: Os valores são precisos?
**R:** Sim, usam floating-point (2 casas decimais). Suficiente para valores em reais.

### P: Há limite de precisão?
**R:** Cantidad: até 2 casas decimais. Preço: até 2 casas decimais. Valores bem grandes (>1M) podem ter pequenas imprecisões.

### P: Posso ter quantidade 0?
**R:** Não, campo exige mínimo 0.01.

---

## 🔌 API e Backend

### P: Qual é o endpoint base da API?
**R:** `http://localhost:5000/api/`

### P: Preciso de autenticação para usar a API?
**R:** Não nesta versão. Futuro: adicionar quando necessário.

### P: Posso chamar a API de fora?
**R:** Sim, CORS está habilitado. Você pode fazer requisições de qualquer origem.

### P: Posso usar a API em produção como está?
**R:** Não recomendado. Adicione autenticação antes.

### P: Como testar os endpoints?
**R:** Use curl:
```bash
curl http://localhost:5000/api/produtos
curl -X POST http://localhost:5000/api/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maçã","categoria":"Frutas","quantidade":1,"unidade":"kg","preco_unidade":4.5}'
```

---

## 🚀 Deployment

### P: Como colocar em produção?
**R:** A estrutura é PythonAnywhere-ready. Você vai precisar:
1. Criar conta em PythonAnywhere
2. Upload do código
3. Configurar web app (apontar para `backend/app.py`)
4. Domínio público (ex: seu-usuario.pythonanywhere.com)

### P: Preciso de banco de dados para produção?
**R:** JSON é suficiente para poucos usuários. Se crescer, migre para PostgreSQL.

### P: Os dados na produção serão perdidos?
**R:** PythonAnywhere mantém os arquivos. Faça backup regularmente.

### P: Posso usar em múltiplos usuários?
**R:** No MVP, não (sem autenticação). Próxima iteração: adicionar login e dados por usuário.

---

## 🛠️ Desenvolvimento

### P: Como adicionar uma nova feature?
**R:** 
1. Adicione função em `backend/database.py`
2. Adicione rota em `backend/app.py`
3. Adicione UI em `frontend/index.html`
4. Adicione lógica em `frontend/app.js`
5. Documente em `docs/feature-X-*.md`

### P: Posso usar frameworks (React, Vue, etc)?
**R:** Sim, mas não recomendado para este projeto (prioriza simplicidade).

### P: Como adicionar autenticação?
**R:** Crie função em `app.py` para gerar tokens JWT. Valide em cada request. Complexo mas viável.

### P: Como usar banco de dados?
**R:** Troque `database.py` para usar SQLAlchemy (substitua `_load_json`/`_save_json` por queries BD).

### P: Preciso refatorar o código?
**R:** Código está bem organizado. Se crescer muito, considere dividir `app.py` em blueprints.

---

## 🐛 Bugs e Problemas

### P: A aplicação não abre
**R:** 
- Verifique se backend está rodando (`python app.py` em outro terminal)
- Tente outro navegador
- Limpe cache (Ctrl+Shift+Delete)

### P: Dados desaparecem
**R:** 
- Verifique se pasta `data/` existe
- Verifique permissões de escrita
- Não delete arquivos `.json` acidentalmente

### P: Botões não funcionam
**R:** Abra console (F12 → Console) e procure por erros. Reporte se encontrar bugs.

### P: Tema não muda
**R:** Seu navegador pode estar com localStorage desabilitado. Ative em configurações.

---

## 📚 Documentação

### P: Onde ler sobre cada feature?
**R:** Confira `docs/`:
- `feature-1-cadastro-produtos.md`
- `feature-2-cadastro-listas.md`
- `feature-3-comportamento-lista.md`

### P: Como entender a arquitetura?
**R:** Leia `docs/ARCHITECTURE.md` para visão completa.

### P: Qual é o fluxo de dados?
**R:** Frontend → API Flask → database.py → arquivo JSON

---

## 🎓 Aprendizado

### P: Por que não usar um banco de dados?
**R:** MVP visa simplicidade. JSON é suficiente para protótipo. Migração futura é fácil.

### P: Por que Vanilla JS e não React?
**R:** Zero dependências = deploy imediato. Para MVP, simplicidade > complexidade.

### P: Por que Tailwind CDN e não CSS customizado?
**R:** Sem build step = desenvolvimento mais rápido. Tailwind é poderoso o suficiente.

### P: É bom usar esta arquitetura em produção?
**R:** Para poucos usuários (< 1000/mês): sim. Acima disso, considere escalar (BD, cache, etc).

---

## 🤝 Contribuindo

### P: Posso contribuir com melhorias?
**R:** Sim! Fluxo sugerido:
1. Faça mudanças em uma branch
2. Teste bem
3. Documente em .md
4. Submit PR com explicação

### P: Qual é a visão futura do projeto?
**R:** Ver `CHECKLIST.md` → "Próximos passos recomendados"

---

## 💡 Dicas Gerais

### Dica 1: Organize listas por semana
Crie uma lista por semana (ex: "Compras Semana 1 Fev") para histórico.

### Dica 2: Use descrição do produto
Adicione marca, tamanho, etc na descrição para diferenciar produtos.

### Dica 3: Revise preços
Os preços em `data/produtos.json` são seus. Atualize conforme precisa.

### Dica 4: Exporte dados
Faça backup regularmente da pasta `data/`.

### Dica 5: Teste em mobile
Abra em celular para experiência completa (interface é mobile-first).

---

**Ainda tem dúvida? Confira CHECKLIST.md ou TESTES_MANUAIS.md!**

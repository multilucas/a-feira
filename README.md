# 🛒 A Feira - Gerenciador de Lista de Compras

Um gerenciador **simples, limpo e funcional** de listas de compras.

Desenvolvido com foco em mobile-first, MVP funcional e facilidade de manutenção.

**Stack:** Python 3 (Flask) + HTML5/Tailwind CSS + Vanilla JavaScript

## ✨ Features Implementadas

- ✅ **Cadastro de Produtos** - Nome, categoria, quantidade, unidade, preço
- ✅ **Cadastro de Listas de Compras** - Criar múltiplas listas
- ✅ **Adicionar Produtos à Lista** - Busca ou criação rápida inline
- ✅ **Cálculo Dinâmico** - Total da Lista + Total do Carrinho
- ✅ **Light/Dark Theme** - Toggle automático com localStorage
- ✅ **Interface Mobile-First** - 100% responsivo

## 📁 Estrutura do Projeto

```
a-feira/
├── backend/
│   ├── app.py              # Flask + rotas da API
│   ├── database.py         # Lógica de persistência (JSON)
│   └── requirements.txt    # Dependências
│
├── frontend/
│   ├── index.html          # Markup + Tailwind CDN
│   └── app.js              # Lógica da aplicação
│
├── data/
│   ├── produtos.json       # Armazenamento (criado automaticamente)
│   └── listas.json         # Armazenamento (criado automaticamente)
│
├── docs/
│   ├── feature-1-cadastro-produtos.md
│   ├── feature-2-cadastro-listas.md
│   ├── feature-3-comportamento-lista.md
│   └── ARCHITECTURE.md     # Guia técnico completo
│
└── README.md
```

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Python 3.8+
- Um navegador web

### Setup

```bash
# 1. Entrar na pasta do projeto
cd /home/multilucas/Projetos/a-feira

# 2. Instalar dependências (Backend)
cd backend
pip install -r requirements.txt

# 3. Iniciar servidor
python app.py
```

O servidor rodará em `http://localhost:5000`

**No navegador:** Abra [http://localhost:5000](http://localhost:5000)

### Parar o Servidor
Pressione `Ctrl + C` no terminal

## 📚 Documentação

Leia os guias técnicos na pasta `docs/`:

- [Feature 1: Cadastro de Produtos](docs/feature-1-cadastro-produtos.md)
- [Feature 2: Cadastro de Listas](docs/feature-2-cadastro-listas.md)
- [Feature 3: Comportamento e Cálculos](docs/feature-3-comportamento-lista.md)
- [Arquitetura Completa](docs/ARCHITECTURE.md)

## 💡 Principais Decisões

| Aspecto | Decisão | Motivo |
|--------|---------|--------|
| Persistência | JSON em arquivo | Simples, sem BD, PythonAnywhere-compatible |
| Frontend | Vanilla JS | Sem dependências, zero build, deploy imediato |
| Estilos | Tailwind CDN | Sem build step, atualizações automáticas |
| Validação | Básica | MVP, o suficiente para UX bem pensada |
| Autenticação | Não implementada | Futuro: adicionar quando necessário |

## 🎯 Fluxos Principais

### Criar Lista e Adicionar Produtos
1. Clica "Nova Lista"
2. Digita nome → Confirma
3. Abre lista, clica "Adicionar Item"
4. Busca produto OU cria novo na hora
5. Define quantidade → Confirma

### Ver Totais
- **Total da Lista**: Soma de todos os itens
- **Total do Carrinho**: Soma apenas dos itens marcados com ✓

Atualizados em tempo real ao marcar/desmarcar ou mudar quantidade.

### Alternar Tema
Clica no ícone 🌙/☀️ no header → Automático (usa localStorage)

## 🔌 API REST

Todos os endpoints em `http://localhost:5000/api/`

```
GET    /api/produtos              # Listar produtos
POST   /api/produtos              # Criar produto
DELETE /api/produtos/<id>         # Deletar produto

GET    /api/listas                # Listar listas
POST   /api/listas                # Criar lista
GET    /api/listas/<id>           # Detalhes da lista

POST   /api/listas/<id>/itens                    # Adicionar item
PUT    /api/listas/<id>/itens/<prod_id>/toggle  # Marcar/desmarcar
DELETE /api/listas/<id>/itens/<prod_id>         # Remover item
```

Para testes: Use o navegador DevTools ou curl.

## � Deploy

### Versão Rápida (PythonAnywhere - Recomendado)

A aplicação está **pronta para deploy** na versão gratuita do PythonAnywhere.

**Tempo total: ~30 minutos**

Veja guia completo em: [`PYTHONANYWHERE_DEPLOYMENT.md`](./PYTHONANYWHERE_DEPLOYMENT.md)

Checklist rápido em: [`PYTHONANYWHERE_CHECKLIST.md`](./PYTHONANYWHERE_CHECKLIST.md)

**Resumo dos passos:**
1. Crie conta em https://www.pythonanywhere.com
2. Clone o repositório via Git
3. Crie virtualenv com Python 3.13
4. Configure WSGI manual
5. Configure arquivos estáticos
6. Clique em Reload

**Resultado:** Sua app em `https://seuusername.pythonanywhere.com`

## �🛠️ Desenvolvimento

### Adicionar Nova Feature

1. **Backend**
   - Adicionar função em `database.py`
   - Adicionar rota em `app.py`

2. **Frontend**
   - Adicionar HTML em `index.html`
   - Adicionar JS em `app.js`

3. **Documentar**
   - Criar `docs/feature-X-*.md`
   - Atualizar `README.md`

### Debug

**Backend:** `print()` ou use debugger Python
**Frontend:** DevTools do navegador (F12)
**API:** Teste com curl

```bash
# Exemplo: Listar produtos
curl http://localhost:5000/api/produtos
```

## 📦 Deploy em PythonAnywhere

Estrutura já pronta para [PythonAnywhere](https://www.pythonanywhere.com):
- Flask sem dependências pesadas
- JSON storage (sem BD setup complexo)
- Frontend estático (HTML/JS/CSS)

**Próximos passos:**
1. Criar conta em PythonAnywhere
2. Upload do código
3. Configurar web app
4. Acessar via domínio público

## 🎨 Customização

### Cores
Tailwind usa cores padrão. Customizar em `index.html`:
- Primária: `indigo` (alterar para `blue`, `purple`, etc.)
- Sucess: `green`, Danger: `red`

### Logo/Branding
Editar title em `index.html` e header em `app.js`

### Categorias de Produtos
Editar as options dos selects em `index.html`

## ⚠️ Limitações (MVP)

- Sem autenticação de usuários
- Sem backup automático
- Sem histórico de compras
- Sem sincronização entre dispositivos
- Sem notificações

**Futuro:** Adicionar conforme necessidade

## 📄 Licença

Código próprio. Livre para usar e modificar.

## 🤝 Contribuições

Sugestões? Abra uma issue ou faça um PR.

---

**Desenvolvido com foco em simplicidade e clareza. 🎯**

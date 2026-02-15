# Guia de Arquitetura - A Feira

## 📁 Estrutura do Projeto

```
a-feira/
├── backend/
│   ├── app.py              # Flask app com todas as routes
│   ├── database.py         # Lógica de persistência (JSON)
│   └── requirements.txt    # Dependências Python
│
├── frontend/
│   ├── index.html          # HTML + Tailwind CDN
│   ├── app.js              # Lógica JavaScript (vanilla)
│   └── (sem CSS, usar Tailwind)
│
├── data/
│   ├── produtos.json       # Armazenamento de produtos
│   └── listas.json         # Armazenamento de listas
│
├── docs/
│   ├── feature-1-cadastro-produtos.md
│   ├── feature-2-cadastro-listas.md
│   ├── feature-3-comportamento-lista.md
│   └── ARCHITECTURE.md     # Este arquivo
│
└── README.md
```

## 🔄 Fluxo de Dados

```
[FRONTEND - Browser]
       ↓ HTTP
[BACKEND - Flask]
       ↓ Lê/Escreve
[DATA - JSON Files]
```

### Exemplo: Criar Produto
1. Usuário preenche formulário no frontend
2. JavaScript faz `POST /api/produtos`
3. Flask recebe, valida, chama `create_produto()`
4. `database.py` escreve em `data/produtos.json`
5. Flask retorna JSON com produto criado
6. JavaScript atualiza interface

## 🏗️ Componentes Principais

### Backend

#### `app.py`
- Inicializa Flask
- Define todas as rotas REST
- Trata erros e valida input
- Serve arquivos estáticos (frontend)
- ~200 linhas, bem organizado

#### `database.py`
- Funções puras (sem estado)
- Lê/escreve JSON
- Sem ORM, sem complexidade
- 7 funções para Produtos, 7 para Listas
- ~250 linhas

### Frontend

#### `index.html`
- Layout único com múltiplas "páginas" (divs)
- 3 modais (bottom-sheet)
- Tailwind CDN para estilos
- Estrutura semântica clara
- ~400 linhas

#### `app.js`
- Estado mínimo: `listaAtualId`, `produtosCache`
- Funções separadas por domínio (listas, produtos, itens)
- Sem frameworks, sem transpilação
- ~600 linhas
- Usa `async/await` para API

## 🎯 Princípios de Design

### 1. Simplicidade
- Sem banco de dados (JSON é suficiente)
- Sem frameworks frontend (vanilla JS)
- Sem build step (Tailwind CDN)
- Sem abstrações prematuras

### 2. Clareza
- Nomes de funções descritivos
- Separação clara entre camadas
- Documentação inline para lógica complexa
- Código legível > código inteligente

### 3. Funcionalidade
- MVP foca em 3 features principais
- UI mobile-first
- Tema claro/escuro
- Responsivo sem media queries complexas

### 4. Manutenibilidade
- Estrutura pronta para escalar
- JSON fácil de migrar para BD depois
- API RESTful padrão
- Código sem dependências ocultas

## 🔐 Segurança (MVP)

⚠️ **Sem autenticação nesta versão**

Para produção em PythonAnywhere:
- [ ] Adicionar autenticação básica
- [ ] Validar CORS origin
- [ ] Hash de senhas
- [ ] Rate limiting
- [ ] HTTPS obrigatório

Atualmente: CORS aberto para facilitar desenvolvimento

## 📊 Fluxo de Features

```
Feature 1: Cadastro Produtos
        ↓
Feature 2: Cadastro Listas (usa Produtos)
        ↓
Feature 3: Cálculos (usa Listas + Produtos)
```

Cada feature:
- Implementada em backend (database.py + routes)
- Implementada em frontend (UI + lógica JS)
- Documentada em .md próprio

## 🚀 Adicionando Nova Feature

1. **Backend**
   - Adicionar funções em `database.py`
   - Adicionar rotas em `app.py`
   - Testar com curl/Postman

2. **Frontend**
   - Adicionar HTML em `index.html`
   - Adicionar JS em `app.js`
   - Testar no navegador

3. **Documentação**
   - Criar `docs/feature-X-nome.md`
   - Explicar decisões técnicas
   - Incluir exemplos

4. **Atualizar**
   - `README.md` (adicionar feature)
   - `ARCHITECTURE.md` (se mudar estrutura)

## 📈 Escalabilidade

### De JSON para PostgreSQL
```python
# Atualmente: JSON
produtos = _load_json(PRODUTOS_FILE)

# Futuro: Banco de dados
produtos = db.session.query(Produto).all()
```

A camada de API não muda, apenas `database.py`.

### Adicionar Autenticação
```python
# No app.py
@app.route('/api/listas', methods=['GET'])
@require_login  # Novo decorator
def list_listas():
    user = get_current_user()
    return filter_listas_by_user(user)
```

### Adicionar Cache
```python
@app.route('/api/produtos', methods=['GET'])
@cache.cached(timeout=300)  # 5 minutos
def list_produtos():
    ...
```

## 🛠️ Desenvolvimento

### Setup Local
```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Frontend (em outro terminal)
# Abrir http://localhost:5000 no navegador
```

### Debug
- Backend: `print()` ou debugger
- Frontend: DevTools do navegador
- API: curl ou Postman

### Testes (Futuro)
```bash
# Backend
pytest backend/

# Frontend
npm test
```

## 📝 Padrões de Código

### Backend (Python)
```python
def create_produto(nome, categoria, ...):
    """Cria um novo produto - descrição clara"""
    # Validação
    if not nome:
        raise ValueError("Nome é obrigatório")
    
    # Lógica
    produto = {...}
    
    # Persistência
    _save_json(PRODUTOS_FILE, data)
    
    # Retorno
    return produto
```

### Frontend (JavaScript)
```javascript
async function createProduto(data) {
    // Validação
    if (!data.nome) {
        alert('Preencha o nome');
        return;
    }

    // Requisição
    try {
        const response = await fetch('/api/produtos', {...});
        
        // Sucesso
        if (response.ok) {
            closeAllModals();
            loadProdutos();
        }
    } catch (error) {
        // Erro
        console.error('Erro:', error);
        alert('Erro ao criar produto');
    }
}
```

## 🎨 Tailwind CSS Uso

Apenas classes de utility (nenhum CSS customizado):
- `bg-`, `text-`, `p-`, `m-`, `rounded-`, etc.
- Responsivo com `sm:`, `md:`, `lg:`, `xl:`
- Dark mode com `dark:` (classe no html)

Nenhum arquivo CSS customizado necessário.

## 📚 Referências Futuras

- **PythonAnywhere Deploy**: Usar estrutura Flask como está
- **Database Migration**: SQLAlchemy + Alembic
- **Frontend Framework**: Se necessário, considerar Svelte (leve)
- **Mobile App**: PWA ou Flutter

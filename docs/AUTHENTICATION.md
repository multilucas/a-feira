# Autenticação do A Feira

## Visão Geral

O A Feira implementa um sistema de autenticação baseado em sessões usando Flask. O sistema oferece:

- ✅ Registro de novos usuários com email/senha
- ✅ Login seguro com validação de credenciais
- ✅ Gerenciamento de sessões com expiração (30 dias)
- ✅ Logout com limpeza de sessão
- ✅ Per-user data isolation (cada usuário só vê seus dados)
- ✅ Per-user theme persistence (preferência de tema salva por usuário)
- ✅ Senhas criptografadas com Werkzeug

## Stack Técnico

### Backend (Python/Flask)

- **Flask 3.0.0**: Framework web
- **Flask-SQLAlchemy 3.1.1**: ORM para gerenciar banco de dados
- **Werkzeug 3.0.1**: Password hashing (generate_password_hash, check_password_hash)
- **SQLite**: Database (arquivo `data/feira.db`)
- **Flask Sessions**: Gerenciamento de sessão (HTTP-only cookies)

### Frontend (JavaScript/HTML)

- **Vanilla JavaScript**: Sem frameworks
- **Tailwind CSS**: Design responsive (mobile-first)
- **localStorage**: Temas locais (backup para sincronização rápida)

## Modelo de Dados

### User Model

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    theme = db.Column(db.String(10), default='light')  # 'light' ou 'dark'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    produtos = db.relationship('Product', backref='user', lazy=True)
    listas = db.relationship('ShoppingList', backref='user', lazy=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'theme': self.theme,
            'created_at': self.created_at.isoformat()
        }
```

### Product Model

Produtos agora estão associados a um usuário:

```python
class Product(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    quantidade = db.Column(db.Float)
    unidade = db.Column(db.String(20))
    preco_unidade = db.Column(db.Float, nullable=False)
    descricao = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

### ShoppingList Model

Listas também estão associadas a um usuário:

```python
class ShoppingList(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    itens = db.Column(db.JSON, default=list)  # [{ produto_id, quantidade, checked }]
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

## Endpoints de Autenticação

### POST `/api/auth/register`

Registra um novo usuário.

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Validações:**
- Email e senha são obrigatórios
- Senha mínimo 6 caracteres
- Email deve ser único (não pode registrar novamente)

**Response Success (201):**
```json
{
  "message": "Registro bem-sucedido",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "theme": "light",
    "created_at": "2024-02-17T12:15:30"
  }
}
```

**Response Error (400):**
```json
{
  "error": "Email já registrado"
}
```

### POST `/api/auth/login`

Autentica um usuário existente.

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "senha123"
}
```

**Response Success (200):**
```json
{
  "message": "Login bem-sucedido",
  "user": {
    "id": 1,
    "email": "usuario@example.com",
    "theme": "dark",
    "created_at": "2024-02-17T12:15:30"
  }
}
```

**Response Error (400/401):**
```json
{
  "error": "Email ou senha inválidos"
}
```

### GET `/api/auth/me`

Retorna informações do usuário logado. Requer autenticação.

**Response Success (200):**
```json
{
  "id": 1,
  "email": "usuario@example.com",
  "theme": "dark",
  "created_at": "2024-02-17T12:15:30"
}
```

**Response Erro (401):**
```json
{
  "error": "Não autorizado"
}
```

### POST `/api/auth/logout`

Realiza logout (limpa a sessão). Requer autenticação.

**Response Success (200):**
```json
{
  "message": "Logout realizado"
}
```

### PUT `/api/auth/theme`

Atualiza a preferência de tema do usuário. Requer autenticação.

**Request:**
```json
{
  "theme": "dark"
}
```

**Response Success (200):**
```json
{
  "message": "Tema atualizado",
  "theme": "dark"
}
```

## Fluxo de Autenticação no Frontend

### 1. Inicialização (app.js)

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    // Verifica se o usuário está autenticado
    const user = await checkAuth();
    if (!user) {
        // Redireciona para login se não autenticado
        window.location.href = '/login.html';
        return;
    }
    
    // Usuário autenticado, carrega a aplicação
    currentUser = user;
    initTheme();  // Carrega tema do banco de dados
    loadListas();
    loadProdutos();
    updateUserInfo();  // Mostra email do usuário
});
```

### 2. Verificação de Autenticação

```javascript
async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include'  // Envia cookies de sessão
        });
        if (response.ok) {
            return await response.json();
        }
        return null;  // Não autenticado
    } catch (error) {
        return null;
    }
}
```

### 3. Registro de Novo Usuário (login.html)

```javascript
document.getElementById('formRegister').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
        // Registro sucesso, redireciona para app
        window.location.href = '/';
    } else {
        const data = await response.json();
        // Mostra erro
        errorDiv.textContent = data.error;
    }
});
```

### 4. Login (login.html)

```javascript
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    });
    
    if (response.ok) {
        const data = await response.json();
        // Atualiza tema local
        localStorage.setItem('theme', data.user.theme);
        // Redireciona para app
        window.location.href = '/';
    } else {
        const data = await response.json();
        errorDiv.textContent = data.error;
    }
});
```

### 5. Logout

```javascript
async function logout() {
    await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    });
    // Redireciona para login
    window.location.href = '/login.html';
}
```

### 6. Theme Toggle com Persistência

```javascript
themeToggle.addEventListener('click', async () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Salva no servidor se autenticado
    if (currentUser) {
        await fetch(`${API_BASE}/auth/theme`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ theme: isDark ? 'dark' : 'light' })
        });
    }
});
```

## Isolamento de Dados por Usuário

Todos os endpoints de produtos e listas require autenticação (`@login_required`) e filtram por `request.user.id`:

```python
@app.route('/api/produtos', methods=['GET'])
@login_required
def list_produtos():
    # Retorna apenas produtos do usuário logado
    produtos = request.user.produtos.all()
    return jsonify([p.to_dict() for p in produtos]), 200

@app.route('/api/listas', methods=['GET'])
@login_required
def list_listas():
    # Retorna apenas listas do usuário logado
    listas = request.user.listas.all()
    return jsonify([l.to_dict() for l in listas]), 200
```

## Segurança

### Password Hashing

Senhas são criptografadas com Werkzeug PBKDF2 SHA-256:

```python
from werkzeug.security import generate_password_hash, check_password_hash

# Ao registrar
user.set_password(plain_password)  # Gera hash

# Ao fazer login
if user.check_password(plain_password):  # Valida
    session['user_id'] = user.id
```

### Session Management

- **HTTP-only Cookies**: Cookies não são acessíveis via JavaScript (XSS protection)
- **SameSite=Lax**: Protege contra CSRF attacks
- **30-day expiration**: Sessões expiram após 30 dias de inatividade
- **Permanent flag**: `session.permanent = True` ativa persistência

```python
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

# Ao fazer login
session['user_id'] = user.id
session.permanent = True
```

### Credenciais nas Requisições

Todos os fetch calls incluem `credentials: 'include'` para enviar cookies:

```javascript
fetch(url, {
    credentials: 'include'  // Envia/recebe cookies
})
```

## Fluxo Completo: Registro → Login → Uso → Logout

1. **Usuário acessa** `/` → Se não autenticado, redireciona para `/login.html`
2. **Login page carrega** → Mostra formulário de login/registro com tabs
3. **Usuário registra** → POST `/api/auth/register` → Sessão criada → Redireciona para `/`
4. **App carrega** → checkAuth() valida sessão → Carrega produtos/listas do usuário
5. **Usuário usa app** → Todos os endpoints filtram por `request.user.id`
6. **Tema do usuário** → Carregado de `user.theme` no banco de dados
7. **Usuário faz logout** → POST `/api/auth/logout` → Sessão limpa → Redireciona para `/login.html`

## Deployment no PythonAnywhere

### Configuração

1. Coloque o código no diretório de web app
2. Configure `WSGI` para apontar para `app.py`
3. Configure `SECRET_KEY` como variável de ambiente (não hardcoded)
4. O banco SQLite será criado automaticamente em `data/feira.db`

### Variáveis de Ambiente (Security)

```bash
export SECRET_KEY="chave-secreta-muito-longa-e-aleatoria"
```

## Próximos Passos Opcionais

- [ ] Recuperação de senha (email)
- [ ] Email verification no registro
- [ ] 2FA (two-factor authentication)
- [ ] OAuth (Google, GitHub login)
- [ ] Rate limiting em endpoints de auth

## Testando Manualmente

### Registrar usuário

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@test.com","password":"senha123"}'
```

### Fazer login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"usuario@test.com","password":"senha123"}'
```

### Acessar endpoint protegido

```bash
curl -b cookies.txt http://localhost:5000/api/produtos
```

### Fazer logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt
```

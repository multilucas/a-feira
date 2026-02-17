# Manual Testing Guide - A Feira Authentication

## Pre-Test Checklist

- [ ] Backend running: `python app.py` em `backend/`
- [ ] Database created: `data/feira.db` existe
- [ ] Browser open: http://localhost:5000

---

## Test 1: Login Page Loads

**Expected**: 
- Vê formulário de login com dois tabs (Login / Registrar)
- Tema toggle funciona (🌙/☀️)
- Design mobile-friendly

**Steps**:
1. Acesse http://localhost:5000
2. Deverá redirecionar para http://localhost:5000/login.html
3. Verifique ambos os tabs aparecem

**Result**: ✅ / ❌

---

## Test 2: Register New User

**Expected**:
- Novo usuário registrado
- Redireciona para app
- Pode fazer login

**Steps**:
1. Na aba "Registrar", digite:
   - Email: `teste1@example.com`
   - Senha: `senha123`
   - Confirmar: `senha123`
2. Clique "Criar Conta"
3. Deverá redirecionar para `/` (main app)

**Result**: ✅ / ❌

---

## Test 3: App Loads with User Data

**Expected**:
- Header mostra email do usuário
- Botão "Sair" funciona
- Pode criar produtos e listas

**Steps**:
1. Após registrar/login, app carrega
2. No header superior, verifique:
   - Email `teste1@example.com` aparece
   - Botão "Sair" está visível
3. Clique "Produtos" tab
4. Clique "+ Novo Produto"
5. Crie um produto: `Leite`

**Result**: ✅ / ❌

---

## Test 4: Theme Persistence

**Expected**:
- Tema salvo no banco de dados
- Persiste após logout/login

**Steps**:
1. Clique theme toggle (🌙/☀️)
2. Page vai para dark mode
3. Clique "Sair" (logout)
4. Login novamente com mesmo email
5. Verifique: tema continua dark ✅

**Result**: ✅ / ❌

---

## Test 5: Data Isolation

**Expected**:
- Usuário 2 não vê dados de Usuário 1
- Cada usuário tem seus produtos/listas

**Steps**:
1. Crie produtos como `teste1@example.com`
2. Clique "Sair"
3. Registre novo usuário: `teste2@example.com`
4. Vá para "Produtos" tab
5. Verifique: lista vazia (não vê produtos de teste1)

**Result**: ✅ / ❌

---

## Test 6: Full Workflow

**Expected**:
- Usuário consegue fazer: Registrar → Criar Produtos → Criar Lista → Adicionar Itens → Logout → Login

**Steps**:
1. Registre: `user@full.com` / `password123`
2. Crie 3 produtos:
   - Leite (Laticínios, 2L, R$3.50)
   - Pão (Padaria, 2 unidades, R$2.00)
   - Ovos (Alimentos, 12 unidades, R$5.00)
3. Crie lista: "Semana"
4. Adicione cada produto com quantidade
5. Clique para verificar items
6. Verifique totais calculam corretamente
7. Clique "Sair"
8. Faça login novamente
9. Verifique: todos dados estão lá ✅

**Result**: ✅ / ❌

---

## Test 7: Error Handling

**Expected**:
- Validações funcionam corretamente
- Mensagens de erro aparecem

**Steps**:

### 7a. Senha muito curta
1. Tente registrar com senha `abc`
2. Error: "Senha deve ter mínimo 6 caracteres"

**Result**: ✅ / ❌

### 7b. Email duplicado
1. Registre `teste3@example.com`
2. Tente registrar novamente com mesmo email
3. Error: "Email já registrado"

**Result**: ✅ / ❌

### 7c. Login com email errado
1. Tente login com `naoexiste@example.com`
2. Error: "Email ou senha inválidos"

**Result**: ✅ / ❌

### 7d. Login com senha errada
1. Tente login correto com senha errada
2. Error: "Email ou senha inválidos"

**Result**: ✅ / ❌

---

## Test 8: Session Expiration

**Expected**:
- Acessar endpoint sem sessão retorna 401
- Logout limpa sessão

**Steps**:
1. Abra dev tools (F12) → Console
2. Crie produto (POST `/api/produtos` sucesso)
3. Clique "Sair"
4. Tente criar produto novamente
5. Deverá redirecionar para login (sessão expirou)

**Result**: ✅ / ❌

---

## Test 9: Mobile Responsiveness

**Expected**:
- App funciona bem em mobile
- Layout ajusta para tela pequena

**Steps**:
1. Abra DevTools (F12)
2. Ative "Device Emulation"
3. Selecione "iPhone 12"
4. Navegue pelo app
5. Verifique: botões clicáveis, sem overflow, UI legível

**Result**: ✅ / ❌

---

## Test 10: API Isolation

**Expected**:
- Endpoints filtram por user_id
- Cross-user access retorna vazio

**Steps**:
1. Crie usuario `api1@test.com` com 3 produtos
2. Crie usuario `api2@test.com`
3. `api2` tenta fazer GET `/api/produtos`
4. Deverá retornar lista vazia (não seus produtos)

**Result**: ✅ / ❌

---

## Summary Checklist

- [ ] Test 1: Login page
- [ ] Test 2: Registration
- [ ] Test 3: App loads
- [ ] Test 4: Theme persistence
- [ ] Test 5: Data isolation
- [ ] Test 6: Full workflow
- [ ] Test 7: Error handling
- [ ] Test 8: Session expiration
- [ ] Test 9: Mobile responsiveness
- [ ] Test 10: API isolation

**Total Passed**: __/10

---

## Known Issues / Notes

(Use this space to document any issues found during testing)

---

## Test Date: ________
## Tested By: ________
## Result: ✅ PASS / ❌ FAIL

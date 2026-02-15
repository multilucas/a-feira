# 🧪 Guia de Testes Manuais

## Setup Inicial

```bash
cd /home/multilucas/Projetos/a-feira
bash start.sh
# Abrir http://localhost:5000 no navegador
```

## 🎯 Testes por Feature

### Feature 1: Cadastro de Produtos

#### Teste 1.1: Criar Produto Simples
1. Clica "Produtos" no menu
2. Clica "Novo Produto"
3. Preenche:
   - Nome: "Maçã"
   - Categoria: "Frutas e Vegetais"
   - Quantidade: "2.5"
   - Unidade: "kg"
   - Preço: "4.50"
   - Descrição: "Maçã vermelha"
4. Clica "Criar"
5. **Esperado**: Produto aparece na lista

#### Teste 1.2: Validação de Campo Obrigatório
1. Clica "Novo Produto"
2. Deixa "Nome" vazio
3. Tenta preencher outros campos
4. **Esperado**: HTML5 impede envio (aviso nativo)

#### Teste 1.3: Deletar Produto
1. Na lista de produtos, clica "🗑️ Deletar" em um produto
2. **Esperado**: Aparece confirmação, depois remove

#### Teste 1.4: Produto com Preço Decimal
1. Nome: "Café Premium"
2. Preço: "12.99"
3. **Esperado**: Mostra corretamente como "R$ 12.99"

---

### Feature 2: Cadastro de Listas

#### Teste 2.1: Criar Nova Lista
1. Clica "Listas" no menu
2. Clica "Nova Lista"
3. Digita: "Compras da Semana"
4. Clica "Criar"
5. **Esperado**: Lista aparece com 0 itens

#### Teste 2.2: Abrir Lista
1. Clica em uma lista existente
2. **Esperado**: Navega para detalhe com "Adicionar Item"

#### Teste 2.3: Adicionar Item (Produto Existente)
1. Abre uma lista
2. Clica "Adicionar Item"
3. Digita nome de produto que existe
4. Clica no produto na lista
5. Coloca quantidade: "3"
6. Clica "Adicionar"
7. **Esperado**: Item aparece na lista com quantidade correta

#### Teste 2.4: Criar Produto Rápido
1. Abre lista
2. Clica "Adicionar Item"
3. Digita nome de produto que NÃO existe (ex: "Queijo Artesanal")
4. Clica "Criar 'Queijo Artesanal'"
5. Preenche:
   - Categoria
   - Preço
   - Unidade
   - Quantidade inicial
6. Clica "Criar e Adicionar"
7. **Esperado**: Produto criado + adicionado à lista em uma ação

#### Teste 2.5: Remover Item da Lista
1. Na lista, encontra um item
2. Clica "Remover"
3. **Esperado**: Item sai da lista imediatamente

---

### Feature 3: Cálculos Dinâmicos

#### Teste 3.1: Total da Lista (Todos Itens)
1. Cria lista com 3 itens:
   - Item A: 2 unidades × R$ 10.00 = R$ 20.00
   - Item B: 1 unidade × R$ 15.00 = R$ 15.00
   - Item C: 3 unidades × R$ 5.00 = R$ 15.00
2. **Esperado**: "Total da Lista: R$ 50.00"
3. Nenhum checkbox marcado
4. **Esperado**: "Total do Carrinho: R$ 0.00"

#### Teste 3.2: Marcar Item (Toggle Checkbox)
1. Na lista anterior, marca apenas Item A
2. **Esperado**:
   - Total da Lista: R$ 50.00 (não muda)
   - Total do Carrinho: R$ 20.00 (só Item A)

#### Teste 3.3: Marcar Múltiplos Itens
1. Marca Item A e Item B
2. **Esperado**: Total do Carrinho = R$ 35.00 (A + B)

#### Teste 3.4: Desmarcar Item
1. Com Item A marcado, marca Item B
2. Depois desmarca Item A
3. **Esperado**: Total do Carrinho = R$ 15.00 (só B)

#### Teste 3.5: Mudar Quantidade
1. Item com quantidade "2", preço "10.00"
2. Valor parcial: R$ 20.00
3. Muda quantidade para "5"
4. **Esperado**: Valor muda para R$ 50.00
5. Ambos totais atualizam

#### Teste 3.6: Footer Sticky
1. Adiciona vários itens (scroll na lista)
2. **Esperado**: Footer com totais permanece visível na base

---

### Theme Switching

#### Teste 4.1: Dark Mode
1. Clica 🌙 no header
2. **Esperado**:
   - Fundo fica escuro
   - Texto fica claro
   - Ícone vira ☀️

#### Teste 4.2: Light Mode
1. Em dark mode, clica ☀️
2. **Esperado**: Volta para claro

#### Teste 4.3: Persistência de Theme
1. Ativa dark mode
2. Recarrega página (F5)
3. **Esperado**: Permanece em dark mode

#### Teste 4.4: Theme em Todos Elementos
1. Em dark mode, verifica:
   - [ ] Header escuro
   - [ ] Menu escuro
   - [ ] Cards escuros
   - [ ] Modais escuros
   - [ ] Inputs com fundo escuro
   - [ ] Texto sempre legível

---

### Responsividade Mobile

#### Teste 5.1: Layout em Celular
1. Abre no DevTools (F12) → Device Toolbar
2. Seleciona "iPhone 12"
3. Verifica:
   - [ ] Header usa espaço todo
   - [ ] Menu com 2 abas visíveis
   - [ ] Botões grandes (>40px)
   - [ ] Espaçamento confortável
   - [ ] Modais bottom-sheet

#### Teste 5.2: Inputs em Mobile
1. Toca um campo de input
2. **Esperado**: Teclado sobe sem causar confusion

#### Teste 5.3: Botões Tácteis
1. Botões devem ter min 40px de altura
2. Espaçamento entre eles mín 8px
3. **Esperado**: Fácil tocar sem errar

---

### Casos Extremos

#### Teste 6.1: Lista Vazia
1. Cria lista, não adiciona nada
2. **Esperado**: Mostra "Nenhum item na lista"
3. **Esperado**: Totais aparecem como "R$ 0.00"

#### Teste 6.2: Produto com Preço Muito Alto
1. Cria produto com preço: "9999.99"
2. Adiciona 100 unidades
3. **Esperado**: Calcula corretamente (R$ 999999.00)

#### Teste 6.3: Quantidade Decimal
1. Adiciona produto com quantidade: "0.5" kg
2. Preço: "10.00" por kg
3. **Esperado**: Valor = R$ 5.00

#### Teste 6.4: Muitos Itens na Lista
1. Adiciona 20+ itens
2. Scroll funciona
3. **Esperado**: Footer sempre visível

---

## 🔧 Troubleshooting

### Problema: Servidor não inicia
**Solução:**
```bash
cd /home/multilucas/Projetos/a-feira/backend
python -m pip install -r requirements.txt
python app.py
```

### Problema: Port 5000 já em uso
**Solução:**
```bash
# Encontrar processo
lsof -i :5000

# Matar processo (se necessário)
kill -9 <PID>
```

### Problema: API retorna erro 404
**Solução:** Verificar se backend está rodando em outra aba do terminal

### Problema: Dados não persistem
**Verificar:**
- Pasta `/data/` existe?
- Arquivos `produtos.json` e `listas.json` foram criados?
- Verificar permissões de escrita: `ls -la /home/multilucas/Projetos/a-feira/data/`

---

## 📱 Checklist Final

- [ ] Todas features funcionam
- [ ] Theme toggle funciona
- [ ] Dados persistem após refresh
- [ ] Layout responsivo em mobile
- [ ] Sem erros no console (F12)
- [ ] Totais calculam corretamente
- [ ] Modais abrem/fecham
- [ ] Busca de produtos funciona
- [ ] Validação de campos obrigatórios

**Quando tudo passar:** MVP está pronto para usar! 🎉

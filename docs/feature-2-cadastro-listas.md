# Feature 2: Cadastro de Listas de Compras

## O que foi feito

Sistema completo de gerenciamento de listas de compras com adição de produtos via busca ou cadastro rápido.

### Funcionalidades
- ✅ Criar novas listas de compras
- ✅ Adicionar produtos à lista (produtos cadastrados ou novos)
- ✅ Buscar produtos na modal para adicionar
- ✅ Criar produto rapidamente ao adicionar à lista
- ✅ Remover itens da lista
- ✅ Atualizar quantidade de itens
- ✅ Interface mobile-first

## Por que foi feito dessa maneira

### 1. **Duas Formas de Adicionar Itens**
- **Busca**: Procura entre produtos já cadastrados (rápido)
- **Criação Rápida**: Se o produto não existe, permite criar na hora (fluxo contínuo)

Isso evita o usuário ter que sair da lista, criar o produto, e voltar.

### 2. **Estrutura Hierárquica**
```
Lista (coleção)
  └── Itens (referências a produtos)
       ├── produto_id
       ├── quantidade
       └── checked (marcado como comprado)
```

Permite:
- Um produto pode estar em múltiplas listas
- Quantidade diferente por lista
- Estrutura simples sem duplicação de dados

### 3. **Cache de Produtos em Memória**
- `produtosCache` carregado ao inicializar
- Atualizações em tempo real
- Busca sem requisições ao backend

## Decisões Técnicas

| Decisão | Motivo |
|---------|--------|
| Produto por referência (ID) | Evita duplicação, facilita atualização de preço global |
| Quantidade separada por item | Mesma coisa em listas diferentes pode ter qtd diferente |
| Modal com abas | Fluxo natural: busca → produto não existe → criar |
| Overlay semi-transparente | Feedback visual claro de modal ativa |

## Estrutura de Dados

```json
{
  "1739614284001": {
    "id": "1739614284001",
    "nome": "Compras do Mês",
    "itens": [
      {
        "produto_id": "1739614284000",
        "quantidade": 3,
        "checked": false
      }
    ],
    "created_at": "2026-02-15T10:31:00",
    "updated_at": "2026-02-15T10:31:30"
  }
}
```

## Endpoints da API

### GET /api/listas
Lista todas as listas
```
Response: [{ id, nome, itens, created_at, updated_at }]
```

### POST /api/listas
Cria uma nova lista
```
Body: { nome }
```

### GET /api/listas/<id>
Retorna uma lista com todos seus itens

### POST /api/listas/<id>/itens
Adiciona um item à lista
```
Body: { produto_id, quantidade }
```

### PUT /api/listas/<id>/itens/<produto_id>/quantidade
Atualiza quantidade de um item
```
Body: { quantidade }
```

### PUT /api/listas/<id>/itens/<produto_id>/toggle
Marca/desmarca item como comprado (checkbox)

### DELETE /api/listas/<id>/itens/<produto_id>
Remove um item da lista

## Fluxo de Uso

### Criar Lista
1. Clica "Nova Lista"
2. Modal abre com input de nome
3. Confirma
4. Lista salva em `data/listas.json`

### Adicionar Item - Via Busca
1. Abre lista
2. Clica "Adicionar Item"
3. Digita nome do produto
4. Seleciona da lista
5. Digita quantidade
6. Confirma → Item adicionado

### Adicionar Item - Via Criação Rápida
1. Abre lista
2. Clica "Adicionar Item"
3. Digita nome de produto inexistente
4. Clica "Criar [nome]"
5. Preenche dados do produto
6. Clica "Criar e Adicionar"
7. Produto criado + Item adicionado em uma ação

## Melhorias Futuras

- [ ] Duplicar lista existente
- [ ] Compartilhar lista (QR code)
- [ ] Histórico de listas deletadas
- [ ] Agrupar itens por categoria na view
- [ ] Ordenar itens por categoria

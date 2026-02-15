# Feature 1: Cadastro de Produtos

## O que foi feito

Sistema completo de cadastro de produtos com validação básica e persistência em JSON.

### Funcionalidades
- ✅ Cadastrar novos produtos com campos obrigatórios
- ✅ Listar produtos cadastrados
- ✅ Deletar produtos
- ✅ Campos suportados: Nome, Categoria, Quantidade, Unidade, Preço, Descrição
- ✅ Interface mobile-first com Tailwind CSS
- ✅ Suporte a Light/Dark Theme

## Por que foi feito dessa maneira

### 1. **Armazenamento em JSON**
- Simples e compatível com PythonAnywhere
- Sem dependência de banco de dados complexo
- Fácil de fazer backup e migrar
- Estrutura flexível para futuras mudanças

### 2. **API RESTful (Flask)**
- Padrão consolidado e fácil de entender
- CORS habilitado para comunicação frontend-backend
- Separação clara entre lógica (database.py) e routes (app.py)
- Pronto para escalar se necessário

### 3. **Frontend Simples**
- HTML5 puro com Tailwind CSS
- JavaScript vanilla (zero dependências npm)
- Modais bottom-sheet para mobile-first
- Cache de produtos para evitar requisições desnecessárias

### 4. **Validação Básica**
- Backend: Verifica campos obrigatórios e tipos de dados
- Frontend: Validação HTML5 nativa + verificação em JavaScript
- Não complexo, apenas o necessário

## Decisões Técnicas

| Decisão | Motivo |
|---------|--------|
| JSON em arquivo | Sem BD, simples, PythonAnywhere-compatible |
| Flask | Leve, fácil, ótimo para MVP |
| IDs baseados em timestamp | Único, sem necessidade de sequência |
| Cache de produtos no JS | Evita requisições ao buscar/adicionar itens |
| Tailwind CDN | Zero build, deploy imediato |
| Modal bottom-sheet | Experiência mobile nativa |

## Estrutura de Dados

```json
{
  "1739614284000": {
    "id": "1739614284000",
    "nome": "Maçã",
    "categoria": "Frutas e Vegetais",
    "quantidade": 2.5,
    "unidade": "kg",
    "preco_unidade": 4.50,
    "descricao": "Maçã vermelha fresca",
    "created_at": "2026-02-15T10:30:00"
  }
}
```

## Endpoints da API

### GET /api/produtos
Lista todos os produtos
```
Response: [{ id, nome, categoria, quantidade, unidade, preco_unidade, descricao, created_at }]
```

### POST /api/produtos
Cria um novo produto
```
Body: { nome, categoria, quantidade, unidade, preco_unidade, descricao? }
```

### GET /api/produtos/<id>
Retorna um produto específico

### PUT /api/produtos/<id>
Atualiza um produto

### DELETE /api/produtos/<id>
Deleta um produto

## Fluxo de Uso

1. Usuário clica em "Novo Produto"
2. Modal abre (bottom-sheet)
3. Preenche campos obrigatórios
4. Clica em "Criar"
5. Produto é salvo em `data/produtos.json`
6. Lista atualiza automaticamente

## Melhorias Futuras

- [ ] Editar produtos existentes
- [ ] Filtrar/buscar produtos
- [ ] Imagens dos produtos
- [ ] Histórico de preços
- [ ] Importação de CSV

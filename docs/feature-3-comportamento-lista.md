# Feature 3: Comportamento da Lista e Cálculos Dinâmicos

## O que foi feito

Sistema de cálculo dinâmico de totais com dois valores sempre visíveis e atualizados em tempo real.

### Funcionalidades
- ✅ Exibir valor de cada item (preço × quantidade)
- ✅ Calcular Total da Lista (todos os itens)
- ✅ Calcular Total do Carrinho (apenas itens checkados)
- ✅ Atualizar valores em tempo real ao marcar/desmarcar checkbox
- ✅ Atualizar valores ao mudar quantidade
- ✅ Interface clara com fixed footer mostrando totais

## Por que foi feito dessa maneira

### 1. **Dois Totais Simultâneos**
- **Total da Lista**: Soma de TODOS os itens (independente de checkbox)
- **Total do Carrinho**: Soma apenas dos items com checkbox = "vou comprar"

Cenário real:
- Usuário lista 10 itens (R$ 100 total)
- Seleciona apenas 5 itens para comprar hoje (R$ 50)
- Footer mostra ambos: "Total da Lista: R$ 100" | "Total do Carrinho: R$ 50"

### 2. **Cálculo Ocorre em 3 Situações**
1. **Toggle de Checkbox**: Marca/desmarca item
2. **Mudança de Quantidade**: Altera valor do item
3. **Carregamento da Lista**: Inicializa com valores corretos

Função única: `calcularTotais(itens)` reutilizável em todas.

### 3. **Footer Fixado na Base**
- `position: fixed; bottom: 0`
- Sempre visível (não necessário scroll)
- Botões acima têm `pb-20` para não sobrepor
- Responsivo em mobile

### 4. **Cada Item Mostra Valor Parcial**
```
Produto: Tomate
Quantidade: 2.5 kg @ R$ 3.00
= R$ 7.50
```

Clareza instantânea do valor de cada item.

## Decisões Técnicas

| Decisão | Motivo |
|---------|--------|
| Footer sticky | Sempre visível, UX mobile |
| Cálculo em JS | Instantâneo, sem requisição ao backend |
| Sem arredondamentos intermediários | Evita erros de centavos |
| Input number para quantidade | Validação nativa, increment/decrement |
| Checkbox nativo | Acessibilidade, sem libs |

## Fórmulas de Cálculo

### Valor do Item
```
valor_item = preco_da_unidade × quantidade
```

### Total da Lista
```
total_lista = Σ (preco × quantidade) para todos itens
```

### Total do Carrinho
```
total_carrinho = Σ (preco × quantidade) para itens onde checked = true
```

## Estrutura HTML - Footer

```html
<div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 shadow-lg">
  <div class="flex justify-between font-bold text-lg">
    <span>Total da Lista:</span>
    <span id="totalLista" class="text-indigo-600">R$ 0,00</span>
  </div>
  <div class="flex justify-between font-bold text-lg">
    <span>Total do Carrinho:</span>
    <span id="totalCarrinho" class="text-green-600">R$ 0,00</span>
  </div>
</div>
```

## Fluxo de Cálculo

```
Ação do Usuário (checkbox, quantidade)
        ↓
Chamada para API (atualizar backend)
        ↓
API retorna lista atualizada
        ↓
renderItensLista(lista)
        ↓
calcularTotais(lista.itens)
        ↓
Atualiza DOM (totalLista e totalCarrinho)
```

## Formatação de Valores

- Moeda: `R$ valor.toFixed(2)` (sempre 2 casas decimais)
- Quantidade: Permite até 2 casas (0.01 kg, 0.5 unidade)
- Exemplo: 2.5 kg @ R$ 3.50 = R$ 8.75

## Código Principal

```javascript
function calcularTotais(itens) {
    let totalLista = 0;
    let totalCarrinho = 0;

    itens.forEach(item => {
        const produto = produtosCache.find(p => p.id === item.produto_id);
        if (!produto) return;

        const valor = produto.preco_unidade * item.quantidade;
        totalLista += valor;

        if (item.checked) {
            totalCarrinho += valor;
        }
    });

    document.getElementById('totalLista').textContent = `R$ ${totalLista.toFixed(2)}`;
    document.getElementById('totalCarrinho').textContent = `R$ ${totalCarrinho.toFixed(2)}`;
}
```

Chamado por:
- `toggleItem()` - marca/desmarca
- `updateQuantidade()` - muda quantidade
- `renderItensLista()` - carrega a lista
- `removeItem()` - remove item

## Casos de Teste

| Cenário | Esperado |
|---------|----------|
| 3 itens × R$ 10, nenhum marcado | Total Lista: R$ 30 / Total Carrinho: R$ 0 |
| 3 itens × R$ 10, 2 marcados | Total Lista: R$ 30 / Total Carrinho: R$ 20 |
| Muda quantidade de 1 pra 2 | Ambos totais aumentam |
| Desmarca checkbox | Carrinho diminui, Lista permanece |
| Remove item | Ambos totais diminuem |
| Lista vazia | Total Lista: R$ 0 / Total Carrinho: R$ 0 |

## Melhorias Futuras

- [ ] Estimativa de economia (desconto se comprar tudo agora)
- [ ] Custo por categoria
- [ ] Previsão de gasto por dia/semana
- [ ] Sugestão de itens com melhor preço/qualidade

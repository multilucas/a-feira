// ========== CONFIGURAÇÃO ==========

const API_BASE = 'http://localhost:5000/api';

let listaAtualId = null;
let produtosCache = [];

// ========== INICIALIZAÇÃO ==========

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEventListeners();
    loadListas();
    loadProdutos();
});

// ========== THEME TOGGLE ==========

function initTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    
    if (isDark) {
        document.documentElement.classList.add('dark');
        updateThemeIcon(true);
    }
}

document.getElementById('themeToggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
});

function updateThemeIcon(isDark) {
    document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
}

// ========== NAVEGAÇÃO ==========

function initEventListeners() {
    // Navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchPage(e.target.closest('.nav-btn').dataset.page);
        });
    });

    // Botões principais
    document.getElementById('btnNovaLista').addEventListener('click', openModalNovaLista);
    document.getElementById('btnNovoProduto').addEventListener('click', openModalNovoProduto);
    document.getElementById('btnAdicionarItem').addEventListener('click', openModalAdicionarItem);

    // Modal: Nova Lista
    document.getElementById('btnConfirmarNovaLista').addEventListener('click', criarNovaLista);
    document.getElementById('btnCancelarNovaLista').addEventListener('click', closeAllModals);

    // Modal: Novo Produto
    document.getElementById('formNovoProduto').addEventListener('submit', criarNovoProduto);
    document.getElementById('btnCancelarNovoProduto').addEventListener('click', closeAllModals);

    // Modal: Adicionar Item
    document.getElementById('inputBuscaProduto').addEventListener('input', buscarProdutosModal);
    document.getElementById('btnCancelarAdicionarItem').addEventListener('click', closeAllModals);
    document.getElementById('btnCancelarProdutoRapido').addEventListener('click', closeAllModals);
    document.getElementById('formAdicionarItem').addEventListener('submit', adicionarItemLista);
    document.getElementById('btnConfirmarProdutoRapido').addEventListener('click', criarProdutoRapido);

    // Volta da página de detalhe
    document.getElementById('btnVoltarLista').addEventListener('click', () => {
        switchPage('listas');
    });
}

function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    
    document.getElementById(`page-${pageName}`).classList.remove('hidden');
    
    // Atualiza navegação ativa
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.dataset.page === pageName) {
            btn.classList.add('border-indigo-600');
        } else {
            btn.classList.remove('border-indigo-600');
        }
    });

    // Recarrega dados se necessário
    if (pageName === 'listas') loadListas();
    if (pageName === 'produtos') loadProdutos();
}

// ========== MODAIS ==========

function openModalNovaLista() {
    document.getElementById('inputNovaListaNome').value = '';
    openModal('modalNovaLista');
}

function openModalNovoProduto() {
    document.getElementById('formNovoProduto').reset();
    openModal('modalNovoProduto');
}

function openModalAdicionarItem() {
    document.getElementById('inputBuscaProduto').value = '';
    document.getElementById('formAdicionarItem').classList.add('hidden');
    document.getElementById('formNovoProdutoRapido').classList.add('hidden');
    document.getElementById('listaProdutosModal').innerHTML = '';
    buscarProdutosModal();
    openModal('modalAdicionarItem');
}

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    document.getElementById('modalOverlay').classList.add('hidden');
}

// ========== LISTAS ==========

async function loadListas() {
    try {
        const response = await fetch(`${API_BASE}/listas`);
        const listas = await response.json();
        renderListas(listas);
    } catch (error) {
        console.error('Erro ao carregar listas:', error);
    }
}

function renderListas(listas) {
    const container = document.getElementById('listasContainer');
    
    if (!listas.length) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">Nenhuma lista criada</p>';
        return;
    }

    container.innerHTML = listas.map(lista => `
        <button onclick="abrirLista('${lista.id}')" class="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 text-left hover:shadow-lg transition">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-lg">${lista.nome}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400">${lista.itens.length} itens</p>
                </div>
                <span class="text-2xl">→</span>
            </div>
        </button>
    `).join('');
}

async function criarNovaLista() {
    const nome = document.getElementById('inputNovaListaNome').value.trim();
    
    if (!nome) {
        alert('Digite um nome para a lista');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/listas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome })
        });

        if (response.ok) {
            closeAllModals();
            loadListas();
        } else {
            alert('Erro ao criar lista');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar lista');
    }
}

async function abrirLista(listaId) {
    listaAtualId = listaId;
    
    try {
        const response = await fetch(`${API_BASE}/listas/${listaId}`);
        const lista = await response.json();
        
        document.getElementById('listaDetalheNome').textContent = lista.nome;
        renderItensLista(lista);
        switchPage('lista-detalhe');
    } catch (error) {
        console.error('Erro ao abrir lista:', error);
    }
}

function renderItensLista(lista) {
    const container = document.getElementById('itensContainer');
    
    if (!lista.itens.length) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">Nenhum item na lista</p>';
        calcularTotais([]);
        return;
    }

    container.innerHTML = lista.itens.map(item => {
        const produto = produtosCache.find(p => p.id === item.produto_id);
        if (!produto) return '';

        const valor = (produto.preco_unidade * item.quantidade).toFixed(2);
        const checked = item.checked ? 'checked' : '';

        return `
            <div class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 flex gap-3 items-center">
                <input 
                    type="checkbox" 
                    ${checked}
                    onchange="toggleItem('${listaAtualId}', '${item.produto_id}')"
                    class="w-6 h-6 rounded cursor-pointer"
                >
                
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold">${produto.nome}</h4>
                    <div class="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <input 
                            type="number" 
                            value="${item.quantidade}"
                            onchange="updateQuantidade('${listaAtualId}', '${item.produto_id}', this.value)"
                            min="0.01"
                            step="0.01"
                            class="w-16 p-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                        >
                        <span>${produto.unidade}</span>
                        <span>@</span>
                        <span>R$ ${produto.preco_unidade.toFixed(2)}</span>
                    </div>
                </div>

                <div class="text-right">
                    <p class="font-bold text-lg">R$ ${valor}</p>
                    <button 
                        onclick="removeItem('${listaAtualId}', '${item.produto_id}')"
                        class="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                        Remover
                    </button>
                </div>
            </div>
        `;
    }).join('');

    calcularTotais(lista.itens);
}

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

// ========== ITENS DA LISTA ==========

async function toggleItem(listaId, produtoId) {
    try {
        const response = await fetch(`${API_BASE}/listas/${listaId}/itens/${produtoId}/toggle`, {
            method: 'PUT'
        });

        if (response.ok) {
            const lista = await response.json();
            renderItensLista(lista);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function updateQuantidade(listaId, produtoId, novaQuantidade) {
    if (!novaQuantidade || novaQuantidade <= 0) {
        alert('Quantidade deve ser maior que 0');
        loadLista(listaId);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/listas/${listaId}/itens/${produtoId}/quantidade`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantidade: parseFloat(novaQuantidade) })
        });

        if (response.ok) {
            const lista = await response.json();
            renderItensLista(lista);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function removeItem(listaId, produtoId) {
    if (!confirm('Remover este item?')) return;

    try {
        const response = await fetch(`${API_BASE}/listas/${listaId}/itens/${produtoId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            const lista = await response.json();
            renderItensLista(lista);
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

async function loadLista(listaId) {
    try {
        const response = await fetch(`${API_BASE}/listas/${listaId}`);
        const lista = await response.json();
        renderItensLista(lista);
    } catch (error) {
        console.error('Erro ao carregar lista:', error);
    }
}

// ========== PRODUTOS ==========

async function loadProdutos() {
    try {
        const response = await fetch(`${API_BASE}/produtos`);
        produtosCache = await response.json();
        renderProdutos(produtosCache);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
    }
}

function renderProdutos(produtos) {
    const container = document.getElementById('produtosContainer');
    
    if (!produtos.length) {
        container.innerHTML = '<p class="text-center text-gray-500 py-8">Nenhum produto cadastrado</p>';
        return;
    }

    container.innerHTML = produtos.map(produto => `
        <div class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <h3 class="font-bold text-lg">${produto.nome}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${produto.categoria}</p>
            
            <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                    <span class="text-gray-600 dark:text-gray-400">Quantidade:</span>
                    <p class="font-bold">${produto.quantidade} ${produto.unidade}</p>
                </div>
                <div>
                    <span class="text-gray-600 dark:text-gray-400">Preço:</span>
                    <p class="font-bold">R$ ${produto.preco_unidade.toFixed(2)}</p>
                </div>
            </div>

            ${produto.descricao ? `<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">${produto.descricao}</p>` : ''}

            <button onclick="deleteProduto('${produto.id}')" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg transition">
                🗑️ Deletar
            </button>
        </div>
    `).join('');
}

async function criarNovoProduto(e) {
    e.preventDefault();

    const formData = {
        nome: document.getElementById('inputProdutoNome').value,
        categoria: document.getElementById('inputProdutoCategoria').value,
        quantidade: parseFloat(document.getElementById('inputProdutoQuantidade').value),
        unidade: document.getElementById('inputProdutoUnidade').value,
        preco_unidade: parseFloat(document.getElementById('inputProdutoPreco').value),
        descricao: document.getElementById('inputProdutoDescricao').value
    };

    if (!formData.nome || !formData.categoria || !formData.unidade || !formData.preco_unidade) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/produtos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            closeAllModals();
            loadProdutos();
        } else {
            alert('Erro ao criar produto');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar produto');
    }
}

async function deleteProduto(produtoId) {
    if (!confirm('Deletar este produto?')) return;

    try {
        const response = await fetch(`${API_BASE}/produtos/${produtoId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadProdutos();
        } else {
            alert('Erro ao deletar produto');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao deletar produto');
    }
}

// ========== BUSCA E ADICIONAR ITEM ==========

function buscarProdutosModal() {
    const termo = document.getElementById('inputBuscaProduto').value.toLowerCase();
    const container = document.getElementById('listaProdutosModal');
    
    const filtrados = produtosCache.filter(p =>
        p.nome.toLowerCase().includes(termo)
    );

    if (termo && !filtrados.length) {
        container.innerHTML = `
            <button type="button" onclick="showFormNovoProdutoRapido('${termo}')" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition">
                ➕ Criar "${termo}"
            </button>
        `;
        return;
    }

    container.innerHTML = filtrados.map(produto => `
        <button type="button" onclick="selecionarProduto('${produto.id}', '${produto.nome}')" class="w-full text-left bg-gray-100 dark:bg-gray-700 p-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            <div class="font-bold">${produto.nome}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">${produto.categoria} • R$ ${produto.preco_unidade.toFixed(2)}/${produto.unidade}</div>
        </button>
    `).join('');
}

function selecionarProduto(produtoId, produtoNome) {
    document.getElementById('formAdicionarItem').classList.remove('hidden');
    document.getElementById('formNovoProdutoRapido').classList.add('hidden');
    document.getElementById('inputProdutoIdSelecionado').value = produtoId;
    document.getElementById('produtoSelecionadoNome').textContent = produtoNome;
    document.getElementById('inputQuantidadeItem').value = '1';
    document.getElementById('inputQuantidadeItem').focus();
}

function showFormNovoProdutoRapido(termo) {
    document.getElementById('formAdicionarItem').classList.add('hidden');
    document.getElementById('formNovoProdutoRapido').classList.remove('hidden');
    document.getElementById('inputProdutoRapidoNome').value = termo;
}

async function criarProdutoRapido() {
    const formData = {
        nome: document.getElementById('inputProdutoRapidoNome').value,
        categoria: document.getElementById('inputProdutoRapidoCategoria').value,
        quantidade: parseFloat(document.getElementById('inputProdutoRapidoQuantidade').value),
        unidade: document.getElementById('inputProdutoRapidoUnidade').value,
        preco_unidade: parseFloat(document.getElementById('inputProdutoRapidoPreco').value)
    };

    if (!formData.nome || !formData.categoria || !formData.unidade || !formData.preco_unidade) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/produtos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const novoProduto = await response.json();
            loadProdutos();
            
            // Adiciona à lista automaticamente
            const quantidadeItem = parseFloat(document.getElementById('inputQuantidadeItem').value) || formData.quantidade;
            await fetch(`${API_BASE}/listas/${listaAtualId}/itens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ produto_id: novoProduto.id, quantidade: quantidadeItem })
            });

            closeAllModals();
            loadLista(listaAtualId);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao criar produto');
    }
}

async function adicionarItemLista(e) {
    e.preventDefault();

    const produtoId = document.getElementById('inputProdutoIdSelecionado').value;
    const quantidade = parseFloat(document.getElementById('inputQuantidadeItem').value);

    if (!produtoId || !quantidade || quantidade <= 0) {
        alert('Selecione um produto e uma quantidade válida');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/listas/${listaAtualId}/itens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ produto_id: produtoId, quantidade })
        });

        if (response.ok) {
            closeAllModals();
            loadLista(listaAtualId);
        } else {
            alert('Erro ao adicionar item');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar item');
    }
}

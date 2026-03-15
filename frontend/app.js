// ========== CONFIGURAÇÃO ==========

const API_BASE = `${window.location.protocol}//${window.location.host}/api`;

let listaAtualId = null;
let produtosCache = [];
let currentUser = null;

// ========== INICIALIZAÇÃO ==========

document.addEventListener('DOMContentLoaded', async () => {
    // Checa autenticação
    const user = await checkAuth();
    if (!user) {
        window.location.href = '/login.html';
        return;
    }
    
    currentUser = user;
    initTheme();
    initEventListeners();
    loadListas();
    updateUserInfo();
});

// ========== AUTENTICAÇÃO ==========

async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include'
        });
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return null;
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

function updateUserInfo() {
    const userGreeting = document.getElementById('userGreeting');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userGreeting && currentUser && currentUser.first_name) {
        userGreeting.innerHTML = `<span>Bem vindo,</span><br><span class="font-bold">${currentUser.first_name}</span>`;
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

// ========== THEME TOGGLE ==========

async function initTheme() {
    // Carrega tema do usuário (do banco de dados)
    let isDark = false;
    if (currentUser && currentUser.theme) {
        isDark = currentUser.theme === 'dark';
    } else {
        isDark = localStorage.getItem('theme') === 'dark';
    }
    
    if (isDark) {
        document.documentElement.classList.add('dark');
        updateThemeIcon(true);
    }
}

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    themeToggle.addEventListener('click', async () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeIcon(isDark);
        
        // Salva preferência no servidor
        if (currentUser) {
            try {
                await fetch(`${API_BASE}/auth/theme`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ theme: isDark ? 'dark' : 'light' })
                });
            } catch (error) {
                console.error('Erro ao salvar tema:', error);
            }
        }
    });
}

function updateThemeIcon(isDark) {
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.textContent = isDark ? '☀️' : '🌙';
    }
}

// ========== NAVEGAÇÃO ==========

function initEventListeners() {
    // Botões principais
    document.getElementById('btnNovaLista').addEventListener('click', openModalNovaLista);
    document.getElementById('btnAdicionarItem').addEventListener('click', openModalAdicionarItem);

    // Modal: Nova Lista
    document.getElementById('btnConfirmarNovaLista').addEventListener('click', criarNovaLista);
    document.getElementById('btnCancelarNovaLista').addEventListener('click', closeAllModals);

    // Modal: Novo Produto
    document.getElementById('formNovoProduto').addEventListener('submit', criarNovoProduto);
    document.getElementById('btnCancelarNovoProduto').addEventListener('click', closeAllModals);

    // Modal: Editar Item
    document.getElementById('formEditarItem').addEventListener('submit', salvarEdicaoItem);
    document.getElementById('btnCancelarEditarItem').addEventListener('click', closeAllModals);
    document.getElementById('btnDeletarItem').addEventListener('click', deletarItemModal);

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

    // Recarrega dados se necessário
    if (pageName === 'listas') loadListas();
}

// ========== MODAIS ==========

function openModalNovaLista() {
    document.getElementById('inputNovaListaNome').value = '';
    openModal('modalNovaLista');
}

function openModalNovoProduto() {
    document.getElementById('formNovoProduto').reset();
    document.getElementById('inputProdutoId').value = '';
    document.getElementById('modalNovoProdutoTitulo').textContent = 'Novo Produto';
    document.getElementById('btnSalvarProduto').textContent = 'Criar';
    openModal('modalNovoProduto');
}

function editarProduto(produtoId) {
    const produto = produtosCache.find(p => p.id == produtoId);
    
    if (!produto) {
        alert('Produto não encontrado');
        return;
    }
    
    // Preencher o formulário com os dados do produto
    document.getElementById('inputProdutoId').value = produto.id;
    document.getElementById('inputProdutoNome').value = produto.nome;
    document.getElementById('inputProdutoCategoria').value = produto.categoria;
    document.getElementById('inputProdutoQuantidade').value = produto.quantidade;
    document.getElementById('inputProdutoUnidade').value = produto.unidade;
    document.getElementById('inputProdutoPreco').value = produto.preco_unidade;
    document.getElementById('inputProdutoDescricao').value = produto.descricao || '';
    
    // Mudar título e botão para modo edição
    document.getElementById('modalNovoProdutoTitulo').textContent = `Editar: ${produto.nome}`;
    document.getElementById('btnSalvarProduto').textContent = 'Salvar Alterações';
    
    openModal('modalNovoProduto');
}

async function openModalAdicionarItem() {
    // Garantir que produtos estão carregados
    if (produtosCache.length === 0) {
        await loadProdutos();
    }
    
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
        const response = await fetch(`${API_BASE}/listas`, {
            credentials: 'include'
        });
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
            credentials: 'include',
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
        // Garante que produtos estão em cache
        if (produtosCache.length === 0) {
            await loadProdutos();
        }
        
        const response = await fetch(`${API_BASE}/listas/${listaId}`, {
            credentials: 'include'
        });
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
        if (!produto) {
            console.warn(`Produto ${item.produto_id} não encontrado no cache`);
            return '';
        }

        const valor = (produto.preco_unidade * item.quantidade).toFixed(2);

        return `
            <div class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-indigo-500 transition flex gap-3 items-center" onclick="abrirModalEditarItem('${listaAtualId}', '${item.produto_id}')">
                <input 
                    type="checkbox" 
                    ${item.checked ? 'checked' : ''}
                    onclick="event.stopPropagation(); toggleItem('${listaAtualId}', '${item.produto_id}')"
                    class="w-6 h-6 rounded cursor-pointer"
                >
                
                <div class="flex-1 min-w-0">
                    <h4 class="font-bold ${item.checked ? 'line-through text-gray-400' : ''}">${produto.nome}</h4>
                    <div class="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>${item.quantidade} ${produto.unidade}</span>
                        <span>@</span>
                        <span>R$ ${produto.preco_unidade.toFixed(2)}</span>
                    </div>
                </div>

                <div class="text-right">
                    <p class="font-bold text-lg">R$ ${valor}</p>
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
            method: 'PUT',
            credentials: 'include'
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
            credentials: 'include',
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
            method: 'DELETE',
            credentials: 'include'
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
        const response = await fetch(`${API_BASE}/listas/${listaId}`, {
            credentials: 'include'
        });
        const lista = await response.json();
        renderItensLista(lista);
    } catch (error) {
        console.error('Erro ao carregar lista:', error);
    }
}

// ========== PRODUTOS ==========

async function loadProdutos() {
    try {
        const response = await fetch(`${API_BASE}/produtos`, {
            credentials: 'include'
        });
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
        <div class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-indigo-500 transition" onclick="editarProduto('${produto.id}')">
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

            <button onclick="event.stopPropagation(); deleteProduto('${produto.id}')" class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg transition">
                🗑️ Deletar
            </button>
        </div>
    `).join('');
}

async function criarNovoProduto(e) {
    e.preventDefault();

    const produtoId = document.getElementById('inputProdutoId').value;
    const precoBruto = document.getElementById('inputProdutoPreco').value;
    const formData = {
        nome: document.getElementById('inputProdutoNome').value,
        categoria: document.getElementById('inputProdutoCategoria').value,
        quantidade: parseFloat(document.getElementById('inputProdutoQuantidade').value),
        unidade: document.getElementById('inputProdutoUnidade').value,
        preco_unidade: precoBruto === "" ? 0 : parseFloat(precoBruto),
        descricao: document.getElementById('inputProdutoDescricao').value
    };

    if (!formData.nome || !formData.categoria || !formData.unidade) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }

    try {
        // Se tem ID, é edição; senão, é criação
        const method = produtoId ? 'PUT' : 'POST';
        const url = produtoId ? `${API_BASE}/produtos/${produtoId}` : `${API_BASE}/produtos`;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            closeAllModals();
            loadProdutos();
        } else {
            const data = await response.json();
            alert(`Erro: ${data.error || 'Não foi possível salvar o produto'}`);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar produto');
    }
}

async function deleteProduto(produtoId) {
    if (!confirm('Deletar este produto?')) return;

    try {
        const response = await fetch(`${API_BASE}/produtos/${produtoId}`, {
            method: 'DELETE',
            credentials: 'include'
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

// ========== EDIÇÃO DE ITENS DA LISTA ==========

function abrirModalEditarItem(listaId, produtoId) {
    const item = listaAtualId && listaAtualId === parseInt(listaId) 
        ? document.querySelector(`div[onclick="abrirModalEditarItem('${listaId}', '${produtoId}')"]`)
        : null;
    
    // Buscar item nos dados
    let itemData = null;
    let listaData = null;
    
    // Carrega lista completa para achar o item
    const listaElement = document.getElementById('listaDetalheNome');
    if (listaElement) {
        fetch(`${API_BASE}/listas/${listaId}`, { credentials: 'include' })
            .then(r => r.json())
            .then(lista => {
                listaData = lista;
                itemData = lista.itens.find(i => i.produto_id === parseInt(produtoId));
                
                if (!itemData) {
                    alert('Item não encontrado');
                    return;
                }

                const produto = produtosCache.find(p => p.id === parseInt(produtoId));
                if (!produto) {
                    alert('Produto não encontrado');
                    return;
                }

                // Preencher modal
                document.getElementById('inputEditarItemId').value = parseInt(produtoId);
                document.getElementById('inputEditarItemListaId').value = parseInt(listaId);
                document.getElementById('editarItemProdutoNome').textContent = produto.nome;
                document.getElementById('inputEditarItemQuantidade').value = itemData.quantidade;
                document.getElementById('inputEditarItemPreco').value = produto.preco_unidade;
                document.getElementById('inputEditarItemChecked').checked = itemData.checked;

                openModal('modalEditarItem');
            })
            .catch(err => {
                console.error('Erro:', err);
                alert('Erro ao carregar item');
            });
    }
}

async function salvarEdicaoItem(e) {
    e.preventDefault();

    const listaId = parseInt(document.getElementById('inputEditarItemListaId').value);
    const produtoId = parseInt(document.getElementById('inputEditarItemId').value);
    const quantidade = parseFloat(document.getElementById('inputEditarItemQuantidade').value);
    const preco_unidade = parseFloat(document.getElementById('inputEditarItemPreco').value);
    const checkedAtual = document.getElementById('inputEditarItemChecked').checked;

    if (quantidade <= 0) {
        alert('Quantidade deve ser maior que 0');
        return;
    }

    try {
        // Atualizar quantidade e preço
        await fetch(`${API_BASE}/listas/${listaId}/itens/${produtoId}/quantidade`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ quantidade, preco_unidade })
        });

        // Se checkbox foi alterado, fazer toggle
        // Preciso buscar o estado original para saber se mudou
        const listaResp = await fetch(`${API_BASE}/listas/${listaId}`, { credentials: 'include' });
        const lista = await listaResp.json();
        const itemOriginal = lista.itens.find(i => i.produto_id === produtoId);
        
        if (itemOriginal && itemOriginal.checked !== checkedAtual) {
            await toggleItem(listaId, produtoId);
        }

        closeAllModals();
        loadLista(listaId);
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao salvar item');
    }
}

async function deletarItemModal() {
    const listaId = parseInt(document.getElementById('inputEditarItemListaId').value);
    const produtoId = parseInt(document.getElementById('inputEditarItemId').value);

    if (!confirm('Deletar este item?')) return;

    try {
        const response = await fetch(`${API_BASE}/listas/${listaId}/itens/${produtoId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            closeAllModals();
            loadLista(listaId);
        } else {
            alert('Erro ao deletar item');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao deletar item');
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
    const precoBruto = document.getElementById('inputProdutoPreco').value;
    const formData = {
        nome: document.getElementById('inputProdutoRapidoNome').value,
        categoria: document.getElementById('inputProdutoRapidoCategoria').value,
        quantidade: parseFloat(document.getElementById('inputProdutoRapidoQuantidade').value),
        unidade: document.getElementById('inputProdutoRapidoUnidade').value,
        preco_unidade: precoBruto === "" ? 0 : parseFloat(precoBruto)
    };

    if (!formData.nome || !formData.categoria || !formData.unidade) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/produtos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const novoProduto = await response.json();
            await loadProdutos();  // Espera produtos carregarem
            
            // Adiciona à lista automaticamente
            const quantidadeItem = parseFloat(document.getElementById('inputQuantidadeItem').value) || formData.quantidade;
            await fetch(`${API_BASE}/listas/${listaAtualId}/itens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
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
            credentials: 'include',
            body: JSON.stringify({ produto_id: produtoId, quantidade })
        });

        const data = await response.json();

        if (response.ok) {
            closeAllModals();
            loadLista(listaAtualId);
        } else {
            console.error('Erro ao adicionar:', data);
            alert('Erro ao adicionar item: ' + (data.error || 'Desconhecido'));
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao adicionar item: ' + error.message);
    }
}

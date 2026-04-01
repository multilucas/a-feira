// ========== CONFIGURAÇÃO ==========

const API_BASE = `${window.location.protocol}//${window.location.host}/api`;

let listaAtualId = null;
let produtosCache = [];
let currentUser = null;
let listasCache = [];
let syncController = null;

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
    initOfflineSync();
    await loadListas();
    updateUserInfo();
});

// ========== AUTENTICAÇÃO ==========

async function checkAuth() {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: 'include'
        });
        if (response.ok) {
            const user = await response.json();
            if (window.OfflineStore) {
                window.OfflineStore.saveAuthSession(user);
            }
            return user;
        }
        return null;
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        if (window.OfflineStore) {
            const fallback = window.OfflineStore.getLastAuthSession();
            if (fallback) {
                return fallback;
            }
        }
        return null;
    }
}

async function logout() {
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }

    if (window.OfflineStore && currentUser?.id) {
        window.OfflineStore.clearAuthSession(currentUser.id);
    }
    window.location.href = '/login.html';
}

function initOfflineSync() {
    if (!window.SyncManager || !window.OfflineStore) return;

    setConnectionStatus(navigator.onLine);
    const pending = window.OfflineStore.getQueue(currentUser.id).length;
    updateSyncStatus(pending, false);

    syncController = window.SyncManager.init({
        apiBase: API_BASE,
        getCurrentUser: () => currentUser,
        onConnectivityChange: ({ online }) => {
            setConnectionStatus(online);
        },
        onStatusChange: ({ pending: p, syncing }) => {
            updateSyncStatus(p, syncing);
        },
        onSyncApplied: async (result) => {
            applyIdMappings(result.id_mappings || {});
            await loadProdutos();
            await loadListas();
            if (listaAtualId) {
                await loadLista(listaAtualId);
            }
        }
    });
}

function setConnectionStatus(online) {
    const el = document.getElementById('connectionStatus');
    if (!el) return;
    el.textContent = online ? 'Online' : 'Offline';
}

function updateSyncStatus(pending, syncing) {
    const el = document.getElementById('syncStatus');
    if (!el) return;

    if (syncing) {
        el.textContent = `Sincronizando ${pending}...`;
        return;
    }

    if (pending > 0) {
        el.textContent = `${pending} pendente(s)`;
        return;
    }

    el.textContent = 'Sem pendencias';
}

function enqueueOperation(type, payload) {
    if (!window.OfflineStore || !currentUser?.id) return;
    const op = {
        operation_id: window.OfflineStore.makeOperationId(),
        type,
        payload,
        ts: Date.now()
    };
    const queue = window.OfflineStore.pushQueue(currentUser.id, op);
    updateSyncStatus(queue.length, false);
}

function applyIdMappings(mappings) {
    if (!window.OfflineStore || !currentUser?.id) return;

    const productMap = mappings.products || {};
    const listMap = mappings.lists || {};
    if (!Object.keys(productMap).length && !Object.keys(listMap).length) return;

    produtosCache = produtosCache.map((p) => {
        const newId = productMap[p.id];
        return newId ? { ...p, id: newId } : p;
    });

    listasCache = listasCache.map((lista) => {
        const mappedListId = listMap[lista.id] || lista.id;
        return {
            ...lista,
            id: mappedListId,
            itens: (lista.itens || []).map((item) => ({
                ...item,
                produto_id: productMap[item.produto_id] || item.produto_id
            }))
        };
    });

    window.OfflineStore.saveProdutos(currentUser.id, produtosCache);
    window.OfflineStore.saveListas(currentUser.id, listasCache);

    const pending = window.OfflineStore.getQueue(currentUser.id);
    const remappedPending = pending.map((op) => {
        const payload = { ...(op.payload || {}) };
        if (payload.id && productMap[payload.id]) payload.id = productMap[payload.id];
        if (payload.produto_id && productMap[payload.produto_id]) payload.produto_id = productMap[payload.produto_id];
        if (payload.lista_id && listMap[payload.lista_id]) payload.lista_id = listMap[payload.lista_id];
        return { ...op, payload };
    });
    window.OfflineStore.replaceQueue(currentUser.id, remappedPending);

    if (listMap[listaAtualId]) {
        listaAtualId = listMap[listaAtualId];
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
        if (!response.ok) throw new Error('Falha ao carregar listas');

        const listas = await response.json();
        listasCache = listas;
        if (window.OfflineStore && currentUser?.id) {
            window.OfflineStore.saveListas(currentUser.id, listas);
        }
        renderListas(listasCache);
    } catch (error) {
        console.error('Erro ao carregar listas:', error);
        if (window.OfflineStore && currentUser?.id) {
            listasCache = window.OfflineStore.getListas(currentUser.id);
            renderListas(listasCache);
        }
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

    const tempId = window.OfflineStore ? window.OfflineStore.makeTempId('list') : `tmp_list_${Date.now()}`;
    const localLista = { id: tempId, nome, itens: [] };
    listasCache = [...listasCache, localLista];
    if (window.OfflineStore && currentUser?.id) {
        window.OfflineStore.saveListas(currentUser.id, listasCache);
    }
    closeAllModals();
    renderListas(listasCache);

    if (!navigator.onLine) {
        enqueueOperation('create_list', { temp_id: tempId, nome });
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
            await loadListas();
        } else {
            enqueueOperation('create_list', { temp_id: tempId, nome });
        }
    } catch (error) {
        console.error('Erro:', error);
        enqueueOperation('create_list', { temp_id: tempId, nome });
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
        if (!response.ok) throw new Error('Erro ao abrir lista');
        const lista = await response.json();
        const idx = listasCache.findIndex((l) => String(l.id) === String(lista.id));
        if (idx >= 0) listasCache[idx] = lista;
        else listasCache.push(lista);

        if (window.OfflineStore && currentUser?.id) {
            window.OfflineStore.saveListas(currentUser.id, listasCache);
        }
        
        document.getElementById('listaDetalheNome').textContent = lista.nome;
        renderItensLista(lista);
        switchPage('lista-detalhe');
    } catch (error) {
        console.error('Erro ao abrir lista:', error);
        const lista = listasCache.find((l) => String(l.id) === String(listaId));
        if (lista) {
            document.getElementById('listaDetalheNome').textContent = lista.nome;
            renderItensLista(lista);
            switchPage('lista-detalhe');
        }
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

function getListaLocal(listaId) {
    return listasCache.find((l) => String(l.id) === String(listaId));
}

function saveListaLocal(lista) {
    const idx = listasCache.findIndex((l) => String(l.id) === String(lista.id));
    if (idx >= 0) {
        listasCache[idx] = lista;
    } else {
        listasCache.push(lista);
    }

    if (window.OfflineStore && currentUser?.id) {
        window.OfflineStore.saveListas(currentUser.id, listasCache);
    }
}

// ========== ITENS DA LISTA ==========

async function toggleItem(listaId, produtoId) {
    const localLista = getListaLocal(listaId);
    if (!localLista) return;

    const localItem = (localLista.itens || []).find((item) => String(item.produto_id) === String(produtoId));
    if (!localItem) return;

    localItem.checked = !localItem.checked;
    saveListaLocal(localLista);
    renderItensLista(localLista);

    const payload = { lista_id: listaId, produto_id: produtoId, checked: localItem.checked };
    if (!navigator.onLine) {
        enqueueOperation('toggle_item', payload);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/listas/${listaId}/itens/${produtoId}/toggle`, {
            method: 'PUT',
            credentials: 'include'
        });

        if (response.ok) {
            const lista = await response.json();
            saveListaLocal(lista);
            renderItensLista(lista);
        } else {
            enqueueOperation('toggle_item', payload);
        }
    } catch (error) {
        console.error('Erro:', error);
        enqueueOperation('toggle_item', payload);
    }
}

async function updateQuantidade(listaId, produtoId, novaQuantidade) {
    if (!novaQuantidade || novaQuantidade <= 0) {
        alert('Quantidade deve ser maior que 0');
        loadLista(listaId);
        return;
    }

    const localLista = getListaLocal(listaId);
    const localItem = localLista?.itens?.find((item) => String(item.produto_id) === String(produtoId));
    if (localItem) {
        localItem.quantidade = parseFloat(novaQuantidade);
        saveListaLocal(localLista);
        renderItensLista(localLista);
    }

    const payload = { lista_id: listaId, produto_id: produtoId, quantidade: parseFloat(novaQuantidade) };
    if (!navigator.onLine) {
        enqueueOperation('update_item_quantidade', payload);
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
            saveListaLocal(lista);
            renderItensLista(lista);
        } else {
            enqueueOperation('update_item_quantidade', payload);
        }
    } catch (error) {
        console.error('Erro:', error);
        enqueueOperation('update_item_quantidade', payload);
    }
}

async function removeItem(listaId, produtoId) {
    if (!confirm('Remover este item?')) return;

    const localLista = getListaLocal(listaId);
    if (localLista) {
        localLista.itens = (localLista.itens || []).filter((item) => String(item.produto_id) !== String(produtoId));
        saveListaLocal(localLista);
        renderItensLista(localLista);
    }

    const payload = { lista_id: listaId, produto_id: produtoId };
    if (!navigator.onLine) {
        enqueueOperation('remove_item', payload);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/listas/${listaId}/itens/${produtoId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            const lista = await response.json();
            saveListaLocal(lista);
            renderItensLista(lista);
        } else {
            enqueueOperation('remove_item', payload);
        }
    } catch (error) {
        console.error('Erro:', error);
        enqueueOperation('remove_item', payload);
    }
}

async function loadLista(listaId) {
    try {
        const response = await fetch(`${API_BASE}/listas/${listaId}`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Erro ao carregar lista');
        const lista = await response.json();
        const idx = listasCache.findIndex((l) => String(l.id) === String(lista.id));
        if (idx >= 0) listasCache[idx] = lista;
        else listasCache.push(lista);
        if (window.OfflineStore && currentUser?.id) {
            window.OfflineStore.saveListas(currentUser.id, listasCache);
        }
        renderItensLista(lista);
    } catch (error) {
        console.error('Erro ao carregar lista:', error);
        const lista = listasCache.find((l) => String(l.id) === String(listaId));
        if (lista) renderItensLista(lista);
    }
}

// ========== PRODUTOS ==========

async function loadProdutos() {
    try {
        const response = await fetch(`${API_BASE}/produtos`, {
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        produtosCache = await response.json();
        if (window.OfflineStore && currentUser?.id) {
            window.OfflineStore.saveProdutos(currentUser.id, produtosCache);
        }
        const container = document.getElementById('produtosContainer');
        if (container) {
            renderProdutos(produtosCache);
        }
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        if (window.OfflineStore && currentUser?.id) {
            produtosCache = window.OfflineStore.getProdutos(currentUser.id);
            const container = document.getElementById('produtosContainer');
            if (container) {
                renderProdutos(produtosCache);
            }
        }
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

    const isEdit = !!produtoId;
    if (isEdit) {
        const idx = produtosCache.findIndex((p) => String(p.id) === String(produtoId));
        if (idx >= 0) {
            produtosCache[idx] = { ...produtosCache[idx], ...formData, id: produtosCache[idx].id };
        }
    } else {
        const tempId = window.OfflineStore ? window.OfflineStore.makeTempId('product') : `tmp_product_${Date.now()}`;
        produtosCache.push({ id: tempId, ...formData });
        formData.temp_id = tempId;
    }

    if (window.OfflineStore && currentUser?.id) {
        window.OfflineStore.saveProdutos(currentUser.id, produtosCache);
    }

    closeAllModals();
    renderProdutos(produtosCache);

    if (!navigator.onLine) {
        enqueueOperation(isEdit ? 'update_product' : 'create_product', isEdit ? { id: produtoId, ...formData } : formData);
        return;
    }

    try {
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${API_BASE}/produtos/${produtoId}` : `${API_BASE}/produtos`;

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            await loadProdutos();
        } else {
            enqueueOperation(isEdit ? 'update_product' : 'create_product', isEdit ? { id: produtoId, ...formData } : formData);
        }
    } catch (error) {
        console.error('Erro:', error);
        enqueueOperation(isEdit ? 'update_product' : 'create_product', isEdit ? { id: produtoId, ...formData } : formData);
    }
}

async function deleteProduto(produtoId) {
    if (!confirm('Deletar este produto?')) return;

    produtosCache = produtosCache.filter((p) => String(p.id) !== String(produtoId));
    if (window.OfflineStore && currentUser?.id) {
        window.OfflineStore.saveProdutos(currentUser.id, produtosCache);
    }
    renderProdutos(produtosCache);

    const payload = { id: produtoId };
    if (!navigator.onLine) {
        enqueueOperation('delete_product', payload);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/produtos/${produtoId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            await loadProdutos();
        } else {
            enqueueOperation('delete_product', payload);
        }
    } catch (error) {
        console.error('Erro:', error);
        enqueueOperation('delete_product', payload);
    }
}

// ========== EDIÇÃO DE ITENS DA LISTA ==========

function abrirModalEditarItem(listaId, produtoId) {
    const lista = getListaLocal(listaId);
    if (!lista) {
        alert('Lista não encontrada');
        return;
    }

    const itemData = (lista.itens || []).find((i) => String(i.produto_id) === String(produtoId));
    if (!itemData) {
        alert('Item não encontrado');
        return;
    }

    const produto = produtosCache.find((p) => String(p.id) === String(produtoId));
    if (!produto) {
        alert('Produto não encontrado');
        return;
    }

    // Preencher modal
    document.getElementById('inputEditarItemId').value = produtoId;
    document.getElementById('inputEditarItemListaId').value = listaId;
    document.getElementById('editarItemProdutoNome').textContent = produto.nome;
    document.getElementById('inputEditarItemQuantidade').value = itemData.quantidade;
    document.getElementById('inputEditarItemPreco').value = produto.preco_unidade;
    document.getElementById('inputEditarItemChecked').checked = itemData.checked;

    openModal('modalEditarItem');
}

async function salvarEdicaoItem(e) {
    e.preventDefault();

    const listaId = document.getElementById('inputEditarItemListaId').value;
    const produtoId = document.getElementById('inputEditarItemId').value;
    
    // Validação de quantidade
    const quantidadeInput = document.getElementById('inputEditarItemQuantidade').value;
    const quantidade = parseFloat(quantidadeInput);
    
    if (!quantidadeInput || isNaN(quantidade) || quantidade <= 0) {
        alert('Quantidade deve ser um número maior que 0');
        return;
    }
    
    // Validação de preço
    const precoInput = document.getElementById('inputEditarItemPreco').value;
    const preco_unidade = precoInput ? parseFloat(precoInput) : null;
    
    if (preco_unidade === null || isNaN(preco_unidade) || preco_unidade < 0) {
        alert('Preço inválido. Deve ser um número não-negativo');
        return;
    }
    
    const checkedAtual = document.getElementById('inputEditarItemChecked').checked;

    const payload = { lista_id: listaId, produto_id: produtoId, quantidade, preco_unidade };

    const localLista = getListaLocal(listaId);
    const localItem = localLista?.itens?.find((item) => String(item.produto_id) === String(produtoId));
    const localProduct = produtosCache.find((p) => String(p.id) === String(produtoId));

    if (localItem) {
        localItem.quantidade = quantidade;
        localItem.checked = checkedAtual;
        saveListaLocal(localLista);
    }
    if (localProduct) {
        localProduct.preco_unidade = preco_unidade;
        if (window.OfflineStore && currentUser?.id) {
            window.OfflineStore.saveProdutos(currentUser.id, produtosCache);
        }
    }

    closeAllModals();
    if (localLista) renderItensLista(localLista);

    if (!navigator.onLine) {
        enqueueOperation('update_item_quantidade', payload);
        enqueueOperation('toggle_item', { lista_id: listaId, produto_id: produtoId, checked: checkedAtual });
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/listas/${listaId}/itens/${produtoId}/quantidade`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ quantidade, preco_unidade })
        });

        if (!response.ok) {
            enqueueOperation('update_item_quantidade', payload);
            enqueueOperation('toggle_item', { lista_id: listaId, produto_id: produtoId, checked: checkedAtual });
            return;
        }

        const lista = await response.json();
        saveListaLocal(lista);

        const serverItem = lista.itens.find((i) => String(i.produto_id) === String(produtoId));
        if (serverItem && serverItem.checked !== checkedAtual) {
            await toggleItem(listaId, produtoId);
        }

        await loadProdutos();
        renderItensLista(lista);
    } catch (error) {
        console.error('[ERROR_SAVE_ITEM] Erro na requisição:', error);
        enqueueOperation('update_item_quantidade', payload);
        enqueueOperation('toggle_item', { lista_id: listaId, produto_id: produtoId, checked: checkedAtual });
    }
}

async function deletarItemModal() {
    const listaId = document.getElementById('inputEditarItemListaId').value;
    const produtoId = document.getElementById('inputEditarItemId').value;

    if (!confirm('Deletar este item?')) return;

    const localLista = getListaLocal(listaId);
    if (localLista) {
        localLista.itens = (localLista.itens || []).filter((i) => String(i.produto_id) !== String(produtoId));
        saveListaLocal(localLista);
    }

    closeAllModals();
    if (localLista) renderItensLista(localLista);

    const payload = { lista_id: listaId, produto_id: produtoId };
    if (!navigator.onLine) {
        enqueueOperation('remove_item', payload);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/listas/${listaId}/itens/${produtoId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            await loadLista(listaId);
        } else {
            enqueueOperation('remove_item', payload);
        }
    } catch (error) {
        console.error('Erro:', error);
        enqueueOperation('remove_item', payload);
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
    const precoBruto = document.getElementById('inputProdutoRapidoPreco').value;
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

    const tempId = window.OfflineStore ? window.OfflineStore.makeTempId('product') : `tmp_product_${Date.now()}`;
    const novoProdutoLocal = { id: tempId, ...formData };
    produtosCache.push(novoProdutoLocal);

    const lista = getListaLocal(listaAtualId);
    const quantidadeItem = parseFloat(document.getElementById('inputQuantidadeItem').value) || formData.quantidade;
    if (lista) {
        lista.itens = lista.itens || [];
        lista.itens.push({ produto_id: tempId, quantidade: quantidadeItem, checked: false });
        saveListaLocal(lista);
    }
    if (window.OfflineStore && currentUser?.id) {
        window.OfflineStore.saveProdutos(currentUser.id, produtosCache);
    }

    closeAllModals();
    if (lista) renderItensLista(lista);

    if (!navigator.onLine) {
        enqueueOperation('create_product', { ...formData, temp_id: tempId });
        enqueueOperation('add_item', { lista_id: listaAtualId, produto_id: tempId, quantidade: quantidadeItem });
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/produtos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            enqueueOperation('create_product', { ...formData, temp_id: tempId });
            enqueueOperation('add_item', { lista_id: listaAtualId, produto_id: tempId, quantidade: quantidadeItem });
            return;
        }

        const novoProduto = await response.json();
        await fetch(`${API_BASE}/listas/${listaAtualId}/itens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ produto_id: novoProduto.id, quantidade: quantidadeItem })
        });

        await loadProdutos();
        await loadLista(listaAtualId);
    } catch (error) {
        console.error('Erro:', error);
        enqueueOperation('create_product', { ...formData, temp_id: tempId });
        enqueueOperation('add_item', { lista_id: listaAtualId, produto_id: tempId, quantidade: quantidadeItem });
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

    const localLista = getListaLocal(listaAtualId);
    if (localLista) {
        localLista.itens = localLista.itens || [];
        const existing = localLista.itens.find((i) => String(i.produto_id) === String(produtoId));
        if (existing) {
            existing.quantidade = quantidade;
            existing.checked = false;
        } else {
            localLista.itens.push({ produto_id: produtoId, quantidade, checked: false });
        }
        saveListaLocal(localLista);
    }

    closeAllModals();
    if (localLista) renderItensLista(localLista);

    const payload = { lista_id: listaAtualId, produto_id: produtoId, quantidade };
    if (!navigator.onLine) {
        enqueueOperation('add_item', payload);
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
            await loadLista(listaAtualId);
        } else {
            console.error('Erro ao adicionar:', data);
            enqueueOperation('add_item', payload);
        }
    } catch (error) {
        console.error('Erro:', error);
        enqueueOperation('add_item', payload);
    }
}

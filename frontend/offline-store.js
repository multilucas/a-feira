(function () {
    const OFFLINE_AUTH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

    function userKey(prefix, userId) {
        return `${prefix}:${userId}`;
    }

    function readJson(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw);
        } catch (error) {
            console.error('Erro ao ler storage', key, error);
            return fallback;
        }
    }

    function writeJson(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Erro ao salvar storage', key, error);
        }
    }

    function nowIso() {
        return new Date().toISOString();
    }

    function makeOperationId() {
        return `op_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    }

    function makeTempId(prefix) {
        return `tmp_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    }

    function saveAuthSession(user) {
        if (!user || !user.id) return;
        const payload = {
            user,
            savedAt: Date.now(),
            expiresAt: Date.now() + OFFLINE_AUTH_TTL_MS
        };
        writeJson(userKey('offline_auth', user.id), payload);
        localStorage.setItem('last_user_id', String(user.id));
    }

    function getLastAuthSession() {
        const userId = localStorage.getItem('last_user_id');
        if (!userId) return null;

        const session = readJson(userKey('offline_auth', userId), null);
        if (!session) return null;

        if (!session.expiresAt || Date.now() > session.expiresAt) {
            localStorage.removeItem(userKey('offline_auth', userId));
            return null;
        }

        return session.user || null;
    }

    function clearAuthSession(userId) {
        const uid = userId || localStorage.getItem('last_user_id');
        if (uid) {
            localStorage.removeItem(userKey('offline_auth', uid));
        }
    }

    function getProdutos(userId) {
        return readJson(userKey('offline_produtos', userId), []);
    }

    function saveProdutos(userId, produtos) {
        writeJson(userKey('offline_produtos', userId), produtos || []);
    }

    function getListas(userId) {
        return readJson(userKey('offline_listas', userId), []);
    }

    function saveListas(userId, listas) {
        writeJson(userKey('offline_listas', userId), listas || []);
    }

    function getListaById(userId, listaId) {
        const listas = getListas(userId);
        return listas.find((l) => String(l.id) === String(listaId)) || null;
    }

    function upsertLista(userId, lista) {
        const listas = getListas(userId);
        const idx = listas.findIndex((l) => String(l.id) === String(lista.id));
        if (idx >= 0) {
            listas[idx] = lista;
        } else {
            listas.push(lista);
        }
        saveListas(userId, listas);
    }

    function getQueue(userId) {
        return readJson(userKey('offline_queue', userId), []);
    }

    function pushQueue(userId, op) {
        const queue = getQueue(userId);
        queue.push(op);
        writeJson(userKey('offline_queue', userId), queue);
        return queue;
    }

    function replaceQueue(userId, queue) {
        writeJson(userKey('offline_queue', userId), queue || []);
    }

    function removeQueueOps(userId, operationIds) {
        const pending = getQueue(userId);
        const opSet = new Set(operationIds || []);
        const next = pending.filter((op) => !opSet.has(op.operation_id));
        replaceQueue(userId, next);
        return next;
    }

    function setSyncMeta(userId, payload) {
        writeJson(userKey('offline_sync_meta', userId), {
            ...(readJson(userKey('offline_sync_meta', userId), {}) || {}),
            ...(payload || {}),
            updatedAt: nowIso()
        });
    }

    function getSyncMeta(userId) {
        return readJson(userKey('offline_sync_meta', userId), {
            pendingCount: 0,
            lastSyncedAt: null,
            updatedAt: null
        });
    }

    window.OfflineStore = {
        makeOperationId,
        makeTempId,
        saveAuthSession,
        getLastAuthSession,
        clearAuthSession,
        getProdutos,
        saveProdutos,
        getListas,
        saveListas,
        getListaById,
        upsertLista,
        getQueue,
        pushQueue,
        replaceQueue,
        removeQueueOps,
        setSyncMeta,
        getSyncMeta
    };
})();

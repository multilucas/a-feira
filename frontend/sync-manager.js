(function () {
    async function syncNow(options) {
        const {
            apiBase,
            getCurrentUser,
            onStatusChange,
            onSyncApplied
        } = options;

        const user = getCurrentUser();
        if (!user || !user.id) return { ok: false, reason: 'no-user' };
        if (!navigator.onLine) return { ok: false, reason: 'offline' };

        const queue = window.OfflineStore.getQueue(user.id);
        if (!queue.length) {
            onStatusChange({ pending: 0, syncing: false });
            return { ok: true, reason: 'empty' };
        }

        onStatusChange({ pending: queue.length, syncing: true });

        try {
            const response = await fetch(`${apiBase}/sync/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ operations: queue })
            });

            if (!response.ok) {
                onStatusChange({ pending: queue.length, syncing: false });
                return { ok: false, reason: 'http-error' };
            }

            const result = await response.json();
            const successfulIds = (result.successful || []).map((op) => op.operation_id);
            const remaining = window.OfflineStore.removeQueueOps(user.id, successfulIds);

            window.OfflineStore.setSyncMeta(user.id, {
                pendingCount: remaining.length,
                lastSyncedAt: result.server_timestamp || new Date().toISOString()
            });

            if (typeof onSyncApplied === 'function') {
                onSyncApplied(result);
            }

            onStatusChange({ pending: remaining.length, syncing: false });
            return { ok: true, result };
        } catch (error) {
            console.error('Erro ao sincronizar fila offline', error);
            onStatusChange({ pending: queue.length, syncing: false });
            return { ok: false, reason: 'network-error' };
        }
    }

    function init(options) {
        const onOnline = async () => {
            if (typeof options.onConnectivityChange === 'function') {
                options.onConnectivityChange({ online: true });
            }
            await syncNow(options);
        };

        const onOffline = () => {
            if (typeof options.onConnectivityChange === 'function') {
                options.onConnectivityChange({ online: false });
            }
        };

        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);

        if (navigator.onLine) {
            setTimeout(() => {
                syncNow(options);
            }, 300);
        }

        return {
            syncNow: () => syncNow(options)
        };
    }

    window.SyncManager = {
        init,
        syncNow
    };
})();

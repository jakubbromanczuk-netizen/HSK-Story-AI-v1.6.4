// API backendu lokalnego - metody do zapisu wag, historii i TTS (krótkie)
(function(){
    const cfg = window.APP_CONFIG || {};
    const defaultFetch = window.fetch.bind(window);
    const baseUrl = (window.APP_CFG && window.APP_CFG.BACKEND_URL) || cfg.BACKEND_URL || (typeof location !== 'undefined' ? location.origin : 'http://localhost:3000');

    async function getHistory(){
        try {
            const resp = await defaultFetch(baseUrl + '/get-history');
            if (!resp.ok) {
                console.warn('getHistory HTTP', resp.status);
                return null;
            }
            return await resp.json();
        } catch (e) {
            console.warn('getHistory error', e.message || e);
            return null;
        }
    }

    async function appendHistory(item){
        try {
            const resp = await defaultFetch(baseUrl + '/append-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            if (!resp.ok) {
                console.warn('appendHistory HTTP', resp.status);
                return null;
            }
            return await resp.json();
        } catch (e) {
            console.warn('appendHistory error', e.message || e);
            return null;
        }
    }

    async function saveWeights(weights){
        try {
            const resp = await defaultFetch(baseUrl + '/save-weights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(weights)
            });
            if (!resp.ok) {
                console.warn('saveWeights HTTP', resp.status);
                return null;
            }
            return await resp.json();
        } catch (e) {
            console.warn('saveWeights error', e.message || e);
            return null;
        }
    }

    async function appendHanziText(payload){
        try {
            const resp = await defaultFetch(baseUrl + '/append-hanzi-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!resp.ok) {
                console.warn('appendHanziText HTTP', resp.status);
                return null;
            }
            return await resp.json();
        } catch (e) {
            console.warn('appendHanziText error', e.message || e);
            return null;
        }
    }

    async function localTtsFetch(url, options){
        try {
            const resp = await defaultFetch(url, options);
            if (!resp.ok) {
                console.warn('localTtsFetch HTTP', resp.status);
                return null;
            }
            return resp;
        } catch (e) {
            console.warn('localTtsFetch error', e.message || e);
            return null;
        }
    }

    window.BACKEND_API = {
        getHistory,
        appendHistory,
        saveWeights,
        appendHanziText,
        localTtsFetch
    };
})();

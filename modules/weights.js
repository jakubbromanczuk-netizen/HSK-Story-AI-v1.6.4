(function(){
    // Zarządzanie wagami Hanzi (wczytywanie/zapisy)
    let hanziWeights = {};
    let hanziList = [];

    function parseWeightsCsv(text) {
        hanziWeights = {};
        hanziList = [];
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
            if (line.startsWith('#')) continue;
            const sep = line.includes(',') ? ',' : (line.includes(';') ? ';' : ',');
            const parts = line.split(sep).map(p => p.trim());
            if (parts.length >= 1) {
                const w = parts[0];
                const weight = parseFloat(parts[1] || '0') || 0;
                if (w) {
                    hanziWeights[w] = weight;
                    hanziList.push(w);
                }
            }
        }
        saveWeightsToLocalStorage();
    }

    async function loadWeights() {
        try {
            const resp = await fetch('./HSK_vocab_val.csv');
            if (resp.ok) {
                const text = await resp.text();
                parseWeightsCsv(text);
                console.log('Hanzi weights loaded from HSK_vocab_val.csv', Object.keys(hanziWeights).length);
                return;
            }
        } catch (e) {
            console.warn('Fetching HSK_vocab_val.csv failed, will try localStorage');
        }

        const saved = localStorage.getItem('hsk_hanzi_weights_v1');
        if (saved) {
            try {
                hanziWeights = JSON.parse(saved);
                hanziList = Object.keys(hanziWeights);
                console.log('Hanzi weights loaded from localStorage', hanziList.length);
            } catch (err) {
                console.warn('Failed parsing saved weights', err);
            }
        } else {
            console.log('No hanzi weights available yet.');
        }
    }

    function pickBottomPercent(percent) {
        const keys = Object.keys(hanziWeights);
        if (keys.length === 0) return [];
        const n = keys.length;
        const target = Math.max(1, Math.floor(n * percent / 100));
        const arr = keys.map(k => ({ w: k, v: hanziWeights[k] })).sort((a,b) => a.v - b.v);
        if (target >= n) return arr.map(x => x.w);
        const cutoff = arr[target - 1].v;
        const lower = arr.filter(x => x.v < cutoff).map(x => x.w);
        const equal = arr.filter(x => x.v === cutoff).map(x => x.w);
        const remaining = target - lower.length;
        if (remaining <= 0) return lower;
        if (equal.length <= remaining) return lower.concat(equal);
        const sampled = [];
        const pool = [...equal];
        while (sampled.length < remaining && pool.length > 0) {
            const idx = Math.floor(Math.random() * pool.length);
            sampled.push(pool.splice(idx,1)[0]);
        }
        return lower.concat(sampled);
    }

    function pickBottomCount(count) {
        const keys = Object.keys(hanziWeights);
        if (!keys || keys.length === 0) return [];
        const n = keys.length;
        if (count >= n) return keys.slice();
        const arr = keys.map(k => ({ w: k, v: Number(hanziWeights[k] || 0) })).sort((a,b) => a.v - b.v);
        const cutoffVal = arr[count - 1].v;
        const lower = arr.filter(x => x.v < cutoffVal).map(x => x.w);
        const equal = arr.filter(x => x.v === cutoffVal).map(x => x.w);
        const remaining = count - lower.length;
        if (remaining <= 0) return lower.slice(0, count);
        if (equal.length <= remaining) return lower.concat(equal);
        const sampled = [];
        const pool = [...equal];
        while (sampled.length < remaining && pool.length > 0) {
            const idx = Math.floor(Math.random() * pool.length);
            sampled.push(pool.splice(idx, 1)[0]);
        }
        return lower.concat(sampled);
    }

    function updateHanziWeights(usedSet) {
        try { console.log('updateHanziWeights called — used count:', usedSet ? usedSet.size : 0); const sample = Array.from(usedSet || []).slice(0,5); if (sample.length) console.log('Sample used hanzi:', sample.join(' ')); } catch(e){}
        if (Object.keys(hanziWeights).length === 0) {
            console.log('hanziWeights empty — seeding weights for used words');
            for (const w of usedSet) hanziWeights[w] = 0;
        }
        for (const k of Object.keys(hanziWeights)) {
            if (usedSet.has(k)) hanziWeights[k] = (hanziWeights[k] || 0) + 1.0;
            else hanziWeights[k] = Math.max(0, (hanziWeights[k] || 0) - 0.1);
        }
        saveWeightsToLocalStorage();
    }

    function saveWeightsToLocalStorage() {
        try {
            localStorage.setItem('hsk_hanzi_weights_v1', JSON.stringify(hanziWeights));
            console.log('Saved hanziWeights to localStorage (count):', Object.keys(hanziWeights).length);
            try { pushWeightsToServer(); } catch (e) { console.warn('pushWeightsToServer error', e); }
        } catch (e) { console.warn('Failed to save hanzi weights to localStorage', e); }
    }

    function pushWeightsToServer() {
        try { console.log('Pushing weights to local server:', hanziWeights); } catch(e) { console.log('Pushing weights (unable to stringify)'); }
        return window.BACKEND_API.saveWeights({ weights: hanziWeights }).then(resp => {
            if (!resp || (resp.status && !resp.ok)) console.warn('Failed to push weights to server', resp && resp.status);
            return resp;
        }).catch(err => { console.warn('Could not reach local save server:', err.message); throw err; });
    }

    function downloadWeightsCsv() {
        const lines = ['hanzi,weight'];
        for (const k of Object.keys(hanziWeights)) lines.push(`${k},${hanziWeights[k]}`);
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'HSK_vocab_val_updated.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    window.WEIGHTS = {
        hanziWeights,
        hanziList,
        parseWeightsCsv,
        loadWeights,
        pickBottomPercent,
        pickBottomCount,
        updateHanziWeights,
        saveWeightsToLocalStorage,
        pushWeightsToServer,
        downloadWeightsCsv
    };

    try {
        window.debugPushWeights = function() {
            console.log('debugPushWeights invoked — will POST to local server.');
            return pushWeightsToServer().then(r => console.log('debugPushWeights: done', r && r.status)).catch(e => console.warn('debugPushWeights failed', e));
        };
    } catch (e) {}

})();

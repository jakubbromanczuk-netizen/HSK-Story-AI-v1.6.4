// Pokazywanie kolejności kreślenia (HanziWriter) - funkcje pomocnicze
(() => {
    const DOM = () => window.DOM || {};
    const strokeObservers = [];
    const STROKE_OVERRIDE_PX = 36.0;

    function closeStrokeModal() {
        const d = DOM();
        const strokeModal = d.strokeModal || document.getElementById('stroke-modal');
        const strokeWriters = d.strokeWriters || document.getElementById('stroke-writers');
        if (strokeModal) strokeModal.style.display = 'none';
        if (strokeWriters) strokeWriters.innerHTML = '';
        try { strokeObservers.forEach(o => { try { o.disconnect(); } catch(e){} }); } catch(e){}
        strokeObservers.length = 0;
    }

    function isOnlyHanzi2(s) {
        if (!s) return false;
        const cleaned = s.replace(/\s+/g, '');
        try { return (/^\p{sc=Han}+$/u.test(cleaned)); } catch (e) { return /^[\u4E00-\u9FFF]+$/.test(cleaned); }
    }

    async function showStrokeOrderFor(hanziWord) {
        if (!hanziWord) return;
        const cleanedWord = hanziWord.replace(/\s+/g, '');
        if (!cleanedWord) return;
        if (!isOnlyHanzi2(cleanedWord)) {
            const d = DOM(); if (d.strokeError) { d.strokeError.textContent = 'Proszę wpisać tylko chińskie znaki (Hanzi).'; d.strokeError.style.display = 'block'; }
            return;
        }
        const d = DOM(); if (d.strokeError) { d.strokeError.textContent = ''; d.strokeError.style.display = 'none'; }
        if (!window.HanziWriter) { alert('HanziWriter nie jest załadowany.'); return; }
        const strokeWriters = d.strokeWriters || document.getElementById('stroke-writers');
        if (!strokeWriters) return;
        strokeWriters.innerHTML = '';
        const chars = Array.from(cleanedWord);
        if (d.strokeInput) d.strokeInput.value = cleanedWord;
        const writers = [];
        for (let i = 0; i < chars.length; i++) {
            const ch = chars[i];
            const box = document.createElement('div'); box.className = 'writer-box';
            const id = `hw-${Date.now()}-${i}`;
            const inner = document.createElement('div'); inner.id = id; inner.style.width = '120px'; inner.style.height = '120px'; box.appendChild(inner);
            strokeWriters.appendChild(box);
            try {
                const writer = window.HanziWriter.create(id, ch, {
                    width: 120, height: 120, padding: 5,
                    strokeColor: '#ccc', outlineColor: '#444', radicalColor: '#8b5cf6',
                    delayBetweenStrokes: 300, showOutline: true, strokeWidth: STROKE_OVERRIDE_PX, outlineWidth: 28.8
                });
                writers.push(writer);
                try {
                    const svgContainer = document.getElementById(id);
                    const applyWidth = () => {
                        if (!svgContainer) return;
                        const svg = svgContainer.querySelector('svg'); if (!svg) return;
                        const els = svg.querySelectorAll('path, line, polyline');
                        els.forEach(el => { try { el.setAttribute('stroke-width', STROKE_OVERRIDE_PX); el.style.strokeWidth = STROKE_OVERRIDE_PX + 'px'; } catch(e){} });
                    };
                    requestAnimationFrame(() => { requestAnimationFrame(applyWidth); });
                    const mo = new MutationObserver(() => applyWidth());
                    if (svgContainer) mo.observe(svgContainer, { childList: true, subtree: true });
                    strokeObservers.push(mo);
                } catch (e) { console.warn('Failed to enforce stroke width', e); }
            } catch (e) { console.warn('HanziWriter create failed for', ch, e); }
        }
        const strokeModal = d.strokeModal || document.getElementById('stroke-modal');
        if (strokeModal) strokeModal.style.display = 'flex';
        await new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
        for (const w of writers) { try { await w.animateCharacter({ strokeAnimationSpeed: 1.2 }); } catch (e) {} }
    }

    function setupListeners() {
        const d = DOM();
        try { const closeStrokeModalBtn = d.closeStrokeModal || document.getElementById('close-stroke-modal'); if (closeStrokeModalBtn) closeStrokeModalBtn.addEventListener('click', closeStrokeModal); } catch(e){}
        try {
            const strokeApplyBtn = d.strokeApplyBtn || document.getElementById('stroke-apply-btn');
            const strokeInput = d.strokeInput || document.getElementById('stroke-input');
            if (strokeApplyBtn && strokeInput) {
                strokeApplyBtn.addEventListener('click', (ev) => { ev.preventDefault(); const v = (strokeInput.value || '').trim(); if (v) showStrokeOrderFor(v); });
                strokeInput.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); const v = (strokeInput.value || '').trim(); if (v) showStrokeOrderFor(v); } });
            }
        } catch(e){}
        try {
            const dictList = d.dictionaryList || document.getElementById('dictionary-list');
            if (dictList) dictList.addEventListener('click', (ev) => {
                const el = ev.target.closest && ev.target.closest('.dict-char');
                if (!el) return;
                const word = el.dataset && el.dataset.word ? el.dataset.word : el.textContent.trim();
                if (!word) return; showStrokeOrderFor(word);
            });
        } catch(e){}
    }

    // initialize listeners on load
    try { setupListeners(); } catch(e){}

    window.STROKES = {
        closeStrokeModal,
        isOnlyHanzi2,
        showStrokeOrderFor
    };

})();

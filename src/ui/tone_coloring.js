// Kolorowanie tonów - narzędzia i UI dla wyświetlania tonów pinyin
(function(){
    const toneMap = {
        'ā':1,'ē':1,'ī':1,'ō':1,'ū':1,'ǖ':1,
        'Á':2,'á':2,'é':2,'í':2,'ó':2,'ú':2,'ǘ':2,
        'ǎ':3,'ě':3,'ǐ':3,'ǒ':3,'ǔ':3,'ǚ':3,
        'à':4,'è':4,'ì':4,'ò':4,'ù':4,'ǜ':4
    };

    const toneColor = {
        1: '#6ea8ff',
        2: '#6ecf8c',
        3: '#f0a56a',
        4: '#e07a7a'
    };

    let enabled = false;

    function loadSaved() {
        try { const saved = localStorage.getItem('color_tones') || '0'; enabled = saved === '1' || saved === 'true'; } catch(e){}
    }

    function setEnabled(v) { enabled = !!v; try { localStorage.setItem('color_tones', enabled ? '1' : '0'); } catch(e){} }
    function isEnabled() { return !!enabled; }

    function getToneFromSyll(syll) {
        if (!syll) return 0;
        for (const ch of syll) if (toneMap[ch]) return toneMap[ch];
        return 0;
    }

    function splitPinyinSyllables(pinyin, targetCount) {
        if (!pinyin) return [];
        let parts = pinyin.split(/[\s'·-]+/).filter(Boolean);
        if (parts.length >= targetCount && targetCount > 0) return parts;
        const isToneChar = (ch) => toneMap.hasOwnProperty(ch);
        const lettersRe = /[A-Za-züǖǘǚǜÀ-ž]/;
        const boundaries = [];
        for (let i = 0; i < pinyin.length; i++) if (isToneChar(pinyin[i])) boundaries.push(i);
        if (boundaries.length > 0) {
            const out = []; let last = 0;
            for (let b = 0; b < boundaries.length; b++) {
                const idx = boundaries[b]; let j = idx + 1;
                while (j < pinyin.length && !isToneChar(pinyin[j]) && lettersRe.test(pinyin[j])) j++;
                out.push(pinyin.slice(last, j).trim()); last = j;
            }
            if (last < pinyin.length) out.push(pinyin.slice(last).trim());
            parts = out.filter(Boolean);
            if (parts.length > 0 && (parts.length === targetCount || targetCount === 0)) return parts;
        }
        if (targetCount && targetCount > 1) {
            const cleaned = pinyin.replace(/\s+/g,'');
            const approx = Math.max(1, Math.floor(cleaned.length / targetCount));
            const res = [];
            for (let i = 0; i < targetCount; i++) {
                const start = i * approx; const end = (i === targetCount - 1) ? cleaned.length : (start + approx);
                res.push(cleaned.slice(start, end));
            }
            return res.filter(Boolean);
        }
        const matches = pinyin.match(/[A-Za-züǖǘǚǜÀ-ž]+/g);
        return matches || [pinyin];
    }

    function renderChineseText(segments, outputElement, pinyinOutput) {
        // segments: array of {hanzi, pinyin}
        try { window.lastRenderedSegments = segments.slice(); } catch(e){}
        let segmentedHtml = '';
        segments.forEach(segment => {
            if (segment.hanzi && segment.pinyin) {
                const hanzi = segment.hanzi;
                const sylls = splitPinyinSyllables(segment.pinyin, hanzi.length);
                if (enabled && sylls.length > 0 && sylls.length === hanzi.length) {
                    for (let i = 0; i < hanzi.length; i++) {
                        const ch = hanzi[i]; const tone = getToneFromSyll(sylls[i]); const color = toneColor[tone];
                        if (color) segmentedHtml += `<span class="hanzi-word" data-hanzi="${ch}" data-word-hanzi="${hanzi}" data-pinyin-word="${sylls[i]}" data-pinyin-full="${segment.pinyin}" style="color:${color}">${ch}</span>`;
                        else segmentedHtml += `<span class="hanzi-word" data-hanzi="${ch}" data-word-hanzi="${hanzi}" data-pinyin-word="${sylls[i]}" data-pinyin-full="${segment.pinyin}">${ch}</span>`;
                    }
                } else if (enabled && sylls.length > 0 && hanzi.length > 1 && sylls.length > 1) {
                    const n = Math.min(hanzi.length, sylls.length);
                    for (let i = 0; i < n; i++) {
                        const ch = hanzi[i]; const tone = getToneFromSyll(sylls[i]); const color = toneColor[tone];
                        if (color) segmentedHtml += `<span class="hanzi-word" data-hanzi="${ch}" data-word-hanzi="${hanzi}" data-pinyin-word="${sylls[i]}" data-pinyin-full="${segment.pinyin}" style="color:${color}">${ch}</span>`;
                        else segmentedHtml += `<span class="hanzi-word" data-hanzi="${ch}" data-word-hanzi="${hanzi}" data-pinyin-word="${sylls[i]}" data-pinyin-full="${segment.pinyin}">${ch}</span>`;
                    }
                    if (hanzi.length > n) for (let j = n; j < hanzi.length; j++) segmentedHtml += `<span class="hanzi-word" data-hanzi="${hanzi[j]}" data-word-hanzi="${hanzi}" data-pinyin-full="${segment.pinyin}">${hanzi[j]}</span>`;
                } else {
                    segmentedHtml += `<span class="hanzi-word" data-hanzi="${segment.hanzi}" data-pinyin-word="${segment.pinyin}" data-pinyin-full="${segment.pinyin}">${segment.hanzi}</span>`;
                }
            } else {
                segmentedHtml += segment.hanzi || '';
            }
        });

        if (outputElement) outputElement.innerHTML = segmentedHtml;

        try {
            if (pinyinOutput) {
                const parts = segments.map(s => s.pinyin ? s.pinyin : (s.hanzi || ''));
                const rebuilt = parts.join(' ').replace(/\s+/g, ' ').trim();
                pinyinOutput.textContent = rebuilt;
            }
        } catch(e) { console.warn('TONE_COLOR: failed to rebuild pinyinOutput', e); }
    }

    function setupGraphicSettingsUI(generatorSettingsContainer, settingsModalOverlay, chineseOutput) {
        try {
            const parent = generatorSettingsContainer || settingsModalOverlay;
            if (!parent) return;

            const gBtn = document.createElement('button');
            gBtn.type = 'button'; gBtn.id = 'graphic-settings-btn'; gBtn.textContent = 'Ustawienia graficzne';
            gBtn.style.marginLeft = '8px'; gBtn.style.background = '#556'; gBtn.style.color = '#fff'; gBtn.style.border = 'none';
            gBtn.style.padding = '6px 8px'; gBtn.style.borderRadius = '6px'; gBtn.style.cursor = 'pointer';

            const gPanel = document.createElement('div'); gPanel.id = 'graphic-settings-panel'; gPanel.style.display = 'none';
            gPanel.style.marginTop = '8px'; gPanel.style.padding = '8px'; gPanel.style.border = '1px solid #333';
            gPanel.style.background = '#0b0b0b'; gPanel.style.borderRadius = '6px';

            const toneLabel = document.createElement('label'); toneLabel.textContent = 'Kolorowanie tonów: '; toneLabel.style.color = '#ddd'; toneLabel.style.display = 'inline-block';
            const toneToggle = document.createElement('input'); toneToggle.type = 'checkbox'; toneToggle.id = 'tone-toggle'; toneToggle.style.marginLeft = '8px';

            loadSaved(); toneToggle.checked = enabled;
            toneToggle.addEventListener('change', () => { setEnabled(!!toneToggle.checked); try { if (window.lastRenderedSegments && window.lastRenderedSegments.length) renderChineseText(window.lastRenderedSegments, chineseOutput, window.DOM && window.DOM.pinyinOutput); } catch(e){} });

            gPanel.appendChild(toneLabel); gPanel.appendChild(toneToggle);
            parent.appendChild(gBtn); parent.appendChild(gPanel);
            gBtn.addEventListener('click', () => { gPanel.style.display = gPanel.style.display === 'none' ? 'block' : 'none'; });
        } catch(e) { console.warn('setupGraphicSettingsUI error', e); }
    }

    // public API
    window.TONE_COLOR = window.TONE_COLOR || {};
    window.TONE_COLOR.isEnabled = isEnabled;
    window.TONE_COLOR.setEnabled = setEnabled;
    window.TONE_COLOR.renderChineseText = renderChineseText;
    window.TONE_COLOR.setupGraphicSettingsUI = setupGraphicSettingsUI;

    // initialize from storage
    loadSaved();
})();

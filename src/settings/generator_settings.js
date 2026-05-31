// Ustawienia panelu bocznego słownictwa
(function(){
    function init(generatorSettingsContainer, settingsModalOverlay) {
        try {
            const parent = generatorSettingsContainer || settingsModalOverlay;
            if (!parent) return;

            const addBtn = document.createElement('button');
            addBtn.type = 'button'; addBtn.id = 'additional-vocab-btn'; addBtn.textContent = 'Dodatkowe słownictwo';
            addBtn.style.marginLeft = '8px'; addBtn.style.background = '#556'; addBtn.style.color = '#fff'; addBtn.style.border = 'none';
            addBtn.style.padding = '6px 8px'; addBtn.style.borderRadius = '6px'; addBtn.style.cursor = 'pointer';

            const panel = document.createElement('div'); panel.id = 'additional-vocab-panel'; panel.style.display = 'none';
            panel.style.marginTop = '8px'; panel.style.padding = '8px'; panel.style.border = '1px solid #333'; panel.style.background = '#0b0b0b'; panel.style.borderRadius = '6px';

            const ta = document.createElement('textarea'); ta.id = 'additional-vocab-textarea';
            ta.placeholder = 'Wklej słownictwo, np:\n葡萄\tpútáo, winogrona\n艺术\tyìshù, sztuka';
            ta.style.width = '100%'; ta.style.minHeight = '80px'; ta.style.background = '#071021'; ta.style.color = '#ddd'; ta.style.border = '1px solid #333'; ta.style.padding = '6px'; ta.style.borderRadius = '4px';

            const saveBtn = document.createElement('button'); saveBtn.type='button'; saveBtn.id='additional-vocab-save'; saveBtn.textContent='Zapisz';
            saveBtn.style.marginTop = '8px'; saveBtn.style.background='rgb(144, 41, 228)'; saveBtn.style.color='rgb(225,225,225)'; saveBtn.style.border='none'; saveBtn.style.padding='6px 8px'; saveBtn.style.borderRadius='6px'; saveBtn.style.cursor='pointer';

            const info = document.createElement('div'); info.style.color='#999'; info.style.fontSize='12px'; info.style.marginTop='6px'; info.textContent = 'Program wyciągnie tylko znaki Hanzi z każdej linii i użyje ich jako potencjalnych słów.';

            panel.appendChild(ta); panel.appendChild(saveBtn); panel.appendChild(info);
            parent.appendChild(addBtn); parent.appendChild(panel);

            try { const saved = localStorage.getItem('additional_vocab_raw') || ''; ta.value = saved; } catch(e){}

            addBtn.addEventListener('click', () => { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; });

            saveBtn.addEventListener('click', () => {
                try { localStorage.setItem('additional_vocab_raw', ta.value || ''); saveBtn.textContent = 'Zapisano'; setTimeout(() => saveBtn.textContent = 'Zapisz', 1200); } catch(e){ console.warn('Failed to save additional vocab', e); }
            });
        } catch(e) { console.warn('generator_settings.init error', e); }
    }

    function getAdditionalVocabList() {
        try {
            const raw = localStorage.getItem('additional_vocab_raw') || '';
            const lines = raw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
            const out = [];
            for (const line of lines) {
                const m = line.match(/\p{sc=Han}+/gu);
                if (m && m.length > 0) out.push(m[0]);
            }
            return Array.from(new Set(out));
        } catch (e) { console.warn('getAdditionalVocabList error', e); return []; }
    }

    window.SETTINGS_GENERATOR = window.SETTINGS_GENERATOR || {};
    window.SETTINGS_GENERATOR.init = init;
    window.SETTINGS_GENERATOR.getAdditionalVocabList = getAdditionalVocabList;
})();

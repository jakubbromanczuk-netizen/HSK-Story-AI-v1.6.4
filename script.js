// Główny koordynator aplikacji - deleguje pracę do modułów (krótko)
// Moduły: APP_CFG, DOM_INIT, TRANSLATION, WEIGHTS, TTS, STROKES, UI_PANELS, AI_GENERATOR, SETTINGS_*

// Minimal global state (kept for compatibility)
window.currentGeneratedChineseText = window.currentGeneratedChineseText || '';
window.globalDictionary = window.globalDictionary || {};
window.favoritedWords = window.favoritedWords || new Set();

document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM references
    try { if (window.DOM_INIT && typeof window.DOM_INIT.init === 'function') window.DOM_INIT.init(); } catch (e) { console.warn('DOM_INIT.init error', e); }
    const DOM = window.DOM || {};

    // Initialize settings panels
    try { if (window.SETTINGS_GENERATOR && typeof window.SETTINGS_GENERATOR.init === 'function') window.SETTINGS_GENERATOR.init(DOM.generatorSettingsContainer, DOM.settingsModalOverlay); } catch(e){ }
    try { if (window.SETTINGS_TTS && typeof window.SETTINGS_TTS.init === 'function') window.SETTINGS_TTS.init(DOM.generatorSettingsContainer, DOM.settingsModalOverlay); } catch(e){}
    try { if (window.SETTINGS_TTS && typeof window.SETTINGS_TTS.initPlaybackControls === 'function') window.SETTINGS_TTS.initPlaybackControls(); } catch(e){}

    // Load weights
    try { if (window.WEIGHTS && typeof window.WEIGHTS.loadWeights === 'function') window.WEIGHTS.loadWeights(); } catch(e){}

    // Wire main buttons
    try {
        if (DOM.generateButton) DOM.generateButton.addEventListener('click', () => { try { if (window.AI_GENERATOR && typeof window.AI_GENERATOR.generateText === 'function') return window.AI_GENERATOR.generateText(); } catch(e){} });
    } catch(e) { console.warn('generateButton wiring error', e); }

    // Chinese output click -> hanzi click handler (dictionary)
    try {
        if (DOM.chineseOutput) DOM.chineseOutput.addEventListener('click', (e) => { if (window.TRANSLATION && typeof window.TRANSLATION.handleHanziClick === 'function') window.TRANSLATION.handleHanziClick(e); });
    } catch(e){}

    // Sidebar toggles
    try {
        if (DOM.toggleDictionaryBtn) DOM.toggleDictionaryBtn.addEventListener('click', () => { if (window.UI_PANELS && typeof window.UI_PANELS.toggleSidebar === 'function') window.UI_PANELS.toggleSidebar(DOM.dictionarySidebar, 'sidebar-dictionary-open'); });
        if (DOM.closeDictionaryBtn) DOM.closeDictionaryBtn.addEventListener('click', () => { if (window.UI_PANELS && typeof window.UI_PANELS.toggleSidebar === 'function') window.UI_PANELS.toggleSidebar(DOM.dictionarySidebar, 'sidebar-dictionary-open'); });
        if (DOM.toggleTranslationBtn) DOM.toggleTranslationBtn.addEventListener('click', () => { if (window.UI_PANELS && typeof window.UI_PANELS.toggleTranslationPanel === 'function') window.UI_PANELS.toggleTranslationPanel(); try { if (window.TTS && typeof window.TTS.speak === 'function') window.TTS.speak(window.currentGeneratedChineseText); } catch(e){} });
        if (DOM.closeTranslationBtn) DOM.closeTranslationBtn.addEventListener('click', () => { if (window.UI_PANELS && typeof window.UI_PANELS.toggleSidebar === 'function') window.UI_PANELS.toggleSidebar(DOM.translationSidebar, 'sidebar-translation-open'); });
    } catch(e) { console.warn('Sidebar wiring error', e); }

    // Overlay closes sidebars
    try { if (DOM.overlay) DOM.overlay.addEventListener('click', () => { try { if (DOM.dictionarySidebar && DOM.dictionarySidebar.classList.contains('open')) window.toggleSidebar(DOM.dictionarySidebar, 'sidebar-dictionary-open'); if (DOM.translationSidebar && DOM.translationSidebar.classList.contains('open')) window.toggleSidebar(DOM.translationSidebar, 'sidebar-translation-open'); } catch(e){} }); } catch(e){}

    // Selection tooltip actions (translation & analysis)
    try {
        if (DOM.selectionTooltip) {
            DOM.selectionTooltip.addEventListener('click', () => { if (window.TRANSLATION && typeof window.TRANSLATION.translateSelectedFragment === 'function') window.TRANSLATION.translateSelectedFragment(); });
            DOM.selectionTooltip.addEventListener('mousedown', (ev) => ev.preventDefault());
        }
    } catch(e){}

    // Provide play/stop helpers that delegate to TTS module
    window.playLastTts = function(){ if (window.TTS && typeof window.TTS.playLastTts === 'function') return window.TTS.playLastTts(); };
    window.stopLastTts = function(){ if (window.TTS && typeof window.TTS.stopLastTts === 'function') return window.TTS.stopLastTts(); };
    window.rewindLastTts = function(){ if (window.TTS && typeof window.TTS.rewindLastTts === 'function') return window.TTS.rewindLastTts(); };
    window.showTtsStatus = function(msg, timeout){ if (window.TTS && typeof window.TTS.showTtsStatus === 'function') return window.TTS.showTtsStatus(msg, timeout); };

    // Render dictionary via translations module
    window.renderDictionary = function(dict, el){ if (window.TRANSLATION && typeof window.TRANSLATION.renderDictionary === 'function') return window.TRANSLATION.renderDictionary(dict, el); };

    // Close stroke modal via strokes module
    window.closeStrokeModal = function(){ if (window.STROKES && typeof window.STROKES.closeStrokeModal === 'function') return window.STROKES.closeStrokeModal(); };

    // Additional lightweight wiring for favorites and quizlet export
    try {
        if (DOM.dictionaryList) {
            DOM.dictionaryList.addEventListener('click', (event) => {
                if (event.target.classList.contains('favorite-star')) {
                    const star = event.target;
                    const word = star.dataset.word;
                    star.classList.toggle('favorited');
                    if (star.classList.contains('favorited')) window.favoritedWords.add(word); else window.favoritedWords.delete(word);
                }
            });
        }
        if (DOM.quizletExportBtn) {
            DOM.quizletExportBtn.addEventListener('click', () => {
                if (!window.favoritedWords || window.favoritedWords.size === 0) { alert('Nie zaznaczono żadnych ulubionych słów.'); return; }
                const lines = [];
                for (const word of window.favoritedWords) {
                    const entry = window.globalDictionary && window.globalDictionary[word];
                    if (entry && entry.translation && entry.pinyin) {
                        const pinyin = entry.pinyin;
                        const translation = entry.translation.replace(/,/g, '');
                        lines.push(`${word},${pinyin} ${translation}`);
                    }
                }
                const textToCopy = lines.join(';');
                navigator.clipboard.writeText(textToCopy).then(() => { const original = DOM.quizletExportBtn.innerHTML; DOM.quizletExportBtn.innerHTML = 'Skopiowano!'; setTimeout(() => DOM.quizletExportBtn.innerHTML = original, 2000); }).catch(err => { console.warn(err); alert('Nie udało się skopiować do schowka.'); });
            });
        }
    } catch(e) { console.warn('favorites wiring error', e); }

    // final: try to unlock audio for TTS
    try { if (window.TTS && typeof window.TTS.tryUnlockAudio === 'function') window.TTS.tryUnlockAudio(); } catch(e){}

});

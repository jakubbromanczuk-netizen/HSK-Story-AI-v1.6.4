(function(){
    // Tłumaczenia i analiza fragmentów - funkcje centralne (krótkie)
    const getCfg = () => window.APP_CFG || {};
    const getDOM = () => window.DOM || {};

    async function fetchFragmentTranslation(textToTranslate) {
        const { API_KEY, MODEL_NAME_LITE } = getCfg();
        if (!API_KEY) throw new Error("Klucz API nie został ustawiony. Uzupełnij src/config.js (APP_CONFIG.API_KEY)");
        const translationPrompt = (window.AI_PROMPTS && window.AI_PROMPTS.translationPrompt) ? window.AI_PROMPTS.translationPrompt(textToTranslate) : `Translate: ${textToTranslate}`;
        const data = await window.AI_API.generateContent(MODEL_NAME_LITE, { contents: [{ parts: [{ text: translationPrompt }] }] });
        return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Nie uzyskano tłumaczenia.";
    }

    async function translateSelectedFragment() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        const DOM = getDOM();

        if (selectedText.length > 0) {
            if (DOM.translationSidebar && !DOM.translationSidebar.classList.contains('open')) {
                if (typeof window.toggleSidebar === 'function') window.toggleSidebar(DOM.translationSidebar, 'sidebar-translation-open');
            }

            if (DOM.translationOutput) DOM.translationOutput.innerHTML = `\n                <div class="loading-spinner">\n                    <i class="fas fa-spinner"></i> \n                    <span class="loading-text">Tłumaczenie fragmentu...</span>\n                </div>\n            `;
            if (DOM.translationErrorMessage) DOM.translationErrorMessage.textContent = '';

            try {
                const translation = await fetchFragmentTranslation(selectedText);
                if (DOM.translationOutput) DOM.translationOutput.innerHTML = translation.replace(/\n/g, '<br>');
            } catch (error) {
                console.error('translateSelectedFragment error', error);
                if (DOM.translationErrorMessage) DOM.translationErrorMessage.textContent = `Błąd: Nie udało się przetłumaczyć fragmentu (${error.message}).`;
                if (DOM.translationOutput) DOM.translationOutput.innerHTML = '<p style="color: #ccc; text-align: center;">Błąd ładowania tłumaczenia.</p>';
            } finally {
                if (DOM.selectionTooltip) DOM.selectionTooltip.style.display = 'none';
                selection.removeAllRanges();
            }
        }
    }

    async function analyzeSelectedFragment() {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        const DOM = getDOM();
        const { API_KEY, MODEL_NAME_LITE } = getCfg();

        if (!selectedText || selectedText.length === 0) {
            if (DOM.translationErrorMessage) DOM.translationErrorMessage.textContent = 'Brak zaznaczenia';
            return;
        }
        if (!API_KEY) {
            if (DOM.translationErrorMessage) DOM.translationErrorMessage.textContent = 'Brak klucza API - ustaw w src/config.js (APP_CONFIG.API_KEY)';
            return;
        }

        if (DOM.translationSidebar && !DOM.translationSidebar.classList.contains('open')) {
            if (typeof window.toggleSidebar === 'function') window.toggleSidebar(DOM.translationSidebar, 'sidebar-translation-open');
        }

        if (DOM.translationOutput) DOM.translationOutput.innerHTML = `\n            <div class="loading-spinner">\n                <i class="fas fa-spinner"></i>\n                <span class="loading-text">Analiza gramatyczna...</span>\n            </div>\n        `;

        const hskLevel = (DOM.hskLevelSlider && DOM.hskLevelSlider.value) || '3';
        const analysisPrompt = (window.AI_PROMPTS && window.AI_PROMPTS.analysisPrompt) ? window.AI_PROMPTS.analysisPrompt(selectedText, hskLevel) : `Zadanie: Dla podanego fragmentu chińskiego podaj kolejno punkty gramatyczne użyte w tym zdaniu. Tekst: '${selectedText}'`;

        try {
            const data = await window.AI_API.generateContent(MODEL_NAME_LITE, { contents: [{ parts: [{ text: analysisPrompt }] }] });
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            if (rawText.length === 0) throw new Error('Otrzymano pustą odpowiedź od modelu.');
            function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
            if (DOM.translationOutput) DOM.translationOutput.innerHTML = `<pre style="white-space: pre-wrap;">${escapeHtml(rawText)}</pre>`;
        } catch (err) {
            console.error('analyzeSelectedFragment error', err);
            if (DOM.translationOutput) DOM.translationOutput.innerHTML = '';
            if (DOM.translationErrorMessage) DOM.translationErrorMessage.textContent = `Błąd analizy: ${err.message}`;
        }
    }

    async function fetchWordDefinition(hanziWord) {
        const { API_KEY, MODEL_NAME_LITE } = getCfg();
        if (!API_KEY) throw new Error("Klucz API nie został ustawiony. Uzupełnij src/config.js (APP_CONFIG.API_KEY)");
        const definitionPrompt = (window.AI_PROMPTS && window.AI_PROMPTS.definitionPrompt) ? window.AI_PROMPTS.definitionPrompt(hanziWord) : `Provide a very short definition for: ${hanziWord}`;
        const data = await window.AI_API.generateContent(MODEL_NAME_LITE, { contents: [{ parts: [{ text: definitionPrompt }] }] });
        return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Brak definicji.";
    }

    async function translateContextual(chineseText) {
        const { API_KEY, MODEL_NAME } = getCfg();
        if (!API_KEY) throw new Error("Klucz API nie został ustawiony. Uzupełnij src/config.js (APP_CONFIG.API_KEY)");
        const contextualPrompt = (window.AI_PROMPTS && window.AI_PROMPTS.contextualPrompt) ? window.AI_PROMPTS.contextualPrompt(chineseText) : `Translate contextually: ${chineseText}`;
        const data = await window.AI_API.generateContent(MODEL_NAME, { contents: [{ parts: [{ text: contextualPrompt }] }] });
        return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Nie uzyskano tłumaczenia.";
    }

    async function translateWordsForDictionary(hanziWords, allSegments) {
        const dictionary = {};
        for (const word of hanziWords) {
            let combinedPinyin = '';
            const segment = allSegments.find(s => s.hanzi === word);
            if (segment) combinedPinyin = segment.pinyin;
            else {
                // best-effort extraction from currentGeneratedChineseText
                const wordPinyinPattern = word.split('').map(char => `${char}\[([^\]]+)\]`).join('');
                const re = new RegExp(wordPinyinPattern, 'u');
                const match = (window.currentGeneratedChineseText || '').match(re);
                if (match) combinedPinyin = match.slice(1).join('');
            }

            try {
                const definition = await fetchWordDefinition(word);
                dictionary[word] = { pinyin: combinedPinyin || '?', translation: definition };
            } catch (error) {
                console.error(`Błąd podczas tłumaczenia słowa '${word}':`, error);
                dictionary[word] = { pinyin: combinedPinyin || '?', translation: `Błąd definicji: ${error.message}` };
            }
        }
        return dictionary;
    }

    async function handleHanziClick(event) {
        const target = event.target.closest && event.target.closest('.hanzi-word');
        const DOM = getDOM();
        if (!target) return;
        const hanziWord = target.getAttribute('data-word-hanzi') || target.getAttribute('data-hanzi');
        const pinyinWord = target.getAttribute('data-pinyin-full') || target.getAttribute('data-pinyin-word');
        if (hanziWord && pinyinWord) {
            if (typeof window.toggleSidebar === 'function') window.toggleSidebar(DOM.dictionarySidebar, 'sidebar-dictionary-open');
            window.globalDictionary = window.globalDictionary || {};
            if (!window.globalDictionary[hanziWord] || !window.globalDictionary[hanziWord].translation || window.globalDictionary[hanziWord].translation === 'Ładowanie definicji...') {
                window.globalDictionary[hanziWord] = { pinyin: pinyinWord, translation: 'Ładowanie definicji...' };
                if (typeof window.renderDictionary === 'function') window.renderDictionary(window.globalDictionary, DOM.dictionaryList);
            }
            try {
                const definition = await fetchWordDefinition(hanziWord);
                window.globalDictionary[hanziWord] = { pinyin: pinyinWord, translation: definition };
                if (typeof window.renderDictionary === 'function') window.renderDictionary(window.globalDictionary, DOM.dictionaryList);
            } catch (error) {
                console.error('fetchWordDefinition error', error);
                window.globalDictionary[hanziWord] = { pinyin: pinyinWord, translation: `Błąd: ${error.message}` };
                if (typeof window.renderDictionary === 'function') window.renderDictionary(window.globalDictionary, DOM.dictionaryList);
            }
        }
    }

    function renderDictionary(dictionary, listElement) {
        if (!listElement) return;
        listElement.innerHTML = '';
        if (!dictionary || Object.keys(dictionary).length === 0) {
            listElement.innerHTML = '<p style="color: #ccc; text-align: center;">Kliknij słowo, by zobaczyć definicję.</p>';
            return;
        }

        const wordsToRender = Object.keys(dictionary).reverse();
        wordsToRender.forEach(word => {
            const entry = dictionary[word];
            const item = document.createElement('div');
            item.className = 'dictionary-item';
            const isFavorited = (window.favoritedWords && window.favoritedWords.has && window.favoritedWords.has(word)) ? 'favorited' : '';
            item.innerHTML = `
                <span class="dict-char" data-word="${word}">${word}</span>
                <span class="dict-pinyin">${entry.pinyin}</span>
                <span class="dict-translation">${entry.translation}</span>
                <i class="fas fa-star favorite-star ${isFavorited}" data-word="${word}"></i>
            `;
            listElement.appendChild(item);
        });
    }

    // Export to window
    window.TRANSLATION = {
        fetchFragmentTranslation,
        translateSelectedFragment,
        analyzeSelectedFragment,
        fetchWordDefinition,
        translateContextual,
        translateWordsForDictionary,
        handleHanziClick,
        renderDictionary
    };

    // Backward compatibility global
    window.renderDictionary = renderDictionary;

})();

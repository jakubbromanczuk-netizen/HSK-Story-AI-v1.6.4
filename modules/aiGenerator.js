(function(){
    // Moduł AI: generowanie tekstu i przetwarzanie odpowiedzi
    const CFG = window.APP_CFG || {};

    function getDOM() { return window.DOM || {}; }

    function sampleArray(arr, n) {
        if (!arr || arr.length === 0 || n <= 0) return [];
        const pool = arr.slice();
        const out = [];
        while (out.length < n && pool.length > 0) {
            const idx = Math.floor(Math.random() * pool.length);
            out.push(pool.splice(idx, 1)[0]);
        }
        return out;
    }

    async function processGeminiResponse(fullText, chineseOutput, pinyinOutput, dictionaryList, errorMessage) {
        console.log("Raw AI response for processing:", fullText);
        // Defensive: ensure fullText is a string to avoid runtime errors
        if (fullText === null || fullText === undefined) fullText = '';
        else if (typeof fullText !== 'string') {
            try { fullText = (typeof fullText === 'object') ? JSON.stringify(fullText) : String(fullText); } catch (e) { fullText = ''; }
        }
        let extractedHanzi = '';
        let extractedPinyin = '';
        const segments = [];
        const uniqueHanziWords = new Set();

        const hanziPinyinWordRegex = /^([\u4E00-\u9FFF]+)\[([^\]]+)\]$/u;
        let rawSegments = [];
        try {
            rawSegments = fullText.split('Q').filter(segment => segment.trim().length > 0);
        } catch (e) {
            console.warn('Failed to split AI response by "Q" — using entire text as single segment', e);
            rawSegments = [String(fullText)];
        }

        for (const rawSegment of rawSegments) {
            const trimmedSegment = rawSegment.trim();
            const match = trimmedSegment.match(hanziPinyinWordRegex);
            if (match) {
                const hanzi = match[1];
                const pinyin = match[2];
                segments.push({ hanzi: hanzi, pinyin: pinyin });
                extractedHanzi += hanzi;
                extractedPinyin += pinyin + ' ';
                uniqueHanziWords.add(hanzi);
            } else {
                segments.push({ hanzi: trimmedSegment, pinyin: '' });
                extractedHanzi += trimmedSegment;
            }
        }

        extractedPinyin = extractedPinyin.trim();
        window.currentGeneratedChineseText = extractedHanzi;
        try { if (typeof window.appendHanziToTerminalCsv === 'function') window.appendHanziToTerminalCsv(window.currentGeneratedChineseText); } catch(e) { console.warn('appendHanziToTerminalCsv error', e); }

        try { await window.BACKEND_API.appendHistory({ date: new Date().toISOString(), text: fullText }); } catch (e) { console.warn('append-history error', e); }

        try {
            const usedSet = new Set(Array.from(uniqueHanziWords));
            if (window.WEIGHTS && typeof window.WEIGHTS.updateHanziWeights === 'function') window.WEIGHTS.updateHanziWeights(usedSet);
            console.log('Hanzi weights updated.');
        } catch (e) { console.warn('Failed to update hanzi weights', e); }

        const dictionary = await (window.TRANSLATION && typeof window.TRANSLATION.translateWordsForDictionary === 'function' ? window.TRANSLATION.translateWordsForDictionary(Array.from(uniqueHanziWords), segments) : {});
        window.globalDictionary = {};
        try { if (typeof window.renderDictionary === 'function') window.renderDictionary(window.globalDictionary, dictionaryList); } catch(e){}

        try { if (typeof window.renderChineseText === 'function') window.renderChineseText(segments, chineseOutput); } catch(e){
            // fallback simple render
            let html = '';
            segments.forEach(s => { html += (s.hanzi || s); });
            if (chineseOutput) chineseOutput.innerHTML = html;
        }
        console.log('Processed segments:', segments);
        try { if (pinyinOutput) pinyinOutput.textContent = extractedPinyin.replace(/\s+/g, ' '); } catch(e){}
        return { segments, dictionary };
    }

    async function generateText() {
        const DOM = getDOM();
        const lengthInput = DOM.lengthInput;
        const chineseOutput = DOM.chineseOutput;
        const pinyinOutput = DOM.pinyinOutput;
        const dictionaryList = DOM.dictionaryList;
        const errorMessage = DOM.errorMessage;

        const desiredLength = parseInt((lengthInput && lengthInput.value) ? lengthInput.value.trim() : '0', 10);
        const hskLevel = (DOM.hskLevelSlider && DOM.hskLevelSlider.value) || '3';
        const difficulty = (DOM.difficultySlider && DOM.difficultySlider.value) || '50';
        const creativity = (DOM.creativitySlider && DOM.creativitySlider.value) || '50';

        if (!(CFG && CFG.API_KEY)) {
            if (errorMessage) errorMessage.textContent = "Błąd: Wstaw swój klucz API do src/config.js (APP_CONFIG.API_KEY)!";
            return;
        }

        if (isNaN(desiredLength) || desiredLength < 1 || desiredLength > 150) {
            if (errorMessage) errorMessage.textContent = "Lenght must be a number between 1 and 150.";
            return;
        }

        if (chineseOutput) chineseOutput.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner"></i><span class="loading-text">Creating grammar layer..</span></div>`;
        if (pinyinOutput) pinyinOutput.textContent = '';
        if (dictionaryList) dictionaryList.innerHTML = '<p style="color: #ccc; text-align: center;'>Słownik zostanie wypełniony po generacji...</p>';

        const rulesCount = Math.max(1, Math.floor(desiredLength / 15));
        const selectedRules = (window.GRAMMAR_RULES && typeof window.GRAMMAR_RULES.getRandomGrammarRules === 'function') ? window.GRAMMAR_RULES.getRandomGrammarRules(rulesCount) : [];
        const rulesPrompt = selectedRules.map(rule => `- Użyj zasady: ${rule}`).join('\n');

        const groups = Math.max(1, Math.round(desiredLength / 10));
        const requiredCount = groups;
        const requiredToUse = (window.WEIGHTS && typeof window.WEIGHTS.pickBottomCount === 'function') ? window.WEIGHTS.pickBottomCount(requiredCount) : [];

        const additionalList = (window.SETTINGS_GENERATOR && typeof window.SETTINGS_GENERATOR.getAdditionalVocabList === 'function') ? window.SETTINGS_GENERATOR.getAdditionalVocabList() : [];
        const extraPerGroup = 3;
        const extraNeeded = groups * extraPerGroup;
        const additionalPicks = additionalList.length > 0 ? sampleArray(additionalList, Math.min(extraNeeded, additionalList.length)) : [];

        const combinedRequired = Array.from(new Set([...(requiredToUse || []), ...additionalPicks]));
        const requiredClause = (combinedRequired && combinedRequired.length > 0) ? `\n\nDODATKOWO: W TEKŚCIE MUSI POJAWIĆ SIĘ CO NAJMNIEJ RAZ KAŻDE Z NASTĘPUJĄCYCH SŁÓW: ${combinedRequired.join(' ')}.` : '';

        const prompt = (window.AI_PROMPTS && window.AI_PROMPTS.generateStoryPrompt) ? window.AI_PROMPTS.generateStoryPrompt({ desiredLength, hskLevel, difficulty, creativity, rulesPrompt, requiredClause }) : `Generate story: ${desiredLength} chars`;

        try {
            const data = await window.AI_API.generateContent(CFG.MODEL_NAME || 'gemini-2.5-pro', { contents: [{ parts: [{ text: prompt }] }] });
            const fullText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
            console.log("Raw AI response:", fullText);
            if (fullText.length === 0) {
                if (data?.candidates?.[0]?.finishReason === "SAFETY") throw new Error("Treść została zablokowana przez filtry bezpieczeństwa.");
                throw new Error("Otrzymana odpowiedź od API jest pusta.");
            }
            await processGeminiResponse(fullText, chineseOutput, pinyinOutput, dictionaryList, errorMessage);
        } catch (error) {
            console.error('Błąd podczas generowania tekstu:', error);
            if (errorMessage) errorMessage.textContent = `Wystąpił błąd: ${error.message}. Sprawdź, czy klucz API jest poprawny.`;
            if (chineseOutput) chineseOutput.textContent = 'Błąd. Nie udało się wygenerować tekstu.';
            if (pinyinOutput) pinyinOutput.textContent = '';
        }
    }

    window.AI_GENERATOR = {
        generateText,
        processGeminiResponse
    };

})();

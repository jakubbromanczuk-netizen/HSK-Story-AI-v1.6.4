(function(){
    // Inicjalizacja DOM (krótko) - wywołaj DOM_INIT.init() po załadowaniu
    window.DOM_INIT = {
        init: function() {
            const q = (sel) => document.querySelector(sel) || null;
            const dom = {
                lengthInput: q('#length-input'),
                generateButton: q('#generate-button'),
                chineseOutput: q('#chinese-output'),
                pinyinOutput: q('#pinyin-output'),
                errorMessage: q('#error-message'),
                dictionarySidebar: q('#dictionary-sidebar'),
                toggleDictionaryBtn: q('#toggle-dictionary-btn'),
                closeDictionaryBtn: q('#close-dictionary-btn'),
                dictionaryList: q('#dictionary-list'),
                overlay: q('#overlay'),
                togglePinyinBtn: q('#toggle-pinyin-btn'),
                pinyinTooltip: q('#pinyin-tooltip'),
                pasteHanziButton: q('#paste-hanzi-button'),
                selectionTooltip: q('#selection-tooltip'),
                quizletExportBtn: q('#quizlet-export-btn'),
                settingsBtn: q('#settings-btn'),
                settingsModalOverlay: q('#settings-modal-overlay'),
                closeSettingsModalBtn: q('#close-settings-modal-btn'),
                pasteModalOverlay: q('#paste-modal-overlay'),
                pasteTextArea: q('#paste-text-area'),
                submitPastedText: q('#submit-pasted-text'),
                submitPastedImage: q('#submit-pasted-image'),
                cancel_paste_modal: q('#cancel-paste-modal'),
                translationSidebar: q('#translation-sidebar'),
                toggleTranslationBtn: q('#toggle-translation-btn'),
                closeTranslationBtn: q('#close-translation-btn'),
                translationOutput: q('#translation-output'),
                translationErrorMessage: q('#translation-error-message'),
                strokeInput: q('#stroke-input'),
                strokeApplyBtn: q('#stroke-apply-btn'),
                strokeError: q('#stroke-error'),
                generatorSettingsBtn: q('#generator-settings-btn'),
                generatorSettingsContainer: q('#generator-settings-container'),
                hskLevelSlider: q('#hsk-level-slider'),
                hskLevelValue: q('#hsk-level-value'),
                difficultySlider: q('#difficulty-slider'),
                difficultyValue: q('#difficulty-value'),
                creativitySlider: q('#creativity-slider'),
                creativityValue: q('#creativity-value'),
                loadHistoryBtn: q('#load-history-btn'),
                historyListContainer: q('#history-list-container'),
                strokeModal: q('#stroke-modal'),
                strokeWriters: q('#stroke-writers'),
                closeStrokeModal: q('#close-stroke-modal')
            };
            window.DOM = Object.assign({}, window.DOM || {}, dom);
            return window.DOM;
        }
    };
})();

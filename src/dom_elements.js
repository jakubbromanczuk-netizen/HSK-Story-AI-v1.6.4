// Inicjalizacja elementów DOM; ustawia window.DOM po załadowaniu dokumentu
(function(){
    function init() {
        window.DOM = window.DOM || {};
        const ids = [
            'length-input','generate-button','chinese-output','pinyin-output','error-message',
            'dictionary-sidebar','toggle-dictionary-btn','close-dictionary-btn','dictionary-list','overlay',
            'toggle-pinyin-btn','pinyin-tooltip','paste-hanzi-button','selection-tooltip','quizlet-export-btn',
            'settings-btn','settings-modal-overlay','close-settings-modal-btn',
            'paste-modal-overlay','paste-text-area','submit-pasted-text','submit-pasted-image','cancel-paste-modal',
            'translation-sidebar','toggle-translation-btn','close-translation-btn','translation-output','translation-error-message',
            'stroke-input','stroke-apply-btn','stroke-error','generator-settings-btn','generator-settings-container',
            'hsk-level-slider','difficulty-slider','creativity-slider','hsk-level-value','difficulty-value','creativity-value',
            'load-history-btn','history-list-container','stroke-modal','stroke-writers','close-stroke-modal'
        ];
        function toCamel(s) {
            return s.split('-').map((part,i)=> i===0? part : (part.charAt(0).toUpperCase()+part.slice(1))).join('');
        }

        ids.forEach(id => {
            try {
                const el = document.getElementById(id);
                const under = id.replace(/-/g,'_');
                const camel = toCamel(id);
                window.DOM[under] = el;
                window.DOM[camel] = el;
            } catch(e){}
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

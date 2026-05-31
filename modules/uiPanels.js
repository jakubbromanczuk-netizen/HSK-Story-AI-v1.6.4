// Panele UI: przełączanie sidebarów i panel tłumaczenia (krótkie)
(() => {
    const DOM = () => window.DOM || {};

    function toggleSidebar(sidebarElement, bodyClass) {
        const d = DOM();
        const body = document.body;
        if (!sidebarElement) return;
        const isOpen = sidebarElement.classList.toggle('open');

        // Close the other sidebar if open
        if (bodyClass === 'sidebar-dictionary-open' && d.translationSidebar && d.translationSidebar.classList.contains('open')) {
            d.translationSidebar.classList.remove('open');
            body.classList.remove('sidebar-translation-open');
        } else if (bodyClass === 'sidebar-translation-open' && d.dictionarySidebar && d.dictionarySidebar.classList.contains('open')) {
            d.dictionarySidebar.classList.remove('open');
            body.classList.remove('sidebar-dictionary-open');
        }

        if (isOpen) {
            body.classList.add(bodyClass);
            if (d.overlay) d.overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } else {
            body.classList.remove(bodyClass);
            if ((!d.dictionarySidebar || !d.dictionarySidebar.classList.contains('open')) && (!d.translationSidebar || !d.translationSidebar.classList.contains('open'))) {
                if (d.overlay) d.overlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    }

    async function toggleTranslationPanel() {
        const d = DOM();
        if (!d.translationSidebar) return;
        const isOpen = d.translationSidebar.classList.toggle('open');
        document.body.classList.toggle('sidebar-translation-open', isOpen);

        if (isOpen) {
            if (d.dictionarySidebar && d.dictionarySidebar.classList.contains('open')) {
                d.dictionarySidebar.classList.remove('open');
                document.body.classList.remove('sidebar-dictionary-open');
            }
            document.body.classList.add('sidebar-translation-open');
            if (d.overlay) d.overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';

            if ((window.currentGeneratedChineseText || '').length > 0) {
                if (d.translationOutput) d.translationOutput.innerHTML = `<div class="loading-spinner"><i class="fas fa-spinner"></i> <span class="loading-text">Tłumaczenie kontekstowe...</span></div>`;
                try {
                    const translation = await (window.TRANSLATION && typeof window.TRANSLATION.translateContextual === 'function' ? window.TRANSLATION.translateContextual(window.currentGeneratedChineseText) : '');
                    if (d.translationOutput) d.translationOutput.innerHTML = translation.replace(/\n/g, '<br>');
                } catch (error) {
                    console.error('toggleTranslationPanel translate error', error);
                    if (d.translationErrorMessage) d.translationErrorMessage.textContent = `Błąd: Nie udało się uzyskać tłumaczenia kontekstowego (${error.message}).`;
                    if (d.translationOutput) d.translationOutput.innerHTML = '<p style="color: #ccc; text-align: center;">Błąd ładowania tłumaczenia.</p>';
                }
            } else {
                if (d.translationOutput) d.translationOutput.innerHTML = '<p style="color: #ccc; text-align: center;">Brak tekstu chińskiego do przetłumaczenia. Wygeneruj tekst.</p>';
            }
        } else {
            document.body.classList.remove('sidebar-translation-open');
            if (!d.dictionarySidebar || !d.dictionarySidebar.classList.contains('open')) {
                if (d.overlay) d.overlay.style.display = 'none';
                document.body.style.overflow = '';
            }
        }
    }

    window.UI_PANELS = {
        toggleSidebar,
        toggleTranslationPanel
    };

    // Backward compatibility
    window.toggleSidebar = toggleSidebar;
    window.toggleTranslationPanel = toggleTranslationPanel;
})();

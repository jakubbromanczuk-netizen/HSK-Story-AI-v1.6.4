// Zestaw promptów AI (wywołania do modelu) - dostępne przez window.AI_PROMPTS
(function(){
    const P = {
        analysisPrompt: (selectedText, hskLevel) => `Zadanie: Dla podanego fragmentu chińskiego podaj kolejno punkty gramatyczne użyte w tym zdaniu, analizując je pod kątem gramatyki opisywanej w podręcznikach HSK (poziom HSK ${hskLevel}). Odpowiedz WYŁĄCZNIE w formacie pokazanym w przykładzie: najpierw wypisz oryginalny fragment (jeden wiersz), a następnie każdą linię analizy w formacie: fragment = "krótki opis po polsku". Nie dodawaj żadnego wstępu, podsumowania ani dodatkowych komentarzy. Odpowiedź po polsku. Tekst: '${selectedText}'`,

        translationPrompt: (textToTranslate) => `Translate the following Chinese text fragment into clear, contextual English. The translation should be helpful for a language learner, meaning it should preserve the original sentence structure and meaning as much as possible, without sounding unnatural. Return only the translated text, without any additional comments or explanations. Chinese fragment to translate:\n---\n${textToTranslate}\n---`,

        generateStoryPrompt: ({desiredLength, hskLevel, difficulty, creativity, rulesPrompt, requiredClause}) => 
            `Wygeneruj krótką historyjkę w języku chińskim zawierającą około ${desiredLength} ZNAKÓW HANZI (tylko chińskie znaki),
        \na nie licząc pinyin, spacji ani interpunkcji. LICZBA, KTÓRĄ PODAJESZ: ${desiredLength} odnosi się WYŁĄCZNIE do ilości znaków Hanzi.\nTekst musi być spójny gramatycznie na poziomie HSK ${hskLevel} i wykorzystywać struktury gramatyczne z podręczników HSK, tak aby przypominał teksty na egzaminie.\nPoziom trudności tekstu ma wynosić ${difficulty}/100.\nPoziom kreatywności tekstu ma wynosić ${creativity}/100.\nW tekście użyj następujących dwóch zasad gramatycznych:\n${rulesPrompt}\nZwróć wynik w formacie: QHanzi[pinyin]Q.\n**WAŻNE (liczenie długości):**\n- Liczyć należy TYLKO znaki Hanzi. Nie licz pinyin, spacji ani żadnej interpunkcji przy określaniu długości tekstu.\n- Wygeneruj ~${desiredLength} znaków Hanzi (przykładowo: jeśli ma być 20, to w polu Hanzi będzie około 20 chińskich znaków),\n    ale nadal podawaj pinyin dla każdego znaku w nawiasach kwadratowych i zachowaj format Q...Q.\n**KRYTYCZNA INSTRUKCJA FORMATOWANIA:**\n1.  **SEPARATOR 'Q':** Wstaw 'Q' przed i po każdym słowie oraz znaku interpunkcyjnym (np. Q你好Q, Q，Q, Q。Q). Separator musi oddzielać słowa od interpunkcji.\n2.  **PINYIN (BARDZO WAŻNE):** Do każdego **SŁOWA** (a nie pojedynczego znaku) dodaj pinyin w **jednym** nawiasie kwadratowym, łącząc pinyin dla wszystkich znaków w tym słowie.\n    - **POPRAWNIE:** Q朋友[péngyǒu]Q, Q是[shì]Q.\n    - **NIEPOPRAWNIE:** Q朋[péng]友[yǒu]Q.\n3.  **BRAK DODATKOWYCH TREŚCI:** Zwróć wyłącznie sformatowany tekst bez żadnych wyjaśnień.\n${requiredClause}`,

        formattingPrompt: (textWithPlaceholders) => `Zadanie: Przekonwertuj chiński tekst na specjalny format. Tekst wejściowy: '${textWithPlaceholders}'\n\nReguły formatowania:\n1.  Każde słowo, znak interpunkcyjny i token nowej linii (__BR__) musi być otoczony separatorem 'Q'.\n2.  Do każdego chińskiego SŁOWA (nie znaku) dodaj pinyin w jednym nawiasie kwadratowym, zaraz po słowie.\n\nPrzykłady:\n- '你好' staje się 'Q你好[nǐhǎo]Q'\n- ',' staje się 'Q，Q'\n- '__BR__' staje się 'Q__BR__Q'\n\nZwróć TYLKO przekonwertowany tekst.`,

        definitionPrompt: (hanziWord) => `Provide a very short (maximum 5 words) definition in English for the Chinese word: '${hanziWord}'. Do not include pinyin or example sentences. Only the definition.`,

        contextualPrompt: (chineseText) => `Przetłumacz poniższy tekst chiński na **płynny i kontekstowy język angielski**. Nie tłumacz dosłownie. Tłumaczenie ma stanowić jeden spójny, naturalnie brzmiący tekst. Tekst chiński do przetłumaczenia:\n---\n${chineseText}\n---`
    };

    window.AI_PROMPTS = P;
})();

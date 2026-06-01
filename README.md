# HSK Story Ai v 1.6.4
<video src="https://github.com/user-attachments/assets/128f0caf-4239-4d0b-b58d-12f34995b76b" controls width="100%"></video>


## Platforma do nauki języka chińskiego skoncentrowana na przygotowaniu do egzaminów HSK.

## 你好！

Projekt łączy narzędzia do praktyki słownictwa, gramatyki, słuchu i wymowy w jednym miejscu. System analizuje historię nauki użytkownika i priorytetyzuje słowa oraz konkretne zagadnienia gramatyczne, które nie były powtarzane od dłuższego czasu, dzięki czemu wygenerowany tekst jest zawsze skrojony do poziomu użytkownika.

<img width="673" height="587" alt="obraz" src="https://github.com/user-attachments/assets/11093f05-48f5-472c-bdea-de439148b6c4" />

## Funkcje

* automatyczny dobór słownictwa i struktur gramatycznych wymagających powtórki,
* generator kolejności ręcznego rysowania znaków
* pinyin oraz generowana wymowa dla każdego słowa,
* oznaczanie tonów kolorami,
* rozpoznawanie znaków Hanzi ze zrzutów ekranu,
* szybkie tłumaczenie pojedynczych słów,
* tłumaczenie zdań z uwzględnieniem kontekstu,
* generowanie zestawów fiszek gotowych do importu na platformę Quizlet,
* organizacja materiałów zgodnie z poziomami HSK.


<img width="618" height="260" alt="obraz" src="https://github.com/user-attachments/assets/862ad2e8-1e1e-43fd-a4f0-959b0f55e21d" />

## Cel

Zmniejszenie liczby narzędzi potrzebnych do nauki języka chińskiego i przeniesienie najczęściej wykonywanych czynności do jednego środowiska: powtórek, sprawdzania wymowy, tłumaczeń, pracy ze znakami Hanzi oraz tworzenia fiszek oraz jak największe zkrócenie czasu między pozaniem nowego słowa a nauczeniem się jego wymowy, pisowni, tonu i znaczenia.


<img width="933" height="671" alt="obraz" src="https://github.com/user-attachments/assets/5d76c45a-a8ab-4e17-8157-c0f716784554" />

<img width="398" height="695" alt="obraz" src="https://github.com/user-attachments/assets/e7bc045b-70f8-459f-b60f-4dd2981d0f87" />



## Po instalacji należy:

1. Wygenerować klucz Gemini API https://aistudio.google.com/api-keys -> `src/config.example.js` → `src/config.js` i uzupełnić `API_KEY` 
2. Uruchomić w katalogu głównym serwer zapisu wag: `node save_weights_server.js`
3. Otworzyć `index.html` lokalnie (np. `npx http-server -p 8005`) i wejść na http://localhost:8005


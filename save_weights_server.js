const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const HANZI_CSV_PATH = path.join(__dirname, 'hanzy_z_hsk_terminal.csv'); // Ścieżka do pliku z wygenerowanymi Hanzi
// Użyj lokalnego HSK_vocab_val.csv w tym katalogu v6 (plik wag)
const HSK_VOCAB_PATH = path.join(__dirname, 'HSK_vocab_val.csv'); // Ścieżka do pliku z wagami HSK

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.text()); // Dla /append-hanzi-text

// Prosty CORS dla użytku lokalnego
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.post('/save-weights', (req, res) => {
    const updatedWeights = req.body.weights;

    if (!updatedWeights || typeof updatedWeights !== 'object') {
        return res.status(400).send('Nieprawidłowe dane wag.');
    }

    // Odczytaj istniejące wagi
    fs.readFile(HSK_VOCAB_PATH, 'utf8', (err, data) => {
        let currentWeights = {};
        if (!err && data) {
            const lines = data.split('\n');
            lines.forEach(line => {
                if (line.trim() && !line.startsWith('#')) {
                    const parts = line.split(',');
                    if (parts.length === 2) {
                        currentWeights[parts[0].trim()] = parseFloat(parts[1].trim());
                    }
                }
            });
        } else if (err && err.code !== 'ENOENT') {
            console.error('Błąd podczas odczytu HSK_vocab_val.csv:', err);
            // Kontynuuj, używając pustego obiektu currentWeights, jeśli plik nie istnieje lub jest inny błąd
        }

        // Połącz nowe wagi z istniejącymi (nowe nadpisują stare dla tych samych znaków)
        const mergedWeights = { ...currentWeights, ...updatedWeights };

        // Sformatuj do CSV
        let csvContent = '# Format: hanzi,weight\n# Updated by save_weights_server.js\n';
        for (const hanzi in mergedWeights) {
            csvContent += `${hanzi},${mergedWeights[hanzi]}\n`;
        }

        // Zapisz połączone wagi do pliku
        fs.writeFile(HSK_VOCAB_PATH, csvContent, 'utf8', (err) => {
            if (err) {
                console.error('Błąd podczas zapisu HSK_vocab_val.csv:', err);
                return res.status(500).send('Błąd serwera podczas zapisu pliku wag.');
            }
            console.log('Wagi Hanzi zaktualizowane w', HSK_VOCAB_PATH);
            res.status(200).send('Wagi Hanzi zostały pomyślnie zaktualizowane.');
        });
    });
});

// Endpoint do dopisywania wygenerowanych Hanzi
app.post('/append-hanzi-text', (req, res) => {
    const hanziText = req.body;

    if (!hanziText) {
        return res.status(400).send('Brak tekstu Hanzi do dodania.');
    }

    // Dodaj znak nowej linii, aby każde wygenerowane zdanie było w osobnej linii
    fs.appendFile(HANZI_CSV_PATH, hanziText + '\n', (err) => {
        if (err) {
            console.error('Błąd podczas dopisywania do pliku CSV:', err);
            return res.status(500).send('Błąd serwera podczas zapisu pliku.');
        }
        console.log('Tekst Hanzi dopisany do', HANZI_CSV_PATH);
        res.status(200).send('Tekst Hanzi został pomyślnie dodany.');
    });
});

// Endpoint do dopisywania wpisów historii (surowy tekst z pinyin i data)
app.post('/append-history', (req, res) => {
    const rawText = req.body;
    const HISTORY_CSV_PATH = path.join(__dirname, 'history.csv');

    if (!rawText) {
        return res.status(400).send('Brak treści historii do dopisania.');
    }

    // Escape double quotes in text for CSV format
    const safeText = String(rawText).replace(/"/g, '""');
    const timestamp = new Date().toISOString();
    const line = `"${timestamp}","${safeText}"\n`;

    fs.appendFile(HISTORY_CSV_PATH, line, (err) => {
        if (err) {
            console.error('Błąd podczas dopisywania do history.csv:', err);
            return res.status(500).send('Błąd serwera podczas zapisu historii.');
        }
        console.log('Wpis historii dopisany do', HISTORY_CSV_PATH);
        res.status(200).send('Historia została pomyślnie dopisana.');
    });
});

app.get('/last', (req, res) => {
  const lastPath = path.join(__dirname, 'last_payload.json');
  if (!fs.existsSync(lastPath)) return res.status(404).send('no last payload');
  try {
    const data = fs.readFileSync(lastPath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  } catch (err) {
    res.status(500).send('read error');
  }
});

// Mała strona startowa by uniknąć błędów CSP/favion.ico w przeglądarce
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send('<!doctype html><meta charset="utf-8"><title>Save Weights Server</title><p>Wyślij POST na <code>/save-weights</code> aby zapisać CSV.</p><p>Wyślij POST na <code>/append-hanzi-text</code> aby dopisać Hanzi do CSV.</p>');
});

// Endpoint do pobierania historii
app.get('/get-history', (req, res) => {
    const HISTORY_CSV_PATH = path.join(__dirname, 'history.csv');
    if (!fs.existsSync(HISTORY_CSV_PATH)) {
        return res.status(200).json([]);
    }

    fs.readFile(HISTORY_CSV_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Błąd odczytu historii:', err);
            return res.status(500).send('Błąd serwera przy odczycie historii.');
        }

        const lines = data.trim().split('\n');
        const history = [];
        
        for (const line of lines) {
            if (!line.trim()) continue;
            const match = line.match(/^"([^"]+)","(.*)"$/s);
            if (match) {
                history.push({ date: match[1], text: match[2].replace(/""/g, '"') });
            }
        }
        
        res.json(history.reverse());
    });
});

// Odpowiedz na zapytania o favicon.ico statusem 204 (brak treści)
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

const port = 3000;
app.listen(port, () => console.log(`save-weights server listening on http://localhost:${port}`));

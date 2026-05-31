// Prosty skrypt pomocniczy: modyfikuje lokalny plik CSV wag HSK (seed)
const fs = require('fs');
const path = require('path');

// Używamy lokalnego pliku HSK_vocab_val.csv w katalogu v6
const csvPath = path.join(__dirname, 'HSK_vocab_val.csv');
const backupPath = csvPath + '.bak_seed_add10';

if (!fs.existsSync(csvPath)) {
  console.error('CSV not found:', csvPath);
  process.exit(1);
}

const text = fs.readFileSync(csvPath, 'utf8');
fs.writeFileSync(backupPath, text, 'utf8');
console.log('Backup written to', backupPath);

const lines = text.split(/\r?\n/);
const out = [];
let i = 0;
const choices = [9.9, 10.0, 11.0];
for (const line of lines) {
  if (line.trim().length === 0 || line.startsWith('#')) {
    out.push(line);
    continue;
  }
  const parts = line.split(',');
  if (parts.length >= 2) {
    // cykliczne wartości
    const val = choices[i % choices.length];
    out.push(parts[0] + ',' + val);
    i++;
  } else {
    out.push(line);
  }
}

fs.writeFileSync(csvPath, out.join('\n'), 'utf8');
console.log('Updated CSV written to', csvPath);

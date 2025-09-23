const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

function normalizeText(s) {
  return (s || '')
    .replace(/[\u200B-\u200D\uFEFF\uFFFC\uFFFD]/g, '')
    .trim();
}

function stripDiacritics(s) {
  return (s || '').normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function isCategoryHeader(line) {
  const n = stripDiacritics(normalizeText(line)).toLowerCase();
  const candidates = [
    'frukt/gront', 'frukt/grönt', 'frukt/gront',
    'kryddor/smaksattare', 'kryddar/smaksattare', 'kryddor/smaksättare',
    'mejeri',
    'kott/fisk/fagel/agg/vego', 'kött/fisk/fågel/ägg/vego',
    'torrvaror',
    'ovrigt', 'övrigt'
  ];
  return candidates.includes(n);
}

function canonicalCategory(line) {
  const n = stripDiacritics(normalizeText(line)).toLowerCase();
  if (['frukt/gront','frukt/grönt'].includes(n)) return 'Frukt/Grönt';
  if (['kryddor/smaksattare','kryddor/smaksättare','kryddar/smaksattare'].includes(n)) return 'Kryddor/smaksättare';
  if (n === 'mejeri') return 'Mejeri';
  if (['kott/fisk/fagel/agg/vego','kött/fisk/fågel/ägg/vego'].includes(n)) return 'Kött/fisk/fågel/ägg/vego';
  if (n === 'torrvaror') return 'Torrvaror';
  if (['ovrigt','övrigt'].includes(n)) return 'Övrigt';
  return normalizeText(line);
}

function parseLine(line) {
  let raw = normalizeText(line);
  if (!raw) return null;
  raw = raw.replace(/^ca\s+/i, '');
  raw = raw.replace(/,(\d)/g, '.$1');
  const m1 = raw.match(/^(\d+(?:\.\d+)?)\s*(st|dl|gram|g|kg|msk|tsk|cm|l)?\s*(.*)$/i);
  if (m1) {
    const amount = parseFloat(m1[1]);
    const unit = (m1[2] || '').toLowerCase() || null;
    const name = m1[3].trim();
    return { name, amount: isNaN(amount) ? null : amount, unit };
  }
  return { name: raw, amount: null, unit: null };
}

function main() {
  const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), 'public', 'week1_shopping_list.txt');
  const jsonOutPath = process.argv[3] ? path.resolve(process.argv[3]) : path.join(process.cwd(), 'app', 'data', 'shoppingLists', 'curated-basics-week.json');
  const xlsxOutPath = process.argv[4] ? path.resolve(process.argv[4]) : path.join(process.cwd(), 'public', 'WEEK_SHOPPING_LIST.xlsx');
  const sheetName = process.argv[5] || 'Inköpslista';

  const txt = fs.readFileSync(inputPath, 'utf8');
  const lines = txt.split(/\r?\n/);

  const data = [];
  let currentCategory = null;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^Inköpslista vecka/i.test(line)) { continue; }
    if (isCategoryHeader(line)) { currentCategory = canonicalCategory(line); continue; }
    if (!currentCategory) continue;
    const item = parseLine(line);
    if (item) data.push({ ...item, category: currentCategory });
  }

  const json = { items: data, generatedAt: new Date().toISOString() };
  fs.writeFileSync(jsonOutPath, JSON.stringify(json, null, 2), 'utf8');

  const rows = data.map((i, idx) => ({ Nr: idx + 1, Kategori: i.category, Namn: i.name, Mängd: i.amount, Enhet: i.unit }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 4 }, { wch: 18 }, { wch: 40 }, { wch: 10 }, { wch: 8 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, xlsxOutPath);

  console.log(`✅ JSON: ${jsonOutPath}`);
  console.log(`✅ Excel: ${xlsxOutPath}`);
  console.log(`📦 Poster: ${data.length}`);
}

main();

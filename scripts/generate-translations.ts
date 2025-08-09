/*
  Usage (node): ts-node scripts/generate-translations.ts
  Best-effort: samlar ihop nyckelsträngar och fyller en.json/es.json via /api/translate
*/
import fs from 'fs';
import path from 'path';

async function translateAll(texts: string[], target: 'en'|'es') {
  const res = await fetch('http://localhost:3000/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: texts, target })
  });
  if (!res.ok) throw new Error('translate failed');
  const data = await res.json();
  return data.translations as string[];
}

async function main() {
  const base = path.join(process.cwd(), 'app/lib/i18n/messages');
  const sv = JSON.parse(fs.readFileSync(path.join(base, 'sv.json'), 'utf-8')) as Record<string,string>;

  const keys = Object.keys(sv);
  const values = keys.map(k => sv[k]);

  const en = await translateAll(values, 'en');
  const es = await translateAll(values, 'es');

  const enMap: Record<string,string> = {};
  const esMap: Record<string,string> = {};
  keys.forEach((k, i) => { enMap[k] = en[i]; esMap[k] = es[i]; });

  fs.writeFileSync(path.join(base, 'en.json'), JSON.stringify(enMap, null, 2));
  fs.writeFileSync(path.join(base, 'es.json'), JSON.stringify(esMap, null, 2));

  console.log('Updated en.json and es.json from sv.json');
}

main().catch(err => { console.error(err); process.exit(1); }); 
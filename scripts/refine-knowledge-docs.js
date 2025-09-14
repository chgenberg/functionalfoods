/*
  TEMP script: refine Swedish copy in knowledge documents via OpenAI
  Usage: OPENAI_API_KEY=... node scripts/refine-knowledge-docs.js
  NOTE: No keys are stored in the repo. Provide the key via environment when running.
*/

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const TEMP_KEY = process.env.OPENAI_API_KEY; // Provide via env only

const openai = new OpenAI({ apiKey: TEMP_KEY });

const FILES = [
  path.join(process.cwd(), 'public', 'data', 'knowledge-documents-basic.json'),
  path.join(process.cwd(), 'public', 'data', 'knowledge-documents-flow.json')
];

async function refineHtml(title, html) {
  const sys = `Du är en svensk copy editor. Förbättra texten språkligt, rätta stavning och grammatik, gör den mer flytande och konsekvent men behåll innebörd, stil och struktur. Behåll rubriker (h1/h2/h3), länkar, listor, betoningar (strong/em) och HTML. Svara ENDAST med förbättrad HTML, utan förklaringar och utan kodblock.`;
  const prompt = `Titel: ${title}\n\nHTML:\n${html}`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 5000
  });
  const out = resp.choices?.[0]?.message?.content?.trim();
  if (!out) throw new Error('No output from model');
  return out;
}

async function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(original);

  // backup
  const backupPath = filePath + '.bak';
  if (!fs.existsSync(backupPath)) fs.writeFileSync(backupPath, original);

  let updatedCount = 0;

  for (let i = 0; i < data.length; i++) {
    const doc = data[i];
    if (!doc || !doc.content || typeof doc.content !== 'string') continue;

    try {
      console.log(`\n✨ Refinerar: ${doc.title} (#${i + 1}/${data.length})`);
      const refined = await refineHtml(doc.title, doc.content);
      if (refined && refined.length > 0 && refined !== doc.content) {
        doc.content = refined;
        updatedCount++;
      }
      await new Promise(r => setTimeout(r, 600));
    } catch (e) {
      console.warn(`⚠️ Kunde inte förbättra "${doc.title}":`, e.message);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✅ Klart: ${filePath} — uppdaterade ${updatedCount} dokument.`);
}

async function main() {
  if (!TEMP_KEY || !TEMP_KEY.startsWith('sk-')) {
    console.error('❌ OPENAI_API_KEY saknas eller är ogiltig. Kör med:\nOPENAI_API_KEY=... node scripts/refine-knowledge-docs.js');
    process.exit(1);
  }
  for (const f of FILES) {
    console.log(`\n📄 Bearbetar: ${f}`);
    await processFile(f);
  }
  console.log('\n✨ Allt klart!');
}

main().catch(err => {
  console.error('Kritiskt fel:', err);
  process.exit(1);
}); 
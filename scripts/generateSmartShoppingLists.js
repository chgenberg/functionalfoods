/*
  Smart weekly shopping list generator using OpenAI
  - Reads raw weekly ingredients via existing API /api/shopping-list/[courseType]/[weekNumber]
  - Asks GPT to normalize, merge, categorize, and standardize units
  - Saves curated JSON to app/data/shoppingLists/curated-<courseType>-week<week>.json

  Usage examples:
  OPENAI_API_KEY=... node scripts/generateSmartShoppingLists.js --course basics --weeks 1,2,3
  OPENAI_API_KEY=... node scripts/generateSmartShoppingLists.js --all
*/

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const API_BASE = process.env.SHOPPING_API_BASE || 'https://ulrika-functional-foods-production.up.railway.app';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { course: null, weeks: [], all: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--course' && args[i + 1]) {
      opts.course = args[++i];
    } else if (a === '--weeks' && args[i + 1]) {
      opts.weeks = args[++i].split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
    } else if (a === '--all') {
      opts.all = true;
    }
  }
  return opts;
}

async function fetchWeeklyIngredients(courseType, week) {
  const url = `${API_BASE}/api/shopping-list/${courseType}/${week}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const data = await res.json();
  return data.ingredients || [];
}

function systemPrompt() {
  return `Du är en expert på att skapa inköpslistor från receptingredienser på svenska.
Givet en lista med råa ingrediensrader ska du:
- Slå samman dubbletter och normalisera enheter (g, kg, ml, l, tsk, msk, st)
- Försök räkna ihop kvantiteter där möjligt
- Standardisera namn (ex: "vitlöksklyfta", "gul lök", "olivolja")
- Sätt kategori: Mejeri, Kött & Fisk, Frukt & Grönt, Skafferi, Kryddor & Såser
- Returnera ENDAST JSON med fält: items: [{ name, amount, unit, category }]
- amount ska vara ett tal eller bråk i text (ex "0.5" eller "1")
- unit får vara en av: g, kg, ml, l, tsk, msk, st
- name ska inte innehålla mängd eller enhet
`;
}

function userPrompt(rawIngredients) {
  const joined = rawIngredients.map(i => {
    if (typeof i === 'string') return i;
    const parts = [i.amount, i.unit, i.name].filter(Boolean).join(' ');
    return parts || i.name || '';
  }).filter(Boolean).join('\n');
  return `RAKA INGREDIENSRADER (en per rad):\n${joined}`;
}

async function curateWeeklyList(courseType, week) {
  console.log(`\n🛒 Curating ${courseType} week ${week}...`);
  const raw = await fetchWeeklyIngredients(courseType, week);
  if (raw.length === 0) {
    console.log('  ⚠️  No ingredients found. Skipping.');
    return null;
  }

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    messages: [
      { role: 'system', content: systemPrompt() },
      { role: 'user', content: userPrompt(raw) }
    ]
  });

  const text = completion.choices[0]?.message?.content?.trim() || '';
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Try to extract JSON block
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Failed to parse model JSON');
    parsed = JSON.parse(match[0]);
  }

  if (!parsed || !Array.isArray(parsed.items)) {
    throw new Error('Model did not return items[]');
  }

  const outDir = path.join(process.cwd(), 'app', 'data', 'shoppingLists');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `curated-${courseType}-week${week}.json`);
  fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), 'utf-8');
  console.log(`  ✅ Saved ${outPath} (${parsed.items.length} items)`);
  return parsed;
}

(async () => {
  try {
    const opts = parseArgs();
    const courses = opts.all ? ['basics', 'flow'] : (opts.course ? [opts.course] : ['basics']);
    const weeks = opts.all ? [1,2,3,4,5,6] : (opts.weeks.length ? opts.weeks : [1]);

    for (const c of courses) {
      for (const w of weeks) {
        await curateWeeklyList(c, w);
        await new Promise(r => setTimeout(r, 1200)); // rate-limit safety
      }
    }

    console.log('\n🎉 Done. API will now use curated lists when present.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})(); 
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

// Input JSON produced by importKostschemaBasic.js
const INPUT_PATH = path.resolve(process.cwd(), 'scripts', 'generatedMealPlans.functional1.json');

// Output files
const CSV_PATH = path.resolve(process.cwd(), 'scripts', 'functional1_week1.csv');
const TXT_PATH = path.resolve(process.cwd(), 'scripts', 'functional1_week1.txt');

const DAY_ORDER = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner'];
const SLOT_LABEL = { breakfast: 'Frukost', lunch: 'Lunch', dinner: 'Middag' };

async function main() {
  const raw = await fsp.readFile(INPUT_PATH, 'utf8');
  const data = JSON.parse(raw);
  const week = data.week1;
  if (!week || !week.days) {
    throw new Error('Invalid input JSON: week1.days missing');
  }

  // Build flat rows
  const rows = [];
  for (const dayName of DAY_ORDER) {
    const meals = week.days[dayName] || {};
    for (const slot of MEAL_SLOTS) {
      const item = meals[slot] || {};
      rows.push({
        day: dayName,
        meal: SLOT_LABEL[slot],
        name: item.name || '',
        recipeLink: item.recipeLink || ''
      });
    }
  }

  // Write CSV (semicolon-separated to be Excel-friendly in sv-SE)
  const csvLines = [];
  csvLines.push(['Dag', 'Måltid', 'Receptnamn', 'Länk'].join(';'));
  for (const r of rows) {
    const safe = (s) => String(s || '').replace(/"/g, '""');
    csvLines.push([`"${safe(r.day)}"`, `"${safe(r.meal)}"`, `"${safe(r.name)}"`, `"${safe(r.recipeLink)}"`].join(';'));
  }
  await fsp.writeFile(CSV_PATH, csvLines.join('\n'), 'utf8');

  // Write TXT (readable block per day)
  const parts = [];
  parts.push(week.title || 'Vecka 1');
  parts.push('');
  for (const dayName of DAY_ORDER) {
    parts.push(`${dayName}`);
    parts.push('-'.repeat(dayName.length));
    const meals = week.days[dayName] || {};
    for (const slot of MEAL_SLOTS) {
      const label = SLOT_LABEL[slot];
      const item = meals[slot] || {};
      const name = item.name || '';
      const link = item.recipeLink ? ` (${item.recipeLink})` : '';
      parts.push(`• ${label}: ${name}${link}`);
    }
    parts.push('');
  }
  await fsp.writeFile(TXT_PATH, parts.join('\n'), 'utf8');

  console.log('✅ Exported to:');
  console.log('CSV:', CSV_PATH);
  console.log('TXT:', TXT_PATH);
}

main().catch((e) => {
  console.error('❌ Export failed:', e.message || e);
  process.exit(1);
}); 
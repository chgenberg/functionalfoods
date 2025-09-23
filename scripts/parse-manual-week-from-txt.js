const fs = require('fs');
const path = require('path');

function isDay(line) {
  return ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'].includes(line.trim());
}

function parse(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);

  const recipes = [];
  let current = null;
  let lastNonEmpty = '';

  const mealTypes = ['Frukost','Lunch','Middag','Mellanmål','Efterrätt','Egenbakat'];
  const dayPattern = /^(Måndag|Tisdag|Onsdag|Torsdag|Fredag|Lördag|Söndag)\s+(.+)$/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Pure day line
    if (isDay(line)) { lastNonEmpty = line; continue; }

    // Day + title in same line → treat trailing part as title hint
    const mDayTitle = line.match(dayPattern);
    if (mDayTitle) { lastNonEmpty = mDayTitle[2].trim(); continue; }

    if (/^Ingredienser$/i.test(line) || /^Gör så här$/i.test(line) || /^Utvalda råvaror$/i.test(line) || /^Topping$/i.test(line) || /^Dekoration$/i.test(line)) { continue; }

    const mTime = line.match(/^(\d+)\s*minuter$/i);
    if (mTime) {
      const title = lastNonEmpty;
      if (title && !isDay(title) && !/minuter$/i.test(title) && !/^Energi\s*:/i.test(title) && !/^Kostschema/i.test(title)) {
        if (current && current.title && (current.nutrition.calories || current.servings)) recipes.push(current);
        current = { title, time: `${mTime[1]} minuter`, mealType: '', servings: null, nutrition: { calories: null, protein: null, carbohydrates: null, fat: null, fiber: null } };
      }
      lastNonEmpty = line;
      continue;
    }

    if (mealTypes.includes(line)) { if (current) current.mealType = line; lastNonEmpty = line; continue; }

    const mPort = line.match(/(\d+)\s*portion(?:er)?/i);
    if (mPort) { if (current) current.servings = parseInt(mPort[1]); lastNonEmpty = line; continue; }

    if (/^Näringsvärden$/i.test(line)) {
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const nl = lines[j].trim();
        if (!nl) break;
        let m;
        if ((m = nl.match(/Energi:\s*(\d+)\s*kcal/i))) { if (current) current.nutrition.calories = parseInt(m[1]); }
        else if ((m = nl.match(/Kolhydrater:\s*(\d+)\s*gram/i))) { if (current) current.nutrition.carbohydrates = parseInt(m[1]); }
        else if ((m = nl.match(/Fett:\s*(\d+)\s*gram/i))) { if (current) current.nutrition.fat = parseInt(m[1]); }
        else if ((m = nl.match(/Protein:\s*(\d+)\s*gram/i))) { if (current) current.nutrition.protein = parseInt(m[1]); }
        else if ((m = nl.match(/Fiber:\s*(\d+)\s*gram/i))) { if (current) current.nutrition.fiber = parseInt(m[1]); }
        else break;
      }
      lastNonEmpty = line;
      continue;
    }

    lastNonEmpty = line;
  }

  if (current && current.title && (current.nutrition.calories || current.servings)) recipes.push(current);
  return recipes;
}

function main() {
  const inPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), 'public', 'week_manual_input.txt');
  const outPath = process.argv[3] ? path.resolve(process.argv[3]) : path.join(process.cwd(), 'public', 'week_manual_parsed.json');
  const data = parse(inPath);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✅ Parsed ${data.length} recipes -> ${outPath}`);
}

if (require.main === module) main();

module.exports = { parse };

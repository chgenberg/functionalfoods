const fs = require('fs');
const path = require('path');

const INPUT = path.resolve(process.cwd(), 'scripts', 'generatedMealPlans.functional1.json');

function stripKcalAndRester(text) {
  if (!text) return '';
  let t = String(text);
  t = t.replace(/\(\s*\d+\s*kcal\s*\)/gi, '').trim();
  t = t.replace(/\s*rester\s*$/i, '').trim();
  return t;
}

function toSlug(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

(function main(){
  const data = JSON.parse(fs.readFileSync(INPUT,'utf8'));
  const week = data.week1;
  for (const dayName of Object.keys(week.days)) {
    const meals = week.days[dayName];
    for (const slot of Object.keys(meals)) {
      const item = meals[slot];
      if (!item || !item.name) continue;
      const base = stripKcalAndRester(item.name);
      const slug = toSlug(base);
      item.recipeLink = `/kunskapsbank/recept/${slug}`;
    }
  }
  fs.writeFileSync(INPUT, JSON.stringify(data, null, 2));
  console.log('✅ Normalized recipeLink slugs to base slugs in', INPUT);
})(); 
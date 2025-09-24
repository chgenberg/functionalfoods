const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

function extractFlowPlans(source) {
  const m = source.match(/export const flowMealPlans[^=]*=\s*({[\s\S]*?});/);
  if (!m) return null;
  // eslint-disable-next-line no-eval
  return eval('(' + m[1] + ')');
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const source = fs.readFileSync(mealPlansPath, 'utf8');
    const flow = extractFlowPlans(source);
    if (!flow) { console.log('flowMealPlans not found'); return; }

    const weeks = [1,2,3,4,5,6];
    const publicRoot = path.join(process.cwd(), 'public');

    const missing = [];
    const all = [];

    for (const w of weeks) {
      const wk = flow[`week${w}`];
      if (!wk) continue;
      for (const [dayName, day] of Object.entries(wk.days || {})) {
        for (const mealType of ['breakfast','lunch','dinner','snack']) {
          const meal = day[mealType];
          if (!meal || !meal.recipeLink) continue;
          const sm = meal.recipeLink.match(/\/kunskapsbank\/recept\/([^\"\s]+)/);
          const slug = sm ? sm[1] : null;
          if (!slug) continue;
          const r = await prisma.recipe.findUnique({ where: { slug } });
          if (!r) continue;
          const url = r.imageUrl || null;
          let exists = false;
          if (url) {
            const abs = path.join(publicRoot, url.replace(/^\//,''));
            exists = fs.existsSync(abs);
          }
          const row = { week: w, day: dayName, meal: mealType, title: r.title, slug: r.slug, imageUrl: url, exists };
          all.push(row);
          if (!exists) missing.push(row);
        }
      }
    }

    console.log(JSON.stringify({ total: all.length, missingCount: missing.length, missing }, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}



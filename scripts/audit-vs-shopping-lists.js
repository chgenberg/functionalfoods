const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

function normalizeTitle(title) {
  return title
    .replace(/\s+rester( från (frysen|fysen))?$/i, '')
    .replace(/^\d+\s+/, '')
    .replace(/\s*\+.*$/, '')
    .replace(/\s*\(.*\).*$/, '')
    .trim();
}

async function loadShoppingLists() {
  const dir = path.join(process.cwd(), 'public', 'Shopping-lists');
  const files = await fs.readdir(dir);
  const jsonFiles = files.filter(f => f.endsWith('_parsed.json'));
  const map = new Map();
  for (const file of jsonFiles) {
    const arr = JSON.parse(await fs.readFile(path.join(dir, file), 'utf8'));
    for (const r of arr) {
      const key = normalizeTitle(r.title);
      map.set(key, r);
    }
  }
  return map;
}

async function loadMealPlanSlugs() {
  const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
  const src = await fs.readFile(mealPlansPath, 'utf8');
  const slugRegex = /"recipeLink"\s*:\s*"([^"]+)"/g;
  const slugs = new Set();
  let m;
  while ((m = slugRegex.exec(src))) {
    const link = m[1];
    const parts = link.split('/');
    const slug = parts[parts.length - 1];
    slugs.add(slug);
  }
  return Array.from(slugs);
}

function nutritionEqual(db, doc) {
  if (!db || !db.perServing || !doc) return false;
  const per = db.perServing;
  const tol = 0.51; // tolerate rounding
  const cmp = (a, b) => Math.abs((a || 0) - (b || 0)) <= tol;
  return (
    cmp(per.energy, doc.calories) &&
    cmp(per.protein, doc.protein) &&
    cmp(per.carbohydrates, doc.carbohydrates) &&
    cmp(per.fat, doc.fat) &&
    cmp(per.fiber, doc.fiber)
  );
}

async function audit() {
  try {
    console.log('🔎 Loading Shopping-lists...');
    const docMap = await loadShoppingLists();

    console.log('📚 Loading DB recipes...');
    const dbRecipes = await prisma.recipe.findMany({ select: { id: true, title: true, slug: true, nutrition: true, servings: true } });

    const nameToRecipe = new Map(dbRecipes.map(r => [normalizeTitle(r.title), r]));

    let ok = 0, mismatched = 0, missingInDb = 0;
    const mismatches = [];

    for (const [title, doc] of docMap.entries()) {
      const db = nameToRecipe.get(title);
      if (!db) {
        missingInDb++;
        mismatches.push({ type: 'missing_in_db', title });
        continue;
      }
      const equal = nutritionEqual(db.nutrition, doc.nutrition);
      if (!equal) {
        mismatched++;
        mismatches.push({ type: 'nutrition_mismatch', title, db: db.nutrition?.perServing || null, doc: doc.nutrition });
      } else {
        ok++;
      }
    }

    console.log(`\n📊 Nutrition check: OK ${ok}, mismatched ${mismatched}, missing ${missingInDb}`);

    // Verify meal plan slugs
    console.log('\n🔗 Verifying meal plan slugs exist as recipes...');
    const slugs = await loadMealPlanSlugs();
    const dbSlugs = new Set(dbRecipes.map(r => r.slug));
    const missingSlugs = slugs.filter(s => !dbSlugs.has(s));
    console.log(`🔎 Slugs missing in DB: ${missingSlugs.length}`);

    const report = { summary: { ok, mismatched, missingInDb, missingSlugs: missingSlugs.length }, missingSlugs, mismatches };
    await fs.writeFile(path.join(process.cwd(), 'recipe-audit-report.json'), JSON.stringify(report, null, 2));
    console.log('💾 Saved detailed report to recipe-audit-report.json');
  } catch (e) {
    console.error('❌ Audit failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

audit();

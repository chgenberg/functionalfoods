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

function nutritionEqual(db, doc) {
  if (!db || !db.perServing || !doc) return false;
  const per = db.perServing;
  const tol = 0.51;
  const cmp = (a, b) => Math.abs((a || 0) - (b || 0)) <= tol;
  return (
    cmp(per.energy, doc.calories) &&
    cmp(per.protein, doc.protein) &&
    cmp(per.carbohydrates, doc.carbohydrates) &&
    cmp(per.fat, doc.fat) &&
    cmp(per.fiber, doc.fiber)
  );
}

async function run() {
  try {
    console.log('🔎 Loading Shopping-lists...');
    const docMap = await loadShoppingLists();
    console.log('📚 Loading DB recipes...');
    const dbRecipes = await prisma.recipe.findMany({ select: { id: true, title: true, slug: true, nutrition: true, servings: true } });
    const nameToRecipe = new Map(dbRecipes.map(r => [normalizeTitle(r.title), r]));

    let updated = 0, skipped = 0, missing = 0;
    const changes = [];

    for (const [title, doc] of docMap.entries()) {
      const db = nameToRecipe.get(title);
      if (!db) { missing++; continue; }
      if (nutritionEqual(db.nutrition, doc.nutrition)) { skipped++; continue; }

      const newNutrition = {
        perServing: {
          energy: doc.nutrition.calories,
          protein: doc.nutrition.protein,
          carbohydrates: doc.nutrition.carbohydrates,
          fat: doc.nutrition.fat,
          fiber: doc.nutrition.fiber
        }
      };

      await prisma.recipe.update({
        where: { id: db.id },
        data: {
          nutrition: newNutrition,
          servings: doc.servings || db.servings || null
        }
      });

      updated++;
      changes.push({ title, slug: db.slug, before: db.nutrition?.perServing || null, after: newNutrition.perServing });
    }

    console.log(`\n📊 Sync complete: updated ${updated}, skipped ${skipped}, missing ${missing}`);
    await fs.writeFile(path.join(process.cwd(), 'nutrition-sync-report.json'), JSON.stringify(changes, null, 2));
    console.log('💾 Saved changes to nutrition-sync-report.json');
  } catch (e) {
    console.error('❌ Sync failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run();

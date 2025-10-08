/*
  Update nutrition for a given recipe slug.
  Usage:
    node scripts/update-recipe-nutrition.js laxfile-med-ratatouille 379 31 16 31 6
    // args: slug kcal fat carbs protein fiber
*/

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const [slug, kcalStr, fatStr, carbsStr, proteinStr, fiberStr] = process.argv.slice(2);
  if (!slug) {
    console.error('Usage: node scripts/update-recipe-nutrition.js <slug> <kcal> <fat> <carbs> <protein> <fiber>');
    process.exit(1);
  }

  // Parse numbers if provided
  const toNum = (v) => (v === undefined ? undefined : Number(v));
  const payload = {
    kcal: toNum(kcalStr),
    fat: toNum(fatStr),
    carbs: toNum(carbsStr),
    protein: toNum(proteinStr),
    fiber: toNum(fiberStr)
  };

  // Remove undefined keys
  Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

  const recipe = await prisma.recipe.findUnique({ where: { slug }, select: { id: true, title: true, nutrition: true } });
  if (!recipe) {
    console.error('❌ Recipe not found for slug:', slug);
    process.exit(1);
  }

  await prisma.recipe.update({ where: { id: recipe.id }, data: { nutrition: payload } });
  const updated = await prisma.recipe.findUnique({ where: { id: recipe.id }, select: { slug: true, nutrition: true } });

  console.log('✅ Updated nutrition for', slug, updated.nutrition);

  // Optional stats: how many recipes missing nutrition
  // Skip complex count to avoid JSON filter validation differences
  console.log('ℹ️ Nutrition updated. (Skipped missing-nutrition scan)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



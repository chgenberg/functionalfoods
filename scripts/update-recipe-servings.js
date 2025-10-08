/*
  Update servings for a recipe by slug.
  Usage:
    node scripts/update-recipe-servings.js <slug> <servings>
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const [slug, servingsStr] = process.argv.slice(2);
  if (!slug || !servingsStr) {
    console.error('Usage: node scripts/update-recipe-servings.js <slug> <servings>');
    process.exit(1);
  }
  const servings = parseInt(servingsStr, 10);
  if (!Number.isFinite(servings) || servings <= 0) {
    console.error('Invalid servings value');
    process.exit(1);
  }

  const recipe = await prisma.recipe.findUnique({ where: { slug }, select: { id: true, title: true, servings: true } });
  if (!recipe) {
    console.error('❌ Recipe not found for slug:', slug);
    process.exit(1);
  }
  await prisma.recipe.update({ where: { id: recipe.id }, data: { servings } });
  console.log(`✅ Updated servings for ${slug} → ${servings}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



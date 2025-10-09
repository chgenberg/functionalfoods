/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const [slug, servingsStr] = process.argv.slice(2);
  const servings = parseInt(servingsStr, 10);
  if (!slug || !servings || servings <= 0) {
    console.error('Usage: node scripts/update-servings.js <slug> <servings>');
    process.exit(1);
  }

  const existing = await prisma.recipe.findUnique({ where: { slug } });
  if (!existing) {
    console.error(`❌ Recipe not found: ${slug}`);
    process.exit(1);
  }

  const updated = await prisma.recipe.update({
    where: { slug },
    data: { servings }
  });

  console.log('✅ Updated servings', { slug: updated.slug, servings: updated.servings });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



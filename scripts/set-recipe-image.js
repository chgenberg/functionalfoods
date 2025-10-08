/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const [slug, imageUrlArg] = process.argv.slice(2);
  if (!slug || !imageUrlArg) {
    console.error('Usage: node scripts/set-recipe-image.js <slug> <imageUrl>');
    process.exit(1);
  }

  const imageUrl = imageUrlArg.startsWith('/') ? imageUrlArg : `/${imageUrlArg}`;

  const recipe = await prisma.recipe.findUnique({ where: { slug } });
  if (!recipe) {
    console.error(`❌ Recipe not found: ${slug}`);
    process.exit(1);
  }

  const updated = await prisma.recipe.update({
    where: { slug },
    data: {
      imageUrl,
      imageAlt: recipe.imageAlt || recipe.title
    }
  });

  console.log('✅ Updated image for recipe', { slug: updated.slug, imageUrl: updated.imageUrl });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



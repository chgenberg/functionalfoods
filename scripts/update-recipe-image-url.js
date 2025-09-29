// update-recipe-image-url.js
const { PrismaClient } = require('@prisma/client');

async function main() {
  const [,, slug, newUrl] = process.argv;
  if (!slug || !newUrl) {
    console.error('Usage: node scripts/update-recipe-image-url.js <slug> <imageUrl>');
    process.exit(1);
  }
  const prisma = new PrismaClient();
  try {
    const res = await prisma.recipe.update({ where: { slug }, data: { imageUrl: newUrl } });
    console.log(`Updated ${res.title} -> ${res.imageUrl}`);
  } catch (e) {
    console.error('Failed to update imageUrl:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();

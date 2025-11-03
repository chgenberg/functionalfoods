/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Find recipe by title containing "Tropisk Smoothiebowl" or slug "smoothie-smoothiebowl"
  let recipe = await prisma.recipe.findFirst({
    where: {
      OR: [
        { title: { contains: 'Tropisk Smoothiebowl', mode: 'insensitive' } },
        { slug: 'smoothie-smoothiebowl' },
        { slug: 'smoothiebowl' }
      ]
    }
  });

  if (!recipe) {
    console.error('❌ Recipe not found');
    process.exit(1);
  }

  console.log('Found recipe:', { slug: recipe.slug, title: recipe.title, currentImageUrl: recipe.imageUrl });

  const updated = await prisma.recipe.update({
    where: { id: recipe.id },
    data: {
      imageUrl: '/Tropisksmoothiebowl.png',
      imageAlt: recipe.imageAlt || recipe.title
    }
  });

  console.log('✅ Updated image for recipe', { 
    slug: updated.slug, 
    title: updated.title,
    imageUrl: updated.imageUrl 
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


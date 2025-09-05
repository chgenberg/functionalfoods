const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function usePlaceholderImages() {
  try {
    console.log('🖼️ Setting placeholder images for all recipes...');

    // Update all recipes to use placeholder image
    const result = await prisma.recipe.updateMany({
      where: {
        imageUrl: {
          not: null
        }
      },
      data: {
        imageUrl: '/images/recipe-placeholder.webp'
      }
    });

    console.log(`✅ Updated ${result.count} recipes to use placeholder images`);

    // Verify the change
    const sample = await prisma.recipe.findMany({
      take: 5,
      select: {
        title: true,
        imageUrl: true
      }
    });

    console.log('\n📸 Sample recipes now using placeholder:');
    sample.forEach(recipe => {
      console.log(`  ${recipe.title}: ${recipe.imageUrl}`);
    });

  } catch (error) {
    console.error('❌ Error setting placeholder images:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  usePlaceholderImages();
}

module.exports = { usePlaceholderImages }; 
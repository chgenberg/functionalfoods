const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking free recipes without proper images...\n');
    
    // Get all free recipes
    const freeRecipes = await prisma.recipe.findMany({
      where: {
        isFree: true,
        isPremium: false,
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Total free recipes: ${freeRecipes.length}\n`);
    
    // Separate by image status
    const withImages = freeRecipes.filter(r => r.imageUrl && !r.imageUrl.includes('placeholder'));
    const withPlaceholders = freeRecipes.filter(r => r.imageUrl && r.imageUrl.includes('placeholder'));
    const withoutImages = freeRecipes.filter(r => !r.imageUrl);
    
    console.log(`With real images: ${withImages.length}`);
    console.log(`With placeholder images: ${withPlaceholders.length}`);
    console.log(`Without images: ${withoutImages.length}\n`);
    
    if (withPlaceholders.length > 0) {
      console.log('Recipes with placeholder images (these show up as gray icons):');
      withPlaceholders.slice(0, 10).forEach(r => {
        console.log(`- ${r.title} (${r.slug})`);
      });
      console.log('');
    }
    
    if (withImages.length > 0) {
      console.log('Recipes with real images (first 10):');
      withImages.slice(0, 10).forEach(r => {
        console.log(`- ${r.title} -> ${r.imageUrl}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 
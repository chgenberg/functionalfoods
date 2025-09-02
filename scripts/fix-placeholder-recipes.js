const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Fixing placeholder recipes...\n');
    
    // Find all recipes with placeholder images
    const placeholderRecipes = await prisma.recipe.findMany({
      where: {
        imageUrl: {
          contains: 'placeholder'
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        isFree: true,
        isPremium: true
      }
    });
    
    console.log(`Found ${placeholderRecipes.length} placeholder recipes:`);
    placeholderRecipes.forEach(r => {
      console.log(`- ${r.title} (free: ${r.isFree}, premium: ${r.isPremium})`);
    });
    
    console.log('\nUpdating placeholder recipes to be premium...');
    
    // Update all placeholder recipes to be premium
    const updateResult = await prisma.recipe.updateMany({
      where: {
        imageUrl: {
          contains: 'placeholder'
        }
      },
      data: {
        isFree: false,
        isPremium: true
      }
    });
    
    console.log(`Updated ${updateResult.count} recipes to premium status.`);
    console.log('\nThese recipes will no longer appear in the free recipe carousel.');
    console.log('They will be accessible to users who have purchased the relevant courses.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 
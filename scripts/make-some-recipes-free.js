const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Making some recipes free for the carousel...\n');
    
    // Select some recipes that should be free (not tied to specific meal plans)
    const recipesToMakeFree = [
      'Het Ratatouille',
      'Smoothie', 
      'Bananmuffin Mandel Kanel',
      'Paronsallad Chevreost Sallad'
    ];
    
    console.log('Making these recipes free:');
    recipesToMakeFree.forEach(title => console.log(`- ${title}`));
    
    const updateResult = await prisma.recipe.updateMany({
      where: {
        title: {
          in: recipesToMakeFree
        }
      },
      data: {
        isFree: true,
        isPremium: false
      }
    });
    
    console.log(`\nUpdated ${updateResult.count} recipes to free status.`);
    console.log('These recipes will now appear in the free recipe carousel with real images!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 
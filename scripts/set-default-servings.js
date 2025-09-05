const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setDefaultServings() {
  try {
    console.log('🍽️ Setting default servings for all recipes...');

    // Update all recipes to have 4 servings as default
    // This is a reasonable default for most recipes
    const updateResult = await prisma.recipe.updateMany({
      where: {
        servings: null
      },
      data: {
        servings: 4
      }
    });

    console.log(`✅ Updated ${updateResult.count} recipes with default 4 servings`);

    // Set specific servings for certain recipe types
    // Smoothies, juices, and drinks typically serve 1-2
    const drinkKeywords = ['smoothie', 'juice', 'juic', 'dryck', 'shake'];
    for (const keyword of drinkKeywords) {
      const drinkUpdate = await prisma.recipe.updateMany({
        where: {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { slug: { contains: keyword } }
          ]
        },
        data: {
          servings: 1
        }
      });
      if (drinkUpdate.count > 0) {
        console.log(`   Set ${drinkUpdate.count} ${keyword} recipes to 1 serving`);
      }
    }

    // Breakfast items often serve 1-2
    const breakfastKeywords = ['frukost', 'gröt', 'müsli', 'musli', 'yoghurt', 'äggröra', 'omelett', 'fralla'];
    for (const keyword of breakfastKeywords) {
      const breakfastUpdate = await prisma.recipe.updateMany({
        where: {
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { slug: { contains: keyword } }
          ]
        },
        data: {
          servings: 2
        }
      });
      if (breakfastUpdate.count > 0) {
        console.log(`   Set ${breakfastUpdate.count} ${keyword} recipes to 2 servings`);
      }
    }

    // Final count
    const finalCount = await prisma.recipe.count({
      where: {
        servings: { not: null }
      }
    });

    console.log(`\n📊 Final result: ${finalCount} recipes now have servings set`);

  } catch (err) {
    console.error('❌ Error setting servings:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  setDefaultServings();
}

module.exports = { setDefaultServings }; 
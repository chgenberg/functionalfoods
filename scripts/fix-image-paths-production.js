const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixImagePathsProduction() {
  try {
    console.log('🔧 Fixing image paths for Next.js in production...');

    // Find all recipes with /public/ in their imageUrl
    const recipes = await prisma.recipe.findMany({
      where: {
        imageUrl: {
          contains: '/public/'
        }
      },
      select: {
        id: true,
        title: true,
        imageUrl: true
      }
    });

    console.log(`Found ${recipes.length} recipes with /public/ in image paths`);

    let updated = 0;
    for (const recipe of recipes) {
      const newUrl = recipe.imageUrl.replace('/public', '');
      
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { imageUrl: newUrl }
      });

      updated++;
      if (updated % 50 === 0) {
        console.log(`Progress: ${updated} recipes updated...`);
      }
    }

    // Also check for recipes that might need the opposite fix
    const recipesWithoutPublic = await prisma.recipe.findMany({
      where: {
        AND: [
          { imageUrl: { not: null } },
          { imageUrl: { not: { startsWith: '/' } } }
        ]
      },
      select: {
        id: true,
        title: true,
        imageUrl: true
      }
    });

    console.log(`Found ${recipesWithoutPublic.length} recipes with relative paths`);

    for (const recipe of recipesWithoutPublic) {
      const newUrl = recipe.imageUrl.startsWith('/') ? recipe.imageUrl : `/${recipe.imageUrl}`;
      
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { imageUrl: newUrl }
      });

      updated++;
      if (updated % 50 === 0) {
        console.log(`Progress: ${updated} recipes updated...`);
      }
    }

    console.log(`✅ Fixed ${updated} recipe image paths for Next.js`);

    // Show some examples
    const examples = await prisma.recipe.findMany({
      take: 5,
      select: {
        title: true,
        imageUrl: true
      }
    });

    console.log('\n📸 Examples of corrected paths:');
    examples.forEach(recipe => {
      console.log(`  ${recipe.title}: ${recipe.imageUrl}`);
    });

  } catch (error) {
    console.error('❌ Error fixing image paths:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixImagePathsProduction();
}

module.exports = { fixImagePathsProduction }; 
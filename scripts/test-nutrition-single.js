const { PrismaClient } = require('@prisma/client');
const { calculateAllNutrition } = require('./calculate-all-nutrition');

const prisma = new PrismaClient();

async function testSingleRecipe() {
  try {
    // Test with "Bananplättar med keso och hallon" first
    const recipe = await prisma.recipe.findFirst({
      where: {
        slug: 'bananplattar-med-keso-och-hallon'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        ingredients: true,
        servings: true,
        nutrition: true
      }
    });

    if (!recipe) {
      console.log('❌ Recipe not found');
      return;
    }

    console.log('📝 Testing nutrition calculation for:', recipe.title);
    console.log('🥘 Ingredients:', recipe.ingredients);
    console.log('👥 Servings:', recipe.servings);
    
    if (recipe.nutrition) {
      console.log('📊 Current nutrition data:', recipe.nutrition);
    }

    // Clear existing nutrition data for testing
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { nutrition: null }
    });

    console.log('\n🧪 Running nutrition calculation...\n');

    // Import the calculation function from the main script
    const { calculateAllNutrition } = require('./calculate-all-nutrition');
    
    // This will process all recipes without nutrition data, including our test recipe
    await calculateAllNutrition();

  } catch (error) {
    console.error('❌ Error in test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSingleRecipe(); 
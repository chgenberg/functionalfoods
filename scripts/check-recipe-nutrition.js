const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecipeNutrition() {
  // Kolla ett specifikt recept
  const recipe = await prisma.recipe.findUnique({
    where: { slug: 'yoghurt-ketomusli' }
  });
  
  if (recipe) {
    console.log('Recipe:', recipe.title);
    console.log('Nutrition data:', JSON.stringify(recipe.nutrition, null, 2));
  } else {
    console.log('Recipe not found');
  }
  
  // Kolla flera recept
  const recipes = await prisma.recipe.findMany({
    where: {
      slug: {
        in: ['torskrygg-med-agghack-och-sparris', 'lax-med-fetaost-och-rostade-rotfrukter']
      }
    },
    select: {
      title: true,
      slug: true,
      nutrition: true
    }
  });
  
  console.log('\nOther recipes:');
  recipes.forEach(r => {
    console.log('\n' + r.title);
    console.log('Nutrition:', JSON.stringify(r.nutrition, null, 2));
  });
  
  await prisma.$disconnect();
}

checkRecipeNutrition();

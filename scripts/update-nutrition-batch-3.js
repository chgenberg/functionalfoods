/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const recipes = [
  {
    searchName: 'Tomatsoppa med kanel och ingefära',
    nutrition: { kcal: 207, protein: 9, carbs: 9, fat: 15, fiber: 0 },
    servings: 3
  },
  {
    searchName: 'Mangosmoothie med spenat',
    nutrition: { kcal: 60, protein: 1, carbs: 19, fat: 1, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Kycklinggryta med garam masala',
    nutrition: { kcal: 718, protein: 53, carbs: 28, fat: 43, fiber: 0 },
    servings: 4
  },
  {
    searchName: 'Köttfärsbiffar med champinjonhattar',
    nutrition: { kcal: 699, protein: 0, carbs: 12, fat: 53, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Snickerskaka',
    nutrition: { kcal: 247, protein: 7, carbs: 11, fat: 19, fiber: 0 },
    servings: 20
  },
  {
    searchName: 'Stekt lax med citronmarinerad broccoli',
    nutrition: { kcal: 389, protein: 31, carbs: 6, fat: 26, fiber: 0 },
    servings: 2
  }
];

async function main() {
  console.log('🍳 Uppdaterar näringsvärden för 6 recept...\n');
  
  for (const recipeData of recipes) {
    // Hitta receptet (flexibel sökning)
    let recipe = await prisma.recipe.findFirst({
      where: { 
        title: { 
          contains: recipeData.searchName.substring(0, 20),
          mode: 'insensitive' 
        }
      }
    });

    if (!recipe) {
      console.error(`❌ Kunde inte hitta: ${recipeData.searchName}`);
      continue;
    }

    // Uppdatera receptet
    const updated = await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        nutrition: recipeData.nutrition,
        servings: recipeData.servings
      }
    });

    console.log(`✅ ${updated.title}`);
    console.log(`   ${recipeData.nutrition.kcal} kcal, ${recipeData.servings} portioner`);
    console.log(`   P: ${recipeData.nutrition.protein}g, K: ${recipeData.nutrition.carbs}g, F: ${recipeData.nutrition.fat}g\n`);
  }
  
  console.log('🎉 Klart!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


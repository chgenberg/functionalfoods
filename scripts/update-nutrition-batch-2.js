/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const recipes = [
  {
    searchName: 'Torskgryta med rotfrukter och curry',
    nutrition: { kcal: 324, protein: 0, carbs: 17, fat: 0, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Kycklingbiffar med mangosalsa',
    nutrition: { kcal: 317, protein: 31, carbs: 19, fat: 10, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Yoghurt med kokosgranola',
    nutrition: { kcal: 434, protein: 10, carbs: 14, fat: 35, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Ratatouille med quinoa och raita',
    nutrition: { kcal: 256, protein: 8, carbs: 32, fat: 8, fiber: 0 },
    servings: 3
  },
  {
    searchName: 'Kokosgranola',
    nutrition: { kcal: 286, protein: 7, carbs: 4, fat: 26, fiber: 0 },
    servings: 15
  }
];

async function main() {
  console.log('🍳 Uppdaterar näringsvärden för 5 recept...\n');
  
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


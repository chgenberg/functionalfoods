/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const recipes = [
  {
    searchName: 'Ägghack med skinka och äpple',
    nutrition: { kcal: 378, protein: 22, carbs: 9, fat: 28, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Wokad lövbiff med nudlar',
    nutrition: { kcal: 456, protein: 38, carbs: 34, fat: 9, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Bondsoppa med vita bönor',
    nutrition: { kcal: 197, protein: 8, carbs: 30, fat: 2, fiber: 0 },
    servings: 4
  },
  {
    searchName: 'Havregrynsgröt med bär och kokos',
    nutrition: { kcal: 290, protein: 9, carbs: 30, fat: 11, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Asiatisk tonfisksallad',
    nutrition: { kcal: 296, protein: 22, carbs: 29, fat: 3, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Yoghurt med kokosgranola, frukt och bär',
    nutrition: { kcal: 501, protein: 11, carbs: 28, fat: 36, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Kycklinggryta med mango och linser',
    nutrition: { kcal: 324, protein: 48, carbs: 36, fat: 9, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Köttfärsbiffar med sötpotatis',
    nutrition: { kcal: 563, protein: 35, carbs: 36, fat: 31, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Mandarin med kanelkräm',
    nutrition: { kcal: 130, protein: 2, carbs: 9, fat: 8, fiber: 0 },
    servings: 1
  }
];

async function main() {
  console.log('🍳 Uppdaterar näringsvärden för VECKA 4 (9 recept)...\n');
  
  let updated = 0;
  let notFound = 0;
  
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
      notFound++;
      continue;
    }

    // Uppdatera receptet
    const result = await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        nutrition: recipeData.nutrition,
        servings: recipeData.servings
      }
    });

    console.log(`✅ ${result.title}`);
    console.log(`   ${recipeData.nutrition.kcal} kcal, ${recipeData.servings} portioner`);
    console.log(`   P: ${recipeData.nutrition.protein}g, K: ${recipeData.nutrition.carbs}g, F: ${recipeData.nutrition.fat}g\n`);
    updated++;
  }
  
  console.log(`🎉 Klart! ${updated} uppdaterade, ${notFound} ej hittade`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


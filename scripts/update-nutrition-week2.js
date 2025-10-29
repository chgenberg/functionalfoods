/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const recipes = [
  {
    searchName: 'Yoghurt med kokosgranola och mango',
    nutrition: { kcal: 454, protein: 10, carbs: 31, fat: 35, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Köttfärssås med glutenfri pasta',
    nutrition: { kcal: 584, protein: 0, carbs: 72, fat: 16, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Spenatbiffar med tomatsallad',
    nutrition: { kcal: 331, protein: 19, carbs: 12, fat: 22, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Kokt ägg med kaviar',
    nutrition: { kcal: 232, protein: 18, carbs: 2, fat: 17, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Kycklingklubbor med kikärtssallad',
    nutrition: { kcal: 713, protein: 63, carbs: 32, fat: 37, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Mortadella med päron',
    nutrition: { kcal: 347, protein: 21, carbs: 9, fat: 25, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Äggröra med tomatsallad',
    nutrition: { kcal: 258, protein: 18, carbs: 6, fat: 19, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Köttfärsbiff med champinjonsås',
    nutrition: { kcal: 511, protein: 33, carbs: 30, fat: 28, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Lax med saffranssås och quinoasallad',
    nutrition: { kcal: 704, protein: 39, carbs: 59, fat: 33, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Bärsmoothie',
    nutrition: { kcal: 123, protein: 2, carbs: 29, fat: 2, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Kyckling med blomkålsmos',
    nutrition: { kcal: 414, protein: 41, carbs: 11, fat: 22, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Glutenfri banankaka',
    nutrition: { kcal: 330, protein: 8, carbs: 21, fat: 22, fiber: 0 },
    servings: 15
  }
];

async function main() {
  console.log('🍳 Uppdaterar näringsvärden för VECKA 2 (12 recept)...\n');
  
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


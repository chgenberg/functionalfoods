/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const recipes = [
  {
    searchName: 'Högrevsburgare med mango',
    nutrition: { kcal: 423, protein: 31, carbs: 19, fat: 26, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Torskgratäng med champinjoner',
    nutrition: { kcal: 247, protein: 35, carbs: 12, fat: 7, fiber: 0 },
    servings: 4
  },
  {
    searchName: 'Omelett med skinka',
    nutrition: { kcal: 241, protein: 21, carbs: 0, fat: 18, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Falafel med grönsaker',
    nutrition: { kcal: 254, protein: 8, carbs: 50, fat: 6, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Ost och skinkmacka med gurka',
    nutrition: { kcal: 267, protein: 0, carbs: 24, fat: 15, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Italiensk pizza med skinka',
    nutrition: { kcal: 657, protein: 49, carbs: 12, fat: 43, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Scampi med mangosallad',
    nutrition: { kcal: 312, protein: 28, carbs: 31, fat: 7, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Fruktsallad med chokladkräm',
    nutrition: { kcal: 263, protein: 6, carbs: 20, fat: 16, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Bananpannkaka med frukt och bär',
    nutrition: { kcal: 295, protein: 10, carbs: 30, fat: 13, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Kyckling med grön curry',
    nutrition: { kcal: 567, protein: 37, carbs: 30, fat: 31, fiber: 0 },
    servings: 2
  }
];

async function main() {
  console.log('🍳 Uppdaterar näringsvärden för VECKA 3 (10 recept)...\n');
  
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


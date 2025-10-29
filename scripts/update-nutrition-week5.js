/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const recipes = [
  {
    searchName: 'Ost och skinkmacka',
    nutrition: { kcal: 271, protein: 10, carbs: 22, fat: 15, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Lax med quinoasallad',
    nutrition: { kcal: 759, protein: 36, carbs: 47, fat: 47, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Biff med blomkålsmos',
    nutrition: { kcal: 457, protein: 37, carbs: 13, fat: 28, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Kesotorsk med mango chutney',
    nutrition: { kcal: 334, protein: 46, carbs: 22, fat: 6, fiber: 0 },
    servings: 3
  },
  {
    searchName: 'Havregrynsgröt med banan',
    nutrition: { kcal: 303, protein: 12, carbs: 37, fat: 9, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Rostad fänkål och rödbeta med getost',
    nutrition: { kcal: 483, protein: 21, carbs: 28, fat: 32, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Kycklingburgare med citronkräm',
    nutrition: { kcal: 326, protein: 32, carbs: 8, fat: 18, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Yoghurt med kokosgranola och bär',
    nutrition: { kcal: 428, protein: 10, carbs: 12, fat: 35, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Laxwok teriyaki',
    nutrition: { kcal: 503, protein: 34, carbs: 41, fat: 21, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Minihamburgare med gorgonzola',
    nutrition: { kcal: 466, protein: 39, carbs: 25, fat: 20, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Äpple med jordnötskräm',
    nutrition: { kcal: 306, protein: 46, carbs: 23, fat: 18, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Äggröra med lax',
    nutrition: { kcal: 355, protein: 26, carbs: 0, fat: 28, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Panerad kyckling med waldorfsallad',
    nutrition: { kcal: 618, protein: 49, carbs: 43, fat: 26, fiber: 0 },
    servings: 2
  }
];

async function main() {
  console.log('🍳 Uppdaterar näringsvärden för VECKA 5 (13 recept)...\n');
  
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


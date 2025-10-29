/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const recipes = [
  {
    searchName: 'Äggröra med bär',
    nutrition: { kcal: 295, protein: 17, carbs: 6, fat: 22, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Korvstroganoff med svartkål',
    nutrition: { kcal: 597, protein: 19, carbs: 17, fat: 51, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Tacosoppa',
    nutrition: { kcal: 163, protein: 16, carbs: 45, fat: 4, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Yoghurt med blåbär och kokosgranola',
    nutrition: { kcal: 435, protein: 10, carbs: 14, fat: 36, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Tofugryta med jordnötter och blomkålsris',
    nutrition: { kcal: 624, protein: 26, carbs: 27, fat: 42, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Tonfisksallad med tomat',
    nutrition: { kcal: 226, protein: 33, carbs: 8, fat: 5, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Keso med persika och jordgubbar',
    nutrition: { kcal: 148, protein: 13, carbs: 12, fat: 4, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Rödbetsquinoa med chevrelax',
    nutrition: { kcal: 651, protein: 39, carbs: 44, fat: 33, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Persisk köttgryta med råris',
    nutrition: { kcal: 844, protein: 42, carbs: 84, fat: 33, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Kladdkaka med grädde och hallon',
    nutrition: { kcal: 295, protein: 7, carbs: 11, fat: 25, fiber: 0 },
    servings: 10
  },
  {
    searchName: 'Blåbärssmoothie',
    nutrition: { kcal: 147, protein: 1, carbs: 38, fat: 2, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Skinkpaj med broccoli och cheddar',
    nutrition: { kcal: 441, protein: 25, carbs: 6, fat: 33, fiber: 0 },
    servings: 6
  }
];

async function main() {
  console.log('🍳 Uppdaterar näringsvärden för VECKA 6 (12 recept)...\n');
  
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


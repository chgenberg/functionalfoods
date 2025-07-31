const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Basic nutrition database for common ingredients (per 100g)
const nutritionDB = {
  // Proteins
  'kyckling': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  'lax': { calories: 208, protein: 20, carbs: 0, fat: 13 },
  'torsk': { calories: 82, protein: 18, carbs: 0, fat: 0.7 },
  'ägg': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  'keso': { calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  'fetaost': { calories: 264, protein: 14, carbs: 4, fat: 21 },
  'lammfärs': { calories: 282, protein: 25, carbs: 0, fat: 20 },
  'köttfärs': { calories: 250, protein: 26, carbs: 0, fat: 15 },
  'tonfisk': { calories: 116, protein: 26, carbs: 0, fat: 0.8 },
  'scampi': { calories: 85, protein: 20, carbs: 0, fat: 0.6 },
  
  // Vegetables
  'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  'blomkål': { calories: 25, protein: 1.9, carbs: 5, fat: 0.3 },
  'spenat': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  'paprika': { calories: 31, protein: 1, carbs: 7, fat: 0.3 },
  'tomat': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
  'gurka': { calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 },
  'avokado': { calories: 160, protein: 2, carbs: 9, fat: 15 },
  'sötpotatis': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  'morot': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  'lök': { calories: 40, protein: 1.1, carbs: 9, fat: 0.1 },
  'vitlök': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5 },
  
  // Grains and legumes
  'quinoa': { calories: 368, protein: 14, carbs: 64, fat: 6 },
  'havregryn': { calories: 389, protein: 17, carbs: 66, fat: 7 },
  'bulgur': { calories: 342, protein: 12, carbs: 76, fat: 1.3 },
  'linser': { calories: 353, protein: 25, carbs: 63, fat: 1.1 },
  'kikärtor': { calories: 164, protein: 8, carbs: 27, fat: 2.6 },
  
  // Fruits
  'banan': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  'äpple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  'hallon': { calories: 52, protein: 1.2, carbs: 12, fat: 0.7 },
  'jordgubbar': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
  'blåbär': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  
  // Oils and fats
  'olivolja': { calories: 884, protein: 0, carbs: 0, fat: 100 },
  'smör': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
  
  // Dairy
  'yoghurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  'grädde': { calories: 345, protein: 2.1, carbs: 2.8, fat: 36 },
  'mjölk': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  
  // Default fallback
  'default': { calories: 50, protein: 2, carbs: 8, fat: 1 }
};

function extractIngredientKey(ingredient) {
  const cleanIngredient = ingredient.toLowerCase()
    .replace(/\d+\s*(g|kg|ml|dl|l|st|krm|msk|tsk)/, '')
    .replace(/[^\w\såäöÅÄÖ]/g, '')
    .trim();
  
  for (const key of Object.keys(nutritionDB)) {
    if (cleanIngredient.includes(key) || key.includes(cleanIngredient.split(' ')[0])) {
      return key;
    }
  }
  
  return 'default';
}

function calculateRecipeNutrition(ingredients, servings = 4) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  for (const ingredient of ingredients) {
    const key = extractIngredientKey(ingredient);
    const nutritionPer100g = nutritionDB[key] || nutritionDB.default;
    
    // Simple estimation: assume each ingredient is about 100g
    totalCalories += nutritionPer100g.calories;
    totalProtein += nutritionPer100g.protein;
    totalCarbs += nutritionPer100g.carbs;
    totalFat += nutritionPer100g.fat;
  }
  
  // Calculate per serving
  const perServing = {
    calories: Math.round(totalCalories / servings),
    protein: Math.round(totalProtein / servings * 10) / 10,
    carbs: Math.round(totalCarbs / servings * 10) / 10,
    fat: Math.round(totalFat / servings * 10) / 10
  };
  
  return perServing;
}

async function addNutritionToRecipes() {
  try {
    console.log('🍎 Adding nutrition data to all recipes...');

    const recipes = await prisma.recipe.findMany();

    console.log(`📋 Found ${recipes.length} recipes with ingredients`);

    let updatedCount = 0;

    for (const recipe of recipes) {
      if (!recipe.ingredients || recipe.ingredients.length === 0) continue;

      const nutrition = calculateRecipeNutrition(recipe.ingredients, recipe.servings || 4);
      
      // Preserve existing course info if it exists
      let nutritionData = nutrition;
      if (recipe.nutrition && typeof recipe.nutrition === 'object') {
        nutritionData = {
          ...nutrition,
          ...(recipe.nutrition.courseId && { courseId: recipe.nutrition.courseId }),
          ...(recipe.nutrition.courseName && { courseName: recipe.nutrition.courseName })
        };
      }

      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { nutrition: nutritionData }
      });

      console.log(`✅ Updated: ${recipe.title} - ${nutrition.calories} kcal`);
      updatedCount++;
    }

    console.log(`\n🎉 Updated ${updatedCount} recipes with nutrition data!`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addNutritionToRecipes(); 
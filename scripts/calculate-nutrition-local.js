const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Local nutrition database for common Swedish ingredients (per 100g)
const localNutritionData = {
  'ägg': { energy: 155, protein: 13, fat: 11, carbohydrates: 0.7, fiber: 0, sugar: 0.7, salt: 0.35 },
  'äg': { energy: 155, protein: 13, fat: 11, carbohydrates: 0.7, fiber: 0, sugar: 0.7, salt: 0.35 },
  'smör': { energy: 717, protein: 0.7, fat: 81, carbohydrates: 0.6, fiber: 0, sugar: 0.6, salt: 0.11 },
  'banan': { energy: 89, protein: 1.1, fat: 0.3, carbohydrates: 23, fiber: 2.6, sugar: 12, salt: 0.001 },
  'keso': { energy: 98, protein: 11, fat: 4.3, carbohydrates: 3.4, fiber: 0, sugar: 3.4, salt: 0.4 },
  'hallon': { energy: 52, protein: 1.2, fat: 0.7, carbohydrates: 12, fiber: 6.5, sugar: 4.4, salt: 0.001 },
  'frysta hallon': { energy: 52, protein: 1.2, fat: 0.7, carbohydrates: 12, fiber: 6.5, sugar: 4.4, salt: 0.001 },
  'vanilj': { energy: 288, protein: 0.1, fat: 0.1, carbohydrates: 13, fiber: 0, sugar: 13, salt: 0.009 },
  'vaniljpulver': { energy: 288, protein: 0.1, fat: 0.1, carbohydrates: 13, fiber: 0, sugar: 13, salt: 0.009 },
  'olivolja': { energy: 884, protein: 0, fat: 100, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.002 },
  'kokosolja': { energy: 862, protein: 0, fat: 100, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0 },
  'rapsolja': { energy: 884, protein: 0, fat: 100, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0 },
  'mjölk': { energy: 64, protein: 3.4, fat: 3.5, carbohydrates: 4.7, fiber: 0, sugar: 4.7, salt: 0.044 },
  'vetemjöl': { energy: 364, protein: 10, fat: 1.3, carbohydrates: 76, fiber: 2.7, sugar: 0.3, salt: 0.002 },
  'salt': { energy: 0, protein: 0, fat: 0, carbohydrates: 0, fiber: 0, sugar: 0, salt: 100 },
  'peppar': { energy: 251, protein: 10, fat: 3.3, carbohydrates: 64, fiber: 25, sugar: 0.6, salt: 0.02 },
  'vitlök': { energy: 149, protein: 6.4, fat: 0.5, carbohydrates: 33, fiber: 2.1, sugar: 1, salt: 0.017 },
  'lök': { energy: 40, protein: 1.1, fat: 0.1, carbohydrates: 9.3, fiber: 1.7, sugar: 4.2, salt: 0.004 },
  'tomat': { energy: 18, protein: 0.9, fat: 0.2, carbohydrates: 3.9, fiber: 1.2, sugar: 2.6, salt: 0.005 },
  'gurka': { energy: 16, protein: 0.7, fat: 0.1, carbohydrates: 3.6, fiber: 0.5, sugar: 1.7, salt: 0.002 },
  'sallad': { energy: 15, protein: 1.4, fat: 0.2, carbohydrates: 2.9, fiber: 1.3, sugar: 2.2, salt: 0.028 },
  'potatis': { energy: 77, protein: 2, fat: 0.1, carbohydrates: 17, fiber: 2.2, sugar: 0.8, salt: 0.006 },
  'lax': { energy: 208, protein: 20, fat: 13, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.59 },
  'kyckling': { energy: 165, protein: 31, fat: 3.6, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.074 },
  'nötfärs': { energy: 250, protein: 20, fat: 18, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.07 },
  'fläskfärs': { energy: 263, protein: 18, fat: 20, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.075 },
  'blandfärs': { energy: 256, protein: 19, fat: 19, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.072 },
  'äpple': { energy: 52, protein: 0.3, fat: 0.2, carbohydrates: 14, fiber: 2.4, sugar: 10, salt: 0.001 },
  'äpplen': { energy: 52, protein: 0.3, fat: 0.2, carbohydrates: 14, fiber: 2.4, sugar: 10, salt: 0.001 },
  'morot': { energy: 41, protein: 0.9, fat: 0.2, carbohydrates: 10, fiber: 2.8, sugar: 4.7, salt: 0.069 },
  'morötter': { energy: 41, protein: 0.9, fat: 0.2, carbohydrates: 10, fiber: 2.8, sugar: 4.7, salt: 0.069 },
  'broccoli': { energy: 34, protein: 2.8, fat: 0.4, carbohydrates: 7, fiber: 2.6, sugar: 1.5, salt: 0.033 },
  'spenat': { energy: 23, protein: 2.9, fat: 0.4, carbohydrates: 3.6, fiber: 2.2, sugar: 0.4, salt: 0.079 },
  'avokado': { energy: 160, protein: 2, fat: 15, carbohydrates: 9, fiber: 6.7, sugar: 0.7, salt: 0.007 },
  'quinoa': { energy: 368, protein: 14, fat: 6.1, carbohydrates: 64, fiber: 7, sugar: 0, salt: 0.005 },
  'ris': { energy: 365, protein: 7.1, fat: 0.7, carbohydrates: 80, fiber: 1.3, sugar: 0.1, salt: 0.005 },
  'linser': { energy: 353, protein: 25, fat: 1.1, carbohydrates: 63, fiber: 11, sugar: 2, salt: 0.006 },
  'kikärtor': { energy: 364, protein: 19, fat: 6, carbohydrates: 61, fiber: 17, sugar: 11, salt: 0.024 },
  'mandel': { energy: 579, protein: 21, fat: 50, carbohydrates: 22, fiber: 12, sugar: 4.4, salt: 0.001 },
  'valnötter': { energy: 654, protein: 15, fat: 65, carbohydrates: 14, fiber: 6.7, sugar: 2.6, salt: 0.002 },
  'chiafrön': { energy: 486, protein: 17, fat: 31, carbohydrates: 42, fiber: 34, sugar: 0, salt: 0.016 },
  'linfrön': { energy: 534, protein: 18, fat: 42, carbohydrates: 29, fiber: 27, sugar: 1.6, salt: 0.03 },
  'majonnäs': { energy: 680, protein: 1.1, fat: 75, carbohydrates: 0.6, fiber: 0, sugar: 0.6, salt: 1.1 },
  'pasta': { energy: 371, protein: 13, fat: 1.5, carbohydrates: 75, fiber: 3.2, sugar: 2.7, salt: 0.006 },
  'yoghurt': { energy: 61, protein: 3.5, fat: 3, carbohydrates: 4.7, fiber: 0, sugar: 4.7, salt: 0.046 },
  'ost': { energy: 402, protein: 25, fat: 33, carbohydrates: 0.1, fiber: 0, sugar: 0.1, salt: 1.6 },
  'fisk': { energy: 206, protein: 22, fat: 12, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.14 },
  'kött': { energy: 250, protein: 26, fat: 15, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.075 }
};

// Parse amount from ingredient string
const parseAmount = (ingredient) => {
  const amountMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*(dl|ml|l|g|kg|tsk|msk|st|krm)?/i);
  
  if (amountMatch) {
    let amount = parseFloat(amountMatch[1]);
    let unit = amountMatch[2]?.toLowerCase() || 'st';
    
    const conversions = {
      'kg': 1000,
      'l': 1000,
      'dl': 100,
      'ml': 1,
      'msk': 15,
      'tsk': 5,
      'krm': 1,
      'st': 100
    };
    
    if (conversions[unit]) {
      amount = amount * conversions[unit];
    }
    
    return { amount, unit: 'g' };
  }
  
  return { amount: 100, unit: 'g' };
};

// Normalize ingredient name to find in local database
const normalizeIngredientName = (ingredient) => {
  const cleaned = ingredient
    .replace(/\d+(\.\d+)?/g, '')
    .replace(/\s*(dl|ml|l|g|kg|tsk|msk|st|port|portion|portioner|burk|paket|påse|krm|tesked|matsked|deciliter|milliliter|liter|gram|kilogram|styck|stycken)\b/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/,.*$/, '')
    .trim()
    .toLowerCase();

  // Check for exact matches first
  if (localNutritionData[cleaned]) {
    return cleaned;
  }

  // Check for partial matches
  for (const key of Object.keys(localNutritionData)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return key;
    }
  }

  return cleaned;
};

// Get nutrition data from local database
const getNutritionData = (ingredientName) => {
  const normalized = normalizeIngredientName(ingredientName);
  const data = localNutritionData[normalized];
  
  if (data) {
    console.log(`✅ Found local nutrition data for: "${ingredientName}" -> "${normalized}"`);
    return {
      name: normalized,
      nutrients: data
    };
  }
  
  console.log(`⚠️ No local nutrition data for: "${ingredientName}" -> "${normalized}"`);
  return null;
};

// Calculate total nutrition for a recipe
const calculateRecipeNutrition = (ingredients, servings) => {
  const nutritionData = {
    energy: 0,
    protein: 0,
    fat: 0,
    carbohydrates: 0,
    fiber: 0,
    sugar: 0,
    salt: 0
  };
  
  console.log(`🧮 Calculating nutrition for ${ingredients.length} ingredients, ${servings} servings`);
  
  for (const ingredient of ingredients) {
    const { amount } = parseAmount(ingredient);
    const data = getNutritionData(ingredient);
    
    if (data) {
      const scale = amount / 100;
      nutritionData.energy += (data.nutrients.energy || 0) * scale;
      nutritionData.protein += (data.nutrients.protein || 0) * scale;
      nutritionData.fat += (data.nutrients.fat || 0) * scale;
      nutritionData.carbohydrates += (data.nutrients.carbohydrates || 0) * scale;
      nutritionData.fiber += (data.nutrients.fiber || 0) * scale;
      nutritionData.sugar += (data.nutrients.sugar || 0) * scale;
      nutritionData.salt += (data.nutrients.salt || 0) * scale;
      
      console.log(`  ✅ ${ingredient}: ${Math.round(data.nutrients.energy * scale)} kcal`);
    } else {
      console.log(`  ⚠️ ${ingredient}: No nutrition data found`);
    }
  }
  
  // Calculate per serving
  const perServing = {
    energy: Math.round(nutritionData.energy / servings),
    protein: Math.round(nutritionData.protein / servings * 10) / 10,
    fat: Math.round(nutritionData.fat / servings * 10) / 10,
    carbohydrates: Math.round(nutritionData.carbohydrates / servings * 10) / 10,
    fiber: Math.round(nutritionData.fiber / servings * 10) / 10,
    sugar: Math.round(nutritionData.sugar / servings * 10) / 10,
    salt: Math.round(nutritionData.salt / servings * 10) / 10
  };
  
  // Calculate per 100g (rough estimate based on total weight)
  const estimatedTotalWeight = ingredients.reduce((total, ingredient) => {
    const { amount } = parseAmount(ingredient);
    return total + amount;
  }, 0);
  
  const per100g = {
    energy: Math.round((nutritionData.energy / estimatedTotalWeight) * 100),
    protein: Math.round((nutritionData.protein / estimatedTotalWeight) * 100 * 10) / 10,
    fat: Math.round((nutritionData.fat / estimatedTotalWeight) * 100 * 10) / 10,
    carbohydrates: Math.round((nutritionData.carbohydrates / estimatedTotalWeight) * 100 * 10) / 10,
    fiber: Math.round((nutritionData.fiber / estimatedTotalWeight) * 100 * 10) / 10,
    sugar: Math.round((nutritionData.sugar / estimatedTotalWeight) * 100 * 10) / 10,
    salt: Math.round((nutritionData.salt / estimatedTotalWeight) * 100 * 10) / 10
  };
  
  return {
    perServing,
    per100g
  };
};

async function calculateAllNutritionLocal() {
  console.log('🚀 Starting local nutrition calculation...');
  
  try {
    // Get all published recipes
    const recipes = await prisma.recipe.findMany({
      where: {
        status: 'PUBLISHED'
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
    
    // Filter out recipes that already have good nutrition data
    const recipesWithoutNutrition = recipes.filter(recipe => 
      !recipe.nutrition || 
      Object.keys(recipe.nutrition).length === 0 ||
      (recipe.nutrition.perServing && recipe.nutrition.perServing.energy === 0)
    );
    
    console.log(`📊 Found ${recipesWithoutNutrition.length} recipes without nutrition data (out of ${recipes.length} total)`);
    
    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    for (const recipe of recipesWithoutNutrition) {
      processed++;
      console.log(`\n📝 Processing recipe ${processed}/${recipesWithoutNutrition.length}: "${recipe.title}"`);
      
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        console.log(`⚠️ Skipping "${recipe.title}" - no ingredients`);
        failed++;
        continue;
      }
      
      try {
        const nutrition = calculateRecipeNutrition(recipe.ingredients, recipe.servings || 4);
        
        // Only update if we got meaningful data
        if (nutrition.perServing.energy > 0) {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: { nutrition }
          });
          
          console.log(`✅ Updated "${recipe.title}" with nutrition data:`);
          console.log(`   Per portion: ${nutrition.perServing.energy} kcal, ${nutrition.perServing.protein}g protein, ${nutrition.perServing.carbohydrates}g carbs, ${nutrition.perServing.fat}g fat`);
          
          successful++;
        } else {
          console.log(`⚠️ Skipping "${recipe.title}" - no recognizable ingredients`);
          failed++;
        }
        
      } catch (error) {
        console.error(`❌ Failed to process "${recipe.title}":`, error.message);
        failed++;
      }
    }
    
    console.log(`\n🎉 Local nutrition calculation completed!`);
    console.log(`📊 Summary:`);
    console.log(`   Total processed: ${processed}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    
  } catch (error) {
    console.error('❌ Error in local nutrition calculation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  calculateAllNutritionLocal();
}

module.exports = { calculateAllNutritionLocal }; 
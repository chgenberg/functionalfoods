const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Livsmedelsverket API endpoint
const LIVSMEDELSVERKET_API = 'https://www7.slv.se/apilivsmedel/api/v1/foods';

// Map Swedish ingredient names to Livsmedelsverket search terms
const normalizeIngredientName = (ingredient) => {
  // Remove measurements and numbers
  const cleaned = ingredient
    .replace(/\d+(\.\d+)?/g, '') // Remove numbers
    .replace(/\s*(dl|ml|l|g|kg|tsk|msk|st|port|portion|portioner|burk|paket|påse|krm|tesked|matsked|deciliter|milliliter|liter|gram|kilogram|styck|stycken)\b/gi, '') // Remove units
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .replace(/,.*$/, '') // Remove everything after comma
    .trim();
  
  // Special mappings for common ingredients
  const mappings = {
    'olivolja': 'olivolja',
    'kokosolja': 'kokosolja',
    'rapsolja': 'rapsolja',
    'smör': 'smör',
    'ägg': 'ägg',
    'äg': 'ägg', // Handle cleaned version
    'mjölk': 'mjölk',
    'vetemjöl': 'vetemjöl',
    'salt': 'salt',
    'peppar': 'peppar',
    'vitlök': 'vitlök',
    'lök': 'lök',
    'tomat': 'tomat',
    'gurka': 'gurka',
    'sallad': 'sallad',
    'potatis': 'potatis',
    'lax': 'lax',
    'kyckling': 'kyckling',
    'nötfärs': 'nötfärs',
    'fläskfärs': 'köttfärs fläsk',
    'blandfärs': 'köttfärs bland',
    'keso': 'keso',
    'hallon': 'hallon',
    'banan': 'banan',
    'äpplen': 'äpple',
    'äpple': 'äpple',
    'morötter': 'morot',
    'morot': 'morot',
    'broccoli': 'broccoli',
    'spenat': 'spenat',
    'avokado': 'avokado',
    'quinoa': 'quinoa',
    'ris': 'ris',
    'pasta': 'pasta',
    'linser': 'linser',
    'kikärtor': 'kikärtor',
    'mandel': 'mandel',
    'valnötter': 'valnötter',
    'chiafrön': 'chiafrön',
    'linfrön': 'linfrön',
    'majonnäs': 'majonnäs',
    'vaniljpulver': 'vanilj',
    'vanilj': 'vanilj',
    'frysta hallon': 'hallon'
  };

  // Check for direct mapping
  for (const [key, value] of Object.entries(mappings)) {
    if (cleaned.toLowerCase().includes(key)) {
      return value;
    }
  }

  return cleaned;
};

// Parse amount from ingredient string
const parseAmount = (ingredient) => {
  const amountMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*(dl|ml|l|g|kg|tsk|msk|st)?/i);
  
  if (amountMatch) {
    let amount = parseFloat(amountMatch[1]);
    let unit = amountMatch[2]?.toLowerCase() || 'st';
    
    // Convert to grams for API
    const conversions = {
      'kg': 1000,
      'l': 1000,
      'dl': 100,
      'ml': 1,
      'msk': 15,
      'tsk': 5,
      'krm': 1,
      'st': 100 // Default 100g per piece
    };
    
    if (conversions[unit]) {
      amount = amount * conversions[unit];
    }
    
    return { amount, unit: 'g' };
  }
  
  return { amount: 100, unit: 'g' }; // Default 100g
};

// Fetch nutrition data from Livsmedelsverket with retry logic
const fetchNutritionData = async (ingredientName, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const searchTerm = normalizeIngredientName(ingredientName);
      console.log(`🔍 Searching for: "${ingredientName}" -> "${searchTerm}" (attempt ${attempt + 1})`);
      
      const response = await fetch(`${LIVSMEDELSVERKET_API}?name=${encodeURIComponent(searchTerm)}&limit=1`);
      
      if (!response.ok) {
        console.error(`❌ Failed to fetch nutrition data for ${searchTerm} (HTTP ${response.status})`);
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
          continue;
        }
        return null;
      }
      
      const data = await response.json();
      
      if (data.foods && data.foods.length > 0) {
        const food = data.foods[0];
        console.log(`✅ Found nutrition data for: ${food.name}`);
        
        // Extract relevant nutrition data per 100g
        return {
          name: food.name,
          nutrients: {
            energy: food.nutrients?.find(n => n.nutrientCode === 'ENERC')?.value || 0,
            protein: food.nutrients?.find(n => n.nutrientCode === 'PROCNT')?.value || 0,
            fat: food.nutrients?.find(n => n.nutrientCode === 'FAT')?.value || 0,
            carbohydrates: food.nutrients?.find(n => n.nutrientCode === 'CHOCDF')?.value || 0,
            fiber: food.nutrients?.find(n => n.nutrientCode === 'FIBTG')?.value || 0,
            sugar: food.nutrients?.find(n => n.nutrientCode === 'SUGAR')?.value || 0,
            salt: food.nutrients?.find(n => n.nutrientCode === 'NA')?.value ? 
              (food.nutrients.find(n => n.nutrientCode === 'NA').value * 2.5) / 1000 : 0, // Convert sodium to salt
          }
        };
      }
      
      console.log(`⚠️ No nutrition data found for: ${searchTerm}`);
      return null;
    } catch (error) {
      console.error(`❌ Error fetching nutrition data for ${ingredientName} (attempt ${attempt + 1}):`, error.message);
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
      }
    }
  }
  return null;
};

// Calculate total nutrition for a recipe
const calculateRecipeNutrition = async (ingredients, servings) => {
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
    const data = await fetchNutritionData(ingredient);
    
    if (data) {
      // Add nutrition values scaled by amount (per 100g)
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
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
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
  
  // Calculate per 100g (approximate)
  const totalWeight = nutritionData.energy > 0 ? (nutritionData.energy / 100) * 100 : 100;
  const per100g = {
    energy: Math.round((nutritionData.energy / totalWeight) * 100),
    protein: Math.round((nutritionData.protein / totalWeight) * 100 * 10) / 10,
    fat: Math.round((nutritionData.fat / totalWeight) * 100 * 10) / 10,
    carbohydrates: Math.round((nutritionData.carbohydrates / totalWeight) * 100 * 10) / 10,
    fiber: Math.round((nutritionData.fiber / totalWeight) * 100 * 10) / 10,
    sugar: Math.round((nutritionData.sugar / totalWeight) * 100 * 10) / 10,
    salt: Math.round((nutritionData.salt / totalWeight) * 100 * 10) / 10
  };
  
  return {
    perServing,
    per100g
  };
};

async function calculateAllNutrition() {
  console.log('🚀 Starting batch nutrition calculation...');
  
  try {
    // Get all published recipes that don't have nutrition data yet
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
    
    // Filter out recipes that already have nutrition data
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
        const nutrition = await calculateRecipeNutrition(recipe.ingredients, recipe.servings || 4);
        
        // Update recipe with nutrition data
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: { nutrition }
        });
        
        console.log(`✅ Updated "${recipe.title}" with nutrition data:`);
        console.log(`   Per portion: ${nutrition.perServing.energy} kcal, ${nutrition.perServing.protein}g protein, ${nutrition.perServing.carbohydrates}g carbs, ${nutrition.perServing.fat}g fat`);
        
        successful++;
        
        // Add delay between recipes to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to process "${recipe.title}":`, error.message);
        failed++;
      }
    }
    
    console.log(`\n🎉 Batch nutrition calculation completed!`);
    console.log(`📊 Summary:`);
    console.log(`   Total processed: ${processed}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    
  } catch (error) {
    console.error('❌ Error in batch nutrition calculation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  calculateAllNutrition();
}

module.exports = { calculateAllNutrition }; 
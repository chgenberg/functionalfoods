const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Same functions as in calculate-all-nutrition.js but for testing
const LIVSMEDELSVERKET_API = 'https://www7.slv.se/apilivsmedel/api/v1/foods';

const normalizeIngredientName = (ingredient) => {
  const cleaned = ingredient
    .replace(/\d+(\.\d+)?/g, '')
    .replace(/\s*(dl|ml|l|g|kg|tsk|msk|st|port|portion|portioner|burk|paket|påse|krm|tesked|matsked|deciliter|milliliter|liter|gram|kilogram|styck|stycken)\b/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/,.*$/, '')
    .trim();
  
  const mappings = {
    'ägg': 'ägg',
    'äg': 'ägg',
    'smör': 'smör',
    'banan': 'banan',
    'keso': 'keso',
    'hallon': 'hallon',
    'frysta hallon': 'hallon',
    'vaniljpulver': 'vanilj',
    'vanilj': 'vanilj'
  };

  for (const [key, value] of Object.entries(mappings)) {
    if (cleaned.toLowerCase().includes(key)) {
      return value;
    }
  }

  return cleaned;
};

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

const fetchNutritionData = async (ingredientName) => {
  try {
    const searchTerm = normalizeIngredientName(ingredientName);
    console.log(`🔍 Searching for: "${ingredientName}" -> "${searchTerm}"`);
    
    const response = await fetch(`${LIVSMEDELSVERKET_API}?name=${encodeURIComponent(searchTerm)}&limit=1`);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch nutrition data for ${searchTerm} (HTTP ${response.status})`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.foods && data.foods.length > 0) {
      const food = data.foods[0];
      console.log(`✅ Found nutrition data for: ${food.name}`);
      
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
            (food.nutrients.find(n => n.nutrientCode === 'NA').value * 2.5) / 1000 : 0,
        }
      };
    }
    
    console.log(`⚠️ No nutrition data found for: ${searchTerm}`);
    return null;
  } catch (error) {
    console.error(`❌ Error fetching nutrition data for ${ingredientName}:`, error.message);
    return null;
  }
};

async function testBananplattarNutrition() {
  try {
    const recipe = await prisma.recipe.findFirst({
      where: { slug: 'bananplattar-med-keso-och-hallon' }
    });

    if (!recipe) {
      console.log('❌ Recipe not found');
      return;
    }

    console.log('📝 Testing:', recipe.title);
    console.log('🥘 Ingredients:', recipe.ingredients);
    
    const nutritionData = {
      energy: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
      fiber: 0,
      sugar: 0,
      salt: 0
    };
    
    for (const ingredient of recipe.ingredients) {
      const { amount } = parseAmount(ingredient);
      console.log(`📏 Parsed amount for "${ingredient}": ${amount}g`);
      
      const data = await fetchNutritionData(ingredient);
      
      if (data) {
        const scale = amount / 100;
        nutritionData.energy += (data.nutrients.energy || 0) * scale;
        nutritionData.protein += (data.nutrients.protein || 0) * scale;
        nutritionData.fat += (data.nutrients.fat || 0) * scale;
        nutritionData.carbohydrates += (data.nutrients.carbohydrates || 0) * scale;
        nutritionData.fiber += (data.nutrients.fiber || 0) * scale;
        nutritionData.sugar += (data.nutrients.sugar || 0) * scale;
        nutritionData.salt += (data.nutrients.salt || 0) * scale;
        
        console.log(`  ✅ Added: ${Math.round(data.nutrients.energy * scale)} kcal`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const servings = recipe.servings || 4;
    const perServing = {
      energy: Math.round(nutritionData.energy / servings),
      protein: Math.round(nutritionData.protein / servings * 10) / 10,
      fat: Math.round(nutritionData.fat / servings * 10) / 10,
      carbohydrates: Math.round(nutritionData.carbohydrates / servings * 10) / 10,
      fiber: Math.round(nutritionData.fiber / servings * 10) / 10,
      sugar: Math.round(nutritionData.sugar / servings * 10) / 10,
      salt: Math.round(nutritionData.salt / servings * 10) / 10
    };
    
    console.log('\n🎉 Final nutrition per serving:');
    console.log(`   Energy: ${perServing.energy} kcal`);
    console.log(`   Protein: ${perServing.protein}g`);
    console.log(`   Carbs: ${perServing.carbohydrates}g`);
    console.log(`   Fat: ${perServing.fat}g`);
    console.log(`   Fiber: ${perServing.fiber}g`);
    console.log(`   Sugar: ${perServing.sugar}g`);
    console.log(`   Salt: ${perServing.salt}g`);
    
    // Update the recipe
    const nutrition = {
      perServing,
      per100g: {
        energy: Math.round(nutritionData.energy / 4), // Rough estimate
        protein: Math.round(nutritionData.protein / 4 * 10) / 10,
        fat: Math.round(nutritionData.fat / 4 * 10) / 10,
        carbohydrates: Math.round(nutritionData.carbohydrates / 4 * 10) / 10,
        fiber: Math.round(nutritionData.fiber / 4 * 10) / 10,
        sugar: Math.round(nutritionData.sugar / 4 * 10) / 10,
        salt: Math.round(nutritionData.salt / 4 * 10) / 10
      }
    };
    
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { nutrition }
    });
    
    console.log('\n✅ Recipe updated with nutrition data!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBananplattarNutrition(); 
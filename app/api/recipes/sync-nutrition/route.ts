import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Livsmedelsverket API endpoint
const LIVSMEDELSVERKET_API = 'https://www7.slv.se/apilivsmedel/api/v1/foods';

// Map Swedish ingredient names to Livsmedelsverket search terms
const normalizeIngredientName = (ingredient: string): string => {
  // Remove measurements and numbers
  const cleaned = ingredient
    .replace(/\d+(\.\d+)?/g, '') // Remove numbers
    .replace(/\s*(dl|ml|l|g|kg|tsk|msk|st|port|portion|portioner|burk|paket|påse|krm|tesked|matsked|deciliter|milliliter|liter|gram|kilogram|styck|stycken)\b/gi, '') // Remove units
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .replace(/,.*$/, '') // Remove everything after comma
    .trim();
  
  // Special mappings for common ingredients
  const mappings: Record<string, string> = {
    'olivolja': 'olivolja',
    'kokosolja': 'kokosolja',
    'rapsolja': 'rapsolja',
    'smör': 'smör',
    'ägg': 'ägg',
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
    'blandfärs': 'köttfärs bland'
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
const parseAmount = (ingredient: string): { amount: number; unit: string } => {
  const amountMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*(dl|ml|l|g|kg|tsk|msk|st)?/i);
  
  if (amountMatch) {
    let amount = parseFloat(amountMatch[1]);
    let unit = amountMatch[2]?.toLowerCase() || 'st';
    
    // Convert to grams for API
    const conversions: Record<string, number> = {
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

// Fetch nutrition data from Livsmedelsverket
const fetchNutritionData = async (ingredientName: string) => {
  try {
    const searchTerm = normalizeIngredientName(ingredientName);
    const response = await fetch(`${LIVSMEDELSVERKET_API}?name=${encodeURIComponent(searchTerm)}&limit=1`);
    
    if (!response.ok) {
      console.error(`Failed to fetch nutrition data for ${searchTerm}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.foods && data.foods.length > 0) {
      const food = data.foods[0];
      
      // Extract relevant nutrition data per 100g
      return {
        name: food.name,
        nutrients: {
          energy: food.nutrients?.find((n: any) => n.nutrientCode === 'ENERC')?.value || 0,
          protein: food.nutrients?.find((n: any) => n.nutrientCode === 'PROCNT')?.value || 0,
          fat: food.nutrients?.find((n: any) => n.nutrientCode === 'FAT')?.value || 0,
          carbohydrates: food.nutrients?.find((n: any) => n.nutrientCode === 'CHOCDF')?.value || 0,
          fiber: food.nutrients?.find((n: any) => n.nutrientCode === 'FIBTG')?.value || 0,
          sugar: food.nutrients?.find((n: any) => n.nutrientCode === 'SUGAR')?.value || 0,
          salt: food.nutrients?.find((n: any) => n.nutrientCode === 'NA')?.value ? 
            (food.nutrients.find((n: any) => n.nutrientCode === 'NA').value * 2.5) / 1000 : 0, // Convert sodium to salt
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching nutrition data for ${ingredientName}:`, error);
    return null;
  }
};

// Calculate total nutrition for a recipe
const calculateRecipeNutrition = async (ingredients: string[], servings: number) => {
  const nutritionData = {
    energy: 0,
    protein: 0,
    fat: 0,
    carbohydrates: 0,
    fiber: 0,
    sugar: 0,
    salt: 0
  };
  
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
  
  return {
    perServing,
    per100g: {
      energy: Math.round(nutritionData.energy / (nutritionData.energy > 0 ? nutritionData.energy / 100 : 1)),
      protein: Math.round(nutritionData.protein / (nutritionData.energy > 0 ? nutritionData.energy / 100 : 1) * 10) / 10,
      fat: Math.round(nutritionData.fat / (nutritionData.energy > 0 ? nutritionData.energy / 100 : 1) * 10) / 10,
      carbohydrates: Math.round(nutritionData.carbohydrates / (nutritionData.energy > 0 ? nutritionData.energy / 100 : 1) * 10) / 10,
      fiber: Math.round(nutritionData.fiber / (nutritionData.energy > 0 ? nutritionData.energy / 100 : 1) * 10) / 10,
      sugar: Math.round(nutritionData.sugar / (nutritionData.energy > 0 ? nutritionData.energy / 100 : 1) * 10) / 10,
      salt: Math.round(nutritionData.salt / (nutritionData.energy > 0 ? nutritionData.energy / 100 : 1) * 10) / 10
    }
  };
};

export async function POST(req: NextRequest) {
  try {
    // Get recipe ID or slug from request
    const { recipeId, recipeSlug } = await req.json();
    
    if (!recipeId && !recipeSlug) {
      return NextResponse.json({ error: 'Recipe ID or slug required' }, { status: 400 });
    }
    
    // Fetch recipe
    const recipe = await prisma.recipe.findFirst({
      where: recipeId ? { id: recipeId } : { slug: recipeSlug }
    });
    
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return NextResponse.json({ error: 'Recipe has no ingredients' }, { status: 400 });
    }
    
    // Calculate nutrition
    const nutrition = await calculateRecipeNutrition(recipe.ingredients, recipe.servings || 4);
    
    // Update recipe with nutrition data
    const updatedRecipe = await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        nutrition: nutrition
      }
    });
    
    return NextResponse.json({
      success: true,
      recipe: {
        id: updatedRecipe.id,
        title: updatedRecipe.title,
        nutrition: updatedRecipe.nutrition
      }
    });
    
  } catch (error) {
    console.error('Error syncing nutrition data:', error);
    return NextResponse.json({ error: 'Failed to sync nutrition data' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Batch sync all recipes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Get recipes without nutrition data
    const recipes = await prisma.recipe.findMany({
      where: {
        nutrition: {
          equals: Prisma.JsonNull
        }
      },
      skip: offset,
      take: limit
    });
    
    const results = [];
    
    for (const recipe of recipes) {
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        try {
          const nutrition = await calculateRecipeNutrition(recipe.ingredients, recipe.servings || 4);
          
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: { nutrition }
          });
          
          results.push({
            id: recipe.id,
            title: recipe.title,
            status: 'success',
            nutrition
          });
        } catch (error) {
          results.push({
            id: recipe.id,
            title: recipe.title,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });
    
  } catch (error) {
    console.error('Error batch syncing nutrition data:', error);
    return NextResponse.json({ error: 'Failed to batch sync nutrition data' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 
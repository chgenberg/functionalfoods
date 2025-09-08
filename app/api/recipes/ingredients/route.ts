import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mealPlans, flowMealPlans, energyMealPlans } from '../../../data/mealPlans';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface IngredientRequest {
  recipeSlug: string;
  servings?: number;
  courseType?: 'basics' | 'flow' | 'energy';
  weekNumber?: number;
}

// Check if recipe appears as "rester" later in the same week
function checkForResterLogic(recipeSlug: string, courseType?: string, weekNumber?: number): number {
  if (!courseType || !weekNumber) return 1;
  
  // Get the right meal plan
  let courseMealPlans;
  if (courseType === 'basics') {
    courseMealPlans = mealPlans;
  } else if (courseType === 'flow') {
    courseMealPlans = flowMealPlans;
  } else if (courseType === 'energy') {
    courseMealPlans = energyMealPlans;
  } else {
    return 1;
  }
  
  const weekKey = `week${weekNumber}` as keyof typeof courseMealPlans;
  const weekData = courseMealPlans[weekKey];
  if (!weekData) return 1;
  
  let recipeCount = 0;
  let hasRester = false;
  
  // Check all days in the week for this recipe
  for (const day of Object.values(weekData.days)) {
    const allMeals = [day.breakfast, day.lunch, day.dinner, day.snack, day.dessert].filter(Boolean);
    for (const meal of allMeals) {
      if (meal && meal.recipeLink?.includes(recipeSlug)) {
        recipeCount++;
        if (meal.name.toLowerCase().includes('rester')) {
          hasRester = true;
        }
      }
    }
  }
  
  // If recipe appears multiple times and one is "rester", make 2 portions for freezing
  return (recipeCount > 1 && hasRester) ? 2 : 1;
}

// Parse ingredient string to extract amount and unit
function parseIngredient(ingredient: string): { amount: number | null; unit: string | null; name: string } {
  const patterns = [
    // "2 st ägg" or "100 ml mjölk"
    /^(\d+(?:[.,]\d+)?)\s*(st|stycken|styck|g|kg|ml|dl|l|msk|tsk|krm|burk|burkar|påse|påsar|förpackning|förpackningar)\s+(.+)$/i,
    // "½ dl olja" or "¼ tsk salt"
    /^([½¼¾⅓⅔]|\d+(?:[.,]\d+)?)\s*(dl|ml|l|msk|tsk|krm|g|kg)\s+(.+)$/i,
    // "1 ägg" (no unit)
    /^(\d+(?:[.,]\d+)?)\s+(.+)$/,
    // "ägg (2 st)" - amount in parentheses
    /^(.+?)\s*\((\d+(?:[.,]\d+)?)\s*(st|stycken|styck|g|kg|ml|dl|l|msk|tsk|krm|burk|burkar|påse|påsar)?\)$/i
  ];
  
  for (const pattern of patterns) {
    const match = ingredient.match(pattern);
    if (match) {
      let amount: number | null = null;
      let unit: string | null = null;
      let name: string = '';
      
      if (pattern === patterns[3]) { // Parentheses pattern
        name = match[1].trim();
        const amountStr = match[2].replace(',', '.');
        amount = parseFloat(amountStr);
        unit = match[3] || 'st';
      } else if (pattern === patterns[2]) { // No unit pattern
        const amountStr = match[1].replace(',', '.');
        amount = parseFloat(amountStr);
        name = match[2].trim();
      } else {
        const amountStr = match[1];
        // Handle fractions
        if (amountStr === '½') amount = 0.5;
        else if (amountStr === '¼') amount = 0.25;
        else if (amountStr === '¾') amount = 0.75;
        else if (amountStr === '⅓') amount = 0.33;
        else if (amountStr === '⅔') amount = 0.67;
        else amount = parseFloat(amountStr.replace(',', '.'));
        
        unit = match[2];
        name = match[3].trim();
      }
      
      return { amount, unit, name };
    }
  }
  
  // No pattern matched, return as-is
  return { amount: null, unit: null, name: ingredient.trim() };
}

// Scale ingredient based on servings and rester logic
function scaleIngredient(
  ingredient: string, 
  targetServings: number, 
  originalServings: number = 4,
  resterMultiplier: number = 1
): string {
  const parsed = parseIngredient(ingredient);
  
  if (!parsed.amount) {
    return ingredient; // Can't scale without amount
  }
  
  const scaleFactor = (targetServings / originalServings) * resterMultiplier;
  const scaledAmount = parsed.amount * scaleFactor;
  
  // Format scaled amount
  let formattedAmount: string;
  if (scaledAmount % 1 === 0) {
    formattedAmount = scaledAmount.toString();
  } else if (Math.abs(scaledAmount - 0.5) < 0.01) {
    formattedAmount = '½';
  } else if (Math.abs(scaledAmount - 0.25) < 0.01) {
    formattedAmount = '¼';
  } else if (Math.abs(scaledAmount - 0.75) < 0.01) {
    formattedAmount = '¾';
  } else if (Math.abs(scaledAmount - 0.33) < 0.01) {
    formattedAmount = '⅓';
  } else if (Math.abs(scaledAmount - 0.67) < 0.01) {
    formattedAmount = '⅔';
  } else {
    formattedAmount = scaledAmount.toFixed(1).replace('.', ',');
  }
  
  if (parsed.unit) {
    return `${formattedAmount} ${parsed.unit} ${parsed.name}`;
  } else {
    return `${formattedAmount} ${parsed.name}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { recipeSlug, servings = 1, courseType, weekNumber }: IngredientRequest = await request.json();
    
    if (!recipeSlug) {
      return NextResponse.json({ error: 'Recipe slug is required' }, { status: 400 });
    }
    
    // Get recipe from database
    const recipe = await prisma.recipe.findFirst({
      where: { slug: recipeSlug },
      select: {
        id: true,
        title: true,
        slug: true,
        ingredients: true,
        ingredientsStructured: true,
        servings: true
      }
    });
    
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    // Check if we need to make extra portions for "rester"
    const resterMultiplier = checkForResterLogic(recipeSlug, courseType, weekNumber);
    const originalServings = recipe.servings || 4;
    
    console.log(`🥘 Recipe: ${recipe.title}`);
    console.log(`📊 Servings: ${servings}, Original: ${originalServings}, Rester multiplier: ${resterMultiplier}`);
    
    let scaledIngredients: string[] = [];
    
    // Use structured ingredients if available
    if (recipe.ingredientsStructured && Array.isArray(recipe.ingredientsStructured)) {
      scaledIngredients = recipe.ingredientsStructured.map((item: any) => {
        const baseAmount = item.baseAmount || 0;
        const baseUnit = item.baseUnit || '';
        const label = item.label || '';
        
        if (baseAmount > 0) {
          const scaleFactor = (servings / originalServings) * resterMultiplier;
          const scaledAmount = baseAmount * scaleFactor;
          
          // Format amount
          let formattedAmount: string;
          if (scaledAmount % 1 === 0) {
            formattedAmount = scaledAmount.toString();
          } else if (Math.abs(scaledAmount - 0.5) < 0.01) {
            formattedAmount = '½';
          } else if (Math.abs(scaledAmount - 0.25) < 0.01) {
            formattedAmount = '¼';
          } else if (Math.abs(scaledAmount - 0.75) < 0.01) {
            formattedAmount = '¾';
          } else {
            formattedAmount = scaledAmount.toFixed(1).replace('.', ',');
          }
          
          return baseUnit ? `${formattedAmount} ${baseUnit} ${label}` : `${formattedAmount} ${label}`;
        } else {
          return label;
        }
      });
    } else if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      // Fallback to regular ingredients array
      scaledIngredients = recipe.ingredients.map(ing => 
        scaleIngredient(ing, servings, originalServings, resterMultiplier)
      );
    }
    
    return NextResponse.json({
      recipe: {
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        originalServings,
        requestedServings: servings,
        resterMultiplier,
        totalPortions: servings * resterMultiplier
      },
      ingredients: scaledIngredients,
      note: resterMultiplier > 1 ? `Detta recept lagar ${resterMultiplier} portioner - frys in en portion för senare användning som "rester".` : null
    }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
    
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json({ error: 'Failed to fetch ingredients' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 
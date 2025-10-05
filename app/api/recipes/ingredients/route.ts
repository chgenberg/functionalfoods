import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/app/lib/database';

export const dynamic = 'force-dynamic';

interface IngredientRequest {
  recipeSlug: string;
  servings?: number;
  courseType?: string;
  weekNumber?: number;
}

// Helper function to scale ingredient amounts
function scaleIngredient(ingredient: string, targetServings: number, originalServings: number, multiplier: number = 1): string {
  const scaleFactor = (targetServings / originalServings) * multiplier;
  
  return ingredient.replace(/(\d+(?:[.,]\d+)?)\s*(kg|g|mg|l|dl|cl|ml|msk|tsk|krm|st|st\.|stycken|styck|burk|burkar|påse|påsar|förpackning|förpackningar|klyfta|klyftor)?/gi, 
    (match, amount, unit) => {
      const numAmount = parseFloat(amount.replace(',', '.'));
      if (isNaN(numAmount) || !isFinite(numAmount)) {
        return match;
      }
      let scaledAmount = numAmount * scaleFactor;
      
      // Format numbers nicely
      if (scaledAmount % 1 === 0) {
        return `${scaledAmount}${unit ? ' ' + unit : ''}`;
      } else if (scaledAmount < 1) {
        if (Math.abs(scaledAmount - 0.5) < 0.01) return `0.5${unit ? ' ' + unit : ''}`;
        if (Math.abs(scaledAmount - 0.25) < 0.01) return `0.25${unit ? ' ' + unit : ''}`;
        if (Math.abs(scaledAmount - 0.75) < 0.01) return `0.75${unit ? ' ' + unit : ''}`;
        return `${scaledAmount.toFixed(1)}${unit ? ' ' + unit : ''}`;
      } else {
        const formatted = scaledAmount.toFixed(1);
        if (formatted.endsWith('.0')) {
          return `${Math.round(scaledAmount)}${unit ? ' ' + unit : ''}`;
        }
        return `${formatted}${unit ? ' ' + unit : ''}`;
      }
    }
  );
}

export async function GET() {
  try {
    const ingredients = await prisma.recipe.findMany({
      select: {
        ingredients: true,
      },
    });

    const allIngredients = ingredients.flatMap((r) => r.ingredients);

    const uniqueIngredients = [...new Set(allIngredients)];

    return NextResponse.json(uniqueIngredients.sort());
  } catch (error) {
    console.error('Failed to fetch ingredients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
    
    // Check if we need to make extra portions for "rester" (simplified - always return 1)
    const resterMultiplier = 1;
    const originalServings = recipe.servings || 4;
    
    console.log(`🥘 Recipe: ${recipe.title}`);
    console.log(`📊 Servings: ${servings}, Original: ${originalServings}, Rester multiplier: ${resterMultiplier}`);
    
    let scaledIngredients: string[] = [];
    
    // Use structured ingredients if available
    if (recipe.ingredientsStructured && Array.isArray(recipe.ingredientsStructured)) {
      scaledIngredients = recipe.ingredientsStructured.map((item: any) => {
        const baseAmount = item.amount || 0; // amounts in DB are per whole recipe
        const baseUnit = item.unit || '';
        const label = item.name || '';
        
        if (baseAmount > 0) {
          // Scale relative to recipe's original servings (not per-portion)
          const scaledAmount = baseAmount * (servings / originalServings) * resterMultiplier;
          
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
  }
} 
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mealPlans, flowMealPlans, type WeekMealPlan } from '@/app/data/mealPlans';

const prisma = new PrismaClient();

// Kategorier för ingredienser
const CATEGORIES: Record<string, string[]> = {
  'Mejeri': ['mjölk', 'ost', 'yoghurt', 'smör', 'grädde', 'kvarg', 'keso', 'crème fraiche', 'fetaost', 'mozzarella', 'parmesan', 'ägg', 'halloumi', 'ricotta', 'mascarpone'],
  'Kött & Fisk': ['kyckling', 'lax', 'torsk', 'nötkött', 'fläsk', 'kalkon', 'lamm', 'räkor', 'tonfisk', 'bacon', 'köttfärs', 'korv', 'skinka'],
  'Frukt & Grönt': ['tomat', 'gurka', 'sallad', 'paprika', 'lök', 'vitlök', 'morötter', 'broccoli', 'spenat', 'äpple', 'banan', 'citron', 'lime', 'avokado', 'potatis', 'sötpotatis', 'zucchini', 'aubergine', 'svamp', 'champinjoner', 'sparris', 'blomkål', 'vitkål', 'rödkål'],
  'Skafferi': ['mjöl', 'pasta', 'ris', 'quinoa', 'bröd', 'havregryn', 'olivolja', 'salt', 'peppar', 'socker', 'bulgur', 'couscous', 'linser', 'bönor', 'kikärtor'],
  'Kryddor & Såser': ['basilika', 'oregano', 'timjan', 'persilja', 'soja', 'senap', 'vinäger', 'ketchup', 'majonnäs', 'sriracha', 'curry', 'paprikapulver', 'kanel', 'kardemumma'],
  'Övrigt': []
};

function categorizeIngredient(ingredient: string): string {
  const lowerIngredient = ingredient.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(keyword => lowerIngredient.includes(keyword))) {
      return category;
    }
  }
  
  return 'Övrigt';
}

function parseIngredientLine(line: string): { name: string; amount: string; unit: string } | null {
  // Common patterns for ingredient lines
  // Examples: "2 dl mjölk", "400 g kyckling", "1 msk olivolja"
  const patterns = [
    /^(\d+(?:[.,]\d+)?)\s*(dl|ml|l|g|kg|msk|tsk|st|krm)?\s+(.+)$/i,
    /^(.+?)\s*[:–]\s*(\d+(?:[.,]\d+)?)\s*(dl|ml|l|g|kg|msk|tsk|st|krm)?$/i,
  ];
  
  for (const pattern of patterns) {
    const match = line.trim().match(pattern);
    if (match) {
      if (pattern === patterns[0]) {
        return {
          amount: match[1],
          unit: match[2] || 'st',
          name: match[3].trim()
        };
      } else {
        return {
          name: match[1].trim(),
          amount: match[2],
          unit: match[3] || 'st'
        };
      }
    }
  }
  
  // If no pattern matches, return the whole line as ingredient name
  return {
    name: line.trim(),
    amount: '1',
    unit: 'st'
  };
}

export async function GET(
  request: Request,
  { params }: { params: { courseType: string; weekNumber: string } }
) {
  try {
    const { courseType, weekNumber } = params;
    const weekNum = parseInt(weekNumber);
    
    // Get meal plan for the week
    const weekKey = `week${weekNum}`;
    const weekMeals: WeekMealPlan | undefined = courseType === 'basics' 
      ? mealPlans[weekKey]
      : flowMealPlans[weekKey];
      
    console.log(`Debug: courseType=${courseType}, weekKey=${weekKey}, weekMeals exists=${!!weekMeals}`);
    if (weekMeals) {
      console.log('Days keys:', Object.keys(weekMeals.days));
    }
      
    if (!weekMeals || !weekMeals.days) {
      console.log('Week not found:', { courseType, weekKey, hasWeekMeals: !!weekMeals });
      return NextResponse.json({ error: 'Week not found' }, { status: 404 });
    }
    
    // Collect all recipe links from the week
    const recipeLinks = new Set<string>();
    
    // Handle both day1/day2 format (basics) and Måndag/Tisdag format (flow)
    Object.entries(weekMeals.days).forEach(([dayKey, day]) => {
      console.log(`Processing day: ${dayKey}`, day);
      if (day.breakfast?.recipeLink) {
        console.log('Adding breakfast:', day.breakfast.recipeLink);
        recipeLinks.add(day.breakfast.recipeLink);
      }
      if (day.lunch?.recipeLink) {
        console.log('Adding lunch:', day.lunch.recipeLink);
        recipeLinks.add(day.lunch.recipeLink);
      }
      if (day.dinner?.recipeLink) {
        console.log('Adding dinner:', day.dinner.recipeLink);
        recipeLinks.add(day.dinner.recipeLink);
      }
      if (day.snack?.recipeLink) recipeLinks.add(day.snack.recipeLink);
      if (day.dessert?.recipeLink) recipeLinks.add(day.dessert.recipeLink);
    });
    
    console.log('Recipe links found:', Array.from(recipeLinks));
    
    // Fetch recipes from database
    const recipes = await prisma.recipe.findMany({
      where: {
        slug: { in: Array.from(recipeLinks) }
      },
      select: {
        title: true,
        slug: true,
        ingredients: true
      }
    });
    
    // Parse and aggregate ingredients
    const ingredientMap = new Map<string, { amount: number; unit: string; category: string }>();
    
    recipes.forEach(recipe => {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach((ingredient: any) => {
          if (typeof ingredient === 'string') {
            const parsed = parseIngredientLine(ingredient);
            if (parsed) {
              const key = `${parsed.name.toLowerCase()}_${parsed.unit}`;
              const existing = ingredientMap.get(key);
              
              if (existing) {
                existing.amount += parseFloat(parsed.amount) || 1;
              } else {
                ingredientMap.set(key, {
                  amount: parseFloat(parsed.amount) || 1,
                  unit: parsed.unit,
                  category: categorizeIngredient(parsed.name)
                });
              }
            }
          }
        });
      }
    });
    
    // Convert to array format
    const ingredients = Array.from(ingredientMap.entries()).map(([key, data]) => {
      const [name] = key.split('_');
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount: data.amount.toString(),
        unit: data.unit,
        category: data.category,
        checked: false
      };
    });
    
    // Sort by category and name
    ingredients.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
    
    return NextResponse.json({
      week: weekNum,
      courseType,
      recipeCount: recipes.length,
      ingredients,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error generating shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to generate shopping list' },
      { status: 500 }
    );
  }
} 
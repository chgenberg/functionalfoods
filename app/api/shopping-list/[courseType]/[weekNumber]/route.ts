import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mealPlans, flowMealPlans, type WeekMealPlan } from '@/app/data/mealPlans';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Ingredienser som ska filtreras bort från inköpslistan
const EXCLUDED_INGREDIENTS = [
  'vatten',
  'kranvatten',
  'ljummet vatten',
  'kallt vatten',
  'varmt vatten',
  'egenbakat',
  'hemgjord',
  'hemgjort',
  'färdiglagad',
  'färdiglagat',
  'färdigkokt',
  'kokat',
  'tillagad',
  'tillagat',
  'uppvärmd',
  'uppvärmt',
  'rest',
  'rester',
  'kvar',
  'sparad',
  'sparat'
];

// Synonymer för ingredienser som ska slås samman
const INGREDIENT_SYNONYMS: Record<string, string> = {
  'blomkålshuvud': 'blomkål',
  'blomkålsbit': 'blomkål',
  'färsk mango': 'mango',
  'mango färsk': 'mango',
  'grekisk yoghurt': 'grekisk yoghurt',
  'grekisk naturell yoghurt': 'grekisk yoghurt',
  'naturell grekisk yoghurt': 'grekisk yoghurt',
  'persiljekvist': 'persilja',
  'färsk persilja': 'persilja',
  'citronklyfta': 'citron',
  'citronskiva': 'citron',
  'vitlöksklyfta': 'vitlök',
  'vitlökstår': 'vitlök',
  'salladslök': 'lök',
  'gul lök': 'lök',
  'gul paprika': 'paprika',
  'röd paprika': 'paprika',
  'grön paprika': 'paprika',
  'isbergssalladshuvud': 'isbergssallad',
  'ruccolasallad': 'ruccola',
  'salt och svartpeppar': 'salt och peppar',
  'salt och peppar': 'salt och peppar'
};

// Kategorier för ingredienser
const CATEGORIES: Record<string, string[]> = {
  'Mejeri': ['mjölk', 'ost', 'yoghurt', 'smör', 'grädde', 'kvarg', 'keso', 'crème fraiche', 'fetaost', 'mozzarella', 'parmesan', 'ägg', 'halloumi', 'ricotta', 'mascarpone', 'gräddfil'],
  'Kött & Fisk': ['kyckling', 'lax', 'torsk', 'nötkött', 'fläsk', 'kalkon', 'lamm', 'räkor', 'tonfisk', 'bacon', 'köttfärs', 'korv', 'skinka', 'nötfärs', 'kycklingfilé', 'kycklinglårfilé', 'kallrökt'],
  'Frukt & Grönt': ['tomat', 'gurka', 'sallad', 'paprika', 'lök', 'vitlök', 'morötter', 'broccoli', 'spenat', 'äpple', 'banan', 'citron', 'lime', 'avokado', 'potatis', 'sötpotatis', 'zucchini', 'aubergine', 'svamp', 'champinjoner', 'sparris', 'blomkål', 'vitkål', 'rödkål', 'rödlök', 'squash', 'mango', 'ananas', 'sugarsnaps', 'sockerärtor', 'rucola', 'isberg', 'hjärtsallad', 'selleri', 'cocktailtomater', 'bifftomater'],
  'Skafferi': ['mjöl', 'pasta', 'ris', 'quinoa', 'bröd', 'havregryn', 'olivolja', 'salt', 'peppar', 'socker', 'bulgur', 'couscous', 'linser', 'bönor', 'kikärtor', 'ketomüsli', 'hampafrön', 'solroskärnor', 'pumpafrön', 'sesamfrön', 'mandelmjölk'],
  'Kryddor & Såser': ['basilika', 'oregano', 'timjan', 'persilja', 'soja', 'senap', 'vinäger', 'ketchup', 'majonnäs', 'sriracha', 'curry', 'paprikapulver', 'kanel', 'kardemumma', 'chili', 'ingefära', 'koriander', 'örter', 'pesto', 'ketjap', 'honung', 'spiskummin'],
  'Övrigt': []
};

function shouldExcludeIngredient(ingredient: string): boolean {
  const lowerIngredient = ingredient.toLowerCase().trim();
  
  return EXCLUDED_INGREDIENTS.some(excluded => 
    lowerIngredient.includes(excluded.toLowerCase())
  );
}

function normalizeIngredientName(ingredient: string): string {
  const lowerIngredient = ingredient.toLowerCase().trim();
  
  // Check for synonyms first
  for (const [synonym, canonical] of Object.entries(INGREDIENT_SYNONYMS)) {
    if (lowerIngredient.includes(synonym.toLowerCase())) {
      return canonical;
    }
  }
  
  return ingredient.trim();
}

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
  // Enhanced patterns for ingredient lines
  // Examples: "2 dl mjölk", "400 g kyckling", "1 msk olivolja", "½ dl gräddfil"
  const patterns = [
    // Standard: "2 dl mjölk", "400 g kyckling"
    /^(\d+(?:[.,]\d+)?|½|¼|¾|1\/2|1\/4|3\/4)\s*(dl|ml|l|g|kg|msk|tsk|st|krm)\s+(.+)$/i,
    // With fractions: "1/2 dl hampafrön"
    /^(\d+\/\d+)\s+(dl|ml|l|g|kg|msk|tsk|st|krm)\s+(.+)$/i,
    // Amount at end: "Mjölk: 2 dl"
    /^(.+?)\s*[:–]\s*(\d+(?:[.,]\d+)?|½|¼|¾)\s*(dl|ml|l|g|kg|msk|tsk|st|krm)?$/i,
  ];
  
  for (const pattern of patterns) {
    const match = line.trim().match(pattern);
    if (match) {
      if (pattern === patterns[0] || pattern === patterns[1]) {
        // Convert fractions to decimals
        let amount = match[1];
        if (amount === '½' || amount === '1/2') amount = '0.5';
        else if (amount === '¼' || amount === '1/4') amount = '0.25';
        else if (amount === '¾' || amount === '3/4') amount = '0.75';
        
        return {
          amount: amount,
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
    
    // Try curated list first
    try {
      const curatedPath = path.join(process.cwd(), 'app', 'data', 'shoppingLists', `curated-${courseType}-week${weekNum}.json`);
      if (fs.existsSync(curatedPath)) {
        const parsed = JSON.parse(fs.readFileSync(curatedPath, 'utf-8'));
        if (parsed && Array.isArray(parsed.items)) {
          // Process curated items to remove duplicates and excluded ingredients
          const ingredientMap = new Map<string, { amount: number; unit: string; category: string }>();
          
          parsed.items.forEach((item: any) => {
            const normalizedName = normalizeIngredientName(item.name || '');
            if (shouldExcludeIngredient(normalizedName)) {
              return; // Skip excluded ingredients
            }
            
            const key = `${normalizedName.toLowerCase()}_${item.unit || 'st'}`;
            const existing = ingredientMap.get(key);
            const amount = parseFloat(String(item.amount)) || 1;
            
            if (existing) {
              existing.amount += amount;
            } else {
              ingredientMap.set(key, {
                amount: amount,
                unit: item.unit || 'st',
                category: item.category || categorizeIngredient(normalizedName)
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
            recipeCount: -1,
            ingredients,
            generatedAt: new Date().toISOString(),
            source: 'curated'
          });
        }
      }
    } catch {}

    // Get meal plan for the week
    const weekKey = `week${weekNum}`;
    const weekMeals: WeekMealPlan | undefined = courseType === 'basics' 
      ? mealPlans[weekKey]
      : flowMealPlans[weekKey];
      
    if (!weekMeals || !weekMeals.days) {
      return NextResponse.json({ error: 'Week not found' }, { status: 404 });
    }
    
    // Collect all recipe links from the week
    const recipeLinks = new Set<string>();
    
    Object.values(weekMeals.days).forEach(day => {
      if (day.breakfast?.recipeLink) recipeLinks.add(day.breakfast.recipeLink);
      if (day.lunch?.recipeLink) recipeLinks.add(day.lunch.recipeLink);
      if (day.dinner?.recipeLink) recipeLinks.add(day.dinner.recipeLink);
      if (day.snack?.recipeLink) recipeLinks.add(day.snack.recipeLink);
      if (day.dessert?.recipeLink) recipeLinks.add(day.dessert.recipeLink);
    });
    
    // Extract slugs from recipe links (remove /kunskapsbank/recept/ prefix)
    const recipeSlugs = Array.from(recipeLinks).map(link => {
      return link.replace(/^\/kunskapsbank\/recept\//, '');
    }).filter(slug => slug.length > 0);
    
    console.log('Shopping list debug:', {
      weekKey,
      recipeLinks: Array.from(recipeLinks),
      recipeSlugs,
      courseType
    });
    
    // Fetch recipes from database
    const recipes = await prisma.recipe.findMany({
      where: {
        slug: { in: recipeSlugs }
      },
      select: {
        title: true,
        slug: true,
        ingredients: true
      }
    });
    
    // Parse and aggregate ingredients
    const ingredientMap = new Map<string, { amount: number; unit: string; category: string }>();
    
    console.log('Found recipes:', recipes.map(r => ({ title: r.title, slug: r.slug, hasIngredients: !!r.ingredients })));
    
    recipes.forEach(recipe => {
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach((ingredient: any) => {
          if (typeof ingredient === 'string') {
            const parsed = parseIngredientLine(ingredient);
            if (parsed) {
              const normalizedName = normalizeIngredientName(parsed.name);
              if (shouldExcludeIngredient(normalizedName)) {
                return; // Skip excluded ingredients
              }
              const key = `${normalizedName.toLowerCase()}_${parsed.unit}`;
              const existing = ingredientMap.get(key);
              
              if (existing) {
                existing.amount += parseFloat(parsed.amount) || 1;
              } else {
                ingredientMap.set(key, {
                  amount: parseFloat(parsed.amount) || 1,
                  unit: parsed.unit,
                  category: categorizeIngredient(normalizedName)
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
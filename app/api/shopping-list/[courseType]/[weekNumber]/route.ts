import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mealPlans, flowMealPlans, energyMealPlans, type WeekMealPlan } from '@/app/data/mealPlans';
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
  'Mejeri': ['mjölk', 'ost', 'yoghurt', 'smör', 'grädde', 'kvarg', 'keso', 'crème fraiche', 'fetaost', 'mozzarella', 'parmesan', 'ägg', 'halloumi', 'ricotta', 'mascarpone', 'gräddfil', 'cottage cheese', 'philadelphiaost', 'färskost', 'cheddar', 'gouda', 'brie', 'camembert', 'gorgonzola', 'pecorino', 'vispgrädde', 'matlagningsgrädde', 'lätt crème fraiche', 'kvark', 'kesella', 'långfil', 'a-fil', 'kefir', 'smetana'],
  'Kött & Fisk': ['kyckling', 'lax', 'torsk', 'nötkött', 'fläsk', 'kalkon', 'lamm', 'räkor', 'tonfisk', 'bacon', 'köttfärs', 'korv', 'skinka', 'nötfärs', 'kycklingfilé', 'kycklinglårfilé', 'kallrökt'],
  'Frukt & Grönt': ['tomat', 'gurka', 'sallad', 'paprika', 'lök', 'vitlök', 'morötter', 'morot', 'broccoli', 'spenat', 'äpple', 'banan', 'citron', 'lime', 'avokado', 'potatis', 'sötpotatis', 'zucchini', 'aubergine', 'svamp', 'champinjoner', 'sparris', 'blomkål', 'vitkål', 'rödkål', 'rödlök', 'squash', 'mango', 'ananas', 'sugarsnaps', 'sockerärtor', 'rucola', 'isberg', 'hjärtsallad', 'selleri', 'cocktailtomater', 'bifftomater', 'körsbärstomater', 'plommontomater', 'soltorkade tomater', 'kronärtskocka', 'fänkål', 'purjolök', 'salladslök', 'vårslök', 'gräslök', 'persilja', 'dill', 'mynta', 'dragon', 'rosmarin', 'salvia', 'citronmeliss', 'kål', 'grönkål', 'savoykål', 'spetskål', 'brysselkål', 'palmkål', 'mangold', 'pak choi', 'baby spenat', 'machésallad', 'frisésallad', 'romansallad', 'lollo rosso', 'lollo bionda', 'endive', 'radicchio', 'rädisa', 'rädisor', 'rotselleri', 'palsternacka', 'kålrot', 'majrova', 'jordärtskocka', 'rödbetor', 'gulbetor', 'polkabeta', 'pepparrot', 'ingefära', 'färsk ingefära', 'vaxbönor', 'haricots verts', 'brytbönor', 'edamamebönor', 'ärtor', 'frysta ärtor', 'majs', 'majskolv', 'pumpa', 'butternutpumpa', 'halloweenpumpa'],
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
  
  return ingredient.trim().replace(/\([^\)]*\)/g, '').trim();
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

// Unit normalization helpers
const VOLUME_TO_ML: Record<string, number> = { l: 1000, dl: 100, cl: 10, ml: 1, msk: 15, tsk: 5, krm: 1 };
const MASS_TO_G: Record<string, number> = { kg: 1000, g: 1, mg: 0.001 };

function toBase(amount: number, unit: string | null | undefined): { qty: number; base: 'ml' | 'g' | 'st' } {
  const u = (unit || '').toLowerCase();
  if (u in VOLUME_TO_ML) return { qty: amount * VOLUME_TO_ML[u], base: 'ml' };
  if (u in MASS_TO_G) return { qty: amount * MASS_TO_G[u], base: 'g' };
  return { qty: amount, base: 'st' };
}

function formatFromBase(qty: number, base: 'ml' | 'g' | 'st'): { amount: string; unit: string } {
  if (base === 'st') return { amount: `${Math.round(qty)}`, unit: 'st' };
  if (base === 'g') {
    if (qty >= 1000) return { amount: (qty / 1000).toFixed(1).replace('.', ','), unit: 'kg' };
    return { amount: `${Math.round(qty)}`, unit: 'g' };
  }
  // ml
  if (qty >= 1000) return { amount: (qty / 1000).toFixed(1).replace('.', ','), unit: 'l' };
  if (qty >= 100) return { amount: (qty / 100).toFixed(1).replace('.', ','), unit: 'dl' };
  return { amount: `${Math.round(qty)}`, unit: 'ml' };
}

export async function GET(
  request: Request,
  { params }: { params: { courseType: string; weekNumber: string } }
) {
  try {
    const { courseType, weekNumber } = params;
    const weekNum = parseInt(weekNumber);
    const url = new URL(request.url);
    const servingsParam = parseInt(url.searchParams.get('servings') || '1');
    const targetServings = isNaN(servingsParam) || servingsParam <= 0 ? 1 : servingsParam;
    
    // Helper to get recipe entries from meal plan
    const getRecipeEntriesFromMealPlan = (days: any) => {
      const orderedEntries: Array<{ day: string; mealType: string; slug: string }> = [];
      const dayOrder = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
      const mealOrder = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
      
      if (days) {
        dayOrder.forEach((dayName, idx) => {
          const day = days[dayName] || days[`day${idx + 1}`];
          if (!day) return;
          mealOrder.forEach((mt) => {
            const m = day[mt];
            if (m?.recipeLink) {
              const slug = String(m.recipeLink).replace(/^\/kunskapsbank\/recept\//, '');
              orderedEntries.push({ day: dayName, mealType: mt, slug });
            }
          });
        });
      }
      return orderedEntries;
    };

    // Course name mapping for database lookup
    const courseNameMap: Record<string, string> = {
      'basics': 'Basic',
      'flow': 'Flow',
      'energy': 'Energy',
      'hormone': 'Hormonell Balans',
      'prova-pa-vecka': 'Prova på vecka'
    };

    // Try to fetch from database FIRST for ALL courses (admin edits go here)
    try {
      const courseName = courseNameMap[courseType];
      if (courseName) {
        const course = await prisma.courseProduct.findFirst({
          where: { name: { contains: courseName, mode: 'insensitive' } }
        });

        if (course) {
          // Check if shopping list exists in database
          const dbList = await prisma.weeklyShoppingList.findUnique({
            where: {
              courseId_week: { courseId: course.id, week: weekNum }
            },
            include: { items: true }
          });

          if (dbList && dbList.items && dbList.items.length > 0) {
            console.log(`✅ Found shopping list in database for ${courseType} week ${weekNum}`);
            
            // Get recipe entries from meal plan
            let orderedEntries: Array<{ day: string; mealType: string; slug: string }> = [];
            
            if (courseType === 'hormone' || courseType === 'prova-pa-vecka') {
              const dbMealPlan = await (prisma as any).mealPlanWeek?.findUnique({
                where: { course_weekNumber: { course: courseType, weekNumber: weekNum } }
              });
            orderedEntries = getRecipeEntriesFromMealPlan(dbMealPlan?.days);
          } else {
            const weekKey = `week${weekNum}`;
            const staticMealPlans = courseType === 'basics'
          ? mealPlans[weekKey]
          : courseType === 'flow'
          ? flowMealPlans[weekKey]
          : energyMealPlans[weekKey];
        orderedEntries = getRecipeEntriesFromMealPlan(staticMealPlans?.days);
          }


            // Parse database items and scale by servings
            // Database lists are stored for 1 person (base servings = 1)
            const baseServings = 1;
            const scale = targetServings / baseServings;
            
            const ingredients = dbList.items.map((item: any) => {
              const ingredientStr = (item.ingredient || '').trim();
              
              // Try to parse "amount unit name" format (e.g., "1,5 dl keso", "300 g kycklingfärs")
              // Match: optional number (with comma/dot), optional unit, then the rest is the name
              const parseMatch = ingredientStr.match(/^(\d+(?:[.,]\d+)?)\s*(dl|ml|l|g|kg|msk|tsk|st|krm|klyftor|skivor|cm|blad|kruka|påse)?\s+(.+)$/i);
              
              let baseAmount = 1;
              let unit = 'st';
              let name = ingredientStr;
              
              if (parseMatch) {
                baseAmount = parseFloat(parseMatch[1].replace(',', '.')) || 1;
                unit = parseMatch[2] || 'st';
                name = parseMatch[3];
              } else {
                // Check if it's just a name without amount (e.g., "Salt", "Svartpeppar")
                const simpleMatch = ingredientStr.match(/^[A-Za-zÅÄÖåäö\s]+$/);
                if (simpleMatch) {
                  name = ingredientStr;
                  // For items without amounts (Salt, Svartpeppar), don't scale
                  return {
                    name: name,
                    amount: '',
                    unit: '',
                    category: item.category || categorizeIngredient(name),
                    checked: false
                  };
                }
              }
              
              // Scale the amount based on servings
              const scaledAmount = baseAmount * scale;
              
              // Format the amount nicely
              let formattedAmount: string;
              if (scaledAmount === Math.floor(scaledAmount)) {
                formattedAmount = scaledAmount.toString();
              } else {
                // Round to 2 decimal places and use comma
                formattedAmount = scaledAmount.toFixed(2).replace('.', ',').replace(/,?0+$/, '');
              }
              
              return {
                name: name,
                amount: formattedAmount,
                unit: unit,
                category: item.category || categorizeIngredient(name),
                checked: false
              };
            });

            return NextResponse.json({
              week: weekNum,
              courseType,
              recipeCount: orderedEntries.length,
              ingredients,
              generatedAt: new Date().toISOString(),
              source: 'database',
              servings: targetServings,
              recipes: orderedEntries.map(e => e.slug),
              recipeEntries: orderedEntries
            });
          }
        }
      }
    } catch (err) {
      console.error('❌ Error checking database for shopping list:', err);
    }

    // FALLBACK: Try curated JSON file (for courses without database entries)
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
          
          // Also compute recipe slugs from meal plan for this week so print-recipes can load
          const weekKey = `week${weekNum}`;
          const weekMeals: WeekMealPlan | undefined = courseType === 'basics' 
            ? mealPlans[weekKey]
            : courseType === 'flow' 
            ? flowMealPlans[weekKey]
            : energyMealPlans[weekKey];
          const orderedEntries: Array<{ day: string; mealType: string; slug: string }>= [];
          const dayOrder = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
          const mealOrder: Array<keyof any> = ['breakfast','lunch','dinner','snack','dessert'];
          if (weekMeals && weekMeals.days) {
            dayOrder.forEach((dayName, idx) => {
              const day: any = (weekMeals as any).days[dayName] || (weekMeals as any).days[`day${idx+1}`];
              if (!day) return;
              mealOrder.forEach((mt) => {
                const m = day[mt];
                if (m?.recipeLink) {
                  const slug = String(m.recipeLink).replace(/^\/kunskapsbank\/recept\//,'');
                  orderedEntries.push({ day: dayName, mealType: String(mt), slug });
                }
              });
            });
          }
          const recipeSlugsForCurated = orderedEntries.map(e=>e.slug);

          return NextResponse.json({
            week: weekNum,
            courseType,
            recipeCount: -1,
            ingredients,
            generatedAt: new Date().toISOString(),
            source: 'curated',
            recipes: recipeSlugsForCurated,
            recipeEntries: orderedEntries
          });
        }
      }
    } catch {}

    // Get meal plan for the week
    const weekKey = `week${weekNum}`;
    let weekMeals: WeekMealPlan | undefined;
    
    // For hormone and prova-pa-vecka courses, fetch from database
    if (courseType === 'hormone' || courseType === 'prova-pa-vecka') {
      try {
        const dbMealPlan = await (prisma as any).mealPlanWeek?.findUnique({
          where: {
            course_weekNumber: {
              course: courseType,
              weekNumber: weekNum
            }
          }
        });
        
        if (dbMealPlan && dbMealPlan.days) {
          weekMeals = { days: dbMealPlan.days } as WeekMealPlan;
          console.log(`✅ Found ${courseType} meal plan for week ${weekNum} in database`);
        } else {
          console.log(`❌ No ${courseType} meal plan found for week ${weekNum}`);
        }
      } catch (err) {
        console.error(`Error fetching ${courseType} meal plan:`, err);
      }
    } else {
      // For other courses, use static data
      weekMeals = courseType === 'basics' 
        ? mealPlans[weekKey]
        : courseType === 'flow' 
        ? flowMealPlans[weekKey]
        : energyMealPlans[weekKey];
    }
      
    if (!weekMeals || !weekMeals.days) {
      return NextResponse.json({ error: 'Week not found' }, { status: 404 });
    }
    
    // Build ordered entries (day + meal type) and slugs
    const orderedEntries: Array<{ day: string; mealType: string; slug: string }> = [];
    const dayOrder = ['Måndag','Tisdag','Onsdag','Torsdag','Fredag','Lördag','Söndag'];
    const mealOrder: Array<keyof any> = ['breakfast','lunch','dinner','snack','dessert'];
    dayOrder.forEach((dayName, idx) => {
      const day: any = (weekMeals as any).days[dayName] || (weekMeals as any).days[`day${idx+1}`];
      if (!day) return;
      mealOrder.forEach((mt) => {
        const m = day[mt];
        if (m?.recipeLink) {
          const slug = String(m.recipeLink).replace(/^\/kunskapsbank\/recept\//,'');
          orderedEntries.push({ day: dayName, mealType: String(mt), slug });
        }
      });
    });
    const recipeSlugs = orderedEntries.map(e=>e.slug);
    
    console.log('Shopping list debug:', { weekKey, recipeSlugs, courseType });
    
    // Fetch recipes from database
    const recipes: any[] = await prisma.recipe.findMany({
      where: {
        slug: { in: recipeSlugs }
      },
      select: {
        title: true,
        slug: true,
        ingredients: true,
        // @ts-ignore - custom JSON field available in schema
        ingredientsStructured: true,
        servings: true
      } as any
    });
    
    // Parse and aggregate ingredients
    const ingredientMap = new Map<string, { qty: number; base: 'ml' | 'g' | 'st'; category: string }>();
    
    recipes.forEach(recipe => {
      const baseServings = typeof recipe.servings === 'number' && recipe.servings > 0 ? recipe.servings : 4;
      const scale = targetServings / baseServings;

      if (Array.isArray((recipe as any).ingredientsStructured) && (recipe as any).ingredientsStructured.length > 0) {
        (recipe as any).ingredientsStructured.forEach((entry: any) => {
          const label = (entry.label || '').toString();
          const normalizedName = normalizeIngredientName(label);
          if (!normalizedName || shouldExcludeIngredient(normalizedName)) return;

          const rawAmount = typeof entry.finalAmount === 'number' ? entry.finalAmount : (typeof entry.baseAmount === 'number' ? entry.baseAmount : 1);
          const unit = entry.finalUnit || entry.baseUnit || 'st';
          const scaled = toBase(rawAmount * scale, unit);

          const key = `${normalizedName.toLowerCase()}_${scaled.base}`;
          const existing = ingredientMap.get(key);
          if (existing) {
            existing.qty += scaled.qty;
          } else {
            ingredientMap.set(key, { qty: scaled.qty, base: scaled.base, category: categorizeIngredient(normalizedName) });
          }
        });
      } else if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach((ingredient: any) => {
          if (typeof ingredient === 'string') {
            const parsed = parseIngredientLine(ingredient);
            if (parsed) {
              const normalizedName = normalizeIngredientName(parsed.name);
              if (shouldExcludeIngredient(normalizedName)) return;
              const amountNum = parseFloat(parsed.amount.replace(',', '.')) || 1;
              const scaled = toBase(amountNum * scale, parsed.unit);
              const key = `${normalizedName.toLowerCase()}_${scaled.base}`;
              const existing = ingredientMap.get(key);
              if (existing) {
                existing.qty += scaled.qty;
              } else {
                ingredientMap.set(key, { qty: scaled.qty, base: scaled.base, category: categorizeIngredient(normalizedName) });
              }
            }
          }
        });
      }
    });
    
    // Convert to array format with nice units
    const ingredients = Array.from(ingredientMap.entries()).map(([key, data]) => {
      const [name] = key.split('_');
      const pretty = formatFromBase(data.qty, data.base);
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount: pretty.amount,
        unit: pretty.unit,
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
      generatedAt: new Date().toISOString(),
      servings: targetServings,
      source: 'aggregated',
      recipes: recipeSlugs,
      recipeEntries: orderedEntries
    });
    
  } catch (error) {
    console.error('Error generating shopping list:', error);
    return NextResponse.json(
      { error: 'Failed to generate shopping list' },
      { status: 500 }
    );
  }
} 

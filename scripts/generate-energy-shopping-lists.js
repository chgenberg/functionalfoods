const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Load meal plans
function loadEnergyMealPlans() {
  const mealPlansPath = path.join(__dirname, '..', 'app', 'data', 'mealPlans.ts');
  const content = fs.readFileSync(mealPlansPath, 'utf-8');
  
  // Extract energyMealPlans
  const energyMatch = content.match(/export const energyMealPlans: Record<string, WeekMealPlan> = ({[\s\S]*?});/);
  if (!energyMatch) {
    throw new Error('Could not find energyMealPlans in mealPlans.ts');
  }
  
  // Use eval to parse the object (safe since we control the content)
  const energyMealPlans = eval('(' + energyMatch[1] + ')');
  return energyMealPlans;
}

// Extract recipe slugs from meal plan
function extractRecipeSlugs(weekPlan) {
  const slugs = new Set();
  
  Object.values(weekPlan.days).forEach(day => {
    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      if (day[mealType] && day[mealType].recipeLink) {
        const slug = day[mealType].recipeLink.split('/').pop();
        // Don't add if it's a "rester" (leftover)
        if (slug && !day[mealType].name.toLowerCase().includes('rester')) {
          slugs.add(slug);
        }
      }
    });
  });
  
  return Array.from(slugs);
}

// Parse ingredient amount and unit
function parseIngredient(ingredient) {
  const patterns = [
    /^(\d+(?:[.,]\d+)?)\s*(st|stycken|styck|g|kg|ml|dl|l|msk|tsk|krm|burk|burkar|påse|påsar|förpackning|förpackningar)\s+(.+)$/i,
    /^([½¼¾⅓⅔]|\d+(?:[.,]\d+)?)\s*(dl|ml|l|msk|tsk|krm|g|kg)\s+(.+)$/i,
    /^(\d+(?:[.,]\d+)?)\s+(.+)$/,
    /^(.+?)\s*\((\d+(?:[.,]\d+)?)\s*(st|stycken|styck|g|kg|ml|dl|l|msk|tsk|krm|burk|burkar|påse|påsar)?\)$/i
  ];
  
  for (const pattern of patterns) {
    const match = ingredient.match(pattern);
    if (match) {
      let amount = null;
      let unit = null;
      let name = '';
      
      if (pattern === patterns[3]) {
        name = match[1].trim();
        const amountStr = match[2].replace(',', '.');
        amount = parseFloat(amountStr);
        unit = match[3] || 'st';
      } else if (pattern === patterns[2]) {
        const amountStr = match[1].replace(',', '.');
        amount = parseFloat(amountStr);
        name = match[2].trim();
        unit = 'st';
      } else {
        const amountStr = match[1];
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
  
  return { amount: 1, unit: 'st', name: ingredient.trim() };
}

// Categorize ingredients
function categorizeIngredient(ingredient) {
  const name = ingredient.toLowerCase();
  
  const categories = {
    'Frukt & Grönt': ['tomat', 'gurka', 'paprika', 'sallad', 'äpple', 'banan', 'citron', 'lime', 'potatis', 'morot', 'lök', 'vitlök', 'ingefära', 'spenat', 'ruccola', 'avokado', 'broccoli', 'blomkål', 'squash', 'zucchini', 'aubergine', 'svamp', 'champinjon', 'persilja', 'basilika', 'koriander', 'dill', 'gräslök', 'timjan', 'rosmarin', 'mynta', 'selleri', 'purjolök', 'rödbetor', 'kål', 'vitkål', 'rödkål', 'grönkål', 'salladskål', 'pak choi', 'böngroddar', 'ärtor', 'sockerärtor', 'majs', 'oliver', 'jalapeño', 'chili', 'frukt', 'bär', 'jordgubbar', 'blåbär', 'hallon', 'björnbär', 'vindruvor', 'mango', 'ananas', 'kiwi', 'apelsin', 'grapefrukt', 'mandarin', 'granatäpple', 'päron', 'plommon', 'persika', 'nektarin', 'melon', 'vattenmelon'],
    'Kött & Fisk': ['kyckling', 'nötkött', 'fläskkött', 'lax', 'torsk', 'tonfisk', 'räkor', 'skaldjur', 'fisk', 'köttfärs', 'korv', 'bacon', 'skinka', 'kalkon', 'lamm', 'älg', 'vilt', 'leverpostej', 'paté', 'rökad lax', 'makrill', 'sill', 'sardiner', 'kräftor', 'musslor', 'bläckfisk'],
    'Mejeri': ['mjölk', 'grädde', 'yoghurt', 'filmjölk', 'kvarg', 'keso', 'ost', 'mozzarella', 'fetaost', 'parmesanost', 'gorgonzola', 'brie', 'camembert', 'philadelphiaost', 'färskost', 'ricotta', 'mascarpone', 'crème fraiche', 'smetana', 'smör', 'margarin', 'ägg'],
    'Skafferi': ['mjöl', 'vetemjöl', 'rågmjöl', 'havremjöl', 'mandelmjöl', 'kokosmjöl', 'pasta', 'ris', 'quinoa', 'bulgur', 'couscous', 'havregryn', 'müsli', 'cornflakes', 'bröd', 'knäckebröd', 'kex', 'kakor', 'nudlar', 'tortilla', 'pitabröd', 'bagel', 'croissant', 'bulle', 'kaka', 'tårta'],
    'Konserver': ['krossade tomater', 'tomatpuré', 'kokosmjölk', 'bönor', 'linser', 'kikärtor', 'majs', 'oliver', 'kapris', 'inlagd gurka', 'sylt', 'marmelad', 'honung', 'sirap', 'ahornsirap', 'agavesirap'],
    'Kryddor & Såser': ['salt', 'peppar', 'svartpeppar', 'vitpeppar', 'paprikapulver', 'chiliflakes', 'cayennepeppar', 'kardemumma', 'kanel', 'nejlika', 'muskot', 'gurkmeja', 'spiskummin', 'korianderfrön', 'fänkålsfrön', 'anis', 'vanilj', 'vaniljpulver', 'vaniljsocker', 'strösocker', 'farinsocker', 'florsocker', 'bakpulver', 'bikarbonat', 'jäst', 'soja', 'worcestersås', 'tabasco', 'sriracha', 'sweet chilisås', 'teriyakisås', 'hoisinsås', 'fisksås', 'ostronsås', 'balsamvinäger', 'rödvinsvinäger', 'vitvinsvinäger', 'äppelcidervinäger', 'senap', 'dijonsenap', 'ketchup', 'majonnäs', 'aioli', 'pesto', 'tapenade', 'hummus', 'tahini', 'bbq-sås'],
    'Oljor & Nötter': ['olivolja', 'rapsolja', 'kokosolja', 'sesamolja', 'valnötsolja', 'mandlar', 'valnötter', 'cashewnötter', 'jordnötter', 'hasselnötter', 'pekannötter', 'macadamianötter', 'paranötter', 'pistagenötter', 'solrosfrön', 'pumpafrön', 'chiafrön', 'linfrön', 'sesamfrön', 'vallmofrön'],
    'Fryst': ['fryst', 'frysta', 'glass', 'sorbet'],
    'Dryck': ['juice', 'läsk', 'öl', 'vin', 'sprit', 'te', 'kaffe', 'kakao', 'choklad'],
    'Övrigt': []
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category;
    }
  }
  
  return 'Övrigt';
}

// Aggregate ingredients
function aggregateIngredients(ingredients) {
  const aggregated = {};
  
  ingredients.forEach(ing => {
    const key = ing.name.toLowerCase();
    
    if (!aggregated[key]) {
      aggregated[key] = {
        name: ing.name,
        amount: 0,
        unit: ing.unit,
        category: categorizeIngredient(ing.name)
      };
    }
    
    // Try to aggregate amounts if units match
    if (aggregated[key].unit === ing.unit) {
      aggregated[key].amount += ing.amount;
    } else {
      // If units don't match, create a new entry with unit in name
      const newKey = `${key}_${ing.unit}`;
      if (!aggregated[newKey]) {
        aggregated[newKey] = {
          name: `${ing.name} (${ing.unit})`,
          amount: ing.amount,
          unit: ing.unit,
          category: categorizeIngredient(ing.name)
        };
      } else {
        aggregated[newKey].amount += ing.amount;
      }
    }
  });
  
  return Object.values(aggregated);
}

async function generateEnergyShoppingLists() {
  console.log('🛒 Generating shopping lists for Functional Energy course...\n');
  
  try {
    const energyMealPlans = loadEnergyMealPlans();
    const outputDir = path.join(__dirname, '..', 'app', 'data', 'shoppingLists');
    
    for (let week = 1; week <= 6; week++) {
      const weekKey = `week${week}`;
      const weekPlan = energyMealPlans[weekKey];
      
      if (!weekPlan) {
        console.log(`⚠️  No meal plan found for week ${week}`);
        continue;
      }
      
      console.log(`\n📅 Processing Week ${week}: ${weekPlan.title}`);
      
      // Get recipe slugs
      const recipeSlugs = extractRecipeSlugs(weekPlan);
      console.log(`   Found ${recipeSlugs.length} unique recipes`);
      
      // Fetch recipes from database
      const recipes = await prisma.recipe.findMany({
        where: {
          slug: { in: recipeSlugs }
        },
        select: {
          id: true,
          title: true,
          slug: true,
          ingredients: true
        }
      });
      
      console.log(`   Fetched ${recipes.length} recipes from database`);
      
      // Collect all ingredients
      const allIngredients = [];
      
      for (const recipe of recipes) {
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          for (const ingredient of recipe.ingredients) {
            const parsed = parseIngredient(ingredient);
            allIngredients.push(parsed);
          }
        }
      }
      
      // Aggregate ingredients
      const aggregated = aggregateIngredients(allIngredients);
      
      // Sort by category and name
      aggregated.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });
      
      // Create shopping list object
      const shoppingList = {
        items: aggregated.map(item => ({
          name: item.name,
          amount: Math.round(item.amount * 10) / 10, // Round to 1 decimal
          unit: item.unit,
          category: item.category
        }))
      };
      
      // Write to file
      const outputPath = path.join(outputDir, `curated-energy-week${week}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(shoppingList, null, 2));
      
      console.log(`   ✅ Created shopping list with ${shoppingList.items.length} items`);
      console.log(`   📄 Saved to: ${outputPath}`);
    }
    
    console.log('\n✅ All Energy shopping lists generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating shopping lists:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateEnergyShoppingLists(); 
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Initialize OpenAI (you'll need to add your API key here temporarily)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY_HERE',
});

// Ingredient normalization and unit conversion
const ingredientNormalization = {
  // Common ingredient variations
  'rödlök': ['röd lök', 'rodlok'],
  'gul lök': ['gullök', 'vanlig lök', 'lök'],
  'vitlök': ['vitlöksklyfta', 'vitlöksklyftor'],
  'olivolja': ['olja', 'matolja'],
  'smör': ['matfettsblandning', 'margarin'],
  'mjölk': ['mellanmjölk', 'standardmjölk'],
  'grädde': ['vispgrädde', 'matlagningsgrädde'],
  'tomat': ['tomater', 'körsbärstomater'],
  'paprika': ['röd paprika', 'gul paprika', 'grön paprika'],
  'ägg': ['äggvita', 'äggula'],
};

// Unit conversions to standard units
const unitConversions = {
  'tsk': { to: 'msk', factor: 0.333 },
  'dl': { to: 'l', factor: 0.1 },
  'cl': { to: 'l', factor: 0.01 },
  'ml': { to: 'l', factor: 0.001 },
  'kg': { to: 'g', factor: 1000 },
  'hg': { to: 'g', factor: 100 },
};

// Categories for organizing shopping list
const ingredientCategories = {
  'Mejeri': ['mjölk', 'grädde', 'yoghurt', 'ost', 'smör', 'crème fraiche', 'kvarg', 'kefir', 'cottage cheese'],
  'Kött & Fisk': ['kött', 'fläsk', 'nöt', 'lamm', 'kyckling', 'fisk', 'lax', 'torsk', 'räkor', 'skaldjur', 'bacon', 'korv'],
  'Frukt & Grönt': ['tomat', 'gurka', 'paprika', 'lök', 'vitlök', 'potatis', 'morot', 'broccoli', 'sallad', 'äpple', 'banan', 'citron', 'lime'],
  'Skafferi': ['mjöl', 'socker', 'salt', 'peppar', 'olja', 'pasta', 'ris', 'bulgur', 'quinoa', 'havregryn', 'bröd'],
  'Kryddor & Såser': ['ketchup', 'senap', 'soja', 'vinäger', 'honung', 'kryddor', 'örter', 'buljong'],
  'Övrigt': [],
};

async function parseIngredientsWithAI(ingredients) {
  try {
    const prompt = `
Parse these recipe ingredients into structured data. For each ingredient, extract:
- amount (number)
- unit (st, msk, tsk, dl, l, g, kg, etc.)
- ingredient (the actual ingredient name, normalized)

Important rules:
- If amount is fractional like "1/2", convert to decimal (0.5)
- If no unit is specified, use "st" (stycken)
- Normalize ingredient names (e.g., "röd lök" → "rödlök")
- Round up fractional amounts for practical shopping

Ingredients:
${ingredients.join('\n')}

Return as JSON array with format:
[{"amount": number, "unit": "string", "ingredient": "string"}, ...]
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.ingredients || result;
  } catch (error) {
    console.error('Error parsing ingredients with AI:', error);
    return [];
  }
}

function normalizeIngredient(ingredient) {
  const lower = ingredient.toLowerCase().trim();
  
  // Check if it matches any normalization rules
  for (const [normalized, variations] of Object.entries(ingredientNormalization)) {
    if (lower === normalized || variations.some(v => lower.includes(v))) {
      return normalized;
    }
  }
  
  return lower;
}

function categorizeIngredient(ingredient) {
  const lower = ingredient.toLowerCase();
  
  for (const [category, keywords] of Object.entries(ingredientCategories)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return category;
    }
  }
  
  return 'Övrigt';
}

function aggregateIngredients(allIngredients) {
  const aggregated = {};
  
  for (const item of allIngredients) {
    const normalized = normalizeIngredient(item.ingredient);
    const key = `${normalized}_${item.unit}`;
    
    if (aggregated[key]) {
      aggregated[key].amount += item.amount;
    } else {
      aggregated[key] = {
        ingredient: normalized,
        amount: item.amount,
        unit: item.unit,
        category: categorizeIngredient(normalized),
      };
    }
  }
  
  // Round up amounts for practical shopping
  Object.values(aggregated).forEach(item => {
    if (item.unit === 'st' || item.unit === 'burk' || item.unit === 'påse') {
      item.amount = Math.ceil(item.amount);
    } else if (item.amount % 1 !== 0) {
      item.amount = Math.ceil(item.amount * 10) / 10; // Round to 1 decimal
    }
  });
  
  return Object.values(aggregated);
}

async function generateShoppingListForWeek(weekNumber, courseType) {
  console.log(`\nGenerating shopping list for ${courseType} Week ${weekNumber}...`);
  
  // Get meal plan data
  const mealPlanModule = require('../app/data/mealPlans.ts');
  const mealPlan = courseType === 'basics' 
    ? mealPlanModule.functionalBasicsMealPlans[weekNumber - 1]
    : mealPlanModule.functionalFlowMealPlans[weekNumber - 1];
    
  if (!mealPlan) {
    console.log(`No meal plan found for week ${weekNumber}`);
    return null;
  }
  
  // Collect all recipe slugs for the week
  const allSlugs = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach(day => {
    const dayMeals = mealPlan.days[day];
    if (dayMeals) {
      ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
        const meal = dayMeals[mealType];
        if (meal && meal.recipeSlug && !meal.title.includes('rester')) {
          allSlugs.push(meal.recipeSlug);
        }
      });
    }
  });
  
  // Get unique slugs
  const uniqueSlugs = [...new Set(allSlugs)];
  console.log(`Found ${uniqueSlugs.length} unique recipes for week ${weekNumber}`);
  
  // Fetch all recipes from database
  const recipes = await prisma.recipe.findMany({
    where: {
      slug: { in: uniqueSlugs }
    }
  });
  
  // Collect all ingredients
  const allIngredients = [];
  
  for (const recipe of recipes) {
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      console.log(`Parsing ingredients for: ${recipe.title}`);
      const parsed = await parseIngredientsWithAI(recipe.ingredients);
      allIngredients.push(...parsed);
    }
  }
  
  // Aggregate and categorize
  const shoppingList = aggregateIngredients(allIngredients);
  
  // Sort by category and ingredient name
  shoppingList.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.ingredient.localeCompare(b.ingredient);
  });
  
  return {
    week: weekNumber,
    courseType,
    recipeCount: recipes.length,
    items: shoppingList,
    generatedAt: new Date().toISOString(),
  };
}

async function saveShoppingList(shoppingList, courseType, weekNumber) {
  const dir = path.join(__dirname, '..', 'app', 'data', 'shoppingLists');
  await fs.mkdir(dir, { recursive: true });
  
  const filename = path.join(dir, `${courseType}-week${weekNumber}.json`);
  await fs.writeFile(filename, JSON.stringify(shoppingList, null, 2));
  
  console.log(`Saved shopping list to: ${filename}`);
}

async function generateAllShoppingLists() {
  console.log('Starting shopping list generation...');
  
  try {
    // Generate for Basic course (6 weeks)
    for (let week = 1; week <= 6; week++) {
      const shoppingList = await generateShoppingListForWeek(week, 'basics');
      if (shoppingList) {
        await saveShoppingList(shoppingList, 'basics', week);
      }
    }
    
    // Generate for Flow course (6 weeks)
    for (let week = 1; week <= 6; week++) {
      const shoppingList = await generateShoppingListForWeek(week, 'flow');
      if (shoppingList) {
        await saveShoppingList(shoppingList, 'flow', week);
      }
    }
    
    console.log('\nAll shopping lists generated successfully!');
    
    // Create index file
    const indexContent = `
// Auto-generated shopping lists index
export { default as basicsWeek1 } from './basics-week1.json';
export { default as basicsWeek2 } from './basics-week2.json';
export { default as basicsWeek3 } from './basics-week3.json';
export { default as basicsWeek4 } from './basics-week4.json';
export { default as basicsWeek5 } from './basics-week5.json';
export { default as basicsWeek6 } from './basics-week6.json';

export { default as flowWeek1 } from './flow-week1.json';
export { default as flowWeek2 } from './flow-week2.json';
export { default as flowWeek3 } from './flow-week3.json';
export { default as flowWeek4 } from './flow-week4.json';
export { default as flowWeek5 } from './flow-week5.json';
export { default as flowWeek6 } from './flow-week6.json';
`;
    
    const indexPath = path.join(__dirname, '..', 'app', 'data', 'shoppingLists', 'index.ts');
    await fs.writeFile(indexPath, indexContent.trim());
    
  } catch (error) {
    console.error('Error generating shopping lists:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  generateAllShoppingLists();
}

module.exports = { generateShoppingListForWeek, generateAllShoppingLists }; 
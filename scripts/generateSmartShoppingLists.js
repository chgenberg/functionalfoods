const { PrismaClient } = require('@prisma/client');
const { mealPlans } = require('../app/data/mealPlans');

function extractBaseIngredient(ingredient) {
  if (!ingredient) return '';
  
  // Remove quantities and measurements
  let base = ingredient
    .replace(/^\d+[\s\/]*\d*\s*(dl|g|ml|kg|l|tsk|msk|st|cm|%|gram|liter|skivor?|klyftor?|bitar?)\s*/i, '')
    .replace(/^[½¼¾⅓⅔]\s*(dl|g|ml|kg|l|tsk|msk|st|cm)\s*/i, '')
    .replace(/^(en|ett|några|lite|stor|liten|färsk|fryst|konserverad|hackad|riven|skivad|torkad)\s+/i, '')
    .replace(/\s*\([^)]*\)/g, '') // remove parentheses
    .trim();
  
  // Normalize common ingredients
  const normalizations = {
    'parmesanost': 'parmesan',
    'riven parmesan': 'parmesan',
    'parmesan riven': 'parmesan',
    'grekisk yoghurt': 'yoghurt',
    'olivolja extra virgin': 'olivolja',
    'salt och svartpeppar': 'salt och peppar',
    'salt och peppar': 'salt och peppar',
    'vitlöksklyfta': 'vitlök',
    'vitlöksklyftor': 'vitlök',
    'gul lök': 'lök',
    'röd lök': 'lök',
    'salladslök': 'lök',
    'cocktailtomater': 'tomater',
    'krossade tomater': 'tomater',
    'körsbärstomater': 'tomater'
  };
  
  const lower = base.toLowerCase();
  for (const [pattern, replacement] of Object.entries(normalizations)) {
    if (lower.includes(pattern)) {
      return replacement;
    }
  }
  
  return base;
}

function categorizeIngredient(ingredient) {
  const categories = {
    'Kött & Fisk': ['kött', 'kyckling', 'lax', 'torsk', 'tonfisk', 'räkor', 'scampi', 'nötfärs', 'köttfärs', 'lammfärs', 'kalkon', 'entrecote', 'lövbiff'],
    'Mejeri': ['mjölk', 'grädde', 'yoghurt', 'keso', 'ost', 'mozzarella', 'fetaost', 'parmesan', 'brie', 'gorgonzola', 'halloumi', 'burrata', 'chèvre'],
    'Grönsaker': ['lök', 'vitlök', 'tomater', 'gurka', 'paprika', 'morötter', 'broccoli', 'blomkål', 'spenat', 'rucola', 'sallad', 'avokado'],
    'Frukt & Bär': ['äpple', 'banan', 'mango', 'ananas', 'jordgubbar', 'hallon', 'blåbär', 'citron', 'lime', 'apelsin', 'vindruvor'],
    'Torrvaror': ['ris', 'pasta', 'quinoa', 'bulgur', 'havregryn', 'linser', 'kikärtor', 'nötter', 'mandel', 'cashew'],
    'Kryddor & Såser': ['salt och peppar', 'oregano', 'basilika', 'timjan', 'paprika', 'curry', 'sojasås', 'olivolja', 'vinäger'],
    'Övrigt': []
  };
  
  const lower = ingredient.toLowerCase();
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      return category;
    }
  }
  return 'Övrigt';
}

(async () => {
  const prisma = new PrismaClient();
  try {
    // Get the "Functional Basics" course
    const basicsCourse = await prisma.courseProduct.findFirst({
      where: { name: { equals: 'Functional Basics', mode: 'insensitive' } }
    });

    if (!basicsCourse) {
      console.error('❌ Functional Basics course not found');
      return;
    }

    console.log(`🛒 Generating smart shopping lists for ${basicsCourse.name}...`);

    for (let week = 1; week <= 6; week++) {
      console.log(`\n📅 Processing Week ${week}...`);
      
      const weekPlan = mealPlans[`week${week}`];
      if (!weekPlan) {
        console.log(`⚠️ No meal plan for week ${week}`);
        continue;
      }

      const ingredientMap = new Map(); // base ingredient -> count
      let processedMeals = 0;

      // Process each day in the week
      for (const [dayName, dayMeals] of Object.entries(weekPlan.days)) {
        for (const [mealType, meal] of Object.entries(dayMeals)) {
          if (!meal?.recipeLink || /rester|16:8/i.test(meal.name)) continue;
          
          const slug = meal.recipeLink.split('/').pop();
          const recipe = await prisma.recipe.findUnique({ 
            where: { slug },
            select: { ingredients: true, title: true }
          });
          
          if (!recipe) {
            console.log(`⚠️ Recipe not found: ${slug} (${meal.name})`);
            continue;
          }

          processedMeals++;
          for (const ingredient of recipe.ingredients) {
            const base = extractBaseIngredient(ingredient);
            if (base) {
              ingredientMap.set(base, (ingredientMap.get(base) || 0) + 1);
            }
          }
        }
      }

      // Create shopping list items with categories
      const items = Array.from(ingredientMap.entries()).map(([ingredient, count]) => ({
        ingredient,
        category: categorizeIngredient(ingredient),
        count
      }));

      // Sort by category then alphabetically
      items.sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.ingredient.localeCompare(b.ingredient);
      });

      // Upsert shopping list
      const existingList = await prisma.weeklyShoppingList.findUnique({
        where: { courseId_week: { courseId: basicsCourse.id, week } }
      });

      if (existingList) {
        await prisma.shoppingListItem.deleteMany({ where: { listId: existingList.id } });
      }

      const shoppingList = await prisma.weeklyShoppingList.upsert({
        where: { courseId_week: { courseId: basicsCourse.id, week } },
        create: { courseId: basicsCourse.id, week },
        update: {}
      });

      if (items.length > 0) {
        await prisma.shoppingListItem.createMany({
          data: items.map(item => ({
            listId: shoppingList.id,
            ingredient: item.ingredient
          }))
        });
      }

      console.log(`✅ Week ${week}: ${items.length} ingredients from ${processedMeals} meals`);
      console.log(`   Categories: ${Object.keys(items.reduce((acc, item) => ({ ...acc, [item.category]: true }), {})).join(', ')}`);
    }

    console.log('\n🎉 Smart shopping lists generated!');
  } catch (e) {
    console.error('❌ Shopping list generation failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 
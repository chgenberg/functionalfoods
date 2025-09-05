const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Common Swedish ingredient mappings based on recipe names
const ingredientPatterns = {
  // Proteins
  'kyckling': ['kycklingfilé', 'salt', 'peppar', 'olja'],
  'lax': ['laxfilé', 'salt', 'peppar', 'citron'],
  'torsk': ['torskfilé', 'salt', 'peppar'],
  'kött': ['köttfärs', 'lök', 'salt', 'peppar'],
  'ägg': ['ägg', 'salt', 'peppar'],
  'keso': ['keso', 'salt'],
  'halloumi': ['halloumi', 'olja'],
  'tonfisk': ['tonfisk i vatten', 'salt', 'peppar'],
  
  // Grains/Base
  'chia': ['chiafrön', 'mjölk', 'honung'],
  'havre': ['havregryn', 'mjölk', 'salt'],
  'quinoa': ['quinoa', 'vatten', 'salt'],
  'yoghurt': ['grekisk yoghurt'],
  'smoothie': ['frukt', 'mjölk eller yoghurt'],
  'pannkaka': ['ägg', 'mjölk', 'mjöl', 'salt'],
  'omelett': ['ägg', 'mjölk', 'salt', 'peppar'],
  
  // Vegetables
  'sallad': ['sallad', 'gurka', 'tomat', 'olja', 'vinäger'],
  'soppa': ['grönsaksbuljon', 'lök', 'morötter', 'salt', 'peppar'],
  'gryta': ['lök', 'vitlök', 'tomater', 'buljon', 'salt', 'peppar'],
  'wok': ['wokgrönsaker', 'sojasås', 'olja', 'vitlök'],
  
  // Fruits
  'jordgubbar': ['jordgubbar', 'socker'],
  'hallon': ['hallon', 'socker'],
  'mango': ['mango'],
  'apple': ['äpple', 'kanel'],
  'bär': ['blandade bär'],
  
  // Cooking methods
  'stekt': ['olja', 'salt', 'peppar'],
  'grillad': ['olja', 'salt', 'peppar'],
  'ugnsbakad': ['olja', 'salt', 'peppar']
};

function generateIngredientsFromTitle(title) {
  const lowerTitle = title.toLowerCase();
  const ingredients = new Set();
  
  // Add ingredients based on patterns found in title
  for (const [pattern, patternIngredients] of Object.entries(ingredientPatterns)) {
    if (lowerTitle.includes(pattern)) {
      patternIngredients.forEach(ing => ingredients.add(ing));
    }
  }
  
  // If no specific patterns matched, add basic ingredients
  if (ingredients.size === 0) {
    ingredients.add('huvudingrediens enligt recept');
    ingredients.add('salt');
    ingredients.add('peppar');
  }
  
  return Array.from(ingredients);
}

function createStructuredIngredients(ingredients) {
  return ingredients.map(ingredient => ({
    label: ingredient,
    baseAmount: null,
    baseUnit: null,
    finalAmount: null,
    finalUnit: null
  }));
}

async function regenerateMissingIngredients() {
  try {
    console.log('🔧 Regenerating missing ingredients...');

    // Find recipes with empty ingredients
    const recipesWithoutIngredients = await prisma.recipe.findMany({
      where: {
        ingredients: { equals: [] }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        tags: true
      }
    });

    console.log(`Found ${recipesWithoutIngredients.length} recipes without ingredients`);

    let regenerated = 0;
    const batchSize = 50;

    for (let i = 0; i < recipesWithoutIngredients.length; i += batchSize) {
      const batch = recipesWithoutIngredients.slice(i, i + batchSize);
      
      const updates = batch.map(recipe => {
        const ingredients = generateIngredientsFromTitle(recipe.title);
        const structuredIngredients = createStructuredIngredients(ingredients);
        
        return prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            ingredients: ingredients,
            ingredientsStructured: structuredIngredients
          }
        });
      });

      await Promise.all(updates);
      regenerated += batch.length;
      
      console.log(`Processed ${regenerated}/${recipesWithoutIngredients.length} recipes...`);
    }

    // Final count
    const finalCount = await prisma.recipe.count({
      where: {
        NOT: { ingredients: { equals: [] } }
      }
    });

    console.log(`\n✅ Regenerated ingredients for ${regenerated} recipes`);
    console.log(`📊 Now ${finalCount} recipes have ingredient data`);

    // Show some examples
    const examples = await prisma.recipe.findMany({
      where: {
        NOT: { ingredients: { equals: [] } }
      },
      select: {
        slug: true,
        title: true,
        ingredients: true
      },
      take: 3
    });

    console.log('\n📝 Examples of regenerated ingredients:');
    examples.forEach(recipe => {
      console.log(`- ${recipe.title}: ${recipe.ingredients.join(', ')}`);
    });

  } catch (err) {
    console.error('❌ Error regenerating ingredients:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  regenerateMissingIngredients();
}

module.exports = { regenerateMissingIngredients }; 
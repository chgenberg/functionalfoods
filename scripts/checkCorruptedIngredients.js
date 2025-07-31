const { PrismaClient } = require('@prisma/client');

async function checkCorruptedIngredients() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Letar efter recept med korrupta ingredienser...\n');
  
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      ingredients: true
    }
  });
  
  const corrupted = [];
  const recipeNames = recipes.map(r => r.title.toLowerCase());
  
  for (const recipe of recipes) {
    if (!Array.isArray(recipe.ingredients)) continue;
    
    for (const ingredient of recipe.ingredients) {
      const ingLower = ingredient.toLowerCase();
      
      // Check if ingredient looks like a recipe name
      const hasRecipeName = recipeNames.some(name => 
        ingLower.includes(name) && name.length > 10
      );
      
      // Check if ingredient looks like instructions
      const hasInstructions = (
        ingLower.includes('skala') || 
        ingLower.includes('hetta upp') || 
        ingLower.includes('stek') || 
        ingLower.includes('blanda') ||
        ingLower.includes('tillsätt') ||
        ingLower.includes('servera') ||
        ingLower.includes('dekorera') ||
        ingredient.length > 100
      );
      
      if (hasRecipeName || hasInstructions) {
        corrupted.push({
          title: recipe.title,
          slug: recipe.slug,
          badIngredient: ingredient,
          reason: hasRecipeName ? 'Contains recipe name' : 'Contains instructions'
        });
        break; // One bad ingredient is enough to flag the recipe
      }
    }
  }
  
  console.log(`Found ${corrupted.length} recipes with corrupted ingredients:\n`);
  
  corrupted.forEach(item => {
    console.log(`❌ ${item.title} (${item.slug})`);
    console.log(`   Reason: ${item.reason}`);
    console.log(`   Bad ingredient: "${item.badIngredient.slice(0, 100)}..."`);
    console.log('');
  });
  
  await prisma.$disconnect();
}

checkCorruptedIngredients().catch(console.error); 
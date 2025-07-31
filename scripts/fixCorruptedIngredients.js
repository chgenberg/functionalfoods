const { PrismaClient } = require('@prisma/client');

async function fixCorruptedIngredients() {
  const prisma = new PrismaClient();
  
  console.log('🔧 Fixar korrupta ingredienser...\n');
  
  const recipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      ingredients: true
    }
  });
  
  let fixedCount = 0;
  const recipeNames = recipes.map(r => r.title.toLowerCase());
  
  for (const recipe of recipes) {
    if (!Array.isArray(recipe.ingredients)) continue;
    
    let hasCorruption = false;
    const cleanIngredients = [];
    
    for (const ingredient of recipe.ingredients) {
      const ingLower = ingredient.toLowerCase();
      
      // Check if ingredient looks like a recipe name or instructions
      const hasRecipeName = recipeNames.some(name => 
        ingLower.includes(name) && name.length > 10
      );
      
      const hasInstructions = (
        ingLower.includes('skala') || 
        ingLower.includes('hetta upp') || 
        ingLower.includes('stek') || 
        ingLower.includes('blanda') ||
        ingLower.includes('tillsätt') ||
        ingLower.includes('servera') ||
        ingLower.includes('dekorera') ||
        ingLower.includes('låt koka') ||
        ingLower.includes('rör ner') ||
        ingLower.includes('sätt ugnen') ||
        ingLower.includes('lägg') ||
        ingLower.includes('häll') ||
        ingredient.length > 100 ||
        ingredient.includes('kcal') ||
        ingredient.includes('portioner') ||
        ingredient.includes('FUNCTIONAL FOODS') ||
        ingredient.includes('BASKURS') ||
        ingredient.includes('VECKA')
      );
      
      if (hasRecipeName || hasInstructions) {
        hasCorruption = true;
        console.log(`❌ Removing corrupted ingredient from ${recipe.title}: "${ingredient.slice(0, 80)}..."`);
      } else {
        // Keep clean ingredients that look like actual ingredients
        if (ingredient.trim() && 
            !ingredient.match(/^\d+\.$/) && // Not just a number
            ingredient.length < 80 && // Not too long
            !ingredient.includes('.') || // No periods (unless in quantities)
            ingredient.match(/^\d+[\.,]?\d*\s*(dl|cl|ml|l|g|kg|st|msk|tsk|krm)\s+/)) {
          cleanIngredients.push(ingredient);
        }
      }
    }
    
    if (hasCorruption) {
      // Update recipe with cleaned ingredients
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          ingredients: cleanIngredients.length > 0 ? cleanIngredients : ["Ingredienser kommer snart"]
        }
      });
      
      fixedCount++;
      console.log(`✅ Fixed ${recipe.title} - kept ${cleanIngredients.length} clean ingredients`);
    }
  }
  
  console.log(`\n🎉 Fixade ${fixedCount} recept med korrupta ingredienser!`);
  
  await prisma.$disconnect();
}

fixCorruptedIngredients().catch(console.error); 
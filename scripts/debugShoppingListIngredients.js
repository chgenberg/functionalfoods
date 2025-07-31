const { PrismaClient } = require('@prisma/client');

async function debugIngredients() {
  const prisma = new PrismaClient();
  
  console.log('🔍 Kollar ingredienser för recept som används i vecka 1...\n');
  
  // Some recipes that appear in week 1 meal plan
  const testSlugs = [
    'squashspagetti-med-kottfarssas',
    'ugnsbakad-tomat-med-kottfars',
    'tonfisksallad-med-avokado-och-agg',
    'havregrynsgrot-med-torkad-frukt-och-apple',
    'kyckling-med-rotfrukter'
  ];
  
  for (const slug of testSlugs) {
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      select: {
        title: true,
        slug: true,
        ingredients: true,
        instructions: true
      }
    });
    
    if (!recipe) {
      console.log(`❌ Recipe "${slug}" not found\n`);
      continue;
    }
    
    console.log(`📋 ${recipe.title} (${slug}):`);
    console.log(`   Ingredients type: ${typeof recipe.ingredients}`);
    console.log(`   Ingredients array?: ${Array.isArray(recipe.ingredients)}`);
    
    if (Array.isArray(recipe.ingredients)) {
      console.log(`   Number of ingredients: ${recipe.ingredients.length}`);
      recipe.ingredients.slice(0, 3).forEach((ing, i) => {
        console.log(`   [${i}]: "${ing}"`);
      });
    } else if (recipe.ingredients) {
      console.log(`   Raw ingredients: "${recipe.ingredients.slice(0, 200)}..."`);
    } else {
      console.log(`   ❌ No ingredients!`);
    }
    
    // Also check instructions to see if they got mixed up
    if (recipe.instructions) {
      const instrStart = Array.isArray(recipe.instructions) 
        ? recipe.instructions[0]?.slice(0, 100) 
        : recipe.instructions.slice(0, 100);
      console.log(`   Instructions start: "${instrStart}..."`);
    }
    
    console.log('');
  }
  
  await prisma.$disconnect();
}

debugIngredients().catch(console.error); 
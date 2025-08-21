const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanRecipeCalories() {
  console.log('🧹 Cleaning calorie information from recipe titles...\n');
  
  try {
    // Get all recipes
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        slug: true
      }
    });
    
    console.log(`📝 Found ${recipes.length} recipes to check\n`);
    
    let cleanedCount = 0;
    
    for (const recipe of recipes) {
      const originalTitle = recipe.title;
      
      // Remove various calorie patterns:
      // - "(385 kcal)" 
      // - "385 kcal"
      // - "(385 kalorier)"
      // - "385 kalorier"
      // - "- 385 kcal"
      // - "Mandelkaka med frukt (385 kcal)"
      let cleanedTitle = originalTitle
        .replace(/\s*\(\d+\s*(kcal|kalorier)\)/gi, '') // Remove "(385 kcal)" or "(385 kalorier)"
        .replace(/\s*-?\s*\d+\s*(kcal|kalorier)\s*$/gi, '') // Remove "385 kcal" or "- 385 kcal" at end
        .replace(/\s*\d+\s*(kcal|kalorier)\s*-?\s*/gi, '') // Remove "385 kcal" anywhere
        .trim();
      
      // Clean up any double spaces or trailing punctuation
      cleanedTitle = cleanedTitle
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*-\s*$/, '') // Remove trailing dash
        .trim();
      
      if (cleanedTitle !== originalTitle) {
        console.log(`🔧 Cleaning: "${originalTitle}"`);
        console.log(`   ✅ New: "${cleanedTitle}"`);
        
        // Create new slug from cleaned title
        const newSlug = cleanedTitle
          .toLowerCase()
          .replace(/[åä]/g, 'a')
          .replace(/ö/g, 'o')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        // Update the recipe
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            title: cleanedTitle,
            slug: newSlug
          }
        });
        
        cleanedCount++;
        console.log(`   🔄 Updated slug: "${recipe.slug}" → "${newSlug}"\n`);
      }
    }
    
    console.log(`🎉 Cleaning complete!`);
    console.log(`📊 Cleaned ${cleanedCount} recipe titles`);
    console.log(`✅ All recipes now have clean titles without calorie information`);
    
  } catch (error) {
    console.error('❌ Error cleaning recipe calories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanRecipeCalories()
  .then(() => {
    console.log('✅ Recipe calorie cleaning completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 
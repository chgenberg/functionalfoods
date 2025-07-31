const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

(async () => {
  try {
    console.log('🔍 Checking for placeholder/dummy recipes...\n');

    // Find recipes with placeholder content
    const placeholders = await prisma.recipe.findMany({
      where: {
        OR: [
          { instructions: 'Instruktioner kommer snart.' },
          { excerpt: 'Receptinformation kommer snart...' },
          { excerpt: 'Flow-receptinformation kommer snart...' },
          { content: 'Detta recept håller på att fyllas i med fullständigt innehåll.' },
          { content: 'Detta Flow-recept håller på att fyllas i med fullständigt innehåll.' },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        tags: true,
        isPremium: true,
        ingredients: true,
        instructions: true,
      },
    });

    console.log(`📊 Total placeholder recipes found: ${placeholders.length}\n`);

    if (placeholders.length === 0) {
      console.log('✅ All recipes have real content - no placeholders found!');
    } else {
      console.log('⚠️  The following recipes are still placeholders:\n');

      const basicPlaceholders = placeholders.filter(r => r.tags.includes('Basic'));
      const flowPlaceholders = placeholders.filter(r => r.tags.includes('Flow'));

      if (basicPlaceholders.length > 0) {
        console.log('🟦 BASIC COURSE PLACEHOLDERS:');
        basicPlaceholders.forEach(r => {
          console.log(`   - ${r.title}`);
          console.log(`     Slug: ${r.slug}`);
          console.log(`     Ingredients: ${r.ingredients ? r.ingredients.join(', ') : 'None'}`);
          console.log('');
        });
      }

      if (flowPlaceholders.length > 0) {
        console.log('🟪 FLOW COURSE PLACEHOLDERS:');
        flowPlaceholders.forEach(r => {
          console.log(`   - ${r.title}`);
          console.log(`     Slug: ${r.slug}`);
          console.log(`     Ingredients: ${r.ingredients ? r.ingredients.join(', ') : 'None'}`);
          console.log('');
        });
      }

      console.log('💡 These placeholders need to be filled with real recipe content.');
      console.log('   You can either:');
      console.log('   1. Fill them in manually via admin panel');
      console.log('   2. Find the real recipes in your source files');
      console.log('   3. Replace them with existing similar recipes');
    }

    // Also check if any meal plan links point to placeholders
    console.log('\n🔗 Checking if any meal plan links use these placeholders...');
    
    const mealPlanPath = require('path').resolve(__dirname, '../app/data/mealPlans.ts');
    require('ts-node/register/transpile-only');
    const { mealPlans, flowMealPlans } = require(mealPlanPath);
    
    const allMealPlans = { ...mealPlans, ...flowMealPlans };
    const placeholderSlugs = new Set(placeholders.map(p => p.slug));
    const usedPlaceholders = [];

    for (const [weekKey, weekPlan] of Object.entries(allMealPlans)) {
      for (const [day, dayMeals] of Object.entries(weekPlan.days)) {
        for (const [slot, meal] of Object.entries(dayMeals)) {
          if (meal && meal.recipeLink) {
            const slug = meal.recipeLink.split('/').pop();
            if (placeholderSlugs.has(slug)) {
              usedPlaceholders.push({
                week: weekKey,
                day,
                slot,
                recipeName: meal.name,
                slug,
              });
            }
          }
        }
      }
    }

    if (usedPlaceholders.length > 0) {
      console.log(`\n⚠️  ${usedPlaceholders.length} meal plan entries link to placeholder recipes:`);
      usedPlaceholders.forEach(entry => {
        console.log(`   - ${entry.week} ${entry.day} ${entry.slot}: ${entry.recipeName}`);
      });
    } else {
      console.log('\n✅ No meal plan entries link to placeholder recipes!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})(); 
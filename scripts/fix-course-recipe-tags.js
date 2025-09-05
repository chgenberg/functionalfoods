const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Read meal plans from file
const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
const mealPlansContent = fs.readFileSync(mealPlansPath, 'utf8');

// Extract meal plan data using regex
function extractMealPlanData(content, exportName) {
  const regex = new RegExp(`export const ${exportName}[^{]*({[\\s\\S]*?});\\s*(?=export|$)`, 'm');
  const match = content.match(regex);
  if (!match) return {};
  
  try {
    // Convert TypeScript to JSON-like format
    const jsonStr = match[1]
      .replace(/(\w+):/g, '"$1":')  // Quote keys
      .replace(/'/g, '"')           // Convert single quotes to double
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error(`Error parsing ${exportName}:`, e.message);
    return {};
  }
}

const mealPlans = extractMealPlanData(mealPlansContent, 'mealPlans');
const flowMealPlans = extractMealPlanData(mealPlansContent, 'flowMealPlans');
const energyMealPlans = extractMealPlanData(mealPlansContent, 'energyMealPlans');

function extractRecipeSlugs(mealPlanData) {
  const slugs = new Set();
  
  Object.values(mealPlanData).forEach(week => {
    Object.values(week).forEach(day => {
      if (day.meals) {
        Object.values(day.meals).forEach(meal => {
          if (meal.recipe) {
            slugs.add(meal.recipe);
          }
        });
      }
    });
  });
  
  return Array.from(slugs);
}

async function fixCourseRecipeTags() {
  try {
    console.log('🏷️ Fixing course recipe tags...\n');

    // Extract recipe slugs from each course
    const basicSlugs = extractRecipeSlugs(mealPlans);
    const flowSlugs = extractRecipeSlugs(flowMealPlans);
    const energySlugs = extractRecipeSlugs(energyMealPlans);

    console.log(`📊 Course recipe counts:`);
    console.log(`  Functional Basics: ${basicSlugs.length} recipes`);
    console.log(`  Functional Flow: ${flowSlugs.length} recipes`);
    console.log(`  Functional Energy: ${energySlugs.length} recipes\n`);

    // Get all recipes to check current state
    const allRecipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        tags: true,
        isPremium: true,
        isFree: true
      }
    });

    console.log(`📈 Current database state:`);
    console.log(`  Total recipes: ${allRecipes.length}`);
    console.log(`  Premium recipes: ${allRecipes.filter(r => r.isPremium).length}`);
    console.log(`  Free recipes: ${allRecipes.filter(r => r.isFree).length}\n`);

    let updated = 0;
    let errors = 0;

    // Process Basic recipes
    console.log('🔵 Processing Functional Basics recipes...');
    for (const slug of basicSlugs) {
      const recipe = allRecipes.find(r => r.slug === slug);
      if (recipe) {
        const currentTags = recipe.tags || [];
        const newTags = [...currentTags.filter(tag => !['Basic', 'Flow', 'Energy'].includes(tag)), 'Basic'];
        
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            tags: newTags,
            isPremium: true,
            isFree: false
          }
        });
        updated++;
      } else {
        console.log(`  ❌ Missing: ${slug}`);
        errors++;
      }
    }

    // Process Flow recipes
    console.log('🟡 Processing Functional Flow recipes...');
    for (const slug of flowSlugs) {
      const recipe = allRecipes.find(r => r.slug === slug);
      if (recipe) {
        const currentTags = recipe.tags || [];
        const newTags = [...currentTags.filter(tag => !['Basic', 'Flow', 'Energy'].includes(tag)), 'Flow'];
        
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            tags: newTags,
            isPremium: true,
            isFree: false
          }
        });
        updated++;
      } else {
        console.log(`  ❌ Missing: ${slug}`);
        errors++;
      }
    }

    // Process Energy recipes
    console.log('🟢 Processing Functional Energy recipes...');
    for (const slug of energySlugs) {
      const recipe = allRecipes.find(r => r.slug === slug);
      if (recipe) {
        const currentTags = recipe.tags || [];
        const newTags = [...currentTags.filter(tag => !['Basic', 'Flow', 'Energy'].includes(tag)), 'Energy'];
        
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            tags: newTags,
            isPremium: true,
            isFree: false
          }
        });
        updated++;
      } else {
        console.log(`  ❌ Missing: ${slug}`);
        errors++;
      }
    }

    // Make sure non-course recipes are free (except admin-only ones)
    console.log('🆓 Setting non-course recipes to free...');
    const allCourseSlugs = [...basicSlugs, ...flowSlugs, ...energySlugs];
    const nonCourseRecipes = allRecipes.filter(r => 
      !allCourseSlugs.includes(r.slug) && 
      !(r.tags?.includes('ADMIN_ONLY') || r.tags?.includes('UD'))
    );

    for (const recipe of nonCourseRecipes) {
      if (recipe.isPremium || !recipe.isFree) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            isPremium: false,
            isFree: true
          }
        });
        updated++;
      }
    }

    // Final verification
    const finalCounts = await Promise.all([
      prisma.recipe.count({ where: { tags: { has: 'Basic' } } }),
      prisma.recipe.count({ where: { tags: { has: 'Flow' } } }),
      prisma.recipe.count({ where: { tags: { has: 'Energy' } } }),
      prisma.recipe.count({ where: { isPremium: true, isFree: false } }),
      prisma.recipe.count({ where: { isPremium: false, isFree: true } }),
      prisma.recipe.count({ where: { tags: { hasSome: ['ADMIN_ONLY', 'UD'] } } })
    ]);

    console.log('\n✅ COURSE RECIPE TAGGING COMPLETE!');
    console.log('==============================================');
    console.log(`📊 Final counts:`);
    console.log(`  Basic tagged: ${finalCounts[0]}`);
    console.log(`  Flow tagged: ${finalCounts[1]}`);
    console.log(`  Energy tagged: ${finalCounts[2]}`);
    console.log(`  Premium recipes: ${finalCounts[3]}`);
    console.log(`  Free recipes: ${finalCounts[4]}`);
    console.log(`  Admin-only recipes: ${finalCounts[5]}`);
    console.log(`\n📈 Updates made: ${updated}`);
    console.log(`❌ Missing recipes: ${errors}`);

    if (errors === 0) {
      console.log('\n🎉 ALL COURSE RECIPES ARE PROPERLY TAGGED!');
      console.log('Users with course access should now be able to view their recipes.');
    } else {
      console.log(`\n⚠️ ${errors} recipes are missing from database but referenced in meal plans.`);
    }

  } catch (error) {
    console.error('❌ Error fixing course recipe tags:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixCourseRecipeTags();
}

module.exports = { fixCourseRecipeTags }; 
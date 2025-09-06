const { PrismaClient } = require('@prisma/client');
const { mealPlans, flowMealPlans, energyMealPlans } = require('../app/data/mealPlans.ts');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 COMPREHENSIVE COURSE RECIPE FIX');
  console.log('=====================================\n');

  // Collect ALL recipe slugs from meal plans
  const basicSlugs = new Set();
  const flowSlugs = new Set();
  const energySlugs = new Set();
  
  // Helper to extract slug from recipe link
  const extractSlug = (link) => {
    if (!link) return null;
    return link.replace(/^\/kunskapsbank\/recept\//, '');
  };

  // Collect Basics recipes
  console.log('📚 Collecting Functional Basics recipes...');
  Object.entries(mealPlans).forEach(([weekKey, week]) => {
    if (!week.days) return;
    Object.entries(week.days).forEach(([dayKey, day]) => {
      ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].forEach(mealType => {
        if (day[mealType]?.recipeLink) {
          const slug = extractSlug(day[mealType].recipeLink);
          if (slug) basicSlugs.add(slug);
        }
      });
    });
  });
  console.log(`  Found ${basicSlugs.size} unique recipes in Basics meal plans`);

  // Collect Flow recipes
  console.log('🌊 Collecting Functional Flow recipes...');
  Object.entries(flowMealPlans).forEach(([weekKey, week]) => {
    if (!week.days) return;
    Object.entries(week.days).forEach(([dayKey, day]) => {
      ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].forEach(mealType => {
        if (day[mealType]?.recipeLink) {
          const slug = extractSlug(day[mealType].recipeLink);
          if (slug) flowSlugs.add(slug);
        }
      });
    });
  });
  console.log(`  Found ${flowSlugs.size} unique recipes in Flow meal plans`);

  // Collect Energy recipes
  console.log('⚡ Collecting Functional Energy recipes...');
  Object.entries(energyMealPlans).forEach(([weekKey, week]) => {
    if (!week.days) return;
    Object.entries(week.days).forEach(([dayKey, day]) => {
      ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].forEach(mealType => {
        if (day[mealType]?.recipeLink) {
          const slug = extractSlug(day[mealType].recipeLink);
          if (slug) energySlugs.add(slug);
        }
      });
    });
  });
  console.log(`  Found ${energySlugs.size} unique recipes in Energy meal plans`);

  // Get all unique course recipe slugs
  const allCourseSlugs = new Set([...basicSlugs, ...flowSlugs, ...energySlugs]);
  console.log(`\n📊 Total unique course recipes: ${allCourseSlugs.size}`);

  // Update database
  console.log('\n🔄 Updating database...');

  // First, reset ALL recipes to free
  console.log('  1️⃣ Resetting all recipes to free...');
  await prisma.recipe.updateMany({
    data: {
      isPremium: false,
      isFree: true
    }
  });

  // Then update course recipes
  console.log('  2️⃣ Updating course recipes...');
  
  // Update Basics recipes
  if (basicSlugs.size > 0) {
    const basicResult = await prisma.recipe.updateMany({
      where: { slug: { in: Array.from(basicSlugs) } },
      data: {
        isPremium: false,
        isFree: false,
        tags: {
          set: ['Basic']
        }
      }
    });
    console.log(`     ✅ Updated ${basicResult.count} Basics recipes`);
  }

  // Update Flow recipes
  if (flowSlugs.size > 0) {
    const flowResult = await prisma.recipe.updateMany({
      where: { slug: { in: Array.from(flowSlugs) } },
      data: {
        isPremium: false,
        isFree: false,
        tags: {
          set: ['Flow']
        }
      }
    });
    console.log(`     ✅ Updated ${flowResult.count} Flow recipes`);
  }

  // Update Energy recipes
  if (energySlugs.size > 0) {
    const energyResult = await prisma.recipe.updateMany({
      where: { slug: { in: Array.from(energySlugs) } },
      data: {
        isPremium: false,
        isFree: false,
        tags: {
          set: ['Energy']
        }
      }
    });
    console.log(`     ✅ Updated ${energyResult.count} Energy recipes`);
  }

  // Handle recipes that appear in multiple courses
  console.log('\n  3️⃣ Handling recipes in multiple courses...');
  let multiCourseCount = 0;
  
  for (const slug of allCourseSlugs) {
    const courseTags = [];
    if (basicSlugs.has(slug)) courseTags.push('Basic');
    if (flowSlugs.has(slug)) courseTags.push('Flow');
    if (energySlugs.has(slug)) courseTags.push('Energy');
    
    if (courseTags.length > 1) {
      await prisma.recipe.update({
        where: { slug },
        data: {
          tags: {
            set: courseTags
          }
        }
      });
      multiCourseCount++;
    }
  }
  console.log(`     ✅ Updated ${multiCourseCount} recipes that appear in multiple courses`);

  // Final verification
  console.log('\n📊 FINAL DATABASE STATUS:');
  
  const totalRecipes = await prisma.recipe.count();
  const freeRecipes = await prisma.recipe.count({ where: { isFree: true } });
  const courseRecipes = await prisma.recipe.count({ where: { isFree: false } });
  const basicTagged = await prisma.recipe.count({ where: { tags: { has: 'Basic' } } });
  const flowTagged = await prisma.recipe.count({ where: { tags: { has: 'Flow' } } });
  const energyTagged = await prisma.recipe.count({ where: { tags: { has: 'Energy' } } });

  console.log(`  Total recipes: ${totalRecipes}`);
  console.log(`  Free recipes: ${freeRecipes}`);
  console.log(`  Course recipes: ${courseRecipes}`);
  console.log(`  Basic tagged: ${basicTagged}`);
  console.log(`  Flow tagged: ${flowTagged}`);
  console.log(`  Energy tagged: ${energyTagged}`);

  // Check for missing recipes
  console.log('\n🔍 Checking for missing recipes...');
  const dbRecipes = await prisma.recipe.findMany({ select: { slug: true } });
  const dbSlugs = new Set(dbRecipes.map(r => r.slug));
  
  const missing = [];
  for (const slug of allCourseSlugs) {
    if (!dbSlugs.has(slug)) {
      missing.push(slug);
    }
  }
  
  if (missing.length > 0) {
    console.log(`  ⚠️  ${missing.length} recipes in meal plans are missing from database:`);
    missing.forEach(slug => console.log(`     - ${slug}`));
  } else {
    console.log('  ✅ All meal plan recipes exist in database!');
  }

  console.log('\n✅ COMPREHENSIVE FIX COMPLETE!');
  
  await prisma.$disconnect();
}

main().catch(console.error); 
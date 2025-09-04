const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function makeCourseRecipesPremium() {
  console.log('🔒 Making all course-linked recipes premium...\n');

  // Read meal plans file to extract all course-linked recipe slugs
  const mealPlansPath = path.join(__dirname, '../app/data/mealPlans.ts');
  const mealPlansContent = fs.readFileSync(mealPlansPath, 'utf8');

  // Extract recipe slugs from all courses
  const extractRecipeSlugs = (courseSection) => {
    const recipeLinks = courseSection.match(/recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g) || [];
    return recipeLinks.map(link => {
      const match = link.match(/recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/);
      return match ? match[1] : null;
    }).filter(Boolean);
  };

  // Extract from all three courses
  const basicsMatch = mealPlansContent.match(/export const mealPlans[^}]+}[^;]+;/s);
  const flowMatch = mealPlansContent.match(/export const flowMealPlans[^}]+}[^;]+;/s);
  const energyMatch = mealPlansContent.match(/export const energyMealPlans[^}]+}[^;]+;/s);

  const basicsSlugs = basicsMatch ? extractRecipeSlugs(basicsMatch[0]) : [];
  const flowSlugs = flowMatch ? extractRecipeSlugs(flowMatch[0]) : [];
  const energySlugs = energyMatch ? extractRecipeSlugs(energyMatch[0]) : [];

  // Get all unique course-linked slugs
  const allCourseLinkedSlugs = [...new Set([...basicsSlugs, ...flowSlugs, ...energySlugs])];
  
  console.log(`📋 Found ${allCourseLinkedSlugs.length} unique course-linked recipe slugs`);
  console.log(`- Functional Basics: ${[...new Set(basicsSlugs)].length} recept`);
  console.log(`- Functional Flow: ${[...new Set(flowSlugs)].length} recept`);
  console.log(`- Functional Energy: ${[...new Set(energySlugs)].length} recept\n`);

  // Get current database state
  const allRecipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      isPremium: true,
      isFree: true
    }
  });

  console.log(`📊 Current database state:`);
  console.log(`Total recipes: ${allRecipes.length}`);
  console.log(`Currently premium: ${allRecipes.filter(r => r.isPremium).length}`);
  console.log(`Currently free: ${allRecipes.filter(r => r.isFree || !r.isPremium).length}\n`);

  // Find course-linked recipes in database
  const courseLinkedRecipes = allRecipes.filter(recipe => 
    allCourseLinkedSlugs.includes(recipe.slug)
  );

  // Find non-course recipes (should be free)
  const nonCourseRecipes = allRecipes.filter(recipe => 
    !allCourseLinkedSlugs.includes(recipe.slug)
  );

  console.log(`🎯 RECIPE CATEGORIZATION:`);
  console.log(`Course-linked recipes found in DB: ${courseLinkedRecipes.length}`);
  console.log(`Non-course recipes: ${nonCourseRecipes.length}`);
  console.log(`Missing from DB: ${allCourseLinkedSlugs.length - courseLinkedRecipes.length}\n`);

  // Update course-linked recipes to premium
  console.log('🔒 Setting course-linked recipes to PREMIUM...');
  const premiumUpdateResult = await prisma.recipe.updateMany({
    where: {
      slug: {
        in: allCourseLinkedSlugs
      }
    },
    data: {
      isPremium: true,
      isFree: false
    }
  });

  console.log(`✅ Updated ${premiumUpdateResult.count} recipes to PREMIUM\n`);

  // Update non-course recipes to free
  console.log('🆓 Setting non-course recipes to FREE...');
  const freeUpdateResult = await prisma.recipe.updateMany({
    where: {
      slug: {
        notIn: allCourseLinkedSlugs
      }
    },
    data: {
      isPremium: false,
      isFree: true
    }
  });

  console.log(`✅ Updated ${freeUpdateResult.count} recipes to FREE\n`);

  // Verify final state
  const finalRecipes = await prisma.recipe.findMany({
    select: {
      isPremium: true,
      isFree: true,
      slug: true
    }
  });

  const finalPremium = finalRecipes.filter(r => r.isPremium).length;
  const finalFree = finalRecipes.filter(r => r.isFree || !r.isPremium).length;

  console.log(`📊 FINAL STATE:`);
  console.log(`┌─────────────────────────────┬─────────┐`);
  console.log(`│ Category                    │ Count   │`);
  console.log(`├─────────────────────────────┼─────────┤`);
  console.log(`│ Premium (course-linked)     │ ${finalPremium.toString().padStart(7)} │`);
  console.log(`│ Free (non-course)           │ ${finalFree.toString().padStart(7)} │`);
  console.log(`│ Total recipes               │ ${finalRecipes.length.toString().padStart(7)} │`);
  console.log(`└─────────────────────────────┴─────────┘`);

  // Verify that course-linked recipes are premium
  const courseLinkedInDb = finalRecipes.filter(r => allCourseLinkedSlugs.includes(r.slug));
  const courseLinkedPremium = courseLinkedInDb.filter(r => r.isPremium).length;
  const courseLinkedFree = courseLinkedInDb.filter(r => !r.isPremium).length;

  console.log(`\n🔍 VERIFICATION:`);
  console.log(`Course-linked recipes in DB: ${courseLinkedInDb.length}`);
  console.log(`- Now premium: ${courseLinkedPremium}`);
  console.log(`- Still free: ${courseLinkedFree}`);

  if (courseLinkedFree > 0) {
    console.log(`\n⚠️  WARNING: ${courseLinkedFree} course-linked recipes are still free!`);
  } else {
    console.log(`\n✅ SUCCESS: All course-linked recipes are now premium!`);
  }

  await prisma.$disconnect();

  return {
    totalRecipes: finalRecipes.length,
    premiumRecipes: finalPremium,
    freeRecipes: finalFree,
    courseLinkedRecipes: courseLinkedInDb.length,
    courseLinkedPremium,
    courseLinkedFree
  };
}

if (require.main === module) {
  makeCourseRecipesPremium()
    .then(result => {
      console.log('\n🎯 Recipe access control updated!');
      console.log(`Premium: ${result.premiumRecipes}, Free: ${result.freeRecipes}`);
      
      if (result.courseLinkedFree > 0) {
        console.log(`⚠️  ${result.courseLinkedFree} course recipes still free - manual review needed`);
        process.exit(1);
      } else {
        console.log('✅ All course recipes are now premium-only!');
      }
    })
    .catch(console.error);
}

module.exports = { makeCourseRecipesPremium }; 
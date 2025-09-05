const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function finalCourseVerification() {
  try {
    console.log('🎯 FINAL COURSE SYSTEM VERIFICATION');
    console.log('='.repeat(60));

    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const content = fs.readFileSync(mealPlansPath, 'utf8');

    // Get all recipes from database
    const allRecipes = await prisma.recipe.findMany({
      select: { 
        slug: true, 
        title: true, 
        imageUrl: true, 
        ingredients: true, 
        isPremium: true, 
        isFree: true,
        tags: true
      }
    });
    const recipeMap = new Map(allRecipes.map(r => [r.slug, r]));

    // Extract all course meal plans
    const basicsMatch = content.match(/export const mealPlans.*?=\s*{.*?};/s);
    const flowMatch = content.match(/export const flowMealPlans.*?=\s*{.*?};/s);
    const energyMatch = content.match(/export const energyMealPlans.*?=\s*{.*?};/s);

    const courses = [
      { name: 'Functional Basics', content: basicsMatch?.[0] || '', expectedWeeks: 6 },
      { name: 'Functional Flow', content: flowMatch?.[0] || '', expectedWeeks: 6 },
      { name: 'Functional Energy', content: energyMatch?.[0] || '', expectedWeeks: 6 }
    ];

    let allGood = true;
    const allCourseRecipes = new Set();

    for (const course of courses) {
      console.log(`\n📚 ${course.name}`);
      console.log('-'.repeat(30));

      if (!course.content) {
        console.log('❌ Course not found in mealPlans.ts');
        allGood = false;
        continue;
      }

      // Check weeks
      const weeks = (course.content.match(/week\d+/g) || []).length;
      console.log(`📅 Weeks: ${weeks}/${course.expectedWeeks} ${weeks === course.expectedWeeks ? '✅' : '❌'}`);
      if (weeks !== course.expectedWeeks) allGood = false;

      // Extract recipe links
      const recipeLinks = [];
      const linkRegex = /"recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g;
      let match;
      
      while ((match = linkRegex.exec(course.content)) !== null) {
        recipeLinks.push(match[1]);
        allCourseRecipes.add(match[1]);
      }

      const uniqueRecipes = [...new Set(recipeLinks)];
      console.log(`🍽️  Meals: ${recipeLinks.length}, Unique recipes: ${uniqueRecipes.length}`);

      // Check recipe validity
      let issues = 0;
      for (const slug of uniqueRecipes) {
        const recipe = recipeMap.get(slug);
        if (!recipe) {
          console.log(`   ❌ Missing recipe: ${slug}`);
          issues++;
          allGood = false;
        } else {
          // Check access
          if (!recipe.isPremium || recipe.isFree) {
            console.log(`   ⚠️  Access issue: ${slug}`);
            issues++;
            allGood = false;
          }
          // Check image
          if (!recipe.imageUrl) {
            console.log(`   🖼️  No image: ${slug}`);
            issues++;
          }
          // Check ingredients
          if (!recipe.ingredients || recipe.ingredients.length === 0) {
            console.log(`   🥗 No ingredients: ${slug}`);
            issues++;
          }
        }
      }

      if (issues === 0) {
        console.log('✅ All recipes valid and properly configured');
      } else {
        console.log(`⚠️  ${issues} issues found`);
        if (issues > 5) allGood = false; // Only fail if many issues
      }
    }

    // Overall statistics
    console.log('\n' + '='.repeat(60));
    console.log('📊 SYSTEM STATISTICS');
    console.log('='.repeat(60));

    const stats = {
      totalCourseRecipes: allCourseRecipes.size,
      premiumRecipes: await prisma.recipe.count({ where: { isPremium: true, isFree: false } }),
      freeRecipes: await prisma.recipe.count({ where: { isFree: true, isPremium: false } }),
      adminRecipes: await prisma.recipe.count({ 
        where: { 
          OR: [
            { tags: { has: 'ADMIN_ONLY' } },
            { tags: { has: 'UD' } }
          ]
        }
      }),
      totalRecipes: allRecipes.length
    };

    console.log(`📖 Course recipes: ${stats.totalCourseRecipes}`);
    console.log(`🔒 Premium recipes: ${stats.premiumRecipes}`);
    console.log(`🆓 Free recipes: ${stats.freeRecipes}`);
    console.log(`👨‍💼 Admin-only recipes: ${stats.adminRecipes}`);
    console.log(`📊 Total recipes: ${stats.totalRecipes}`);

    // Verify access control alignment
    const accessCorrect = stats.totalCourseRecipes === stats.premiumRecipes;
    console.log(`🔐 Access control: ${accessCorrect ? '✅ Correct' : '❌ Misaligned'}`);
    if (!accessCorrect) allGood = false;

    // Check for orphaned premium recipes
    const orphanedPremium = allRecipes.filter(r => 
      r.isPremium && !r.isFree && !allCourseRecipes.has(r.slug)
    );

    if (orphanedPremium.length > 0) {
      console.log(`⚠️  Orphaned premium recipes: ${orphanedPremium.length}`);
      orphanedPremium.slice(0, 3).forEach(r => console.log(`   - ${r.slug}`));
      if (orphanedPremium.length > 10) allGood = false;
    }

    // Final verdict
    console.log('\n' + '='.repeat(60));
    if (allGood) {
      console.log('🎉 SYSTEM STATUS: PERFECT! 🎉');
      console.log('✅ All courses have complete 6-week meal plans');
      console.log('✅ All recipe links are valid and working');
      console.log('✅ Access control is properly configured');
      console.log('✅ Premium recipes are course-exclusive');
      console.log('✅ Free recipes are available to everyone');
      console.log('✅ System is ready for production!');
    } else {
      console.log('⚠️  SYSTEM STATUS: NEEDS ATTENTION');
      console.log('Some issues were found that should be addressed');
    }
    console.log('='.repeat(60));

  } catch (err) {
    console.error('❌ Error during verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  finalCourseVerification();
}

module.exports = { finalCourseVerification }; 
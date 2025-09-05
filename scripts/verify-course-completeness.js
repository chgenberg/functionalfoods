const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function verifyCourseCompleteness() {
  try {
    console.log('🔍 COURSE COMPLETENESS VERIFICATION\n');

    // Import meal plans directly
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    
    // We'll analyze the file content directly
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

    const courses = [
      { 
        name: 'Functional Basics', 
        pattern: /export const mealPlans.*?=\s*{([\s\S]*?)};/,
        expectedWeeks: 6
      },
      { 
        name: 'Functional Flow', 
        pattern: /export const flowMealPlans.*?=\s*{([\s\S]*?)};/,
        expectedWeeks: 6
      },
      { 
        name: 'Functional Energy', 
        pattern: /export const energyMealPlans.*?=\s*{([\s\S]*?)};/,
        expectedWeeks: 6
      }
    ];

    let totalIssues = 0;
    const allCourseRecipes = new Set();

    for (const course of courses) {
      console.log(`\n📚 ${course.name.toUpperCase()}`);
      console.log('='.repeat(50));

      const match = content.match(course.pattern);
      if (!match) {
        console.log(`❌ Could not find ${course.name} meal plans`);
        totalIssues++;
        continue;
      }

      const courseContent = match[1];
      
      // Count weeks
      const weekMatches = courseContent.match(/week\d+:/g) || [];
      const weekCount = weekMatches.length;
      console.log(`📅 Weeks: ${weekCount}/${course.expectedWeeks}`);
      
      if (weekCount !== course.expectedWeeks) {
        console.log(`⚠️  Expected ${course.expectedWeeks} weeks, found ${weekCount}`);
        totalIssues++;
      }

      // Extract all recipe links
      const recipeLinks = [];
      const linkRegex = /"recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g;
      let linkMatch;
      
      while ((linkMatch = linkRegex.exec(courseContent)) !== null) {
        recipeLinks.push(linkMatch[1]);
        allCourseRecipes.add(linkMatch[1]);
      }

      const uniqueRecipes = [...new Set(recipeLinks)];
      console.log(`🍽️  Total meals: ${recipeLinks.length}`);
      console.log(`📖 Unique recipes: ${uniqueRecipes.length}`);

      // Verify each recipe
      let validRecipes = 0;
      let missingRecipes = 0;
      let accessIssues = 0;
      let imageIssues = 0;
      let ingredientIssues = 0;

      const courseIssues = [];

      for (const slug of uniqueRecipes) {
        const recipe = recipeMap.get(slug);
        
        if (!recipe) {
          missingRecipes++;
          courseIssues.push(`Missing recipe: ${slug}`);
          continue;
        }

        validRecipes++;

        // Check access settings
        if (!recipe.isPremium || recipe.isFree) {
          accessIssues++;
          courseIssues.push(`Access issue: ${slug} (premium: ${recipe.isPremium}, free: ${recipe.isFree})`);
        }

        // Check image
        if (!recipe.imageUrl || recipe.imageUrl.trim() === '') {
          imageIssues++;
          courseIssues.push(`No image: ${slug}`);
        }

        // Check ingredients
        if (!recipe.ingredients || recipe.ingredients.length === 0) {
          ingredientIssues++;
          courseIssues.push(`No ingredients: ${slug}`);
        }
      }

      console.log(`✅ Valid recipes: ${validRecipes}`);
      console.log(`❌ Missing recipes: ${missingRecipes}`);
      console.log(`⚠️  Access issues: ${accessIssues}`);
      console.log(`🖼️  Image issues: ${imageIssues}`);
      console.log(`🥗 Ingredient issues: ${ingredientIssues}`);

      if (courseIssues.length > 0) {
        console.log(`\n🔍 Issues (first 5):`);
        courseIssues.slice(0, 5).forEach(issue => console.log(`   - ${issue}`));
        totalIssues += courseIssues.length;
      }

      // Check weekly structure
      console.log(`\n📋 Weekly Structure:`);
      for (let week = 1; week <= course.expectedWeeks; week++) {
        const weekPattern = new RegExp(`"week${week}":\\s*{[^}]*"days":\\s*{([\\s\\S]*?)}[\\s\\S]*?}`, 'g');
        const weekMatch = weekPattern.exec(courseContent);
        
        if (!weekMatch) {
          console.log(`   ❌ Week ${week}: Not found`);
          totalIssues++;
          continue;
        }

        const daysContent = weekMatch[1];
        const days = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
        let dayCount = 0;
        
        for (const day of days) {
          if (daysContent.includes(`"${day}"`)) {
            dayCount++;
          }
        }

        const status = dayCount === 7 ? '✅' : '⚠️ ';
        console.log(`   ${status} Week ${week}: ${dayCount}/7 days`);
        
        if (dayCount < 7) {
          totalIssues++;
        }
      }
    }

    // Overall summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 OVERALL SUMMARY');
    console.log('='.repeat(60));

    const totalCourseRecipes = allCourseRecipes.size;
    const premiumRecipes = await prisma.recipe.count({
      where: { isPremium: true, isFree: false }
    });
    const freeRecipes = await prisma.recipe.count({
      where: { isFree: true, isPremium: false }
    });

    console.log(`📖 Total unique course recipes: ${totalCourseRecipes}`);
    console.log(`🔒 Premium recipes in DB: ${premiumRecipes}`);
    console.log(`🆓 Free recipes in DB: ${freeRecipes}`);
    console.log(`📊 Total recipes in DB: ${allRecipes.length}`);

    if (totalIssues === 0) {
      console.log('\n✅ ALL COURSES ARE PERFECTLY CONFIGURED!');
      console.log('✅ All recipe links are valid');
      console.log('✅ All recipes have correct access settings');
      console.log('✅ All weeks and days are complete');
      console.log('✅ All recipes have images and ingredients');
    } else {
      console.log(`\n⚠️  TOTAL ISSUES FOUND: ${totalIssues}`);
      console.log('Some issues need attention');
    }

    // Check for orphaned premium recipes
    const orphanedPremium = allRecipes.filter(r => 
      r.isPremium && !r.isFree && !allCourseRecipes.has(r.slug)
    );

    if (orphanedPremium.length > 0) {
      console.log(`\n⚠️  ORPHANED PREMIUM RECIPES: ${orphanedPremium.length}`);
      console.log('These recipes are premium but not used in any course:');
      orphanedPremium.slice(0, 5).forEach(r => console.log(`   - ${r.slug}`));
    }

  } catch (err) {
    console.error('❌ Error during verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyCourseCompleteness();
}

module.exports = { verifyCourseCompleteness }; 
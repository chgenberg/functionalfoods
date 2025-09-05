const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function verifyAllCourseStructures() {
  try {
    console.log('🔍 COMPREHENSIVE COURSE STRUCTURE VERIFICATION\n');

    // Read meal plans
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const content = fs.readFileSync(mealPlansPath, 'utf8');

    // Parse each course's meal plans
    const courses = [
      { name: 'Functional Basics', key: 'mealPlans', weeks: 6 },
      { name: 'Functional Flow', key: 'flowMealPlans', weeks: 6 },
      { name: 'Functional Energy', key: 'energyMealPlans', weeks: 6 }
    ];

    const allRecipes = await prisma.recipe.findMany({
      select: { slug: true, title: true, imageUrl: true, ingredients: true, isPremium: true, isFree: true }
    });
    const recipeMap = new Map(allRecipes.map(r => [r.slug, r]));

    let totalIssues = 0;

    for (const course of courses) {
      console.log(`\n📚 ${course.name.toUpperCase()}`);
      console.log('='.repeat(50));

      // Extract course-specific meal plans
      const courseRegex = new RegExp(`export const ${course.key} = ({[\\s\\S]*?});`, 'g');
      const courseMatch = courseRegex.exec(content);
      
      if (!courseMatch) {
        console.log(`❌ Could not find ${course.key} in mealPlans.ts`);
        totalIssues++;
        continue;
      }

      // Count weeks in this course
      const weekRegex = /week\d+:/g;
      const weeks = (courseMatch[1].match(weekRegex) || []).length;
      console.log(`📅 Weeks found: ${weeks}/${course.weeks}`);
      
      if (weeks !== course.weeks) {
        console.log(`⚠️  Expected ${course.weeks} weeks, found ${weeks}`);
        totalIssues++;
      }

      // Extract all recipe links for this course
      const courseMealRegex = new RegExp(
        `export const ${course.key} = {[\\s\\S]*?};`,
        'g'
      );
      const courseMealMatch = courseMealRegex.exec(content);
      
      if (courseMealMatch) {
        const courseContent = courseMealMatch[0];
        const recipeLinks = [];
        const linkRegex = /"recipeLink":\s*"([^"]*)"/g;
        let linkMatch;
        
        while ((linkMatch = linkRegex.exec(courseContent)) !== null) {
          const link = linkMatch[1];
          if (link && link.includes('/kunskapsbank/recept/')) {
            const slugMatch = link.match(/\/kunskapsbank\/recept\/([^"]+)/);
            if (slugMatch) {
              recipeLinks.push(slugMatch[1]);
            }
          }
        }

        const uniqueRecipes = [...new Set(recipeLinks)];
        console.log(`🍽️  Total meal entries: ${recipeLinks.length}`);
        console.log(`📖 Unique recipes: ${uniqueRecipes.length}`);

        // Check recipe validity
        let validRecipes = 0;
        let missingRecipes = 0;
        let incorrectAccess = 0;
        const issues = [];

        for (const slug of uniqueRecipes) {
          const recipe = recipeMap.get(slug);
          if (!recipe) {
            missingRecipes++;
            issues.push(`Missing recipe: ${slug}`);
          } else {
            validRecipes++;
            
            // Check if course recipe has correct access settings
            if (!recipe.isPremium || recipe.isFree) {
              incorrectAccess++;
              issues.push(`Incorrect access for ${slug}: premium=${recipe.isPremium}, free=${recipe.isFree}`);
            }

            // Check if recipe has image
            if (!recipe.imageUrl) {
              issues.push(`No image for ${slug}`);
            }

            // Check if recipe has ingredients
            if (!recipe.ingredients || recipe.ingredients.length === 0) {
              issues.push(`No ingredients for ${slug}`);
            }
          }
        }

        console.log(`✅ Valid recipes: ${validRecipes}`);
        console.log(`❌ Missing recipes: ${missingRecipes}`);
        console.log(`⚠️  Incorrect access settings: ${incorrectAccess}`);

        if (issues.length > 0) {
          console.log(`\n🔍 Issues found (first 5):`);
          issues.slice(0, 5).forEach(issue => console.log(`   - ${issue}`));
          totalIssues += issues.length;
        }

        // Check weekly structure
        console.log(`\n📋 Weekly Structure Check:`);
        for (let week = 1; week <= course.weeks; week++) {
          const weekRegex = new RegExp(`week${week}:\\s*{([\\s\\S]*?)}(?=\\s*,?\\s*(?:week\\d+:|}))`);
          const weekMatch = weekRegex.exec(courseContent);
          
          if (!weekMatch) {
            console.log(`   ❌ Week ${week}: Missing`);
            totalIssues++;
            continue;
          }

          const weekContent = weekMatch[1];
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          let dayCount = 0;
          
          for (const day of days) {
            if (weekContent.includes(`${day}:`)) {
              dayCount++;
            }
          }

          console.log(`   📅 Week ${week}: ${dayCount}/7 days`);
          if (dayCount < 7) {
            totalIssues++;
          }
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 OVERALL SUMMARY');
    console.log('='.repeat(60));
    
    if (totalIssues === 0) {
      console.log('✅ All courses have perfect structure!');
      console.log('✅ All recipe links are valid');
      console.log('✅ All recipes have correct access settings');
      console.log('✅ All weeks and days are properly configured');
    } else {
      console.log(`⚠️  Total issues found: ${totalIssues}`);
      console.log('Some issues need to be addressed');
    }

    // Final database stats
    const courseRecipeCount = await prisma.recipe.count({
      where: { isPremium: true, isFree: false }
    });
    const freeRecipeCount = await prisma.recipe.count({
      where: { isFree: true, isPremium: false }
    });
    const adminRecipeCount = await prisma.recipe.count({
      where: { 
        OR: [
          { tags: { has: 'ADMIN_ONLY' } },
          { tags: { has: 'UD' } }
        ]
      }
    });

    console.log(`\n📈 Recipe Database Stats:`);
    console.log(`   Premium (course) recipes: ${courseRecipeCount}`);
    console.log(`   Free recipes: ${freeRecipeCount}`);
    console.log(`   Admin-only recipes: ${adminRecipeCount}`);
    console.log(`   Total recipes: ${courseRecipeCount + freeRecipeCount + adminRecipeCount}`);

  } catch (err) {
    console.error('❌ Error during verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyAllCourseStructures();
}

module.exports = { verifyAllCourseStructures }; 
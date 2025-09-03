const { PrismaClient } = require('@prisma/client');
const stringSimilarity = require('string-similarity');

const prisma = new PrismaClient();

// Import meal plans directly
const { mealPlans, flowMealPlans, energyMealPlans } = require('../app/data/mealPlans.ts');

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRecipesFromMealPlan(mealPlan, courseName) {
  const recipes = [];
  
  if (!mealPlan) return recipes;
  
  Object.entries(mealPlan).forEach(([weekKey, week]) => {
    if (!week.days) return;
    
    Object.entries(week.days).forEach(([dayName, day]) => {
      ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].forEach(mealType => {
        if (day[mealType] && day[mealType].name) {
          const meal = day[mealType];
          recipes.push({
            name: meal.name,
            recipeLink: meal.recipeLink || null,
            course: courseName,
            week: week.title || weekKey,
            day: dayName,
            mealType: mealType
          });
        }
      });
    });
  });
  
  return recipes;
}

function findBestMatch(mealName, recipes) {
  if (!mealName) return null;
  
  // Clean up the meal name (remove rester, kcal info, etc.)
  let cleanName = mealName
    .replace(/\s*rester\s*$/i, '')
    .replace(/\s*från\s+(frysen|fysen)\s*$/i, '')
    .replace(/\s*\(\d+\s*kcal\)\s*/gi, '')
    .trim();
  
  if (!cleanName) return null;
  
  const normalized = normalizeText(cleanName);
  let bestMatch = null;
  let bestScore = 0;
  
  for (const recipe of recipes) {
    const recipeNormalized = normalizeText(recipe.title);
    
    // Exact match
    if (normalized === recipeNormalized) {
      return { recipe, score: 100, method: 'exact' };
    }
    
    // Contains match
    if (normalized.includes(recipeNormalized) || recipeNormalized.includes(normalized)) {
      const score = 90;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { recipe, score, method: 'contains' };
      }
    }
    
    // String similarity
    const similarity = stringSimilarity.compareTwoStrings(normalized, recipeNormalized);
    const score = similarity * 100;
    
    if (score > bestScore && score >= 70) {
      bestScore = score;
      bestMatch = { recipe, score: Math.round(score), method: 'similarity' };
    }
  }
  
  return bestScore >= 70 ? bestMatch : null;
}

async function verifyAllCourseRecipes() {
  console.log('🔍 Verifying all course recipes against database...\n');
  
  try {
    // Get all recipes from database
    const dbRecipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        isPremium: true,
        tags: true
      }
    });
    
    console.log(`📚 Found ${dbRecipes.length} recipes in database\n`);
    
    // Extract meal plans for all courses
    const courses = [
      { name: 'Functional Basics', data: mealPlans },
      { name: 'Functional Flow', data: flowMealPlans },
      { name: 'Functional Energy', data: energyMealPlans }
    ];
    
    let totalMeals = 0;
    let matchedMeals = 0;
    let unmatchedMeals = [];
    let incorrectLinks = [];
    
    for (const course of courses) {
      if (!course.data) {
        console.log(`❌ ${course.name}: No data found\n`);
        continue;
      }
      
      console.log(`\n📋 Analyzing ${course.name}:`);
      console.log('=' + '='.repeat(course.name.length + 12));
      
      const courseMeals = extractRecipesFromMealPlan(course.data, course.name);
      totalMeals += courseMeals.length;
      
      console.log(`Total meals: ${courseMeals.length}`);
      
      let courseMatched = 0;
      let courseUnmatched = [];
      let courseIncorrectLinks = [];
      
      for (const meal of courseMeals) {
        // Skip meals without names or with placeholder names
        if (!meal.name || meal.name.includes('16:8') || meal.name.trim() === '') {
          continue;
        }
        
        // Find best match in database
        const match = findBestMatch(meal.name, dbRecipes);
        
        if (match) {
          courseMatched++;
          matchedMeals++;
          
          // Check if the recipeLink is correct
          const expectedSlug = `/kunskapsbank/recept/${match.recipe.slug}`;
          if (meal.recipeLink && meal.recipeLink !== expectedSlug) {
            courseIncorrectLinks.push({
              mealName: meal.name,
              currentLink: meal.recipeLink,
              expectedLink: expectedSlug,
              matchedRecipe: match.recipe.title,
              confidence: match.score,
              week: meal.week,
              day: meal.day,
              mealType: meal.mealType
            });
          }
          
          console.log(`  ✅ "${meal.name}" → "${match.recipe.title}" (${match.score}% via ${match.method})`);
        } else {
          courseUnmatched.push({
            mealName: meal.name,
            currentLink: meal.recipeLink,
            week: meal.week,
            day: meal.day,
            mealType: meal.mealType,
            course: course.name
          });
          console.log(`  ❌ "${meal.name}" → NO MATCH FOUND`);
        }
      }
      
      unmatchedMeals = unmatchedMeals.concat(courseUnmatched);
      incorrectLinks = incorrectLinks.concat(courseIncorrectLinks);
      
      console.log(`\n📊 ${course.name} Summary:`);
      console.log(`  Matched: ${courseMatched}/${courseMeals.length} (${Math.round(courseMatched/courseMeals.length*100)}%)`);
      console.log(`  Unmatched: ${courseUnmatched.length}`);
      console.log(`  Incorrect links: ${courseIncorrectLinks.length}`);
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total meals analyzed: ${totalMeals}`);
    console.log(`Successfully matched: ${matchedMeals} (${Math.round(matchedMeals/totalMeals*100)}%)`);
    console.log(`Unmatched meals: ${unmatchedMeals.length}`);
    console.log(`Incorrect links: ${incorrectLinks.length}`);
    
    // Report unmatched meals
    if (unmatchedMeals.length > 0) {
      console.log('\n❌ UNMATCHED MEALS (No recipe found in database):');
      console.log('=' + '='.repeat(50));
      unmatchedMeals.forEach((meal, index) => {
        console.log(`${index + 1}. "${meal.mealName}"`);
        console.log(`   Course: ${meal.course}`);
        console.log(`   Week: ${meal.week}`);
        console.log(`   Day: ${meal.day}, Meal Type: ${meal.mealType}`);
        console.log(`   Current Link: ${meal.currentLink || 'None'}`);
        console.log('');
      });
      
      console.log('📝 NAMES ONLY (for easy copying):');
      console.log('=' + '='.repeat(30));
      unmatchedMeals.forEach((meal, index) => {
        console.log(`${index + 1}. ${meal.mealName}`);
      });
    }
    
    // Report incorrect links
    if (incorrectLinks.length > 0) {
      console.log('\n🔗 INCORRECT LINKS (Link points to wrong recipe):');
      console.log('=' + '='.repeat(50));
      incorrectLinks.forEach((link, index) => {
        console.log(`${index + 1}. "${link.mealName}"`);
        console.log(`   Should link to: "${link.matchedRecipe}"`);
        console.log(`   Current link: ${link.currentLink}`);
        console.log(`   Expected link: ${link.expectedLink}`);
        console.log(`   Confidence: ${link.confidence}%`);
        console.log(`   Location: ${link.week}, ${link.day}, ${link.mealType}`);
        console.log('');
      });
    }
    
    if (unmatchedMeals.length === 0 && incorrectLinks.length === 0) {
      console.log('\n🎉 SUCCESS: All course recipes are properly matched and linked!');
    } else {
      console.log('\n⚠️  ACTION REQUIRED: Please review the unmatched meals and incorrect links above.');
      console.log('\n🚨 IMPORTANT: Do NOT create dummy recipes for unmatched meals.');
      console.log('   Instead, either find the correct existing recipe or remove the meal from the plan.');
    }
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllCourseRecipes(); 
const { PrismaClient } = require('@prisma/client');
const stringSimilarity = require('string-similarity');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Import meal plans
const mealPlansPath = path.join(__dirname, '../app/data/mealPlans.ts');
const mealPlansContent = fs.readFileSync(mealPlansPath, 'utf8');

// Extract meal plans data (simplified parsing)
function extractMealPlans() {
  const functionalBasicsMatch = mealPlansContent.match(/export const functionalBasics = ({[\s\S]*?});/);
  const functionalFlowMatch = mealPlansContent.match(/export const functionalFlow = ({[\s\S]*?});/);
  const functionalEnergyMatch = mealPlansContent.match(/export const functionalEnergy = ({[\s\S]*?});/);
  
  try {
    const functionalBasics = functionalBasicsMatch ? eval('(' + functionalBasicsMatch[1] + ')') : null;
    const functionalFlow = functionalFlowMatch ? eval('(' + functionalFlowMatch[1] + ')') : null;
    const functionalEnergy = functionalEnergyMatch ? eval('(' + functionalEnergyMatch[1] + ')') : null;
    
    return { functionalBasics, functionalFlow, functionalEnergy };
  } catch (error) {
    console.error('Error parsing meal plans:', error);
    return { functionalBasics: null, functionalFlow: null, functionalEnergy: null };
  }
}

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

function extractRecipeFromMealPlan(mealPlan) {
  const recipes = [];
  
  if (!mealPlan || !mealPlan.weeks) return recipes;
  
  Object.values(mealPlan.weeks).forEach(week => {
    if (!week.days) return;
    
    Object.values(week.days).forEach(day => {
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealType => {
        if (day[mealType] && day[mealType].name) {
          const meal = day[mealType];
          recipes.push({
            name: meal.name,
            recipeLink: meal.recipeLink || null,
            course: mealPlan.title || 'Unknown',
            week: week.title || 'Unknown week',
            mealType: mealType
          });
        }
      });
    });
  });
  
  return recipes;
}

function findBestMatch(mealName, recipes) {
  if (!mealName || mealName.includes('rester')) {
    // For "rester" meals, try to find the base recipe
    const baseName = mealName.replace(/\s*rester\s*$/i, '').trim();
    if (baseName) {
      return findBestMatch(baseName, recipes);
    }
  }
  
  const normalized = normalizeText(mealName);
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
    
    // Extract meal plans
    const { functionalBasics, functionalFlow, functionalEnergy } = extractMealPlans();
    
    const courses = [
      { name: 'Functional Basics', data: functionalBasics },
      { name: 'Functional Flow', data: functionalFlow },
      { name: 'Functional Energy', data: functionalEnergy }
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
      
      const courseMeals = extractRecipeFromMealPlan(course.data);
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
              mealType: meal.mealType
            });
          }
          
          console.log(`  ✅ "${meal.name}" → "${match.recipe.title}" (${match.score}% via ${match.method})`);
        } else {
          courseUnmatched.push({
            mealName: meal.name,
            currentLink: meal.recipeLink,
            week: meal.week,
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
        console.log(`   Meal Type: ${meal.mealType}`);
        console.log(`   Current Link: ${meal.currentLink || 'None'}`);
        console.log('');
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
        console.log(`   Week: ${link.week}, Meal: ${link.mealType}`);
        console.log('');
      });
    }
    
    // Create detailed report file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalMeals,
        matchedMeals,
        unmatchedMeals: unmatchedMeals.length,
        incorrectLinks: incorrectLinks.length,
        successRate: Math.round(matchedMeals/totalMeals*100)
      },
      unmatchedMeals,
      incorrectLinks
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'course-recipe-verification-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Detailed report saved to: scripts/course-recipe-verification-report.json');
    
    if (unmatchedMeals.length === 0 && incorrectLinks.length === 0) {
      console.log('\n🎉 SUCCESS: All course recipes are properly matched and linked!');
    } else {
      console.log('\n⚠️  ACTION REQUIRED: Please review the unmatched meals and incorrect links above.');
    }
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllCourseRecipes(); 
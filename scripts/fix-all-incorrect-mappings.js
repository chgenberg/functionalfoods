const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

const prisma = new PrismaClient();

// Known incorrect mappings with their correct alternatives
const knownFixes = [
  {
    mealName: 'Kyckling med blomkålsris och dillyoghurt',
    wrongSlug: 'kycklingfylld-aubergine',
    searchTerms: ['kyckling', 'blomkål', 'dill']
  },
  {
    mealName: 'Quinoasallad med scampi och mango',
    wrongSlug: 'kycklingfylld-aubergine',
    searchTerms: ['quinoa', 'scampi', 'mango']
  },
  {
    mealName: 'Ägghack med kallrökt lax',
    wrongSlug: 'aggrora-lax',
    correctSlug: 'aggrora-lax-2' // This should exist
  }
];

function normalizeSwedish(text) {
  return text
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMealName(fullName) {
  return fullName
    .replace(/\s*(rester|från frysen|från fysen)\s*/gi, '')
    .replace(/[A-ZÅÄÖ][a-zåäöÅÄÖ]+\s*med\s+[a-zåäöÅÄÖ\s]+$/gi, '') // Remove trailing dessert names
    .trim();
}

async function findBestMatch(mealName, searchTerms = null) {
  console.log(`🔍 Finding best match for: "${mealName}"`);
  
  const cleanMealName = extractMealName(mealName);
  const terms = searchTerms || cleanMealName.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  console.log(`   Search terms: [${terms.join(', ')}]`);
  
  // Get all recipes
  const recipes = await prisma.recipe.findMany({
    where: {
      status: 'PUBLISHED'
    },
    select: { title: true, slug: true }
  });

  let bestMatch = null;
  let bestScore = 0;

  for (const recipe of recipes) {
    const normalizedRecipe = normalizeSwedish(recipe.title);
    const normalizedMeal = normalizeSwedish(cleanMealName);
    
    // String similarity
    const similarity = stringSimilarity.compareTwoStrings(normalizedRecipe, normalizedMeal);
    
    // Word overlap bonus
    const recipeWords = normalizedRecipe.split(/\s+/);
    const mealWords = normalizedMeal.split(/\s+/);
    const matchingWords = mealWords.filter(word => 
      word.length > 2 && recipeWords.some(rw => rw.includes(word) || word.includes(rw))
    );
    const wordBonus = matchingWords.length / Math.max(mealWords.length, 1) * 0.5;
    
    // Search terms bonus
    let termsBonus = 0;
    if (searchTerms) {
      const matchingTerms = searchTerms.filter(term => 
        normalizedRecipe.includes(normalizeSwedish(term))
      );
      termsBonus = matchingTerms.length / searchTerms.length * 0.3;
    }
    
    const totalScore = similarity + wordBonus + termsBonus;
    
    if (totalScore > bestScore && totalScore > 0.4) {
      bestScore = totalScore;
      bestMatch = recipe;
    }
  }

  if (bestMatch) {
    console.log(`   ✅ Best match: "${bestMatch.title}" (score: ${bestScore.toFixed(2)})`);
    return bestMatch;
  } else {
    console.log(`   ❌ No good match found`);
    return null;
  }
}

async function main() {
  try {
    console.log('🔧 Fixing all incorrect slug mappings...\n');

    // Read meal plans
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    let content = fs.readFileSync(mealPlansPath, 'utf-8');

    let fixedCount = 0;

    for (const fix of knownFixes) {
      console.log(`\n🎯 Processing: "${fix.mealName}"`);
      
      let correctRecipe;
      
      if (fix.correctSlug) {
        // Use specified correct slug
        correctRecipe = await prisma.recipe.findUnique({
          where: { slug: fix.correctSlug },
          select: { title: true, slug: true }
        });
      } else {
        // Find best match
        correctRecipe = await findBestMatch(fix.mealName, fix.searchTerms);
      }

      if (correctRecipe) {
        // Replace in meal plans (including rester versions)
        const patterns = [
          `"recipeLink": "/kunskapsbank/recept/${fix.wrongSlug}"`,
        ];
        
        for (const pattern of patterns) {
          if (content.includes(pattern)) {
            const newPattern = `"recipeLink": "/kunskapsbank/recept/${correctRecipe.slug}"`;
            content = content.replaceAll(pattern, newPattern);
            fixedCount++;
            console.log(`   🔄 Updated: ${fix.wrongSlug} -> ${correctRecipe.slug}`);
          }
        }
      }
    }

    // Write updated content
    if (fixedCount > 0) {
      fs.writeFileSync(mealPlansPath, content, 'utf-8');
      console.log(`\n✨ Fixed ${fixedCount} incorrect mappings!`);
      console.log('🎯 Meal plan links should now be more accurate.');
    } else {
      console.log('\n❌ No mappings were updated.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 
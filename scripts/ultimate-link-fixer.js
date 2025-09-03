const { PrismaClient } = require('@prisma/client');
const stringSimilarity = require('string-similarity');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

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

function findBestMatch(mealName, recipes) {
  if (!mealName) return null;
  
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
    
    if (normalized === recipeNormalized) {
      return { recipe, score: 100, method: 'exact' };
    }
    
    if (normalized.includes(recipeNormalized) || recipeNormalized.includes(normalized)) {
      const score = 90;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { recipe, score, method: 'contains' };
      }
    }
    
    const similarity = stringSimilarity.compareTwoStrings(normalized, recipeNormalized);
    const score = similarity * 100;
    
    if (score > bestScore && score >= 70) {
      bestScore = score;
      bestMatch = { recipe, score: Math.round(score), method: 'similarity' };
    }
  }
  
  return bestScore >= 70 ? bestMatch : null;
}

async function ultimateLinkFixer() {
  console.log('🔧 ULTIMATE LINK FIXER - Fixing ALL incorrect recipe links...\n');
  
  try {
    const dbRecipes = await prisma.recipe.findMany({
      select: { id: true, title: true, slug: true }
    });
    
    console.log(`📚 Found ${dbRecipes.length} recipes in database\n`);
    
    const filePath = path.join(__dirname, '../app/data/mealPlans.ts');
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Create a mapping of all recipe slugs to titles for quick lookup
    const slugToTitle = {};
    const titleToSlug = {};
    
    dbRecipes.forEach(recipe => {
      slugToTitle[recipe.slug] = recipe.title;
      titleToSlug[normalizeText(recipe.title)] = recipe.slug;
    });
    
    // Find all recipeLink patterns in the content
    const linkPattern = /"recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g;
    let match;
    const allLinks = [];
    
    while ((match = linkPattern.exec(content)) !== null) {
      allLinks.push({
        fullMatch: match[0],
        slug: match[1],
        link: `/kunskapsbank/recept/${match[1]}`
      });
    }
    
    console.log(`Found ${allLinks.length} recipe links in mealPlans.ts\n`);
    
    // Also find all meal names to match them properly
    const mealNamePattern = /"name":\s*"([^"]+)"/g;
    const mealNames = [];
    
    while ((match = mealNamePattern.exec(content)) !== null) {
      mealNames.push(match[1]);
    }
    
    console.log(`Found ${mealNames.length} meal names\n`);
    
    // Now intelligently fix all links by finding the meal name context
    let fixes = 0;
    
    // Extract sections and fix them systematically
    const sections = content.split(/"recipeLink":\s*"\/kunskapsbank\/recept\/[^"]+"/);
    let newContent = content;
    
    // Find meal name and link pairs
    const mealLinkPairs = [];
    const mealLinkPattern = /"name":\s*"([^"]+)"[^}]*"recipeLink":\s*"(\/kunskapsbank\/recept\/[^"]+)"/g;
    
    while ((match = mealLinkPattern.exec(content)) !== null) {
      const mealName = match[1];
      const currentLink = match[2];
      const currentSlug = currentLink.replace('/kunskapsbank/recept/', '');
      
      // Find the best matching recipe for this meal name
      const bestMatch = findBestMatch(mealName, dbRecipes);
      
      if (bestMatch && bestMatch.recipe.slug !== currentSlug) {
        const correctLink = `/kunskapsbank/recept/${bestMatch.recipe.slug}`;
        
        // Replace this specific occurrence
        const fullPattern = `"name": "${mealName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"([^}]*)"recipeLink": "${currentLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`;
        const replacement = `"name": "${mealName}"$1"recipeLink": "${correctLink}"`;
        
        newContent = newContent.replace(new RegExp(fullPattern, 'g'), replacement);
        fixes++;
        
        console.log(`✅ Fixed: "${mealName}"`);
        console.log(`   ${currentLink} → ${correctLink}`);
        console.log(`   Matched to: "${bestMatch.recipe.title}" (${bestMatch.score}%)\n`);
      }
    }
    
    // Write the updated content
    if (fixes > 0) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      console.log('\n' + '='.repeat(60));
      console.log('📊 ULTIMATE FIX SUMMARY');
      console.log('='.repeat(60));
      console.log(`Total fixes applied: ${fixes}`);
      console.log('\n📄 All fixes applied to mealPlans.ts');
      console.log('🎉 Ultimate link fixing completed!');
      
    } else {
      console.log('\n✅ No fixes needed - all links appear to be correct!');
    }
    
  } catch (error) {
    console.error('Error in ultimate link fixer:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ultimateLinkFixer(); 
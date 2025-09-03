const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

const prisma = new PrismaClient();

function normalizeSwedish(str) {
  return str.toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[éèêë]/g, 'e')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRecipeName(linkOrSlug) {
  // Extract name from slug or link
  let slug = linkOrSlug.replace(/^\/kunskapsbank\/recept\//, '');
  return slug.split('-').join(' ');
}

async function main() {
  try {
    console.log('🔄 Smart remapping meal plan links to existing recipes...\n');

    // Get all existing recipes
    const allRecipes = await prisma.recipe.findMany({
      select: {
        slug: true,
        title: true,
        tags: true,
        isFree: true,
        isPremium: true
      }
    });

    console.log(`📚 Found ${allRecipes.length} recipes in database\n`);

    // Read meal plans file
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    let content = fs.readFileSync(mealPlansPath, 'utf-8');

    // Extract all recipe links and their context
    const linkPattern = /"recipeLink":\s*"([^"]+)"/g;
    const linksToUpdate = [];
    let match;

    while ((match = linkPattern.exec(content)) !== null) {
      const originalLink = match[1];
      if (originalLink === '#' || originalLink.length === 0) continue;
      
      const slug = originalLink.replace(/^\/kunskapsbank\/recept\//, '');
      const exists = allRecipes.find(r => r.slug === slug);
      
      if (!exists) {
        linksToUpdate.push({
          originalLink,
          slug,
          extractedName: extractRecipeName(slug)
        });
      }
    }

    console.log(`🔍 Found ${linksToUpdate.length} broken links to remap:\n`);

    let updatedCount = 0;
    const remappings = [];

    for (const brokenLink of linksToUpdate) {
      const targetName = normalizeSwedish(brokenLink.extractedName);
      
      // Find best matching recipe
      let bestMatch = null;
      let bestScore = 0;

      for (const recipe of allRecipes) {
        const recipeNameNorm = normalizeSwedish(recipe.title);
        
        // Calculate similarity
        const titleSimilarity = stringSimilarity.compareTwoStrings(targetName, recipeNameNorm);
        
        // Bonus for key word matches
        const targetWords = targetName.split(' ').filter(w => w.length > 2);
        const recipeWords = recipeNameNorm.split(' ').filter(w => w.length > 2);
        const wordMatches = targetWords.filter(w => recipeWords.some(rw => rw.includes(w) || w.includes(rw)));
        const wordBonus = wordMatches.length / Math.max(targetWords.length, 1) * 0.3;
        
        const totalScore = titleSimilarity + wordBonus;
        
        if (totalScore > bestScore && totalScore > 0.4) { // Minimum threshold
          bestScore = totalScore;
          bestMatch = recipe;
        }
      }

      if (bestMatch) {
        const newLink = `/kunskapsbank/recept/${bestMatch.slug}`;
        
        // Replace in content
        const oldPattern = `"recipeLink": "${brokenLink.originalLink}"`;
        const newPattern = `"recipeLink": "${newLink}"`;
        content = content.replace(oldPattern, newPattern);
        
        remappings.push({
          from: brokenLink.extractedName,
          to: bestMatch.title,
          fromSlug: brokenLink.slug,
          toSlug: bestMatch.slug,
          score: bestScore
        });
        
        console.log(`✅ ${brokenLink.extractedName} → ${bestMatch.title} (${bestScore.toFixed(2)})`);
        updatedCount++;
      } else {
        console.log(`❌ No good match found for: ${brokenLink.extractedName}`);
      }
    }

    if (updatedCount > 0) {
      // Write updated content back to file
      fs.writeFileSync(mealPlansPath, content, 'utf-8');
      console.log(`\n✨ Updated ${updatedCount} recipe links in mealPlans.ts`);
      
      console.log('\n📋 REMAPPING SUMMARY:');
      remappings.forEach(r => {
        console.log(`  ${r.fromSlug} → ${r.toSlug} (${r.score.toFixed(2)})`);
      });
      
      console.log('\n🔄 Running follow-up scripts to sync database...');
      
      // Don't need to re-align slugs since we're updating the meal plans to match existing recipes
      // Just need to update access flags
      console.log('Note: Run npm run recipes:set-access to update premium/free flags after this.');
    } else {
      console.log('\n❌ No remappings were made. Manual review may be needed.');
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
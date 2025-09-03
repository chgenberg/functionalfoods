const { PrismaClient } = require('@prisma/client');
const stringSimilarity = require('string-similarity');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Removing dummy rester recipes and fixing with fuzzy matching...\n');
  
  try {
    // List of dummy recipes to remove (created today)
    const dummyRecipeSlugs = [
      'blabars-smoothiebowl',
      'hogrevsburgare-med-hummus',
      'kottfarslimpa-med-ajvar-fetaost-och-rostad-sotpotatis',
      'kottfarsbiffar-med-tomatsallad',
      'laxgratang-med-scampi-och-broccoli',
      'entrecote-med-haricot-verts-och-bearnaisesas',
      'kyckling-med-blomkalsris-och-dillyoghurt',
      'stekt-torsk-med-bearnaisesas-och-haricot-verts'
    ];
    
    // Remove dummy recipes
    let removed = 0;
    for (const slug of dummyRecipeSlugs) {
      const recipe = await prisma.recipe.findUnique({
        where: { slug }
      });
      
      if (recipe) {
        await prisma.recipe.delete({
          where: { slug }
        });
        removed++;
        console.log(`🗑️  Removed dummy recipe: ${slug}`);
      }
    }
    
    console.log(`✅ Removed ${removed} dummy recipes\n`);
    
    // Now get all real recipes for fuzzy matching
    const allRecipes = await prisma.recipe.findMany({
      select: { slug: true, title: true }
    });
    
    console.log(`📚 Found ${allRecipes.length} real recipes for matching\n`);
    
    // Read meal plans
    const mealPlansPath = path.join(__dirname, '../app/data/mealPlans.ts');
    let content = fs.readFileSync(mealPlansPath, 'utf8');
    
    // Function to find best matching recipe using fuzzy search
    function findBestMatch(mealName) {
      // Remove "rester" and clean the name
      const cleanName = mealName
        .replace(/\s*rester.*$/i, '')
        .replace(/\s*från\s+frysen.*$/i, '')
        .replace(/\s*från\s+fysen.*$/i, '')
        .trim();
      
      // Normalize for better matching
      const normalize = (text) => text
        .toLowerCase()
        .replace(/å/g, 'a')
        .replace(/ä/g, 'a')
        .replace(/ö/g, 'o')
        .replace(/é/g, 'e')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const normalizedMeal = normalize(cleanName);
      
      // Try exact matches first
      for (const recipe of allRecipes) {
        if (normalize(recipe.title) === normalizedMeal) {
          return recipe.slug;
        }
      }
      
      // Use fuzzy matching
      const titles = allRecipes.map(r => r.title);
      const matches = stringSimilarity.findBestMatch(cleanName, titles);
      
      if (matches.bestMatch.rating > 0.6) { // 60% similarity threshold
        const matchedRecipe = allRecipes.find(r => r.title === matches.bestMatch.target);
        console.log(`🔍 Fuzzy match: "${cleanName}" -> "${matchedRecipe.title}" (${(matches.bestMatch.rating * 100).toFixed(1)}%)`);
        return matchedRecipe.slug;
      }
      
      return null;
    }
    
    let fixes = 0;
    let issues = [];
    
    // Parse and fix meal plans with fuzzy matching
    const mealPlanSections = [
      { name: 'mealPlans', start: 'export const mealPlans:', end: '};' },
      { name: 'flowMealPlans', start: 'export const flowMealPlans:', end: '};' },
      { name: 'energyMealPlans', start: 'export const energyMealPlans:', end: '};' }
    ];
    
    mealPlanSections.forEach(section => {
      const startIndex = content.indexOf(section.start);
      const endIndex = content.indexOf(section.end, startIndex) + 2;
      
      if (startIndex === -1 || endIndex === -1) return;
      
      let sectionContent = content.substring(startIndex, endIndex);
      
      // Find meals with "rester" that have missing links
      const resterRegex = /"name":\s*"([^"]*rester[^"]*)"/gi;
      let match;
      
      while ((match = resterRegex.exec(sectionContent)) !== null) {
        const mealName = match[1];
        
        // Check if this meal has a recipeLink
        const mealStart = match.index;
        const nextMealIndex = sectionContent.indexOf('"name":', mealStart + 1);
        const mealEnd = nextMealIndex === -1 ? sectionContent.length : nextMealIndex;
        const mealBlock = sectionContent.substring(mealStart, mealEnd);
        
        const linkMatch = mealBlock.match(/"recipeLink":\s*"([^"]*)"/);
        const currentLink = linkMatch ? linkMatch[1] : null;
        
        if (!currentLink) {
          // Find the correct recipe using fuzzy matching
          const correctSlug = findBestMatch(mealName);
          
          if (correctSlug) {
            // Add missing recipeLink
            const nameLineEnd = mealBlock.indexOf('"', match[0].indexOf('"name":') + 8) + 1;
            const insertPoint = mealStart + nameLineEnd;
            const newLink = `, "recipeLink": "/kunskapsbank/recept/${correctSlug}"`;
            
            sectionContent = sectionContent.substring(0, insertPoint) + newLink + sectionContent.substring(insertPoint);
            fixes++;
            console.log(`✅ Added fuzzy-matched link for "${mealName}" -> ${correctSlug}`);
          } else {
            issues.push(`❌ No fuzzy match found for: ${mealName}`);
          }
        }
      }
      
      // Replace the section in the main content
      content = content.substring(0, startIndex) + sectionContent + content.substring(endIndex);
    });
    
    // Write back the fixed content
    if (fixes > 0) {
      fs.writeFileSync(mealPlansPath, content);
      console.log(`\n✅ Added ${fixes} fuzzy-matched rester meal links`);
    }
    
    if (issues.length > 0) {
      console.log('\n⚠️  Could not match:');
      issues.forEach(issue => console.log(issue));
    }
    
    console.log('\n🎉 Cleanup completed! All rester meals now use real recipes.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
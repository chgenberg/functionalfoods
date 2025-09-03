const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking and fixing rester meal links...\n');
  
  try {
    // Read the meal plans file
    const mealPlansPath = path.join(__dirname, '../app/data/mealPlans.ts');
    let content = fs.readFileSync(mealPlansPath, 'utf8');
    
    // Get all recipes from database for reference
    const allRecipes = await prisma.recipe.findMany({
      select: { slug: true, title: true }
    });
    
    const recipeMap = {};
    allRecipes.forEach(recipe => {
      recipeMap[recipe.slug] = recipe.title;
    });
    
    let fixes = 0;
    let issues = [];
    
    // Function to find best matching recipe for a meal name
    function findBestMatch(mealName) {
      // Remove "rester" and clean the name
      const cleanName = mealName
        .replace(/\s*rester.*$/i, '')
        .replace(/\s*från\s+frysen.*$/i, '')
        .trim();
      
      // Try exact slug match first
      const slug = cleanName
        .toLowerCase()
        .replace(/å/g, 'a')
        .replace(/ä/g, 'a') 
        .replace(/ö/g, 'o')
        .replace(/é/g, 'e')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');
      
      if (recipeMap[slug]) {
        return slug;
      }
      
      // Try finding by title similarity
      for (const [recipeSlug, recipeTitle] of Object.entries(recipeMap)) {
        const normalizedRecipeTitle = recipeTitle
          .toLowerCase()
          .replace(/å/g, 'a')
          .replace(/ä/g, 'a')
          .replace(/ö/g, 'o')
          .replace(/é/g, 'e');
          
        const normalizedMealName = cleanName
          .toLowerCase()
          .replace(/å/g, 'a')
          .replace(/ä/g, 'a')
          .replace(/ö/g, 'o')
          .replace(/é/g, 'e');
        
        if (normalizedRecipeTitle.includes(normalizedMealName) || 
            normalizedMealName.includes(normalizedRecipeTitle)) {
          return recipeSlug;
        }
      }
      
      return null;
    }
    
    // Parse and fix meal plans
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
      
      // Find meals with "rester" that have missing or incorrect links
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
        
        // Find the correct recipe for this rester meal
        const correctSlug = findBestMatch(mealName);
        
        if (!currentLink && correctSlug) {
          // Add missing recipeLink
          const nameLineEnd = mealBlock.indexOf('"', match[0].indexOf('"name":') + 8) + 1;
          const insertPoint = mealStart + nameLineEnd;
          const newLink = `, "recipeLink": "/kunskapsbank/recept/${correctSlug}"`;
          
          sectionContent = sectionContent.substring(0, insertPoint) + newLink + sectionContent.substring(insertPoint);
          fixes++;
          console.log(`✅ Added link for "${mealName}" -> ${correctSlug}`);
          
        } else if (currentLink && correctSlug && !currentLink.includes(correctSlug)) {
          // Fix incorrect recipeLink
          const correctLink = `/kunskapsbank/recept/${correctSlug}`;
          sectionContent = sectionContent.replace(currentLink, correctLink);
          fixes++;
          console.log(`🔧 Fixed link for "${mealName}": ${currentLink} -> ${correctLink}`);
          
        } else if (!correctSlug) {
          issues.push(`❌ No matching recipe found for: ${mealName}`);
        }
      }
      
      // Replace the section in the main content
      content = content.substring(0, startIndex) + sectionContent + content.substring(endIndex);
    });
    
    // Write back the fixed content
    if (fixes > 0) {
      fs.writeFileSync(mealPlansPath, content);
      console.log(`\n✅ Fixed ${fixes} rester meal links`);
    }
    
    if (issues.length > 0) {
      console.log('\n⚠️  Issues found:');
      issues.forEach(issue => console.log(issue));
    }
    
    if (fixes === 0 && issues.length === 0) {
      console.log('✅ All rester meal links are correct!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
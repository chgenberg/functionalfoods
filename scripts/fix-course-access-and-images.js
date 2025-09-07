const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function main() {
  try {
    console.log(`${colors.bright}${colors.blue}🔧 Fixing Course Access & Images${colors.reset}\n`);
    
    // Step 1: Get all published recipes
    console.log(`${colors.cyan}Step 1: Checking all published recipes...${colors.reset}`);
    const recipes = await prisma.recipe.findMany({
      where: {
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        slug: true,
        title: true,
        tags: true,
        isPremium: true,
        isFree: true,
        imageUrl: true,
        imageMobileUrl: true,
        ingredients: true,
        ingredientsStructured: true
      }
    });
    
    console.log(`Found ${recipes.length} published recipes\n`);
    
    // Step 2: Categorize recipes
    console.log(`${colors.cyan}Step 2: Categorizing recipes...${colors.reset}`);
    const courseRecipes = recipes.filter(r => 
      r.tags && r.tags.some(tag => ['Basic', 'Flow', 'Energy'].includes(tag))
    );
    const freeRecipes = recipes.filter(r => 
      !r.tags || !r.tags.some(tag => ['Basic', 'Flow', 'Energy'].includes(tag))
    );
    
    console.log(`Course recipes: ${courseRecipes.length}`);
    console.log(`Free recipes: ${freeRecipes.length}\n`);
    
    // Step 3: Fix access flags
    console.log(`${colors.cyan}Step 3: Fixing access flags...${colors.reset}`);
    let fixedAccess = 0;
    
    // Course recipes should NOT be free or premium
    for (const recipe of courseRecipes) {
      const updates = {};
      let needsUpdate = false;
      
      if (recipe.isFree) {
        updates.isFree = false;
        needsUpdate = true;
        console.log(`${colors.yellow}📝 ${recipe.title}: Setting isFree=false (course recipe)${colors.reset}`);
      }
      
      if (recipe.isPremium) {
        updates.isPremium = false;
        needsUpdate = true;
        console.log(`${colors.yellow}📝 ${recipe.title}: Setting isPremium=false (course recipe)${colors.reset}`);
      }
      
      if (needsUpdate) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: updates
        });
        fixedAccess++;
      }
    }
    
    // Free recipes should be marked as free
    for (const recipe of freeRecipes) {
      if (!recipe.isFree) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: { isFree: true, isPremium: false }
        });
        console.log(`${colors.green}✅ ${recipe.title}: Set as free recipe${colors.reset}`);
        fixedAccess++;
      }
    }
    
    console.log(`\nFixed access for ${fixedAccess} recipes\n`);
    
    // Step 4: Check for missing images
    console.log(`${colors.cyan}Step 4: Checking images...${colors.reset}`);
    const missingImages = recipes.filter(r => 
      !r.imageUrl || 
      r.imageUrl.includes('placeholder') || 
      r.imageUrl.includes('kommer-snart')
    );
    
    if (missingImages.length > 0) {
      console.log(`${colors.red}❌ ${missingImages.length} recipes have missing/placeholder images:${colors.reset}`);
      missingImages.slice(0, 10).forEach(r => {
        console.log(`   - ${r.title} (${r.slug})`);
      });
      if (missingImages.length > 10) {
        console.log(`   ... and ${missingImages.length - 10} more`);
      }
    } else {
      console.log(`${colors.green}✅ All recipes have images${colors.reset}`);
    }
    
    // Step 5: Check for missing ingredients
    console.log(`\n${colors.cyan}Step 5: Checking ingredients...${colors.reset}`);
    const missingIngredients = recipes.filter(r => 
      !r.ingredients || r.ingredients.length === 0
    );
    
    if (missingIngredients.length > 0) {
      console.log(`${colors.red}❌ ${missingIngredients.length} recipes have missing ingredients:${colors.reset}`);
      missingIngredients.slice(0, 10).forEach(r => {
        console.log(`   - ${r.title} (${r.slug})`);
      });
      if (missingIngredients.length > 10) {
        console.log(`   ... and ${missingIngredients.length - 10} more`);
      }
    } else {
      console.log(`${colors.green}✅ All recipes have ingredients${colors.reset}`);
    }
    
    // Step 6: Verify course recipe access
    console.log(`\n${colors.cyan}Step 6: Verifying course recipe access...${colors.reset}`);
    const verifyResults = await prisma.recipe.findMany({
      where: {
        tags: {
          hasSome: ['Basic', 'Flow', 'Energy']
        }
      },
      select: {
        title: true,
        tags: true,
        isFree: true,
        isPremium: true
      }
    });
    
    const incorrectAccess = verifyResults.filter(r => r.isFree || r.isPremium);
    if (incorrectAccess.length > 0) {
      console.log(`${colors.red}❌ ${incorrectAccess.length} course recipes still have incorrect access${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ All course recipes have correct access settings${colors.reset}`);
    }
    
    // Step 7: Summary
    console.log(`\n${colors.bright}${colors.blue}📊 Summary:${colors.reset}`);
    console.log(`Total recipes: ${recipes.length}`);
    console.log(`- Course recipes: ${courseRecipes.length}`);
    console.log(`- Free recipes: ${freeRecipes.length}`);
    console.log(`- Missing images: ${missingImages.length}`);
    console.log(`- Missing ingredients: ${missingIngredients.length}`);
    console.log(`- Fixed access: ${fixedAccess}`);
    
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
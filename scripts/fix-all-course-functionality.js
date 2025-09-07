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

async function loadMealPlans() {
  const mealPlansPath = path.join(__dirname, '..', 'app', 'data', 'mealPlans.ts');
  const content = await fs.readFile(mealPlansPath, 'utf-8');
  
  // Extract all recipe links from meal plans - handle both single and double quotes
  const linkRegex = /recipeLink["']?\s*:\s*["']([^"']+)["']/g;
  const links = [];
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }
  
  return links;
}

function extractSlugFromLink(link) {
  // Extract slug from recipe link
  const parts = link.split('/');
  return parts[parts.length - 1];
}

async function main() {
  try {
    console.log(`${colors.bright}${colors.blue}🔧 Comprehensive Course Recipe Fix${colors.reset}\n`);
    
    // Step 1: Load all recipe links from meal plans
    console.log(`${colors.cyan}Step 1: Loading meal plans...${colors.reset}`);
    const recipeLinks = await loadMealPlans();
    const uniqueLinks = [...new Set(recipeLinks)];
    const slugs = uniqueLinks.map(link => extractSlugFromLink(link));
    
    console.log(`Found ${uniqueLinks.length} unique recipe links in meal plans\n`);
    
    // Step 2: Check which recipes exist in database
    console.log(`${colors.cyan}Step 2: Checking database recipes...${colors.reset}`);
    const existingRecipes = await prisma.recipe.findMany({
      where: {
        slug: { in: slugs }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        tags: true,
        isPremium: true,
        isFree: true,
        imageUrl: true,
        ingredients: true,
        ingredientsStructured: true
      }
    });
    
    const existingSlugs = new Set(existingRecipes.map(r => r.slug));
    const missingSlugs = slugs.filter(slug => !existingSlugs.has(slug));
    
    console.log(`✅ Found ${existingRecipes.length} recipes in database`);
    if (missingSlugs.length > 0) {
      console.log(`${colors.red}❌ Missing ${missingSlugs.length} recipes:${colors.reset}`);
      missingSlugs.forEach(slug => console.log(`   - ${slug}`));
    }
    console.log();
    
    // Step 3: Categorize recipes by course
    console.log(`${colors.cyan}Step 3: Categorizing recipes by course...${colors.reset}`);
    const courseRecipes = {
      Basic: [],
      Flow: [],
      Energy: []
    };
    
    // Read meal plans content to determine which course each recipe belongs to
    const mealPlansContent = await fs.readFile(path.join(__dirname, '..', 'app', 'data', 'mealPlans.ts'), 'utf-8');
    
    // Extract recipes for each course
    const basicMatch = mealPlansContent.match(/export const mealPlans.*?(?=export|$)/s);
    const flowMatch = mealPlansContent.match(/export const flowMealPlans.*?(?=export|$)/s);
    const energyMatch = mealPlansContent.match(/export const energyMealPlans.*?(?=export|$)/s);
    
    for (const slug of existingSlugs) {
      const link = `/kunskapsbank/recept/${slug}`;
      if (basicMatch && basicMatch[0].includes(link)) {
        courseRecipes.Basic.push(slug);
      }
      if (flowMatch && flowMatch[0].includes(link)) {
        courseRecipes.Flow.push(slug);
      }
      if (energyMatch && energyMatch[0].includes(link)) {
        courseRecipes.Energy.push(slug);
      }
    }
    
    console.log(`Basic recipes: ${courseRecipes.Basic.length}`);
    console.log(`Flow recipes: ${courseRecipes.Flow.length}`);
    console.log(`Energy recipes: ${courseRecipes.Energy.length}\n`);
    
    // Step 4: Fix recipe issues
    console.log(`${colors.cyan}Step 4: Fixing recipe issues...${colors.reset}`);
    let fixedCount = 0;
    
    for (const recipe of existingRecipes) {
      const updates = {};
      let needsUpdate = false;
      
      // Determine which courses this recipe belongs to
      const belongsToCourses = [];
      if (courseRecipes.Basic.includes(recipe.slug)) belongsToCourses.push('Basic');
      if (courseRecipes.Flow.includes(recipe.slug)) belongsToCourses.push('Flow');
      if (courseRecipes.Energy.includes(recipe.slug)) belongsToCourses.push('Energy');
      
      // Fix tags
      if (belongsToCourses.length > 0) {
        const currentTags = recipe.tags || [];
        const missingTags = belongsToCourses.filter(tag => !currentTags.includes(tag));
        
        if (missingTags.length > 0) {
          updates.tags = [...new Set([...currentTags, ...belongsToCourses])];
          needsUpdate = true;
          console.log(`${colors.yellow}📝 ${recipe.title}: Adding tags ${missingTags.join(', ')}${colors.reset}`);
        }
        
        // Course recipes should not be free
        if (recipe.isFree) {
          updates.isFree = false;
          needsUpdate = true;
          console.log(`${colors.yellow}💰 ${recipe.title}: Setting isFree=false (course recipe)${colors.reset}`);
        }
        
        // Course recipes should not be premium (they're course-specific)
        if (recipe.isPremium) {
          updates.isPremium = false;
          needsUpdate = true;
          console.log(`${colors.yellow}🎓 ${recipe.title}: Setting isPremium=false (course recipe)${colors.reset}`);
        }
      }
      
      // Fix missing images
      if (!recipe.imageUrl || recipe.imageUrl.includes('placeholder')) {
        console.log(`${colors.red}🖼️  ${recipe.title}: Missing image${colors.reset}`);
        // Image fix would be done by the image scripts
      }
      
      // Fix missing ingredients
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        console.log(`${colors.red}🥕 ${recipe.title}: Missing ingredients${colors.reset}`);
        // Ingredient fix would be done by ingredient scripts
      }
      
      // Apply updates
      if (needsUpdate) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: updates
        });
        fixedCount++;
      }
    }
    
    console.log(`\n${colors.green}✅ Fixed ${fixedCount} recipes${colors.reset}`);
    
    // Step 5: Verify all course recipes are properly configured
    console.log(`\n${colors.cyan}Step 5: Final verification...${colors.reset}`);
    
    const allCourseRecipeSlugs = [...new Set([
      ...courseRecipes.Basic,
      ...courseRecipes.Flow,
      ...courseRecipes.Energy
    ])];
    
    const verifyRecipes = await prisma.recipe.findMany({
      where: {
        slug: { in: allCourseRecipeSlugs }
      },
      select: {
        slug: true,
        title: true,
        tags: true,
        isFree: true,
        isPremium: true
      }
    });
    
    let allGood = true;
    for (const recipe of verifyRecipes) {
      const issues = [];
      
      // Check if recipe has appropriate tags
      const expectedTags = [];
      if (courseRecipes.Basic.includes(recipe.slug)) expectedTags.push('Basic');
      if (courseRecipes.Flow.includes(recipe.slug)) expectedTags.push('Flow');
      if (courseRecipes.Energy.includes(recipe.slug)) expectedTags.push('Energy');
      
      const missingTags = expectedTags.filter(tag => !recipe.tags?.includes(tag));
      if (missingTags.length > 0) {
        issues.push(`missing tags: ${missingTags.join(', ')}`);
      }
      
      // Check access flags
      if (recipe.isFree) {
        issues.push('isFree should be false');
      }
      if (recipe.isPremium) {
        issues.push('isPremium should be false');
      }
      
      if (issues.length > 0) {
        console.log(`${colors.red}❌ ${recipe.title}: ${issues.join(', ')}${colors.reset}`);
        allGood = false;
      }
    }
    
    if (allGood) {
      console.log(`${colors.green}✅ All course recipes are properly configured!${colors.reset}`);
    }
    
    // Step 6: Summary
    console.log(`\n${colors.bright}${colors.blue}📊 Summary:${colors.reset}`);
    console.log(`Total course recipes: ${allCourseRecipeSlugs.length}`);
    console.log(`- Basic: ${courseRecipes.Basic.length}`);
    console.log(`- Flow: ${courseRecipes.Flow.length}`);
    console.log(`- Energy: ${courseRecipes.Energy.length}`);
    console.log(`Fixed issues: ${fixedCount}`);
    
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
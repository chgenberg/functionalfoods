const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Extract all unique recipe names from meal plans and shopping lists
async function getAllExpectedRecipes() {
  const expectedRecipes = new Set();
  
  // Load all shopping list JSON files
  const shoppingListDir = path.join(process.cwd(), 'public', 'Shopping-lists');
  const files = await fs.readdir(shoppingListDir);
  const jsonFiles = files.filter(f => f.endsWith('_parsed.json'));
  
  console.log('📋 Loading expected recipes from shopping lists...');
  
  for (const file of jsonFiles) {
    const content = await fs.readFile(path.join(shoppingListDir, file), 'utf8');
    const recipes = JSON.parse(content);
    
    for (const recipe of recipes) {
      expectedRecipes.add(recipe.title);
    }
  }
  
  // Also extract from meal plans data
  const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
  const mealPlansContent = await fs.readFile(mealPlansPath, 'utf8');
  
  // Extract meal plan data using regex since it's TypeScript
  const mealPlansMatch = mealPlansContent.match(/export const mealPlans[^=]*=\s*({.*?});/s);
  const flowMealPlansMatch = mealPlansContent.match(/export const flowMealPlans[^=]*=\s*({.*?});/s);
  const energyMealPlansMatch = mealPlansContent.match(/export const energyMealPlans[^=]*=\s*({.*?});/s);
  
  const mealPlans = mealPlansMatch ? eval('(' + mealPlansMatch[1] + ')') : {};
  const flowMealPlans = flowMealPlansMatch ? eval('(' + flowMealPlansMatch[1] + ')') : {};
  const energyMealPlans = energyMealPlansMatch ? eval('(' + energyMealPlansMatch[1] + ')') : {};
  
  function extractRecipeNames(plans, courseName) {
    console.log(`📋 Extracting recipes from ${courseName}...`);
    for (const [weekKey, week] of Object.entries(plans)) {
      for (const [dayName, day] of Object.entries(week.days)) {
        for (const [mealType, meal] of Object.entries(day)) {
          if (meal.name) {
            // Clean up recipe names
            let cleanName = meal.name
              .replace(/ rester?( från (frysen|fysen))?$/i, '') // Remove "rester från frysen/fysen"
              .replace(/^\d+\s+/, '') // Remove leading numbers like "1 "
              .replace(/\s*\+.*$/, '') // Remove "+ valfritt pålägg" etc
              .replace(/\s*\(.*\).*$/, '') // Remove parentheses and everything after
              .trim();
            
            expectedRecipes.add(cleanName);
          }
        }
      }
    }
  }
  
  extractRecipeNames(mealPlans, 'Functional Basics');
  extractRecipeNames(flowMealPlans, 'Functional Flow');
  extractRecipeNames(energyMealPlans, 'Functional Energy');
  
  return Array.from(expectedRecipes).sort();
}

async function auditRecipes() {
  try {
    console.log('🔍 Starting recipe audit...\n');
    
    // Get all expected recipes
    const expectedRecipes = await getAllExpectedRecipes();
    console.log(`📊 Found ${expectedRecipes.length} unique recipe names expected\n`);
    
    // Get all recipes from database
    const dbRecipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        nutrition: true,
        status: true
      }
    });
    
    console.log(`📊 Found ${dbRecipes.length} recipes in database\n`);
    
    const dbRecipeNames = new Set(dbRecipes.map(r => r.title));
    
    // Find missing recipes
    const missingRecipes = expectedRecipes.filter(name => !dbRecipeNames.has(name));
    
    // Find extra recipes (in DB but not expected)
    const extraRecipes = dbRecipes.filter(r => !expectedRecipes.includes(r.title));
    
    // Find recipes without images
    const recipesWithoutImages = dbRecipes.filter(r => !r.imageUrl || r.imageUrl === '/images/recipe-placeholder.svg');
    
    // Find recipes without nutrition
    const recipesWithoutNutrition = dbRecipes.filter(r => !r.nutrition || Object.keys(r.nutrition).length === 0);
    
    console.log('📋 AUDIT RESULTS');
    console.log('================\n');
    
    console.log(`❌ MISSING RECIPES (${missingRecipes.length}):`);
    missingRecipes.forEach(name => console.log(`   - ${name}`));
    console.log('');
    
    console.log(`➕ EXTRA RECIPES (${extraRecipes.length}):`);
    extraRecipes.forEach(r => console.log(`   - ${r.title} (${r.slug})`));
    console.log('');
    
    console.log(`🖼️  RECIPES WITHOUT IMAGES (${recipesWithoutImages.length}):`);
    recipesWithoutImages.forEach(r => console.log(`   - ${r.title}`));
    console.log('');
    
    console.log(`🍎 RECIPES WITHOUT NUTRITION (${recipesWithoutNutrition.length}):`);
    recipesWithoutNutrition.forEach(r => console.log(`   - ${r.title}`));
    console.log('');
    
    console.log('📊 SUMMARY:');
    console.log(`   Expected: ${expectedRecipes.length}`);
    console.log(`   In DB: ${dbRecipes.length}`);
    console.log(`   Missing: ${missingRecipes.length}`);
    console.log(`   Extra: ${extraRecipes.length}`);
    console.log(`   Without images: ${recipesWithoutImages.length}`);
    console.log(`   Without nutrition: ${recipesWithoutNutrition.length}`);
    
    // Export lists for further processing
    await fs.writeFile(
      path.join(process.cwd(), 'missing-recipes.json'),
      JSON.stringify(missingRecipes, null, 2)
    );
    
    console.log('\n💾 Missing recipes list saved to missing-recipes.json');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditRecipes();

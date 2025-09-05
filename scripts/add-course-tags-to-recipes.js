const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Helper functions from make-course-recipes-premium.js
function extractRecipeSlugs(mealPlanData) {
  const slugs = new Set();
  
  Object.values(mealPlanData).forEach(week => {
    Object.values(week).forEach(day => {
      if (day.meals) {
        Object.values(day.meals).forEach(meal => {
          if (meal.recipe) {
            slugs.add(meal.recipe);
          }
        });
      }
    });
  });
  
  return Array.from(slugs);
}

function extractSection(content, startMarker, endMarker) {
  const startIndex = content.indexOf(startMarker);
  if (startIndex === -1) return '';
  
  const endIndex = endMarker ? content.indexOf(endMarker, startIndex) : content.length;
  if (endIndex === -1) return content.substring(startIndex);
  
  return content.substring(startIndex, endIndex);
}

function parseMealPlanSection(section) {
  const mealPlanData = {};
  
  // Extract week objects
  const weekMatches = [...section.matchAll(/"(\d+)":\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g)];
  
  for (const match of weekMatches) {
    const weekNum = match[1];
    const weekContent = match[2];
    
    mealPlanData[weekNum] = {};
    
    // Extract day objects
    const dayMatches = [...weekContent.matchAll(/"(\d+)":\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g)];
    
    for (const dayMatch of dayMatches) {
      const dayNum = dayMatch[1];
      const dayContent = dayMatch[2];
      
      mealPlanData[weekNum][dayNum] = { meals: {} };
      
      // Extract meal objects
      const mealMatches = [...dayContent.matchAll(/"(\w+)":\s*\{([^}]*)\}/g)];
      
      for (const mealMatch of mealMatches) {
        const mealName = mealMatch[1];
        const mealContent = mealMatch[2];
        
        // Extract recipe slug
        const recipeMatch = mealContent.match(/recipe:\s*['"]([^'"]+)['"]/);
        if (recipeMatch) {
          mealPlanData[weekNum][dayNum].meals[mealName] = {
            recipe: recipeMatch[1]
          };
        }
      }
    }
  }
  
  return mealPlanData;
}

async function addCourseTagsToRecipes() {
  try {
    console.log('🏷️ Adding course tags to recipes...\n');

    // Read meal plans file
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const mealPlansContent = fs.readFileSync(mealPlansPath, 'utf8');

    // Extract sections
    const basicsSection = extractSection(mealPlansContent, 'export const mealPlans', 'export const flowMealPlans');
    const flowSection = extractSection(mealPlansContent, 'export const flowMealPlans', 'export const energyMealPlans');
    const energySection = extractSection(mealPlansContent, 'export const energyMealPlans', null);

    // Parse meal plan data
    const basicsMealPlans = parseMealPlanSection(basicsSection);
    const flowMealPlans = parseMealPlanSection(flowSection);
    const energyMealPlans = parseMealPlanSection(energySection);

    // Extract recipe slugs
    const basicSlugs = extractRecipeSlugs(basicsMealPlans);
    const flowSlugs = extractRecipeSlugs(flowMealPlans);
    const energySlugs = extractRecipeSlugs(energyMealPlans);

    console.log(`📊 Course recipe counts:`);
    console.log(`  Functional Basics: ${basicSlugs.length} recipes`);
    console.log(`  Functional Flow: ${flowSlugs.length} recipes`);
    console.log(`  Functional Energy: ${energySlugs.length} recipes\n`);

    let updated = 0;

    // Add Basic tags
    console.log('🔵 Adding Basic tags...');
    for (const slug of basicSlugs) {
      const recipe = await prisma.recipe.findUnique({
        where: { slug },
        select: { id: true, tags: true, title: true }
      });
      
      if (recipe) {
        const currentTags = recipe.tags || [];
        if (!currentTags.includes('Basic')) {
          const newTags = [...currentTags.filter(tag => !['Basic', 'Flow', 'Energy'].includes(tag)), 'Basic'];
          
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: { tags: newTags }
          });
          updated++;
          
          if (updated % 20 === 0) {
            console.log(`  Progress: ${updated} recipes updated...`);
          }
        }
      }
    }

    // Add Flow tags
    console.log('🟡 Adding Flow tags...');
    for (const slug of flowSlugs) {
      const recipe = await prisma.recipe.findUnique({
        where: { slug },
        select: { id: true, tags: true, title: true }
      });
      
      if (recipe) {
        const currentTags = recipe.tags || [];
        if (!currentTags.includes('Flow')) {
          const newTags = [...currentTags.filter(tag => !['Basic', 'Flow', 'Energy'].includes(tag)), 'Flow'];
          
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: { tags: newTags }
          });
          updated++;
          
          if (updated % 20 === 0) {
            console.log(`  Progress: ${updated} recipes updated...`);
          }
        }
      }
    }

    // Add Energy tags
    console.log('🟢 Adding Energy tags...');
    for (const slug of energySlugs) {
      const recipe = await prisma.recipe.findUnique({
        where: { slug },
        select: { id: true, tags: true, title: true }
      });
      
      if (recipe) {
        const currentTags = recipe.tags || [];
        if (!currentTags.includes('Energy')) {
          const newTags = [...currentTags.filter(tag => !['Basic', 'Flow', 'Energy'].includes(tag)), 'Energy'];
          
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: { tags: newTags }
          });
          updated++;
          
          if (updated % 20 === 0) {
            console.log(`  Progress: ${updated} recipes updated...`);
          }
        }
      }
    }

    // Final verification
    const [basicCount, flowCount, energyCount] = await Promise.all([
      prisma.recipe.count({ where: { tags: { has: 'Basic' } } }),
      prisma.recipe.count({ where: { tags: { has: 'Flow' } } }),
      prisma.recipe.count({ where: { tags: { has: 'Energy' } } })
    ]);

    console.log('\n✅ COURSE TAGGING COMPLETE!');
    console.log('================================');
    console.log(`📊 Final tag counts:`);
    console.log(`  Basic tagged: ${basicCount}`);
    console.log(`  Flow tagged: ${flowCount}`);
    console.log(`  Energy tagged: ${energyCount}`);
    console.log(`\n📈 Total updates made: ${updated}`);

    console.log('\n🎉 ALL COURSE RECIPES NOW HAVE PROPER TAGS!');
    console.log('Users should now be able to access recipes from their purchased courses.');

  } catch (error) {
    console.error('❌ Error adding course tags:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addCourseTagsToRecipes();
}

module.exports = { addCourseTagsToRecipes }; 
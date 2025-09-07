const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const stringsSimilarity = require('string-similarity');

const prisma = new PrismaClient();

// Read and parse meal plans from TypeScript file
async function loadMealPlans() {
  const content = await fs.readFile(path.join(__dirname, '../app/data/mealPlans.ts'), 'utf8');
  
  // Extract meal plan objects using regex
  const mealPlansMatch = content.match(/export const mealPlans[^=]*=\s*({[\s\S]*?});/);
  const flowMealPlansMatch = content.match(/export const flowMealPlans[^=]*=\s*({[\s\S]*?});/);
  const energyMealPlansMatch = content.match(/export const energyMealPlans[^=]*=\s*({[\s\S]*?});/);
  
  // Convert to valid JavaScript and evaluate
  const cleanContent = (str) => {
    return str
      .replace(/:\s*MealItem/g, '')
      .replace(/:\s*DayMeals/g, '')
      .replace(/:\s*WeekMealPlan/g, '')
      .replace(/:\s*Record<[^>]+>/g, '')
      .replace(/:\s*string/g, '')
      .replace(/\?\s*:/g, ':');
  };
  
  const mealPlans = eval(`(${cleanContent(mealPlansMatch[1])})`);
  const flowMealPlans = eval(`(${cleanContent(flowMealPlansMatch[1])})`);
  const energyMealPlans = eval(`(${cleanContent(energyMealPlansMatch[1])})`);
  
  return { mealPlans, flowMealPlans, energyMealPlans };
}

// Helper functions
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSlugFromLink(link) {
  if (!link) return null;
  const parts = link.split('/');
  return parts[parts.length - 1];
}

async function findBestImage(recipeTitle) {
  try {
    const imageDirs = [
      'public/Bilder_basic/_optimized',
      'public/Bilder_flow/_optimized',
      'public/Recept_complete2.0/images/_optimized'
    ];

    let allImages = [];
    
    for (const dir of imageDirs) {
      try {
        const files = await fs.readdir(dir);
        const webpFiles = files.filter(f => f.endsWith('.webp'));
        allImages = allImages.concat(webpFiles.map(f => ({
          filename: f,
          path: `/${dir.replace('public/', '')}/${f}`,
          normalized: normalizeText(f.replace('.webp', ''))
        })));
      } catch (e) {
        // Directory might not exist
      }
    }

    if (allImages.length === 0) return null;

    const normalizedTitle = normalizeText(recipeTitle);
    let match = allImages.find(img => img.normalized === normalizedTitle);

    if (!match) {
      const matches = stringsSimilarity.findBestMatch(
        normalizedTitle,
        allImages.map(img => img.normalized)
      );

      if (matches.bestMatch.rating > 0.6) {
        match = allImages.find(img => img.normalized === matches.bestMatch.target);
      }
    }

    return match ? match.path : null;
  } catch (error) {
    console.error(`Error finding image for ${recipeTitle}:`, error);
    return null;
  }
}

async function ultimateCourseFix() {
  console.log('🚀 ULTIMATE COURSE RECIPE FIX');
  console.log('=============================\n');

  try {
    // Load meal plans
    console.log('📚 Loading meal plans...');
    const { mealPlans, flowMealPlans, energyMealPlans } = await loadMealPlans();
    
    // Collect all course recipes
    const courseRecipes = new Map(); // slug -> { title, courses: Set, links: Set }
    
    const processMealPlan = (plans, courseName) => {
      Object.values(plans).forEach(week => {
        if (!week.days) return;
        Object.values(week.days).forEach(day => {
          ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].forEach(mealType => {
            const meal = day[mealType];
            if (meal && meal.recipeLink) {
              const slug = getSlugFromLink(meal.recipeLink);
              if (slug) {
                const title = meal.name.replace(/\s*\(.*\)$/, '').replace(/\s+rester$/, '');
                
                if (!courseRecipes.has(slug)) {
                  courseRecipes.set(slug, {
                    title: title,
                    courses: new Set([courseName]),
                    links: new Set([meal.recipeLink])
                  });
                } else {
                  courseRecipes.get(slug).courses.add(courseName);
                  courseRecipes.get(slug).links.add(meal.recipeLink);
                }
              }
            }
          });
        });
      });
    };
    
    processMealPlan(mealPlans, 'Basic');
    processMealPlan(flowMealPlans, 'Flow');
    processMealPlan(energyMealPlans, 'Energy');
    
    console.log(`\n📊 Found ${courseRecipes.size} unique course recipes`);
    
    // Get all recipes from database
    console.log('\n🔍 Fetching all recipes from database...');
    const allRecipes = await prisma.recipe.findMany();
    console.log(`  Found ${allRecipes.length} recipes`);
    
    // Create lookup maps
    const recipeBySlug = new Map(allRecipes.map(r => [r.slug, r]));
    
    // Check for missing recipes
    console.log('\n❓ Checking for missing recipes...');
    const missingRecipes = [];
    for (const [slug, info] of courseRecipes) {
      if (!recipeBySlug.has(slug)) {
        missingRecipes.push({ slug, ...info });
      }
    }
    
    if (missingRecipes.length > 0) {
      console.log(`  ⚠️  Found ${missingRecipes.length} missing recipes:`);
      missingRecipes.forEach(r => {
        console.log(`    - ${r.title} (${Array.from(r.links)[0]})`);
      });
    }
    
    // Update all recipes
    console.log('\n🔄 Updating all recipes...');
    let updates = {
      total: 0,
      tags: 0,
      access: 0,
      images: 0
    };
    
    // Process in batches
    for (let i = 0; i < allRecipes.length; i += 50) {
      const batch = allRecipes.slice(i, i + 50);
      
      await Promise.all(batch.map(async (recipe) => {
        const courseInfo = courseRecipes.get(recipe.slug);
        const updateData = {};
        
        if (courseInfo) {
          // This is a course recipe
          const newTags = Array.from(courseInfo.courses);
          
          // Update tags if needed
          const currentTags = recipe.tags || [];
          const hasAllTags = newTags.every(tag => currentTags.includes(tag));
          const hasOnlyTheseTags = currentTags.every(tag => 
            newTags.includes(tag) || !['Basic', 'Flow', 'Energy'].includes(tag)
          );
          
          if (!hasAllTags || !hasOnlyTheseTags) {
            // Keep non-course tags and add course tags
            const nonCourseTags = currentTags.filter(tag => !['Basic', 'Flow', 'Energy'].includes(tag));
            updateData.tags = [...nonCourseTags, ...newTags];
            updates.tags++;
          }
          
          // Course recipes should not be free
          if (recipe.isFree !== false || recipe.isPremium !== false) {
            updateData.isFree = false;
            updateData.isPremium = false;
            updates.access++;
          }
        } else {
          // Not a course recipe - should be free (unless admin-only)
          if (!recipe.tags?.includes('ADMIN_ONLY') && !recipe.tags?.includes('UD')) {
            if (recipe.isFree !== true) {
              updateData.isFree = true;
              updateData.isPremium = false;
              updates.access++;
            }
          }
        }
        
        // Check image
        if (!recipe.imageUrl || 
            recipe.imageUrl.includes('/public/') || 
            recipe.imageUrl.includes(' ') ||
            recipe.imageUrl.includes('/Recept_complete/')) {
          const bestImage = await findBestImage(recipe.title);
          if (bestImage) {
            updateData.imageUrl = bestImage;
            updates.images++;
          }
        }
        
        // Update if needed
        if (Object.keys(updateData).length > 0) {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: updateData
          });
          updates.total++;
        }
      }));
      
      console.log(`  Progress: ${Math.min(i + 50, allRecipes.length)}/${allRecipes.length} recipes processed...`);
    }
    
    console.log('\n✅ Update complete!');
    console.log(`  Total updated: ${updates.total}`);
    console.log(`  Tags fixed: ${updates.tags}`);
    console.log(`  Access fixed: ${updates.access}`);
    console.log(`  Images fixed: ${updates.images}`);
    
    // Final validation
    console.log('\n📊 Final validation...');
    const finalStats = await prisma.recipe.groupBy({
      by: ['isFree'],
      _count: { id: true }
    });
    
    const courseCount = await prisma.recipe.count({
      where: {
        tags: { hasSome: ['Basic', 'Flow', 'Energy'] }
      }
    });
    
    console.log(`  Total recipes: ${allRecipes.length}`);
    console.log(`  Free recipes: ${finalStats.find(s => s.isFree)?._count.id || 0}`);
    console.log(`  Course recipes: ${courseCount}`);
    console.log(`  Non-free recipes: ${finalStats.find(s => !s.isFree)?._count.id || 0}`);
    
    // Test a specific recipe
    console.log('\n🧪 Testing havregrynsgröt-med-ananas...');
    const testRecipe = await prisma.recipe.findUnique({
      where: { slug: 'havregrynsgrot-med-ananas' }
    });
    
    if (testRecipe) {
      console.log('  Found:', {
        title: testRecipe.title,
        tags: testRecipe.tags,
        isFree: testRecipe.isFree,
        isPremium: testRecipe.isPremium,
        imageUrl: testRecipe.imageUrl
      });
    }
    
    console.log('\n🎉 ULTIMATE FIX COMPLETE!');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
ultimateCourseFix(); 
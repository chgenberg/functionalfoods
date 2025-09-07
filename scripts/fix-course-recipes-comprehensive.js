const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const stringsSimilarity = require('string-similarity');

const prisma = new PrismaClient();

// Import meal plans - read and parse the TypeScript file
const mealPlansContent = require('fs').readFileSync(path.join(__dirname, '../app/data/mealPlans.ts'), 'utf8');
const mealPlans = {};
const flowMealPlans = {};
const energyMealPlans = {};

// Parse the meal plans from the file content
eval(mealPlansContent
  .replace(/export\s+interface\s+\w+\s*{[^}]+}/g, '')
  .replace(/export\s+function\s+\w+[^}]+}/g, '')
  .replace(/export\s+const\s+mealPlans/, 'const mealPlans')
  .replace(/export\s+const\s+flowMealPlans/, 'const flowMealPlans')
  .replace(/export\s+const\s+energyMealPlans/, 'const energyMealPlans')
  .replace(/:\s*Record<[^>]+>/g, '')
  .replace(/:\s*WeekMealPlan/g, '')
  .replace(/:\s*DayMeals/g, '')
  .replace(/:\s*MealItem/g, '')
  .replace(/:\s*string/g, '')
);

// Helper function to normalize text
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

// Helper to get slug from recipe link
function getSlugFromLink(link) {
  if (!link) return null;
  const parts = link.split('/');
  return parts[parts.length - 1];
}

// Helper to find best matching image
async function findBestImage(recipeTitle, existingImageUrl) {
  try {
    // If we already have a working image, keep it
    if (existingImageUrl && !existingImageUrl.includes('/public/') && !existingImageUrl.includes(' ')) {
      return existingImageUrl;
    }

    // Directories to search for images
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

    // Try exact match first
    const normalizedTitle = normalizeText(recipeTitle);
    let match = allImages.find(img => img.normalized === normalizedTitle);

    // If no exact match, use fuzzy matching
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

async function fixCourseRecipesComprehensive() {
  console.log('🚀 COMPREHENSIVE COURSE RECIPE FIX');
  console.log('==================================\n');

  try {
    // Step 1: Collect all recipes from meal plans
    const courseRecipes = {
      Basic: new Set(),
      Flow: new Set(),
      Energy: new Set()
    };

    const recipeDetails = new Map(); // slug -> {title, courses, link}

    // Process Basics
    console.log('📚 Processing Functional Basics...');
    Object.values(mealPlans).forEach(week => {
      Object.values(week.days).forEach(day => {
        ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].forEach(mealType => {
          const meal = day[mealType];
          if (meal && meal.recipeLink) {
            const slug = getSlugFromLink(meal.recipeLink);
            if (slug) {
              courseRecipes.Basic.add(slug);
              if (!recipeDetails.has(slug)) {
                recipeDetails.set(slug, {
                  title: meal.name.replace(/\s*\(.*\)$/, '').replace(/\s+rester$/, ''),
                  courses: new Set(['Basic']),
                  link: meal.recipeLink
                });
              } else {
                recipeDetails.get(slug).courses.add('Basic');
              }
            }
          }
        });
      });
    });

    // Process Flow
    console.log('🌊 Processing Functional Flow...');
    Object.values(flowMealPlans).forEach(week => {
      Object.values(week.days).forEach(day => {
        ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].forEach(mealType => {
          const meal = day[mealType];
          if (meal && meal.recipeLink) {
            const slug = getSlugFromLink(meal.recipeLink);
            if (slug) {
              courseRecipes.Flow.add(slug);
              if (!recipeDetails.has(slug)) {
                recipeDetails.set(slug, {
                  title: meal.name.replace(/\s*\(.*\)$/, '').replace(/\s+rester$/, ''),
                  courses: new Set(['Flow']),
                  link: meal.recipeLink
                });
              } else {
                recipeDetails.get(slug).courses.add('Flow');
              }
            }
          }
        });
      });
    });

    // Process Energy
    console.log('⚡ Processing Functional Energy...');
    Object.values(energyMealPlans).forEach(week => {
      Object.values(week.days).forEach(day => {
        ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'].forEach(mealType => {
          const meal = day[mealType];
          if (meal && meal.recipeLink) {
            const slug = getSlugFromLink(meal.recipeLink);
            if (slug) {
              courseRecipes.Energy.add(slug);
              if (!recipeDetails.has(slug)) {
                recipeDetails.set(slug, {
                  title: meal.name.replace(/\s*\(.*\)$/, '').replace(/\s+rester$/, ''),
                  courses: new Set(['Energy']),
                  link: meal.recipeLink
                });
              } else {
                recipeDetails.get(slug).courses.add('Energy');
              }
            }
          }
        });
      });
    });

    console.log(`\n📊 Course recipes found:`);
    console.log(`  Basic: ${courseRecipes.Basic.size}`);
    console.log(`  Flow: ${courseRecipes.Flow.size}`);
    console.log(`  Energy: ${courseRecipes.Energy.size}`);
    console.log(`  Total unique: ${recipeDetails.size}`);

    // Step 2: Get all recipes from database
    console.log('\n🔍 Fetching all recipes from database...');
    const allRecipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        tags: true,
        isPremium: true,
        isFree: true,
        imageUrl: true,
        ingredients: true,
        ingredientsStructured: true
      }
    });

    const recipeBySlug = new Map(allRecipes.map(r => [r.slug, r]));
    console.log(`  Found ${allRecipes.length} recipes in database`);

    // Step 3: Check for missing recipes
    console.log('\n❓ Checking for missing recipes...');
    const missingRecipes = [];
    for (const [slug, details] of recipeDetails) {
      if (!recipeBySlug.has(slug)) {
        missingRecipes.push({ slug, ...details });
      }
    }

    if (missingRecipes.length > 0) {
      console.log(`  ⚠️  Found ${missingRecipes.length} missing recipes:`);
      missingRecipes.forEach(r => {
        console.log(`    - ${r.title} (${r.link})`);
      });
    } else {
      console.log('  ✅ All course recipes exist in database!');
    }

    // Step 4: Update all recipes
    console.log('\n🔄 Updating all recipes...');
    
    let updatedCount = 0;
    let imageFixCount = 0;
    let accessFixCount = 0;

    // First, reset all recipes to free (except admin-only)
    await prisma.recipe.updateMany({
      where: {
        NOT: {
          tags: {
            has: 'ADMIN_ONLY'
          }
        }
      },
      data: {
        isFree: true
      }
    });

    // Then update course recipes
    for (const recipe of allRecipes) {
      const updates = {};
      let needsUpdate = false;

      // Check if this is a course recipe
      const courseInfo = recipeDetails.get(recipe.slug);
      
      if (courseInfo) {
        // This is a course recipe
        const newTags = Array.from(courseInfo.courses);
        
        // Update tags
        if (!arraysEqual(recipe.tags || [], newTags)) {
          updates.tags = newTags;
          needsUpdate = true;
        }

        // Course recipes should not be free
        if (recipe.isFree !== false) {
          updates.isFree = false;
          updates.isPremium = false; // Course recipes are not premium
          needsUpdate = true;
          accessFixCount++;
        }

        // Check and fix image
        const bestImage = await findBestImage(courseInfo.title, recipe.imageUrl);
        if (bestImage && bestImage !== recipe.imageUrl) {
          updates.imageUrl = bestImage;
          needsUpdate = true;
          imageFixCount++;
        }
      } else {
        // Not a course recipe - ensure it's free (unless admin-only)
        if (!recipe.tags?.includes('ADMIN_ONLY') && recipe.isFree !== true) {
          updates.isFree = true;
          updates.isPremium = false;
          needsUpdate = true;
          accessFixCount++;
        }

        // Also check image for free recipes
        if (recipe.imageUrl && (recipe.imageUrl.includes('/public/') || recipe.imageUrl.includes(' '))) {
          const bestImage = await findBestImage(recipe.title, recipe.imageUrl);
          if (bestImage && bestImage !== recipe.imageUrl) {
            updates.imageUrl = bestImage;
            needsUpdate = true;
            imageFixCount++;
          }
        }
      }

      if (needsUpdate) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: updates
        });
        updatedCount++;
        
        if (updatedCount % 50 === 0) {
          console.log(`  Progress: ${updatedCount} recipes updated...`);
        }
      }
    }

    // Step 5: Final validation
    console.log('\n✅ Update complete!');
    console.log(`  Total updated: ${updatedCount}`);
    console.log(`  Images fixed: ${imageFixCount}`);
    console.log(`  Access fixed: ${accessFixCount}`);

    // Get final counts
    const finalCounts = await prisma.recipe.groupBy({
      by: ['isFree'],
      _count: {
        id: true
      }
    });

    const courseCount = await prisma.recipe.count({
      where: {
        tags: {
          hasSome: ['Basic', 'Flow', 'Energy']
        }
      }
    });

    console.log('\n📊 FINAL DATABASE STATUS:');
    console.log(`  Total recipes: ${allRecipes.length}`);
    console.log(`  Free recipes: ${finalCounts.find(c => c.isFree)._count.id || 0}`);
    console.log(`  Course recipes: ${courseCount}`);
    console.log(`  Premium recipes: ${finalCounts.find(c => !c.isFree)._count.id || 0}`);

    // Step 6: Clear cache on Railway
    console.log('\n🚀 Triggering cache refresh...');
    try {
      const response = await fetch('https://ulrika-functional-foods-production.up.railway.app/api/force-refresh', {
        method: 'POST'
      });
      if (response.ok) {
        console.log('  ✅ Cache refresh triggered successfully');
      }
    } catch (e) {
      console.log('  ⚠️  Could not trigger cache refresh');
    }

    console.log('\n🎉 COMPREHENSIVE FIX COMPLETE!');

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, idx) => val === sortedB[idx]);
}

// Run the fix
fixCourseRecipesComprehensive(); 
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

const prisma = new PrismaClient();

// Set to true to apply fixes, false to just report issues
const FIX_MODE = true;

async function main() {
  console.log('🔧 COMPREHENSIVE COURSE RECIPE FIX');
  console.log('=====================================\n');

  // Collect ALL recipe slugs from meal plans
  const basicSlugs = new Set();
  const flowSlugs = new Set();
  const energySlugs = new Set();
  
  // Helper to extract slug from recipe link
  const extractSlug = (link) => {
    if (!link) return null;
    return link.replace(/^\/kunskapsbank\/recept\//, '');
  };

  // Collect Basics recipes
  console.log('📚 Collecting Functional Basics recipes...');
  const mealPlansContent = fs.readFileSync(path.join(process.cwd(), 'app', 'data', 'mealPlans.ts'), 'utf8');
  const basicRecipes = extractRecipesFromMealPlan(mealPlansContent, 'mealPlans', null);
  basicRecipes.forEach(slug => {
    if (slug) basicSlugs.add(slug);
  });
  console.log(`  Found ${basicSlugs.size} unique recipes in Basics meal plans`);

  // Collect Flow recipes
  console.log('🌊 Collecting Functional Flow recipes...');
  const flowRecipes = extractRecipesFromMealPlan(mealPlansContent, 'flowMealPlans', null);
  flowRecipes.forEach(slug => {
    if (slug) flowSlugs.add(slug);
  });
  console.log(`  Found ${flowSlugs.size} unique recipes in Flow meal plans`);

  // Collect Energy recipes
  console.log('⚡ Collecting Functional Energy recipes...');
  const energyRecipes = extractRecipesFromMealPlan(mealPlansContent, 'energyMealPlans', null);
  energyRecipes.forEach(slug => {
    if (slug) energySlugs.add(slug);
  });
  console.log(`  Found ${energySlugs.size} unique recipes in Energy meal plans`);

  // Get all unique course recipe slugs
  const allCourseSlugs = new Set([...basicSlugs, ...flowSlugs, ...energySlugs]);
  console.log(`\n📊 Total unique course recipes: ${allCourseSlugs.size}`);

  // Update database
  console.log('\n🔄 Updating database...');

  // First, reset ALL recipes to free
  console.log('  1️⃣ Resetting all recipes to free...');
  await prisma.recipe.updateMany({
    data: {
      isPremium: false,
      isFree: true
    }
  });

  // Then update course recipes
  console.log('  2️⃣ Updating course recipes...');
  
  // Update Basics recipes
  if (basicSlugs.size > 0) {
    const basicResult = await prisma.recipe.updateMany({
      where: { slug: { in: Array.from(basicSlugs) } },
      data: {
        isPremium: false,
        isFree: false,
        tags: {
          set: ['Basic']
        }
      }
    });
    console.log(`     ✅ Updated ${basicResult.count} Basics recipes`);
  }

  // Update Flow recipes
  if (flowSlugs.size > 0) {
    const flowResult = await prisma.recipe.updateMany({
      where: { slug: { in: Array.from(flowSlugs) } },
      data: {
        isPremium: false,
        isFree: false,
        tags: {
          set: ['Flow']
        }
      }
    });
    console.log(`     ✅ Updated ${flowResult.count} Flow recipes`);
  }

  // Update Energy recipes
  if (energySlugs.size > 0) {
    const energyResult = await prisma.recipe.updateMany({
      where: { slug: { in: Array.from(energySlugs) } },
      data: {
        isPremium: false,
        isFree: false,
        tags: {
          set: ['Energy']
        }
      }
    });
    console.log(`     ✅ Updated ${energyResult.count} Energy recipes`);
  }

  // Handle recipes that appear in multiple courses
  console.log('\n  3️⃣ Handling recipes in multiple courses...');
  let multiCourseCount = 0;
  
  for (const slug of allCourseSlugs) {
    const courseTags = [];
    if (basicSlugs.has(slug)) courseTags.push('Basic');
    if (flowSlugs.has(slug)) courseTags.push('Flow');
    if (energySlugs.has(slug)) courseTags.push('Energy');
    
    if (courseTags.length > 1) {
      await prisma.recipe.update({
        where: { slug },
        data: {
          tags: {
            set: courseTags
          }
        }
      });
      multiCourseCount++;
    }
  }
  console.log(`     ✅ Updated ${multiCourseCount} recipes that appear in multiple courses`);

  // Final verification
  console.log('\n📊 FINAL DATABASE STATUS:');
  
  const totalRecipes = await prisma.recipe.count();
  const freeRecipes = await prisma.recipe.count({ where: { isFree: true } });
  const courseRecipes = await prisma.recipe.count({ where: { isFree: false } });
  const basicTagged = await prisma.recipe.count({ where: { tags: { has: 'Basic' } } });
  const flowTagged = await prisma.recipe.count({ where: { tags: { has: 'Flow' } } });
  const energyTagged = await prisma.recipe.count({ where: { tags: { has: 'Energy' } } });

  console.log(`  Total recipes: ${totalRecipes}`);
  console.log(`  Free recipes: ${freeRecipes}`);
  console.log(`  Course recipes: ${courseRecipes}`);
  console.log(`  Basic tagged: ${basicTagged}`);
  console.log(`  Flow tagged: ${flowTagged}`);
  console.log(`  Energy tagged: ${energyTagged}`);

  // Check for missing recipes
  console.log('\n🔍 Checking for missing recipes...');
  const dbRecipes = await prisma.recipe.findMany({ select: { slug: true } });
  const dbSlugs = new Set(dbRecipes.map(r => r.slug));
  
  const missing = [];
  for (const slug of allCourseSlugs) {
    if (!dbSlugs.has(slug)) {
      missing.push(slug);
    }
  }
  
  if (missing.length > 0) {
    console.log(`  ⚠️  ${missing.length} recipes in meal plans are missing from database:`);
    missing.forEach(slug => console.log(`     - ${slug}`));
  } else {
    console.log('  ✅ All meal plan recipes exist in database!');
  }

  console.log('\n✅ COMPREHENSIVE FIX COMPLETE!');
  
  await prisma.$disconnect();
}

async function validateAndFixCourseRecipes() {
  try {
    console.log('🔍 Starting comprehensive course recipe validation and fix...\n');

    // Read meal plans file
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const mealPlansContent = fs.readFileSync(mealPlansPath, 'utf8');

    // Extract course recipes from mealPlans
    console.log('📖 Extracting recipes from meal plans...');
    const basicRecipes = extractRecipesFromMealPlan(mealPlansContent, 'mealPlans', null);
    const flowRecipes = extractRecipesFromMealPlan(mealPlansContent, 'flowMealPlans', null);
    const energyRecipes = extractRecipesFromMealPlan(mealPlansContent, 'energyMealPlans', null);

    console.log(`\n📊 Course recipes found in mealPlans.ts:`);
    console.log(`  Functional Basics: ${basicRecipes.length} recipes`);
    console.log(`  Functional Flow: ${flowRecipes.length} recipes`);
    console.log(`  Functional Energy: ${energyRecipes.length} recipes`);
    console.log(`  Total unique: ${new Set([...basicRecipes, ...flowRecipes, ...energyRecipes]).size} recipes\n`);

    // Get all recipes from database
    const allRecipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        tags: true,
        isPremium: true,
        isFree: true
      }
    });

    console.log(`\n📚 Total recipes in database: ${allRecipes.length}`);

    // Create slug-to-recipe map
    const recipeMap = new Map();
    allRecipes.forEach(recipe => {
      recipeMap.set(recipe.slug, recipe);
    });

    // Analyze and fix each course
    const issues = [];
    const fixes = [];

    console.log('\n🔵 Analyzing Functional Basics recipes...');
    for (const slug of basicRecipes) {
      const recipe = recipeMap.get(slug);
      if (!recipe) {
        issues.push(`❌ Basic recipe not found: ${slug}`);
        continue;
      }

      const updates = {};
      let needsUpdate = false;

      // Check tags
      if (!recipe.tags || !recipe.tags.includes('Basic')) {
        updates.tags = ['Basic'];
        needsUpdate = true;
        issues.push(`🏷️ Missing Basic tag: ${recipe.title} (${slug})`);
      }

      // Check access flags
      if (recipe.isFree !== false || recipe.isPremium !== false) {
        updates.isFree = false;
        updates.isPremium = false;
        needsUpdate = true;
        issues.push(`🔒 Wrong access flags: ${recipe.title} (${slug})`);
      }

      // Check image
      if (!recipe.imageUrl || recipe.imageUrl.includes('placeholder') || !fs.existsSync(path.join(process.cwd(), 'public', recipe.imageUrl))) {
        issues.push(`🖼️ Missing/invalid image: ${recipe.title} (${slug}) - ${recipe.imageUrl || 'no image'}`);
        
        // Try to find matching image
        const possibleImage = await findMatchingImage(recipe.title, slug);
        if (possibleImage) {
          updates.imageUrl = possibleImage;
          needsUpdate = true;
          fixes.push(`✅ Fixed image for ${recipe.title}: ${possibleImage}`);
        }
      }

      if (needsUpdate) {
        if (FIX_MODE) {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: updates
          });
          fixes.push(`✅ Fixed ${recipe.title} (${slug})`);
        }
      }
    }

    console.log('\n🟡 Analyzing Functional Flow recipes...');
    for (const slug of flowRecipes) {
      const recipe = recipeMap.get(slug);
      if (!recipe) {
        issues.push(`❌ Flow recipe not found: ${slug}`);
        continue;
      }

      const updates = {};
      let needsUpdate = false;

      // Check tags
      if (!recipe.tags || !recipe.tags.includes('Flow')) {
        updates.tags = ['Flow'];
        needsUpdate = true;
        issues.push(`🏷️ Missing Flow tag: ${recipe.title} (${slug})`);
      }

      // Check access flags
      if (recipe.isFree !== false || recipe.isPremium !== false) {
        updates.isFree = false;
        updates.isPremium = false;
        needsUpdate = true;
        issues.push(`🔒 Wrong access flags: ${recipe.title} (${slug})`);
      }

      // Check image
      if (!recipe.imageUrl || recipe.imageUrl.includes('placeholder') || !fs.existsSync(path.join(process.cwd(), 'public', recipe.imageUrl))) {
        issues.push(`🖼️ Missing/invalid image: ${recipe.title} (${slug}) - ${recipe.imageUrl || 'no image'}`);
        
        // Try to find matching image
        const possibleImage = await findMatchingImage(recipe.title, slug);
        if (possibleImage) {
          updates.imageUrl = possibleImage;
          needsUpdate = true;
          fixes.push(`✅ Fixed image for ${recipe.title}: ${possibleImage}`);
        }
      }

      if (needsUpdate) {
        if (FIX_MODE) {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: updates
          });
          fixes.push(`✅ Fixed ${recipe.title} (${slug})`);
        }
      }
    }

    console.log('\n🟢 Analyzing Functional Energy recipes...');
    for (const slug of energyRecipes) {
      const recipe = recipeMap.get(slug);
      if (!recipe) {
        issues.push(`❌ Energy recipe not found: ${slug}`);
        continue;
      }

      const updates = {};
      let needsUpdate = false;

      // Check tags
      if (!recipe.tags || !recipe.tags.includes('Energy')) {
        updates.tags = ['Energy'];
        needsUpdate = true;
        issues.push(`🏷️ Missing Energy tag: ${recipe.title} (${slug})`);
      }

      // Check access flags
      if (recipe.isFree !== false || recipe.isPremium !== false) {
        updates.isFree = false;
        updates.isPremium = false;
        needsUpdate = true;
        issues.push(`🔒 Wrong access flags: ${recipe.title} (${slug})`);
      }

      // Check image
      if (!recipe.imageUrl || recipe.imageUrl.includes('placeholder') || !fs.existsSync(path.join(process.cwd(), 'public', recipe.imageUrl))) {
        issues.push(`🖼️ Missing/invalid image: ${recipe.title} (${slug}) - ${recipe.imageUrl || 'no image'}`);
        
        // Try to find matching image
        const possibleImage = await findMatchingImage(recipe.title, slug);
        if (possibleImage) {
          updates.imageUrl = possibleImage;
          needsUpdate = true;
          fixes.push(`✅ Fixed image for ${recipe.title}: ${possibleImage}`);
        }
      }

      if (needsUpdate) {
        if (FIX_MODE) {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: updates
          });
          fixes.push(`✅ Fixed ${recipe.title} (${slug})`);
        }
      }
    }

    // Check free recipes
    console.log('\n🆓 Checking free recipes...');
    const allCourseRecipes = new Set([...basicRecipes, ...flowRecipes, ...energyRecipes]);
    let freeCount = 0;
    
    for (const recipe of allRecipes) {
      if (!allCourseRecipes.has(recipe.slug)) {
        // This should be a free recipe
        if (recipe.isFree !== true || recipe.isPremium !== false) {
          if (FIX_MODE) {
            await prisma.recipe.update({
              where: { id: recipe.id },
              data: {
                isFree: true,
                isPremium: false,
                tags: recipe.tags?.filter(tag => !['Basic', 'Flow', 'Energy'].includes(tag)) || []
              }
            });
            fixes.push(`✅ Fixed free recipe: ${recipe.title}`);
          } else {
            issues.push(`🆓 Should be free: ${recipe.title} (${recipe.slug})`);
          }
        }
        freeCount++;
      }
    }

    // Final summary
    console.log('\n📋 VALIDATION SUMMARY');
    console.log('====================');
    console.log(`\n🚨 Issues found: ${issues.length}`);
    if (issues.length > 0) {
      issues.forEach(issue => console.log(`  ${issue}`));
    }

    console.log(`\n✅ Fixes applied: ${fixes.length}`);
    if (fixes.length > 0) {
      fixes.slice(0, 10).forEach(fix => console.log(`  ${fix}`));
      if (fixes.length > 10) {
        console.log(`  ... and ${fixes.length - 10} more`);
      }
    }

    // Final counts
    const [basicCount, flowCount, energyCount, freeRecipeCount] = await Promise.all([
      prisma.recipe.count({ where: { tags: { has: 'Basic' }, isFree: false } }),
      prisma.recipe.count({ where: { tags: { has: 'Flow' }, isFree: false } }),
      prisma.recipe.count({ where: { tags: { has: 'Energy' }, isFree: false } }),
      prisma.recipe.count({ where: { isFree: true } })
    ]);

    console.log('\n📊 FINAL RECIPE COUNTS');
    console.log('=====================');
    console.log(`  Basic (course): ${basicCount}`);
    console.log(`  Flow (course): ${flowCount}`);
    console.log(`  Energy (course): ${energyCount}`);
    console.log(`  Free recipes: ${freeRecipeCount}`);
    console.log(`  Total: ${basicCount + flowCount + energyCount + freeRecipeCount}`);

    // Generate detailed report
    const report = {
      timestamp: new Date().toISOString(),
      courseCounts: {
        basic: basicCount,
        flow: flowCount,
        energy: energyCount
      },
      freeRecipes: freeRecipeCount,
      issues: issues,
      fixes: fixes,
      missingRecipes: [...basicRecipes, ...flowRecipes, ...energyRecipes].filter(slug => !recipeMap.has(slug))
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'course-recipe-validation-report.json'),
      JSON.stringify(report, null, 2)
    );

    console.log('\n📄 Detailed report saved to: course-recipe-validation-report.json');
    console.log('\n✨ Validation and fix complete!');

  } catch (error) {
    console.error('❌ Error during validation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to extract recipe links from meal plan text
function extractRecipesFromMealPlan(content, startMarker, endMarker) {
  const recipes = new Set();
  
  // Find section boundaries
  let startIndex;
  let endIndex;
  
  if (startMarker === 'mealPlans') {
    startIndex = content.indexOf('export const mealPlans');
    endIndex = content.indexOf('export const flowMealPlans');
  } else if (startMarker === 'flowMealPlans') {
    startIndex = content.indexOf('export const flowMealPlans');
    endIndex = content.indexOf('export const energyMealPlans');
  } else if (startMarker === 'energyMealPlans') {
    startIndex = content.indexOf('export const energyMealPlans');
    endIndex = content.length;
  }
  
  if (startIndex === -1) {
    console.log(`⚠️ Could not find start marker for ${startMarker}`);
    return Array.from(recipes);
  }
  
  const section = content.substring(startIndex, endIndex === -1 ? content.length : endIndex);
  
  // Find all recipeLink values - use more flexible regex
  const recipeLinkPattern = /recipeLink"?:\s*["']([^"']+)["']/g;
  let match;
  
  while ((match = recipeLinkPattern.exec(section)) !== null) {
    const link = match[1];
    // Extract slug from link (e.g., "/kunskapsbank/recept/slug" -> "slug")
    const slug = link.split('/').pop();
    if (slug && slug !== 'recept') {
      recipes.add(slug);
    }
  }
  
  console.log(`  Found ${recipes.size} recipes in ${startMarker} section`);
  return Array.from(recipes);
}

// Helper function to find matching image for a recipe
async function findMatchingImage(title, slug) {
  const imageDirs = [
    'public/Bilder_basic/_optimized',
    'public/Bilder_flow/_optimized',
    'public/Recept_complete2.0/images',
    'public/Recept_complete/images',
    'public/images'
  ];

  // Try exact slug match first
  for (const dir of imageDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);
    
    // Look for exact slug match
    const exactMatch = files.find(file => 
      file.toLowerCase().includes(slug.toLowerCase()) && 
      (file.endsWith('.webp') || file.endsWith('.jpg') || file.endsWith('.png'))
    );
    
    if (exactMatch) {
      return `/${path.join(dir.replace('public/', ''), exactMatch)}`;
    }
  }

  // Try fuzzy matching on title
  const words = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  for (const dir of imageDirs) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);
    const imageFiles = files.filter(f => 
      f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png')
    );

    // Find best match
    let bestMatch = null;
    let bestScore = 0;

    for (const file of imageFiles) {
      const fileName = file.toLowerCase();
      let score = 0;
      
      // Check how many words from title are in filename
      for (const word of words) {
        if (fileName.includes(word)) {
          score += word.length;
        }
      }
      
      if (score > bestScore && score > title.length * 0.3) {
        bestScore = score;
        bestMatch = file;
      }
    }

    if (bestMatch) {
      return `/${path.join(dir.replace('public/', ''), bestMatch)}`;
    }
  }

  return null;
}

async function collectCourseRecipes() {
  const basicSlugs = new Set();
  const flowSlugs = new Set();
  const energySlugs = new Set();

  try {
    // Read meal plans from file
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const mealPlansContent = fs.readFileSync(mealPlansPath, 'utf8');

    // Collect Basics recipes
    console.log('📚 Collecting Functional Basics recipes...');
    const basicRecipes = extractRecipesFromMealPlan(mealPlansContent, 'mealPlans', 'flowMealPlans');
    basicRecipes.forEach(slug => {
      if (slug) basicSlugs.add(slug);
    });
    console.log(`  Found ${basicSlugs.size} unique recipes in Basics meal plans`);

    // Collect Flow recipes
    console.log('🌊 Collecting Functional Flow recipes...');
    const flowRecipes = extractRecipesFromMealPlan(mealPlansContent, 'flowMealPlans', 'energyMealPlans');
    flowRecipes.forEach(slug => {
      if (slug) flowSlugs.add(slug);
    });
    console.log(`  Found ${flowSlugs.size} unique recipes in Flow meal plans`);

    // Collect Energy recipes
    console.log('⚡ Collecting Functional Energy recipes...');
    const energyRecipes = extractRecipesFromMealPlan(mealPlansContent, 'energyMealPlans', null);
    energyRecipes.forEach(slug => {
      if (slug) energySlugs.add(slug);
    });
    console.log(`  Found ${energySlugs.size} unique recipes in Energy meal plans`);

    return { basicSlugs, flowSlugs, energySlugs };
  } catch (error) {
    console.error('Error collecting course recipes:', error);
    return { basicSlugs, flowSlugs, energySlugs };
  }
}

main().catch(console.error); 
validateAndFixCourseRecipes(); 
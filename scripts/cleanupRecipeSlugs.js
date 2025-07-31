const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function cleanupRecipeSlugs() {
  console.log('🧹 Cleaning up recipe slugs for better SEO...\n');

  // Get all recipes from database
  const allRecipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true
    }
  });

  console.log(`📊 Found ${allRecipes.length} recipes in database\n`);

  // Define mapping from messy slugs to clean slugs
  const slugCleanupMap = new Map();

  // Function to create clean slug from title
  function createCleanSlug(title) {
    return title
      .toLowerCase()
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  // Identify recipes with messy slugs and create clean alternatives
  const messyPrefixes = [
    'flow-recept-',
    'improved-flow-recept-',
    'forbattrad-extraktion-',
    'final-extraktion-',
    'fixed-recept-',
    'w-'
  ];

  console.log('🔍 Identifying recipes with messy slugs...');
  
  for (const recipe of allRecipes) {
    let needsCleanup = false;
    let cleanSlug = '';

    // Check if slug has messy prefix
    for (const prefix of messyPrefixes) {
      if (recipe.slug.startsWith(prefix)) {
        needsCleanup = true;
        if (prefix === 'w-') {
          // For w-* slugs, use the title to create clean slug
          cleanSlug = createCleanSlug(recipe.title);
        } else {
          // For other prefixes, remove the prefix
          cleanSlug = recipe.slug.replace(prefix, '');
        }
        break;
      }
    }

    // Also check for overly long slugs or those with numbers
    if (!needsCleanup && (recipe.slug.length > 60 || /\d{10,}/.test(recipe.slug))) {
      needsCleanup = true;
      cleanSlug = createCleanSlug(recipe.title);
    }

    if (needsCleanup) {
      // Make sure the clean slug is unique
      let finalCleanSlug = cleanSlug;
      let counter = 1;
      
      while (allRecipes.some(r => r.slug === finalCleanSlug) || 
             Array.from(slugCleanupMap.values()).includes(finalCleanSlug)) {
        finalCleanSlug = `${cleanSlug}-${counter}`;
        counter++;
      }

      slugCleanupMap.set(recipe.slug, finalCleanSlug);
      console.log(`✅ ${recipe.slug} -> ${finalCleanSlug} (${recipe.title})`);
    }
  }

  console.log(`\n📊 Found ${slugCleanupMap.size} recipes that need slug cleanup\n`);

  if (slugCleanupMap.size === 0) {
    console.log('🎉 All slugs are already clean!');
    await prisma.$disconnect();
    return;
  }

  // Update database slugs
  console.log('🔄 Updating database slugs...');
  let dbUpdates = 0;
  
  for (const [oldSlug, newSlug] of slugCleanupMap) {
    try {
      await prisma.recipe.update({
        where: { slug: oldSlug },
        data: { slug: newSlug }
      });
      dbUpdates++;
      console.log(`✅ Database: ${oldSlug} -> ${newSlug}`);
    } catch (error) {
      console.log(`❌ Database update failed for ${oldSlug}: ${error.message}`);
    }
  }

  // Update mealPlans.ts file
  console.log('\n🔄 Updating mealPlans.ts references...');
  const filePath = path.join(__dirname, '../app/data/mealPlans.ts');
  let fileContent = fs.readFileSync(filePath, 'utf8');
  
  let fileChanges = 0;
  slugCleanupMap.forEach((newSlug, oldSlug) => {
    const oldLink = `/kunskapsbank/recept/${oldSlug}`;
    const newLink = `/kunskapsbank/recept/${newSlug}`;
    
    const regex = new RegExp(`"recipeLink":\\s*"${oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
    const matches = fileContent.match(regex);
    
    if (matches) {
      fileContent = fileContent.replace(regex, `"recipeLink": "${newLink}"`);
      fileChanges += matches.length;
      console.log(`✅ mealPlans.ts: Updated ${matches.length} references from ${oldSlug} to ${newSlug}`);
    }
  });

  // Write the updated file
  if (fileChanges > 0) {
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log(`\n✅ Updated ${fileChanges} recipe links in mealPlans.ts`);
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('🎉 SLUG CLEANUP SUMMARY');
  console.log('='.repeat(80));
  console.log(`📊 Recipes processed: ${allRecipes.length}`);
  console.log(`🧹 Slugs cleaned up: ${slugCleanupMap.size}`);
  console.log(`💾 Database updates: ${dbUpdates}`);
  console.log(`📝 mealPlans.ts changes: ${fileChanges}`);

  console.log('\n💡 SEO Benefits:');
  console.log('✅ Shorter, more readable URLs');
  console.log('✅ No prefixes like "flow-recept-" or "improved-"');
  console.log('✅ Swedish characters converted to ASCII');
  console.log('✅ Clean, keyword-focused slugs');

  console.log('\n🔍 Examples of cleaned slugs:');
  let exampleCount = 0;
  for (const [oldSlug, newSlug] of slugCleanupMap) {
    if (exampleCount < 5) {
      console.log(`  ${oldSlug} -> ${newSlug}`);
      exampleCount++;
    }
  }

  await prisma.$disconnect();
  
  return {
    totalRecipes: allRecipes.length,
    slugsUpdated: slugCleanupMap.size,
    dbUpdates,
    fileChanges,
    cleanupMap: Object.fromEntries(slugCleanupMap)
  };
}

cleanupRecipeSlugs(); 
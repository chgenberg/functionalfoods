const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixWeekplanThumbnails() {
  try {
    console.log('🔧 Fixing missing thumbnails in week plans...');

    // Read mealPlans.ts to get all meal entries
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const content = fs.readFileSync(mealPlansPath, 'utf8');
    const publicRoot = path.join(process.cwd(), 'public');

    // Extract all recipe links with their meal names
    const mealRegex = /"name":\s*"([^"]+)"[\s\S]*?"recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g;
    const meals = [];
    let match;
    
    while ((match = mealRegex.exec(content)) !== null) {
      meals.push({
        name: match[1],
        slug: match[2]
      });
    }

    console.log(`Found ${meals.length} meal entries in meal plans`);

    // Get all recipes from database
    const recipes = await prisma.recipe.findMany({
      select: {
        slug: true,
        title: true,
        imageUrl: true
      }
    });

    const recipeMap = new Map(recipes.map(r => [r.slug, r]));
    let missingCount = 0;
    let fixedCount = 0;

    // Check each meal entry
    for (const meal of meals) {
      const recipe = recipeMap.get(meal.slug);
      
      if (!recipe) {
        console.log(`❌ Recipe not found in DB: ${meal.slug} (${meal.name})`);
        missingCount++;
        continue;
      }

      // Check if image exists
      if (!recipe.imageUrl) {
        console.log(`⚠️  No image URL for: ${meal.slug}`);
        
        // Set placeholder image
        await prisma.recipe.update({
          where: { slug: meal.slug },
          data: { imageUrl: '/images/recipe-placeholder.svg' }
        });
        fixedCount++;
        continue;
      }

      const imagePath = path.join(publicRoot, recipe.imageUrl.replace(/^\//, ''));
      if (!fs.existsSync(imagePath)) {
        console.log(`⚠️  Image file missing: ${recipe.imageUrl} for ${meal.slug}`);
        
        // Try alternative paths
        const alternatives = [
          // Try without _optimized folder
          recipe.imageUrl.replace('/_optimized/', '/'),
          // Try with different extensions
          recipe.imageUrl.replace('.webp', '.jpg'),
          recipe.imageUrl.replace('.webp', '.png'),
          recipe.imageUrl.replace('.webp', '.jpeg'),
          // Try in different folders
          `/Bilder_basic/${path.basename(recipe.imageUrl)}`,
          `/Bilder_flow/${path.basename(recipe.imageUrl)}`,
          `/kurser/bilder/${path.basename(recipe.imageUrl)}`,
          // Placeholder as last resort
          '/images/recipe-placeholder.svg'
        ];

        let fixed = false;
        for (const altPath of alternatives) {
          const fullAltPath = path.join(publicRoot, altPath.replace(/^\//, ''));
          if (fs.existsSync(fullAltPath)) {
            await prisma.recipe.update({
              where: { slug: meal.slug },
              data: { imageUrl: altPath }
            });
            console.log(`✅ Fixed image for ${meal.slug} -> ${altPath}`);
            fixedCount++;
            fixed = true;
            break;
          }
        }

        if (!fixed) {
          missingCount++;
        }
      }
    }

    // Special check for the specific recipe without image
    const noImageRecipe = await prisma.recipe.findUnique({
      where: { slug: 'papayabatar' }
    });

    if (noImageRecipe && !noImageRecipe.imageUrl) {
      await prisma.recipe.update({
        where: { slug: 'papayabatar' },
        data: { imageUrl: '/images/recipe-placeholder.svg' }
      });
      console.log('✅ Fixed papayabatar with placeholder image');
      fixedCount++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Fixed ${fixedCount} missing images`);
    console.log(`❌ Still missing: ${missingCount} recipes`);

    // Verify all recipes now have images
    const stillMissing = await prisma.recipe.count({
      where: {
        OR: [
          { imageUrl: null },
          { imageUrl: '' }
        ]
      }
    });

    console.log(`\n🔍 Recipes without images in DB: ${stillMissing}`);

  } catch (err) {
    console.error('❌ Error fixing thumbnails:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixWeekplanThumbnails();
}

module.exports = { fixWeekplanThumbnails }; 
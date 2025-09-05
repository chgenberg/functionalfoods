const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixMissingThumbnails() {
  try {
    console.log('🔧 Checking for missing thumbnails in meal plans...');

    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const content = fs.readFileSync(mealPlansPath, 'utf8');
    const publicRoot = path.join(process.cwd(), 'public');

    // Extract all recipe links from meal plans
    const linkRegex = /"recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g;
    const recipeLinks = [];
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      recipeLinks.push(match[1]);
    }

    const uniqueLinks = [...new Set(recipeLinks)];
    console.log(`Found ${uniqueLinks.length} unique recipe links in meal plans`);

    // Check which recipes exist and have images
    const recipes = await prisma.recipe.findMany({
      where: {
        slug: { in: uniqueLinks }
      },
      select: {
        slug: true,
        title: true,
        imageUrl: true
      }
    });

    console.log(`${recipes.length} recipes found in database`);

    let missingRecipes = 0;
    let missingImages = 0;
    let foundImages = 0;

    for (const slug of uniqueLinks) {
      const recipe = recipes.find(r => r.slug === slug);
      
      if (!recipe) {
        console.log(`❌ Missing recipe: ${slug}`);
        missingRecipes++;
        continue;
      }

      if (!recipe.imageUrl) {
        console.log(`❌ No image URL for: ${slug}`);
        missingImages++;
        continue;
      }

      const imagePath = path.join(publicRoot, recipe.imageUrl.replace(/^\//, ''));
      if (!fs.existsSync(imagePath)) {
        console.log(`❌ Image file missing: ${recipe.imageUrl} (${slug})`);
        missingImages++;
      } else {
        foundImages++;
      }
    }

    console.log('\n📊 Thumbnail Status:');
    console.log(`✅ Recipes with working images: ${foundImages}`);
    console.log(`❌ Missing recipes: ${missingRecipes}`);
    console.log(`❌ Missing/broken images: ${missingImages}`);

    // Check for placeholder images that might be used as fallbacks
    const placeholderPath = path.join(publicRoot, 'images', 'recipe-placeholder.svg');
    const blogPlaceholderPath = path.join(publicRoot, 'images', 'blog-placeholder.jpg');
    
    console.log('\n🔍 Checking fallback images:');
    console.log(`Recipe placeholder exists: ${fs.existsSync(placeholderPath)}`);
    console.log(`Blog placeholder exists: ${fs.existsSync(blogPlaceholderPath)}`);

    // If we have many missing images, suggest using recipe-placeholder as fallback
    if (missingImages > 0) {
      console.log('\n💡 Suggestion: Update recipes with missing images to use placeholder');
      
      const recipesNeedingPlaceholder = recipes.filter(r => {
        if (!r.imageUrl) return true;
        const imagePath = path.join(publicRoot, r.imageUrl.replace(/^\//, ''));
        return !fs.existsSync(imagePath);
      });

      if (recipesNeedingPlaceholder.length > 0) {
        console.log(`Would update ${recipesNeedingPlaceholder.length} recipes to use placeholder`);
        
        // Uncomment to actually apply the fix:
        /*
        for (const recipe of recipesNeedingPlaceholder) {
          await prisma.recipe.update({
            where: { slug: recipe.slug },
            data: { imageUrl: '/images/recipe-placeholder.svg' }
          });
        }
        console.log(`✅ Updated ${recipesNeedingPlaceholder.length} recipes to use placeholder image`);
        */
      }
    }

  } catch (err) {
    console.error('❌ Error checking thumbnails:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixMissingThumbnails();
}

module.exports = { fixMissingThumbnails }; 
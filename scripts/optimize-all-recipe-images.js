const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
let sharp;
try { sharp = require('sharp'); } catch (e) { sharp = null; }

const prisma = new PrismaClient();

async function optimizeAllRecipeImages() {
  try {
    if (!sharp) {
      console.log('⚠️  Sharp not available, cannot optimize images');
      return;
    }

    console.log('🔧 Optimizing all recipe images for thumbnails...');

    const publicRoot = path.join(process.cwd(), 'public');
    
    // Get all recipes with images
    const recipes = await prisma.recipe.findMany({
      where: {
        imageUrl: { not: null },
        imageUrl: { not: '' }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        imageUrl: true
      }
    });

    console.log(`Found ${recipes.length} recipes with images`);

    let optimized = 0;
    let errors = 0;

    for (const recipe of recipes) {
      try {
        const originalPath = path.join(publicRoot, recipe.imageUrl.replace(/^\//, ''));
        
        // Skip if doesn't exist
        if (!fs.existsSync(originalPath)) {
          console.log(`⚠️  Missing: ${recipe.imageUrl}`);
          continue;
        }

        // Skip if already optimized
        if (originalPath.includes('/_optimized/') && originalPath.endsWith('.webp')) {
          continue;
        }

        // Create optimized directory
        const dir = path.dirname(originalPath);
        const filename = path.basename(originalPath);
        const nameWithoutExt = path.basename(filename, path.extname(filename));
        const optimizedDir = path.join(dir, '_optimized');
        const optimizedPath = path.join(optimizedDir, `${nameWithoutExt}.webp`);

        // Create directory if doesn't exist
        await fsp.mkdir(optimizedDir, { recursive: true });

        // Process image
        const image = sharp(originalPath);
        const metadata = await image.metadata();

        // Create optimized version with proper orientation
        await image
          .rotate() // Auto-rotate based on EXIF
          .resize(800, 800, { 
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toFile(optimizedPath);

        // Update recipe with optimized image path
        const newImageUrl = '/' + path.relative(publicRoot, optimizedPath).replace(/\\/g, '/');
        
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: { imageUrl: newImageUrl }
        });

        optimized++;
        console.log(`✅ Optimized: ${recipe.slug} -> ${newImageUrl}`);

        if (optimized % 20 === 0) {
          console.log(`Progress: ${optimized}/${recipes.length}`);
        }

      } catch (err) {
        console.error(`❌ Error with ${recipe.slug}:`, err.message);
        errors++;
      }
    }

    console.log(`\n✅ Optimized ${optimized} images`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} errors occurred`);
    }

    // Final check for any recipes still without working images
    const stillBroken = [];
    for (const recipe of recipes) {
      const updatedRecipe = await prisma.recipe.findUnique({
        where: { id: recipe.id },
        select: { imageUrl: true }
      });
      
      if (updatedRecipe?.imageUrl) {
        const imagePath = path.join(publicRoot, updatedRecipe.imageUrl.replace(/^\//, ''));
        if (!fs.existsSync(imagePath)) {
          stillBroken.push(recipe.slug);
        }
      }
    }

    if (stillBroken.length > 0) {
      console.log(`\n⚠️  Still ${stillBroken.length} recipes with broken images:`);
      stillBroken.forEach(slug => console.log(`- ${slug}`));
    }

  } catch (err) {
    console.error('❌ Error optimizing images:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  optimizeAllRecipeImages();
}

module.exports = { optimizeAllRecipeImages }; 
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
let sharp;
try { sharp = require('sharp'); } catch (e) { sharp = null; }

const prisma = new PrismaClient();

async function fixImageRotation() {
  try {
    if (!sharp) {
      console.log('⚠️  Sharp not available, skipping image rotation fix');
      return;
    }

    console.log('🔧 Fixing image rotation issues...');

    const publicRoot = path.join(process.cwd(), 'public');
    
    // Get all recipes with images
    const recipesWithImages = await prisma.recipe.findMany({
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

    console.log(`Found ${recipesWithImages.length} recipes with images`);

    let fixed = 0;
    let errors = 0;

    for (const recipe of recipesWithImages) {
      try {
        const imageUrl = recipe.imageUrl;
        if (!imageUrl || !imageUrl.startsWith('/')) continue;

        const imagePath = path.join(publicRoot, imageUrl.replace(/^\//, ''));
        
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
          console.log(`⚠️  Image not found: ${imagePath}`);
          continue;
        }

        // Check if it's already optimized webp (likely already processed)
        if (imagePath.includes('/_optimized/') && imagePath.endsWith('.webp')) {
          continue; // Skip already optimized images
        }

        // Process image with auto-orientation
        const image = sharp(imagePath);
        const metadata = await image.metadata();

        // Only process if there's EXIF orientation data
        if (metadata.orientation && metadata.orientation !== 1) {
          console.log(`Fixing orientation for: ${recipe.slug} (orientation: ${metadata.orientation})`);
          
          // Create backup of original if it doesn't exist
          const backupPath = imagePath.replace(/(\.[^.]+)$/, '.backup$1');
          if (!fs.existsSync(backupPath)) {
            await fsp.copyFile(imagePath, backupPath);
          }

          // Apply auto-orientation and save
          await image
            .rotate() // This applies EXIF rotation automatically
            .jpeg({ quality: 85 }) // Maintain good quality
            .toFile(imagePath + '.tmp');

          // Replace original with corrected version
          await fsp.rename(imagePath + '.tmp', imagePath);
          fixed++;

          if (fixed % 10 === 0) {
            console.log(`Fixed ${fixed} images so far...`);
          }
        }

      } catch (err) {
        console.error(`Error processing ${recipe.slug}:`, err.message);
        errors++;
      }
    }

    console.log(`\n✅ Fixed rotation for ${fixed} images`);
    if (errors > 0) {
      console.log(`⚠️  ${errors} images had errors during processing`);
    }

  } catch (err) {
    console.error('❌ Error fixing image rotation:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixImageRotation();
}

module.exports = { fixImageRotation }; 
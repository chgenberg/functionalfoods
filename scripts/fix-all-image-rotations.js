const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
let sharp;
try { sharp = require('sharp'); } catch (e) { sharp = null; }

const prisma = new PrismaClient();

async function fixAllImageRotations() {
  try {
    if (!sharp) {
      console.log('⚠️  Sharp not available, cannot fix image rotation');
      return;
    }

    console.log('🔧 Fixing ALL image rotation issues (including thumbnails)...');

    const publicRoot = path.join(process.cwd(), 'public');
    
    // Get all image paths from all directories
    const imageDirs = [
      'Recept_complete2.0/images',
      'kurser/bilder',
      'Bilder_basic',
      'Bilder_flow',
      'scraped_content_basic',
      'scraped_pages_basic'
    ];

    let totalProcessed = 0;
    let totalFixed = 0;

    for (const dir of imageDirs) {
      const fullDir = path.join(publicRoot, dir);
      if (!fs.existsSync(fullDir)) {
        console.log(`⏭️  Skipping non-existent directory: ${dir}`);
        continue;
      }

      console.log(`\n📁 Processing directory: ${dir}`);
      const files = await getAllImageFiles(fullDir);
      
      for (const filePath of files) {
        try {
          // Skip if it's already optimized webp
          if (filePath.includes('_optimized') && filePath.endsWith('.webp')) {
            continue;
          }

          const image = sharp(filePath);
          const metadata = await image.metadata();
          
          // Process any image that might have orientation issues
          // This includes checking width/height ratio for portrait images
          const isLikelyPortrait = metadata.height > metadata.width * 1.2;
          const hasOrientationIssue = metadata.orientation && metadata.orientation !== 1;
          
          if (hasOrientationIssue || isLikelyPortrait) {
            console.log(`🔄 Processing: ${path.basename(filePath)} (${metadata.width}x${metadata.height}, orientation: ${metadata.orientation || 'none'})`);
            
            // Create backup
            const backupPath = filePath.replace(/(\.[^.]+)$/, '.backup$1');
            if (!fs.existsSync(backupPath)) {
              await fsp.copyFile(filePath, backupPath);
            }

            // Create properly oriented version
            const buffer = await image
              .rotate() // Auto-rotate based on EXIF
              .withMetadata({ orientation: 1 }) // Reset orientation
              .jpeg({ quality: 90, progressive: true })
              .toBuffer();

            await fsp.writeFile(filePath, buffer);
            totalFixed++;
          }

          totalProcessed++;
          if (totalProcessed % 50 === 0) {
            console.log(`  Processed ${totalProcessed} images...`);
          }

        } catch (err) {
          console.error(`❌ Error processing ${filePath}:`, err.message);
        }
      }
    }

    // Also fix recipe images specifically
    console.log('\n🍽️  Checking recipe images in database...');
    const recipesWithImages = await prisma.recipe.findMany({
      where: {
        imageUrl: { not: null },
        imageUrl: { not: '' }
      },
      select: {
        id: true,
        slug: true,
        imageUrl: true
      }
    });

    for (const recipe of recipesWithImages) {
      const imagePath = path.join(publicRoot, recipe.imageUrl.replace(/^\//, ''));
      
      if (!fs.existsSync(imagePath)) {
        console.log(`⚠️  Missing image for ${recipe.slug}: ${recipe.imageUrl}`);
        
        // Try to find a replacement
        const possiblePaths = [
          imagePath.replace('_optimized/', ''), // Original without optimized
          imagePath.replace('.webp', '.jpg'), // Try jpg instead
          imagePath.replace('.webp', '.png'), // Try png instead
          '/images/recipe-placeholder.svg' // Fallback
        ];

        for (const tryPath of possiblePaths) {
          const fullTryPath = tryPath.startsWith('/') ? 
            path.join(publicRoot, tryPath.replace(/^\//, '')) : 
            tryPath;
            
          if (fs.existsSync(fullTryPath)) {
            const newUrl = tryPath.startsWith('/') ? tryPath : 
              '/' + path.relative(publicRoot, fullTryPath).replace(/\\/g, '/');
              
            await prisma.recipe.update({
              where: { id: recipe.id },
              data: { imageUrl: newUrl }
            });
            console.log(`✅ Fixed missing image for ${recipe.slug} -> ${newUrl}`);
            break;
          }
        }
      }
    }

    console.log(`\n✅ Processed ${totalProcessed} images total`);
    console.log(`🔄 Fixed orientation for ${totalFixed} images`);

  } catch (err) {
    console.error('❌ Error fixing image rotations:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function getAllImageFiles(dir) {
  const files = [];
  
  async function walk(currentDir) {
    const entries = await fsp.readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (/\.(jpg|jpeg|png|webp)$/i.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }
  
  await walk(dir);
  return files;
}

if (require.main === module) {
  fixAllImageRotations();
}

module.exports = { fixAllImageRotations }; 
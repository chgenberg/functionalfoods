const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function processImage(imagePath) {
  try {
    const buffer = fs.readFileSync(imagePath);
    
    // Get image metadata
    const metadata = await sharp(buffer).metadata();
    
    let needsRotation = false;
    let rotationAngle = 0;
    
    // Check EXIF orientation
    if (metadata.orientation && metadata.orientation !== 1) {
      needsRotation = true;
      console.log(`📷 ${path.basename(imagePath)}: EXIF orientation ${metadata.orientation}`);
    }
    
    // Also check if image is likely rotated based on dimensions
    if (metadata.width && metadata.height) {
      const aspectRatio = metadata.width / metadata.height;
      // If image is very wide (likely rotated portrait), rotate it
      if (aspectRatio > 1.5 && metadata.height > metadata.width * 0.8) {
        needsRotation = true;
        rotationAngle = -90; // Rotate counterclockwise
        console.log(`📐 ${path.basename(imagePath)}: Aspect ratio suggests rotation needed`);
      }
    }
    
    if (needsRotation) {
      // Create backup
      const backupPath = imagePath.replace('.webp', '.backup.webp');
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(imagePath, backupPath);
      }
      
      // Process image with sharp
      let sharpInstance = sharp(buffer);
      
      // Auto-rotate based on EXIF, or manual rotation
      if (metadata.orientation && metadata.orientation !== 1) {
        sharpInstance = sharpInstance.rotate(); // Auto-rotate based on EXIF
      } else if (rotationAngle !== 0) {
        sharpInstance = sharpInstance.rotate(rotationAngle);
      }
      
      // Ensure image is properly oriented and optimized
      const processedBuffer = await sharpInstance
        .webp({ quality: 85 })
        .toBuffer();
      
      fs.writeFileSync(imagePath, processedBuffer);
      console.log(`✅ Fixed orientation: ${path.basename(imagePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${imagePath}:`, error.message);
    return false;
  }
}

async function fixAllImageOrientations() {
  try {
    console.log('🔄 Starting image orientation fix...');
    
    const imageDirectories = [
      'public/Recept_complete2.0/images/_optimized',
      'public/Recept_complete/images/_optimized',
      'public/Bilder_basic/_optimized',
      'public/Bilder_flow/_optimized'
    ];
    
    let totalProcessed = 0;
    let totalFixed = 0;
    
    for (const dir of imageDirectories) {
      if (!fs.existsSync(dir)) {
        console.log(`⚠️  Directory not found: ${dir}`);
        continue;
      }
      
      console.log(`\n📁 Processing directory: ${dir}`);
      const files = fs.readdirSync(dir);
      const webpFiles = files.filter(file => file.endsWith('.webp') && !file.includes('.backup'));
      
      console.log(`Found ${webpFiles.length} webp files`);
      
      for (const file of webpFiles) {
        const filePath = path.join(dir, file);
        totalProcessed++;
        
        const wasFixed = await processImage(filePath);
        if (wasFixed) {
          totalFixed++;
        }
        
        // Progress update
        if (totalProcessed % 50 === 0) {
          console.log(`Progress: ${totalProcessed} images processed, ${totalFixed} fixed`);
        }
      }
    }
    
    console.log('\n🎉 Image orientation fix complete!');
    console.log(`📊 Total images processed: ${totalProcessed}`);
    console.log(`🔧 Total images fixed: ${totalFixed}`);
    
    // Update any recipes that might have missing images
    console.log('\n🔍 Checking for recipes with missing images...');
    const recipes = await prisma.recipe.findMany({
      where: {
        imageUrl: {
          not: null
        }
      },
      select: {
        id: true,
        title: true,
        imageUrl: true
      }
    });
    
    let missingImages = 0;
    for (const recipe of recipes) {
      if (recipe.imageUrl) {
        const fullPath = path.join('public', recipe.imageUrl);
        if (!fs.existsSync(fullPath)) {
          console.log(`❌ Missing image: ${recipe.title} -> ${recipe.imageUrl}`);
          missingImages++;
        }
      }
    }
    
    console.log(`📋 Recipes checked: ${recipes.length}`);
    console.log(`❌ Missing images: ${missingImages}`);
    
  } catch (error) {
    console.error('❌ Error in fixAllImageOrientations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixAllImageOrientations();
}

module.exports = { fixAllImageOrientations }; 
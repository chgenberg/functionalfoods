/*
  Fix image rotation issues in existing optimized images
  This script recreates all images with proper EXIF orientation handling
  Run with: node scripts/fix-image-rotation.js
  
  NO OPENAI API COSTS - just uses Sharp for image processing
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(process.cwd(), 'recept_images_2025');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'recept_images_vision_optimized');

// Target formats for different use cases
const formats = {
  'card': { width: 800, height: 600, ratio: '4:3 landscape', usage: 'recipe cards and carousel' },
  'detail': { width: 600, height: 800, ratio: '3:4 portrait', usage: 'recipe detail pages' },
  'thumb': { width: 400, height: 400, ratio: '1:1 square', usage: 'thumbnails and lists' }
};

function slugifyFilename(filename) {
  const nameWithoutExt = path.parse(filename).name;
  return nameWithoutExt
    .replace(/[ÅÄåä]/g, 'a')
    .replace(/[Öö]/g, 'o')
    .replace(/[Üü]/g, 'u')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

async function createOptimizedImageWithRotation(inputPath, outputPath, format, quality = 80) {
  try {
    const image = sharp(inputPath);
    
    // CRITICAL: Auto-rotate based on EXIF orientation FIRST
    // This ensures images are correctly oriented before resizing
    const rotatedImage = image.rotate();
    
    // Use center crop as default (works well for most food images)
    await rotatedImage
      .resize(format.width, format.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: quality })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    return { success: true, size: stats.size };
    
  } catch (error) {
    console.error(`Error creating optimized image:`, error.message);
    return { success: false, error: error.message };
  }
}

async function processImage(inputPath, recipeName) {
  try {
    const outputBaseName = slugifyFilename(path.parse(inputPath).name);
    const results = [];
    
    console.log(`\n🍽️ Processing: ${recipeName}`);
    
    // Create each format with proper rotation
    for (const [formatName, formatConfig] of Object.entries(formats)) {
      const outputPath = path.join(OUTPUT_DIR, `${outputBaseName}-${formatName}.webp`);
      
      const result = await createOptimizedImageWithRotation(
        inputPath, 
        outputPath, 
        formatConfig,
        formatName === 'thumb' ? 85 : 80 // Higher quality for thumbnails
      );
      
      if (result.success) {
        console.log(`  ✅ ${formatName} (${formatConfig.ratio}): ${(result.size / 1024).toFixed(0)}KB`);
        results.push({ format: formatName, success: true, size: result.size });
      } else {
        console.log(`  ❌ ${formatName}: ${result.error}`);
        results.push({ format: formatName, success: false });
      }
    }
    
    return { results };
    
  } catch (error) {
    console.error(`❌ Failed to process ${inputPath}:`, error.message);
    return { error: error.message };
  }
}

async function main() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error('❌ Input directory not found:', INPUT_DIR);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get all image files
  const imageFiles = fs.readdirSync(INPUT_DIR)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
    .sort();

  console.log(`🔧 Fixing rotation for ${imageFiles.length} images...`);
  console.log(`📁 Input: ${INPUT_DIR}`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);

  let processedCount = 0;
  let successCount = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(INPUT_DIR, file);
    const recipeName = path.parse(file).name;
    
    const result = await processImage(inputPath, recipeName);
    processedCount++;
    
    if (!result.error) {
      const successfulFormats = result.results.filter(r => r.success).length;
      if (successfulFormats === 3) {
        successCount++;
      }
    }
    
    // Progress indicator
    if (processedCount % 10 === 0) {
      console.log(`\n📊 Progress: ${processedCount}/${imageFiles.length} images processed`);
    }
    
    // Small delay to prevent overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n🎉 Image rotation fix complete!');
  console.log(`✅ Successfully processed: ${successCount}/${imageFiles.length} images`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}`);
  console.log('\n💡 All images now have proper orientation and should display correctly in the carousel!');
}

// Check dependencies
try {
  require('sharp');
  main().catch(console.error);
} catch (error) {
  console.error('Missing dependencies. Please run: npm install sharp');
  process.exit(1);
} 
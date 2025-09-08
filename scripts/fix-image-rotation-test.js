/*
  Fix image rotation issues by properly handling EXIF orientation
  Test version - processes just a few images
  Run with: node scripts/fix-image-rotation-test.js
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(process.cwd(), 'recept_images_2025');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'recept_images_vision_test_fixed');

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

async function createOptimizedImageWithRotation(inputPath, outputPath, format, cropPosition = 'center', quality = 8) {
  try {
    console.log(`🔧 Processing: ${path.basename(inputPath)} -> ${format.width}x${format.height} (${cropPosition})`);
    
    const image = sharp(inputPath);
    
    // Get image metadata to check orientation
    const metadata = await image.metadata();
    console.log(`   📏 Original: ${metadata.width}x${metadata.height}, orientation: ${metadata.orientation || 'none'}`);
    
    // CRITICAL: Auto-rotate based on EXIF orientation FIRST
    const rotatedImage = image.rotate();
    
    // Get metadata after rotation to verify
    const rotatedMetadata = await rotatedImage.metadata();
    console.log(`   🔄 After rotation: ${rotatedMetadata.width}x${rotatedMetadata.height}`);
    
    // Convert crop position to Sharp position
    let position = 'center';
    switch (cropPosition) {
      case 'top': position = 'top'; break;
      case 'bottom': position = 'bottom'; break;
      case 'left': position = 'left'; break;
      case 'right': position = 'right'; break;
      default: position = 'center'; break;
    }
    
    // Resize and optimize
    await rotatedImage
      .resize(format.width, format.height, {
        fit: 'cover',
        position: position
      })
      .webp({ 
        quality: Math.round(quality * 9 + 10),
        effort: 6  // Better compression
      })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    console.log(`   ✅ Created: ${(stats.size / 1024).toFixed(0)}KB`);
    
    return { success: true, size: stats.size };
    
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function processImage(inputPath, recipeName) {
  try {
    const outputBaseName = slugifyFilename(path.parse(inputPath).name);
    
    console.log(`\n🍽️ Processing: ${recipeName}`);
    
    const results = [];
    
    // Create each format
    for (const [formatName, formatConfig] of Object.entries(formats)) {
      const outputPath = path.join(OUTPUT_DIR, `${outputBaseName}-${formatName}.webp`);
      
      const result = await createOptimizedImageWithRotation(
        inputPath, 
        outputPath, 
        formatConfig, 
        'center',  // Use center crop for testing
        8  // Good quality
      );
      
      if (result.success) {
        results.push({ format: formatName, success: true, size: result.size });
      } else {
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

  // Test with the same 3 images as before
  const testFiles = [
    'Het ratatouille.jpg',
    'Spenat och gronkal med agg.jpg', 
    'Yoghurt med ketomusli.jpg'
  ].filter(f => fs.existsSync(path.join(INPUT_DIR, f)));

  console.log(`🔧 Testing rotation fix on ${testFiles.length} images...\n`);

  for (const file of testFiles) {
    const inputPath = path.join(INPUT_DIR, file);
    const recipeName = path.parse(file).name;
    
    const result = await processImage(inputPath, recipeName);
    
    if (!result.error) {
      console.log(`✅ Successfully processed ${recipeName}`);
    }
  }
  
  console.log('\n🔧 Rotation fix test complete! Check output in:', OUTPUT_DIR);
  console.log('\n💡 If these look correct, run the full processing script.');
}

// Check dependencies
try {
  require('sharp');
  main().catch(console.error);
} catch (error) {
  console.error('Missing dependencies. Please run: npm install sharp');
  process.exit(1);
} 
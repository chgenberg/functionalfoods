/*
  Optimize recipe images from recept_images_2025 folder
  Run with: node scripts/optimize-recipe-images.js
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(process.cwd(), 'recept_images_2025');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'recept_images_optimized');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Image size configurations
const sizes = {
  small: { width: 400, height: 300, quality: 80 },
  medium: { width: 800, height: 600, quality: 85 },
  large: { width: 1200, height: 900, quality: 90 }
};

function slugifyFilename(filename) {
  const nameWithoutExt = path.parse(filename).name;
  return nameWithoutExt
    .replace(/[ÅÄåä]/g, 'a')
    .replace(/[Öö]/g, 'o')
    .replace(/[Üü]/g, 'u')
    .replace(/[ÉéÈèÊêËë]/g, 'e')
    .replace(/[ÁáÀàÂâÄä]/g, 'a')
    .replace(/[ÍíÌìÎîÏï]/g, 'i')
    .replace(/[ÓóÒòÔôÖö]/g, 'o')
    .replace(/[ÚúÙùÛûÜü]/g, 'u')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

async function optimizeImage(inputPath, outputPath, size) {
  try {
    await sharp(inputPath)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: size.quality })
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    return { success: true, size: stats.size };
  } catch (error) {
    console.error(`Error optimizing ${inputPath}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function processImages() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error('Input directory not found:', INPUT_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .sort();

  console.log(`Found ${files.length} images to optimize...`);

  const results = {
    processed: 0,
    errors: 0,
    totalSaved: 0
  };

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const slugName = slugifyFilename(file);
    
    console.log(`\nProcessing: ${file} -> ${slugName}`);
    
    const originalStats = fs.statSync(inputPath);
    console.log(`  Original size: ${(originalStats.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Process each size
    for (const [sizeName, sizeConfig] of Object.entries(sizes)) {
      const outputPath = path.join(OUTPUT_DIR, `${slugName}-${sizeName}.webp`);
      const result = await optimizeImage(inputPath, outputPath, sizeConfig);
      
      if (result.success) {
        const savedBytes = originalStats.size - result.size;
        results.totalSaved += savedBytes;
        console.log(`  ${sizeName}: ${(result.size / 1024 / 1024).toFixed(2)} MB (saved ${(savedBytes / 1024 / 1024).toFixed(2)} MB)`);
      } else {
        console.log(`  ${sizeName}: ERROR - ${result.error}`);
        results.errors++;
      }
    }
    
    results.processed++;
  }

  console.log('\n=== OPTIMIZATION COMPLETE ===');
  console.log(`Processed: ${results.processed} images`);
  console.log(`Errors: ${results.errors}`);
  console.log(`Total space saved: ${(results.totalSaved / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

// Check if Sharp is available
try {
  require('sharp');
  processImages().catch(console.error);
} catch (error) {
  console.error('Sharp is not installed. Please run: npm install sharp');
  process.exit(1);
} 
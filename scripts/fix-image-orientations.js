/*
  Fix image orientations for recipe images
  Creates both portrait and landscape versions with proper orientation
  Run with: node scripts/fix-image-orientations.js
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const INPUT_DIR = path.join(process.cwd(), 'recept_images_2025');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'recept_images_optimized');

// Image configurations for different use cases
const configs = {
  // For recipe cards and carousel (landscape preferred)
  'card-small': { width: 400, height: 300, quality: 80, fit: 'cover', position: 'center' },
  'card-medium': { width: 800, height: 600, quality: 85, fit: 'cover', position: 'center' },
  'card-large': { width: 1200, height: 900, quality: 90, fit: 'cover', position: 'center' },
  
  // For recipe detail pages (portrait preferred)
  'detail-small': { width: 300, height: 400, quality: 80, fit: 'cover', position: 'center' },
  'detail-medium': { width: 600, height: 800, quality: 85, fit: 'cover', position: 'center' },
  'detail-large': { width: 900, height: 1200, quality: 90, fit: 'cover', position: 'center' },
  
  // Square thumbnails for lists
  'thumb-small': { width: 200, height: 200, quality: 80, fit: 'cover', position: 'center' },
  'thumb-medium': { width: 400, height: 400, quality: 85, fit: 'cover', position: 'center' }
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

async function analyzeAndProcessImage(inputPath, outputBaseName) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    const { width, height } = metadata;
    const isLandscape = width > height;
    const isPortrait = height > width;
    const isSquare = Math.abs(width - height) < Math.min(width, height) * 0.1;
    
    console.log(`📐 ${outputBaseName}: ${width}x${height} (${isLandscape ? 'landscape' : isPortrait ? 'portrait' : 'square'})`);
    
    const results = [];
    
    // Process all configurations
    for (const [configName, config] of Object.entries(configs)) {
      const outputPath = path.join(OUTPUT_DIR, `${outputBaseName}-${configName}.webp`);
      
      try {
        await image
          .resize(config.width, config.height, {
            fit: config.fit,
            position: config.position
          })
          .webp({ quality: config.quality })
          .toFile(outputPath);
        
        const stats = fs.statSync(outputPath);
        results.push({ config: configName, size: stats.size, success: true });
      } catch (error) {
        console.error(`  ❌ Failed to create ${configName}:`, error.message);
        results.push({ config: configName, success: false, error: error.message });
      }
    }
    
    return {
      original: { width, height, orientation: isLandscape ? 'landscape' : isPortrait ? 'portrait' : 'square' },
      results
    };
    
  } catch (error) {
    console.error(`❌ Failed to process ${inputPath}:`, error.message);
    return { error: error.message };
  }
}

async function processAllImages() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error('Input directory not found:', INPUT_DIR);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .sort();

  console.log(`Found ${files.length} images to process with orientation fixes...\n`);

  const stats = {
    processed: 0,
    errors: 0,
    landscape: 0,
    portrait: 0,
    square: 0,
    totalSize: 0
  };

  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputBaseName = slugifyFilename(file);
    
    console.log(`\nProcessing: ${file}`);
    
    const result = await analyzeAndProcessImage(inputPath, outputBaseName);
    
    if (result.error) {
      stats.errors++;
      continue;
    }
    
    // Update stats
    stats.processed++;
    if (result.original.orientation === 'landscape') stats.landscape++;
    else if (result.original.orientation === 'portrait') stats.portrait++;
    else stats.square++;
    
    // Calculate total output size
    const successfulResults = result.results.filter(r => r.success);
    const totalOutputSize = successfulResults.reduce((sum, r) => sum + r.size, 0);
    stats.totalSize += totalOutputSize;
    
    console.log(`  ✅ Created ${successfulResults.length} variants (${(totalOutputSize / 1024 / 1024).toFixed(2)} MB)`);
  }

  console.log('\n=== ORIENTATION FIX COMPLETE ===');
  console.log(`Processed: ${stats.processed} images`);
  console.log(`Errors: ${stats.errors}`);
  console.log(`Landscape: ${stats.landscape}, Portrait: ${stats.portrait}, Square: ${stats.square}`);
  console.log(`Total output size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Configurations created per image: ${Object.keys(configs).length}`);
}

// Check if Sharp is available
try {
  require('sharp');
  processAllImages().catch(console.error);
} catch (error) {
  console.error('Sharp is not installed. Please run: npm install sharp');
  process.exit(1);
} 
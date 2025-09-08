/*
  Use OpenAI Vision to analyze recipe images and create optimal orientations
  Run with: node scripts/vision-optimize-images.js
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const OpenAI = require('openai');

const INPUT_DIR = path.join(process.cwd(), 'recept_images_2025');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'recept_images_vision_optimized');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

async function analyzeImageWithVision(imagePath, recipeName) {
  try {
    // Convert image to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = path.extname(imagePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    
    console.log(`🔍 Analyzing "${recipeName}" with Vision API...`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this recipe image for "${recipeName}". I need to create 3 optimized versions:

1. CARD (800x600, landscape 4:3) - for recipe cards and carousel
2. DETAIL (600x800, portrait 3:4) - for recipe detail pages  
3. THUMB (400x400, square 1:1) - for thumbnails

For each format, determine:
- Best crop position (center, top, bottom, left, right, or specific focus point)
- Whether the image works well for that aspect ratio
- Any special considerations for food photography

Respond with JSON only:
{
  "card": {"crop": "center|top|bottom|left|right", "quality": 1-10, "notes": "brief note"},
  "detail": {"crop": "center|top|bottom|left|right", "quality": 1-10, "notes": "brief note"},
  "thumb": {"crop": "center|top|bottom|left|right", "quality": 1-10, "notes": "brief note"},
  "overall_notes": "brief analysis of the image"
}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ]
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from Vision API');
    }
    
    // Parse JSON response
    let analysis;
    try {
      // Clean up markdown formatting if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      analysis = JSON.parse(cleanContent);
      console.log(`✅ Vision analysis:`, analysis.overall_notes);
    } catch (parseError) {
      console.error(`❌ JSON parse error for ${recipeName}:`, parseError.message);
      // Return default on parse error
      return {
        card: { crop: 'center', quality: 8, notes: 'parse error fallback' },
        detail: { crop: 'center', quality: 8, notes: 'parse error fallback' },
        thumb: { crop: 'center', quality: 7, notes: 'parse error fallback' },
        overall_notes: 'JSON parse failed, using defaults'
      };
    }
    
    return analysis;
    
  } catch (error) {
    console.error(`❌ Vision analysis failed for ${recipeName}:`, error.message);
    // Return default analysis
    return {
      card: { crop: 'center', quality: 7, notes: 'default' },
      detail: { crop: 'center', quality: 7, notes: 'default' },
      thumb: { crop: 'center', quality: 7, notes: 'default' },
      overall_notes: 'Vision analysis failed, using defaults'
    };
  }
}

async function createOptimizedImage(inputPath, outputPath, format, cropPosition, quality) {
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Convert crop position to Sharp position
    let position = 'center';
    switch (cropPosition) {
      case 'top': position = 'top'; break;
      case 'bottom': position = 'bottom'; break;
      case 'left': position = 'left'; break;
      case 'right': position = 'right'; break;
      default: position = 'center'; break;
    }
    
    await image
      .resize(format.width, format.height, {
        fit: 'cover',
        position: position
      })
      .webp({ quality: Math.round(quality * 9 + 10) }) // Convert 1-10 to 19-100
      .toFile(outputPath);
    
    const stats = fs.statSync(outputPath);
    return { success: true, size: stats.size };
    
  } catch (error) {
    console.error(`Error creating optimized image:`, error.message);
    return { success: false, error: error.message };
  }
}

async function processImageWithVision(inputPath, recipeName) {
  try {
    const analysis = await analyzeImageWithVision(inputPath, recipeName);
    const outputBaseName = slugifyFilename(path.parse(inputPath).name);
    
    const results = [];
    
    // Create each format based on Vision analysis
    for (const [formatName, formatConfig] of Object.entries(formats)) {
      const formatAnalysis = analysis[formatName] || { crop: 'center', quality: 7 };
      const outputPath = path.join(OUTPUT_DIR, `${outputBaseName}-${formatName}.webp`);
      
      const result = await createOptimizedImage(
        inputPath, 
        outputPath, 
        formatConfig, 
        formatAnalysis.crop, 
        formatAnalysis.quality
      );
      
      if (result.success) {
        console.log(`  ✅ ${formatName} (${formatConfig.ratio}): ${formatAnalysis.crop} crop, quality ${formatAnalysis.quality} - ${(result.size / 1024).toFixed(0)}KB`);
        results.push({ format: formatName, success: true, size: result.size });
      } else {
        console.log(`  ❌ ${formatName}: ${result.error}`);
        results.push({ format: formatName, success: false });
      }
    }
    
    return { analysis, results };
    
  } catch (error) {
    console.error(`❌ Failed to process ${inputPath}:`, error.message);
    return { error: error.message };
  }
}

async function processAllImages() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  if (!fs.existsSync(INPUT_DIR)) {
    console.error('❌ Input directory not found:', INPUT_DIR);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(INPUT_DIR)
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .sort();

  console.log(`🔍 Starting Vision optimization on ${files.length} images...\n`);
  console.log(`⏱️ Estimated time: ${Math.ceil(files.length * 1.5 / 60)} minutes`);
  console.log(`💰 Estimated cost: $${(files.length * 0.05).toFixed(2)}\n`);

  const stats = {
    processed: 0,
    errors: 0,
    totalSize: 0,
    visionCalls: 0
  };

  // Process in smaller batches to respect API rate limits
  const batchSize = 3;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    console.log(`\n📦 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)} (${i + 1}-${Math.min(i + batchSize, files.length)}/${files.length})`);
    
    for (const file of batch) {
      const inputPath = path.join(INPUT_DIR, file);
      const recipeName = path.parse(file).name;
      
      console.log(`\n🍽️ ${recipeName}`);
      
      const result = await processImageWithVision(inputPath, recipeName);
      
      if (result.error) {
        stats.errors++;
        continue;
      }
      
      stats.processed++;
      stats.visionCalls++;
      
      const successfulResults = result.results?.filter(r => r.success) || [];
      const totalOutputSize = successfulResults.reduce((sum, r) => sum + (r.size || 0), 0);
      stats.totalSize += totalOutputSize;
      
      console.log(`  📊 Total: ${(totalOutputSize / 1024).toFixed(0)}KB for ${successfulResults.length} formats`);
      
      // Delay between images to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Longer delay between batches
    if (i + batchSize < files.length) {
      console.log(`\n⏳ Waiting 10s between batches... (${Math.ceil((files.length - i - batchSize) * 1.5 / 60)} min remaining)`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  console.log('\n=== VISION OPTIMIZATION COMPLETE ===');
  console.log(`✅ Processed: ${stats.processed} images`);
  console.log(`❌ Errors: ${stats.errors}`);
  console.log(`🔍 Vision API calls: ${stats.visionCalls}`);
  console.log(`📁 Total output size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`💾 Output directory: ${OUTPUT_DIR}`);
  console.log(`\n🎯 Next step: Update batch-images API to use vision-optimized images!`);
}

// Check dependencies
try {
  require('sharp');
  require('openai');
  processAllImages().catch(console.error);
} catch (error) {
  console.error('Missing dependencies. Please run: npm install sharp openai');
  process.exit(1);
} 
/*
  Test Vision optimization on just 3 images
  Run with: node scripts/vision-test-3-images.js
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const OpenAI = require('openai');

const INPUT_DIR = path.join(process.cwd(), 'recept_images_2025');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'recept_images_vision_test');

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
              text: `Analyze this Swedish recipe image for "${recipeName}". I need to create 3 optimized versions for a food website:

1. CARD (800x600, landscape 4:3) - for recipe cards and carousel
2. DETAIL (600x800, portrait 3:4) - for recipe detail pages  
3. THUMB (400x400, square 1:1) - for thumbnails

For each format, determine the best crop position to showcase the food attractively. Consider:
- Where the main dish/food is positioned
- What should be the focal point
- How to avoid cutting off important visual elements

Respond with JSON only:
{
  "card": {"crop": "center|top|bottom|left|right", "quality": 1-10, "notes": "brief note about why this crop works"},
  "detail": {"crop": "center|top|bottom|left|right", "quality": 1-10, "notes": "brief note about why this crop works"},
  "thumb": {"crop": "center|top|bottom|left|right", "quality": 1-10, "notes": "brief note about why this crop works"},
  "overall_notes": "brief analysis of what's in the image and main focal points"
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
      console.error(`❌ JSON parse error:`, parseError.message);
      console.log(`Raw content:`, content);
      throw parseError;
    }
    
    return analysis;
    
  } catch (error) {
    console.error(`❌ Vision analysis failed for ${recipeName}:`, error.message);
    // Return default analysis
    return {
      card: { crop: 'center', quality: 7, notes: 'default fallback' },
      detail: { crop: 'center', quality: 7, notes: 'default fallback' },
      thumb: { crop: 'center', quality: 7, notes: 'default fallback' },
      overall_notes: 'Vision analysis failed, using defaults'
    };
  }
}

async function createOptimizedImage(inputPath, outputPath, format, cropPosition, quality) {
  try {
    const image = sharp(inputPath);
    
    // IMPORTANT: Auto-rotate based on EXIF orientation FIRST
    await image.rotate();
    
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
      .webp({ quality: Math.round(quality * 9 + 10) })
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
        console.log(`     💡 ${formatAnalysis.notes}`);
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

async function main() {
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

  // Test with just 3 images
  const testFiles = [
    'Het ratatouille.jpg',
    'Spenat och gronkal med agg.jpg', 
    'Yoghurt med ketomusli.jpg'
  ].filter(f => fs.existsSync(path.join(INPUT_DIR, f)));

  console.log(`🧪 Testing Vision API on ${testFiles.length} images...\n`);

  for (const file of testFiles) {
    const inputPath = path.join(INPUT_DIR, file);
    const recipeName = path.parse(file).name;
    
    console.log(`\n🍽️ Testing: ${recipeName}`);
    
    const result = await processImageWithVision(inputPath, recipeName);
    
    if (!result.error) {
      console.log(`✅ Successfully processed ${recipeName}`);
    }
    
    // Wait between images
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🧪 Vision test complete! Check output in:', OUTPUT_DIR);
}

// Check dependencies
try {
  require('sharp');
  require('openai');
  main().catch(console.error);
} catch (error) {
  console.error('Missing dependencies. Please run: npm install sharp openai');
  process.exit(1);
} 
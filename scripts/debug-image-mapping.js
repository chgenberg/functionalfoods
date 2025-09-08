/*
  Debug script to test image mapping logic
  Run with: node scripts/debug-image-mapping.js
*/
const fs = require('fs');
const path = require('path');

// Copy the functions from batch-images API
function normalizeSwedish(text) {
  return text
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRecipeName(mealName) {
  return mealName.replace(/\s+rester$/, '').replace(/\s+\(.*\)$/, '').trim();
}

function imageToOptimizedUrl(imageName, size = 'medium', usage = 'card') {
  const slugified = imageName
    .replace(/[ÅÄåä]/g, 'a')
    .replace(/[Öö]/g, 'o')
    .replace(/[Üü]/g, 'u')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  
  // Try Vision-optimized first
  const visionPath = path.join(process.cwd(), 'public', 'recept_images_vision_optimized', `${slugified}-${usage}.webp`);
  if (fs.existsSync(visionPath)) {
    return `/api/images/recept_images_vision_optimized/${slugified}-${usage}.webp`;
  }
  
  return null;
}

function getAvailableImages() {
  try {
    const visionDir = path.join(process.cwd(), 'public', 'recept_images_vision_optimized');
    
    if (fs.existsSync(visionDir)) {
      const files = fs.readdirSync(visionDir);
      const visionNames = files
        .filter(f => f.endsWith('-card.webp'))
        .map(f => f.replace('-card.webp', ''))
        .map(f => f.replace(/-/g, ' '));
      
      console.log(`📁 Found ${visionNames.length} Vision-optimized images`);
      return visionNames;
    }
    
    return [];
  } catch (error) {
    console.warn('Could not read images directory:', error);
    return [];
  }
}

function findBestImageMatch(recipeName, availableImages, size = 'medium', usage = 'card') {
  const normalized = normalizeSwedish(recipeName);
  
  console.log(`\n🔍 Looking for: "${recipeName}" (normalized: "${normalized}")`);
  
  // 1. Exact match
  let match = availableImages.find(img => normalizeSwedish(img) === normalized);
  if (match) {
    console.log(`✅ Exact match: "${match}"`);
    return imageToOptimizedUrl(match, size, usage);
  }
  
  // 2. Contains match (both directions)
  match = availableImages.find(img => {
    const normalizedImg = normalizeSwedish(img);
    return normalizedImg.includes(normalized) || normalized.includes(normalizedImg);
  });
  if (match) {
    console.log(`✅ Contains match: "${match}"`);
    return imageToOptimizedUrl(match, size, usage);
  }
  
  // 3. Word-based matching
  const recipeWords = normalized.split(/\s+/).filter(w => w.length > 2);
  console.log(`🔤 Recipe words: [${recipeWords.join(', ')}]`);
  
  if (recipeWords.length > 0) {
    match = availableImages.find(img => {
      const imgWords = normalizeSwedish(img).split(/\s+/);
      const matchedWords = recipeWords.filter(rw => 
        imgWords.some(iw => iw.includes(rw) || rw.includes(iw))
      );
      
      if (matchedWords.length >= Math.min(2, recipeWords.length)) {
        console.log(`✅ Word match: "${img}" (matched words: [${matchedWords.join(', ')}])`);
        return true;
      }
      return false;
    });
    if (match) return imageToOptimizedUrl(match, size, usage);
  }
  
  console.log(`❌ No match found`);
  return null;
}

async function main() {
  console.log('🧪 Debug: Testing image mapping logic\n');
  
  // Get available images
  const availableImages = getAvailableImages();
  
  // Test with some common recipe names from carousel
  const testRecipes = [
    'Het ratatouille',
    'Spenat och grönkål med ägg',
    'Yoghurt med ketomusli',
    'Keso med granola och fruktsallad',
    'Bananplättar med keso och hallon',
    'Ägg i paprika',
    'Ägghack i salladsblad',
    'Kycklingsallad med avokado'
  ];
  
  console.log('🔍 Testing with common recipe names:\n');
  
  for (const recipe of testRecipes) {
    const result = findBestImageMatch(recipe, availableImages, 'medium', 'card');
    console.log(`Result: ${result || 'No match'}`);
  }
  
  // Show some available images for reference
  console.log('\n📁 Sample available images:');
  availableImages.slice(0, 10).forEach(img => {
    console.log(`   - "${img}"`);
  });
  
  if (availableImages.length > 10) {
    console.log(`   ... and ${availableImages.length - 10} more`);
  }
}

main().catch(console.error); 
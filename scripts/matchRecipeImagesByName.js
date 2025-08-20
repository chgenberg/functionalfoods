const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Function to normalize strings for comparison
function normalizeString(str) {
  return str
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9]/g, '');
}

// Function to calculate string similarity
function similarity(str1, str2) {
  const norm1 = normalizeString(str1);
  const norm2 = normalizeString(str2);
  
  if (norm1 === norm2) return 1.0;
  
  // Check if one string contains the other
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return 0.8;
  }
  
  // Calculate Levenshtein distance
  const matrix = [];
  for (let i = 0; i <= norm2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= norm1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= norm2.length; i++) {
    for (let j = 1; j <= norm1.length; j++) {
      if (norm2.charAt(i - 1) === norm1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const maxLen = Math.max(norm1.length, norm2.length);
  return maxLen === 0 ? 1 : 1 - matrix[norm2.length][norm1.length] / maxLen;
}

async function matchRecipeImages() {
  console.log('🔍 Starting filename-based recipe image matching...');
  
  // Get all recipes
  const recipes = await prisma.recipe.findMany({
    select: { id: true, title: true, tags: true }
  });
  
  // Get image files for Basic and Flow
  const basicImagesDir = path.join(process.cwd(), 'public/Bilder_basic');
  const flowImagesDir = path.join(process.cwd(), 'public/Bilder_flow');
  
  const basicImages = fs.existsSync(basicImagesDir) ? fs.readdirSync(basicImagesDir) : [];
  const flowImages = fs.existsSync(flowImagesDir) ? fs.readdirSync(flowImagesDir) : [];
  
  console.log(`📁 Found ${basicImages.length} Basic images and ${flowImages.length} Flow images`);
  
  let matchedCount = 0;
  
  for (const recipe of recipes) {
    const isBasic = recipe.tags.includes('Basic');
    const isFlow = recipe.tags.includes('Flow');
    
    if (!isBasic && !isFlow) continue;
    
    const imagePool = isBasic ? basicImages : flowImages;
    const imageDir = isBasic ? '/Bilder_basic/' : '/Bilder_flow/';
    
    let bestMatch = null;
    let bestScore = 0;
    
    // Find best matching image
    for (const imageFile of imagePool) {
      if (!imageFile.match(/\.(jpg|jpeg|png)$/i)) continue;
      
      const imageNameWithoutExt = imageFile.replace(/\.(jpg|jpeg|png)$/i, '').replace(/-mobile$/, '');
      const score = similarity(recipe.title, imageNameWithoutExt);
      
      if (score > bestScore && score > 0.6) { // Minimum 60% similarity
        bestScore = score;
        bestMatch = imageFile;
      }
    }
    
    if (bestMatch) {
      // Check for mobile version
      const baseName = bestMatch.replace(/\.(jpg|jpeg|png)$/i, '');
      const mobileImage = imagePool.find(img => 
        img.startsWith(baseName + '-mobile.') || 
        img.startsWith(baseName + '_mobile.')
      );
      
      const desktopUrl = imageDir + bestMatch;
      const mobileUrl = mobileImage ? imageDir + mobileImage : desktopUrl;
      
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          imageUrl: desktopUrl,
          imageMobileUrl: mobileUrl
        }
      });
      
      console.log(`✅ ${recipe.title} → ${bestMatch} (${Math.round(bestScore * 100)}% match)`);
      matchedCount++;
    } else {
      console.log(`❌ No match found for: ${recipe.title}`);
    }
  }
  
  console.log(`\n🎉 Matching complete! Matched ${matchedCount} recipes with images.`);
  
  // Show summary
  const basicWithImages = await prisma.recipe.count({
    where: { 
      tags: { has: 'Basic' },
      imageUrl: { not: null }
    }
  });
  
  const flowWithImages = await prisma.recipe.count({
    where: { 
      tags: { has: 'Flow' },
      imageUrl: { not: null }
    }
  });
  
  console.log(`📊 Basic recipes with images: ${basicWithImages}`);
  console.log(`📊 Flow recipes with images: ${flowWithImages}`);
}

matchRecipeImages()
  .then(() => {
    console.log('✅ Recipe image matching completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 
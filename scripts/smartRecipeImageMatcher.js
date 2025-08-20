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
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]/g, '');
}

// Function to extract key words from recipe title
function extractKeywords(title) {
  const words = title.toLowerCase().split(/[\s\-]+/);
  // Filter out common words that don't help with matching
  const stopWords = ['med', 'och', 'i', 'pa', 'av', 'till', 'fran', 'som', 'den', 'det', 'en', 'ett', 'ar', '2', 'portioner'];
  return words.filter(word => word.length > 2 && !stopWords.includes(word));
}

// Function to calculate match score based on keywords
function calculateMatchScore(recipeTitle, imageFileName) {
  const recipeKeywords = extractKeywords(recipeTitle);
  const imageNameNormalized = normalizeString(imageFileName.replace(/\.(jpg|jpeg|png)$/i, '').replace(/-mobile$/, ''));
  
  let matchedKeywords = 0;
  let totalKeywords = recipeKeywords.length;
  
  for (const keyword of recipeKeywords) {
    const normalizedKeyword = normalizeString(keyword);
    if (imageNameNormalized.includes(normalizedKeyword)) {
      matchedKeywords++;
    }
  }
  
  // Bonus for exact matches
  const recipeNormalized = normalizeString(recipeTitle);
  if (recipeNormalized === imageNameNormalized) {
    return 1.0;
  }
  
  // Calculate percentage of keywords matched
  const score = totalKeywords > 0 ? matchedKeywords / totalKeywords : 0;
  
  // Only consider it a match if at least 60% of keywords match
  return score >= 0.6 ? score : 0;
}

async function smartMatchRecipeImages() {
  console.log('🧠 Starting smart recipe image matching...');
  
  // Get all recipes
  const recipes = await prisma.recipe.findMany({
    where: {
      tags: { hasSome: ['Basic', 'Flow'] }
    },
    select: { id: true, title: true, tags: true }
  });
  
  // Get image files for Basic and Flow
  const basicImagesDir = path.join(process.cwd(), 'public/Bilder_basic');
  const flowImagesDir = path.join(process.cwd(), 'public/Bilder_flow');
  
  const basicImages = fs.existsSync(basicImagesDir) ? 
    fs.readdirSync(basicImagesDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i)) : [];
  const flowImages = fs.existsSync(flowImagesDir) ? 
    fs.readdirSync(flowImagesDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i)) : [];
  
  console.log(`📁 Found ${basicImages.length} Basic images and ${flowImages.length} Flow images`);
  
  let matchedCount = 0;
  const usedImages = new Set();
  
  for (const recipe of recipes) {
    const isBasic = recipe.tags.includes('Basic');
    const imagePool = isBasic ? basicImages : flowImages;
    const imageDir = isBasic ? '/Bilder_basic/' : '/Bilder_flow/';
    
    let bestMatch = null;
    let bestScore = 0;
    
    // Find best matching image that hasn't been used
    for (const imageFile of imagePool) {
      if (usedImages.has(imageFile)) continue; // Skip already used images
      
      const score = calculateMatchScore(recipe.title, imageFile);
      
      if (score > bestScore && score >= 0.8) { // Higher threshold for better matches
        bestScore = score;
        bestMatch = imageFile;
      }
    }
    
    if (bestMatch) {
      // Check for mobile version
      const baseName = bestMatch.replace(/\.(jpg|jpeg|png)$/i, '');
      const mobileImage = imagePool.find(img => 
        img.startsWith(baseName + '-mobile.') && !usedImages.has(img)
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
      
      usedImages.add(bestMatch);
      if (mobileImage) usedImages.add(mobileImage);
      
      const courseType = isBasic ? 'Basic' : 'Flow';
      console.log(`✅ ${recipe.title} (${courseType}) → ${bestMatch} (${Math.round(bestScore * 100)}% match)`);
      matchedCount++;
    } else {
      const courseType = isBasic ? 'Basic' : 'Flow';
      console.log(`❌ No confident match for: ${recipe.title} (${courseType})`);
    }
  }
  
  console.log(`\n🎉 Smart matching complete! Matched ${matchedCount} recipes with high-confidence images.`);
  
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
  
  const totalBasic = await prisma.recipe.count({
    where: { tags: { has: 'Basic' } }
  });
  
  const totalFlow = await prisma.recipe.count({
    where: { tags: { has: 'Flow' } }
  });
  
  console.log(`\n📊 Final Summary:`);
  console.log(`📈 Basic: ${basicWithImages}/${totalBasic} recipes have images (${Math.round(basicWithImages/totalBasic*100)}%)`);
  console.log(`📈 Flow: ${flowWithImages}/${totalFlow} recipes have images (${Math.round(flowWithImages/totalFlow*100)}%)`);
  console.log(`\n💡 Tip: Remaining recipes may need manual image assignment or better image naming.`);
}

smartMatchRecipeImages()
  .then(() => {
    console.log('✅ Smart recipe image matching completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 
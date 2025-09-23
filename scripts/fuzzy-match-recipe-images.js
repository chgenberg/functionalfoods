const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Fuzzy matching function using Levenshtein distance
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
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
  
  return matrix[str2.length][str1.length];
}

function normalizeForMatching(str) {
  return str
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function fuzzyMatch(recipeTitle, imageFilename, threshold = 0.7) {
  const normalizedTitle = normalizeForMatching(recipeTitle);
  const normalizedFilename = normalizeForMatching(imageFilename.replace(/\.(webp|jpg|jpeg|png)$/i, ''));
  
  const distance = levenshteinDistance(normalizedTitle, normalizedFilename);
  const maxLength = Math.max(normalizedTitle.length, normalizedFilename.length);
  const similarity = 1 - (distance / maxLength);
  
  return {
    similarity,
    isMatch: similarity >= threshold,
    distance,
    normalizedTitle,
    normalizedFilename
  };
}

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Fuzzy matching av receptbilder...');
    
    // Get all recipes from database
    const recipes = await prisma.recipe.findMany({
      select: { id: true, title: true, slug: true, imageUrl: true },
      orderBy: { title: 'asc' }
    });
    
    console.log(`📋 Hittade ${recipes.length} recept i databasen`);
    
    // Get image files from recept_images_2025 directory
    const imagesDir = path.join(process.cwd(), 'recept_images_2025');
    
    let imageFiles = [];
    
    if (fs.existsSync(imagesDir)) {
      const imageFilesRaw = fs.readdirSync(imagesDir)
        .filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f))
        .map(f => ({ filename: f, path: `/recept_images_2025/${f}`, source: '2025' }));
      imageFiles.push(...imageFilesRaw);
    }
    
    console.log(`🖼️  Hittade ${imageFiles.length} bildbilder`);
    
    const matches = [];
    const unmatched = [];
    
    // Match each recipe with best image
    for (const recipe of recipes) {
      let bestMatch = null;
      let bestSimilarity = 0;
      
      for (const image of imageFiles) {
        const match = fuzzyMatch(recipe.title, image.filename, 0.6);
        
        if (match.isMatch && match.similarity > bestSimilarity) {
          bestMatch = {
            recipe,
            image,
            ...match
          };
          bestSimilarity = match.similarity;
        }
      }
      
      if (bestMatch) {
        matches.push(bestMatch);
      } else {
        unmatched.push(recipe);
      }
    }
    
    console.log(`\n✅ Matchade: ${matches.length} recept`);
    console.log(`❌ Omatchade: ${unmatched.length} recept`);
    
    // Show top matches
    console.log('\n=== BÄSTA MATCHNINGAR ===');
    matches
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .forEach(match => {
        console.log(`${(match.similarity * 100).toFixed(1)}% - "${match.recipe.title}" → "${match.image.filename}"`);
      });
    
    // Show unmatched recipes
    if (unmatched.length > 0) {
      console.log('\n=== OMATCHADE RECEPT ===');
      unmatched.slice(0, 10).forEach(recipe => {
        console.log(`❌ "${recipe.title}"`);
      });
    }
    
    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      totalRecipes: recipes.length,
      totalImages: imageFiles.length,
      matched: matches.length,
      unmatched: unmatched.length,
      matches: matches.map(m => ({
        recipeId: m.recipe.id,
        recipeTitle: m.recipe.title,
        currentImageUrl: m.recipe.imageUrl,
        matchedImagePath: m.image.path,
        matchedImageFilename: m.image.filename,
        similarity: m.similarity,
        source: m.image.source
      })),
      unmatchedRecipes: unmatched.map(r => ({
        id: r.id,
        title: r.title,
        currentImageUrl: r.imageUrl
      }))
    };
    
    const reportPath = path.join(process.cwd(), 'public', 'RECIPE_IMAGE_MATCHING_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📄 Rapport sparad: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Fel:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

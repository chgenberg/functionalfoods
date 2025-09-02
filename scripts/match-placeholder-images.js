const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

const prisma = new PrismaClient();

// Normalize Swedish text for better matching
function normalizeSwedish(text) {
  return text
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a') 
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  try {
    console.log('Matching placeholder recipes with real images...\n');
    
    // Get all placeholder recipes (now premium)
    const placeholderRecipes = await prisma.recipe.findMany({
      where: {
        imageUrl: {
          contains: 'placeholder'
        }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true
      }
    });
    
    // Get available images
    const imagesDir = path.join(process.cwd(), 'public/Recept_complete/images');
    const imageFiles = fs.readdirSync(imagesDir)
      .filter(file => file.match(/\.(jpg|jpeg|png)$/i));
    
    console.log(`Found ${placeholderRecipes.length} placeholder recipes`);
    console.log(`Found ${imageFiles.length} available images\n`);
    
    const matches = [];
    
    for (const recipe of placeholderRecipes) {
      console.log(`\nMatching: ${recipe.title}`);
      const normalizedTitle = normalizeSwedish(recipe.title);
      
      // Find best matching image
      let bestMatch = null;
      let bestScore = 0;
      
      for (const imageFile of imageFiles) {
        const imageNameWithoutExt = path.parse(imageFile).name;
        const normalizedImageName = normalizeSwedish(imageNameWithoutExt);
        
        // Calculate similarity
        const score = stringSimilarity.compareTwoStrings(normalizedTitle, normalizedImageName);
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = imageFile;
        }
      }
      
      if (bestMatch && bestScore > 0.3) { // Minimum threshold
        const newImageUrl = `/Recept_complete/images/${bestMatch}`;
        console.log(`  ✓ Match found: ${bestMatch} (score: ${bestScore.toFixed(2)})`);
        
        matches.push({
          recipe,
          imageFile: bestMatch,
          imageUrl: newImageUrl,
          score: bestScore
        });
      } else {
        console.log(`  ✗ No good match found (best score: ${bestScore.toFixed(2)})`);
      }
    }
    
    console.log(`\n\nFound ${matches.length} good matches:`);
    matches.forEach(match => {
      console.log(`- ${match.recipe.title} -> ${match.imageFile} (${match.score.toFixed(2)})`);
    });
    
    if (matches.length > 0) {
      console.log('\nUpdating recipes with matched images...');
      
      for (const match of matches) {
        await prisma.recipe.update({
          where: { id: match.recipe.id },
          data: {
            imageUrl: match.imageUrl,
            imageAlt: match.recipe.title
          }
        });
        console.log(`✓ Updated ${match.recipe.title}`);
      }
      
      console.log(`\nSuccessfully updated ${matches.length} recipes with real images!`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 
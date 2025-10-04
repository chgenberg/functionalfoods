const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

// Helper to find the best optimized image for a slug
function findOptimizedImage(slug, publicDir) {
  // Priority order: vision-optimized > regular-optimized > original
  
  // 1. Try vision-optimized (best quality)
  const visionPath = path.join(publicDir, 'recept_images_vision_optimized', `${slug}-card.webp`);
  if (fileExists(visionPath)) {
    return `/recept_images_vision_optimized/${slug}-card.webp`;
  }
  
  // 2. Try regular optimized
  const optimizedPath = path.join(publicDir, 'recept_images_optimized', `${slug}-card-medium.webp`);
  if (fileExists(optimizedPath)) {
    return `/recept_images_optimized/${slug}-card-medium.webp`;
  }
  
  // 3. Keep existing if it's already optimized
  return null;
}

async function fixRecipeImageUrls() {
  try {
    console.log('🔧 Fixar receptbildvägar...\n');
    
    const publicDir = path.join(process.cwd(), 'public');
    
    // Hämta alla recept
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true
      }
    });
    
    console.log(`📊 Hittade ${recipes.length} recept att kontrollera\n`);
    
    let fixedCount = 0;
    let alreadyGoodCount = 0;
    let notFoundCount = 0;
    
    for (const recipe of recipes) {
      const currentUrl = recipe.imageUrl || '';
      
      // Skip if already using optimized images
      if (currentUrl.includes('recept_images_vision_optimized') || 
          currentUrl.includes('recept_images_optimized')) {
        alreadyGoodCount++;
        continue;
      }
      
      // Try to find optimized version
      const optimizedUrl = findOptimizedImage(recipe.slug, publicDir);
      
      if (optimizedUrl) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: { imageUrl: optimizedUrl }
        });
        
        console.log(`✅ ${recipe.title}`);
        console.log(`   Gammal: ${currentUrl}`);
        console.log(`   Ny: ${optimizedUrl}\n`);
        fixedCount++;
      } else {
        console.log(`⚠️  Ingen optimerad bild hittad för: ${recipe.title} (${recipe.slug})`);
        notFoundCount++;
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log(`✅ Fixade: ${fixedCount} recept`);
    console.log(`👍 Redan korrekta: ${alreadyGoodCount} recept`);
    console.log(`⚠️  Ingen bild hittad: ${notFoundCount} recept`);
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Fel:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixRecipeImageUrls();

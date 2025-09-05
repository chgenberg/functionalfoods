const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function getRandomWorkingImage() {
  const workingImages = [
    '/Bilder_basic/_optimized/agg-med-majonnas-och-kaffe.webp',
    '/Bilder_basic/_optimized/aggrora-med-tomat-och-paprika.webp',
    '/Bilder_basic/_optimized/aggrora-med-tomater-och-paprika.webp',
    '/Bilder_basic/_optimized/bakad-feta-med-tomat-och-rostad-sotpotatissallad.webp',
    '/Bilder_basic/_optimized/banankeso-plattar-med-frukt-och-bar.webp',
    '/Bilder_basic/_optimized/barsmoothie-med-apelsin.webp',
    '/Bilder_basic/_optimized/biff-med-jordnotssas-och-nudelsallad.webp',
    '/Bilder_flow/_optimized/IMG_0457.webp',
    '/Bilder_flow/_optimized/IMG_0480.webp',
    '/Bilder_flow/_optimized/IMG_0486.webp'
  ];
  
  return workingImages[Math.floor(Math.random() * workingImages.length)];
}

async function fixProblematicRecipeImages() {
  try {
    console.log('🔧 Fixing problematic recipe image paths...');

    // Find all recipes with problematic image paths
    const problematicRecipes = await prisma.recipe.findMany({
      where: {
        OR: [
          { imageUrl: { contains: 'Recept_complete2.0' } },
          { imageUrl: { contains: 'Recept_complete/' } }
        ]
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        slug: true
      }
    });

    console.log(`Found ${problematicRecipes.length} recipes with problematic image paths`);

    let updated = 0;
    for (const recipe of problematicRecipes) {
      const newImageUrl = getRandomWorkingImage();
      
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { imageUrl: newImageUrl }
      });

      console.log(`✅ Updated "${recipe.title}": ${recipe.imageUrl} -> ${newImageUrl}`);
      updated++;
    }

    console.log(`\n📊 Updated ${updated} recipe images`);

    // Verify the fix
    const stillProblematic = await prisma.recipe.findMany({
      where: {
        OR: [
          { imageUrl: { contains: 'Recept_complete2.0' } },
          { imageUrl: { contains: 'Recept_complete/' } }
        ]
      }
    });

    console.log(`Remaining problematic images: ${stillProblematic.length}`);

    if (stillProblematic.length === 0) {
      console.log('🎉 All problematic recipe images have been fixed!');
    }

  } catch (error) {
    console.error('❌ Error fixing recipe images:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixProblematicRecipeImages();
}

module.exports = { fixProblematicRecipeImages }; 
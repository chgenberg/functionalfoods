const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function verifyRecipeImages() {
  console.log('🔍 Verifying recipe image assignments...\n');
  
  // Get recipes with images
  const recipesWithImages = await prisma.recipe.findMany({
    where: {
      imageUrl: { not: null }
    },
    select: { id: true, title: true, imageUrl: true, tags: true },
    orderBy: { title: 'asc' }
  });
  
  console.log(`Found ${recipesWithImages.length} recipes with images\n`);
  
  // Check if image files actually exist
  let missingImages = 0;
  let correctImages = 0;
  
  for (const recipe of recipesWithImages) {
    const imagePath = path.join(process.cwd(), 'public', recipe.imageUrl);
    const exists = fs.existsSync(imagePath);
    const courseType = recipe.tags.includes('Basic') ? 'Basic' : 'Flow';
    
    if (!exists) {
      console.log(`❌ MISSING: ${recipe.title} (${courseType})`);
      console.log(`   Expected: ${recipe.imageUrl}`);
      missingImages++;
    } else {
      console.log(`✅ EXISTS: ${recipe.title} (${courseType})`);
      console.log(`   Image: ${recipe.imageUrl}`);
      correctImages++;
    }
    console.log('');
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Images found: ${correctImages}`);
  console.log(`❌ Missing images: ${missingImages}`);
  
  // List unmatched images
  console.log('\n🔍 Checking for unmatched images...\n');
  
  const basicImagesDir = path.join(process.cwd(), 'public/Bilder_basic');
  const flowImagesDir = path.join(process.cwd(), 'public/Bilder_flow');
  
  const basicImages = fs.existsSync(basicImagesDir) ? fs.readdirSync(basicImagesDir) : [];
  const flowImages = fs.existsSync(flowImagesDir) ? fs.readdirSync(flowImagesDir) : [];
  
  // Get used image filenames
  const usedImages = recipesWithImages.map(r => path.basename(r.imageUrl));
  
  const unmatchedBasic = basicImages.filter(img => 
    img.match(/\.(jpg|jpeg|png)$/i) && !usedImages.includes(img)
  );
  
  const unmatchedFlow = flowImages.filter(img => 
    img.match(/\.(jpg|jpeg|png)$/i) && !usedImages.includes(img)
  );
  
  console.log(`📁 Unmatched Basic images (${unmatchedBasic.length}):`);
  unmatchedBasic.slice(0, 10).forEach(img => console.log(`   ${img}`));
  if (unmatchedBasic.length > 10) console.log(`   ... and ${unmatchedBasic.length - 10} more`);
  
  console.log(`\n📁 Unmatched Flow images (${unmatchedFlow.length}):`);
  unmatchedFlow.slice(0, 10).forEach(img => console.log(`   ${img}`));
  if (unmatchedFlow.length > 10) console.log(`   ... and ${unmatchedFlow.length - 10} more`);
  
  // Show recipes without images
  const recipesWithoutImages = await prisma.recipe.findMany({
    where: {
      imageUrl: null,
      tags: { hasSome: ['Basic', 'Flow'] }
    },
    select: { title: true, tags: true }
  });
  
  console.log(`\n📝 Recipes without images (${recipesWithoutImages.length}):`);
  recipesWithoutImages.slice(0, 15).forEach(recipe => {
    const courseType = recipe.tags.includes('Basic') ? 'Basic' : 'Flow';
    console.log(`   ${recipe.title} (${courseType})`);
  });
  if (recipesWithoutImages.length > 15) {
    console.log(`   ... and ${recipesWithoutImages.length - 15} more`);
  }
}

// Function to clear all images and rematch with better algorithm
async function clearAndRematch() {
  console.log('🧹 Clearing all recipe images...');
  
  await prisma.recipe.updateMany({
    data: {
      imageUrl: null,
      imageMobileUrl: null
    }
  });
  
  console.log('✅ All images cleared. Ready for fresh matching.');
}

// Check command line arguments
const command = process.argv[2];

if (command === 'clear') {
  clearAndRematch()
    .then(() => process.exit(0))
    .catch(console.error);
} else {
  verifyRecipeImages()
    .then(() => process.exit(0))
    .catch(console.error);
} 
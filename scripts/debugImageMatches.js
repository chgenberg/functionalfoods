const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function debugImageMatches() {
  console.log('🔍 Debugging image matches...\n');
  
  try {
    // Check database connection
    console.log('📡 Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected - found ${userCount} users\n`);
    
    // Get all recipes with images
    console.log('📝 Fetching recipes with images...');
    const recipesWithImages = await prisma.recipe.findMany({
      where: { 
        imageUrl: { not: null },
        tags: { hasSome: ['Basic', 'Flow'] }
      },
      select: { id: true, title: true, imageUrl: true, tags: true },
      orderBy: { title: 'asc' }
    });
    
    console.log(`📊 Found ${recipesWithImages.length} recipes with images\n`);
    
    // Check first few images exist
    let existingImages = 0;
    let missingImages = 0;
    
    for (let i = 0; i < Math.min(10, recipesWithImages.length); i++) {
      const recipe = recipesWithImages[i];
      const imagePath = path.join(process.cwd(), 'public', recipe.imageUrl);
      
      if (fs.existsSync(imagePath)) {
        existingImages++;
        console.log(`✅ ${recipe.title} -> ${path.basename(recipe.imageUrl)}`);
      } else {
        missingImages++;
        console.log(`❌ ${recipe.title} -> ${recipe.imageUrl} (NOT FOUND)`);
      }
    }
    
    console.log(`\n📈 Image check (first 10):`);
    console.log(`   ✅ Existing: ${existingImages}`);
    console.log(`   ❌ Missing: ${missingImages}`);
    
    // Check OpenAI API key
    console.log(`\n🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'SET' : 'MISSING'}`);
    
    // Get all recipes for context
    const allRecipes = await prisma.recipe.findMany({
      where: { tags: { hasSome: ['Basic', 'Flow'] } },
      select: { id: true, title: true, tags: true, imageUrl: true }
    });
    
    const basicRecipes = allRecipes.filter(r => r.tags.includes('Basic'));
    const flowRecipes = allRecipes.filter(r => r.tags.includes('Flow'));
    
    const basicWithImages = basicRecipes.filter(r => r.imageUrl).length;
    const flowWithImages = flowRecipes.filter(r => r.imageUrl).length;
    
    console.log(`\n📊 Recipe Summary:`);
    console.log(`   Basic: ${basicWithImages}/${basicRecipes.length} have images (${Math.round(basicWithImages/basicRecipes.length*100)}%)`);
    console.log(`   Flow: ${flowWithImages}/${flowRecipes.length} have images (${Math.round(flowWithImages/flowRecipes.length*100)}%)`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugImageMatches()
  .then(() => {
    console.log('\n✅ Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }); 
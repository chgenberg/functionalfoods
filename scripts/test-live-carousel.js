/*
  Test the actual API calls that the carousel makes
  Run with: node scripts/test-live-carousel.js
*/

async function testCarouselAPI() {
  try {
    console.log('🧪 Testing live carousel API calls...\n');
    
    // Step 1: Get recipes like the carousel does
    console.log('1️⃣ Fetching random recipes...');
    const recipesRes = await fetch('http://localhost:3000/api/recipes/random?count=10');
    const recipesData = await recipesRes.json();
    
    console.log(`Found ${recipesData.recipes?.length || 0} recipes:`);
    recipesData.recipes?.forEach((recipe, i) => {
      console.log(`   ${i + 1}. "${recipe.title}" -> ${recipe.imageUrl}`);
    });
    
    // Step 2: Test batch-images API like the carousel does
    if (recipesData.recipes?.length > 0) {
      console.log('\n2️⃣ Testing batch-images API...');
      
      const names = recipesData.recipes.map(r => r.title);
      const slugs = recipesData.recipes.map(r => r.slug);
      
      const batchRes = await fetch('http://localhost:3000/api/recipes/batch-images?v=' + Date.now() + '&vision=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ 
          recipeNames: names, 
          recipeSlugs: slugs, 
          size: 'large',
          usage: 'card'
        })
      });
      
      if (batchRes.ok) {
        const batchData = await batchRes.json();
        console.log('\nBatch-images results:');
        Object.entries(batchData.images || {}).forEach(([name, url]) => {
          console.log(`   ✅ "${name}" -> ${url}`);
        });
        
        // Step 3: Show which images would actually be used
        console.log('\n3️⃣ Final image mapping:');
        recipesData.recipes.forEach(recipe => {
          const batchImage = batchData.images?.[recipe.title];
          const finalImage = batchImage || recipe.imageUrl;
          const isVisionOptimized = finalImage?.includes('recept_images_vision_optimized');
          console.log(`   ${recipe.title}:`);
          console.log(`      Original: ${recipe.imageUrl}`);
          console.log(`      Final: ${finalImage} ${isVisionOptimized ? '🎯 VISION!' : '❌ Not optimized'}`);
        });
      } else {
        console.error('❌ Batch-images API failed:', await batchRes.text());
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCarouselAPI(); 
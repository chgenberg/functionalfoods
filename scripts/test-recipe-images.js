/*
  Test recipe image loading to debug why images aren't showing
  Run with: node scripts/test-recipe-images.js
*/

async function testRecipeImageLoading() {
  console.log('🧪 Testing recipe image loading...\n');
  
  // Test some common recipe names that should have images
  const testRecipes = [
    'Laxfilé med ratatouille',
    'Havregrynsgröt med ananas',
    'Het ratatouille',
    'Spenat och grönkål med ägg',
    'Yoghurt med ketomüsli'
  ];
  
  for (const recipeName of testRecipes) {
    console.log(`\n🔍 Testing: "${recipeName}"`);
    
    try {
      // Test the batch-images API that recipe pages use
      const response = await fetch('http://localhost:3000/api/recipes/batch-images?v=' + Date.now() + '&vision=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        body: JSON.stringify({ 
          recipeNames: [recipeName], 
          recipeSlugs: [recipeName.toLowerCase().replace(/\s+/g, '-').replace(/[åäöÅÄÖ]/g, (m) => ({'å':'a','ä':'a','ö':'o','Å':'A','Ä':'A','Ö':'O'}[m] || m))], 
          size: 'large',
          usage: 'detail'
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📸 Response:`, data);
        
        const mapped = data.images && data.images[recipeName];
        if (mapped) {
          console.log(`✅ SUCCESS: "${recipeName}" -> ${mapped}`);
          
          // Test if the image file actually exists
          try {
            const imageResponse = await fetch('http://localhost:3000' + mapped, { method: 'HEAD' });
            console.log(`   📁 Image file status: ${imageResponse.status} ${imageResponse.statusText}`);
          } catch (e) {
            console.log(`   ❌ Image file test failed:`, e.message);
          }
        } else {
          console.log(`❌ FAILED: No image mapping found for "${recipeName}"`);
        }
      } else {
        console.log(`❌ API FAILED: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`   Error: ${errorText}`);
      }
      
    } catch (error) {
      console.log(`❌ REQUEST FAILED: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🏁 Recipe image testing complete!');
}

// Test if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    if (response.ok) {
      console.log('✅ Server is running, starting tests...\n');
      return true;
    } else {
      console.log('❌ Server responded with error:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start with: npm run dev');
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await testRecipeImageLoading();
  }
}

main().catch(console.error); 
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCourseFunctionality() {
  console.log('🧪 TESTING COURSE FUNCTIONALITY');
  console.log('==============================\n');

  try {
    // Test 1: Check recipe counts
    console.log('📊 Test 1: Recipe Counts');
    const totalRecipes = await prisma.recipe.count();
    const freeRecipes = await prisma.recipe.count({ where: { isFree: true } });
    const courseRecipes = await prisma.recipe.count({
      where: {
        tags: { hasSome: ['Basic', 'Flow', 'Energy'] }
      }
    });
    
    console.log(`  Total recipes: ${totalRecipes}`);
    console.log(`  Free recipes: ${freeRecipes}`);
    console.log(`  Course recipes: ${courseRecipes}`);
    console.log(`  ✅ Sum check: ${freeRecipes + courseRecipes === totalRecipes ? 'PASS' : 'FAIL'}`);
    
    // Test 2: Check specific course recipes
    console.log('\n🔍 Test 2: Sample Course Recipes');
    const sampleSlugs = [
      'farskostmacka-med-tomat', // Flow
      'stekt-agg-lax', // Basic
      'yoghurt-bovetegranola-granola' // Energy
    ];
    
    for (const slug of sampleSlugs) {
      const recipe = await prisma.recipe.findUnique({
        where: { slug },
        select: { title: true, tags: true, isFree: true, imageUrl: true }
      });
      
      if (recipe) {
        console.log(`  ${recipe.title}:`);
        console.log(`    Tags: ${recipe.tags?.join(', ') || 'none'}`);
        console.log(`    Free: ${recipe.isFree}`);
        console.log(`    Image: ${recipe.imageUrl ? '✅' : '❌'}`);
      } else {
        console.log(`  ${slug}: NOT FOUND`);
      }
    }
    
    // Test 3: Check image URLs
    console.log('\n🖼️ Test 3: Image URL Quality');
    const badImages = await prisma.recipe.findMany({
      where: {
        OR: [
          { imageUrl: { contains: '/public/' } },
          { imageUrl: { contains: ' ' } },
          { imageUrl: { contains: '/Recept_complete/' } },
          { imageUrl: null }
        ]
      },
      select: { title: true, imageUrl: true }
    });
    
    console.log(`  Recipes with problematic images: ${badImages.length}`);
    if (badImages.length > 0) {
      console.log('  First 5 problematic images:');
      badImages.slice(0, 5).forEach(r => {
        console.log(`    - ${r.title}: ${r.imageUrl || 'NULL'}`);
      });
    }
    
    // Test 4: Check access flags consistency
    console.log('\n🔐 Test 4: Access Flags Consistency');
    const inconsistent = await prisma.recipe.findMany({
      where: {
        AND: [
          { tags: { hasSome: ['Basic', 'Flow', 'Energy'] } },
          { isFree: true }
        ]
      },
      select: { title: true, tags: true, isFree: true }
    });
    
    console.log(`  Course recipes marked as free: ${inconsistent.length}`);
    if (inconsistent.length > 0) {
      console.log('  First 5 inconsistent recipes:');
      inconsistent.slice(0, 5).forEach(r => {
        console.log(`    - ${r.title}: ${r.tags?.join(', ')}`);
      });
    }
    
    // Test 5: API endpoint test
    console.log('\n🌐 Test 5: API Endpoint Test');
    try {
      const response = await fetch('https://ulrika-functional-foods-production.up.railway.app/api/recipes/havregrynsgrot-med-ananas');
      const data = await response.json();
      console.log('  Recipe API response:');
      console.log(`    Title: ${data.title}`);
      console.log(`    Tags: ${data.tags?.join(', ') || 'none'}`);
      console.log(`    Requires course: ${data.requiresCourse}`);
      console.log(`    Requires premium: ${data.requiresPremium}`);
    } catch (e) {
      console.log('  ❌ Could not test API endpoint');
    }
    
    console.log('\n✅ TESTS COMPLETE!');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCourseFunctionality(); 
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRecipeAccess() {
  try {
    console.log('🧪 Testing recipe access logic...\n');

    // Test specific recipes
    const testCases = [
      { slug: 'aggrora-fetaost-spenat', expectedCourse: 'Flow' },
      { slug: 'aggrora-asiatisk-avokadosallad', expectedCourse: 'Flow' },
      { slug: 'lax-med-rodbetssallad', expectedCourse: 'Flow' }
    ];

    for (const test of testCases) {
      const recipe = await prisma.recipe.findUnique({
        where: { slug: test.slug },
        select: {
          slug: true,
          title: true,
          tags: true,
          isPremium: true,
          isFree: true
        }
      });

      if (!recipe) {
        console.log(`❌ Recipe not found: ${test.slug}`);
        continue;
      }

      const isCourseRecipe = recipe.tags?.some(tag => ['Basic', 'Flow', 'Energy'].includes(tag));
      const requiresCourse = isCourseRecipe;
      const requiresPremium = recipe.isPremium && !recipe.isFree && !isCourseRecipe;

      console.log(`📋 ${recipe.title} (${test.slug})`);
      console.log(`   Tags: ${recipe.tags?.join(', ') || 'none'}`);
      console.log(`   isPremium: ${recipe.isPremium}, isFree: ${recipe.isFree}`);
      console.log(`   requiresCourse: ${requiresCourse}`);
      console.log(`   requiresPremium: ${requiresPremium}`);
      console.log(`   Expected course: ${test.expectedCourse}`);
      
      if (recipe.tags?.includes(test.expectedCourse)) {
        console.log(`   ✅ Correctly tagged for ${test.expectedCourse}`);
      } else {
        console.log(`   ❌ Missing ${test.expectedCourse} tag`);
      }
      
      if (!recipe.isFree && !recipe.isPremium) {
        console.log(`   ✅ Correct access flags (course-only)`);
      } else {
        console.log(`   ❌ Wrong access flags`);
      }
      
      console.log('');
    }

    // Count by course
    const [basicCount, flowCount, energyCount, freeCount] = await Promise.all([
      prisma.recipe.count({ where: { tags: { has: 'Basic' }, isFree: false } }),
      prisma.recipe.count({ where: { tags: { has: 'Flow' }, isFree: false } }),
      prisma.recipe.count({ where: { tags: { has: 'Energy' }, isFree: false } }),
      prisma.recipe.count({ where: { isFree: true } })
    ]);

    console.log('📊 RECIPE COUNTS');
    console.log('================');
    console.log(`Basic course recipes: ${basicCount}`);
    console.log(`Flow course recipes: ${flowCount}`);
    console.log(`Energy course recipes: ${energyCount}`);
    console.log(`Free recipes: ${freeCount}`);

  } catch (error) {
    console.error('❌ Error testing access:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testRecipeAccess();
} 
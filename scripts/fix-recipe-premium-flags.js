const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing recipe premium flags...');
  
  // First, get all recipes that are tagged with course tags
  const courseRecipes = await prisma.recipe.findMany({
    where: {
      OR: [
        { tags: { has: 'Basic' } },
        { tags: { has: 'Flow' } },
        { tags: { has: 'Energy' } }
      ]
    },
    select: {
      id: true,
      title: true,
      tags: true,
      isPremium: true,
      isFree: true
    }
  });
  
  console.log(`Found ${courseRecipes.length} course recipes`);
  
  // Update all course recipes to NOT be premium (they're course-specific, not premium)
  const updateResult = await prisma.recipe.updateMany({
    where: {
      OR: [
        { tags: { has: 'Basic' } },
        { tags: { has: 'Flow' } },
        { tags: { has: 'Energy' } }
      ]
    },
    data: {
      isPremium: false,
      isFree: false // They're not free either - they require course purchase
    }
  });
  
  console.log(`Updated ${updateResult.count} course recipes to isPremium: false, isFree: false`);
  
  // Now ensure all non-course recipes are marked as free
  const nonCourseResult = await prisma.recipe.updateMany({
    where: {
      NOT: {
        OR: [
          { tags: { has: 'Basic' } },
          { tags: { has: 'Flow' } },
          { tags: { has: 'Energy' } }
        ]
      }
    },
    data: {
      isPremium: false,
      isFree: true
    }
  });
  
  console.log(`Updated ${nonCourseResult.count} non-course recipes to isPremium: false, isFree: true`);
  
  // Final stats
  const finalStats = await prisma.recipe.groupBy({
    by: ['isPremium', 'isFree'],
    _count: true,
    where: { status: 'PUBLISHED' }
  });
  
  console.log('\n📊 Final recipe access stats:');
  finalStats.forEach(s => {
    console.log(`  isPremium: ${s.isPremium}, isFree: ${s.isFree}, count: ${s._count}`);
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBasicsUserAccess() {
  console.log('🔍 Checking basics@test.se user access...');

  try {
    // Find the basics user
    const user = await prisma.user.findUnique({
      where: { email: 'basics@test.se' }
    });

    if (!user) {
      console.log('❌ No basics@test.se user found');
      return;
    }

    console.log('✅ Found basics user:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Name: ${user.name}`);

    // Get user's purchases
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: user.id,
        status: 'completed'
      },
      include: {
        course: true
      }
    });

    console.log(`\n📦 Found ${purchases.length} completed purchases:`);
    purchases.forEach((purchase, index) => {
      console.log(`${index + 1}. Course: ${purchase.course.name}`);
      console.log(`   - Course ID: ${purchase.courseId}`);
      console.log(`   - Status: ${purchase.status}`);
      console.log(`   - Created: ${purchase.createdAt}`);
    });

    // Check which courses user should have access to
    const ownedCourses = purchases.map((p) => p.course.name);
    console.log(`\n🎓 Owned courses: [${ownedCourses.join(', ')}]`);

    // Test API call simulation
    if (ownedCourses.includes('Functional Basics')) {
      console.log('\n✅ User should have access to Functional Basics premium recipes');
      
      // Check problem recipes specifically
      const problemRecipes = ['fixed-recept-squashspagetti-med-kottfarssas', 'rodbetsjuice', 'kottfarsbiffar-med-stekt-blomkal'];
      
      console.log('\n🔍 Checking problem recipes access:');
      for (const slug of problemRecipes) {
        const recipe = await prisma.recipe.findUnique({
          where: { slug },
          select: {
            title: true,
            isPremium: true,
            isFree: true,
            status: true
          }
        });
        
        if (recipe) {
          const hasAccess = recipe.isFree || !recipe.isPremium || ownedCourses.includes('Functional Basics');
          console.log(`- ${recipe.title}: ${hasAccess ? '✅ Access' : '❌ No Access'} (Premium: ${recipe.isPremium}, Free: ${recipe.isFree})`);
        }
      }
    } else {
      console.log('\n❌ User does NOT have access to Functional Basics course');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBasicsUserAccess(); 
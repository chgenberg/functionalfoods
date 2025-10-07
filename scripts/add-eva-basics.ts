import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addEvaBasics() {
  console.log('\n🔧 Adding Functional Basics to eva.graby@gmail.com...\n');
  
  const user = await prisma.user.findUnique({
    where: { email: 'eva.graby@gmail.com' },
    include: {
      purchases: {
        include: { course: true }
      }
    }
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  console.log(`✅ Found: ${user.name} (${user.email})`);
  console.log(`Current courses: ${user.purchases.map(p => p.course.name).join(', ')}`);

  // Get Basics course
  const basicsCourse = await prisma.courseProduct.findFirst({
    where: { name: { contains: 'Basics' } }
  });

  if (!basicsCourse) {
    console.log('❌ Basics course not found in database');
    return;
  }

  // Check if already has Basics
  const hasBasics = user.purchases.some(p => p.course.name.includes('Basics'));
  
  if (hasBasics) {
    console.log('✅ User already has Functional Basics');
    return;
  }

  // Add Basics purchase
  await prisma.purchase.create({
    data: {
      userId: user.id,
      courseId: basicsCourse.id,
      amount: 0, // Legacy/migrated customer
      status: 'completed',
      accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    }
  });

  console.log('✅ Added Functional Basics to Eva');
  console.log(`\nEva now has: Flow + Basics ✅\n`);

  await prisma.$disconnect();
}

addEvaBasics();

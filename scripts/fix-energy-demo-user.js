const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixEnergyDemoUser() {
  console.log('🔧 Fixing energy.demo@functionalfoods.se user...\n');

  try {
    // 1. Ensure Functional Energy course exists
    let energyCourse = await prisma.courseProduct.findFirst({
      where: {
        OR: [
          { name: 'Functional Energy' },
          { name: 'Functional Insulin balance/Energy' }
        ]
      }
    });

    if (!energyCourse) {
      console.log('❌ Functional Energy course not found in database!');
      console.log('⚠️  Please run: node scripts/add-functional-energy-course.js first');
      return;
    }

    console.log(`✅ Found course: ${energyCourse.name} (ID: ${energyCourse.id})`);

    // 2. Upsert the energy.demo user
    const hashedPassword = await bcrypt.hash('EnergyDemo2025!', 12);
    const user = await prisma.user.upsert({
      where: { email: 'energy.demo@functionalfoods.se' },
      update: { 
        name: 'Energy Demo', 
        password: hashedPassword, 
        isActive: true, 
        role: 'customer',
        mustChangePassword: false
      },
      create: { 
        email: 'energy.demo@functionalfoods.se', 
        name: 'Energy Demo', 
        password: hashedPassword, 
        role: 'customer', 
        isActive: true,
        mustChangePassword: false
      }
    });

    console.log(`✅ User: ${user.email} (ID: ${user.id})`);

    // 3. Remove any old purchases
    await prisma.purchase.deleteMany({
      where: { userId: user.id }
    });

    console.log('🗑️  Removed old purchases');

    // 4. Create new purchase for Functional Energy
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        courseId: energyCourse.id,
        amount: energyCourse.price,
        status: 'completed',
        accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      }
    });

    console.log(`✅ Created purchase for: ${energyCourse.name}`);
    console.log(`\n✨ SUCCESS! energy.demo@functionalfoods.se is now set up with:`);
    console.log(`   Email: energy.demo@functionalfoods.se`);
    console.log(`   Password: EnergyDemo2025!`);
    console.log(`   Course: ${energyCourse.name}`);
    console.log(`   Purchase ID: ${purchase.id}`);
    console.log(`   Access expires: ${purchase.accessExpiresAt}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEnergyDemoUser();

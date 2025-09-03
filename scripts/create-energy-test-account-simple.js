const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Creating test account for Functional Energy course...\n');
  
  try {
    // Check if Functional Energy course exists
    const energyCourse = await prisma.courseProduct.findUnique({
      where: { name: 'Functional Energy' }
    });
    
    if (!energyCourse) {
      console.log('❌ Functional Energy course not found in database');
      return;
    }
    
    console.log(`✅ Found Functional Energy course: ${energyCourse.id}`);
    
    // Create test user
    const email = 'energy-test@functionalfoods.se';
    const password = 'EnergyTest2024!';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    let user;
    if (existingUser) {
      console.log('👤 Test user already exists, updating...');
      user = await prisma.user.update({
        where: { email },
        data: {
          name: 'Energy Test User',
          password: hashedPassword
        }
      });
    } else {
      console.log('👤 Creating new test user...');
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Energy Test User',
          role: 'USER'
        }
      });
    }
    
    console.log(`✅ User created/updated: ${user.id}`);
    
    // Check if purchase already exists
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        courseId: energyCourse.id
      }
    });
    
    if (existingPurchase) {
      console.log('💳 Purchase already exists, updating access...');
      await prisma.purchase.update({
        where: { id: existingPurchase.id },
        data: {
          accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          status: 'completed'
        }
      });
    } else {
      console.log('💳 Creating course purchase...');
      await prisma.purchase.create({
        data: {
          userId: user.id,
          courseId: energyCourse.id,
          amount: energyCourse.price,
          status: 'completed',
          accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        }
      });
    }
    
    console.log('✅ Course access granted');
    
    console.log('\n🎉 SUCCESS! Test account created:');
    console.log('='.repeat(50));
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Password: ${password}`);
    console.log(`🎓 Course: Functional Energy`);
    console.log(`⏰ Access: 1 year from today`);
    console.log('\n🔗 Login at: /login');
    console.log('🏠 Dashboard: /dashboard/courses/functional-energy/oversikt');
    
  } catch (error) {
    console.error('❌ Error creating test account:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
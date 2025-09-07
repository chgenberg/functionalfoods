const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('👤 Creating test user with Functional Flow access...\n');

    // Create user
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'test-flow@test.com',
        name: 'Test Flow User',
        password: hashedPassword,
        hashedPassword,
        role: 'USER',
        isVerified: true
      }
    });

    console.log('✅ User created:', user.email);

    // Find Functional Flow course
    const flowCourse = await prisma.course.findFirst({
      where: {
        title: 'Functional Flow'
      }
    });

    if (!flowCourse) {
      console.error('❌ Functional Flow course not found');
      return;
    }

    // Create purchase
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        courseId: flowCourse.id,
        amount: 999,
        status: 'COMPLETED',
        paymentMethod: 'test',
        paymentId: 'test-payment-123',
        accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      }
    });

    console.log('✅ Purchase created for Functional Flow');
    console.log('\n📧 Login credentials:');
    console.log('   Email: test-flow@test.com');
    console.log('   Password: testpass123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 
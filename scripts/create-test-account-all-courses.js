const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestAccount() {
  try {
    // Skapa användare
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    
    // Kolla om användaren redan finns
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test.allcourses@functionalfoods.se' }
    });
    
    if (existingUser) {
      console.log('Användaren finns redan, uppdaterar...');
      // Ta bort gamla purchases
      await prisma.purchase.deleteMany({
        where: { userId: existingUser.id }
      });
    }
    
    const user = existingUser || await prisma.user.create({
      data: {
        email: 'test.allcourses@functionalfoods.se',
        name: 'Test User - Alla Kurser',
        password: hashedPassword,
        role: 'customer',
        isActive: true,
        mustChangePassword: false,
        preferredLanguage: 'SV',
        nationality: 'Sverige'
      }
    });
    
    console.log('✅ Användare:', user.email);
    
    // Hämta alla kurser
    const courses = await prisma.courseProduct.findMany();
    console.log('\nHittade kurser:');
    courses.forEach(c => console.log('- ' + c.name + ' (' + c.slug + ')'));
    
    // Skapa purchases för alla kurser
    for (const course of courses) {
      const purchase = await prisma.purchase.create({
        data: {
          userId: user.id,
          courseId: course.id,  // Använd course.id istället för slug
          amount: course.price,
          status: 'completed',
          accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 år
        }
      });
      console.log('✅ Köp skapat för:', course.name);
    }
    
    // Skapa en order för spårning
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        orderNumber: 'TEST-' + Date.now(),
        totalAmount: courses.reduce((sum, c) => sum + c.price, 0),
        status: 'COMPLETED',
        items: {
          create: courses.map(course => ({
            courseId: course.id,  // Använd course.id
            name: course.name,
            type: 'course',
            quantity: 1,
            price: course.price
          }))
        }
      }
    });
    
    console.log('\n✅ Order skapad:', order.orderNumber);
    console.log('\n🎉 KONTO SKAPAT!');
    console.log('=====================================');
    console.log('Email: test.allcourses@functionalfoods.se');
    console.log('Lösenord: Test123!');
    console.log('Kurser: Alla 3 kurser är aktiverade');
    console.log('=====================================\n');
    
  } catch (error) {
    console.error('❌ Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAccount();

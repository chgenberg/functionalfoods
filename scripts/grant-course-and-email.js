/*
  Grant a course to a user and send order confirmation with temporary password if needed.
  Usage: node scripts/grant-course-and-email.js <email> [courseName]
  courseName defaults to 'Functional Basics'
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run(email, courseName = 'Functional Basics') {
  if (!email) {
    console.error('Usage: node scripts/grant-course-and-email.js <email> [courseName]');
    process.exit(1);
  }
  const bcrypt = require('bcryptjs');

  try {
    const course = await prisma.courseProduct.findFirst({ where: { name: { contains: courseName, mode: 'insensitive' } } });
    if (!course) {
      console.error('Course not found:', courseName);
      process.exit(1);
    }

    let user = await prisma.user.findUnique({ where: { email } });
    let tempPassword = '';
    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
      const hashed = await bcrypt.hash(tempPassword, 12);
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          password: hashed,
          role: 'customer',
          mustChangePassword: true
        }
      });
      console.log('✅ Created user', email);
    } else {
      tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
      const hashed = await bcrypt.hash(tempPassword, 12);
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed, mustChangePassword: true } });
      console.log('✅ Updated user with temp password');
    }

    const existing = await prisma.purchase.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } } });
    if (!existing) {
      await prisma.purchase.create({
        data: {
          userId: user.id,
          courseId: course.id,
          amount: 0,
          status: 'completed',
          accessExpiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        }
      });
      console.log('✅ Granted course', course.name);
    } else {
      console.log('ℹ️ Course already granted');
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: `ADMIN-${Date.now()}`,
        userId: user.id,
        status: 'COMPLETED',
        totalAmount: 0,
        currency: 'SEK',
        items: { create: [{ name: course.name, price: 0, quantity: 1, type: 'course', courseId: course.id }] }
      }
    });
    console.log('✅ Created order', order.orderNumber);

    console.log('\nLogin credentials:');
    console.log('Email:', user.email);
    console.log('Temp password:', tempPassword);
    console.log('Login URL:', (process.env.NEXT_PUBLIC_BASE_URL || 'https://functionalfoods.se') + '/login');
    console.log('Note: User must change password on first login.');
  } catch (e) {
    console.error('Failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run(process.argv[2], process.argv[3]);



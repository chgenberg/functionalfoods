/*
  Create or update a user with access to all courses (Basics, Flow, Energy).
  Usage:
    node scripts/create-all-courses-user.js "Firstname Lastname" email@example.com

  - Generates a temporary password
  - Sets mustChangePassword=true
  - Creates Purchase records for all courses if missing
  - Outputs credentials to console
*/

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const nameArg = process.argv[2];
  const emailArg = process.argv[3];

  if (!nameArg || !emailArg) {
    console.error('Usage: node scripts/create-all-courses-user.js "Firstname Lastname" email@example.com');
    process.exit(1);
  }

  const name = nameArg.trim();
  const email = emailArg.trim().toLowerCase();

  // Accept multiple variants per course to be robust
  const variants = [
    ['Functional Basics','Functional Basic'],
    ['Functional Gut Health/Flow','Functional Flow','Functional Gut Health'],
    ['Functional Insulin balance/Energy','Functional Energy','Energy']
  ];

  const allCourses = await prisma.courseProduct.findMany({ select: { id: true, name: true } });
  const pickByVariants = (alts) => allCourses.find(c => alts.some(a => c.name.toLowerCase() === a.toLowerCase()));
  const selected = variants.map(v => pickByVariants(v)).filter(Boolean);

  if (selected.length !== variants.length) {
    console.error('❌ Could not find all courses. Found:', selected.map(c => c.name));
    process.exit(1);
  }

  // Ensure user exists with a temporary password and mustChangePassword
  let user = await prisma.user.findUnique({ where: { email } });
  const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        role: 'customer',
        password: hashedPassword,
        mustChangePassword: true
      }
    });
    console.log(`✅ Created user ${email}`);
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, mustChangePassword: true, name }
    });
    console.log(`✅ Updated user ${email} with temp password + mustChangePassword=true`);
  }

  // Create purchases for all courses if missing
  const existingPurchases = await prisma.purchase.findMany({
    where: { userId: user.id },
    select: { courseId: true }
  });
  const existingCourseIds = new Set(existingPurchases.map(p => p.courseId));

  const purchasesToCreate = selected
    .filter(c => !existingCourseIds.has(c.id))
    .map(c => ({ userId: user.id, courseId: c.id, amount: 0, status: 'completed' }));

  if (purchasesToCreate.length > 0) {
    await prisma.purchase.createMany({ data: purchasesToCreate });
    console.log(`✅ Added access to: ${purchasesToCreate.length} course(s)`);
  } else {
    console.log('ℹ️ User already had access to all courses');
  }

  console.log('\n==== Credentials (temporary) ====');
  console.log(`Email: ${email}`);
  console.log(`Temp password: ${tempPassword}`);
  console.log('Login: https://www.functionalfoods.se/login');
  console.log('Note: User will be forced to change password at first login.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



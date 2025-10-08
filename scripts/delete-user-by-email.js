/*
  Delete a user and related records by email (case-insensitive).
  Usage: node scripts/delete-user-by-email.js <email>
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run(email) {
  if (!email) {
    console.error('Usage: node scripts/delete-user-by-email.js <email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
    if (!user) {
      console.log('User not found for email:', email);
      return;
    }

    console.log('Found user:', { id: user.id, email: user.email, createdAt: user.createdAt });

    await prisma.$transaction(async (tx) => {
      // Delete purchases
      const delPurch = await tx.purchase.deleteMany({ where: { userId: user.id } });
      console.log(`Deleted purchases: ${delPurch.count}`);

      // Delete orders (will cascade delete items and payments)
      const delOrders = await tx.order.deleteMany({ where: { userId: user.id } });
      console.log(`Deleted orders: ${delOrders.count}`);

      // Delete password resets (unique by userId)
      await tx.passwordReset.deleteMany({ where: { userId: user.id } }).catch(() => {});

      // Finally delete user
      await tx.user.delete({ where: { id: user.id } });
      console.log('Deleted user');
    });

    console.log('✅ Done');
  } catch (e) {
    console.error('Failed to delete user:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run(process.argv[2]);



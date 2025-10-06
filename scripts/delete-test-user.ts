import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTestUser() {
  try {
    const email = 'ch.genberg@gmail.com';
    
    console.log(`\n🗑️  Deleting test user: ${email}\n`);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        orders: true,
        purchases: true
      }
    });

    if (!user) {
      console.log('❌ User not found - already deleted or never existed');
      return;
    }

    console.log(`✅ Found user: ${user.name} (${user.email})`);
    console.log(`   Orders: ${user.orders.length}`);
    console.log(`   Purchases: ${user.purchases.length}`);
    
    // Delete in correct order due to foreign key constraints
    
    // 1. Delete purchases
    if (user.purchases.length > 0) {
      const deletedPurchases = await prisma.purchase.deleteMany({
        where: { userId: user.id }
      });
      console.log(`✅ Deleted ${deletedPurchases.count} purchases`);
    }

    // 2. Delete orders (this will cascade delete payments and order items)
    if (user.orders.length > 0) {
      const deletedOrders = await prisma.order.deleteMany({
        where: { userId: user.id }
      });
      console.log(`✅ Deleted ${deletedOrders.count} orders (and related payments/items)`);
    }

    // 3. Delete other related data
    await prisma.goal.deleteMany({ where: { userId: user.id } });
    await prisma.mealProgress.deleteMany({ where: { userId: user.id } });
    await prisma.quizResult.deleteMany({ where: { userId: user.id } });
    await prisma.symptomAnalysis.deleteMany({ where: { userId: user.id } });
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    // 4. Finally, delete the user
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log(`✅ Deleted user: ${email}`);
    
    console.log(`\n✨ Done! You can now make a fresh test purchase.\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestUser();

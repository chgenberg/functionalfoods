const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run(email) {
  if (!email) {
    console.error('Usage: node scripts/check-order-by-email.js <email>');
    process.exit(1);
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        purchases: { include: { course: true } },
      }
    });

    const orders = await prisma.order.findMany({
      where: { user: { email } },
      include: { items: true, payment: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log('=== Check Order By Email ===');
    console.log('Email:', email);
    if (!user) {
      console.log('User: NOT FOUND');
    } else {
      console.log('User: FOUND', { id: user.id, createdAt: user.createdAt, mustChangePassword: user.mustChangePassword });
      console.log('Purchases:', user.purchases.map(p => ({ course: p.course?.name, status: p.status, createdAt: p.createdAt })));
    }

    if (!orders || orders.length === 0) {
      console.log('Orders: NONE');
    } else {
      console.log('Orders (latest first):');
      for (const o of orders) {
        console.log({
          orderNumber: o.orderNumber,
          status: o.status,
          totalAmount: o.totalAmount,
          createdAt: o.createdAt,
          items: o.items.map(i => ({ name: i.name, price: i.price, qty: i.quantity })),
          payment: o.payment ? { status: o.payment.status, externalId: o.payment.externalId, processedAt: o.payment.processedAt } : null
        });
      }
    }

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

run(process.argv[2]);



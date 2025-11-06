const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSveaOrders() {
  try {
    console.log('🔍 Checking Svea orders...\n');

    // Find orders with checkoutOrderId (Svea orders)
    const sveaOrders = await prisma.order.findMany({
      where: {
        NOT: {
          checkoutOrderId: null
        }
      },
      include: {
        items: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total Svea orders (with checkoutOrderId): ${sveaOrders.length}\n`);

    if (sveaOrders.length === 0) {
      console.log('❌ No Svea orders found in database');
      console.log('This is expected if no Svea payments have been completed yet.\n');
    } else {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📋 SVEA ORDERS');
      console.log('═══════════════════════════════════════════════════════════\n');

      sveaOrders.forEach(order => {
        console.log(`Order: ${order.orderNumber}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Amount: ${order.totalAmount} kr`);
        console.log(`  Customer: ${order.customerEmail || order.user?.email || 'Unknown'}`);
        console.log(`  Svea Order ID: ${order.checkoutOrderId}`);
        console.log(`  Created: ${new Date(order.createdAt).toLocaleDateString('sv-SE')}`);
        console.log(`  Items: ${order.items.map(i => `${i.name} (${i.type})`).join(', ')}`);
        console.log('');
      });
    }

    // Also check orders where payment method contains 'svea'
    const paymentSveaOrders = await prisma.order.findMany({
      where: {
        OR: [
          {
            payment: {
              paymentMethod: {
                contains: 'svea',
                mode: 'insensitive'
              }
            }
          },
          {
            metadata: {
              path: ['paymentType'],
              string_contains: 'svea'
            }
          }
        ]
      },
      include: {
        items: true,
        user: {
          select: {
            email: true,
            name: true
          }
        },
        payment: true
      }
    });

    console.log(`\n📊 Orders with Svea payment method: ${paymentSveaOrders.length}\n`);

    if (paymentSveaOrders.length > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📋 ORDERS WITH SVEA PAYMENT METHOD');
      console.log('═══════════════════════════════════════════════════════════\n');

      paymentSveaOrders.forEach(order => {
        console.log(`Order: ${order.orderNumber}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Amount: ${order.totalAmount} kr`);
        console.log(`  checkoutOrderId: ${order.checkoutOrderId || 'NONE'}`);
        console.log(`  Payment method: ${order.payment?.paymentMethod || 'N/A'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSveaOrders();


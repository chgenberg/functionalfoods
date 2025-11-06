const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCourseSales() {
  try {
    console.log('🔍 Checking course sales in database...\n');

    // Get all orders with items
    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        totalAmount: {
          gt: 0
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

    console.log(`📊 Total completed orders with amount > 0: ${orders.length}\n`);

    // Count by course
    const courseStats = {};
    
    orders.forEach(order => {
      const courseItems = order.items.filter(item => item.type === 'course');
      
      courseItems.forEach(item => {
        const courseName = item.name;
        
        if (!courseStats[courseName]) {
          courseStats[courseName] = {
            count: 0,
            revenue: 0,
            orders: []
          };
        }
        
        courseStats[courseName].count++;
        courseStats[courseName].revenue += order.totalAmount;
        courseStats[courseName].orders.push({
          orderNumber: order.orderNumber,
          amount: order.totalAmount,
          date: order.createdAt,
          customer: order.user?.email || order.customerEmail || 'Unknown'
        });
      });
    });

    // Normalize course names
    const normalizedStats = {};
    
    Object.entries(courseStats).forEach(([courseName, stats]) => {
      let normalized = courseName;
      
      if (courseName.includes('Flow') || courseName.includes('Gut Health')) {
        normalized = 'Functional Flow';
      } else if (courseName.includes('Energy') || courseName.includes('Insulin balance')) {
        normalized = 'Functional Energy';
      } else if (courseName.includes('Basics')) {
        normalized = 'Functional Basics';
      } else if (courseName.includes('Hormonell') || courseName.includes('Hormon')) {
        normalized = 'Hormonell Balans';
      }
      
      if (!normalizedStats[normalized]) {
        normalizedStats[normalized] = {
          count: 0,
          revenue: 0,
          variants: {},
          allOrders: []
        };
      }
      
      normalizedStats[normalized].count += stats.count;
      normalizedStats[normalized].revenue += stats.revenue;
      normalizedStats[normalized].variants[courseName] = stats.count;
      normalizedStats[normalized].allOrders.push(...stats.orders);
    });

    // Print results
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📚 COURSE SALES SUMMARY (Normalized)');
    console.log('═══════════════════════════════════════════════════════════\n');

    Object.entries(normalizedStats)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .forEach(([course, stats]) => {
        console.log(`🎓 ${course}`);
        console.log(`   Orders: ${stats.count}`);
        console.log(`   Revenue: ${stats.revenue.toLocaleString('sv-SE')} kr`);
        console.log(`   Avg per order: ${(stats.revenue / stats.count).toLocaleString('sv-SE')} kr`);
        
        if (Object.keys(stats.variants).length > 1) {
          console.log(`   Variants:`);
          Object.entries(stats.variants).forEach(([variant, count]) => {
            console.log(`      - ${variant}: ${count} orders`);
          });
        }
        
        console.log('');
      });

    console.log('═══════════════════════════════════════════════════════════\n');

    // Show sample orders for each course
    console.log('📋 RECENT ORDERS PER COURSE:\n');
    
    Object.entries(normalizedStats).forEach(([course, stats]) => {
      console.log(`\n${course} (showing last 5 orders):`);
      stats.allOrders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
        .forEach(order => {
          console.log(`  - ${order.orderNumber}: ${order.amount} kr, ${order.customer}, ${new Date(order.date).toLocaleDateString('sv-SE')}`);
        });
    });

    // Check for 0 kr orders
    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('🔍 CHECKING 0 KR ORDERS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const zeroOrders = await prisma.order.findMany({
      where: {
        totalAmount: 0,
        items: {
          some: {
            type: 'course'
          }
        }
      },
      include: {
        items: {
          where: {
            type: 'course'
          }
        }
      }
    });

    console.log(`Found ${zeroOrders.length} orders with 0 kr (course orders):\n`);
    
    const zeroCourseCount = {};
    zeroOrders.forEach(order => {
      order.items.forEach(item => {
        zeroCourseCount[item.name] = (zeroCourseCount[item.name] || 0) + 1;
      });
    });

    Object.entries(zeroCourseCount).forEach(([course, count]) => {
      console.log(`  ${course}: ${count} orders`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourseSales();


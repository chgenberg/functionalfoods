const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllOrders() {
  try {
    console.log('🔍 Checking ALL orders in database...\n');

    // Get ALL orders
    const allOrders = await prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: {
            email: true,
            name: true
          }
        },
        payment: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 Total orders in database: ${allOrders.length}\n`);

    // Count by status
    const statusCount = {};
    allOrders.forEach(order => {
      statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });

    console.log('Status breakdown:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Count orders with courses
    const ordersWithCourses = allOrders.filter(o => 
      o.items.some(item => item.type === 'course')
    );
    console.log(`\nOrders with courses: ${ordersWithCourses.length}`);

    // Count by status for orders with courses
    const courseOrderStatus = {};
    ordersWithCourses.forEach(order => {
      courseOrderStatus[order.status] = (courseOrderStatus[order.status] || 0) + 1;
    });

    console.log('\nCourse orders by status:');
    Object.entries(courseOrderStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Count 0 kr vs paid orders with courses
    const paidCourseOrders = ordersWithCourses.filter(o => o.totalAmount > 0);
    const zeroCourseOrders = ordersWithCourses.filter(o => o.totalAmount === 0);

    console.log(`\n0 kr course orders: ${zeroCourseOrders.length}`);
    console.log(`Paid course orders: ${paidCourseOrders.length}`);

    // Show breakdown of paid orders by status
    const paidByStatus = {};
    paidCourseOrders.forEach(order => {
      paidByStatus[order.status] = (paidByStatus[order.status] || 0) + 1;
    });

    console.log('\nPaid course orders by status:');
    Object.entries(paidByStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Count by course for ALL paid orders (regardless of status)
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📚 ALL PAID COURSE ORDERS (any status, amount > 0)');
    console.log('═══════════════════════════════════════════════════════════\n');

    const courseStats = {};
    paidCourseOrders.forEach(order => {
      const courseItems = order.items.filter(item => item.type === 'course');
      courseItems.forEach(item => {
        let courseName = item.name;
        
        // Normalize
        if (courseName.includes('Flow') || courseName.includes('Gut Health')) {
          courseName = 'Functional Flow';
        } else if (courseName.includes('Energy') || courseName.includes('Insulin balance')) {
          courseName = 'Functional Energy';
        } else if (courseName.includes('Basics')) {
          courseName = 'Functional Basics';
        } else if (courseName.includes('Hormonell') || courseName.includes('Hormon')) {
          courseName = 'Hormonell Balans';
        }

        if (!courseStats[courseName]) {
          courseStats[courseName] = { 
            total: 0, 
            completed: 0, 
            pending: 0, 
            other: 0,
            revenue: 0
          };
        }
        
        courseStats[courseName].total++;
        courseStats[courseName].revenue += order.totalAmount;
        
        if (order.status === 'COMPLETED') {
          courseStats[courseName].completed++;
        } else if (order.status === 'PENDING') {
          courseStats[courseName].pending++;
        } else {
          courseStats[courseName].other++;
        }
      });
    });

    Object.entries(courseStats)
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([course, stats]) => {
        console.log(`${course}:`);
        console.log(`  Total: ${stats.total} (COMPLETED: ${stats.completed}, PENDING: ${stats.pending}, Other: ${stats.other})`);
        console.log(`  Revenue: ${stats.revenue.toLocaleString('sv-SE')} kr\n`);
      });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllOrders();


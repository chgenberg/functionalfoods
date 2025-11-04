const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:fpjKRTkNGwniTjnvomifZopLybFfQzDe@crossover.proxy.rlwy.net:30169/railway'
    }
  }
});

async function main() {
  try {
    console.log('🔍 Looking for Ulrika Davidsson...');
    
    // Find Ulrika by email (try common variations)
    const emailVariations = [
      'ulrika@functionalfoods.se',
      'ulrika.davidsson@functionalfoods.se',
      'ulrika.davidsson',
      'ulrikadavidsson'
    ];
    
    let user = null;
    for (const email of emailVariations) {
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          purchases: {
            include: {
              course: true
            }
          },
          orders: {
            include: {
              items: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 5
          }
        }
      });
      if (user) {
        console.log(`✅ Found user with email: ${email}`);
        break;
      }
    }
    
    // If not found, search by name
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          name: {
            contains: 'Ulrika',
            mode: 'insensitive'
          }
        },
        include: {
          purchases: {
            include: {
              course: true
            }
          },
          orders: {
            include: {
              items: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 5
          }
        }
      });
    }
    
    if (!user) {
      console.log('❌ User not found. Searching all recent orders...');
      const recentOrders = await prisma.order.findMany({
        where: {
          customerName: {
            contains: 'Ulrika',
            mode: 'insensitive'
          }
        },
        include: {
          items: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });
      
      console.log(`Found ${recentOrders.length} orders with Ulrika in name:`);
      recentOrders.forEach(order => {
        console.log(`  - Order ${order.orderNumber}: ${order.customerEmail} (${order.items.map(i => i.productName).join(', ')})`);
      });
      
      if (recentOrders.length > 0) {
        const latestOrder = recentOrders[0];
        if (latestOrder.user) {
          user = latestOrder.user;
          console.log(`✅ Using user from latest order: ${user.email}`);
        } else if (latestOrder.customerEmail) {
          // Try to find or create user
          user = await prisma.user.findUnique({
            where: { email: latestOrder.customerEmail },
            include: {
              purchases: {
                include: {
                  course: true
                }
              },
              orders: {
                include: {
                  items: true
                }
              }
            }
          });
        }
      }
    }
    
    if (!user) {
      console.error('❌ Could not find Ulrika Davidsson user');
      return;
    }
    
    console.log(`\n👤 User found: ${user.name} (${user.email})`);
    console.log(`📦 Current purchases: ${user.purchases.length}`);
    user.purchases.forEach(p => {
      console.log(`  - ${p.course.name} (${p.course.id})`);
    });
    
    console.log(`\n📋 Recent orders: ${user.orders.length}`);
    user.orders.forEach(order => {
      console.log(`  - Order ${order.orderNumber}: ${order.status}`);
      order.items.forEach(item => {
        console.log(`    • ${item.productName} (${item.productType})`);
      });
    });
    
    // Find Hormonell Balans course
    console.log('\n🔍 Looking for "Hormonell Balans" course...');
    const hormoneCourse = await prisma.courseProduct.findFirst({
      where: {
        name: {
          contains: 'Hormonell Balans',
          mode: 'insensitive'
        }
      }
    });
    
    if (!hormoneCourse) {
      console.error('❌ Hormonell Balans course not found!');
      console.log('Available courses:');
      const allCourses = await prisma.courseProduct.findMany();
      allCourses.forEach(c => {
        console.log(`  - ${c.name} (${c.id})`);
      });
      return;
    }
    
    console.log(`✅ Found course: ${hormoneCourse.name} (${hormoneCourse.id})`);
    
    // Check if user already has this course
    const existingPurchase = user.purchases.find(p => p.courseId === hormoneCourse.id);
    
    if (existingPurchase) {
      console.log(`✅ User already has access to ${hormoneCourse.name}`);
    } else {
      console.log(`\n🔧 Fixing purchase...`);
      
      // Find the most recent order that might have been for Hormonell Balans
      const relevantOrder = user.orders.find(order => 
        order.items.some(item => 
          item.productName.toLowerCase().includes('hormonell') || 
          item.productName.toLowerCase().includes('hormone')
        )
      ) || user.orders[0];
      
      if (relevantOrder) {
        console.log(`   Using order: ${relevantOrder.orderNumber}`);
        
        // Create purchase
        const purchase = await prisma.purchase.create({
          data: {
            userId: user.id,
            courseId: hormoneCourse.id,
            amount: relevantOrder.totalAmount || hormoneCourse.price || 0,
            status: 'completed',
            orderId: relevantOrder.id,
            accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
          },
          include: {
            course: true
          }
        });
        
        console.log(`✅ Created purchase for ${hormoneCourse.name}`);
        console.log(`   Purchase ID: ${purchase.id}`);
      } else {
        console.log(`⚠️ No relevant order found, creating purchase without order reference`);
        const purchase = await prisma.purchase.create({
          data: {
            userId: user.id,
            courseId: hormoneCourse.id,
            amount: hormoneCourse.price || 0,
            status: 'completed',
            accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
          },
          include: {
            course: true
          }
        });
        console.log(`✅ Created purchase for ${hormoneCourse.name}`);
      }
    }
    
    // Check for wrong purchases (like Functional Flow when should be Hormonell Balans)
    console.log(`\n🔍 Checking for incorrect purchases...`);
    const wrongPurchases = user.purchases.filter(p => {
      const courseName = p.course.name.toLowerCase();
      return (courseName.includes('flow') || courseName.includes('functional flow')) && 
             !courseName.includes('hormonell');
    });
    
    if (wrongPurchases.length > 0) {
      console.log(`⚠️ Found ${wrongPurchases.length} potentially incorrect purchases:`);
      wrongPurchases.forEach(p => {
        console.log(`  - ${p.course.name} (Purchase ID: ${p.id})`);
      });
      
      // Check if there's a recent order for Hormonell Balans
      const hormoneOrder = user.orders.find(order => 
        order.items.some(item => 
          item.productName.toLowerCase().includes('hormonell') || 
          item.productName.toLowerCase().includes('hormone')
        )
      );
      
      if (hormoneOrder && wrongPurchases.length > 0) {
        console.log(`\n🔧 Fixing wrong purchases...`);
        for (const wrongPurchase of wrongPurchases) {
          // Delete wrong purchase
          await prisma.purchase.delete({
            where: { id: wrongPurchase.id }
          });
          console.log(`   ❌ Deleted wrong purchase: ${wrongPurchase.course.name}`);
        }
      }
    }
    
    // Final verification
    console.log(`\n✅ Final verification:`);
    const finalPurchases = await prisma.purchase.findMany({
      where: { userId: user.id },
      include: { course: true }
    });
    
    finalPurchases.forEach(p => {
      console.log(`  - ${p.course.name}`);
    });
    
    console.log(`\n✨ Done!`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  });


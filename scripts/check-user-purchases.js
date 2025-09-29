const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPurchases() {
  const user = await prisma.user.findUnique({
    where: { email: 'test.allcourses@functionalfoods.se' },
    include: {
      purchases: {
        include: {
          course: true
        }
      }
    }
  });
  
  console.log('User:', user.email);
  console.log('\nPurchases:');
  user.purchases.forEach(p => {
    console.log('- Course name:', JSON.stringify(p.course.name));
    console.log('  Course ID:', p.course.id);
    console.log('  Status:', p.status);
  });
  
  await prisma.$disconnect();
}

checkPurchases();

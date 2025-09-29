const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourseNames() {
  const courses = await prisma.courseProduct.findMany({
    select: { id: true, name: true, slug: true }
  });
  
  console.log('Course names in database:');
  courses.forEach(c => {
    console.log(`- "${c.name}" (id: ${c.id}, slug: ${c.slug})`);
  });
  
  // Also check what the test user has
  const user = await prisma.user.findUnique({
    where: { email: 'test.allcourses@functionalfoods.se' },
    include: {
      purchases: {
        include: { course: true }
      }
    }
  });
  
  if (user) {
    console.log('\nTest user purchases:');
    user.purchases.forEach(p => {
      console.log(`- "${p.course.name}" (status: ${p.status})`);
    });
  }
  
  await prisma.$disconnect();
}

checkCourseNames();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetCourseStartDate() {
  const userEmail = 'basics@test.se';
  const courseName = 'Functional Basics';

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.log(`Användaren ${userEmail} hittades inte.`);
      return;
    }
    console.log(`Hittade användare: ${user.name} (ID: ${user.id})`);

    const courseProduct = await prisma.courseProduct.findFirst({
      where: { name: courseName },
    });

    if (!courseProduct) {
      console.log(`Kursen "${courseName}" hittades inte.`);
      return;
    }
    console.log(`Hittade kurs: ${courseProduct.name} (ID: ${courseProduct.id})`);

    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        courseId: courseProduct.id,
      },
    });

    if (!purchase) {
      console.log(`Inget köp hittades för ${userEmail} och kursen "${courseName}".`);
      return;
    }
    console.log(`Hittade köp (ID: ${purchase.id}) med startdatum: ${purchase.startDate}`);

    if (purchase.startDate !== null) {
      const updatedPurchase = await prisma.purchase.update({
        where: { id: purchase.id },
        data: { startDate: null },
      });
      console.log(`✅ Startdatum har nollställts för köp ${updatedPurchase.id}`);
    } else {
      console.log('✅ Startdatum är redan nollställt. Ingen åtgärd behövs.');
    }

  } catch (error) {
    console.error('Ett fel uppstod vid nollställning av kursens startdatum:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCourseStartDate(); 
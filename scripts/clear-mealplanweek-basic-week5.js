const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const row = await prisma.mealPlanWeek?.findUnique({
      where: { course_weekNumber: { course: 'basic', weekNumber: 5 } }
    }).catch(() => null);

    if (!row) {
      console.log('ℹ️  Ingen DB-override för Basic v5 hittades.');
    } else {
      await prisma.mealPlanWeek.delete({
        where: { course_weekNumber: { course: 'basic', weekNumber: 5 } }
      });
      console.log('✅ Tog bort DB-override för Basic v5.');
    }
  } catch (e) {
    console.log('ℹ️  MealPlanWeek-tabell saknas eller annat fel:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();

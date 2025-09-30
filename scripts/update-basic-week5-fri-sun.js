const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const row = await prisma.mealPlanWeek.findUnique({
      where: { course_weekNumber: { course: 'basic', weekNumber: 5 } }
    });
    if (!row) {
      console.log('❌ Basic v5 not found in DB. Seed it first.');
      return;
    }
    const days = row.days || {};
    // Update Friday
    days['Fredag'] = {
      breakfast: {
        name: 'Bananplättar med jordgubbar och kokos rester',
        recipeLink: '/kunskapsbank/recept/bananplattar-jordgubbar-kokos'
      },
      lunch: {
        name: 'Kycklinggryta med röda linser rester',
        recipeLink: '/kunskapsbank/recept/kycklinggryta-med-roda-linser'
      },
      dinner: {
        name: 'Skaldjursgryta med torsk i gul curry',
        recipeLink: '/kunskapsbank/recept/skaldjursgryta-med-torsk-i-gul-curry'
      }
    };
    // Update Saturday
    days['Lördag'] = {
      breakfast: {
        name: 'Mangosmoothie med spenat',
        recipeLink: '/kunskapsbank/recept/mangosmoothie-med-spenat'
      },
      lunch: {
        name: 'Skaldjursgryta med torsk i gul curry rester',
        recipeLink: '/kunskapsbank/recept/skaldjursgryta-med-torsk-i-gul-curry'
      },
      dinner: {
        name: 'Kycklingjärpar med linssallad',
        recipeLink: '/kunskapsbank/recept/kycklingjarpar-med-linssallad'
      },
      dessert: {
        name: 'Mandelkaka med frukt',
        recipeLink: '/kunskapsbank/recept/mandelkaka-med-frukt'
      }
    };
    // Update Sunday
    days['Söndag'] = {
      breakfast: {
        name: 'Mangosmoothie med spenat rester',
        recipeLink: '/kunskapsbank/recept/mangosmoothie-med-spenat'
      },
      lunch: {
        name: 'Kycklingjärpar med linssallad rester',
        recipeLink: '/kunskapsbank/recept/kycklingjarpar-med-linssallad'
      },
      dinner: {
        name: 'Laxfilé med ratatouille',
        recipeLink: '/kunskapsbank/recept/laxfile-med-ratatouille'
      }
    };

    await prisma.mealPlanWeek.update({
      where: { course_weekNumber: { course: 'basic', weekNumber: 5 } },
      data: { days }
    });
    console.log('✅ Updated Basic week 5 (Fri–Sun) to requested menu.');
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();

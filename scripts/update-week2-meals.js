/*
  One-off script to normalize Basic week 2 to always include breakfast, lunch, dinner (+dessert) per day
*/
const { PrismaClient } = require('@prisma/client');

async function run() {
  const prisma = new PrismaClient();
  try {
    const days = {
      'Måndag': {
        breakfast: { name: 'Yoghurt med ketomüsli', recipeLink: '/kunskapsbank/recept/yoghurt-med-ketomusli' },
        lunch: { name: 'Ugnsbakad tomat med köttfärs', recipeLink: '/kunskapsbank/recept/ugnsbakad-tomat-med-kottfars' },
        dinner: { name: 'Nudelsoppa med grönsaker', recipeLink: '/kunskapsbank/recept/nudelsoppa-med-gronsaker' }
      },
      'Tisdag': {
        breakfast: { name: 'Omelett med champinjoner', recipeLink: '/kunskapsbank/recept/omelett-champinjoner' },
        lunch: { name: 'Nudelsoppa med grönsaker', recipeLink: '/kunskapsbank/recept/nudelsoppa-med-gronsaker' },
        dinner: { name: 'Torskrygg med ägghack och sparris', recipeLink: '/kunskapsbank/recept/torskrygg-med-agghack-och-sparris' }
      },
      'Onsdag': {
        breakfast: { name: 'Morotsjuice', recipeLink: '/kunskapsbank/recept/morotsjuice-juice' },
        lunch: { name: 'Torskrygg med ägghack och sparris', recipeLink: '/kunskapsbank/recept/torskrygg-med-agghack-och-sparris' },
        dinner: { name: 'Turkiska lammfärsspett med raita och sallad', recipeLink: '/kunskapsbank/recept/turkiska-lammfarsspett-med-raita-och-sallad' }
      },
      'Torsdag': {
        breakfast: { name: 'Morotsjuice', recipeLink: '/kunskapsbank/recept/morotsjuice-juice' },
        lunch: { name: 'Turkiska lammfärsspett med raita och sallad', recipeLink: '/kunskapsbank/recept/turkiska-lammfarsspett-med-raita-och-sallad' },
        dinner: { name: 'Kycklingröra med örter och tomat', recipeLink: '/kunskapsbank/recept/kycklingrora-med-orter-och-tomat' }
      },
      'Fredag': {
        breakfast: { name: 'Havrefralla med morötter och torkade aprikoser', recipeLink: '/kunskapsbank/recept/havrefralla-med-morotter-och-torkade-aprikoser' },
        lunch: { name: 'Kycklingröra med örter och tomat', recipeLink: '/kunskapsbank/recept/kycklingrora-med-orter-och-tomat' },
        dinner: { name: 'Lax med fetaost och rostade rotfrukter', recipeLink: '/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter' }
      },
      'Lördag': {
        breakfast: { name: 'Bärsmoothiebowl', recipeLink: '/kunskapsbank/recept/barsmoothiebowl' },
        lunch: { name: 'Lax med fetaost och rostade rotfrukter', recipeLink: '/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter' },
        dinner: { name: 'Asiatiska köttbullar med nudelsallad', recipeLink: '/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad' },
        dessert: { name: 'Jordgubbar och mango med vit chokladkräm', recipeLink: '/kunskapsbank/recept/jordgubbar-och-mango-med-vit-chokladkram' }
      },
      'Söndag': {
        breakfast: { name: 'Bärsmoothiebowl', recipeLink: '/kunskapsbank/recept/barsmoothiebowl' },
        lunch: { name: 'Asiatiska köttbullar med nudelsallad', recipeLink: '/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad' },
        dinner: { name: 'Päronsallad med chevréost', recipeLink: '/kunskapsbank/recept/paronsallad-med-chevreost' }
      }
    };

    await prisma.mealPlanWeek.update({
      where: { course_weekNumber: { course: 'basic', weekNumber: 2 } },
      data: { title: 'Vecka 2', days }
    });

    console.log('✅ Updated Basic week 2 meal plan');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();



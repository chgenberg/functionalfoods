const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upsertWeek(course, weekNumber, title, days) {
  await prisma.mealPlanWeek.upsert({
    where: { course_weekNumber: { course, weekNumber } },
    update: { title, days },
    create: { course, weekNumber, title, days }
  });
}

async function run() {
  try {
    await upsertWeek('basic', 6, 'Vecka 6', {
      "Måndag": {
        "breakfast": { "name": "Havrefralla med morötter och torkade aprikoser", "recipeLink": "/kunskapsbank/recept/havrefralla-med-morotter-och-torkade-aprikoser" },
        "lunch": { "name": "Laxfilé med ratatouille", "recipeLink": "/kunskapsbank/recept/laxfile-med-ratatouille" },
        "dinner": { "name": "Grönsakswok med kyckling", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kyckling" }
      },
      "Tisdag": {
        "breakfast": { "name": "Kokt ägg med majonnäs", "recipeLink": "/kunskapsbank/recept/kokt-agg-med-majonnas" },
        "lunch": { "name": "Grönsakswok med kyckling", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kyckling" },
        "dinner": { "name": "Köttfärspytt med italienska smaker", "recipeLink": "/kunskapsbank/recept/kottfarspytt-med-italienska-smaker" }
      },
      "Onsdag": {
        "breakfast": { "name": "Mango med keso och nötter", "recipeLink": "/kunskapsbank/recept/mango-med-keso-och-notter" },
        "lunch": { "name": "Köttfärspytt med italienska smaker", "recipeLink": "/kunskapsbank/recept/kottfarspytt-med-italienska-smaker" },
        "dinner": { "name": "Indisk laxgryta med röda linser", "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-med-roda-linser" }
      },
      "Torsdag": {
        "breakfast": { "name": "Äggröra med granatäpple och kiwi", "recipeLink": "/kunskapsbank/recept/aggrora-med-granatapple-och-kiwi" },
        "lunch": { "name": "Indisk laxgryta med röda linser", "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-med-roda-linser" },
        "dinner": { "name": "Quinoasallad med stekt halloumi", "recipeLink": "/kunskapsbank/recept/quinoasallad-med-stekt-halloumi" }
      },
      "Fredag": {
        "breakfast": { "name": "Havregrynsgröt med apelsin och kokos", "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-apelsin-och-kokos" },
        "lunch": { "name": "Quinoasallad med stekt halloumi", "recipeLink": "/kunskapsbank/recept/quinoasallad-med-stekt-halloumi" },
        "dinner": { "name": "Torsk teriyaki med grönsaker", "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker" }
      },
      "Lördag": {
        "breakfast": { "name": "Hallon- och blåbärssmoothie", "recipeLink": "/kunskapsbank/recept/smoothie-blabarssmoothie" },
        "lunch": { "name": "Torsk teriyaki med grönsaker", "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker" },
        "dinner": { "name": "Lammgryta med plommon och bulgur", "recipeLink": "/kunskapsbank/recept/lammgryta-med-plommon-och-bulgur" },
        "dessert": { "name": "Tropisk fruktsallad", "recipeLink": "/kunskapsbank/recept/tropisk-fruktsallad" }
      },
      "Söndag": {
        "breakfast": { "name": "Hallon- och blåbärssmoothie", "recipeLink": "/kunskapsbank/recept/smoothie-blabarssmoothie" },
        "lunch": { "name": "Lammgryta med plommon och bulgur", "recipeLink": "/kunskapsbank/recept/lammgryta-med-plommon-och-bulgur" },
        "dinner": { "name": "Kycklinggryta med bakad spetskål", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal" }
      }
    });

    console.log('✅ Seedade Basic vecka 6.');
  } catch (e) {
    console.error('❌ Fel:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();

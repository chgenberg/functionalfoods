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
    // Week 4 (Basic)
    await upsertWeek('basic', 4, 'Vecka 4', {
      "Måndag": {
        "breakfast": { "name": "Omelett med bär", "recipeLink": "/kunskapsbank/recept/omelett-bar" },
        "lunch": { "name": "Lax med waldorfsallad", "recipeLink": "/kunskapsbank/recept/lax-med-waldorfsallad" },
        "dinner": { "name": "Grekiska köttbullar i tomatsås", "recipeLink": "/kunskapsbank/recept/grekiska-kottbullar-i-tomatsas-auto-2" }
      },
      "Tisdag": {
        "breakfast": { "name": "Ägghack med kalkon", "recipeLink": "/kunskapsbank/recept/agghack-med-kalkon" },
        "lunch": { "name": "Grekiska köttbullar i tomatsås", "recipeLink": "/kunskapsbank/recept/grekiska-kottbullar-i-tomatsas-auto-2" },
        "dinner": { "name": "Kycklinggryta med röda linser", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser" }
      },
      "Onsdag": {
        "breakfast": { "name": "Fruktsmoothie", "recipeLink": "/kunskapsbank/recept/fruktsmoothie" },
        "lunch": { "name": "Kycklinggryta med röda linser", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser" },
        "dinner": { "name": "Laxsallad med vindruvor", "recipeLink": "/kunskapsbank/recept/laxsallad-med-vindruvor" }
      },
      "Torsdag": {
        "breakfast": { "name": "Fruktsmoothie", "recipeLink": "/kunskapsbank/recept/fruktsmoothie" },
        "lunch": { "name": "Laxsallad med vindruvor", "recipeLink": "/kunskapsbank/recept/laxsallad-med-vindruvor" },
        "dinner": { "name": "Asiatiska köttbullar med nudelsallad", "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad" }
      },
      "Fredag": {
        "breakfast": { "name": "Bananplättar med mango och granatäpple", "recipeLink": "/kunskapsbank/recept/bananplattar-med-mango-och-granatapple" },
        "lunch": { "name": "Vegetarisk currygryta med panéer", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" },
        "dinner": { "name": "Grillspett med grekisk sallad och morotstzatziki", "recipeLink": "/kunskapsbank/recept/ajvarspett-med-grekisk-sallad-och-tzatziki" }
      },
      "Lördag": {
        "breakfast": { "name": "Keso med hallon och granatäpple", "recipeLink": "/kunskapsbank/recept/keso-med-hallon-och-granatapple" },
        "lunch": { "name": "Grillspett med grekisk sallad och morotstzatziki", "recipeLink": "/kunskapsbank/recept/ajvarspett-med-grekisk-sallad-och-tzatziki" },
        "dinner": { "name": "Ugnsbakad kyckling med quinoasallad och chilimajonäs", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-quinoasallad-och-chilimajonas" },
        "dessert": { "name": "Hallon och kiwi med vit chokladcréme", "recipeLink": "/kunskapsbank/recept/hallon-och-kiwi-med-vit-chokladcreme" }
      },
      "Söndag": {
        "breakfast": { "name": "Havregrynsgröt med torkad frukt och äpple", "recipeLink": "/kunskapsbank/recept/havregrynsgrot-torkad-frukt" },
        "lunch": { "name": "Ugnsbakad kyckling med quinoasallad och chilimajonäs", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-quinoasallad-och-chilimajonas" },
        "dinner": { "name": "Torsk från mellanöstern", "recipeLink": "/kunskapsbank/recept/torsk-fran-mellanostern" }
      }
    });

    // Week 5 (Basic) with your requested Saturday changes
    await upsertWeek('basic', 5, 'Vecka 5', {
      "Måndag": {
        "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketomusli" },
        "lunch": { "name": "Torsk från mellanöstern", "recipeLink": "/kunskapsbank/recept/torsk-fran-mellanostern" },
        "dinner": { "name": "Japansk kycklingfärswok med groddar", "recipeLink": "/kunskapsbank/recept/japansk-kycklingfarswok-med-groddar" }
      },
      "Tisdag": {
        "breakfast": { "name": "Äggröra med paprika", "recipeLink": "/kunskapsbank/recept/aggrora-med-paprika" },
        "lunch": { "name": "Japansk kycklingfärswok med groddar", "recipeLink": "/kunskapsbank/recept/japansk-kycklingfarswok-med-groddar" },
        "dinner": { "name": "Grekisk sallad", "recipeLink": "/kunskapsbank/recept/grekisk-sallad" }
      },
      "Onsdag": {
        "breakfast": { "name": "Chiafrögröt", "recipeLink": "/kunskapsbank/recept/chiafrogrot" },
        "lunch": { "name": "Lax med fetaost och rostade rotfrukter", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" },
        "dinner": { "name": "Köttfärslimpa med ajvar och rostad sötpotatis", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-ajvar-och-rostad-sotpotatis" }
      },
      "Torsdag": {
        "breakfast": { "name": "Bananplättar med jordgubbar och kokos", "recipeLink": "/kunskapsbank/recept/bananplattar-jordgubbar-kokos" },
        "lunch": { "name": "Köttfärslimpa med ajvar och rostad sötpotatis", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-ajvar-och-rostad-sotpotatis" },
        "dinner": { "name": "Vegetarisk currygryta med panéer", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }
      },
      "Fredag": {
        "breakfast": { "name": "Mangosmoothie med spenat", "recipeLink": "/kunskapsbank/recept/mangosmoothie-med-spenat" },
        "lunch": { "name": "Skaldjursgryta med torsk i gul curry", "recipeLink": "/kunskapsbank/recept/skaldjursgryta-med-torsk-i-gul-curry" },
        "dinner": { "name": "Kycklingjärpar med linssallad", "recipeLink": "/kunskapsbank/recept/kycklingjarpar-med-linssallad" },
        "dessert": { "name": "Mandelkaka med frukt", "recipeLink": "/kunskapsbank/recept/mandelkaka-med-frukt" }
      },
      "Lördag": {
        "breakfast": { "name": "Mangosmoothie med spenat", "recipeLink": "/kunskapsbank/recept/mangosmoothie-med-spenat" },
        "lunch": { "name": "Kycklingjärpar med linssallad", "recipeLink": "/kunskapsbank/recept/kycklingjarpar-med-linssallad" },
        "dinner": { "name": "Kycklingjärpar med linssallad", "recipeLink": "/kunskapsbank/recept/kycklingjarpar-med-linssallad" },
        "dessert": { "name": "Mandelkaka med frukt", "recipeLink": "/kunskapsbank/recept/mandelkaka-med-frukt" }
      },
      "Söndag": {
        "breakfast": { "name": "Mangosmoothie med spenat", "recipeLink": "/kunskapsbank/recept/mangosmoothie-med-spenat" },
        "lunch": { "name": "Kycklingjärpar med linssallad", "recipeLink": "/kunskapsbank/recept/kycklingjarpar-med-linssallad" },
        "dinner": { "name": "Laxfilé med ratatouille", "recipeLink": "/kunskapsbank/recept/laxfile-med-ratatouille" }
      }
    });

    console.log('✅ Seedade Basic vecka 4 och 5.');
  } catch (e) {
    console.error('❌ Fel:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();

const { PrismaClient } = require('@prisma/client');

const recipes = [
  {
    slug: 'kottfarsbiffar-med-stekt-blomkal',
    title: 'Köttfärsbiffar med stekt blomkål',
    ingredients: ['300 g nötfärs', '1 ägg', 'salt och peppar', '1 blomkålshuvud', '2 msk olivolja'],
    instructions: 'Blanda nötfärs med ägg, salt och peppar. Forma till biffar.\nSkär blomkål i bitar och stek i olivolja.\nStek biffarna tills genomstekta.\nServera tillsammans.',
    servings: 2
  },
  {
    slug: 'kycklinggryta-med-bakad-spetskal',
    title: 'Kycklinggryta med bakad spetskål',
    ingredients: ['400 g kycklingfilé', '1 spetskål', '2 msk olivolja', '1 gul lök', '400 ml kokosmjölk', 'salt och peppar'],
    instructions: 'Skär kyckling i bitar och bryn i olja.\nTillsätt hackad lök och stek mjuk.\nHäll på kokosmjölk och låt sjuda.\nBaka spetskål i ugn 200° i 25 min.\nServera grytan med bakad spetskål.',
    servings: 2
  },
  {
    slug: 'ugnsbakad-tomat-med-kottfars',
    title: 'Ugnsbakad tomat med köttfärs',
    ingredients: ['4 stora tomater', '300 g nötfärs', '1 gul lök', '2 vitlöksklyftor', 'salt och peppar', '2 msk olivolja'],
    instructions: 'Skär av toppen på tomaterna och gröp ur.\nBryn nötfärs med hackad lök och vitlök.\nFyll tomaterna med färsen.\nUgnsbaka 200° i 25-30 min.',
    servings: 2
  }
];

(async () => {
  const prisma = new PrismaClient();
  try {
    for (const r of recipes) {
      try {
        await prisma.recipe.create({
          data: {
            ...r,
            status: 'PUBLISHED',
            isPremium: false,
            isFree: true
          }
        });
        console.log('✅ Created:', r.title);
      } catch (e) {
        console.log('⚠️ Exists:', r.title);
      }
    }
    console.log('\n🎉 All missing recipes created!');
  } catch (e) {
    console.error('❌ Creation failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 
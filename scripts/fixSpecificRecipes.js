const { PrismaClient } = require('@prisma/client');

const fixes = [
  {
    slug: 'yoghurt-med-ketomusli',
    title: 'Yoghurt med ketomüsli',
    servings: 1,
    ingredients: ['1 dl grekisk yoghurt (10%)', '¾ dl ketomüsli'],
    instructions: 'Lägg yoghurt i en skål och lägg på ketomüsli.'
  },
  {
    slug: 'squashspagetti-med-kottfarssas',
    title: 'Squashspagetti med köttfärssås',
    servings: 2,
    ingredients: [
      '1 tsk olivolja',
      'salt och svartpeppar', 
      '300 g nötfärs',
      '1 gul lök',
      '1 vitlöksklyfta',
      '400 g krossade tomater',
      '1 tsk oregano',
      '2 zucchini (spiraliserade till spagetti)'
    ],
    instructions: 'Hetta upp olja i en stekpanna. Stek lök och vitlök mjuka.\nTillsätt nötfärs och bryn. Krydda med salt, peppar och oregano.\nHäll på krossade tomater och sjud 10–15 min.\nSpiralizera zucchini till spagetti och fräs hastigt 1–2 min.\nServera köttfärssåsen över squashspagettin.'
  }
];

(async () => {
  const prisma = new PrismaClient();
  try {
    for (const fix of fixes) {
      await prisma.recipe.update({
        where: { slug: fix.slug },
        data: {
          title: fix.title,
          servings: fix.servings,
          ingredients: fix.ingredients,
          instructions: fix.instructions
        }
      });
      console.log('✅ Fixed:', fix.title);
    }
    console.log('🎉 All recipe fixes applied to production DB');
  } catch (e) {
    console.error('❌ Fix failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 
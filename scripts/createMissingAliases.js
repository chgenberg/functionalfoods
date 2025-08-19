const { PrismaClient } = require('@prisma/client');

const aliases = [
  { slug: 'pokebowl-med-kyckling', title: 'Pokébowl med kyckling', baseSlug: 'poke-bowl-med-kyckling' },
  { slug: 'kottfarsbiffar-med-stekt-blomkal', title: 'Köttfärsbiffar med stekt blomkål', baseSlug: 'kottfarsbiffar-med-stekt-blomkal' },
  { slug: '1-havrefrallor-med-morotter-och-aprikoser-valfritt-palagg', title: '1 havrefrallor med morötter och aprikoser + valfritt pålägg', baseSlug: 'havrefrallor-med-morotter-och-aprikoser-valfritt-palagg' },
  { slug: 'kycklinggryta-med-bakad-spetskal', title: 'Kycklinggryta med bakad spetskål', baseSlug: 'kycklinggryta-med-bakad-spetskal' },
  { slug: 'ugnsbakad-tomat-med-kottfars', title: 'Ugnsbakad tomat med köttfärs', baseSlug: 'ugnsbakad-tomat-med-kottfars' }
];

(async () => {
  const prisma = new PrismaClient();
  try {
    for (const a of aliases) {
      const base = await prisma.recipe.findUnique({ where: { slug: a.baseSlug } });
      if (base) {
        try {
          await prisma.recipe.create({
            data: {
              title: a.title,
              slug: a.slug,
              ingredients: base.ingredients,
              instructions: base.instructions,
              servings: base.servings,
              status: 'PUBLISHED',
              isPremium: false,
              isFree: true
            }
          });
          console.log('✅ Created alias:', a.slug);
        } catch (e) {
          console.log('⚠️ Alias exists:', a.slug);
        }
      } else {
        console.log('❌ Base not found:', a.baseSlug);
      }
    }
  } catch (e) {
    console.error('❌ Alias creation failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 
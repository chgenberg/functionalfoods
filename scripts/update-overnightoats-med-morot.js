/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'overnightoats-med-morot';

  const title = 'Overnightoats med morot';
  const ingredients = [
    '1 dl havregryn',
    '1 dl mjölk',
    '0.5 dl grekisk yoghurt',
    '0.25 st morot',
    '1 tsk agavesirap',
    '1 krm salt',
    '0.5 tsk kanel',
    '1 krm vaniljpulver',
    '1 msk russin',
    '1 msk valnötter',
    '0.5 msk chiafrön',
    'Tillbehör',
    '0.25 st morot',
    '0.5 msk russin',
    '2 st valnötter',
    '0.5 tsk kanel'
  ];
  const instructions = [
    'Blanda alla ingredienserna till gröten i en bunke.',
    'Sätt på ett lock och ställ in i kylskåpen över natten.',
    'Ta gröten ur kylen och rör om väl.',
    'Grovhacka valnötter.',
    'Placera strimlad morot i botten på ett glas eller en liten skål (spara lite till topping).',
    'Tillsätt gröten och toppa med russin, valnötter och resterande strimlad morot.',
    'Strö på lite kanel.'
  ];
  const nutrition = { kcal: 417, protein: 14, carbs: 41, fat: 14, fiber: 6 };

  const existing = await prisma.recipe.findUnique({ where: { slug } });
  if (!existing) {
    console.error(`❌ Hittade inte receptet: ${slug}`);
    process.exit(1);
  }

  const updated = await prisma.recipe.update({
    where: { slug },
    data: {
      title,
      categories: ['Frukost'],
      servings: 1,
      prepTime: null,
      cookTime: null,
      totalTime: '8 timmar',
      ingredients,
      instructions: instructions.join('\n'),
      nutrition
    }
  });

  console.log('✅ Uppdaterat recept', {
    slug: updated.slug,
    title: updated.title,
    categories: updated.categories,
    servings: updated.servings,
    totalTime: updated.totalTime,
    nutrition: updated.nutrition
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



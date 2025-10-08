/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'bananmuffin';

  const title = 'Bananmuffins med mandel och kanel';
  const ingredients = [
    '1.5 st banan',
    '1 st ägg',
    '2.5 dl havregryn',
    '0.5 msk bakpulver',
    '1 dl mjölk',
    '0.5 tsk vaniljpulver',
    '1 krm salt',
    '1 tsk kanel',
    '1 tsk agavesirap',
    '0.5 dl kokosflingor',
    '10 st mandlar',
    '6 st muffinsformar'
  ];
  const instructions = [
    'Sätt ugnen på 180 grader.',
    'Förbered 6 muffinsformar på en ugnsplåt.',
    'Mosa banan i en bunke.',
    'Tillsätt ägg.',
    'Blanda ner alla torra ingredienser och agavesirap.',
    'Rör om ordentligt och fördela smeten i formarna.',
    'Hacka mandlar.',
    'Toppa med kokosflingor och mandlar.',
    'Grädda i ugnen i 30 minuter.',
    'Låt svalna och förvara i frysen.'
  ];
  const nutrition = { kcal: 148, protein: 5, carbs: 16, fat: 5, fiber: 3 };

  const existing = await prisma.recipe.findUnique({ where: { slug } });
  if (!existing) {
    console.error(`❌ Hittade inte receptet: ${slug}`);
    process.exit(1);
  }

  const updated = await prisma.recipe.update({
    where: { slug },
    data: {
      title,
      categories: ['Egenbakat'],
      servings: 6,
      prepTime: null,
      cookTime: null,
      totalTime: '40 min',
      ingredients,
      ingredientsStructured: null,
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



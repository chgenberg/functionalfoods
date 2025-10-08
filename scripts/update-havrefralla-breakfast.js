/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'havrefralla-med-morotter-och-torkade-aprikoser';

  const title = 'Havrefralla med morötter och torkade aprikoser';
  const ingredients = [
    '1 st havrefralla med morötter och aprikoser',
    'valfritt pålägg'
  ];
  const instructions = [
    'Dela frallan i mitten.',
    'Servera med valfritt pålägg.'
  ];
  const nutrition = { kcal: 355, protein: 20, carbs: 17, fat: 20, fiber: 4 };

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
      prepTime: '5 min',
      cookTime: null,
      totalTime: '5 min',
      ingredients,
      instructions: instructions.join('\n'),
      nutrition
    }
  });

  console.log('✅ Uppdaterat frukostrecept', {
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



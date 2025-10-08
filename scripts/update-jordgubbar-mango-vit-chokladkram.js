/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'jordgubbar-och-mango-med-vit-chokladkram';

  const title = 'Jordgubbar och mango med vit chokladkräm';
  const ingredients = [
    '0.5 st färsk mango',
    '6 st färska jordgubbar',
    '30 g vit choklad',
    '50 g philadelphiaost',
    '1 msk färsk mynta'
  ];
  const instructions = [
    'Skär mango i bitar, dela jordgubbar och lägg på ett fat.',
    'Smält vit choklad i en skål i mikron.',
    'Blanda ner philadelphiaost.',
    'Klicka på chokladkräm på fatet och dekorera med en myntakvist.'
  ];
  const nutrition = { kcal: 254, protein: 3, carbs: 21, fat: 3, fiber: 0 };

  const existing = await prisma.recipe.findUnique({ where: { slug } });
  if (!existing) {
    console.error(`❌ Hittade inte receptet: ${slug}`);
    process.exit(1);
  }

  const updated = await prisma.recipe.update({
    where: { slug },
    data: {
      title,
      categories: ['Efterrätt'],
      servings: 2,
      prepTime: '10 min',
      cookTime: null,
      totalTime: '10 min',
      ingredients,
      instructions: instructions.join('\n'),
      nutrition
    }
  });

  console.log('✅ Uppdaterat dessertrecept', {
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



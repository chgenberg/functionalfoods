/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'aggrora-lax-2';

  const title = 'Rökt lax med ägghack';
  const ingredients = [
    '2 st ägg',
    '0.5 msk majonäs',
    'salt och svartpeppar',
    '30 g rökt lax',
    '2 st cocktailtomater',
    '1 kvist färsk persilja'
  ];
  const instructions = [
    'Koka äggen och skölj i kallt vatten.',
    'Skala och hacka äggen och lägg i en skål.',
    'Blanda ner majonnäs, salt och peppar.',
    'Servera med rökt lax och tomat.',
    'Dekorera med persilja.'
  ];
  const nutrition = { kcal: 297, protein: 21, carbs: 2, fat: 21, fiber: 0 };

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
      totalTime: '10 min',
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



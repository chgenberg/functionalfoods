/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'bovetegranola-med-apelsin-och-kardemumma';

  const title = 'Bovetegranola med apelsin och kardemumma';
  const ingredients = [
    '5 dl hel bovete',
    '1 liter kokande vatten',
    '2 dl blandade nötter',
    '1 dl solrosfrön',
    '1 msk vaniljsocker',
    '1 krm kardemumma',
    '1 st apelsin',
    '1 dl kokosolja',
    '3 msk honung',
    '1 dl torkad mango i tärningar',
    '1 dl russin'
  ];
  const instructions = [
    'Sätt ugnen på 200 grader.',
    'Lägg bovete i en skål med kokande vatten i 10 minuter.',
    'Häll av vattnet och skölj bovetet.',
    'Lägg bovete, nötter och frön på en ugnsplåt.',
    'Riv zest från apelsin.',
    'Strö på salt, vaniljsocker, kardemumma och apelsinzest.',
    'Hetta upp kokosolja i en kastrull och tillsätt honung.',
    'Höll allt över plåten och blanda om ordentligt.',
    'Sätt in plåten i ugnen i 20–30 minuter.',
    'Rör om då och då så inget bränns.',
    'Blanda ner mango och russin.'
  ];
  const nutrition = { kcal: 331, protein: 8, carbs: 32, fat: 8, fiber: 3 };

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
      servings: 12,
      prepTime: null,
      cookTime: null,
      totalTime: '40 min',
      ingredients,
      ingredientsStructured: null,
      instructions: instructions.join('\n'),
      nutrition,
      tags: { set: ['Energy'] },
      isPremium: true,
      isFree: false
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



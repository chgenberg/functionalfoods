/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const title = 'Havrefrallor med morötter och aprikoser';
  // Keep existing slug to avoid breaking links in meal plans
  const existingSlug = 'havrefralla-med-morotter-och-torkade-aprikoser';

  const ingredients = [
    '4 dl havregryn',
    '4 st torkade aprikoser',
    '1 st morot',
    '3 dl keso',
    '4 st ägg',
    '1 dl solroskärnor',
    '1 dl pumpafrön',
    '1 dl hampafrön',
    '1 dl sesamfrön',
    '1.5 tsk bakpulver',
    '1 krm salt',
    'Topping',
    '0.5 dl hampafrön'
  ];

  const instructions = [
    'Sätt ugnen på 200 grader.',
    'Skala och riv morot grovt.',
    'Hacka aprikoserna.',
    'Lägg i en skål med alla ingredienser.',
    'Blanda ihop och forma till avlånga bullar.',
    'Lägg på en bakplåtsklädd plåt och strö på hampafrön.',
    'Grädda i ugnen i cirka 20 minuter.',
    'Låt svalna och förvara i frysen.'
  ];

  const nutrition = { kcal: 355, protein: 20, carbs: 17, fat: 20, fiber: 4 };

  // Try find by existing slug first
  let recipe = await prisma.recipe.findUnique({ where: { slug: existingSlug } });
  if (!recipe) {
    // Try by title contains (insensitive)
    recipe = await prisma.recipe.findFirst({
      where: { title: { contains: 'Havrefrallor', mode: 'insensitive' } }
    });
  }
  if (!recipe) {
    console.error('❌ Kunde inte hitta receptet för uppdatering.');
    process.exit(1);
  }

  const updated = await prisma.recipe.update({
    where: { id: recipe.id },
    data: {
      title,
      categories: ['Egenbakat'],
      servings: 8,
      totalTime: '30 min',
      ingredients,
      instructions: instructions.join('\n'),
      nutrition
    }
  });

  console.log('✅ Uppdaterat recept', { slug: updated.slug, servings: updated.servings, categories: updated.categories, nutrition: updated.nutrition });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



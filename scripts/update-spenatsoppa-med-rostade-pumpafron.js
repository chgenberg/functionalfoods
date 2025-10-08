/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'spenatsoppa-med-rostade-pumpafron';

  const title = 'Spenatsoppa med rostade pumpafrön';
  const ingredients = [
    '1 klyfta vitlök',
    '1 tsk färsk ingefära',
    '1 msk olivolja',
    '150 g fryst spenat',
    '2 dl vatten',
    '200 g konserverade vita bönor',
    '400 ml kokosmjölk',
    '0.5 tsk srirachasås',
    'salt och svartpeppar',
    'Topping',
    '1 msk pumpafrön',
    '0.5 tsk honung',
    '2 msk kokosskivor'
  ];
  const instructions = [
    'Skala och riv vitlök och ingefära.',
    'Hetta upp en kastrull och bryn vitlök och ingefära.',
    'Lägg i spenat och vatten och låt koka upp.',
    'Skölj bönor och lägg dem i kastrullen tillsammans med kokosmjölk.',
    'Låt koka upp och krydda med srirashasås, salt och peppar.',
    'Mixa soppan slät med en stavmixer.',
    'Hetta upp en stekpanna.',
    'Torrosta pumpafrön tills de får färg.',
    'Tillsätt salt och honung och ta bort stekpannan från värmen.',
    'Häll upp soppa i skålar och toppa med rostade pumpafrön och kokosskivor.'
  ];
  const nutrition = { kcal: 283, protein: 7, carbs: 11, fat: 7, fiber: 5 };

  const existing = await prisma.recipe.findUnique({ where: { slug } });
  if (!existing) {
    console.error(`❌ Hittade inte receptet: ${slug}`);
    process.exit(1);
  }

  const updated = await prisma.recipe.update({
    where: { slug },
    data: {
      title,
      categories: ['Middag'],
      servings: 4,
      prepTime: null,
      cookTime: null,
      totalTime: '15 min',
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



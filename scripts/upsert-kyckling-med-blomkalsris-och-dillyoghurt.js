/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'kyckling-med-blomkalsris-och-dillyoghurt';

  const title = 'Kyckling med stekt blomkålsris och dillyoghurt';
  const ingredients = [
    '0.5 klyfta vitlök',
    '1 tsk färsk ingefära',
    '1 msk ketjap manis',
    'salt och svartpeppar',
    '300 g kycklinglårfilé',
    'Blomkålsris',
    '0.25 klyfta vitlök',
    '0.25 tsk färsk ingefära',
    '0.25 st gul lök',
    '0.25 st aubergine',
    '0.75 st paprika',
    '0.25 st blomkålshuvud',
    '0.5 msk olivolja',
    '1 tsk curry',
    '0.5 krm gurkmeja',
    '2 msk färsk dill',
    'salt och svartpeppar',
    'Dillyoghurt',
    '1 dl grekisk yoghurt',
    '1 msk färsk dill',
    '1 st citronklyfta',
    '1 krm flytande honung'
  ];
  const instructions = [
    'Sätt på ugnen på 200 grader.',
    'Skala och riv vitlök och ingefära.',
    'Blanda vitlök, ingefära, ketjap manis, salt och peppar i en skål.',
    'Lägg i kyckligfilé och rör om.',
    'Låt stå och marineras i cirka 20 minuter.',
    'Ta upp kycklingen ur marinaden och lägg på i en ugnsform.',
    'Ställ in i ugnen i 15 minuter.',
    'Skala och riv vitlök och ingefära.',
    'Skala och grovhacka lök.',
    'Skär aubergine och paprika i bitar.',
    'Riv blomkål.',
    'Hacka dill.',
    'Hetta upp en stekpanna med olivolja.',
    'Lägg i vitlök, ingefära, lök, aubergine, paprika och blomkål.',
    'Blanda i curry och stek tills grönsakerna mjuknat.',
    'Strö på gurkmeja, dill, salt och peppar och rör om.',
    'Blanda grekisk yoghurt, hackad dill och honung i en skål, riv ner citronzest och rör om.',
    'Servera kycklingen med blomkålsris och dillyoghurt.'
  ];
  const nutrition = { kcal: 365, protein: 36, carbs: 15, fat: 36, fiber: 5 };

  const existing = await prisma.recipe.findUnique({ where: { slug } });

  if (existing) {
    const updated = await prisma.recipe.update({
      where: { slug },
      data: {
        title,
        categories: ['Middag'],
        servings: 2,
        totalTime: '35 min',
        ingredients,
        ingredientsStructured: null,
        instructions: instructions.join('\n'),
        nutrition,
        tags: { set: ['Flow'] },
        isPremium: true,
        isFree: false
      }
    });
    console.log('✅ Uppdaterat recept', { slug: updated.slug, title: updated.title });
  } else {
    const created = await prisma.recipe.create({
      data: {
        title,
        slug,
        categories: ['Middag'],
        servings: 2,
        totalTime: '35 min',
        ingredients,
        instructions: instructions.join('\n'),
        nutrition,
        tags: ['Flow'],
        isPremium: true,
        isFree: false
      }
    });
    console.log('✅ Skapade recept', { slug: created.slug, title: created.title });
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



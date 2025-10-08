/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'kottfarsbiffar-med-stekt-blomkal';

  const ingredients = [
    '250 g blomkål',
    '2 tsk olivolja',
    '0.25 st gul lök',
    '1 klyfta vitlök',
    '250 g nötfärs',
    '1 tsk ketjap manis',
    'salt och svartpeppar',
    '1 krm örtagårdskrydda',
    '2 tsk smör',
    '0.75 dl vatten',
    '4 st cocktailtomater',
    '2 kvist färsk persilja',
    'Pestosås',
    '3 msk grekisk yoghurt',
    '1 tsk röd pesto'
  ];

  const instructions = [
    'Blanda ihop grekisk yoghurt med röd pesto till en sås och ställ åt sidan.',
    'Skär blomkålen i skivor.',
    'Hetta upp enstekpanna med olivolja.',
    'Stek blomkålsskivorna i några minuter på varje sida.',
    'Skala och hacka gul lök.',
    'Skala och riv vitlök.',
    'Blanda nötfärs med lök, vitlök och ketjap manis i en skål.',
    'Krydda med salt, peppar och örtagårdskrydda.',
    'Blanda och forma till två biffar.',
    'Hetta upp en stekpanna och stek biffarna i smör.',
    'Sänk värmen innan biffarna är helt genomstekta.',
    'Häll på vatten och låt biffarna få ångkoka klart.',
    'Placera blomkålsskivorna på tallrikar.',
    'Lägg biffarna ovanpå blomkålen.',
    'Skär tomater i klyftor och lägg vid sidan om.',
    'Servera med pestosås och dekorera med persiljekvistar.'
  ];

  const nutrition = {
    kcal: 355,
    protein: 29,
    carbs: 11,
    fat: 29,
    fiber: 3
  };

  const data = {
    title: 'Köttfärsbiffar med stekt blomkål',
    categories: ['Middag'],
    servings: 2,
    prepTime: null,
    cookTime: null,
    totalTime: '25 min',
    ingredients,
    instructions: instructions.join('\n'),
    nutrition
  };

  const existing = await prisma.recipe.findUnique({ where: { slug } });
  if (!existing) {
    console.error(`❌ Recipe not found: ${slug}`);
    process.exit(1);
  }

  const updated = await prisma.recipe.update({
    where: { slug },
    data
  });

  console.log('✅ Updated recipe', {
    slug,
    servings: updated.servings,
    totalTime: updated.totalTime,
    ingredients: updated.ingredients.length,
    hasInstructions: Boolean(updated.instructions),
    nutrition: updated.nutrition
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



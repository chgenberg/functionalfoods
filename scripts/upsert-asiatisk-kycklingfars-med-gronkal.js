/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'asiatisk-kycklingfars-med-gronkal';

  const title = 'Asiatisk kycklingfärs med grönkål';
  const ingredients = [
    '0.75 st paprika',
    '5 cm purjolök',
    '2 st grönkålsblad',
    '0.5 st morot',
    '0.5 klyfta vitlök',
    '1 tsk färsk ingefära',
    '1 tsk olivolja',
    '300 g kycklingfärs',
    'salt och svartpeppar',
    '2 msk teriyakisås',
    '1 msk färsk koriander',
    'Topping',
    '1 msk granatäppelkärnor'
  ];
  const instructions = [
    'Hacka paprika i små tärningar.',
    'Skär purjolök och grönkål i strimlor.',
    'Skala och hacka morot i små tärningar.',
    'Skala och riv vitlök och ingefära.',
    'Hacka koriander.',
    'Hetta upp en stekpanna med olivolja och bryn färsen.',
    'Tillsätt paprika, morot, purjolök, vitlök och ingefära och stek färsen i några minuter.',
    'Krydda med salt, peppar och teriyakisås.',
    'Lägg i koriander och grönkål i färsblandningen.',
    'Låt steka i ytterligare en minut.',
    'Servera kycklingfärs i skålar och toppa med granatäpplekärnor.'
  ];
  const nutrition = { kcal: 259, protein: 37, carbs: 12, fat: 37, fiber: 4 };

  const existing = await prisma.recipe.findUnique({ where: { slug } });
  if (existing) {
    const updated = await prisma.recipe.update({
      where: { slug },
      data: {
        title,
        categories: ['Middag'],
        servings: 2,
        totalTime: '20 min',
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
        totalTime: '20 min',
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



/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'stekt-torsk-med-bearnaisesas-och-haricots-verts';

  const title = 'Stek torsk med bearnaisesås och haricot verts';
  const ingredients = [
    '1 tsk olivolja',
    '400 g torskfile',
    'salt och svartpeppar',
    '0.75 dl vatten',
    'Tillbehör',
    '200 g haricots verts',
    '2 msk bearnaisesås',
    'Dekoration',
    '2 kvistar färsk persilja',
    '2 st citronklyftor'
  ];
  const instructions = [
    'Hetta upp en stekpanna med olivolja.',
    'Stek torsken i en min per sida.',
    'Strö på salt och peppar.',
    'Häll på vatten och ångkoka tills torsken är klar.',
    'Koka haricots verts i några minuter i lättsaltat vatten och lägg upp på tallrikar.',
    'Lägg på fisken och servera med bearnaisesås.',
    'Dekorera med persiljekvistar på citronklyftor.'
  ];
  const nutrition = { kcal: 281, protein: 36, carbs: 4, fat: 36, fiber: 0 };

  const existing = await prisma.recipe.findUnique({ where: { slug } });

  if (existing) {
    const updated = await prisma.recipe.update({
      where: { slug },
      data: {
        title,
        categories: ['Middag'],
        servings: 2,
        totalTime: '15 min',
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
        totalTime: '15 min',
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



/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'omelett-champinjoner';

  const title = 'Champinjonomelett';
  const ingredients = [
    '6 st färska champinjoner',
    '1 msk smör',
    'salt och svartpeppar',
    '2 msk färsk persilja',
    '2 st ägg',
    'Dekoration',
    '1 kvist färsk persilja'
  ];
  const instructions = [
    'Skiva champinjoner.',
    'Hacka persilja.',
    'Hetta upp en stekpanna med hälften av smöret.',
    'Stek champinjoner tills de blir gyllenbruna.',
    'Strö på salt och peppar.',
    'Häll över persilja och lägg svampen åt sidan.',
    'Vispa ihop ägg i en skål.',
    'Hetta upp en stekpanna med resten av smöret.',
    'Häll ner ägg i stekpannan och stek på låg värme tills omeletten är genomstekt.',
    'Lägg upp omeletten på en tallrik och lägg champinjonblandningen ovanpå.',
    'Vik in kanterna på omeletten över fyllningen och dekorera med en persiljekvist.'
  ];
  const nutrition = { kcal: 322, protein: 18, carbs: 6, fat: 18, fiber: 0 };

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
      totalTime: '15 min',
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



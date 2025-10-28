/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const ingredients = [
    '25 g spenat',
    '1 selleristång',
    '½ gurka',
    '1 apelsin',
    '1 msk färsk ingefära',
    '1 lime',
    '1,5 dl vatten'
  ];

  // Try find by title contains (insensitive) - looking for Grön smoothie
  let recipe = await prisma.recipe.findFirst({
    where: { title: { contains: 'Grön smoothie', mode: 'insensitive' } }
  });

  if (!recipe) {
    console.error('❌ Kunde inte hitta receptet för uppdatering.');
    process.exit(1);
  }

  const updated = await prisma.recipe.update({
    where: { id: recipe.id },
    data: {
      ingredients
    }
  });

  console.log('✅ Uppdaterat recept', { 
    slug: updated.slug, 
    title: updated.title,
    ingredients: updated.ingredients
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

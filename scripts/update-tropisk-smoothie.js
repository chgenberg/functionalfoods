/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const ingredients = [
    '100 g fryst mango',
    '100 g fryst ananas',
    '1 banan',
    '1 dl mandelmjölk'
  ];

  const instructions = [
    'Lägg all fryst frukt och banan i en mixer.',
    'Häll på mandelmjölken.',
    'Mixa tills du får en cremig smoothie.',
    'Servera genast.'
  ];

  // Try find by title contains (insensitive) - looking for Tropisk smoothie variations
  let recipe = await prisma.recipe.findFirst({
    where: { title: { contains: 'Tropisk', mode: 'insensitive' } }
  });

  if (!recipe) {
    console.error('❌ Kunde inte hitta receptet för uppdatering.');
    process.exit(1);
  }

  const updated = await prisma.recipe.update({
    where: { id: recipe.id },
    data: {
      ingredients,
      instructions: instructions.join('\n')
    }
  });

  console.log('✅ Uppdaterat recept', { 
    slug: updated.slug, 
    title: updated.title,
    ingredients: updated.ingredients,
    servings: updated.servings
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

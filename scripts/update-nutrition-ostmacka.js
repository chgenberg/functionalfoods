/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const recipeTitle = 'Ostmacka med paprika';
  
  const nutrition = {
    kcal: 265,
    protein: 8,
    carbs: 24,
    fat: 14,
    fiber: 0 // Lägg till om du har data
  };

  // Hitta receptet
  let recipe = await prisma.recipe.findFirst({
    where: { 
      title: { 
        contains: 'Ostmacka med paprika', 
        mode: 'insensitive' 
      } 
    }
  });

  if (!recipe) {
    console.error('❌ Kunde inte hitta receptet:', recipeTitle);
    console.log('Söker efter liknande recept...');
    const similar = await prisma.recipe.findMany({
      where: {
        title: {
          contains: 'Ostmacka',
          mode: 'insensitive'
        }
      },
      select: { title: true, slug: true }
    });
    console.log('Liknande recept:', similar);
    process.exit(1);
  }

  // Uppdatera receptet
  const updated = await prisma.recipe.update({
    where: { id: recipe.id },
    data: {
      nutrition: nutrition,
      servings: 1
    }
  });

  console.log('✅ Uppdaterat recept:', {
    title: updated.title,
    slug: updated.slug,
    nutrition: updated.nutrition,
    servings: updated.servings
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


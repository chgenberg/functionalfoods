/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'havrefralla-med-morotter-och-torkade-aprikoser';

  const recipe = await prisma.recipe.findUnique({ where: { slug } });
  if (!recipe) {
    console.error('❌ Receptet hittades inte:', slug);
    process.exit(1);
  }

  const perServing = {
    energy: 354,
    protein: 39,
    fat: 44,
    carbohydrates: 35,
    fiber: 10
  };

  const updated = await prisma.recipe.update({
    where: { id: recipe.id },
    data: {
      nutrition: {
        perServing,
        calories: perServing.energy,
        protein: perServing.protein,
        fat: perServing.fat,
        carbohydrates: perServing.carbohydrates,
        fiber: perServing.fiber
      }
    }
  });

  console.log('✅ Uppdaterade näringsvärden för', slug, updated.nutrition);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });



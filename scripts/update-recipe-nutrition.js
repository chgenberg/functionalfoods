const { PrismaClient } = require('@prisma/client');

async function main() {
  const [,, slug, energyStr, proteinStr, carbsStr, fatStr, fiberStr] = process.argv;
  if (!slug || [energyStr, proteinStr, carbsStr, fatStr, fiberStr].some(v => v === undefined)) {
    console.error('Usage: node scripts/update-recipe-nutrition.js <slug> <energy_kcal> <protein_g> <carbs_g> <fat_g> <fiber_g>');
    process.exit(1);
  }

  const energy = Number(energyStr);
  const protein = Number(proteinStr);
  const carbohydrates = Number(carbsStr);
  const fat = Number(fatStr);
  const fiber = Number(fiberStr);

  const prisma = new PrismaClient();
  try {
    const recipe = await prisma.recipe.findUnique({ where: { slug } });
    if (!recipe) {
      console.error('Recipe not found for slug:', slug);
      process.exit(1);
    }

    const nextNutrition = {
      perServing: { energy, protein, carbohydrates, fat, fiber }
    };

    await prisma.recipe.update({
      where: { slug },
      data: { nutrition: nextNutrition }
    });

    console.log(`Updated nutrition for ${slug}:`, nextNutrition);
  } catch (e) {
    console.error('Failed to update recipe nutrition:', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();



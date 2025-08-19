const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const missing = await prisma.recipe.findMany({
      where: {
        OR: [
          { instructions: null },
          { instructions: '' },
          { ingredients: { isEmpty: true } }
        ]
      },
      select: { title: true, slug: true, ingredients: true, instructions: true }
    });

    console.log(`❌ Recipes missing data: ${missing.length}`);
    for (const r of missing) {
      const issues = [];
      if (!r.instructions || r.instructions.trim() === '') issues.push('no instructions');
      if (!r.ingredients || r.ingredients.length === 0) issues.push('no ingredients');
      console.log(`- ${r.title} (${r.slug}): ${issues.join(', ')}`);
    }

    if (missing.length === 0) {
      console.log('✅ All recipes have ingredients and instructions!');
    }
  } catch (e) {
    console.error('❌ Validation failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 
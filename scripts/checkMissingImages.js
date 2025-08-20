const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMissingImages() {
  // Get all recipes without images
  const recipesWithoutImages = await prisma.recipe.findMany({
    where: {
      AND: [
        { imageUrl: null },
        { imageMobileUrl: null }
      ]
    },
    select: {
      id: true,
      title: true,
      slug: true
    }
  });

  console.log(`\nRecept utan bilder (${recipesWithoutImages.length} st):\n`);
  
  recipesWithoutImages.forEach(recipe => {
    console.log(`- ${recipe.title} (slug: ${recipe.slug})`);
  });

  // Also check recipes with only one image type
  const recipesPartialImages = await prisma.recipe.findMany({
    where: {
      OR: [
        { AND: [{ imageUrl: { not: null } }, { imageMobileUrl: null }] },
        { AND: [{ imageUrl: null }, { imageMobileUrl: { not: null } }] }
      ]
    },
    select: {
      title: true,
      imageUrl: true,
      imageMobileUrl: true
    }
  });

  console.log(`\nRecept med bara en bildtyp (${recipesPartialImages.length} st):\n`);
  recipesPartialImages.forEach(recipe => {
    const hasDesktop = recipe.imageUrl ? 'Desktop' : '';
    const hasMobile = recipe.imageMobileUrl ? 'Mobile' : '';
    console.log(`- ${recipe.title} (har: ${hasDesktop}${hasMobile})`);
  });

  await prisma.$disconnect();
}

checkMissingImages().catch(e => {
  console.error(e);
  prisma.$disconnect();
});

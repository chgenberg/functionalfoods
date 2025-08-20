const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function countImages() {
  // Total recipes
  const totalRecipes = await prisma.recipe.count();
  
  // Recipes with at least one image
  const recipesWithImages = await prisma.recipe.count({
    where: {
      OR: [
        { imageUrl: { not: null } },
        { imageMobileUrl: { not: null } }
      ]
    }
  });
  
  // Recipes with both desktop and mobile images
  const recipesWithBothImages = await prisma.recipe.count({
    where: {
      AND: [
        { imageUrl: { not: null } },
        { imageMobileUrl: { not: null } }
      ]
    }
  });
  
  // Recipes with only desktop
  const recipesOnlyDesktop = await prisma.recipe.count({
    where: {
      AND: [
        { imageUrl: { not: null } },
        { imageMobileUrl: null }
      ]
    }
  });
  
  // Recipes with only mobile
  const recipesOnlyMobile = await prisma.recipe.count({
    where: {
      AND: [
        { imageUrl: null },
        { imageMobileUrl: { not: null } }
      ]
    }
  });
  
  // Recipes without any images
  const recipesWithoutImages = await prisma.recipe.count({
    where: {
      AND: [
        { imageUrl: null },
        { imageMobileUrl: null }
      ]
    }
  });

  console.log('\n=== RECEPTBILDER STATISTIK ===\n');
  console.log(`📊 Totalt antal recept: ${totalRecipes}`);
  console.log(`✅ Recept med minst en bild: ${recipesWithImages} (${Math.round(recipesWithImages/totalRecipes*100)}%)`);
  console.log(`🖼️  Recept med både desktop & mobile: ${recipesWithBothImages}`);
  console.log(`💻 Recept med bara desktop-bild: ${recipesOnlyDesktop}`);
  console.log(`📱 Recept med bara mobile-bild: ${recipesOnlyMobile}`);
  console.log(`❌ Recept utan bilder: ${recipesWithoutImages} (${Math.round(recipesWithoutImages/totalRecipes*100)}%)`);
  
  console.log('\n=== SENASTE UPPDATERINGAR ===');
  
  // Get recently updated recipes (last 10)
  const recentlyUpdated = await prisma.recipe.findMany({
    where: {
      OR: [
        { imageUrl: { not: null } },
        { imageMobileUrl: { not: null } }
      ]
    },
    orderBy: { updatedAt: 'desc' },
    take: 10,
    select: {
      title: true,
      imageUrl: true,
      imageMobileUrl: true,
      updatedAt: true
    }
  });
  
  recentlyUpdated.forEach(recipe => {
    const images = [];
    if (recipe.imageUrl) images.push('Desktop');
    if (recipe.imageMobileUrl) images.push('Mobile');
    console.log(`- ${recipe.title} (${images.join(' + ')})`);
  });

  await prisma.$disconnect();
}

countImages().catch(e => {
  console.error(e);
  prisma.$disconnect();
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeUDRecipesWithoutImages() {
  try {
    console.log('🗑️ Tar bort UD-recept utan bilder...');
    
    // Hitta alla UD-recept utan bilder
    const recipesWithoutImages = await prisma.recipe.findMany({
      where: {
        tags: { has: 'UD' },
        OR: [
          { imageUrl: null },
          { imageUrl: '' }
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true
      }
    });
    
    console.log(`🔍 Hittade ${recipesWithoutImages.length} UD-recept utan bilder`);
    
    if (recipesWithoutImages.length > 0) {
      // Ta bort recepten
      const deleteResult = await prisma.recipe.deleteMany({
        where: {
          id: {
            in: recipesWithoutImages.map(r => r.id)
          }
        }
      });
      
      console.log(`✅ Tog bort ${deleteResult.count} recept`);
      
      // Visa några exempel
      console.log('\n📋 Borttagna recept (första 10):');
      recipesWithoutImages.slice(0, 10).forEach(r => {
        console.log(`  - ${r.title}`);
      });
      
      if (recipesWithoutImages.length > 10) {
        console.log(`  ... och ${recipesWithoutImages.length - 10} till`);
      }
    }
    
    // Visa slutstatistik
    const totalRecipes = await prisma.recipe.count();
    const udRecipes = await prisma.recipe.count({ where: { tags: { has: 'UD' } } });
    const adminOnlyRecipes = await prisma.recipe.count({ where: { tags: { has: 'ADMIN_ONLY' } } });
    
    console.log('\n📊 Slutstatistik:');
    console.log(`Totalt antal recept: ${totalRecipes}`);
    console.log(`UD-recept: ${udRecipes}`);
    console.log(`ADMIN_ONLY-recept: ${adminOnlyRecipes}`);
    
  } catch (error) {
    console.error('❌ Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  removeUDRecipesWithoutImages();
}

module.exports = { removeUDRecipesWithoutImages }; 
const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function updateToRecept2() {
  try {
    console.log('🔄 Updating all recipe images to use Recept_complete2.0...\n');

    // Get all recipes with Recept_complete images
    const recipes = await prisma.recipe.findMany({
      where: {
        imageUrl: {
          contains: '/Recept_complete/'
        }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        imageUrl: true
      }
    });

    console.log(`Found ${recipes.length} recipes with Recept_complete images`);

    let updated = 0;
    let notFound = 0;

    for (const recipe of recipes) {
      // Replace Recept_complete with Recept_complete2.0
      const newUrl = recipe.imageUrl.replace('/Recept_complete/', '/Recept_complete2.0/');
      
      // Check if the new file exists
      const filePath = path.join(process.cwd(), 'public', newUrl);
      
      try {
        await fs.access(filePath);
        
        // Update the recipe
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: { imageUrl: newUrl }
        });
        
        console.log(`✅ Updated: ${recipe.title}`);
        console.log(`   ${recipe.imageUrl} → ${newUrl}`);
        updated++;
      } catch (err) {
        console.log(`❌ File not found: ${recipe.title}`);
        console.log(`   Missing: ${newUrl}`);
        notFound++;
      }
    }

    console.log(`\n📊 SUMMARY`);
    console.log(`============`);
    console.log(`Total recipes: ${recipes.length}`);
    console.log(`Updated: ${updated}`);
    console.log(`Not found: ${notFound}`);

  } catch (error) {
    console.error('❌ Error updating images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  updateToRecept2();
} 
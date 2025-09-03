const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for vegetarisk currygryta med paneer recipe...\n');
  
  try {
    // Search for the recipe
    const recipe = await prisma.recipe.findUnique({
      where: { slug: 'vegetarisk-currygryta-med-paneer' }
    });
    
    if (recipe) {
      console.log('✅ Recipe found:');
      console.log(`   Title: ${recipe.title}`);
      console.log(`   Slug: ${recipe.slug}`);
      console.log(`   ID: ${recipe.id}`);
    } else {
      console.log('❌ Recipe NOT found with slug: vegetarisk-currygryta-med-paneer');
      
      // Search for similar recipes
      console.log('\n🔍 Searching for similar recipes...');
      const similarRecipes = await prisma.recipe.findMany({
        where: {
          OR: [
            { title: { contains: 'curry', mode: 'insensitive' } },
            { title: { contains: 'paneer', mode: 'insensitive' } },
            { title: { contains: 'panéer', mode: 'insensitive' } },
            { title: { contains: 'vegetarisk', mode: 'insensitive' } },
            { slug: { contains: 'curry', mode: 'insensitive' } },
            { slug: { contains: 'paneer', mode: 'insensitive' } }
          ]
        },
        select: {
          title: true,
          slug: true,
          id: true
        }
      });
      
      if (similarRecipes.length > 0) {
        console.log('\n📋 Similar recipes found:');
        similarRecipes.forEach(recipe => {
          console.log(`   ${recipe.title} -> ${recipe.slug}`);
        });
      } else {
        console.log('\n❌ No similar recipes found');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
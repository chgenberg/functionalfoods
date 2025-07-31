const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listRecipes() {
  try {
    console.log('📋 Listing all recipes in database...\n');
    
    const recipes = await prisma.recipe.findMany({
      orderBy: [
        { categories: 'asc' },
        { title: 'asc' }
      ],
      select: {
        title: true,
        slug: true,
        categories: true,
        isPremium: true,
        isFree: true
      }
    });

    console.log(`Found ${recipes.length} recipes:\n`);

    const basicRecipes = recipes.filter(r => r.categories && r.categories.includes('basic'));
    const flowRecipes = recipes.filter(r => r.categories && r.categories.includes('flow'));
    const freeRecipes = recipes.filter(r => r.isFree);

    console.log('🔵 BASIC RECIPES:');
    basicRecipes.forEach(recipe => {
      console.log(`- ${recipe.title} → /kunskapsbank/recept/${recipe.slug}`);
    });

    console.log('\n🟣 FLOW RECIPES:');
    flowRecipes.forEach(recipe => {
      console.log(`- ${recipe.title} → /kunskapsbank/recept/${recipe.slug}`);
    });

    console.log('\n🟢 FREE RECIPES:');
    freeRecipes.forEach(recipe => {
      console.log(`- ${recipe.title} → /kunskapsbank/recept/${recipe.slug}`);
    });

    console.log('\n📊 SUMMARY:');
    console.log(`Total recipes: ${recipes.length}`);
    console.log(`Basic recipes: ${basicRecipes.length}`);
    console.log(`Flow recipes: ${flowRecipes.length}`);
    console.log(`Free recipes: ${freeRecipes.length}`);

  } catch (error) {
    console.error('Error listing recipes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listRecipes(); 
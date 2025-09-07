const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecipeStatus() {
  try {
    // Hämta alla recept
    const recipes = await prisma.recipe.findMany({
      select: {
        title: true,
        slug: true,
        tags: true,
        isPremium: true,
        isFree: true,
        imageUrl: true
      },
      orderBy: { title: 'asc' }
    });

    // Statistik
    const courseRecipes = recipes.filter(r => r.tags?.some(t => ['Basic','Flow','Energy'].includes(t)));
    const freeRecipes = recipes.filter(r => r.isFree);
    const premiumRecipes = recipes.filter(r => r.isPremium && !r.isFree);
    
    console.log('📊 Recipe Statistics:');
    console.log(`Total recipes: ${recipes.length}`);
    console.log(`Course recipes: ${courseRecipes.length}`);
    console.log(`Free recipes: ${freeRecipes.length}`);
    console.log(`Premium recipes: ${premiumRecipes.length}`);
    
    // Visa några exempel på kursrecept
    console.log('\n📚 Sample Course Recipes:');
    courseRecipes.slice(0, 10).forEach(r => {
      console.log(`- ${r.title} [${r.tags?.join(', ')}] - ${r.isPremium ? 'Premium' : 'Not Premium'}, ${r.isFree ? 'Free' : 'Not Free'}`);
    });
    
    // Kolla om havregrynsgröt med ananas finns
    console.log('\n🔍 Looking for havregrynsgröt-med-ananas...');
    const havregrot = recipes.find(r => r.slug === 'havregrynsgrot-med-ananas');
    if (havregrot) {
      console.log('Found:', {
        title: havregrot.title,
        tags: havregrot.tags,
        isPremium: havregrot.isPremium,
        isFree: havregrot.isFree,
        imageUrl: havregrot.imageUrl
      });
    } else {
      console.log('Not found!');
    }
    
    // Kolla recept som inte har rätt flags
    console.log('\n⚠️ Recipes with inconsistent flags:');
    const inconsistent = recipes.filter(r => {
      const isCourseRecipe = r.tags?.some(t => ['Basic','Flow','Energy'].includes(t));
      const shouldBeFree = !isCourseRecipe && !r.isPremium;
      const isActuallyFree = r.isFree === true;
      return shouldBeFree !== isActuallyFree;
    });
    
    inconsistent.slice(0, 10).forEach(r => {
      console.log(`- ${r.title}: tags=${r.tags?.join(',')}, isPremium=${r.isPremium}, isFree=${r.isFree}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecipeStatus(); 
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Manually define a subset of energyMealPlans for verification
const energyMealPlans = {
  "week1": {
    "title": "Vecka 1: Typ 2-diabetes kostschema",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola  (420 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-granola"
        },
        "lunch": {
          "name": "Omelett med paprika och champinjoner  (286 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-med-paprika-och-champinjoner"
        },
        "dinner": {
          "name": "Kycklingburgare med mangosalsa och wasabi (332 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingburgare-med-mangosalsa-och-wasabi"
        }
      }
    }
  }
};

async function verifyEnergyRecipes() {
  console.log('🔍 Verifying Functional Energy recipe links...\n');

  // Get all recipes from database
  const allRecipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      isPremium: true,
      isFree: true
    }
  });

  console.log(`📊 Total recipes in database: ${allRecipes.length}`);
  console.log(`📋 Checking Functional Energy meal plans\n`);

  let totalMeals = 0;
  let linkedMeals = 0;
  let brokenLinks = [];
  let unlinkedMeals = [];

  // Check each week
  for (const [weekKey, weekPlan] of Object.entries(energyMealPlans)) {
    console.log(`📅 ${weekPlan.title}`);
    
    // Check each day
    for (const [dayName, dayMeals] of Object.entries(weekPlan.days)) {
      // Check each meal type
      for (const [mealType, meal] of Object.entries(dayMeals)) {
        if (meal && meal.name) {
          totalMeals++;
          
          if (meal.recipeLink) {
            linkedMeals++;
            
            // Extract slug from recipe link
            const slug = meal.recipeLink.replace('/kunskapsbank/recept/', '');
            
            // Find matching recipe
            const matchingRecipe = allRecipes.find(r => r.slug === slug);
            
            if (matchingRecipe) {
              const access = matchingRecipe.isPremium ? 'premium' : (matchingRecipe.isFree ? 'free' : 'unknown');
              console.log(`  ✅ ${dayName} ${mealType}: "${meal.name}" → ${matchingRecipe.title} (${access})`);
            } else {
              console.log(`  ❌ ${dayName} ${mealType}: "${meal.name}" → BROKEN LINK: ${slug}`);
              brokenLinks.push({
                week: weekKey,
                day: dayName,
                mealType,
                mealName: meal.name,
                brokenSlug: slug,
                recipeLink: meal.recipeLink
              });
            }
          } else {
            console.log(`  ⚠️  ${dayName} ${mealType}: "${meal.name}" → NO LINK`);
            unlinkedMeals.push({
              week: weekKey,
              day: dayName,
              mealType,
              mealName: meal.name
            });
          }
        }
      }
    }
    console.log('');
  }

  // Summary
  console.log('📊 SUMMARY:');
  console.log(`Total meals checked: ${totalMeals}`);
  console.log(`Linked meals: ${linkedMeals}`);
  console.log(`Unlinked meals: ${unlinkedMeals.length}`);
  console.log(`Broken links: ${brokenLinks.length}`);
  console.log(`Success rate: ${Math.round((linkedMeals - brokenLinks.length) / totalMeals * 100)}%\n`);

  if (brokenLinks.length > 0) {
    console.log('❌ BROKEN LINKS:');
    brokenLinks.forEach(link => {
      console.log(`  ${link.week} ${link.day} ${link.mealType}: "${link.mealName}" → ${link.brokenSlug}`);
    });
    console.log('');
  }

  // Check total energy recipes in database
  const premiumRecipes = await prisma.recipe.findMany({
    where: { isPremium: true },
    select: { title: true, isPremium: true }
  });
  
  console.log('🔐 RECIPE ACCESS LEVELS:');
  console.log(`Premium recipes: ${premiumRecipes.length}`);
  
  const freeRecipes = await prisma.recipe.findMany({
    where: { isFree: true },
    select: { title: true, isFree: true }
  });
  
  console.log(`Free recipes: ${freeRecipes.length}`);
  
  const totalRecipeCount = await prisma.recipe.count();
  console.log(`Total recipes: ${totalRecipeCount}`);

  await prisma.$disconnect();
  
  return {
    totalMeals,
    linkedMeals,
    brokenLinks: brokenLinks.length,
    unlinkedMeals: unlinkedMeals.length,
    successRate: Math.round((linkedMeals - brokenLinks.length) / totalMeals * 100)
  };
}

if (require.main === module) {
  verifyEnergyRecipes()
    .then(result => {
      console.log('\n🎯 Verification complete!');
      console.log('Note: This is a sample check. Full verification requires examining all 6 weeks of meal plans.');
    })
    .catch(console.error);
}

module.exports = { verifyEnergyRecipes }; 
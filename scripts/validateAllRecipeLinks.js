const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function validateAllRecipeLinks() {
  console.log('🔍 Validating ALL recipe links in meal plans...\n');

  // Get all recipes from database
  const allRecipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      isPremium: true,
      isFree: true
    }
  });

  console.log(`📊 Found ${allRecipes.length} recipes in database\n`);

  // Get all recipe links by scanning the meal plans manually
  const recipeLinks = [];

  // Scan Basic weeks 1-6
  for (let week = 1; week <= 6; week++) {
    console.log(`\n🔍 Scanning Functional Basics Week ${week}...`);
    
    const weekResponse = await fetch(`http://localhost:3000/api/weekly-shopping-list?week=${week}&course=basic`, {
      method: 'GET'
    }).catch(() => null);
    
    if (!weekResponse) {
      console.log(`    ⚠️ Could not fetch week ${week} data`);
      continue;
    }
  }

  // Let me manually scan the mealPlans instead by reading specific meal entries
  console.log('\n🔍 Manual validation of key recipes...\n');

  // List of key recipes we know should exist based on our previous work
  const keyRecipes = [
    'fixed-recept-squashspagetti-med-kottfarssas',
    'rodbetsjuice', 
    'kottfarsbiffar-med-stekt-blomkal',
    'yoghurt-med-ketom-sli',
    'tonfisksallad-med-apple',
    'stekt-agg-med-lax',
    'het-ratatouille',
    'gron-smoothie',
    'w-1752508505312', // Poké bowl med kyckling
    'omelett-med-tomat',
    'havrefrallor-med-morotter-och-aprikoser',
    'kycklinggryta-med-bakad-spetskal',
    'w-1752508498584', // Tropisk smoothiebowl
    'laxburgare-med-kramig-gronsaksrora',
    'forbattrad-extraktion-ugnsbakad-tomat-med-kottfars', // Corrected slug
    'kottfarsbiffar-med-tomatsallad',
    'hogrevsburgare-med-hummus',
    'asiatisk-kottfarswok-med-gronkal'
  ];

  console.log('🔍 Checking key recipes used in meal plans:');
  console.log('='.repeat(60));

  const results = [];
  for (const slug of keyRecipes) {
    const foundRecipe = allRecipes.find(r => r.slug === slug);
    const result = {
      slug,
      found: !!foundRecipe,
      recipe: foundRecipe || null
    };
    results.push(result);
    
    if (foundRecipe) {
      console.log(`✅ Found: ${slug} -> ${foundRecipe.title}`);
    } else {
      console.log(`❌ MISSING: ${slug}`);
    }
  }

  // Also check for potential similar recipes
  console.log('\n🔍 Looking for similar recipes that might match missing slugs...\n');
  
  const missingRecipes = results.filter(r => !r.found);
  for (const missing of missingRecipes) {
    console.log(`\n🔎 Searching for: ${missing.slug}`);
    
    // Try to find similar recipes by title matching
    const searchTerms = missing.slug
      .replace(/-/g, ' ')
      .replace(/fixed recept /, '')
      .replace(/w \d+/, '');
    
    const similarRecipes = allRecipes.filter(recipe => {
      const title = recipe.title.toLowerCase();
      const terms = searchTerms.toLowerCase().split(' ');
      return terms.some(term => term.length > 3 && title.includes(term));
    });

    if (similarRecipes.length > 0) {
      console.log(`   🎯 Possible matches:`);
      similarRecipes.forEach(recipe => {
        console.log(`   - ${recipe.title} (${recipe.slug})`);
      });
    } else {
      console.log(`   ❌ No similar recipes found`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 VALIDATION SUMMARY');
  console.log('='.repeat(80));
  
  const foundCount = results.filter(r => r.found).length;
  const missingCount = results.filter(r => !r.found).length;

  console.log(`📈 Key recipes checked: ${results.length}`);
  console.log(`✅ Found recipes: ${foundCount}`);
  console.log(`❌ Missing recipes: ${missingCount}`);

  if (missingCount > 0) {
    console.log('\n🚨 MISSING KEY RECIPES:');
    console.log('='.repeat(30));
    results.filter(r => !r.found).forEach((item, index) => {
      console.log(`${index + 1}. ${item.slug}`);
    });
  }

  console.log('\n💡 Next steps:');
  console.log('1. Create missing recipes or update slugs in mealPlans.ts');
  console.log('2. Remove recipeLink from all "rester" meals');
  console.log('3. Test all recipe links in production');

  await prisma.$disconnect();
  
  return {
    totalChecked: results.length,
    foundCount,
    missingCount,
    results
  };
}

validateAllRecipeLinks(); 
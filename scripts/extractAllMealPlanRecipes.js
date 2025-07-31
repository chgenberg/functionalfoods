const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function extractAllMealPlanRecipes() {
  console.log('🔍 Extracting ALL recipe links from mealPlans.ts...\n');

  // Read the mealPlans.ts file
  const filePath = path.join(__dirname, '../app/data/mealPlans.ts');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Extract all recipeLink values using regex
  const recipeLinkRegex = /"recipeLink":\s*"([^"]+)"/g;
  const allLinks = [];
  let match;

  while ((match = recipeLinkRegex.exec(fileContent)) !== null) {
    const fullLink = match[1];
    const slug = fullLink.replace('/kunskapsbank/recept/', '');
    allLinks.push({ fullLink, slug });
  }

  // Remove duplicates
  const uniqueLinks = allLinks.filter((link, index, self) => 
    index === self.findIndex(l => l.slug === link.slug)
  );

  console.log(`📊 Found ${allLinks.length} total recipe links (${uniqueLinks.length} unique)\n`);

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

  // Validate each unique link
  const results = [];
  const missing = [];
  const found = [];

  console.log('🔍 Validating all unique recipe links:');
  console.log('='.repeat(70));

  for (const link of uniqueLinks) {
    const foundRecipe = allRecipes.find(r => r.slug === link.slug);
    
    if (foundRecipe) {
      console.log(`✅ ${link.slug} -> ${foundRecipe.title}`);
      found.push({ link, recipe: foundRecipe });
    } else {
      console.log(`❌ ${link.slug} -> NOT FOUND`);
      missing.push(link);
    }
    
    results.push({
      slug: link.slug,
      fullLink: link.fullLink,
      found: !!foundRecipe,
      recipe: foundRecipe || null
    });
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE VALIDATION SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`📈 Total unique recipe links: ${uniqueLinks.length}`);
  console.log(`✅ Found recipes: ${found.length}`);
  console.log(`❌ Missing recipes: ${missing.length}`);
  console.log(`📊 Success rate: ${((found.length / uniqueLinks.length) * 100).toFixed(1)}%`);

  if (missing.length > 0) {
    console.log('\n🚨 MISSING RECIPES:');
    console.log('='.repeat(40));
    missing.forEach((link, index) => {
      console.log(`${index + 1}. ${link.slug}`);
      console.log(`   Full link: ${link.fullLink}`);
      
      // Try to find similar recipes
      const searchTerms = link.slug
        .replace(/-/g, ' ')
        .replace(/fixed recept /, '')
        .replace(/w \d+/, '')
        .replace(/forbattrad extraktion /, '');
      
      const similarRecipes = allRecipes.filter(recipe => {
        const title = recipe.title.toLowerCase();
        const terms = searchTerms.toLowerCase().split(' ');
        return terms.some(term => term.length > 3 && title.includes(term));
      });

      if (similarRecipes.length > 0) {
        console.log(`   🎯 Possible matches:`);
        similarRecipes.slice(0, 3).forEach(recipe => {
          console.log(`   - ${recipe.title} (${recipe.slug})`);
        });
      }
      console.log('');
    });
  }

  console.log('\n💡 Next steps:');
  if (missing.length > 0) {
    console.log('1. Create missing recipes or update slugs in mealPlans.ts');
    console.log('2. Search for alternative slugs for missing recipes');
  } else {
    console.log('1. ✅ All recipe links are valid!');
  }
  console.log('2. Test recipe access with different user accounts');
  console.log('3. Verify "rester" meals have no links');

  await prisma.$disconnect();
  
  return {
    totalLinks: allLinks.length,
    uniqueLinks: uniqueLinks.length,
    found: found.length,
    missing: missing.length,
    results,
    missingLinks: missing
  };
}

extractAllMealPlanRecipes(); 
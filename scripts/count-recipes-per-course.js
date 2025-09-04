const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function countRecipesPerCourse() {
  console.log('📊 Counting recipes per course and access levels...\n');

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

  console.log(`📋 Total recipes in database: ${allRecipes.length}\n`);

  // Read meal plans file to extract course-linked recipes
  const mealPlansPath = path.join(__dirname, '../app/data/mealPlans.ts');
  const mealPlansContent = fs.readFileSync(mealPlansPath, 'utf8');

  // Extract recipe slugs from each course
  const extractRecipeSlugs = (courseSection) => {
    const recipeLinks = courseSection.match(/recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g) || [];
    return recipeLinks.map(link => {
      const match = link.match(/recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/);
      return match ? match[1] : null;
    }).filter(Boolean);
  };

  // Extract Functional Basics recipes
  const basicsMatch = mealPlansContent.match(/export const mealPlans[^}]+}[^;]+;/s);
  const basicsSlugs = basicsMatch ? extractRecipeSlugs(basicsMatch[0]) : [];
  const uniqueBasicsSlugs = [...new Set(basicsSlugs)];

  // Extract Functional Flow recipes
  const flowMatch = mealPlansContent.match(/export const flowMealPlans[^}]+}[^;]+;/s);
  const flowSlugs = flowMatch ? extractRecipeSlugs(flowMatch[0]) : [];
  const uniqueFlowSlugs = [...new Set(flowSlugs)];

  // Extract Functional Energy recipes
  const energyMatch = mealPlansContent.match(/export const energyMealPlans[^}]+}[^;]+;/s);
  const energySlugs = energyMatch ? extractRecipeSlugs(energyMatch[0]) : [];
  const uniqueEnergySlugs = [...new Set(energySlugs)];

  // Find matching recipes in database
  const basicsRecipes = allRecipes.filter(recipe => uniqueBasicsSlugs.includes(recipe.slug));
  const flowRecipes = allRecipes.filter(recipe => uniqueFlowSlugs.includes(recipe.slug));
  const energyRecipes = allRecipes.filter(recipe => uniqueEnergySlugs.includes(recipe.slug));

  // Get all course-linked recipes (union of all courses)
  const allCourseLinkedSlugs = [...new Set([...uniqueBasicsSlugs, ...uniqueFlowSlugs, ...uniqueEnergySlugs])];
  const allCourseLinkedRecipes = allRecipes.filter(recipe => allCourseLinkedSlugs.includes(recipe.slug));

  // Get free recipes (not linked to any course)
  const freeRecipes = allRecipes.filter(recipe => !allCourseLinkedSlugs.includes(recipe.slug));

  // Count access levels
  const countAccessLevels = (recipes) => {
    const premium = recipes.filter(r => r.isPremium).length;
    const free = recipes.filter(r => r.isFree || !r.isPremium).length;
    return { premium, free, total: recipes.length };
  };

  const basicsStats = countAccessLevels(basicsRecipes);
  const flowStats = countAccessLevels(flowRecipes);
  const energyStats = countAccessLevels(energyRecipes);
  const freeStats = countAccessLevels(freeRecipes);

  // Display results
  console.log('🎯 RECEPT PER KURS:');
  console.log(`┌─────────────────────┬─────────┬─────────┬─────────┐`);
  console.log(`│ Kurs                │ Premium │ Gratis  │ Totalt  │`);
  console.log(`├─────────────────────┼─────────┼─────────┼─────────┤`);
  console.log(`│ Functional Basics   │ ${basicsStats.premium.toString().padStart(7)} │ ${basicsStats.free.toString().padStart(7)} │ ${basicsStats.total.toString().padStart(7)} │`);
  console.log(`│ Functional Flow     │ ${flowStats.premium.toString().padStart(7)} │ ${flowStats.free.toString().padStart(7)} │ ${flowStats.total.toString().padStart(7)} │`);
  console.log(`│ Functional Energy   │ ${energyStats.premium.toString().padStart(7)} │ ${energyStats.free.toString().padStart(7)} │ ${energyStats.total.toString().padStart(7)} │`);
  console.log(`└─────────────────────┴─────────┴─────────┴─────────┘`);

  console.log(`\n📊 SAMMANFATTNING:`);
  console.log(`Total kurs-länkade recept: ${allCourseLinkedRecipes.length}`);
  console.log(`- Premium (endast för kursköpare): ${allCourseLinkedRecipes.filter(r => r.isPremium).length}`);
  console.log(`- Gratis (även för icke-kursköpare): ${allCourseLinkedRecipes.filter(r => r.isFree || !r.isPremium).length}`);

  console.log(`\nGratis recept (ej kurs-länkade): ${freeRecipes.length}`);
  console.log(`- Visas i hemsidans carousel: ${freeRecipes.filter(r => r.isFree || !r.isPremium).length}`);

  console.log(`\n🔢 TOTALT I DATABASEN:`);
  console.log(`Alla recept: ${allRecipes.length}`);
  console.log(`Premium recept: ${allRecipes.filter(r => r.isPremium).length}`);
  console.log(`Gratis recept: ${allRecipes.filter(r => r.isFree || !r.isPremium).length}`);

  // Check for missing recipes (slugs in meal plans but not in database)
  const missingBasics = uniqueBasicsSlugs.filter(slug => !allRecipes.find(r => r.slug === slug));
  const missingFlow = uniqueFlowSlugs.filter(slug => !allRecipes.find(r => r.slug === slug));
  const missingEnergy = uniqueEnergySlugs.filter(slug => !allRecipes.find(r => r.slug === slug));

  if (missingBasics.length > 0 || missingFlow.length > 0 || missingEnergy.length > 0) {
    console.log(`\n⚠️  SAKNADE RECEPT:`);
    if (missingBasics.length > 0) {
      console.log(`Functional Basics: ${missingBasics.length} saknade`);
      missingBasics.slice(0, 5).forEach(slug => console.log(`  - ${slug}`));
    }
    if (missingFlow.length > 0) {
      console.log(`Functional Flow: ${missingFlow.length} saknade`);
      missingFlow.slice(0, 5).forEach(slug => console.log(`  - ${slug}`));
    }
    if (missingEnergy.length > 0) {
      console.log(`Functional Energy: ${missingEnergy.length} saknade`);
      missingEnergy.slice(0, 5).forEach(slug => console.log(`  - ${slug}`));
    }
  }

  // Check overlap between courses
  const basicsFlowOverlap = uniqueBasicsSlugs.filter(slug => uniqueFlowSlugs.includes(slug));
  const basicsEnergyOverlap = uniqueBasicsSlugs.filter(slug => uniqueEnergySlugs.includes(slug));
  const flowEnergyOverlap = uniqueFlowSlugs.filter(slug => uniqueEnergySlugs.includes(slug));

  console.log(`\n🔄 ÖVERLAPPNING MELLAN KURSER:`);
  console.log(`Basics ∩ Flow: ${basicsFlowOverlap.length} recept`);
  console.log(`Basics ∩ Energy: ${basicsEnergyOverlap.length} recept`);
  console.log(`Flow ∩ Energy: ${flowEnergyOverlap.length} recept`);

  await prisma.$disconnect();

  return {
    basics: basicsStats,
    flow: flowStats,
    energy: energyStats,
    totalCourseLinked: allCourseLinkedRecipes.length,
    totalFree: freeRecipes.length,
    totalInDatabase: allRecipes.length
  };
}

if (require.main === module) {
  countRecipesPerCourse()
    .then(result => {
      console.log('\n✅ Räkning klar!');
    })
    .catch(console.error);
}

module.exports = { countRecipesPerCourse }; 
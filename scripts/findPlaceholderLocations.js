const fs = require('fs');
const path = require('path');

// Load meal plans
require('ts-node/register/transpile-only');
const mealPlansPath = path.resolve(__dirname, '../app/data/mealPlans.ts');
const { mealPlans, flowMealPlans } = require(mealPlansPath);

const placeholders = [
  '1 havrefrallor med morötter och aprikoser + valfritt pålägg',
  'Lax med fetaost och rostade rotfrukter och brysselkål',
  'Blåbärs smoothiebowl',
  'Äggröra med rökt lax',
  'Rödbetsjuice',
  'Grillade köttspett med grekisk sallad och morotstzatziki',
  'Grekisk sallad med fetaost',
  'Köttfärslimpa med ajvar, fetaost och rostad sötpotatis',
  'Lammgryta plommon och bulgur',
  'Laxgratäng med scampi och broccoli',
  'Ugnsomelett med bär',
  'Färskostmacka med ost och paprika',
  'Kyckling med blomkålsris och dillyoghurt',
];

console.log('🔍 Letar efter placeholder-recept i kostschemana...\n');

function findRecipeInMealPlans(recipeName, mealPlansData, courseType) {
  const locations = [];
  
  for (const [weekKey, weekPlan] of Object.entries(mealPlansData)) {
    for (const [day, dayMeals] of Object.entries(weekPlan.days)) {
      for (const [slot, meal] of Object.entries(dayMeals)) {
        if (meal && meal.name) {
          // Check if recipe name matches (case insensitive, partial match)
          const mealNameLower = meal.name.toLowerCase();
          const recipeNameLower = recipeName.toLowerCase();
          
          if (mealNameLower.includes(recipeNameLower) || recipeNameLower.includes(mealNameLower)) {
            locations.push({
              course: courseType,
              week: weekKey,
              day,
              slot,
              mealName: meal.name,
              hasLink: !!meal.recipeLink
            });
          }
        }
      }
    }
  }
  
  return locations;
}

for (const placeholder of placeholders) {
  console.log(`📋 "${placeholder}":`);
  
  // Search in Basic course
  const basicLocations = findRecipeInMealPlans(placeholder, mealPlans, 'Basic');
  
  // Search in Flow course
  const flowLocations = findRecipeInMealPlans(placeholder, flowMealPlans, 'Flow');
  
  const allLocations = [...basicLocations, ...flowLocations];
  
  if (allLocations.length === 0) {
    console.log('   ❌ Inte funnen i någon kostschema');
  } else {
    allLocations.forEach(loc => {
      const linkStatus = loc.hasLink ? '🔗' : '❌';
      console.log(`   ${linkStatus} ${loc.course} ${loc.week} ${loc.day} ${loc.slot}: "${loc.mealName}"`);
    });
  }
  console.log('');
}

console.log('Legend:');
console.log('🔗 = Har receptlänk');
console.log('❌ = Ingen receptlänk');
console.log('\nSlots: breakfast=frukost, lunch=lunch, dinner=middag'); 
const fs = require('fs');
const path = require('path');

async function cleanMealPlanCalories() {
  console.log('🧹 Cleaning calorie information from meal plan names...\n');
  
  const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
  
  try {
    // Read the file
    let content = fs.readFileSync(mealPlansPath, 'utf8');
    
    console.log('📝 Processing meal plans file...\n');
    
    // Count original occurrences
    const originalKcalMatches = content.match(/\(\d+\s*kcal\)/gi) || [];
    console.log(`🔍 Found ${originalKcalMatches.length} calorie references to clean\n`);
    
    // Remove calorie information from meal names
    // Pattern matches: (385 kcal), (385kcal), etc.
    const cleanedContent = content
      .replace(/\s*\(\d+\s*kcal\)/gi, '') // Remove "(385 kcal)" patterns
      .replace(/\s*\d+\s*kcal\s*/gi, '') // Remove "385 kcal" patterns not in parentheses
      .replace(/\s+/g, ' ') // Clean up multiple spaces
      .replace(/\s+"/g, '"') // Clean up spaces before quotes
      .replace(/"\s+/g, '"') // Clean up spaces after quotes
      .replace(/,\s*,/g, ','); // Clean up double commas
    
    // Count remaining occurrences to verify cleaning
    const remainingKcalMatches = cleanedContent.match(/\(\d+\s*kcal\)/gi) || [];
    
    if (remainingKcalMatches.length === 0) {
      // Write the cleaned content back
      fs.writeFileSync(mealPlansPath, cleanedContent, 'utf8');
      
      console.log('✅ Successfully cleaned meal plan calorie information!');
      console.log(`📊 Removed ${originalKcalMatches.length} calorie references`);
      console.log(`🎯 No remaining calorie references found`);
    } else {
      console.log(`⚠️  Still found ${remainingKcalMatches.length} calorie references`);
      console.log('Remaining patterns:', remainingKcalMatches.slice(0, 5));
    }
    
  } catch (error) {
    console.error('❌ Error cleaning meal plan calories:', error);
  }
}

cleanMealPlanCalories()
  .then(() => {
    console.log('✅ Meal plan calorie cleaning completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  }); 
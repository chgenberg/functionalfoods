const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🎯 Updating Functional Energy meal plans with real data from DOCX...\n');
  
  try {
    // Read extracted meal plans
    const extractedPath = path.join(process.cwd(), 'scripts', 'extracted-energy-meal-plans-v2.json');
    const extractedData = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));
    
    // Read current mealPlans.ts file
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    let content = fs.readFileSync(mealPlansPath, 'utf-8');
    
    // Convert extracted data to the format used in mealPlans.ts
    const energyMealPlans = {};
    
    for (const [weekKey, weekData] of Object.entries(extractedData)) {
      const weekNumber = weekData.week;
      energyMealPlans[weekKey] = {
        title: weekData.title,
        days: {}
      };
      
      for (const [dayName, meals] of Object.entries(weekData.days)) {
        energyMealPlans[weekKey].days[dayName] = {};
        
        for (const [mealType, mealData] of Object.entries(meals)) {
          energyMealPlans[weekKey].days[dayName][mealType] = {
            name: mealData.name,
            recipeLink: mealData.recipeLink
          };
        }
      }
    }
    
    // Replace the energyMealPlans object in the file
    const energyMealPlansStr = JSON.stringify(energyMealPlans, null, 2)
      .replace(/"/g, '"')
      .replace(/: {/g, ': {')
      .replace(/},/g, '},');
    
    // Find and replace the energyMealPlans section
    const startPattern = /export const energyMealPlans: Record<string, WeekMealPlan> = {/;
    const endPattern = /^};$/m;
    
    const startMatch = content.match(startPattern);
    if (!startMatch) {
      console.log('❌ Could not find energyMealPlans section in mealPlans.ts');
      return;
    }
    
    const startIndex = content.indexOf(startMatch[0]);
    const afterStart = content.substring(startIndex);
    const endMatch = afterStart.match(endPattern);
    
    if (!endMatch) {
      console.log('❌ Could not find end of energyMealPlans section');
      return;
    }
    
    const endIndex = startIndex + afterStart.indexOf(endMatch[0]) + endMatch[0].length;
    
    // Replace the section
    const newEnergySection = `export const energyMealPlans: Record<string, WeekMealPlan> = ${energyMealPlansStr};`;
    
    const newContent = content.substring(0, startIndex) + newEnergySection + content.substring(endIndex);
    
    // Write updated file
    fs.writeFileSync(mealPlansPath, newContent, 'utf-8');
    
    console.log('✅ Successfully updated energyMealPlans in mealPlans.ts');
    console.log(`📊 Updated ${Object.keys(energyMealPlans).length} weeks of meal plans`);
    
    // Show summary
    let totalMeals = 0;
    for (const weekData of Object.values(energyMealPlans)) {
      for (const dayMeals of Object.values(weekData.days)) {
        totalMeals += Object.keys(dayMeals).length;
      }
    }
    
    console.log(`🍽️  Total meals: ${totalMeals}`);
    console.log('🎉 Functional Energy meal plans now contain real data from DOCX files!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main(); 
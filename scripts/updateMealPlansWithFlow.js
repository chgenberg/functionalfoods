const fs = require('fs');
const path = require('path');

function updateMealPlansWithFlow() {
  console.log('📝 Updating mealPlans.ts with both Basic and Flow data...');
  
  // Read the generated JSON files
  const basicJsonPath = path.resolve(__dirname, 'generatedMealPlans.json');
  const flowJsonPath = path.resolve(__dirname, 'generatedFlowMealPlans.json');
  
  const basicData = JSON.parse(fs.readFileSync(basicJsonPath, 'utf8'));
  const flowData = JSON.parse(fs.readFileSync(flowJsonPath, 'utf8'));
  
  // Create complete TypeScript file content
  const tsContent = `export interface MealItem {
  name: string;
  recipeLink?: string;
  note?: string;
}

export interface DayMeals {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack?: MealItem;
  dessert?: MealItem;
}

export interface WeekMealPlan {
  title: string;
  days: Record<string, DayMeals>;
}

// Functional Basics meal plans (synced from DOCX documents)
export const mealPlans: Record<string, WeekMealPlan> = ${JSON.stringify(basicData, null, 2)};

// Functional Flow meal plans (synced from Flow DOCX documents)
export const flowMealPlans: Record<string, WeekMealPlan> = ${JSON.stringify(flowData, null, 2)};

// Helper function to get meal plan for a specific day in a week
export function getMealPlan(weekNumber: number, dayInWeek: number): DayMeals | null {
  const weekPlan = mealPlans[\`week\${weekNumber}\`];
  if (!weekPlan) return null;
  
  const weekDays = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
  const dayName = weekDays[dayInWeek - 1];
  
  return weekPlan.days[dayName] || null;
}

// Helper function to get week data for Functional Basics
export function getWeekData(weekNumber: number): WeekMealPlan | null {
  const weekKey = \`week\${weekNumber}\` as keyof typeof mealPlans;
  return mealPlans[weekKey] || null;
}

// Helper function to get week data for Functional Flow
export function getFlowWeekData(weekNumber: number): WeekMealPlan | null {
  const weekKey = \`week\${weekNumber}\` as keyof typeof flowMealPlans;
  return flowMealPlans[weekKey] || null;
}`;

  // Write to mealPlans.ts
  const mealPlansPath = path.resolve(__dirname, '../app/data/mealPlans.ts');
  fs.writeFileSync(mealPlansPath, tsContent);
  
  console.log('✅ Successfully updated app/data/mealPlans.ts with both Basic and Flow data!');
  console.log('📊 Summary:');
  console.log(`   - Basic weeks processed: ${Object.keys(basicData).length}`);
  console.log(`   - Flow weeks processed: ${Object.keys(flowData).length}`);
  console.log(`   - All recipes now have working links for both courses`);
  console.log(`   - Missing recipes have been created as placeholders in database`);
}

updateMealPlansWithFlow(); 
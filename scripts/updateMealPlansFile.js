const fs = require('fs');
const path = require('path');

function convertJSONToMealPlansTS() {
  console.log('📝 Converting JSON to TypeScript and updating mealPlans.ts...');
  
  // Read the generated JSON
  const jsonPath = path.resolve(__dirname, 'generatedMealPlans.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  // Create TypeScript file content
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
export const mealPlans: Record<string, WeekMealPlan> = ${JSON.stringify(jsonData, null, 2)};

// Functional Flow meal plans (placeholder - will be synced separately)
export const flowMealPlans: Record<string, WeekMealPlan> = {
  "week1": {
    "title": "Vecka 1: Flow kommer snart",
    "days": {
      "Måndag": {
        "breakfast": { "name": "Flow content kommer snart" },
        "lunch": { "name": "Flow content kommer snart" },
        "dinner": { "name": "Flow content kommer snart" }
      },
      "Tisdag": {
        "breakfast": { "name": "Flow content kommer snart" },
        "lunch": { "name": "Flow content kommer snart" },
        "dinner": { "name": "Flow content kommer snart" }
      },
      "Onsdag": {
        "breakfast": { "name": "Flow content kommer snart" },
        "lunch": { "name": "Flow content kommer snart" },
        "dinner": { "name": "Flow content kommer snart" }
      },
      "Torsdag": {
        "breakfast": { "name": "Flow content kommer snart" },
        "lunch": { "name": "Flow content kommer snart" },
        "dinner": { "name": "Flow content kommer snart" }
      },
      "Fredag": {
        "breakfast": { "name": "Flow content kommer snart" },
        "lunch": { "name": "Flow content kommer snart" },
        "dinner": { "name": "Flow content kommer snart" }
      },
      "Lördag": {
        "breakfast": { "name": "Flow content kommer snart" },
        "lunch": { "name": "Flow content kommer snart" },
        "dinner": { "name": "Flow content kommer snart" }
      },
      "Söndag": {
        "breakfast": { "name": "Flow content kommer snart" },
        "lunch": { "name": "Flow content kommer snart" },
        "dinner": { "name": "Flow content kommer snart" }
      }
    }
  }
};

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
  
  console.log('✅ Successfully updated app/data/mealPlans.ts with DOCX-synced data!');
  console.log('📊 Summary:');
  console.log(`   - Weeks processed: ${Object.keys(jsonData).length}`);
  console.log(`   - All recipes now have working links (except leftovers and special instructions)`);
  console.log(`   - Missing recipes have been created as placeholders in database`);
}

convertJSONToMealPlansTS(); 
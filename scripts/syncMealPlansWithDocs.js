const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

function parseMealPlan(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const mealPlan = {};
  const days = ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön'];
  const fullDays = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
  
  let currentDayIndex = -1;
  let currentMealIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const dayIndex = days.indexOf(line);
    if (dayIndex !== -1) {
      currentDayIndex = dayIndex;
      currentMealIndex = 0;
      mealPlan[fullDays[dayIndex]] = {
        breakfast: { name: '', recipeLink: '' },
        lunch: { name: '', recipeLink: '' },
        dinner: { name: '', recipeLink: '' }
      };
      continue;
    }
    
    if (currentDayIndex !== -1 && line.includes('kcal') && !line.includes('rester')) {
      const mealName = line.replace(/\s*\(\d+\s*kcal\).*$/, '').trim();
      
      if (mealName.length > 3) {
        const dayName = fullDays[currentDayIndex];
        
        if (currentMealIndex === 0) {
          mealPlan[dayName].breakfast.name = mealName;
        } else if (currentMealIndex === 1) {
          mealPlan[dayName].lunch.name = mealName;
        } else if (currentMealIndex === 2) {
          mealPlan[dayName].dinner.name = mealName;
        }
        
        currentMealIndex++;
      }
    }
  }
  
  return mealPlan;
}

async function getRecipeMap() {
  const recipes = await prisma.recipe.findMany({
    select: {
      title: true,
      slug: true
    }
  });
  
  // Create a map for quick lookup
  const recipeMap = {};
  recipes.forEach(recipe => {
    recipeMap[recipe.title.toLowerCase()] = recipe.slug;
  });
  
  return recipeMap;
}

function findBestRecipeMatch(mealName, recipeMap) {
  const cleanMealName = mealName.toLowerCase();
  
  // Exact match
  if (recipeMap[cleanMealName]) {
    return `/kunskapsbank/recept/${recipeMap[cleanMealName]}`;
  }
  
  // Partial matches
  for (const recipeTitle in recipeMap) {
    if (recipeTitle.includes(cleanMealName) || cleanMealName.includes(recipeTitle)) {
      return `/kunskapsbank/recept/${recipeMap[recipeTitle]}`;
    }
  }
  
  // No match found
  return '';
}

async function syncMealPlans() {
  console.log('🔄 Syncing meal plans with DOCX documents and database...\n');
  
  const recipeMap = await getRecipeMap();
  console.log(`📋 Found ${Object.keys(recipeMap).length} recipes in database\n`);
  
  // Basic course documents
  const basicFiles = [
    'Functionalbasic_1.docx',
    'Functionalbasic_2.docx', 
    'Functionalbasic_3.docx',
    'Functionalbasic_4.docx',
    'Functionalbasic_5.docx',
    'Functionalbasic_6.docx'
  ];

  // Flow course documents  
  const flowFiles = [
    'Functionalflow_1.docx',
    'Functionalflow_2.docx',
    'Functionalflow_3.docx', 
    'Functionalflow_4.docx',
    'Functionalflow _5.docx',
    'Functionalflow_6.docx'
  ];

  const basicMealPlans = {};
  const flowMealPlans = {};

  console.log('📋 Processing FUNCTIONAL BASICS...\n');

  for (let i = 0; i < basicFiles.length; i++) {
    const fileName = basicFiles[i];
    const filePath = path.join('public/kurser', fileName);
    
    if (fs.existsSync(filePath)) {
      console.log(`Processing Basic Week ${i + 1}: ${fileName}`);
      const text = await extractTextFromDocx(filePath);
      
      if (text) {
        const mealPlan = parseMealPlan(text);
        
        // Add recipe links
        Object.keys(mealPlan).forEach(day => {
          ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
            const meal = mealPlan[day][mealType];
            if (meal.name && !meal.name.includes('(Rester)') && !meal.name.includes('rester')) {
              meal.recipeLink = findBestRecipeMatch(meal.name, recipeMap);
              if (!meal.recipeLink) {
                console.log(`  ⚠️  No recipe found for: "${meal.name}"`);
              }
            }
          });
        });
        
        basicMealPlans[`week${i + 1}`] = {
          title: `Vecka ${i + 1}: ${getWeekTitle(i + 1, 'basic')}`,
          days: mealPlan
        };
      }
    }
  }

  console.log('\n🔄 Processing FUNCTIONAL FLOW...\n');

  for (let i = 0; i < flowFiles.length; i++) {
    const fileName = flowFiles[i];
    const filePath = path.join('public/kurser/flow', fileName);
    
    if (fs.existsSync(filePath)) {
      console.log(`Processing Flow Week ${i + 1}: ${fileName}`);
      const text = await extractTextFromDocx(filePath);
      
      if (text) {
        const mealPlan = parseMealPlan(text);
        
        // Add recipe links
        Object.keys(mealPlan).forEach(day => {
          ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
            const meal = mealPlan[day][mealType];
            if (meal.name && !meal.name.includes('(Rester)') && !meal.name.includes('rester')) {
              meal.recipeLink = findBestRecipeMatch(meal.name, recipeMap);
              if (!meal.recipeLink) {
                console.log(`  ⚠️  No recipe found for: "${meal.name}"`);
              }
            }
          });
        });
        
        flowMealPlans[`week${i + 1}`] = {
          title: `Vecka ${i + 1}: ${getWeekTitle(i + 1, 'flow')}`,
          days: mealPlan
        };
      }
    }
  }

  // Generate the updated mealPlans.ts file content
  console.log('\n📝 Generating updated mealPlans.ts...\n');
  
  const mealPlansContent = generateMealPlansFile(basicMealPlans, flowMealPlans);
  
  // Write to a new file for review
  fs.writeFileSync('scripts/updated_mealPlans.ts', mealPlansContent);
  console.log('✅ Updated meal plans written to scripts/updated_mealPlans.ts');
  console.log('📋 Review the file and then manually replace app/data/mealPlans.ts');
  
  await prisma.$disconnect();
}

function getWeekTitle(weekNum, course) {
  const basicTitles = [
    'Introduktion till Functional Foods',
    'Bygg starkare vanor', 
    'Att välja rätt kolhydrater',
    'Functional Foods Topplista',
    'Maximal energi och vitalitet',
    'Integration och framtiden'
  ];
  
  const flowTitles = [
    'Avancerad grund i Functional Foods',
    'Bygg avancerade vanor',
    'Flexibilitet & Fasta', 
    'Maximal näringsabsorption',
    'Avancerad optimering',
    'Mastery och framtiden'
  ];
  
  return course === 'basic' ? basicTitles[weekNum - 1] : flowTitles[weekNum - 1];
}

function generateMealPlansFile(basicMealPlans, flowMealPlans) {
  const header = `export interface MealItem {
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

// Functional Basics meal plans (updated from DOCX documents)
export const mealPlans: Record<string, WeekMealPlan> = `;
  
  const basicJSON = JSON.stringify(basicMealPlans, null, 2);
  
  const flowHeader = `

// Functional Flow meal plans (updated from DOCX documents)
export const flowMealPlans: Record<string, WeekMealPlan> = `;
  
  const flowJSON = JSON.stringify(flowMealPlans, null, 2);
  
  const footer = `

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

  return header + basicJSON + ';' + flowHeader + flowJSON + ';' + footer;
}

syncMealPlans().catch(console.error); 
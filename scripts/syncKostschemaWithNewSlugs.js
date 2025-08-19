const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');

const BASIC_DIR = path.resolve(process.cwd(), 'Recept-Final', 'Kostschema-basic');
const FLOW_DIR = path.resolve(process.cwd(), 'Recept-Final', 'Kostscheman-flow');
const MEAL_PLANS_PATH = path.resolve(process.cwd(), 'app', 'data', 'mealPlans.ts');

function normalize(s) {
  return (s || '').toLowerCase().replace(/[åäà]/g, 'a').replace(/[öø]/g, 'o').replace(/[ü]/g, 'u').replace(/[éè]/g, 'e').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function stripKcalAndRester(text) {
  if (!text) return '';
  return String(text).replace(/\(\s*\d+\s*kcal\s*\)/gi, '').replace(/\s*rester\s*$/i, '').trim();
}

function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
}

function findBestRecipeMatch(mealName, recipes) {
  if (!mealName || /rester|16:8/i.test(mealName)) return null;
  
  const baseName = stripKcalAndRester(mealName);
  const normMeal = normalize(baseName);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const recipe of recipes) {
    const normRecipe = normalize(recipe.title);
    
    // Exact match
    if (normMeal === normRecipe) return { recipe, score: 100 };
    
    // Contains match
    if (normMeal.includes(normRecipe) || normRecipe.includes(normMeal)) {
      const score = 90;
      if (score > bestScore) { bestScore = score; bestMatch = { recipe, score }; }
    }
    
    // Token overlap
    const tokensA = new Set(normMeal.split(' ').filter(w => w.length > 2));
    const tokensB = new Set(normRecipe.split(' ').filter(w => w.length > 2));
    let overlap = 0;
    for (const token of tokensA) if (tokensB.has(token)) overlap++;
    if (overlap >= 2) {
      const score = 70 + overlap * 5;
      if (score > bestScore) { bestScore = score; bestMatch = { recipe, score }; }
    }
    
    // Levenshtein
    const dist = levenshtein(normMeal, normRecipe);
    if (dist <= 4) {
      const score = 60 - dist * 10;
      if (score > bestScore) { bestScore = score; bestMatch = { recipe, score }; }
    }
  }
  
  return bestScore >= 60 ? bestMatch : null;
}

async function extractKostschemaFromDocx(docxPath) {
  const { value: html } = await mammoth.convertToHtml({ path: docxPath });
  const $ = cheerio.load(html);
  
  const weekPlan = { days: {} };
  const dayMap = { 'mån': 'Måndag', 'tis': 'Tisdag', 'ons': 'Onsdag', 'tors': 'Torsdag', 'fre': 'Fredag', 'lör': 'Lördag', 'sön': 'Söndag' };
  
  $('table').each((_, table) => {
    const rows = $(table).find('tr');
    if (rows.length < 2) return;
    
    const headers = [];
    $(rows[0]).find('td,th').each((i, cell) => { headers.push($(cell).text().trim().toLowerCase()); });
    
    let dayIdx = headers.findIndex(h => h.includes('dag'));
    let frIdx = headers.findIndex(h => h.includes('frukost'));
    let luIdx = headers.findIndex(h => h.includes('lunch'));
    let miIdx = headers.findIndex(h => h.includes('middag'));
    if (dayIdx === -1 || frIdx === -1 || luIdx === -1 || miIdx === -1) return;
    
    for (let r = 1; r < rows.length; r++) {
      const cells = $(rows[r]).find('td,th');
      if (cells.length < Math.max(dayIdx, frIdx, luIdx, miIdx) + 1) continue;
      
      const dayText = $(cells[dayIdx]).text().trim().toLowerCase();
      let day = null;
      for (const [abbr, full] of Object.entries(dayMap)) {
        if (dayText.includes(abbr)) { day = full; break; }
      }
      if (!day) continue;
      
      let fr = $(cells[frIdx]).text().trim();
      const lu = $(cells[luIdx]).text().trim();
      const mi = $(cells[miIdx]).text().trim();
      
      if (!fr && /16\s*:\s*8/.test(dayText)) fr = '16:8';
      
      weekPlan.days[day] = {
        breakfast: { name: fr },
        lunch: { name: lu },
        dinner: { name: mi }
      };
    }
  });
  
  return weekPlan;
}

(async () => {
  const prisma = new PrismaClient();
  try {
    // Get all recipes from DB
    const recipes = await prisma.recipe.findMany({ select: { title: true, slug: true } });
    console.log(`📚 Found ${recipes.length} recipes in DB`);
    
    const allWeeks = { basic: {}, flow: {} };
    
    // Process Basic weeks
    for (let week = 1; week <= 6; week++) {
      const fileName = `Functional-${week}.docx`;
      const filePath = path.join(BASIC_DIR, fileName);
      if (!fs.existsSync(filePath)) { console.log(`⚠️ ${fileName} not found`); continue; }
      
      console.log(`📄 Processing Basic ${fileName}...`);
      const weekPlan = await extractKostschemaFromDocx(filePath);
      weekPlan.title = `Vecka ${week}: Synkroniserad från DOCX`;
      
      // Match meals to recipes
      for (const day of Object.keys(weekPlan.days)) {
        for (const mealType of ['breakfast', 'lunch', 'dinner']) {
          const meal = weekPlan.days[day][mealType];
          if (!meal?.name) continue;
          
          if (/rester|16:8/i.test(meal.name)) {
            // Keep as text only
            continue;
          }
          
          const match = findBestRecipeMatch(meal.name, recipes);
          if (match) {
            meal.recipeLink = `/kunskapsbank/recept/${match.recipe.slug}`;
          }
        }
      }
      
      allWeeks.basic[`week${week}`] = weekPlan;
    }
    
    // Process Flow weeks  
    for (let week = 1; week <= 6; week++) {
      const patterns = [`Functional Flow - Kostschema v. ${week}.docx`, `Functional Flow kostschema v.${week}.docx`];
      let filePath = null;
      for (const pattern of patterns) {
        const testPath = path.join(FLOW_DIR, pattern);
        if (fs.existsSync(testPath)) { filePath = testPath; break; }
      }
      if (!filePath) { console.log(`⚠️ Flow week ${week} not found`); continue; }
      
      console.log(`📄 Processing Flow week ${week}...`);
      const weekPlan = await extractKostschemaFromDocx(filePath);
      weekPlan.title = `Vecka ${week}: Synkroniserad från DOCX`;
      
      // Match meals to recipes
      for (const day of Object.keys(weekPlan.days)) {
        for (const mealType of ['breakfast', 'lunch', 'dinner']) {
          const meal = weekPlan.days[day][mealType];
          if (!meal?.name) continue;
          
          if (/rester|16:8/i.test(meal.name)) continue;
          
          const match = findBestRecipeMatch(meal.name, recipes);
          if (match) {
            meal.recipeLink = `/kunskapsbank/recept/${match.recipe.slug}`;
          }
        }
      }
      
      allWeeks.flow[`week${week}`] = weekPlan;
    }
    
    // Write updated meal plans
    const newContent = `export interface MealItem {
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
export const mealPlans: Record<string, WeekMealPlan> = ${JSON.stringify(allWeeks.basic, null, 2)};

// Functional Flow meal plans
export const flowMealPlans: Record<string, WeekMealPlan> = ${JSON.stringify(allWeeks.flow, null, 2)};

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
}

// Helper function to get meal for a specific day (1-42)
export function getMealForDay(dayNumber: number): DayMeals | null {
  const weekNumber = Math.ceil(dayNumber / 7);
  const dayInWeek = ((dayNumber - 1) % 7) + 1;
  return getMealPlan(weekNumber, dayInWeek);
}`;

    fs.writeFileSync(MEAL_PLANS_PATH, newContent);
    console.log('✅ Updated mealPlans.ts with new recipe links');
    
  } catch (e) {
    console.error('❌ Kostschema sync failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 
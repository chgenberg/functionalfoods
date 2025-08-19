const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const MEAL_PLANS_PATH = path.resolve(process.cwd(), 'app', 'data', 'mealPlans.ts');

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripKcalAndRester(text) {
  if (!text) return '';
  let t = String(text);
  t = t.replace(/\(\s*\d+\s*kcal\s*\)/gi, '').trim();
  t = t.replace(/\s*rester\s*$/i, '').trim();
  return t;
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
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

function tokenOverlap(a, b) {
  const tokensA = new Set(normalize(a).split(' ').filter(w => w.length > 2));
  const tokensB = new Set(normalize(b).split(' ').filter(w => w.length > 2));
  let overlap = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) overlap++;
  }
  return overlap;
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
    if (normMeal === normRecipe) {
      return { recipe, score: 100, method: 'exact' };
    }
    
    // Contains match
    if (normMeal.includes(normRecipe) || normRecipe.includes(normMeal)) {
      const score = 90;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { recipe, score, method: 'contains' };
      }
    }
    
    // Token overlap (require at least 2 matching tokens)
    const overlap = tokenOverlap(baseName, recipe.title);
    if (overlap >= 2) {
      const score = 70 + overlap * 5;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { recipe, score, method: `tokens(${overlap})` };
      }
    }
    
    // Levenshtein distance (max distance 4)
    const dist = levenshtein(normMeal, normRecipe);
    if (dist <= 4) {
      const score = 60 - dist * 10;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = { recipe, score, method: `lev(${dist})` };
      }
    }
  }
  
  // Only return matches with score >= 60
  return bestScore >= 60 ? bestMatch : null;
}

(async () => {
  const prisma = new PrismaClient();
  try {
    // Get all recipes from DB
    const recipes = await prisma.recipe.findMany({
      select: { title: true, slug: true }
    });
    console.log(`📚 Found ${recipes.length} recipes in DB`);

    // Load current meal plans by parsing the TS file
    const fileContent = fs.readFileSync(MEAL_PLANS_PATH, 'utf8');
    
    // Extract mealPlans object
    const mealPlansMatch = fileContent.match(/export const mealPlans[^=]*=\s*(\{[\s\S]*?\n\});/);
    const flowMealPlansMatch = fileContent.match(/export const flowMealPlans[^=]*=\s*(\{[\s\S]*?\n\});/);
    
    if (!mealPlansMatch || !flowMealPlansMatch) {
      throw new Error('Could not parse meal plans from TypeScript file');
    }
    
    const mealPlans = JSON.parse(mealPlansMatch[1]);
    const flowMealPlans = JSON.parse(flowMealPlansMatch[1]);
    
    let totalMeals = 0;
    let linkedMeals = 0;
    let updates = [];

    // Process Basic meal plans
    for (const weekKey of Object.keys(mealPlans)) {
      const week = mealPlans[weekKey];
      for (const dayName of Object.keys(week.days)) {
        const day = week.days[dayName];
        for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']) {
          const meal = day[mealType];
          if (!meal || !meal.name) continue;
          
          totalMeals++;
          const match = findBestRecipeMatch(meal.name, recipes);
          
          if (match) {
            meal.recipeLink = `/kunskapsbank/recept/${match.recipe.slug}`;
            linkedMeals++;
            updates.push(`${weekKey}/${dayName}/${mealType}: ${meal.name} → ${match.recipe.title} (${match.method}, score: ${match.score})`);
          } else {
            // Remove any existing link for non-matches
            delete meal.recipeLink;
          }
        }
      }
    }

    // Process Flow meal plans
    for (const weekKey of Object.keys(flowMealPlans)) {
      const week = flowMealPlans[weekKey];
      if (!week.days) continue;
      for (const dayName of Object.keys(week.days)) {
        const day = week.days[dayName];
        for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack', 'dessert']) {
          const meal = day[mealType];
          if (!meal || !meal.name) continue;
          
          totalMeals++;
          const match = findBestRecipeMatch(meal.name, recipes);
          
          if (match) {
            meal.recipeLink = `/kunskapsbank/recept/${match.recipe.slug}`;
            linkedMeals++;
            updates.push(`Flow ${weekKey}/${dayName}/${mealType}: ${meal.name} → ${match.recipe.title} (${match.method}, score: ${match.score})`);
          } else {
            delete meal.recipeLink;
          }
        }
      }
    }

    // Write updated meal plans back to file
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
export const mealPlans: Record<string, WeekMealPlan> = ${JSON.stringify(mealPlans, null, 2)};

// Functional Flow meal plans
export const flowMealPlans: Record<string, WeekMealPlan> = ${JSON.stringify(flowMealPlans, null, 2)};

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

    console.log(`\n📊 Smart linking complete:`);
    console.log(`Total meals: ${totalMeals}`);
    console.log(`Successfully linked: ${linkedMeals}`);
    console.log(`Link rate: ${Math.round((linkedMeals / totalMeals) * 100)}%`);
    
    console.log(`\n📝 Sample matches:`);
    updates.slice(0, 10).forEach(u => console.log(`  ${u}`));
    if (updates.length > 10) console.log(`  ... and ${updates.length - 10} more`);

  } catch (e) {
    console.error('❌ Smart linking failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 
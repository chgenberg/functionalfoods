const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const stringSimilarity = require('string-similarity');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Normalize Swedish text for better matching
function normalizeSwedish(text) {
  return text
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Create slug from recipe name
function createSlug(text) {
  return normalizeSwedish(text)
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Extract meal name from text (remove calories, "rester", etc.)
function extractMealName(text) {
  let cleaned = text
    .replace(/\([^)]*kcal[^)]*\)/gi, '') // Remove calorie info
    .replace(/\([^)]*\)/g, '') // Remove other parenthetical info
    .replace(/\s*rester\s*/gi, '') // Remove "rester"
    .replace(/\s*med\s+.*$/i, '') // Sometimes remove "med ..." descriptions
    .trim();
  
  return cleaned;
}

// Find best matching recipe in database
async function findBestRecipeMatch(mealName, recipes) {
  const cleanMealName = extractMealName(mealName);
  const normalizedMeal = normalizeSwedish(cleanMealName);
  
  // First try exact slug match
  const exactSlug = createSlug(cleanMealName);
  const exactMatch = recipes.find(r => r.slug === exactSlug);
  if (exactMatch) {
    return { recipe: exactMatch, confidence: 1.0, method: 'exact_slug' };
  }
  
  // Try exact title match
  const exactTitleMatch = recipes.find(r => 
    normalizeSwedish(r.title) === normalizedMeal
  );
  if (exactTitleMatch) {
    return { recipe: exactTitleMatch, confidence: 0.95, method: 'exact_title' };
  }
  
  // Try fuzzy matching on titles
  const recipeNames = recipes.map(r => r.title);
  const matches = stringSimilarity.findBestMatch(cleanMealName, recipeNames);
  
  if (matches.bestMatch.rating > 0.6) {
    const bestRecipe = recipes.find(r => r.title === matches.bestMatch.target);
    return { 
      recipe: bestRecipe, 
      confidence: matches.bestMatch.rating, 
      method: 'fuzzy_title' 
    };
  }
  
  // Try partial matching
  for (const recipe of recipes) {
    const normalizedRecipe = normalizeSwedish(recipe.title);
    if (normalizedRecipe.includes(normalizedMeal) || normalizedMeal.includes(normalizedRecipe)) {
      return { recipe, confidence: 0.7, method: 'partial_match' };
    }
  }
  
  return null;
}

// Parse HTML table to extract meal plan
function parseHTMLMealPlan(html) {
  const days = {};
  
  // Extract table rows
  const tableMatch = html.match(/<table[^>]*>(.*?)<\/table>/s);
  if (!tableMatch) return days;
  
  const tableContent = tableMatch[1];
  const rows = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gs);
  
  if (!rows || rows.length < 2) return days;
  
  // Skip header row, process data rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs);
    
    if (!cells || cells.length < 4) continue;
    
    // Extract cell contents
    const dayCell = cells[0].replace(/<[^>]*>/g, '').trim();
    const breakfastCell = cells[1].replace(/<[^>]*>/g, '').trim();
    const lunchCell = cells[2].replace(/<[^>]*>/g, '').trim();
    const dinnerCell = cells[3].replace(/<[^>]*>/g, '').trim();
    
    // Map day abbreviations to full names
    const dayMapping = {
      'mån': 'Måndag',
      'tis': 'Tisdag', 
      'ons': 'Onsdag',
      'tors': 'Torsdag',
      'fre': 'Fredag',
      'lör': 'Lördag',
      'sön': 'Söndag'
    };
    
    const dayName = dayMapping[dayCell.toLowerCase()];
    if (!dayName) continue;
    
    days[dayName] = {};
    
    if (breakfastCell && breakfastCell.length > 3) {
      days[dayName].breakfast = breakfastCell;
    }
    if (lunchCell && lunchCell.length > 3) {
      days[dayName].lunch = lunchCell;
    }
    if (dinnerCell && dinnerCell.length > 3) {
      days[dayName].dinner = dinnerCell;
    }
  }
  
  return days;
}

async function processWeek(weekNumber) {
  console.log(`\n📅 Processing Week ${weekNumber}...`);
  
  const filePath = path.join(process.cwd(), 'public', 'Kostscheman_energy', `Typ-2 Diabetes - Kostschema v. ${weekNumber}.docx`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return null;
  }
  
  try {
    // Read DOCX file as HTML
    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value;
    
    console.log(`📄 Extracted HTML length: ${html.length} characters`);
    
    // Parse meal plan from HTML table
    const mealPlan = parseHTMLMealPlan(html);
    console.log(`🍽️  Found ${Object.keys(mealPlan).length} days`);
    
    // Get all recipes from database for matching
    const recipes = await prisma.recipe.findMany({
      select: { id: true, title: true, slug: true }
    });
    
    console.log(`🔍 Matching against ${recipes.length} recipes in database`);
    
    // Match meals to recipes
    const matchedMealPlan = {};
    let totalMeals = 0;
    let matchedMeals = 0;
    
    for (const [day, meals] of Object.entries(mealPlan)) {
      matchedMealPlan[day] = {};
      
      for (const [mealType, mealName] of Object.entries(meals)) {
        totalMeals++;
        
        const match = await findBestRecipeMatch(mealName, recipes);
        
        if (match) {
          matchedMeals++;
          matchedMealPlan[day][mealType] = {
            name: mealName,
            recipeLink: `/kunskapsbank/recept/${match.recipe.slug}`,
            recipeId: match.recipe.id,
            confidence: match.confidence,
            method: match.method
          };
          
          console.log(`✅ ${day} ${mealType}: "${mealName}" -> "${match.recipe.title}" (${Math.round(match.confidence * 100)}% via ${match.method})`);
        } else {
          matchedMealPlan[day][mealType] = {
            name: mealName,
            recipeLink: null,
            recipeId: null,
            confidence: 0,
            method: 'no_match'
          };
          
          console.log(`❌ ${day} ${mealType}: "${mealName}" -> NO MATCH`);
        }
      }
    }
    
    console.log(`📊 Week ${weekNumber} Summary: ${matchedMeals}/${totalMeals} meals matched (${Math.round((matchedMeals/totalMeals)*100)}%)`);
    
    return {
      week: weekNumber,
      title: `Vecka ${weekNumber}: Typ 2-diabetes kostschema`,
      days: matchedMealPlan,
      stats: {
        totalMeals,
        matchedMeals,
        matchRate: Math.round((matchedMeals/totalMeals)*100)
      }
    };
    
  } catch (error) {
    console.error(`❌ Error processing week ${weekNumber}:`, error);
    return null;
  }
}

async function main() {
  console.log('🎯 Extracting Functional Energy meal plans from DOCX files (HTML parsing)...\n');
  
  try {
    const allWeeks = {};
    const overallStats = { totalMeals: 0, matchedMeals: 0 };
    
    // Process each week
    for (let week = 1; week <= 6; week++) {
      const weekData = await processWeek(week);
      if (weekData) {
        allWeeks[`week${week}`] = weekData;
        overallStats.totalMeals += weekData.stats.totalMeals;
        overallStats.matchedMeals += weekData.stats.matchedMeals;
      }
    }
    
    // Save results to file
    const outputPath = path.join(process.cwd(), 'scripts', 'extracted-energy-meal-plans-v2.json');
    fs.writeFileSync(outputPath, JSON.stringify(allWeeks, null, 2), 'utf-8');
    
    console.log(`\n📊 Overall Summary:`);
    console.log(`- Total meals processed: ${overallStats.totalMeals}`);
    console.log(`- Successfully matched: ${overallStats.matchedMeals}`);
    console.log(`- Overall match rate: ${Math.round((overallStats.matchedMeals/overallStats.totalMeals)*100)}%`);
    console.log(`- Results saved to: ${outputPath}`);
    
    // Show unmatched meals for manual review
    console.log(`\n🔍 Unmatched meals for manual review:`);
    for (const [weekKey, weekData] of Object.entries(allWeeks)) {
      for (const [day, meals] of Object.entries(weekData.days)) {
        for (const [mealType, meal] of Object.entries(meals)) {
          if (!meal.recipeLink) {
            console.log(`❌ Week ${weekData.week} ${day} ${mealType}: "${meal.name}"`);
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
const { PrismaClient } = require('@prisma/client');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

// Levenshtein distance function for fuzzy matching
function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from(Array(a.length + 1), () => Array(b.length + 1).fill(0));
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

// Normalize recipe titles for comparison
const normalize = (str) =>
  str
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s]/g, '') // remove special chars
    .trim();

// Main function to sync meal plans
async function syncMealPlans() {
  const prisma = new PrismaClient();
  console.log('🔄 Starting meal plan sync...');

  // 1. Fetch all existing recipes from DB for matching
  const allDbRecipes = await prisma.recipe.findMany({
    select: { title: true, slug: true },
  });
  const normalizedDbRecipes = allDbRecipes.map(r => ({ ...r, normalized: normalize(r.title) }));
  console.log(`📚 Found ${allDbRecipes.length} recipes in the database.`);

  // 2. Define DOCX files to process
  const docxFiles = [
    'Functionalbasic_1.docx', 'Functionalbasic_2.docx', 'Functionalbasic_3.docx',
    'Functionalbasic_4.docx', 'Functionalbasic_5.docx', 'Functionalbasic_6.docx',
  ];
  const docxDir = path.resolve(__dirname, '../public/kurser');
  
  const generatedMealPlans = {};
  const missingRecipes = new Set();

  // 3. Process each DOCX file
  for (let i = 0; i < docxFiles.length; i++) {
    const weekNum = i + 1;
    const fileName = docxFiles[i];
    const filePath = path.join(docxDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${fileName}. Skipping.`);
      continue;
    }

    console.log(`\n--- Processing Week ${weekNum} (${fileName}) ---`);
    const { value: text } = await mammoth.extractRawText({ path: filePath });
    
    // Simple parser, assumes structure: Day, Breakfast, Lunch, Dinner
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const dayNames = { Mån: 'Måndag', Tis: 'Tisdag', Ons: 'Onsdag', Tors: 'Torsdag', Fre: 'Fredag', Lör: 'Lördag', Sön: 'Söndag' };
    
    const weekPlan = {
      title: `Vecka ${weekNum}: Synkroniserad från DOCX`,
      days: {},
    };
    
    let currentDayAbbr = null;
    let mealIndex = 0; // 0: Breakfast, 1: Lunch, 2: Dinner
    const slots = ['breakfast', 'lunch', 'dinner'];

    for (const line of lines) {
      if (dayNames[line]) {
        currentDayAbbr = line;
        mealIndex = 0;
        weekPlan.days[dayNames[currentDayAbbr]] = {};
        continue;
      }

      if (currentDayAbbr && mealIndex < 3) {
        let mealName = line.replace(/\s*\([\d\s,]+kcal\)/i, '').trim();
        const isLeftover = mealName.toLowerCase().includes('rester');

        if (isLeftover) {
           weekPlan.days[dayNames[currentDayAbbr]][slots[mealIndex]] = { name: mealName.replace('rester','(Rester)') };
        } else {
          // Find best match in DB
          let bestMatch = null;
          let minDistance = 4; // Max Levenshtein distance to consider a match
          
          const normalizedMealName = normalize(mealName);
          
          for (const dbRecipe of normalizedDbRecipes) {
            const dist = levenshtein(normalizedMealName, dbRecipe.normalized);
            if (dist < minDistance) {
              minDistance = dist;
              bestMatch = dbRecipe;
            }
          }

          if (bestMatch) {
            weekPlan.days[dayNames[currentDayAbbr]][slots[mealIndex]] = {
              name: mealName,
              recipeLink: `/kunskapsbank/recept/${bestMatch.slug}`,
            };
          } else {
             weekPlan.days[dayNames[currentDayAbbr]][slots[mealIndex]] = { name: mealName };
             missingRecipes.add(mealName);
          }
        }
        mealIndex++;
      }
    }
    generatedMealPlans[`week${weekNum}`] = weekPlan;
  }

  // 4. Save the output
  const outputPath = path.resolve(__dirname, 'generatedMealPlans.json');
  fs.writeFileSync(outputPath, JSON.stringify(generatedMealPlans, null, 2));
  console.log(`\n\n✅ Meal plan data successfully generated and saved to ${outputPath}`);
  
  // 5. Report missing recipes
  if (missingRecipes.size > 0) {
    console.log('\n\n⚠️ The following recipes from DOCX were not found in the database:');
    missingRecipes.forEach(r => console.log(`  - ${r}`));
    console.log('\nThese have been added to the meal plan as text-only (no link).');
  } else {
    console.log('\n\n✅ All recipes from DOCX were successfully matched in the database!');
  }

  await prisma.$disconnect();
}

syncMealPlans().catch(console.error); 
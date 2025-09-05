const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function parseCSV(content) {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split('\t');
  
  return lines.slice(1).map(line => {
    const values = line.split('\t');
    const obj = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim() || '';
    });
    return obj;
  });
}

function parseAmount(amountStr) {
  if (!amountStr || amountStr === 'None' || amountStr === '') {
    return null;
  }
  const num = parseFloat(amountStr);
  return isNaN(num) ? null : num;
}

function extractIngredientName(label) {
  // Remove amount in parentheses: "vitlök (1 klyfta)" -> "vitlök"
  return label.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

async function importRealIngredientAmounts() {
  try {
    console.log('📥 Importing REAL ingredient amounts from CSV...');

    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'public', 'Recept_complete', 'ingredients.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const ingredients = parseCSV(csvContent);

    console.log(`Found ${ingredients.length} ingredient entries in CSV`);

    // Group ingredients by recipe title
    const recipeIngredients = {};
    for (const ing of ingredients) {
      const title = ing.title;
      if (!title) continue;
      
      if (!recipeIngredients[title]) {
        recipeIngredients[title] = [];
      }
      
      recipeIngredients[title].push({
        label: extractIngredientName(ing.ingredient_label),
        fullLabel: ing.ingredient_label,
        baseAmount: parseAmount(ing.base_amount),
        baseUnit: ing.base_unit !== 'None' ? ing.base_unit : null,
        finalAmount: parseAmount(ing.final_amount),
        finalUnit: ing.final_unit !== 'None' ? ing.final_unit : null,
        multiplier: parseAmount(ing.multiplier),
        note: ing.note !== 'None' ? ing.note : null,
        isFunctional: ing.is_functional === '1' || ing.is_functional === 'true'
      });
    }

    console.log(`Found ${Object.keys(recipeIngredients).length} unique recipes with ingredients`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let totalIngredientsUpdated = 0;

    // Update each recipe
    for (const [title, ingredients] of Object.entries(recipeIngredients)) {
      // Find recipe by title
      const recipe = await prisma.recipe.findFirst({
        where: {
          title: {
            equals: title,
            mode: 'insensitive'
          }
        }
      });

      if (!recipe) {
        console.log(`⚠️  Recipe not found: ${title}`);
        notFoundCount++;
        continue;
      }

      // Build structured ingredients array
      const structuredIngredients = ingredients.map(ing => ({
        label: ing.label,
        baseAmount: ing.baseAmount,
        baseUnit: ing.baseUnit,
        finalAmount: ing.finalAmount || ing.baseAmount,
        finalUnit: ing.finalUnit || ing.baseUnit,
        multiplier: ing.multiplier || 1,
        note: ing.note,
        isFunctional: ing.isFunctional
      }));

      // Also build simple ingredients array with full labels
      const simpleIngredients = ingredients.map(ing => ing.fullLabel);

      // Update recipe
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          ingredients: simpleIngredients,
          ingredientsStructured: structuredIngredients
        }
      });

      updatedCount++;
      totalIngredientsUpdated += ingredients.length;
      
      if (updatedCount % 50 === 0) {
        console.log(`Progress: ${updatedCount} recipes updated...`);
      }
    }

    // Final statistics
    const finalStats = await prisma.recipe.findMany({
      select: {
        ingredientsStructured: true
      }
    });

    let recipesWithRealAmounts = 0;
    let recipesWithDefaultAmounts = 0;
    let recipesWithoutAmounts = 0;

    finalStats.forEach(recipe => {
      if (!recipe.ingredientsStructured || recipe.ingredientsStructured.length === 0) {
        recipesWithoutAmounts++;
      } else {
        const hasAnyAmount = recipe.ingredientsStructured.some(ing => ing.baseAmount !== null);
        if (hasAnyAmount) {
          recipesWithRealAmounts++;
        } else {
          recipesWithoutAmounts++;
        }
      }
    });

    console.log('\n✅ IMPORT COMPLETE!');
    console.log('='.repeat(50));
    console.log(`📊 Updated ${updatedCount} recipes with REAL amounts`);
    console.log(`🔢 Total ingredients updated: ${totalIngredientsUpdated}`);
    console.log(`⚠️  Recipes not found: ${notFoundCount}`);
    console.log(`\n📈 Final database status:`);
    console.log(`   Recipes with real amounts: ${recipesWithRealAmounts}`);
    console.log(`   Recipes without amounts: ${recipesWithoutAmounts}`);

  } catch (err) {
    console.error('❌ Error importing real amounts:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  importRealIngredientAmounts();
}

module.exports = { importRealIngredientAmounts }; 
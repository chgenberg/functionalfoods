const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Common Swedish units
const UNITS = [
  'kg', 'g', 'mg',
  'l', 'dl', 'cl', 'ml',
  'msk', 'tsk', 'krm',
  'st', 'st.', 'stycken', 'styck',
  'burk', 'burkar', 'påse', 'påsar',
  'förpackning', 'förpackningar', 'pkt',
  'knippe', 'knippet', 'kvist', 'kvistar',
  'klyfta', 'klyftor', 'skiva', 'skivor',
  'näve', 'nypa', 'nypor',
  'port', 'portion', 'portioner'
];

function extractAmountAndUnit(ingredientText) {
  // Try to match patterns like "100 g", "1 dl", "2 msk", "1/2 tsk", etc.
  const patterns = [
    // Decimal numbers with units: "1.5 dl", "0,5 kg"
    /^(\d+[.,]\d+)\s*(kg|g|mg|l|dl|cl|ml|msk|tsk|krm|st\.?|styck\w*|burk\w*|påse|påsar|förpackning\w*|pkt|knippe\w*|kvist\w*|klyfta|klyftor|skiva|skivor|näve|nypa|nypor|port\w*)\b/i,
    // Whole numbers with units: "100 g", "2 msk"
    /^(\d+)\s*(kg|g|mg|l|dl|cl|ml|msk|tsk|krm|st\.?|styck\w*|burk\w*|påse|påsar|förpackning\w*|pkt|knippe\w*|kvist\w*|klyfta|klyftor|skiva|skivor|näve|nypa|nypor|port\w*)\b/i,
    // Fractions: "1/2 tsk", "1/4 dl"
    /^(\d+\/\d+)\s*(kg|g|mg|l|dl|cl|ml|msk|tsk|krm|st\.?|styck\w*|burk\w*|påse|påsar|förpackning\w*|pkt|knippe\w*|kvist\w*|klyfta|klyftor|skiva|skivor|näve|nypa|nypor|port\w*)\b/i,
    // Just numbers without explicit unit (assume "st"): "2 tomater"
    /^(\d+)\s+/,
    // Decimal without explicit unit: "1,5 ägg"
    /^(\d+[.,]\d+)\s+/
  ];

  // Also check for amounts in parentheses like "blomkål (100 g)"
  const parenMatch = ingredientText.match(/\((\d+(?:[.,]\d+)?)\s*(kg|g|mg|l|dl|cl|ml|msk|tsk|krm|st\.?|styck\w*)\)/i);
  if (parenMatch) {
    const amount = parseFloat(parenMatch[1].replace(',', '.'));
    const unit = parenMatch[2].toLowerCase().replace('st.', 'st');
    const label = ingredientText.replace(parenMatch[0], '').trim();
    return { amount, unit, label };
  }

  for (const pattern of patterns) {
    const match = ingredientText.match(pattern);
    if (match) {
      let amountStr = match[1];
      let unit = match[2] || 'st'; // Default to "st" if no unit
      
      // Parse amount
      let amount;
      if (amountStr.includes('/')) {
        // Handle fractions
        const [num, den] = amountStr.split('/').map(n => parseInt(n));
        amount = num / den;
      } else {
        amount = parseFloat(amountStr.replace(',', '.'));
      }
      
      // Normalize unit
      unit = unit.toLowerCase().replace('st.', 'st');
      
      // Extract label (rest of the string)
      const label = ingredientText.substring(match[0].length).trim();
      
      return { amount, unit, label };
    }
  }
  
  // No amount found, return the whole string as label
  return { amount: null, unit: null, label: ingredientText };
}

async function extractAmountsFromIngredients() {
  try {
    console.log('🔍 Extracting amounts from ingredient labels...');

    // Get all recipes
    const allRecipes = await prisma.recipe.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        ingredients: true,
        ingredientsStructured: true
      }
    });

    // Filter recipes that have missing amounts
    const recipes = allRecipes.filter(recipe => {
      if (!recipe.ingredientsStructured || recipe.ingredientsStructured.length === 0) {
        return false;
      }
      // Check if any ingredient is missing amount
      return recipe.ingredientsStructured.some(ing => 
        ing.baseAmount === null || ing.baseAmount === undefined
      );
    });

    console.log(`Found ${recipes.length} recipes with missing amounts`);

    let updatedCount = 0;
    let extractedCount = 0;

    for (const recipe of recipes) {
      const updatedStructured = [];
      let hasChanges = false;

      // Process each ingredient
      for (let i = 0; i < recipe.ingredients.length; i++) {
        const ingredientText = recipe.ingredients[i];
        const structured = recipe.ingredientsStructured[i] || {};
        
        if (structured.baseAmount === null || structured.baseAmount === undefined) {
          // Try to extract amount and unit
          const extracted = extractAmountAndUnit(ingredientText);
          
          if (extracted.amount !== null) {
            updatedStructured.push({
              ...structured,
              label: extracted.label || ingredientText,
              baseAmount: extracted.amount,
              baseUnit: extracted.unit,
              finalAmount: extracted.amount,
              finalUnit: extracted.unit
            });
            hasChanges = true;
            extractedCount++;
          } else {
            // Keep original
            updatedStructured.push(structured);
          }
        } else {
          // Already has amount, keep it
          updatedStructured.push(structured);
        }
      }

      if (hasChanges) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            ingredientsStructured: updatedStructured
          }
        });
        updatedCount++;
        
        if (updatedCount <= 10) {
          console.log(`✅ Updated ${recipe.slug} - extracted amounts from text`);
        }
      }
    }

    // Final statistics
    const finalStats = await prisma.recipe.findMany({
      select: {
        ingredientsStructured: true
      }
    });

    let recipesWithAmounts = 0;
    let recipesWithoutAmounts = 0;

    finalStats.forEach(recipe => {
      const hasAnyAmount = recipe.ingredientsStructured?.some(ing => ing.baseAmount !== null);
      if (hasAnyAmount) {
        recipesWithAmounts++;
      } else {
        recipesWithoutAmounts++;
      }
    });

    console.log('\n📊 Summary:');
    console.log(`✅ Updated ${updatedCount} recipes`);
    console.log(`🔢 Extracted ${extractedCount} amounts from text`);
    console.log(`📈 Recipes with amounts: ${recipesWithAmounts}`);
    console.log(`📉 Recipes still without amounts: ${recipesWithoutAmounts}`);

  } catch (err) {
    console.error('❌ Error extracting amounts:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  extractAmountsFromIngredients();
}

module.exports = { extractAmountsFromIngredients }; 
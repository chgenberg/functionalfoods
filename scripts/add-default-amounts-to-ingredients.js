const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Default amounts for common ingredients
const DEFAULT_AMOUNTS = {
  // Dairy
  'mjölk': { amount: 2, unit: 'dl' },
  'grädde': { amount: 1, unit: 'dl' },
  'yoghurt': { amount: 2, unit: 'dl' },
  'grekisk yoghurt': { amount: 2, unit: 'dl' },
  'keso': { amount: 200, unit: 'g' },
  'fetaost': { amount: 100, unit: 'g' },
  'mozzarella': { amount: 125, unit: 'g' },
  'ost': { amount: 100, unit: 'g' },
  'smör': { amount: 2, unit: 'msk' },
  
  // Proteins
  'ägg': { amount: 2, unit: 'st' },
  'köttfärs': { amount: 400, unit: 'g' },
  'nötfärs': { amount: 400, unit: 'g' },
  'kyckling': { amount: 400, unit: 'g' },
  'kycklingfilé': { amount: 400, unit: 'g' },
  'lax': { amount: 400, unit: 'g' },
  'laxfilé': { amount: 400, unit: 'g' },
  'torsk': { amount: 400, unit: 'g' },
  'torskfilé': { amount: 400, unit: 'g' },
  'räkor': { amount: 200, unit: 'g' },
  'bacon': { amount: 100, unit: 'g' },
  'skinka': { amount: 100, unit: 'g' },
  
  // Vegetables
  'lök': { amount: 1, unit: 'st' },
  'gul lök': { amount: 1, unit: 'st' },
  'rödlök': { amount: 1, unit: 'st' },
  'vitlök': { amount: 2, unit: 'klyftor' },
  'tomat': { amount: 2, unit: 'st' },
  'tomater': { amount: 2, unit: 'st' },
  'gurka': { amount: 1, unit: 'st' },
  'paprika': { amount: 1, unit: 'st' },
  'morötter': { amount: 2, unit: 'st' },
  'morot': { amount: 2, unit: 'st' },
  'potatis': { amount: 4, unit: 'st' },
  'sötpotatis': { amount: 2, unit: 'st' },
  'broccoli': { amount: 300, unit: 'g' },
  'blomkål': { amount: 300, unit: 'g' },
  'spenat': { amount: 100, unit: 'g' },
  'sallad': { amount: 1, unit: 'st' },
  'avokado': { amount: 1, unit: 'st' },
  
  // Grains & Pasta
  'ris': { amount: 2, unit: 'dl' },
  'pasta': { amount: 300, unit: 'g' },
  'nudlar': { amount: 200, unit: 'g' },
  'quinoa': { amount: 2, unit: 'dl' },
  'bulgur': { amount: 2, unit: 'dl' },
  'couscous': { amount: 2, unit: 'dl' },
  'havregryn': { amount: 1, unit: 'dl' },
  
  // Spices & Seasonings
  'salt': { amount: 1, unit: 'tsk' },
  'peppar': { amount: 0.5, unit: 'tsk' },
  'svartpeppar': { amount: 0.5, unit: 'tsk' },
  'paprikapulver': { amount: 1, unit: 'tsk' },
  'curry': { amount: 1, unit: 'msk' },
  'spiskummin': { amount: 1, unit: 'tsk' },
  'kanel': { amount: 1, unit: 'tsk' },
  'ingefära': { amount: 1, unit: 'msk' },
  'basilika': { amount: 1, unit: 'msk' },
  'oregano': { amount: 1, unit: 'tsk' },
  'timjan': { amount: 1, unit: 'tsk' },
  
  // Oils & Vinegars
  'olivolja': { amount: 2, unit: 'msk' },
  'rapsolja': { amount: 2, unit: 'msk' },
  'kokosolja': { amount: 1, unit: 'msk' },
  'vinäger': { amount: 1, unit: 'msk' },
  'balsamvinäger': { amount: 1, unit: 'msk' },
  
  // Other common
  'vatten': { amount: 2, unit: 'dl' },
  'buljong': { amount: 2, unit: 'dl' },
  'kokosmjölk': { amount: 4, unit: 'dl' },
  'tomatpuré': { amount: 2, unit: 'msk' },
  'senap': { amount: 1, unit: 'msk' },
  'honung': { amount: 1, unit: 'msk' },
  'socker': { amount: 1, unit: 'msk' },
  'mjöl': { amount: 2, unit: 'dl' },
  'vetemjöl': { amount: 2, unit: 'dl' }
};

function findDefaultAmount(ingredientLabel) {
  const label = ingredientLabel.toLowerCase().trim();
  
  // Try exact match first
  if (DEFAULT_AMOUNTS[label]) {
    return DEFAULT_AMOUNTS[label];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(DEFAULT_AMOUNTS)) {
    if (label.includes(key) || key.includes(label)) {
      return value;
    }
  }
  
  // Default for unknown ingredients
  if (label.includes('kryddor') || label.includes('krydda')) {
    return { amount: 1, unit: 'tsk' };
  }
  if (label.includes('olja')) {
    return { amount: 1, unit: 'msk' };
  }
  if (label.includes('sås') || label.includes('dressing')) {
    return { amount: 1, unit: 'dl' };
  }
  
  return null;
}

async function addDefaultAmounts() {
  try {
    console.log('🔧 Adding default amounts to ingredients...');

    // Get all recipes
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        ingredientsStructured: true
      }
    });

    let updatedCount = 0;
    let ingredientsUpdated = 0;

    for (const recipe of recipes) {
      if (!recipe.ingredientsStructured || recipe.ingredientsStructured.length === 0) {
        continue;
      }

      let hasChanges = false;
      const updatedStructured = recipe.ingredientsStructured.map(ing => {
        // Skip if already has amount
        if (ing.baseAmount !== null && ing.baseAmount !== undefined) {
          return ing;
        }

        // Try to find a default amount
        const defaultAmount = findDefaultAmount(ing.label || '');
        
        if (defaultAmount) {
          hasChanges = true;
          ingredientsUpdated++;
          return {
            ...ing,
            baseAmount: defaultAmount.amount,
            baseUnit: defaultAmount.unit,
            finalAmount: defaultAmount.amount,
            finalUnit: defaultAmount.unit
          };
        }
        
        return ing;
      });

      if (hasChanges) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            ingredientsStructured: updatedStructured
          }
        });
        updatedCount++;
        
        if (updatedCount % 50 === 0) {
          console.log(`Progress: ${updatedCount} recipes updated...`);
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
    console.log(`🔢 Added ${ingredientsUpdated} default amounts`);
    console.log(`📈 Recipes with amounts: ${recipesWithAmounts}`);
    console.log(`📉 Recipes still without any amounts: ${recipesWithoutAmounts}`);

  } catch (err) {
    console.error('❌ Error adding default amounts:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addDefaultAmounts();
}

module.exports = { addDefaultAmounts }; 
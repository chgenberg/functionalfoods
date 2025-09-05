const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixIngredientData() {
  try {
    console.log('🔧 Fixing ingredient data...');

    // Find recipes with empty ingredients but populated ingredientsStructured
    const recipesWithEmptyIngredients = await prisma.recipe.findMany({
      where: {
        ingredients: { equals: [] },
        NOT: { ingredientsStructured: { equals: [] } }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        ingredients: true,
        ingredientsStructured: true
      }
    });

    console.log(`Found ${recipesWithEmptyIngredients.length} recipes with empty ingredients but populated structured data`);

    let fixed = 0;
    for (const recipe of recipesWithEmptyIngredients) {
      try {
        // Extract labels from ingredientsStructured
        const ingredientLabels = recipe.ingredientsStructured
          .map(ing => ing?.label || '')
          .filter(label => label.trim() !== '');

        if (ingredientLabels.length > 0) {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: { ingredients: ingredientLabels }
          });
          fixed++;
          
          if (fixed % 50 === 0) {
            console.log(`Fixed ${fixed} recipes so far...`);
          }
        }
      } catch (err) {
        console.error(`Error fixing ${recipe.slug}:`, err.message);
      }
    }

    // Now check for recipes that still have completely empty ingredient data
    const stillEmpty = await prisma.recipe.findMany({
      where: {
        ingredients: { equals: [] }
      },
      select: { id: true, slug: true, title: true, tags: true, ingredientsStructured: true }
    });

    // Filter to only those that also have empty structured ingredients
    const actuallyEmpty = stillEmpty.filter(r => 
      !r.ingredientsStructured || 
      r.ingredientsStructured.length === 0 ||
      r.ingredientsStructured.every(ing => !ing?.label || ing.label.trim() === '')
    );

    console.log(`\nStill ${actuallyEmpty.length} recipes with completely empty ingredient data`);
    if (actuallyEmpty.length > 0) {
      console.log('Examples:');
      actuallyEmpty.slice(0, 10).forEach(r => {
        console.log(`- ${r.slug} [${r.tags?.join(',') || 'no tags'}]`);
      });
    }

    const finalStats = await prisma.recipe.count({
      where: {
        NOT: { ingredients: { equals: [] } }
      }
    });

    console.log(`\n✅ Fixed ${fixed} recipes`);
    console.log(`📊 Now ${finalStats} recipes have ingredient data`);

  } catch (err) {
    console.error('❌ Error fixing ingredient data:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixIngredientData();
}

module.exports = { fixIngredientData }; 
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function syncEnergyWeek2() {
  console.log('🔄 Syncing Energy Week 2 recipes...\n');

  try {
    // Read parsed JSON
    const recipes = JSON.parse(fs.readFileSync('public/Shopping-lists/energy_week2_manual_parsed.json', 'utf8'));
    
    let updated = 0;
    let missing = 0;
    let errors = 0;

    for (const recipe of recipes) {
      try {
        // Find recipe by title
        const existing = await prisma.recipe.findFirst({
          where: {
            OR: [
              { title: recipe.title },
              { title: { contains: recipe.title, mode: 'insensitive' } }
            ]
          }
        });

        if (!existing) {
          console.log(`❌ Recipe not found: ${recipe.title}`);
          missing++;
          continue;
        }

        // Update recipe
        await prisma.recipe.update({
          where: { id: existing.id },
          data: {
            servings: recipe.servings || existing.servings || 1,
            ingredients: recipe.ingredients || existing.ingredients,
            instructions: recipe.instructions || existing.instructions,
            nutrition: {
              perServing: {
                energy: recipe.nutrition?.calories || null,
                protein: recipe.nutrition?.protein || null,
                carbohydrates: recipe.nutrition?.carbohydrates || null,
                fat: recipe.nutrition?.fat || null,
                fiber: recipe.nutrition?.fiber || null
              }
            }
          }
        });

        console.log(`✅ Updated: ${recipe.title} (servings: ${recipe.servings})`);
        updated++;

      } catch (err) {
        console.error(`❌ Error updating ${recipe.title}:`, err.message);
        errors++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total: ${recipes.length}`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Missing: ${missing}`);
    console.log(`   ⚠️  Errors: ${errors}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncEnergyWeek2();

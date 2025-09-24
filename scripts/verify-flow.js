const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

function extractFlowPlans(source) {
  const m = source.match(/export const flowMealPlans[^=]*=\s*({[\s\S]*?});/);
  if (!m) return null;
  try {
    // Eval the object literal safely (source is trusted in repo context)
    // eslint-disable-next-line no-eval
    return eval('(' + m[1] + ')');
  } catch (e) {
    return null;
  }
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const source = fs.readFileSync(mealPlansPath, 'utf8');
    const flow = extractFlowPlans(source);
    if (!flow) {
      console.log(JSON.stringify({ ok: false, error: 'flowMealPlans not found' }, null, 2));
      return;
    }

    const publicRoot = path.join(process.cwd(), 'public');
    const weeks = [1, 2, 3, 4, 5, 6];

    const result = {
      weeks: {},
      summary: { totalMeals: 0, missingRecipe: 0, missingImage: 0, missingIngredients: 0 },
    };

    for (const w of weeks) {
      const key = `week${w}`;
      const week = flow[key];
      if (!week) { result.weeks[key] = { meals: 0, missingRecipe: 0, missingImage: 0, missingIngredients: 0, shoppingItems: null }; continue; }

      const days = week.days || {};
      const dayNames = Object.keys(days);
      let meals = 0, missR = 0, missI = 0, missIng = 0;

      for (const dayName of dayNames) {
        const day = days[dayName];
        for (const mealType of ['breakfast', 'lunch', 'dinner', 'snack']) {
          const meal = day[mealType];
          if (!meal || !meal.name) continue;
          meals++;
          const link = meal.recipeLink || '';
          const m = link.match(/\/kunskapsbank\/recept\/([^\"\s]+)/);
          const slug = m ? m[1] : null;
          if (!slug) { missR++; continue; }

          const recipe = await prisma.recipe.findUnique({ where: { slug } });
          if (!recipe) { missR++; continue; }

          // image
          let hasImage = false;
          if (recipe.imageUrl && recipe.imageUrl.trim() !== '') {
            const abs = path.join(publicRoot, recipe.imageUrl.replace(/^\//, ''));
            hasImage = fs.existsSync(abs);
          }
          if (!hasImage) missI++;

          // ingredients
          const hasStruct = Array.isArray(recipe.ingredientsStructured) && recipe.ingredientsStructured.length > 0;
          const hasLabels = Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0;
          if (!hasStruct && !hasLabels) missIng++;
        }
      }

      // shopping list items count for this week
      const flowCourse = await prisma.courseProduct.findFirst({ where: { name: { contains: 'Flow', mode: 'insensitive' } } });
      let shoppingItems = null;
      if (flowCourse) {
        const list = await prisma.weeklyShoppingList.findFirst({ where: { courseId: flowCourse.id, week: w } });
        if (list) {
          shoppingItems = await prisma.shoppingListItem.count({ where: { listId: list.id } });
        }
      }

      result.weeks[key] = { meals, missingRecipe: missR, missingImage: missI, missingIngredients: missIng, shoppingItems };
      result.summary.totalMeals += meals;
      result.summary.missingRecipe += missR;
      result.summary.missingImage += missI;
      result.summary.missingIngredients += missIng;
    }

    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('Verify error:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}



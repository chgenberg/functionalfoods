import { PrismaClient } from '@prisma/client';
import path from 'path';

// Allow requiring TS files directly
require('ts-node/register/transpile-only');

function loadMealPlans() {
  const mealPlansPath = path.resolve(__dirname, '../app/data/mealPlans.ts');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(mealPlansPath);
}

interface IngredientMap {
  [ingredient: string]: number;
}

(async () => {
  const prisma = new PrismaClient();

  try {
    const { flowMealPlans } = loadMealPlans();

    if (!flowMealPlans) {
      console.error('Flow meal plans could not be loaded.');
      process.exit(1);
    }

    // Fetch the "Functional Flow" course product
    const flowCourse = await prisma.courseProduct.findFirst({
      where: {
        name: {
          equals: 'Functional Flow',
          mode: 'insensitive',
        },
      },
    });

    if (!flowCourse) {
      console.error('Could not find course product named "Functional Flow".');
      process.exit(1);
    }

    console.log(`Regenerating shopping lists for Flow course "${flowCourse.name}" (id=${flowCourse.id})...\n`);

    // Iterate over weeks 1 through 6
    for (let week = 1; week <= 6; week++) {
      const weekKey = `week${week}` as keyof typeof flowMealPlans;
      const weekPlan = flowMealPlans[weekKey];

      if (!weekPlan) {
        console.warn(`⚠️  No data found for ${String(weekKey)}. Skipping.`);
        continue;
      }

      // Aggregate ingredients for the week
      const ingredientMap: IngredientMap = {};

      // Helper to process a single meal item
      const processMeal = async (mealItem: any) => {
        if (!mealItem || !mealItem.recipeLink) return;
        if (typeof mealItem.name === 'string' && mealItem.name.toLowerCase().includes('(rester')) return; // skip leftovers

        const slug = mealItem.recipeLink.split('/').pop();
        if (!slug) return;

        const recipe = await prisma.recipe.findUnique({ where: { slug } });
        if (!recipe) {
          console.warn(`❌ Recipe not found for slug "${slug}" (from ${mealItem.name})`);
          return;
        }

        if (!Array.isArray(recipe.ingredients)) {
          console.warn(`❌ Recipe "${slug}" has no ingredients array.`);
          return;
        }

        recipe.ingredients.forEach((ing) => {
          const key = ing.trim();
          ingredientMap[key] = (ingredientMap[key] || 0) + 1; // simple count; improve later with quantity parsing
        });
      };

      // Loop through each day in the week plan
      for (const day of Object.values(weekPlan.days)) {
        // Each day object has breakfast, lunch, dinner etc.
        const mealSlots = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
        for (const slot of mealSlots) {
          await processMeal((day as any)[slot]);
        }
      }

      // Upsert weekly shopping list
      const existingList = await prisma.weeklyShoppingList.findUnique({
        where: {
          courseId_week: {
            courseId: flowCourse.id,
            week,
          },
        },
      });

      if (existingList) {
        // Delete old items
        await prisma.shoppingListItem.deleteMany({ where: { listId: existingList.id } });
      }

      const shoppingList = await prisma.weeklyShoppingList.upsert({
        where: {
          courseId_week: {
            courseId: flowCourse.id,
            week,
          },
        },
        create: {
          courseId: flowCourse.id,
          week,
        },
        update: {},
      });

      // Insert new items
      const itemsData = Object.keys(ingredientMap).map((ing) => ({
        listId: shoppingList.id,
        ingredient: ing,
      }));

      if (itemsData.length) {
        await prisma.shoppingListItem.createMany({ data: itemsData });
      }

      console.log(`✅ Flow Week ${week}: ${itemsData.length} ingredients saved.`);
    }

    console.log('\nAll Flow shopping lists done!');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 
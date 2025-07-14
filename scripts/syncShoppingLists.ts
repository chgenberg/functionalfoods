import { PrismaClient } from '@prisma/client';
import { getWeekData } from '../app/data/mealPlans';

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.courseProduct.findFirst({ where: { name: 'Functional Basics' } });
  if (!course) {
    console.error('Functional Basics course product not found');
    return;
  }

  for (let week = 1; week <= 6; week++) {
    const weekData = getWeekData(week);
    if (!weekData) continue;

    const ingredientsMap: Record<string, number> = {};

    // Collect all recipe slugs for week
    const dayMeals = Object.values(weekData.days);
    const recipeSlugs = dayMeals.flatMap((d: any) => [d.breakfast, d.lunch, d.dinner, d.snack, d.dessert])
      .filter(Boolean)
      .map((m: any) => m.recipeLink?.split('/').pop())
      .filter(Boolean);

    // Fetch recipes
    const recipes = await prisma.recipe.findMany({ where: { slug: { in: recipeSlugs as string[] } } });

    recipes.forEach(rec => {
      rec.ingredients.forEach(ing => {
        const key = ing.toLowerCase();
        ingredientsMap[key] = (ingredientsMap[key] || 0) + 1; // naive sum
      });
    });

    // Delete existing list
    await prisma.weeklyShoppingList.deleteMany({ where: { courseId: course.id, week } });

    // Create list
    const list = await prisma.weeklyShoppingList.create({ data: { courseId: course.id, week } });

    const itemsData = Object.keys(ingredientsMap).map(ingredient => ({ ingredient, listId: list.id }));
    if (itemsData.length)
      await prisma.shoppingListItem.createMany({ data: itemsData });

    console.log(`Week ${week} synced with ${itemsData.length} items`);
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 
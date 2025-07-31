import { PrismaClient } from '@prisma/client';
import path from 'path';

// Allow requiring TS files directly
require('ts-node/register/transpile-only');

const prisma = new PrismaClient();

(async () => {
  try {
    const mealPlansPath = path.resolve(__dirname, '../app/data/mealPlans.ts');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { mealPlans } = require(mealPlansPath);

    const slots = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

    const slugSet = new Set<string>();

    for (const weekPlan of Object.values(mealPlans) as any[]) {
      for (const dayMeals of Object.values(weekPlan.days)) {
        for (const slot of slots) {
          const mealItem: any = (dayMeals as any)[slot];
          if (!mealItem || !mealItem.recipeLink) continue;
          // Skip leftovers (name contains "(Rester)" or similar)
          if (mealItem.name && typeof mealItem.name === 'string' && mealItem.name.toLowerCase().includes('(rester')) continue;
          const slug = mealItem.recipeLink.split('/').pop();
          if (slug) slugSet.add(slug);
        }
      }
    }

    const slugs = Array.from(slugSet);
    const missing: string[] = [];

    for (const slug of slugs) {
      const exists = await prisma.recipe.findUnique({ where: { slug } });
      if (!exists) missing.push(slug);
    }

    if (missing.length === 0) {
      console.log('✅ Alla recept i Functional Basics mealPlans finns i databasen.');
    } else {
      console.log('❌ Saknade recept i databasen (' + missing.length + ' st):');
      missing.forEach(s => console.log(' -', s));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
})(); 
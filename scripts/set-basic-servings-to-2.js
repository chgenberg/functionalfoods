// Update servings for Basic-course recipes: set from 4 -> 2
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    // Count candidates (tags contains 'Basic' or categories contains 'basic') with servings = 4
    const candidates = await prisma.recipe.count({
      where: {
        servings: 4,
        OR: [
          { tags: { has: 'Basic' } },
          { categories: { has: 'basic' } }
        ]
      }
    });
    console.log(`Candidates (servings 4 -> 2): ${candidates}`);

    if (candidates === 0) {
      await prisma.$disconnect();
      return;
    }

    const res = await prisma.recipe.updateMany({
      where: {
        servings: 4,
        OR: [
          { tags: { has: 'Basic' } },
          { categories: { has: 'basic' } }
        ]
      },
      data: { servings: 2 }
    });
    console.log(`Updated recipes: ${res.count}`);
  } catch (e) {
    console.error('Failed to update Basic servings:', e);
    process.exitCode = 1;
  }
}

main();



/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const recipes = [
  {
    searchName: 'Laxsallad med ägg',
    nutrition: { kcal: 463, protein: 38, carbs: 5, fat: 31, fiber: 0 },
    servings: 1
  },
  {
    searchName: 'Lövbiff Teriyaki med nudelsallad',
    nutrition: { kcal: 592, protein: 73, carbs: 35, fat: 12, fiber: 0 },
    servings: 2
  },
  {
    searchName: 'Kavring med frön',
    nutrition: { kcal: 178, protein: 0, carbs: 22, fat: 7, fiber: 0 },
    servings: 14
  },
  {
    searchName: 'Citronvatten och svart kaffe',
    nutrition: { kcal: 7, protein: 0, carbs: 1, fat: 0, fiber: 0 },
    servings: 1
  }
];

async function main() {
  console.log('🍳 Uppdaterar näringsvärden för 4 recept...\n');
  
  for (const recipeData of recipes) {
    // Hitta receptet (flexibel sökning)
    let recipe = await prisma.recipe.findFirst({
      where: { 
        title: { 
          contains: recipeData.searchName.split(' ')[0], // Första ordet
          mode: 'insensitive' 
        },
        // Säkerställ att det är från hormone-kursen
        OR: [
          { tags: { has: 'hormonell-balans' } },
          { categories: { has: 'hormone' } },
          { slug: { contains: recipeData.searchName.toLowerCase().replace(/\s+/g, '-').substring(0, 10) } }
        ]
      }
    });

    // Om inte hittat, sök bredare
    if (!recipe) {
      recipe = await prisma.recipe.findFirst({
        where: {
          title: {
            contains: recipeData.searchName.substring(0, 15),
            mode: 'insensitive'
          }
        }
      });
    }

    if (!recipe) {
      console.error(`❌ Kunde inte hitta: ${recipeData.searchName}`);
      continue;
    }

    // Uppdatera receptet
    const updated = await prisma.recipe.update({
      where: { id: recipe.id },
      data: {
        nutrition: recipeData.nutrition,
        servings: recipeData.servings
      }
    });

    console.log(`✅ ${updated.title}`);
    console.log(`   ${recipeData.nutrition.kcal} kcal, ${recipeData.servings} portioner`);
    console.log(`   P: ${recipeData.nutrition.protein}g, K: ${recipeData.nutrition.carbs}g, F: ${recipeData.nutrition.fat}g\n`);
  }
  
  console.log('🎉 Klart!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


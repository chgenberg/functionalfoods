const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('🎯 Tagging Functional Energy recipes as premium...\n');

  try {
    // Read extracted meal plans data
    const extractedPath = path.join(process.cwd(), 'scripts', 'extracted-energy-meal-plans-v2.json');
    const energyMealPlans = JSON.parse(fs.readFileSync(extractedPath, 'utf-8'));
    
    // Collect all unique recipe slugs from Energy meal plans
    const recipeSlugs = new Set();
    
    Object.values(energyMealPlans).forEach(week => {
      Object.values(week.days).forEach(day => {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          if (day[mealType]?.recipeLink) {
            const slug = day[mealType].recipeLink.split('/').pop();
            recipeSlugs.add(slug);
          }
        });
      });
    });

    console.log(`📊 Found ${recipeSlugs.size} unique recipes in Functional Energy meal plans\n`);

    // Update recipes to be premium and add Energy tag
    let updatedCount = 0;
    for (const slug of recipeSlugs) {
      const recipe = await prisma.recipe.findUnique({
        where: { slug },
        select: { id: true, title: true, tags: true }
      });

      if (recipe) {
        const currentTags = recipe.tags || [];
        const newTags = [...new Set([...currentTags, 'Energy'])];

        await prisma.recipe.update({
          where: { slug },
          data: {
            isPremium: true,
            isFree: false,
            tags: newTags
          }
        });

        updatedCount++;
        console.log(`✅ Updated: ${recipe.title}`);
      } else {
        console.log(`⚠️  Recipe not found: ${slug}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`- Total unique recipes in Energy: ${recipeSlugs.size}`);
    console.log(`- Successfully updated: ${updatedCount}`);
    console.log(`- Missing recipes: ${recipeSlugs.size - updatedCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixRecipeAccessControl() {
  try {
    console.log('🔒 Fixing recipe access control...');

    // Read mealPlans.ts to get all course recipe slugs
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const content = fs.readFileSync(mealPlansPath, 'utf8');

    // Extract all recipe slugs used in courses
    const courseRecipeSlugs = new Set();
    const regex = /\/kunskapsbank\/recept\/([^"]+)/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      courseRecipeSlugs.add(match[1]);
    }

    console.log(`Found ${courseRecipeSlugs.size} unique recipes used in courses`);

    // Get all recipes from database
    const allRecipes = await prisma.recipe.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        isPremium: true,
        isFree: true,
        tags: true
      }
    });

    console.log(`Total recipes in database: ${allRecipes.length}`);

    let updatedToPremium = 0;
    let updatedToFree = 0;
    let alreadyCorrect = 0;

    // Process each recipe
    for (const recipe of allRecipes) {
      const isUsedInCourse = courseRecipeSlugs.has(recipe.slug);
      const isAdminOnly = recipe.tags?.includes('ADMIN_ONLY') || recipe.tags?.includes('UD');
      
      // Skip admin-only recipes (they should not be changed)
      if (isAdminOnly) {
        continue;
      }

      if (isUsedInCourse) {
        // Should be premium only (not free)
        if (!recipe.isPremium || recipe.isFree) {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: {
              isPremium: true,
              isFree: false
            }
          });
          updatedToPremium++;
          console.log(`✅ Made premium: ${recipe.slug}`);
        } else {
          alreadyCorrect++;
        }
      } else {
        // Should be free (not premium)
        if (recipe.isPremium || !recipe.isFree) {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: {
              isPremium: false,
              isFree: true
            }
          });
          updatedToFree++;
          console.log(`🆓 Made free: ${recipe.slug}`);
        } else {
          alreadyCorrect++;
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Updated to premium (course recipes): ${updatedToPremium}`);
    console.log(`🆓 Updated to free (non-course recipes): ${updatedToFree}`);
    console.log(`✔️  Already correctly configured: ${alreadyCorrect}`);

    // Verify final state
    const finalStats = await prisma.recipe.groupBy({
      by: ['isPremium', 'isFree'],
      _count: true,
      where: {
        NOT: {
          tags: {
            hasSome: ['ADMIN_ONLY', 'UD']
          }
        }
      }
    });

    console.log('\n📈 Final recipe access distribution:');
    finalStats.forEach(stat => {
      const type = stat.isPremium ? 'Premium' : (stat.isFree ? 'Free' : 'Unknown');
      console.log(`- ${type}: ${stat._count}`);
    });

    // Double-check course recipes
    const courseRecipeCheck = await prisma.recipe.findMany({
      where: {
        slug: { in: Array.from(courseRecipeSlugs) }
      },
      select: {
        slug: true,
        isPremium: true,
        isFree: true
      }
    });

    const incorrectCourseRecipes = courseRecipeCheck.filter(r => !r.isPremium || r.isFree);
    if (incorrectCourseRecipes.length > 0) {
      console.log('\n⚠️  WARNING: Some course recipes are still not premium:');
      incorrectCourseRecipes.slice(0, 5).forEach(r => {
        console.log(`- ${r.slug} (premium: ${r.isPremium}, free: ${r.isFree})`);
      });
    } else {
      console.log('\n✅ All course recipes are correctly set as premium-only!');
    }

  } catch (err) {
    console.error('❌ Error fixing recipe access:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixRecipeAccessControl();
}

module.exports = { fixRecipeAccessControl }; 
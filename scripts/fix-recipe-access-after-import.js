const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixRecipeAccess() {
  try {
    console.log('🔧 Återställer korrekt recept-åtkomst efter UD-import...\n');

    // 1. Sätt alla UD-recept som ADMIN_ONLY och inte tillgängliga för vanliga användare
    const udRecipesUpdate = await prisma.recipe.updateMany({
      where: {
        tags: { has: 'UD' }
      },
      data: {
        isPremium: true,
        isFree: false
      }
    });
    console.log(`✅ Uppdaterade ${udRecipesUpdate.count} UD-recept som admin-endast`);

    // 2. Hämta alla kurs-recept från mealPlans.ts
    const mealPlansPath = path.join(__dirname, '../app/data/mealPlans.ts');
    const mealPlansContent = fs.readFileSync(mealPlansPath, 'utf8');

    const extractRecipeSlugs = (courseSection) => {
      const recipeLinks = courseSection.match(/recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g) || [];
      return recipeLinks.map(link => {
        const match = link.match(/recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/);
        return match ? match[1] : null;
      }).filter(Boolean);
    };

    // Extrahera alla kurs-recept
    const basicsMatch = mealPlansContent.match(/export const mealPlans[^}]+}[^;]+;/s);
    const flowMatch = mealPlansContent.match(/export const flowMealPlans[^}]+}[^;]+;/s);
    const energyMatch = mealPlansContent.match(/export const energyMealPlans[^}]+}[^;]+;/s);

    const basicsSlugs = basicsMatch ? extractRecipeSlugs(basicsMatch[0]) : [];
    const flowSlugs = flowMatch ? extractRecipeSlugs(flowMatch[0]) : [];
    const energySlugs = energyMatch ? extractRecipeSlugs(energyMatch[0]) : [];

    const allCourseLinkedSlugs = [...new Set([...basicsSlugs, ...flowSlugs, ...energySlugs])];

    console.log(`📚 Hittade ${allCourseLinkedSlugs.length} kurs-länkade recept`);

    // 3. Sätt kurs-recept som premium (endast tillgängliga för kursdeltagare)
    const courseRecipesUpdate = await prisma.recipe.updateMany({
      where: {
        slug: { in: allCourseLinkedSlugs },
        NOT: {
          tags: { has: 'UD' } // Exkludera UD-recept
        }
      },
      data: {
        isPremium: true,
        isFree: false
      }
    });
    console.log(`✅ Uppdaterade ${courseRecipesUpdate.count} kurs-recept som premium`);

    // 4. Sätt alla andra recept (som inte är UD eller kurs-recept) som gratis
    const freeRecipesUpdate = await prisma.recipe.updateMany({
      where: {
        slug: { notIn: allCourseLinkedSlugs },
        NOT: [
          { tags: { has: 'UD' } },
          { tags: { has: 'ADMIN_ONLY' } }
        ]
      },
      data: {
        isPremium: false,
        isFree: true
      }
    });
    console.log(`✅ Uppdaterade ${freeRecipesUpdate.count} recept som gratis`);

    // 5. Kontrollera slutresultat
    const finalStats = await Promise.all([
      prisma.recipe.count({ where: { tags: { has: 'UD' } } }),
      prisma.recipe.count({ where: { tags: { has: 'ADMIN_ONLY' } } }),
      prisma.recipe.count({ where: { isPremium: true, isFree: false } }),
      prisma.recipe.count({ where: { isPremium: false, isFree: true } }),
      prisma.recipe.count()
    ]);

    console.log('\n📊 SLUTRESULTAT:');
    console.log(`┌─────────────────────────────┬─────────┐`);
    console.log(`│ Kategori                    │ Antal   │`);
    console.log(`├─────────────────────────────┼─────────┤`);
    console.log(`│ UD-recept (admin-endast)    │ ${finalStats[0].toString().padStart(7)} │`);
    console.log(`│ ADMIN_ONLY totalt           │ ${finalStats[1].toString().padStart(7)} │`);
    console.log(`│ Premium (kurs-recept)       │ ${finalStats[2].toString().padStart(7)} │`);
    console.log(`│ Gratis (öppna recept)       │ ${finalStats[3].toString().padStart(7)} │`);
    console.log(`│ Totalt antal recept         │ ${finalStats[4].toString().padStart(7)} │`);
    console.log(`└─────────────────────────────┴─────────┘`);

    // 6. Kontrollera att alla recept har korrekt status
    const problematicRecipes = await prisma.recipe.count({
      where: {
        AND: [
          { isPremium: false },
          { isFree: false }
        ]
      }
    });

    if (problematicRecipes > 0) {
      console.log(`\n⚠️  VARNING: ${problematicRecipes} recept har varken premium eller gratis status!`);
      
      // Fixa dessa genom att sätta dem som gratis
      await prisma.recipe.updateMany({
        where: {
          AND: [
            { isPremium: false },
            { isFree: false }
          ]
        },
        data: {
          isFree: true
        }
      });
      console.log(`✅ Fixade ${problematicRecipes} problematiska recept som gratis`);
    } else {
      console.log(`\n✅ Alla recept har korrekt åtkomststatus!`);
    }

  } catch (error) {
    console.error('❌ Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixRecipeAccess();
}

module.exports = { fixRecipeAccess }; 
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function correctRecipeCategories() {
  try {
    console.log('🎯 Korrigerar recept-kategorier till rätt antal...\n');

    // 1. Hämta alla kurs-recept från mealPlans.ts
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

    console.log(`📚 Hittade ${allCourseLinkedSlugs.length} unika kurs-recept`);
    console.log(`- Functional Basics: ${[...new Set(basicsSlugs)].length} recept`);
    console.log(`- Functional Flow: ${[...new Set(flowSlugs)].length} recept`);
    console.log(`- Functional Energy: ${[...new Set(energySlugs)].length} recept\n`);

    // 2. FÖRST: Sätt ALLA recept som gratis och inte premium (reset)
    console.log('🔄 Återställer alla recept till gratis...');
    const resetAll = await prisma.recipe.updateMany({
      data: {
        isPremium: false,
        isFree: true
      }
    });
    console.log(`✅ Återställde ${resetAll.count} recept till gratis`);

    // 3. Sätt endast kurs-recept som premium (exkluderar UD-recept)
    console.log('🔒 Sätter kurs-recept som premium...');
    const courseRecipesUpdate = await prisma.recipe.updateMany({
      where: {
        slug: { in: allCourseLinkedSlugs },
        NOT: {
          tags: { has: 'UD' } // Viktigt: Exkludera UD-recept
        }
      },
      data: {
        isPremium: true,
        isFree: false
      }
    });
    console.log(`✅ Satte ${courseRecipesUpdate.count} kurs-recept som premium`);

    // 4. Sätt UD-recept som admin-endast (inte premium, inte gratis)
    console.log('👨‍💼 Sätter UD-recept som admin-endast...');
    const udRecipesUpdate = await prisma.recipe.updateMany({
      where: {
        tags: { has: 'UD' }
      },
      data: {
        isPremium: false, // INTE premium!
        isFree: false     // Men inte heller gratis
      }
    });
    console.log(`✅ Satte ${udRecipesUpdate.count} UD-recept som admin-endast`);

    // 5. Kontrollera slutresultat
    const finalStats = await Promise.all([
      prisma.recipe.count({ where: { tags: { has: 'UD' } } }),
      prisma.recipe.count({ where: { tags: { has: 'ADMIN_ONLY' } } }),
      prisma.recipe.count({ where: { isPremium: true, isFree: false } }), // Endast kurs-recept
      prisma.recipe.count({ where: { isPremium: false, isFree: true } }), // Gratis recept
      prisma.recipe.count({ where: { isPremium: false, isFree: false } }), // Admin-endast (UD)
      prisma.recipe.count()
    ]);

    console.log('\n📊 KORREKT SLUTRESULTAT:');
    console.log(`┌─────────────────────────────┬─────────┐`);
    console.log(`│ Kategori                    │ Antal   │`);
    console.log(`├─────────────────────────────┼─────────┤`);
    console.log(`│ UD-recept                   │ ${finalStats[0].toString().padStart(7)} │`);
    console.log(`│ ADMIN_ONLY totalt           │ ${finalStats[1].toString().padStart(7)} │`);
    console.log(`│ Premium (ENDAST kurs-recept)│ ${finalStats[2].toString().padStart(7)} │`);
    console.log(`│ Gratis (öppna recept)       │ ${finalStats[3].toString().padStart(7)} │`);
    console.log(`│ Admin-endast (UD, ej premium)│ ${finalStats[4].toString().padStart(7)} │`);
    console.log(`│ Totalt antal recept         │ ${finalStats[5].toString().padStart(7)} │`);
    console.log(`└─────────────────────────────┴─────────┘`);

    // 6. Verifiera att vi har rätt antal premium recept
    if (finalStats[2] >= 200 && finalStats[2] <= 220) {
      console.log(`\n✅ PERFEKT! Premium-recept (${finalStats[2]}) är nu i rätt intervall (200-220)`);
    } else {
      console.log(`\n⚠️  Premium-recept (${finalStats[2]}) är inte i förväntat intervall (200-220)`);
    }

    // 7. Kontrollera att inga recept saknar status
    const problematicCount = finalStats[5] - (finalStats[2] + finalStats[3] + finalStats[4]);
    if (problematicCount === 0) {
      console.log(`✅ Alla recept har korrekt status!`);
    } else {
      console.log(`⚠️  ${problematicCount} recept har oklar status`);
    }

  } catch (error) {
    console.error('❌ Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  correctRecipeCategories();
}

module.exports = { correctRecipeCategories }; 
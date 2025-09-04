const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixCourseUDRecipes() {
  try {
    console.log('🔄 Konverterar UD-recept som används i kurser till vanliga kurs-recept...\n');

    // Läs mealPlans.ts och extrahera alla recept-slugs
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
    const basicsMatch = mealPlansContent.match(/export const mealPlans[^=]*=\s*{([\s\S]*?)};/);
    const flowMatch = mealPlansContent.match(/export const flowMealPlans[^=]*=\s*{([\s\S]*?)};/);
    const energyMatch = mealPlansContent.match(/export const energyMealPlans[^=]*=\s*{([\s\S]*?)};/);

    const basicsSlugs = basicsMatch ? extractRecipeSlugs(basicsMatch[1]) : [];
    const flowSlugs = flowMatch ? extractRecipeSlugs(flowMatch[1]) : [];
    const energySlugs = energyMatch ? extractRecipeSlugs(energyMatch[1]) : [];

    const allCourseLinkedSlugs = [...new Set([...basicsSlugs, ...flowSlugs, ...energySlugs])];

    console.log(`📚 Hittade ${allCourseLinkedSlugs.length} unika recept-slugs i kurser`);

    // Hitta UD-recept som används i kurser
    const udRecipesInCourses = await prisma.recipe.findMany({
      where: {
        slug: { in: allCourseLinkedSlugs },
        tags: { has: 'UD' }
      },
      select: {
        id: true,
        slug: true,
        title: true,
        tags: true
      }
    });

    console.log(`⚠️  Hittade ${udRecipesInCourses.length} UD-recept som används i kurser`);

    if (udRecipesInCourses.length > 0) {
      console.log('\n🔄 Konverterar UD-recept till vanliga kurs-recept...');
      
      for (const recipe of udRecipesInCourses) {
        // Ta bort UD och ADMIN_ONLY tags, behåll andra tags
        const newTags = recipe.tags.filter(tag => tag !== 'UD' && tag !== 'ADMIN_ONLY');
        
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            tags: newTags,
            isPremium: true,  // Kurs-recept ska vara premium
            isFree: false
          }
        });
        
        console.log(`✅ Konverterade: ${recipe.title} (${recipe.slug})`);
      }
    }

    // Hitta saknade recept
    const existingRecipes = await prisma.recipe.findMany({
      where: { slug: { in: allCourseLinkedSlugs } },
      select: { slug: true }
    });

    const existingSlugs = existingRecipes.map(r => r.slug);
    const missingSlugs = allCourseLinkedSlugs.filter(slug => !existingSlugs.includes(slug));

    if (missingSlugs.length > 0) {
      console.log(`\n❌ SAKNADE RECEPT (${missingSlugs.length} st):`);
      missingSlugs.forEach(slug => {
        console.log(`   - ${slug}`);
      });
    }

    // Slutstatistik
    const finalStats = await Promise.all([
      prisma.recipe.count({ where: { tags: { has: 'UD' } } }),
      prisma.recipe.count({ where: { tags: { has: 'ADMIN_ONLY' } } }),
      prisma.recipe.count({ where: { isPremium: true, isFree: false } }),
      prisma.recipe.count({ where: { isPremium: false, isFree: true } }),
      prisma.recipe.count({ where: { isPremium: false, isFree: false } }),
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
    console.log(`│ Admin-endast (varken/eller) │ ${finalStats[4].toString().padStart(7)} │`);
    console.log(`│ Totalt antal recept         │ ${finalStats[5].toString().padStart(7)} │`);
    console.log(`└─────────────────────────────┴─────────┘`);

    // Kontrollera om vi nu har rätt antal premium recept
    if (finalStats[2] >= 200 && finalStats[2] <= 250) {
      console.log(`\n✅ PERFEKT! Premium-recept (${finalStats[2]}) är nu i rätt intervall!`);
    } else {
      console.log(`\n⚠️  Premium-recept (${finalStats[2]}) är fortfarande inte i förväntat intervall (200-250)`);
    }

  } catch (error) {
    console.error('❌ Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixCourseUDRecipes();
}

module.exports = { fixCourseUDRecipes }; 
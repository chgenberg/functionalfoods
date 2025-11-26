const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Detaljerad kontroll
async function detailedCheck() {
  try {
    console.log('=== DETALJERAD KONTROLL ===\n');
    
    const mp = await prisma.mealPlanWeek.findUnique({
      where: { course_weekNumber: { course: 'hormone', weekNumber: 1 } }
    });
    
    const allSlugs = [];
    const days = mp?.days || {};
    const dayOrder = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
    
    for (const dayName of dayOrder) {
      const day = days[dayName];
      if (day) {
        for (const mt of mealTypes) {
          if (day[mt]?.recipeLink) {
            allSlugs.push(day[mt].recipeLink.replace(/^\/kunskapsbank\/recept\//, ''));
          }
        }
      }
    }
    
    const uniqueSlugs = [...new Set(allSlugs)];
    
    const recipes = await prisma.recipe.findMany({
      where: { slug: { in: uniqueSlugs } },
      select: { slug: true, title: true, isPremium: true, tags: true }
    });
    
    const hormonTags = ['Hormone', 'hormonell-balans', 'functional-hormone'];
    
    console.log('RECEPT SOM SKULLE FILTRERAS BORT (premium utan hormonell-balans tagg):\n');
    
    let blockedCount = 0;
    let accessibleCount = 0;
    
    recipes.forEach(r => {
      const tags = r.tags || [];
      const hasHormonTag = tags.some(t => hormonTags.includes(t));
      
      if (r.isPremium && !hasHormonTag) {
        blockedCount++;
        console.log(`❌ ${r.title}`);
        console.log(`   Slug: ${r.slug}`);
        console.log(`   Tags: ${tags.join(', ')}`);
        console.log('');
      } else {
        accessibleCount++;
      }
    });
    
    if (blockedCount === 0) {
      console.log('✅ Inga recept blockeras - alla har rätt taggar!\n');
    }
    
    console.log(`Sammanfattning:`);
    console.log(`  - Tillgängliga: ${accessibleCount}`);
    console.log(`  - Blockerade: ${blockedCount}`);
    
  } catch (e) {
    console.error('Fel:', e);
  } finally {
    await prisma.$disconnect();
  }
}

detailedCheck();


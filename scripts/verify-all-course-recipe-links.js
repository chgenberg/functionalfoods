const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function verifyAllCourseRecipeLinks() {
  try {
    console.log('🔍 Verifierar ALLA recept-länkar i kostscheman för alla kurser...\n');

    // Läs mealPlans.ts
    const mealPlansPath = path.join(__dirname, '../app/data/mealPlans.ts');
    const mealPlansContent = fs.readFileSync(mealPlansPath, 'utf8');

    // Hämta alla recept från databasen
    const allRecipes = await prisma.recipe.findMany({
      select: {
        slug: true,
        title: true,
        isPremium: true,
        isFree: true,
        tags: true
      }
    });

    const recipeMap = new Map(allRecipes.map(r => [r.slug, r]));

    // Funktion för att extrahera och verifiera recept från en kurs
    function verifyRecipesInCourse(courseName, courseContent) {
      console.log(`\n📚 ${courseName.toUpperCase()}:`);
      console.log('='.repeat(50));
      
      let totalMeals = 0;
      let workingLinks = 0;
      let brokenLinks = 0;
      let missingRecipes = [];
      let udRecipesInCourse = [];
      
      // Uppdaterat mönster för att matcha det faktiska formatet
      const mealPattern = /"name":\s*"([^"]+)"(?:,\s*"recipeLink":\s*"([^"]*)"|)/g;
      let match;
      
      while ((match = mealPattern.exec(courseContent)) !== null) {
        const [, mealName, recipeLink] = match;
        totalMeals++;
        
        if (!recipeLink || recipeLink.trim() === '') {
          console.log(`❌ ${mealName} - SAKNAR recipeLink`);
          brokenLinks++;
          continue;
        }
        
        // Extrahera slug från recipeLink
        const slugMatch = recipeLink.match(/\/kunskapsbank\/recept\/([^"]+)/);
        if (!slugMatch) {
          console.log(`❌ ${mealName} - OGILTIG recipeLink: ${recipeLink}`);
          brokenLinks++;
          continue;
        }
        
        const slug = slugMatch[1];
        const recipe = recipeMap.get(slug);
        
        if (!recipe) {
          console.log(`❌ ${mealName} - RECEPT FINNS INTE: ${slug}`);
          missingRecipes.push({ meal: mealName, slug, link: recipeLink });
          brokenLinks++;
        } else {
          // Kontrollera om det är ett UD-recept
          if (recipe.tags && recipe.tags.includes('UD')) {
            console.log(`⚠️  ${mealName} - UD-RECEPT: ${slug}`);
            udRecipesInCourse.push({ meal: mealName, slug, recipe });
          } else {
            console.log(`✅ ${mealName} - OK: ${slug}`);
          }
          workingLinks++;
        }
      }
      
      console.log(`\n📊 ${courseName} Sammanfattning:`);
      console.log(`Totalt måltider: ${totalMeals}`);
      console.log(`Fungerande länkar: ${workingLinks}`);
      console.log(`Brutna länkar: ${brokenLinks}`);
      console.log(`UD-recept i kurs: ${udRecipesInCourse.length}`);
      
      if (missingRecipes.length > 0) {
        console.log(`\n🚨 SAKNADE RECEPT i ${courseName}:`);
        missingRecipes.forEach(item => {
          console.log(`   - ${item.meal} → ${item.slug}`);
        });
      }
      
      if (udRecipesInCourse.length > 0) {
        console.log(`\n⚠️  UD-RECEPT i ${courseName}:`);
        udRecipesInCourse.forEach(item => {
          console.log(`   - ${item.meal} → ${item.slug}`);
        });
      }
      
      return {
        courseName,
        totalMeals,
        workingLinks,
        brokenLinks,
        missingRecipes,
        udRecipesInCourse
      };
    }

    // Extrahera kurser - uppdaterade mönster för att matcha det faktiska formatet
    const basicsMatch = mealPlansContent.match(/export const mealPlans[^=]*=\s*{([\s\S]*?)};/);
    const flowMatch = mealPlansContent.match(/export const flowMealPlans[^=]*=\s*{([\s\S]*?)};/);
    const energyMatch = mealPlansContent.match(/export const energyMealPlans[^=]*=\s*{([\s\S]*?)};/);

    const results = [];
    
    if (basicsMatch) {
      results.push(verifyRecipesInCourse('Functional Basics', basicsMatch[1]));
    } else {
      console.log('❌ Kunde inte hitta Functional Basics i mealPlans.ts');
    }
    
    if (flowMatch) {
      results.push(verifyRecipesInCourse('Functional Flow', flowMatch[1]));
    } else {
      console.log('❌ Kunde inte hitta Functional Flow i mealPlans.ts');
    }
    
    if (energyMatch) {
      results.push(verifyRecipesInCourse('Functional Energy', energyMatch[1]));
    } else {
      console.log('❌ Kunde inte hitta Functional Energy i mealPlans.ts');
    }

    // Sammanfattning av alla kurser
    console.log('\n' + '='.repeat(60));
    console.log('📊 SAMMANFATTNING ALLA KURSER');
    console.log('='.repeat(60));
    
    let totalMealsAll = 0;
    let totalWorkingAll = 0;
    let totalBrokenAll = 0;
    let totalMissingAll = 0;
    let totalUDAll = 0;
    
    results.forEach(result => {
      totalMealsAll += result.totalMeals;
      totalWorkingAll += result.workingLinks;
      totalBrokenAll += result.brokenLinks;
      totalMissingAll += result.missingRecipes.length;
      totalUDAll += result.udRecipesInCourse.length;
      
      console.log(`${result.courseName.padEnd(20)} | ${result.workingLinks.toString().padStart(3)}/${result.totalMeals.toString().padStart(3)} OK | ${result.brokenLinks.toString().padStart(2)} brutna | ${result.udRecipesInCourse.length.toString().padStart(2)} UD`);
    });
    
    console.log('-'.repeat(60));
    console.log(`${'TOTALT'.padEnd(20)} | ${totalWorkingAll.toString().padStart(3)}/${totalMealsAll.toString().padStart(3)} OK | ${totalBrokenAll.toString().padStart(2)} brutna | ${totalUDAll.toString().padStart(2)} UD`);
    
    // Slutstatus
    if (totalBrokenAll === 0) {
      console.log('\n🎉 PERFEKT! Alla recept-länkar fungerar!');
    } else {
      console.log(`\n⚠️  ${totalBrokenAll} recept-länkar behöver fixas`);
    }
    
    if (totalUDAll > 0) {
      console.log(`\n⚠️  VARNING: ${totalUDAll} UD-recept används i kurser - dessa är admin-endast!`);
    }

  } catch (error) {
    console.error('❌ Fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyAllCourseRecipeLinks();
}

module.exports = { verifyAllCourseRecipeLinks }; 
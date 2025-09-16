const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeAllNutrition() {
  console.log('🔍 ANALYS AV ALLA NÄRINGSBERÄKNINGAR');
  console.log('='.repeat(50));
  
  try {
    const recipes = await prisma.recipe.findMany({
      where: { status: 'PUBLISHED' },
      select: { 
        title: true, 
        nutrition: true,
        ingredients: true,
        servings: true
      },
      orderBy: { title: 'asc' }
    });
    
    // Kategorisera recept
    const veryLow = []; // <50 kcal
    const low = []; // 50-150 kcal
    const normal = []; // 150-500 kcal
    const high = []; // 500-800 kcal
    const veryHigh = []; // >800 kcal
    const noData = [];
    
    recipes.forEach(recipe => {
      const calories = recipe.nutrition?.perServing?.energy;
      if (!calories || calories === 0) {
        noData.push(recipe);
      } else if (calories < 50) {
        veryLow.push(recipe);
      } else if (calories < 150) {
        low.push(recipe);
      } else if (calories < 500) {
        normal.push(recipe);
      } else if (calories < 800) {
        high.push(recipe);
      } else {
        veryHigh.push(recipe);
      }
    });
    
    console.log(`📊 ÖVERSIKT (${recipes.length} recept totalt):`);
    console.log(`❄️  Mycket låga (<50 kcal): ${veryLow.length}`);
    console.log(`🟡 Låga (50-150 kcal): ${low.length}`);
    console.log(`🟢 Normala (150-500 kcal): ${normal.length}`);
    console.log(`🟠 Höga (500-800 kcal): ${high.length}`);
    console.log(`🔥 Mycket höga (>800 kcal): ${veryHigh.length}`);
    console.log(`❌ Utan data: ${noData.length}`);
    console.log('');
    
    // Visa suspekta recept
    if (veryLow.length > 0) {
      console.log('❄️ MYCKET LÅGA KALORIER (<50 kcal) - SUSPEKTA:');
      veryLow.forEach((recipe, i) => {
        console.log(`${i+1}. ${recipe.title}: ${recipe.nutrition.perServing.energy} kcal (${recipe.servings} port)`);
        // Visa ingredienser för första 3
        if (i < 3) {
          console.log(`   Ingredienser: ${recipe.ingredients.slice(0, 3).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}`);
        }
      });
      console.log('');
    }
    
    if (veryHigh.length > 0) {
      console.log('🔥 MYCKET HÖGA KALORIER (>800 kcal) - KONTROLLERA:');
      veryHigh.forEach((recipe, i) => {
        console.log(`${i+1}. ${recipe.title}: ${recipe.nutrition.perServing.energy} kcal (${recipe.servings} port)`);
        // Visa ingredienser för första 3
        if (i < 3) {
          console.log(`   Ingredienser: ${recipe.ingredients.slice(0, 3).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}`);
        }
      });
      console.log('');
    }
    
    if (noData.length > 0) {
      console.log('❌ RECEPT UTAN NÄRINGSDATA:');
      noData.forEach((recipe, i) => {
        console.log(`${i+1}. ${recipe.title}`);
      });
      console.log('');
    }
    
    // Visa några bra exempel
    console.log('🟢 EXEMPEL NORMALA RECEPT (150-500 kcal):');
    normal.slice(0, 8).forEach((recipe, i) => {
      const n = recipe.nutrition.perServing;
      console.log(`${i+1}. ${recipe.title}: ${n.energy} kcal, ${n.protein}g protein, ${n.carbohydrates}g kolh, ${n.fat}g fett`);
    });
    
  } catch (error) {
    console.error('❌ Fel:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeAllNutrition(); 
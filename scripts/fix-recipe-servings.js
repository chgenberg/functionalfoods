const { PrismaClient } = require('@prisma/client');

async function fixRecipeServings() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🍽️ Fixar receptportioner baserat på beskrivningar...');
    
    // Get all recipes with content
    const recipes = await prisma.recipe.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        servings: true,
        ingredients: true
      }
    });
    
    console.log(`📋 Kollar ${recipes.length} recept...`);
    
    let updated = 0;
    let analyzed = 0;
    
    for (const recipe of recipes) {
      analyzed++;
      
      if (!recipe.content) continue;
      
      // Look for patterns like "lagar 2 portioner", "Detta recept lagar 3 portioner", etc.
      const content = recipe.content.toLowerCase();
      const patterns = [
        /lagar\s+(\d+)\s+portioner/g,
        /detta\s+recept\s+lagar\s+(\d+)\s+portioner/g,
        /receptet\s+lagar\s+(\d+)\s+portioner/g,
        /ger\s+(\d+)\s+portioner/g,
        /för\s+(\d+)\s+portioner/g
      ];
      
      let foundServings = null;
      
      for (const pattern of patterns) {
        const match = pattern.exec(content);
        if (match) {
          foundServings = parseInt(match[1]);
          console.log(`📝 ${recipe.title}: Hittade "${match[0]}" → ${foundServings} portioner`);
          break;
        }
      }
      
      // Also check if there's "frys in en portion för senare" which indicates 2 portions
      if (!foundServings && content.includes('frys in en portion för senare')) {
        foundServings = 2;
        console.log(`🧊 ${recipe.title}: Hittade "frys in" → 2 portioner`);
      }
      
      // Also check if there's "rester" which often indicates 2+ portions
      if (!foundServings && content.includes('rester') && content.includes('portion')) {
        foundServings = 2;
        console.log(`♻️ ${recipe.title}: Hittade "rester" → 2 portioner`);
      }
      
      if (foundServings && foundServings !== recipe.servings) {
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: { 
            servings: foundServings,
            updatedAt: new Date()
          }
        });
        
        console.log(`✅ Uppdaterade ${recipe.title}: ${recipe.servings || 'okänt'} → ${foundServings} portioner`);
        updated++;
      }
    }
    
    console.log(`\n📊 Sammanfattning:`);
    console.log(`🔍 Analyserade: ${analyzed} recept`);
    console.log(`✅ Uppdaterade: ${updated} recept`);
    
    // Show some examples of updated recipes
    const examples = await prisma.recipe.findMany({
      where: {
        updatedAt: { gte: new Date(Date.now() - 60000) } // Last minute
      },
      select: {
        title: true,
        servings: true
      },
      take: 10
    });
    
    if (examples.length > 0) {
      console.log(`\n📋 Exempel på uppdaterade recept:`);
      examples.forEach(r => console.log(`- ${r.title}: ${r.servings} portioner`));
    }
    
  } catch (error) {
    console.error('❌ Kritiskt fel:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRecipeServings();

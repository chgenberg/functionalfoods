const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📸 Applicerar receptbild-matchningar...');
    
    // Read the matching report
    const reportPath = path.join(process.cwd(), 'public', 'RECIPE_IMAGE_MATCHING_REPORT.json');
    if (!fs.existsSync(reportPath)) {
      throw new Error('Matchningsrapport saknas. Kör fuzzy-match-recipe-images.js först.');
    }
    
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    console.log(`📋 Läser ${report.matches.length} matchningar från rapport`);
    
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    // Apply matches with high similarity (>= 85%)
    const highQualityMatches = report.matches.filter(m => m.similarity >= 0.85);
    console.log(`🎯 Applicerar ${highQualityMatches.length} högkvalitativa matchningar (>= 85% likhet)`);
    
    for (const match of highQualityMatches) {
      try {
        // Skip if recipe already has the same image
        if (match.currentImageUrl === match.matchedImagePath) {
          skipped++;
          continue;
        }
        
        await prisma.recipe.update({
          where: { id: match.recipeId },
          data: { 
            imageUrl: match.matchedImagePath,
            updatedAt: new Date()
          }
        });
        
        updated++;
        
        if (updated % 50 === 0) {
          console.log(`   Uppdaterat ${updated} recept...`);
        }
        
      } catch (error) {
        console.error(`❌ Fel vid uppdatering av "${match.recipeTitle}":`, error.message);
        errors++;
      }
    }
    
    console.log(`\n✅ Bildmatchning klar:`);
    console.log(`   Uppdaterade: ${updated} recept`);
    console.log(`   Skippade: ${skipped} (samma bild)`);
    console.log(`   Fel: ${errors}`);
    console.log(`   Högkvalitativa matchningar: ${highQualityMatches.length}/${report.matches.length}`);
    
    // Show some examples of updates
    const examples = highQualityMatches.slice(0, 5);
    if (examples.length > 0) {
      console.log('\n=== EXEMPEL PÅ UPPDATERINGAR ===');
      examples.forEach(match => {
        console.log(`"${match.recipeTitle}" → ${match.matchedImagePath} (${(match.similarity * 100).toFixed(1)}%)`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fel:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

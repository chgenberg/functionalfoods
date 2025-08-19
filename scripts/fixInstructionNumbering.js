const { PrismaClient } = require('@prisma/client');

function addNumberedSteps(instructions) {
  if (!instructions) return '';
  
  // Split by sentences and periods, then number them
  const sentences = instructions
    .split(/\.\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);
  
  return sentences
    .map((sentence, i) => `${i + 1}. ${sentence}${sentence.endsWith('.') ? '' : '.'}`)
    .join('\n');
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const recipes = await prisma.recipe.findMany({
      select: { id: true, title: true, slug: true, instructions: true }
    });

    console.log(`📝 Adding numbered steps to ${recipes.length} recipes...`);
    
    let updated = 0;
    for (const recipe of recipes) {
      if (!recipe.instructions) continue;
      
      const numberedInstructions = addNumberedSteps(recipe.instructions);
      
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: { instructions: numberedInstructions }
      });
      
      updated++;
      if (updated % 20 === 0) console.log(`✅ Updated ${updated}/${recipes.length}`);
    }

    console.log(`\n🎉 Added numbered steps to ${updated} recipes`);
    
    // Also output a mapping of old kostschema slugs to new optimized slugs
    console.log('\n📋 Recipe slug mapping for kostschema update:');
    const mapping = {
      'yoghurt-med-ketomusli': 'yoghurt-ketomusli-recept',
      'tonfisksallad-med-apple': 'tonfisksallad-apple-recept', 
      'squashspagetti-med-kottfarssas': 'squashspagetti-kottfarssas-recept',
      'stekt-agg-med-lax': 'stekt-agg-lax-recept',
      'het-ratatouille': 'het-ratatouille-recept',
      'gron-juice': 'gron-juice-recept',
      'pokebowl-med-kyckling': 'poke-bowl-kyckling-recept',
      'kottfarsbiffar-med-stekt-blomkal': 'kottfarsbiffar-blomkal-recept',
      'omelett-med-tomat': 'omelett-tomat-recept',
      '1-havrefrallor-med-morotter-och-aprikoser-valfritt-palagg': 'havrefrallor-morotter-aprikoser',
      'kycklinggryta-med-bakad-spetskal': 'kycklinggryta-spetskal-recept',
      'tropisk-smoothiebowl': 'tropisk-smoothiebowl-recept',
      'ugnsbakad-tomat-med-kottfars': 'ugnsbakad-tomat-kottfars'
    };
    
    for (const [oldSlug, newSlug] of Object.entries(mapping)) {
      const recipe = await prisma.recipe.findUnique({ where: { slug: newSlug } });
      if (recipe) {
        console.log(`✅ ${oldSlug} → ${newSlug}`);
      } else {
        console.log(`❌ ${oldSlug} → ${newSlug} (not found)`);
      }
    }

  } catch (e) {
    console.error('❌ Fix failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 
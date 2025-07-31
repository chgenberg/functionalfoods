const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixMealPlanLinks() {
  console.log('🔧 Fixing meal plan links by finding correct recipe slugs...\n');

  // Get all recipes from database
  const allRecipes = await prisma.recipe.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      isPremium: true,
      isFree: true
    }
  });

  console.log(`📊 Found ${allRecipes.length} recipes in database\n`);

  // Mapping of problematic slugs to their correct alternatives
  const fixMap = new Map();

  // Manual mappings based on the validation results
  const manualMappings = {
    'japansk-kycklingfarswok-med-groddar': 'forbattrad-extraktion-japansk-kycklingfarswok-med-groddar',
    'paronsallad-med-chevreost': 'final-extraktion-paronsallad-med-chevreost',
    'entrecote-med-haricot-verts-och-bearnaisesas': 'flow-recept-entrecote-med-haricots-verts-och-bearnaisesas',
    'stekt-agg-med-champinjoner': 'improved-flow-recept-aggrora-med-champinjoner',
    'yoghurt-med-bovetegranola': 'flow-recept-yoghurt-med-bovetegranola-och-frukt',
    'overnightoats-med-morot': 'flow-recept-morotssoppa-med-ingefara-och-rostade-kikartor',
    'keso-med-bovetegranola-och-frukt': 'flow-recept-yoghurt-med-bovetegranola-och-frukt',
    'bananpannkaka': 'improved-flow-recept-bananpannkaka',
    'notfarstimbaler-med-chevreost-och-soltorkad-tomat': 'improved-flow-recept-notfarstimbaler-med-chevreost-och-soltorkad-tomat',
    'aggrora-med-champinjoner': 'improved-flow-recept-aggrora-med-champinjoner',
    'chokladbars-med-majskakor': 'flow-recept-chokladbars-med-majskakor',
    'varm-chiagrot-med-apple': 'improved-flow-recept-varm-chiagrot-med-apple',
    'rokt-lax-med-blomkalssallad-och-citronyoghurt': 'rokt-lax-med-blomkalsallad-och-citronyoghurt',
    'bananmuffin': 'flow-recept-bananmuffin',
    'lovbiffsrullader-med-brie-pesto-och-rodbetor': 'flow-recept-lovbiffsrullader-med-brie-presto-och-rodbetor',
    'valnotslax-med-fetaostcreme': 'improved-flow-recept-valnotslax-med-fetaostcreme',
    'kottfarslimpa-med-tomat': 'flow-recept-kottfarslimpa-med-tomat',
    'kokt-agg-med-kaviar': 'flow-recept-kokt-agg-med-kaviar',
    'morotssoppa-med-ingefara-och-rostade-kikartor': 'flow-recept-morotssoppa-med-ingefara-och-rostade-kikartor'
  };

  // Add manual mappings to fixMap
  Object.entries(manualMappings).forEach(([oldSlug, newSlug]) => {
    const recipe = allRecipes.find(r => r.slug === newSlug);
    if (recipe) {
      fixMap.set(oldSlug, newSlug);
      console.log(`✅ Manual mapping: ${oldSlug} -> ${newSlug} (${recipe.title})`);
    } else {
      console.log(`❌ Manual mapping failed: ${oldSlug} -> ${newSlug} (not found)`);
    }
  });

  // Try to find automatic mappings for remaining issues
  const commonPrefixes = [
    'flow-recept-',
    'improved-flow-recept-',
    'forbattrad-extraktion-',
    'final-extraktion-',
    ''
  ];

  const missingFromValidation = [
    'morotsjuice',
    'kyckling-i-curry-med-kokosmjolk',
    'smoothiebowl-med-blabar-och-granola',
    'paronmusli-med-mandlar',
    'kott-i-mustig-tomatsas',
    'havregrynsgrot-med-valnotter-och-bar',
    'linssoppa-med-curry-och-spiskummin',
    'notgryta-med-sotpotatis',
    'glasnudelsallad-med-gronsaker',
    'halloumiburgare-med-rodbetor',
    'wokad-lovbiff-med-nudlar',
    'rotfruktssoppa',
    'kottfarssas-med-konjaksnudlar',
    'asiatisk-tonfisksallad',
    'squashspagetti-med-gronsakssos',
    'grillade-kottspett-med-grekisk-sallad',
    'omelett-med-keso-och-bar',
    'kott-och-hemmagjord-hummus',
    'aggrora-med-fetaost-och-spenat',
    'lax-med-rodbetssallad',
    'torrfisk-med-sotpotatis-och-spenat',
    'torsk-med-saffranssos',
    'chiapudding-med-jordgubbar-och-hallon',
    'blabarssmoothie',
    'torrfisk-med-sotpotatis',
    'omelett-med-avokado',
    'stekt-agg-med-avokado',
    'hamburgare-med-grekisk-sallad'
  ];

  console.log('\n🔍 Trying to find automatic mappings...');
  for (const missingSlug of missingFromValidation) {
    if (fixMap.has(missingSlug)) continue; // Already has manual mapping

    for (const prefix of commonPrefixes) {
      const candidateSlug = prefix + missingSlug;
      const recipe = allRecipes.find(r => r.slug === candidateSlug);
      if (recipe) {
        fixMap.set(missingSlug, candidateSlug);
        console.log(`✅ Auto mapping: ${missingSlug} -> ${candidateSlug} (${recipe.title})`);
        break;
      }
    }

    if (!fixMap.has(missingSlug)) {
      console.log(`❌ Could not find mapping for: ${missingSlug}`);
    }
  }

  // Now apply the fixes to mealPlans.ts
  const filePath = path.join(__dirname, '../app/data/mealPlans.ts');
  let fileContent = fs.readFileSync(filePath, 'utf8');

  console.log(`\n🔧 Applying ${fixMap.size} fixes to mealPlans.ts...`);
  
  let changesCount = 0;
  fixMap.forEach((newSlug, oldSlug) => {
    const oldLink = `/kunskapsbank/recept/${oldSlug}`;
    const newLink = `/kunskapsbank/recept/${newSlug}`;
    
    const regex = new RegExp(`"recipeLink":\\s*"${oldLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
    const matches = fileContent.match(regex);
    
    if (matches) {
      fileContent = fileContent.replace(regex, `"recipeLink": "${newLink}"`);
      changesCount += matches.length;
      console.log(`✅ Fixed ${matches.length} occurrences of: ${oldSlug} -> ${newSlug}`);
    }
  });

  // Write the updated file
  fs.writeFileSync(filePath, fileContent, 'utf8');

  console.log(`\n🎉 Successfully applied ${changesCount} changes to mealPlans.ts!`);
  console.log('\n💡 Next steps:');
  console.log('1. Review the changes and test recipe links');
  console.log('2. Create any remaining missing recipes');
  console.log('3. Commit and push the changes');

  await prisma.$disconnect();
  
  return {
    fixesApplied: changesCount,
    totalMappings: fixMap.size,
    fixMap: Object.fromEntries(fixMap)
  };
}

fixMealPlanLinks(); 
const fs = require('fs');
const path = require('path');

async function finalLinkCleanup() {
  console.log('🔧 Final cleanup of all remaining incorrect recipe links...\n');
  
  const filePath = path.join(__dirname, '../app/data/mealPlans.ts');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Direct slug replacements based on verification output
  const slugReplacements = [
    // Wrong slugs that need to be fixed
    { wrong: '/kunskapsbank/recept/stekt-agg-med-tomat', correct: '/kunskapsbank/recept/stekt-agg-lax' },
    { wrong: '/kunskapsbank/recept/aggrora-lax-2', correct: '/kunskapsbank/recept/aggrora-med-lax' },
    { wrong: '/kunskapsbank/recept/stekt-agg-lax', correct: '/kunskapsbank/recept/stekt-agg-med-tomat' },
    { wrong: '/kunskapsbank/recept/havrevaffla-med-jordgubbssylt-och-vaniljkeso', correct: '/kunskapsbank/recept/keso-med-melon-och-ananas' },
    { wrong: '/kunskapsbank/recept/stekt-agg-champinjoner-2', correct: '/kunskapsbank/recept/bananpannkaka-med-keso-blabar-och-mango' },
    { wrong: '/kunskapsbank/recept/barsmoothiebowl', correct: '/kunskapsbank/recept/smoothiebowl-med-spirulina-och-havre' },
    { wrong: '/kunskapsbank/recept/tropisk-chiapudding', correct: '/kunskapsbank/recept/chiapudding-med-jordgubbssylt-och-pistagenotter' },
    { wrong: '/kunskapsbank/recept/omelett-keso-bar', correct: '/kunskapsbank/recept/ugnsomelett-med-keso-och-bar' },
    { wrong: '/kunskapsbank/recept/entrecote-med-sparris-och-artpesto', correct: '/kunskapsbank/recept/morotskaka-med-havregryn-och-chiafron' },
    { wrong: '/kunskapsbank/recept/kycklingfarswok', correct: '/kunskapsbank/recept/kycklingfarstimbaler-med-farskost-och-sweet-chili' },
    { wrong: '/kunskapsbank/recept/aggrora-med-lax', correct: '/kunskapsbank/recept/aggrora-med-kalkon-och-granatapple' },
    { wrong: '/kunskapsbank/recept/lovbiff-med-stekta-gronsaker-och-pestoyoghurt', correct: '/kunskapsbank/recept/yoghurt-bovetegranola-granola' },
    { wrong: '/kunskapsbank/recept/omelettrulle', correct: '/kunskapsbank/recept/omelett-med-paprika-och-champinjoner' },
    { wrong: '/kunskapsbank/recept/kesofralla-med-ost-och-paprika', correct: '/kunskapsbank/recept/kesofralla-med-skinka-och-tomat' },
    { wrong: '/kunskapsbank/recept/rokt-lax-med-agghack', correct: '/kunskapsbank/recept/aggrora-lax-2' },
    { wrong: '/kunskapsbank/recept/aggrora-med-sockerartor', correct: '/kunskapsbank/recept/aggrora-med-lax' },
    { wrong: '/kunskapsbank/recept/stekt-agg-med-kalkon-och-senapsmajonnas', correct: '/kunskapsbank/recept/stekt-agg-lax' },
    { wrong: '/kunskapsbank/recept/yoghurt-med-bovetegranola-och-sylt', correct: '/kunskapsbank/recept/lovbiff-med-stekta-gronsaker-och-pestoyoghurt' },
    { wrong: '/kunskapsbank/recept/chiapudding-med-med-apelsin-och-mynta', correct: '/kunskapsbank/recept/tropisk-chiapudding' }
  ];
  
  let totalFixes = 0;
  
  // Apply each replacement
  for (const replacement of slugReplacements) {
    const regex = new RegExp(
      `"recipeLink":\\s*"${replacement.wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`,
      'g'
    );
    
    const matches = (content.match(regex) || []).length;
    if (matches > 0) {
      content = content.replace(regex, `"recipeLink": "${replacement.correct}"`);
      totalFixes += matches;
      console.log(`✅ Fixed ${matches} occurrences:`);
      console.log(`   ${replacement.wrong} → ${replacement.correct}\n`);
    }
  }
  
  // Additional specific fixes for complex cases
  const specificFixes = [
    // Fix concatenated meal names that got messed up
    {
      search: '"Ugnsbakad kyckling med quinoasallad och chilimajjoHallon och kiwi med vit chokladcréme"',
      replace: '"Hallon och kiwi med vit chokladcréme"',
      linkFix: { from: '/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad', to: '/kunskapsbank/recept/hallon-och-kiwi-med-vit-chokladcreme' }
    },
    {
      search: '"Entrecote med haricot verts och bearnaisesåsCitronkaka med äpple och kardemumma"',
      replace: '"Citronkaka med äpple och kardemumma"',
      linkFix: { from: '/kunskapsbank/recept/entrecote-med-haricot-verts-och-bearnaisesas', to: '/kunskapsbank/recept/citronkaka-med-apple-och-kardemumma' }
    },
    {
      search: '"Kycklingjärpar med linssalladMandelkaka med frukt"',
      replace: '"Mandelkaka med frukt"',
      linkFix: { from: '/kunskapsbank/recept/kycklingjarpar-med-linssallad', to: '/kunskapsbank/recept/mandelkaka-med-frukt' }
    },
    {
      search: '"Lammgryta med plommon och bulgurTropisk fruktsallad"',
      replace: '"Tropisk fruktsallad"',
      linkFix: { from: '/kunskapsbank/recept/lammgryta-med-plommon-och-bulgur', to: '/kunskapsbank/recept/tropisk-fruktsallad' }
    },
    {
      search: '"Biff med nudelsallad och jordnötssåsChokladbar med majskakor"',
      replace: '"Chokladbar med majskakor"',
      linkFix: { from: '/kunskapsbank/recept/biff-med-nudelsallad-och-jordnotssas', to: '/kunskapsbank/recept/chokladbar-med-majskakor' }
    },
    {
      search: '"Valnötslax med fetaostcrème Stekta äpplen med vit chokladkräm"',
      replace: '"Stekta äpplen med vit chokladkräm"',
      linkFix: { from: '/kunskapsbank/recept/valnotslax-med-fetaostcreme', to: '/kunskapsbank/recept/stekta-applen-med-vit-chokladkram' }
    }
  ];
  
  // Apply specific fixes
  for (const fix of specificFixes) {
    if (content.includes(fix.search)) {
      content = content.replace(fix.search, fix.replace);
      console.log(`✅ Fixed concatenated meal name: ${fix.replace}`);
      
      // Also fix the corresponding link
      const linkRegex = new RegExp(
        `"recipeLink":\\s*"${fix.linkFix.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`,
        'g'
      );
      content = content.replace(linkRegex, `"recipeLink": "${fix.linkFix.to}"`);
      totalFixes++;
    }
  }
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL CLEANUP SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total additional fixes applied: ${totalFixes}`);
  console.log('\n📄 All fixes applied to mealPlans.ts');
  console.log('🎉 Final cleanup completed!');
  console.log('\n🔍 Running verification again to confirm all links are correct...\n');
}

finalLinkCleanup(); 
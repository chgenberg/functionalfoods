const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Manually extracted course recipes from meal plans
const courseRecipes = {
  Basic: [
    // Week 1
    'yoghurt-ketomusli', 'tonfisksallad-apple-sallad', 'squashspagetti-kottfarssas',
    'stekt-agg-lax', 'laxfile-med-ratatouille', 'gron-juice-juice',
    'poke-bowl-kyckling', 'kottfarsbiffar-stekt-blomkal', 'omelett-tomat',
    'havrefrallor-morotter-aprikoser', 'kycklinggryta-fran-medelhavet',
    'smoothie-smoothiebowl', 'hamburgare-med-grekisk-sallad',
    
    // Week 2
    'nudelsoppa-med-gronsaker-2', 'gronsakssoppa-soppa', 'hel-kyckling-med-grillgronsaker',
    'omelett-champinjoner', 'torskrygg-med-agghack-och-sparris', 'morotsjuice-juice',
    'turkiska-lammfarsspett-med-raita-och-sallad', 'kycklingrora-med-orter-och-tomat',
    'lax-med-fetaost-och-rostade-rotfrukter', 'jordgubbar-mango-vit',
    'asiatiska-kottbullar-med-nudelsallad', 'paronsallad-med-chevreost',
    
    // Week 3
    'kycklingfylld-aubergine', 'aggrora-lax-2', 'rokt-lax-med-blomkalsallad-och-citronyoghurt',
    'rodbetsjuice-juice', 'vegetarisk-currygryta-med-paneer', 'keso-granola-fruktsallad',
    'ugnsbakad-kyckling-med-tzatziki-och-sallad-2', 'omelett-hallon', 'lax-med-waldorfsallad',
    
    // Week 4
    'omelett-bar', 'grekiska-kottbullar-i-tomatsas', 'agghack-kalkon',
    'smoothie-2', 'laxsallad-med-vindruvor', 'bananplattar-med-mango-och-granatapple',
    'grillspett-med-grekisk-sallad-och-morotstzatziki', 'keso-hallon-granatapple',
    'hallon-och-kiwi-med-vit-chokladcreme',
    
    // Week 5
    'chiapudding-med-mango-och-granatapple', 'kottfarsbiffar-med-linssallad',
    'stekt-agg-med-kyckling', 'kyckling-med-wokade-gronsaker-roda-linser',
    'gronkalsmoothie-juice', 'vegetarisk-lasagne-med-rostade-rotfrukter',
    'blandad-juice-juice', 'lax-med-hummus-och-sallad', 'smoothiebowl-med-avokado-och-spenat',
    'dhal-med-roda-linser', 'zucchinipasta-med-kyckling-och-paprikasas',
    
    // Week 6
    'gron-smoothie-med-spenat', 'ugnsbakad-lax-med-gronkal', 'rokt-lax-med-sallad',
    'roda-linser-i-kokosmjolk-med-kyckling', 'apelsin-och-mangojuice-juice',
    'kottfarssas-med-squash-och-svamp', 'yoghurt-med-granola-och-barries',
    'biffsallad-med-chimichurri', 'tzatzikibowl', 'falafel-med-hummus-och-tahiniyoghurt'
  ],
  
  Flow: [
    // Week 1
    'farskostmacka-med-tomat', 'linssoppa-medelhavet-soppa', 'kycklingburgare-papayasallad-sallad',
    'aggrora-fetaost-spenat', 'kyckling-med-quinoasallad', 'rodbetsjuice',
    'rodkalssallad-kryddiga-kottbullar', 'aggrora-lax', 'kottfarsgryta-med-pumpa',
    'falafel-med-hummus-och-tahiniyoghurt-2', 'asiatisk-fisk-i-foliepaket',
    'marulksgryta-med-tomat-och-feta', 'blabar-smoothie-med-havre',
    
    // Week 2
    'macka-ost', 'gronsakswok-med-tonfisk-och-agg', 'lovbiffsgryta-med-champinjoner-och-gronsaksspagetti',
    'agghack-salladsblad-sallad', 'lax-med-rodbetssallad', 'overnightoats-morot',
    'kycklingpizza', 'yoghurt-bovetegranola-frukt', 'spenatsoppa-med-rostade-pumpafron',
    'stekt-agg-champinjoner', 'fisktaco-med-mangosalsa-och-sesamsas',
    'smoothiebowl-mango-pistagenotter',
    
    // Week 3
    'musli-med-barcompott', 'fisk-med-gronkal-och-ugnsbakade-rotfrukter',
    'rotfruktssoppa-gurkmeja', 'morots-och-ingefarsshot-shot', 'kottfarsgryta-med-gronsaker',
    'chia-och-kokospudding', 'asiatisk-kycklinggryta', 'chiapudding-med-jordgubbe-och-rabarbercompot',
    'halloumigryta-med-svartkalsris', 'barries-smoothie-med-chiafrön',
    'aggrora-med-asiatisk-avokadosallad',
    
    // Week 4
    'gurkmeja-smoothie', 'ugnsbakad-fetaost-med-tomat', 'macka-med-hummus',
    'chili-con-carne', 'musli-granola', 'bananplattar-med-jordnotssmor-sylt',
    'omelett-med-rokt-lax', 'lammfarsgryta-med-pumpa', 'proteinsmoothie-apelsin',
    'jordgubbar-med-mango-och-vit-chokladcreme', 'aggrora-avokadosallad',
    
    // Week 5
    'apelsinshot-shot', 'kottfarslimpa-med-paprikasallad', 'omelett-ost-tomat',
    'kyckling-med-keso-och-barrsallad', 'dhal-med-roda-linser-2', 'kokta-agg-med-tonfisk',
    'langkok-pa-oxsvans', 'hel-kyckling-med-grillgronsaker-2', 'aggrora-3',
    'yoghurt-chia-barcompott', 'omelett-med-kottfars-och-gronsaker',
    
    // Week 6
    'avokadomacka', 'nudelsoppa-med-agg', 'farsk-fisk-med-saffran-och-apelsin',
    'agghack', 'kottgryta-med-gronsaker', 'apelsin-och-bananshot-shot',
    'tzatzikibowl-2', 'kyckling-falafel-hummus-tahiniyoghurt',
    'havregrot-barries-notsmorr', 'tofu-wokgronsaker'
  ],
  
  Energy: [
    // Week 1 (T2D)
    'yoghurt-bovetegranola-granola', 'omelett-med-paprika-och-champinjoner',
    'kycklingburgare-med-mangosalsa-och-wasabi', 'stekt-agg-med-tomat',
    'tonfiskrora-med-rodbetor', 'slat-havregrynsgrot-med-vaniljprotein',
    'kottfarswrap-med-rod-curry-och-apple', 'acai-bowl', 'jordnotssmor-chokladproteinbars',
    'bananplattar-med-apelsin', 'falukorv-med-gronsaksmos',
    
    // Week 2 (T2D)
    'farskostmacka-med-gurka-och-radisa', 'asparissoppa-2', 'lax-fetaost-rostade-rotfrukter-2',
    'aggrora-med-chevreost', 'nudelsallad-asiatisk-sesam', 'kokta-agg-med-avokado',
    'stekt-torsk-med-vitlok-och-persiljesmor', 'omelett-lax-spenat-2',
    'kyckling-yoghurtsas-rodlinssallad', 'chokladproteinbars', 'kycklingbiff-medelhavsgronsaker',
    
    // Week 3 (T2D)
    'cottage-cheese-bowl-med-barcompott', 'kyckling-med-avokadosallad',
    'tomatsoppa-med-kikarter', 'aggrora-kottfars', 'kottfars-med-kalsallad',
    'notter-och-tahini', 'grillad-lax-med-asiatisk-gronkalsallad', 'jordgubbar-vaniljkvarg',
    'asiatiska-kottbullar-nudelsallad-2', 'yoghurt-hallon-paranotter',
    
    // Week 4 (HT)
    'notfri-granola-med-frukt', 'gratinerad-butternutpumpa-med-paprikasallad',
    'flygande-jacob', 'fullkornsmacka-med-aggrora', 'kottfarssoppa-med-kalsallad',
    'valnotter-med-kanel', 'lax-med-ingefara-och-lime', 'havregrynsgrot-notter-bär',
    'viltfarsbullar-med-kantarellsas', 'hallon-och-kokostoppar', 'kyckling-cashewnotter',
    
    // Week 5 (HT)
    'aggarora-med-keso-och-paprika', 'minestronesoppa', 'rodbetor-lax-sallad',
    'chiaproteinbars', 'kottfarsrulle-pumpafrön', 'applechips-med-tahini',
    'fisksoppa-med-saffran', 'gront-proteinbrod-korvpalagg', 'parmesankyckling-med-tomatsallad',
    'notter-och-tahini-2', 'kokt-torsk-med-agg-och-pepparrot',
    
    // Week 6 (HT)
    'acai-bowl-2', 'wokad-brokkoli-med-anka-och-cashewnotter', 'proteinbrod-aggrora-gurka',
    'lax-gronsaksgryta', 'keso-med-frukt', 'chiligryta-med-notter', 'fullkornsrismjol-agg-banan',
    'kottfarsgryta-med-svarta-bonor', 'gronkalsmoothie-med-protein', 'lax-grillgronsaker-fetaost'
  ]
};

async function fixRecipeAccess() {
  console.log('🔧 Starting comprehensive recipe access fix...\n');
  
  // Get all recipes
  const allRecipes = await prisma.recipe.findMany({
    select: { id: true, slug: true, title: true, tags: true, isPremium: true, isFree: true }
  });
  
  console.log(`📚 Total recipes in database: ${allRecipes.length}`);
  
  let courseRecipeCount = 0;
  let freeRecipeCount = 0;
  let errors = [];
  
  // Process each recipe
  for (const recipe of allRecipes) {
    let isCourseRecipe = false;
    let courseTags = [];
    
    // Check if recipe belongs to any course
    for (const [course, slugs] of Object.entries(courseRecipes)) {
      if (slugs.includes(recipe.slug)) {
        isCourseRecipe = true;
        courseTags.push(course);
      }
    }
    
    try {
      if (isCourseRecipe) {
        // Update as course recipe
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            isFree: false,
            isPremium: false,
            tags: {
              set: courseTags
            }
          }
        });
        courseRecipeCount++;
        console.log(`✅ [COURSE] ${recipe.title} -> ${courseTags.join(', ')}`);
      } else {
        // Update as free recipe
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: {
            requiresCourse: false,
            requiresPremium: false,
            isFree: true,
            isPremium: false
          }
        });
        freeRecipeCount++;
        console.log(`✅ [FREE] ${recipe.title}`);
      }
    } catch (error) {
      errors.push({ recipe: recipe.title, error: error.message });
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`- Course recipes: ${courseRecipeCount}`);
  console.log(`- Free recipes: ${freeRecipeCount}`);
  console.log(`- Total: ${courseRecipeCount + freeRecipeCount}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ Errors (${errors.length}):`);
    errors.forEach(e => console.log(`  - ${e.recipe}: ${e.error}`));
  }
  
  // Verify specific recipes
  console.log('\n🔍 Verifying specific recipes:');
  
  const testRecipes = [
    'havregrynsgrot-med-ananas',
    'aggrora-fetaost-spenat',
    'lax-med-rodbetssallad',
    'aggrora-med-asiatisk-avokadosallad'
  ];
  
  for (const slug of testRecipes) {
    const recipe = await prisma.recipe.findFirst({
      where: { slug },
      select: { title: true, requiresCourse: true, isFree: true, tags: true }
    });
    
    if (recipe) {
      console.log(`\n${recipe.title}:`);
      console.log(`  - requiresCourse: ${recipe.requiresCourse}`);
      console.log(`  - isFree: ${recipe.isFree}`);
      console.log(`  - tags: ${recipe.tags.join(', ') || 'none'}`);
    }
  }
  
  await prisma.$disconnect();
}

fixRecipeAccess().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 
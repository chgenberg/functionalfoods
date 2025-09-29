const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

// Mapping av recept-namn till slug
const nameToSlugMap = {
  'Yoghurt med ketomüsli': 'yoghurt-ketomusli',
  'Torskrygg med ägghack och sparris': 'torskrygg-med-agghack-och-sparris',
  'Lax med fetaost och rostade rotfrukter': 'lax-med-fetaost-och-rostade-rotfrukter',
  'Färskostmacka med tomat': 'farskostmacka-med-tomat',
  'Linssoppa från medelhavet': 'linssoppa-medelhavet-soppa',
  'Kycklingburgare med papayasallad': 'kycklingburgare-papayasallad-sallad',
  'Morot- och kesolimpa': 'morot-och-kesolimpa',
  'Äggröra med asiatisk avokadosallad': 'aggrora-asiatisk-avokadosallad',
  'Köttfärsbiffar med mozzarella och tomatsallad': 'kottfarsbiffar-med-mozzarella-och-tomatsallad',
  'Choklad- och kokoschiapudding': 'choklad-kokoschiapudding',
  'Laxgratäng med broccoli och scampi': 'laxgratang-med-broccoli-och-scampi',
  'Bovetegranola': 'bovetegranola',
  'Keso med bovetegranola': 'keso-bovetegranola-granola',
  'Kycklinggryta från medelhavet': 'kycklinggryta-fran-medelhavet',
  'Omelett med ost och spenat': 'omelett-ost-spenat',
  'Fänkålssallad med grapefrukt och burrata': 'fankalssallad-med-grapefrukt-och-burrata',
  'Ugnsomelett med bär': 'omelett-bar',
  'Citronkaka med äpple och kardemumma': 'citronkaka-med-apple-och-kardemumma',
  'Entrecote med haricot verts och bearnaisesås': 'entrecote-med-haricots-verts-och-bearnaisesas',
  'Grönsakswok med tonfisk och ägg': 'gronsakswok-med-tonfisk-och-agg',
  
  // Fler mappningar från shopping lists
  'Macka med ost': 'macka-ost',
  'Lövbiffsgryta med champinjoner och grönsaksspagetti': 'lovbiffsgryta-med-champinjoner-och-gronsaksspagetti',
  'Ägghack i salladsblad': 'agghack-salladsblad-sallad',
  'Lax med rödbetssallad': 'lax-med-rodbetssallad',
  'Kycklingpizza': 'kycklingpizza',
  'Yoghurt med bovetegranola och frukt': 'yoghurt-bovetegranola-frukt',
  'Spenatsoppa med rostade pumpafrön': 'spenatsoppa-med-rostade-pumpafron',
  'Stekt ägg med champinjoner': 'stekt-agg-champinjoner',
  'Fisktaco med mangosalsa och sesamsås': 'fisktaco-med-mangosalsa-och-sesamsas',
  'Smoothiebowl med mango och pistagenötter': 'smoothiebowl-mango-pistagenotter',
  'Grön juice': 'gron-juice-juice',
  'Bananmuffin': 'lax-fetaost-rostade',
  'Nötfärstimbaler med chèvreost och soltorkad tomat': 'notfarstimbaler-med-chevreost-och-soltorkad-tomat',
  'Laxsallad med fetaost': 'laxsallad-med-fetaost',
  'Keso med bovetegranola och frukt': 'keso-bovetegranola-frukt',
  'Torsk med guacamole och sötpotatis': 'torsk-med-guacamole-och-sotpotatis',
  'Morotssoppa med ingefära och rostade kikärtor': 'morotssoppa-med-ingefara-och-rostade-kikartor',
  'Omelettrulle': 'omelettrulle',
  'Grönsakswok med kycklingfärs': 'asiatisk-kycklingfars-med-gronkal',
  'Yoghurt med bovetegranola': 'yoghurt-bovetegranola-granola',
  'Ugnsbakad blomkål med ratatouille': 'ugnsbakad-blomkal-med-ratatouille',
  'Lövbiffsrullader med brie, pesto och rödbetor': 'lovbiffsrullader-med-brie-pesto-och-rodbetor',
  'Äggröra med fetaost och spenat': 'aggrora-fetaost-spenat',
  'Torsk med saffranssås': 'torsk-med-saffranssas',
  'Kokt ägg med majonnäs': 'kokt-agg-majonnas',
  'Stekt ägg med lax': 'stekt-agg-lax',
  'Äggröra med lax': 'aggrora-lax-2',
  'Omelett med tomat': 'omelett-tomat',
  'Omelett med champinjoner': 'omelett-champinjoner',
  'Morotsjuice': 'morotsjuice-juice',
  'Omelett med hallon': 'omelett-hallon',
  'Omelett med bär': 'omelett-bar',
  'Ägghack med kalkon': 'agghack-kalkon',
  'Fruktsmoothie': 'smoothie-2',
  'Bananplättar med mango och granatäpple': 'bananplattar-med-mango-och-granatapple',
  'Keso med hallon och granatäpple': 'keso-hallon-granatapple',
  'Havregrynsgröt med torkad frukt och äpple': 'havregrynsgrot-torkad-frukt',
  'Äggröra med paprika': 'aggrora-paprika',
  'Chiafrögröt': 'tropisk-chiafrogrot',
  'Bananplättar med jordgubbar och kokos': 'bananplattar-jordgubbar-kokos',
  'Mangosmoothie med spenat': 'smoothie-spenat',
  'Havrefralla med morötter och torkade aprikoser': 'havrefrallor-morotter-aprikoser',
  'Mango med keso och nötter': 'mango-keso-notter',
  'Äggröra med granatäpple och kiwi': 'aggrora-granatapple-kiwi',
  'Havregrynsgröt med apelsin och kokos': 'havregrynsgrot-apelsin-kokos',
  'Hallon- och blåbärssmoothie': 'smoothie-blabarssmoothie',
  'Blåbärs smoothiebowl': 'jordgubbar-mango-vit',
  'Blåbärs smoothiebowl rester': 'jordgubbar-mango-vit',
  'Tropisk smoothiebowl': 'smoothie-smoothiebowl',
  'Rödbetsjuice': 'rodbetsjuice-juice',
  'Stekt ägg med champinjoner': 'stekt-agg-champinjoner',
  'Kokta ägg med kaviar': 'kokt-agg-kaviar',
  'Kokt ägg med kaviar': 'kokt-agg-kaviar',
  'Chiapudding med jordgubbar och hallon': 'chiapudding-med-jordgubbar-och-hallon',
  'Grekiska köttbullar i tomatsås': 'grekiska-kottbullar-i-tomatsas',
  'Asiatiska köttbullar med nudelsallad': 'asiatiska-kottbullar-med-nudelsallad',
  'Laxsallad med vindruvor': 'laxsallad-med-vindruvor',
  'Grillspett med grekisk sallad och morotstzatziki': 'grillspett-med-grekisk-sallad-och-morotstzatziki',
  'Ajvarspett med grekisk sallad och tzatziki': 'grillspett-med-grekisk-sallad-och-morotstzatziki',
  'Hallon och kiwi med vit chokladcréme': 'hallon-och-kiwi-med-vit-chokladcreme',
  'Torsk från mellanöstern': 'torsk-fran-mellanostern',
  'Laxfilé med ratatouille': 'laxfile-med-ratatouille',
  'Het ratatouille': 'laxfile-med-ratatouille',
  'Quinoasallad med stekt halloumi': 'quinoasallad-med-halloumi',
  'Torsk teriyaki med grönsaker': 'torsk-teriyaki-med-gronsaker',
  'Tropisk fruktsallad': 'tropisk-fruktsallad',
  'Indisk laxgryta med röda linser': 'indisk-laxgryta-med-roda-linser',
  'Grekisk sallad': 'laxsallad-med-fetaost',
  'Hamburgare med hummus': 'hamburgare-med-grekisk-sallad',
  'Högrevsburgare med hummus': 'hamburgare-med-grekisk-sallad',
  'Hamburgare med grekisk sallad': 'hamburgare-med-grekisk-sallad',
  'Mandelkaka med med choklad': 'mandelkaka-med-med-choklad',
  'Mandelkaka med frukt': 'mandelkaka-med-med-choklad',
  'Grönsakswok med kyckling': 'poke-bowl-kyckling',
  'Köttfärspytt med italienska smaker': 'kottfarspytt-med-italienska-smaker',
  'Turkiska lammfärsspett med raita och sallad': 'turkiska-lammfarsspett-med-raita-och-sallad',
  'Kycklingröra med örter och tomat': 'kycklingrora-med-orter-och-tomat',
  'Nudelsoppa med grönsaker': 'nudelsoppa-med-gronsaker-2',
  'Päronsallad med chevréost': 'paronsallad-med-chevreost',
  'Päronsallad med chévreost': 'paronsallad-med-chevreost',
  'Kycklingfylld aubergine': 'kycklingfylld-aubergine',
  'Rökt lax med blomkålsallad och citronyoghurt': 'rokt-lax-med-blomkalsallad-och-citronyoghurt',
  'Vegetarisk currygryta med panéer': 'vegetarisk-currygryta-med-paneer',
  'Lax med waldorfsallad': 'lax-med-waldorfsallad',
  'Kycklinggryta med röda linser': 'kycklinggryta-fran-medelhavet',
  'Köttfärslimpa med ajvar och rostad sötpotatis': 'kottfarslimpa-med-ajvar-och-rostad-sotpotatis',
  'Skaldjursgryta med torsk i gul curry': 'skaldjursgryta-med-torsk-i-gul-curry',
  'Kycklingjärpar med linssallad': 'kycklingjarpar-med-linssallad',
  'Lammgryta med plommon och bulgur': 'lammgryta-med-plommon-och-bulgur',
  'Ugnsbakad kyckling med tzatziki och sallad': 'ugnsbakad-kyckling-med-tzatziki-och-sallad-2',
  'Ugnsbakad kyckling med tzatziki och salladMandel och citronpaj': 'ugnsbakad-kyckling-med-tzatziki-och-sallad-2',
  'Ugnsbakad tomat med köttfärs': 'kottfarsbiffar-stekt-blomkal',
  'Köttfärsbiffar med stekt blomkål': 'kottfarsbiffar-stekt-blomkal',
  'Pokébowl med kyckling': 'poke-bowl-kyckling',
  'Squashspagetti med köttfärssås': 'squashspagetti-kottfarssas',
  'Tonfisksallad med äpple': 'tonfisksallad-apple-sallad',
  'Laxburgare med krämig grönsaksröra': 'hamburgare-med-grekisk-sallad',
  'Japansk kycklingfärswok med groddar': 'asiatisk-kycklingfars-med-gronkal',
  'Overnight oats med morot': 'overnightoats-morot',
  'Biff med nudelsallad och jordnötssås': 'biff-med-nudelsallad-och-jordnotssas',
  'Stekta äpplen med vit chokladkräm': 'stekta-applen-med-vit-chokladkram',
  'Blåbärssmoothie': 'smoothie-blabarssmoothie',
  'Zucchiniplättar med yoghurtsås': 'zucchiniplattar-med-yoghurtsas',
  'Köttfärslimpa med tomat': 'kottfarslimpa-med-ajvar-och-rostad-sotpotatis',
  'Yoghurt med mango och apelsin': 'yoghurt-mango-apelsin',
  'Pestotorsk med Capresesallad': 'pestotorsk-med-capresesallad',
  'Stekt ägg med parmaskinka': 'stekt-agg-parmaskinka',
  'Kyckling med stekt blomkålsris och dillyoghurt': 'kyckling-med-stekt-blomkalsris-och-dillyoghurt',
  'Nötgryta med rotfrukter': 'notgryta-med-rotfrukter',
  'Äggröra med champinjoner': 'aggrora-champinjoner',
  'Quinoasallad med scampi och mango': 'quinoasallad-med-scampi-och-mango',
  'Bananpannkaka': 'bananpannkaka',
  'Grönkålspaj med champinjoner': 'gronkalspaj-med-champinjoner',
  'Stek torsk med bearnaisesås och haricot verts': 'stek-torsk-med-bearnaisesas-och-haricot-verts',
  'Yoghurt med bovetegranola och bär': 'yoghurt-bovetegranola-bar',
  'Kycklingfärsbiffar med vitlöksost': 'kycklingfarsbiffar-med-vitloksost',
  'Varm chiagröt med äpple': 'varm-chiagrot-med-apple',
  'Varma grönsaker med halloumi': 'varma-gronsaker-med-halloumi',
  'Ägghack med kallrökt lax': 'agghack-kallrokt-lax',
  'Lax med quinoasallad och grapefrukt': 'lax-med-quinoasallad-och-grapefrukt',
  'Smoothiebowl med blåbär och granola': 'smoothiebowl-blabar-granola',
  'Kycklingrullader med gorgonzola': 'kycklingrullader-med-gorgonzola',
  'Omelett med keso och bär': 'omelett-keso-bar',
  'Valnötslax med fetaostcreme': 'valnotslax-med-fetaostcreme',
  'Gino': 'gino'
};

async function loadShoppingListData() {
  const shoppingListDir = path.join(process.cwd(), 'public', 'Shopping-lists');
  const nutritionData = {};
  
  // Load all parsed JSON files
  const files = await fs.readdir(shoppingListDir);
  const jsonFiles = files.filter(f => f.endsWith('_parsed.json'));
  
  for (const file of jsonFiles) {
    const content = await fs.readFile(path.join(shoppingListDir, file), 'utf8');
    const recipes = JSON.parse(content);
    
    for (const recipe of recipes) {
      nutritionData[recipe.title] = {
        nutrition: recipe.nutrition,
        servings: recipe.servings,
        time: recipe.time
      };
    }
  }
  
  return nutritionData;
}

async function fixRecipeNutrition() {
  try {
    console.log('Loading shopping list data...');
    const correctData = await loadShoppingListData();
    console.log(`Loaded nutrition data for ${Object.keys(correctData).length} recipes`);
    
    let updated = 0;
    let notFound = 0;
    
    for (const [recipeName, data] of Object.entries(correctData)) {
      const slug = nameToSlugMap[recipeName];
      
      if (!slug) {
        console.log(`⚠️  No slug mapping for: ${recipeName}`);
        continue;
      }
      
      const recipe = await prisma.recipe.findUnique({
        where: { slug }
      });
      
      if (!recipe) {
        console.log(`❌ Recipe not found: ${recipeName} (${slug})`);
        notFound++;
        continue;
      }
      
      // Convert nutrition format
      const newNutrition = {
        perServing: {
          energy: data.nutrition.calories, // Convert calories to energy
          protein: data.nutrition.protein,
          carbohydrates: data.nutrition.carbohydrates,
          fat: data.nutrition.fat,
          fiber: data.nutrition.fiber
        }
      };
      
      // Update recipe
      await prisma.recipe.update({
        where: { slug },
        data: {
          nutrition: newNutrition,
          servings: data.servings
        }
      });
      
      console.log(`✅ Updated: ${recipeName}`);
      console.log(`   Energy: ${data.nutrition.calories} kcal`);
      console.log(`   Protein: ${data.nutrition.protein}g`);
      console.log(`   Carbs: ${data.nutrition.carbohydrates}g`);
      console.log(`   Fat: ${data.nutrition.fat}g`);
      console.log(`   Fiber: ${data.nutrition.fiber}g`);
      updated++;
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Updated: ${updated} recipes`);
    console.log(`❌ Not found: ${notFound} recipes`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRecipeNutrition();

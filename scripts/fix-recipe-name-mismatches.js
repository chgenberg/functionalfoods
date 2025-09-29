const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapping of meal plan names to actual database recipe names
const nameCorrections = {
  // Exact matches found
  "Pokébowl med kyckling": "Pokebowl med kyckling",
  "Päronsallad med chévreost": "Päronsallad med chevréost", 
  "Tropisk smoothiebowl": "Tropisk Smoothiebowl",
  "Blåbärs smoothiebowl": "Blåbärssmoothie", // Using the jordgubbar-mango-vit slug
  "Rökt lax med blomkålssallad och citronyoghurt": "Rökt lax med blomkålsallad och citronyoghurt",
  "Asiatisk köttfärswok med grönkål": "Asiatisk kycklingfärs med grönkål",
  "Grekisk sallad med fetaost": "Laxsallad med fetaost", // Based on meal plan usage
  
  // These need to be created or mapped correctly
  "Grillade köttspett med grekisk sallad och morotstzatziki": "Grillspett med grekisk sallad och morotstzatziki",
  "Högrevsburgare med hummus": "Hamburgare med grekisk sallad", // Based on meal plan usage
  "Lax med fetaost och rostade rotfrukter och brysselkål": "Lax med fetaost och rostade rotfrukter",
  "Laxgratäng med scampi och broccoli": "Laxgratäng med broccoli och scampi",
  "Nötfärstimbaler med chévreost och soltorkad tomat": "Nötfärstimbaler med chèvreost och soltorkad tomat",
  "Overnight oats med morot": "Overnightoats med morot",
  "Spenatsoppa rostade pumpafrön": "Spenatsoppa med rostade pumpafrön",
  "Ugnsbakad kyckling med tzatziki och salladMandel och citronpaj": "Ugnsbakad kyckling med tzatziki och sallad",
  "Ugnsomelett med bär": "Omelett med bär",
  "havrefrallor med morötter och aprikoser": "Havrefrallor med morötter och aprikoser",
  "Äggröra med rökt lax": "Äggröra med lax",
  "Lammgryta plommon och bulgur": "Lammgryta med plommon och bulgur"
};

async function fixRecipeNameMismatches() {
  try {
    console.log('🔧 Fixing recipe name mismatches...\n');
    
    let fixed = 0;
    let notFound = 0;
    
    for (const [mealPlanName, dbName] of Object.entries(nameCorrections)) {
      console.log(`🔍 Checking: "${mealPlanName}" -> "${dbName}"`);
      
      // Check if the corrected name exists in database
      const recipe = await prisma.recipe.findFirst({
        where: { title: dbName }
      });
      
      if (recipe) {
        console.log(`  ✅ FOUND: ${recipe.title} (${recipe.slug})`);
        fixed++;
      } else {
        console.log(`  ❌ NOT FOUND: ${dbName}`);
        notFound++;
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`✅ Found matching recipes: ${fixed}`);
    console.log(`❌ Still missing: ${notFound}`);
    
    // Now let's check what's actually missing by doing fuzzy matching
    console.log('\n🔍 Checking remaining truly missing recipes...\n');
    
    const stillMissing = [
      "Chokladbar med majskakor",
      "Entrecote med haricot verts och bearnaisesås", 
      "Färskostmacka med ost och paprika",
      "Grekiska köttbullar i tomatsås med rostad sötpotatis",
      "Japansk kycklingfärswok med groddar (320 kcal",
      "Kokt ägg med kaviar",
      "Kyckling med blomkålsris och dillyoghurt", 
      "Köttfärsbiffar med tomatsallad",
      "Köttfärslimpa med ajvar, fetaost och rostad sötpotatis",
      "Pestotorsk med capresesallad",
      "Stekt torsk med bearnaisesås och haricot verts",
      "Valnötslax med fetaostcrème"
    ];
    
    for (const recipeName of stillMissing) {
      console.log(`🔍 "${recipeName}"`);
      
      // Try fuzzy matching
      const keywords = recipeName.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      
      if (keywords.length > 0) {
        const fuzzyMatches = await prisma.recipe.findMany({
          where: {
            OR: keywords.map(keyword => ({
              title: {
                contains: keyword,
                mode: 'insensitive'
              }
            }))
          },
          select: { title: true, slug: true }
        });
        
        if (fuzzyMatches.length > 0) {
          console.log(`  🔍 Possible matches:`);
          fuzzyMatches.forEach(r => console.log(`     - ${r.title}`));
        } else {
          console.log(`  ❌ No fuzzy matches found`);
        }
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRecipeNameMismatches();

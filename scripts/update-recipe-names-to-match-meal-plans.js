const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapping from current database names to meal plan names (what they should be)
const nameUpdates = {
  // Exact spelling/accent corrections
  "Pokebowl med kyckling": "Pokébowl med kyckling",
  "Päronsallad med chevréost": "Päronsallad med chévreost", 
  "Tropisk Smoothiebowl": "Tropisk smoothiebowl",
  "Blåbärssmoothie": "Blåbärs smoothiebowl", // This one using jordgubbar-mango-vit slug
  "Rökt lax med blomkålsallad och citronyoghurt": "Rökt lax med blomkålssallad och citronyoghurt",
  "Asiatisk kycklingfärs med grönkål": "Asiatisk köttfärswok med grönkål",
  
  // Name adjustments to match meal plan usage
  "Grillspett med grekisk sallad och morotstzatziki": "Grillade köttspett med grekisk sallad och morotstzatziki",
  "Hamburgare med grekisk sallad": "Högrevsburgare med hummus", // Used in meal plan context
  "Lax med fetaost och rostade rotfrukter": "Lax med fetaost och rostade rotfrukter och brysselkål",
  "Laxgratäng med broccoli och scampi": "Laxgratäng med scampi och broccoli",
  "Nötfärstimbaler med chèvreost och soltorkad tomat": "Nötfärstimbaler med chévreost och soltorkad tomat",
  "Overnightoats med morot": "Overnight oats med morot",
  "Spenatsoppa med rostade pumpafrön": "Spenatsoppa rostade pumpafrön",
  "Ugnsbakad kyckling med tzatziki och sallad": "Ugnsbakad kyckling med tzatziki och salladMandel och citronpaj",
  "Omelett med bär": "Ugnsomelett med bär",
  "Havrefrallor med morötter och aprikoser": "havrefrallor med morötter och aprikoser", // lowercase h
  "Äggröra med lax": "Äggröra med rökt lax",
  "Lammgryta med plommon och bulgur": "Lammgryta plommon och bulgur",
  
  // Additional exact matches found in fuzzy search
  "Chokladbars med majskakor": "Chokladbar med majskakor",
  "Entrecote med haricots verts och bearnaisesås": "Entrecote med haricot verts och bearnaisesås",
  "Kesofralla med ost och paprika": "Färskostmacka med ost och paprika",
  "Grekiska köttbullar i tomatsås": "Grekiska köttbullar i tomatsås med rostad sötpotatis",
  "Japansk kycklingfärswok med groddar": "Japansk kycklingfärswok med groddar (320 kcal",
  "Kokta ägg med kaviar": "Kokt ägg med kaviar",
  "Kyckling med stekt blomkålsris och dillyoghurt": "Kyckling med blomkålsris och dillyoghurt",
  "Köttfärsbiffar med mozzarella och tomatsallad": "Köttfärsbiffar med tomatsallad",
  "Köttfärslimpa med ajvar och rostad sötpotatis": "Köttfärslimpa med ajvar, fetaost och rostad sötpotatis",
  "Pestotorsk med Capresesallad": "Pestotorsk med capresesallad",
  "Stek torsk med bearnaisesås och haricot verts": "Stekt torsk med bearnaisesås och haricot verts",
  "Valnötslax med fetaostcreme": "Valnötslax med fetaostcrème"
};

async function updateRecipeNames() {
  try {
    console.log('🔧 Updating recipe names to match meal plans...\n');
    
    let updated = 0;
    let notFound = 0;
    let errors = 0;
    
    for (const [currentName, newName] of Object.entries(nameUpdates)) {
      console.log(`🔄 "${currentName}" -> "${newName}"`);
      
      try {
        // Find the recipe with current name
        const recipe = await prisma.recipe.findFirst({
          where: { title: currentName }
        });
        
        if (!recipe) {
          console.log(`  ❌ Recipe not found: ${currentName}`);
          notFound++;
          continue;
        }
        
        // Update the recipe name
        await prisma.recipe.update({
          where: { id: recipe.id },
          data: { title: newName }
        });
        
        console.log(`  ✅ Updated: ${recipe.slug}`);
        updated++;
        
      } catch (error) {
        console.log(`  ❌ Error updating "${currentName}": ${error.message}`);
        errors++;
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`✅ Updated: ${updated} recipes`);
    console.log(`❌ Not found: ${notFound} recipes`);
    console.log(`⚠️  Errors: ${errors} recipes`);
    
    // Verify some key updates
    console.log('\n🔍 Verifying key updates...');
    const verifyNames = [
      "Pokébowl med kyckling",
      "Tropisk smoothiebowl", 
      "Rökt lax med blomkålssallad och citronyoghurt"
    ];
    
    for (const name of verifyNames) {
      const recipe = await prisma.recipe.findFirst({
        where: { title: name },
        select: { title: true, slug: true }
      });
      
      if (recipe) {
        console.log(`✅ Verified: "${recipe.title}" (${recipe.slug})`);
      } else {
        console.log(`❌ Not found: "${name}"`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRecipeNames();

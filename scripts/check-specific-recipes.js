const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSpecificRecipes() {
  try {
    console.log('🔍 Checking specific "missing" recipes...\n');
    
    const missingRecipes = [
      "Pokébowl med kyckling",
      "Päronsallad med chévreost", 
      "Tropisk smoothiebowl",
      "Blåbärs smoothiebowl",
      "Rökt lax med blomkålssallad och citronyoghurt",
      "Asiatisk köttfärswok med grönkål",
      "Japansk kycklingfärswok med groddar",
      "Grekisk sallad med fetaost"
    ];
    
    for (const recipeName of missingRecipes) {
      console.log(`\n🔍 Searching for: "${recipeName}"`);
      
      // Exact match
      const exact = await prisma.recipe.findFirst({
        where: { title: recipeName }
      });
      
      if (exact) {
        console.log(`  ✅ EXACT MATCH: ${exact.title} (${exact.slug})`);
        continue;
      }
      
      // Partial match
      const partial = await prisma.recipe.findMany({
        where: {
          title: {
            contains: recipeName.split(' ')[0], // First word
            mode: 'insensitive'
          }
        },
        select: { title: true, slug: true }
      });
      
      if (partial.length > 0) {
        console.log(`  🔍 PARTIAL MATCHES:`);
        partial.forEach(r => console.log(`     - ${r.title} (${r.slug})`));
      } else {
        console.log(`  ❌ NO MATCHES FOUND`);
      }
    }
    
    // Let's also search for some key words
    console.log('\n\n🔍 Searching by keywords...\n');
    
    const keywords = ['pokebowl', 'poke', 'paron', 'tropisk', 'smoothie', 'rokt lax', 'asiatisk', 'japansk', 'grekisk sallad'];
    
    for (const keyword of keywords) {
      const results = await prisma.recipe.findMany({
        where: {
          title: {
            contains: keyword,
            mode: 'insensitive'
          }
        },
        select: { title: true, slug: true }
      });
      
      if (results.length > 0) {
        console.log(`🔍 "${keyword}" matches:`);
        results.forEach(r => console.log(`   - ${r.title} (${r.slug})`));
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificRecipes();

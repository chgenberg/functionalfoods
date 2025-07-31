const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMissingRecipes() {
  console.log('🔍 Checking for missing recipe slugs...');

  const problematicSlugs = [
    'fixed-recept-squashspagetti-med-kottfarssas', // Squashspagetti med köttfärssås
    'rodbetsjuice', // Rödbetsjuice
    'yoghurt-med-ketom-sli', // Yoghurt med ketomüsli
    'tonfisksallad-med-apple', // Tonfisksallad med äpple
    'stekt-agg-med-lax', // Stekt ägg med lax
    'het-ratatouille', // Het ratatouille
    'gron-smoothie', // Grön smoothie
    'w-1752508505312', // Poké bowl med kyckling
    'kottfarsbiffar-med-stekt-blomkal', // Köttfärsbiffar med stekt blomkål
    'omelett-med-tomat', // Omelett med tomat
    'havrefrallor-med-morotter-och-aprikoser', // Havrefrallor med morötter och aprikoser
    'kycklinggryta-med-bakad-spetskal', // Kycklinggryta med bakad spetskål
    'w-1752508498584', // Tropisk smoothiebowl
    'laxburgare-med-kramig-gronsaksrora' // Laxburgare med krämig grönsaksröra
  ];

  const results = [];

  for (const slug of problematicSlugs) {
    try {
      const recipe = await prisma.recipe.findUnique({
        where: { slug },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          isPremium: true,
          isFree: true
        }
      });

      if (recipe) {
        results.push({
          slug,
          status: '✅ Found',
          title: recipe.title,
          recipeStatus: recipe.status,
          isPremium: recipe.isPremium,
          isFree: recipe.isFree
        });
      } else {
        results.push({
          slug,
          status: '❌ Missing',
          title: 'N/A',
          recipeStatus: 'N/A',
          isPremium: 'N/A',
          isFree: 'N/A'
        });
      }
    } catch (error) {
      results.push({
        slug,
        status: '🔥 Error',
        title: error.message,
        recipeStatus: 'N/A',
        isPremium: 'N/A',
        isFree: 'N/A'
      });
    }
  }

  console.log('\n📋 Results:');
  console.log('='.repeat(80));
  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.status} ${result.slug}`);
    if (result.status === '✅ Found') {
      console.log(`   Title: ${result.title}`);
      console.log(`   Status: ${result.recipeStatus}, Premium: ${result.isPremium}, Free: ${result.isFree}`);
    }
    console.log('');
  });

  const missing = results.filter(r => r.status === '❌ Missing');
  console.log(`\n💡 Summary: ${missing.length} missing out of ${results.length} checked`);
  
  if (missing.length > 0) {
    console.log('\n🚨 Missing recipes:');
    missing.forEach(m => console.log(`- ${m.slug}`));
  }

  await prisma.$disconnect();
}

checkMissingRecipes(); 
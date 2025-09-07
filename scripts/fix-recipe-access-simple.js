const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Course recipe slugs extracted from meal plans
const courseRecipeSlugs = new Set([
  // Basic recipes
  'yoghurt-ketomusli', 'tonfisksallad-apple-sallad', 'squashspagetti-kottfarssas',
  'stekt-agg-lax', 'laxfile-med-ratatouille', 'gron-juice-juice',
  'poke-bowl-kyckling', 'kottfarsbiffar-stekt-blomkal', 'omelett-tomat',
  'havrefrallor-morotter-aprikoser', 'kycklinggryta-fran-medelhavet',
  'smoothie-smoothiebowl', 'hamburgare-med-grekisk-sallad',
  'nudelsoppa-med-gronsaker-2', 'gronsakssoppa-soppa', 'hel-kyckling-med-grillgronsaker',
  'omelett-champinjoner', 'torskrygg-med-agghack-och-sparris', 'morotsjuice-juice',
  'turkiska-lammfarsspett-med-raita-och-sallad', 'kycklingrora-med-orter-och-tomat',
  'lax-med-fetaost-och-rostade-rotfrukter', 'jordgubbar-mango-vit',
  'asiatiska-kottbullar-med-nudelsallad', 'paronsallad-med-chevreost',
  
  // Flow recipes  
  'farskostmacka-med-tomat', 'linssoppa-medelhavet-soppa', 'kycklingburgare-papayasallad-sallad',
  'aggrora-fetaost-spenat', 'kyckling-med-quinoasallad', 'rodbetsjuice',
  'rodkalssallad-kryddiga-kottbullar', 'aggrora-lax', 'kottfarsgryta-med-pumpa',
  'macka-ost', 'gronsakswok-med-tonfisk-och-agg', 'lovbiffsgryta-med-champinjoner-och-gronsaksspagetti',
  'agghack-salladsblad-sallad', 'lax-med-rodbetssallad', 'overnightoats-morot',
  'kycklingpizza', 'yoghurt-bovetegranola-frukt', 'spenatsoppa-med-rostade-pumpafron',
  'stekt-agg-champinjoner', 'fisktaco-med-mangosalsa-och-sesamsas',
  'smoothiebowl-mango-pistagenotter', 'aggrora-med-asiatisk-avokadosallad',
  
  // Energy recipes
  'yoghurt-bovetegranola-granola', 'omelett-med-paprika-och-champinjoner',
  'kycklingburgare-med-mangosalsa-och-wasabi', 'stekt-agg-med-tomat',
  'tonfiskrora-med-rodbetor', 'slat-havregrynsgrot-med-vaniljprotein',
  'kottfarswrap-med-rod-curry-och-apple'
]);

async function fixRecipes() {
  console.log('🔧 Fixing recipe access control...');
  
  // Get all recipes
  const allRecipes = await prisma.recipe.findMany();
  
  let courseCount = 0;
  let freeCount = 0;
  
  for (const recipe of allRecipes) {
    if (courseRecipeSlugs.has(recipe.slug)) {
      // This is a course recipe
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          isFree: false,
          isPremium: false
        }
      });
      courseCount++;
      console.log(`✅ [COURSE] ${recipe.title}`);
    } else {
      // This is a free recipe
      await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          isFree: true,
          isPremium: false
        }
      });
      freeCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`- Course recipes: ${courseCount}`);
  console.log(`- Free recipes: ${freeCount}`);
  console.log(`- Total: ${allRecipes.length}`);
  
  // Verify specific recipes
  const testSlugs = ['havregrynsgrot-med-ananas', 'aggrora-fetaost-spenat', 'lax-med-rodbetssallad'];
  
  console.log('\n🔍 Verifying:');
  for (const slug of testSlugs) {
    const recipe = await prisma.recipe.findFirst({ where: { slug } });
    if (recipe) {
      console.log(`${recipe.title}: isFree=${recipe.isFree}, tags=${recipe.tags.join(',')}`);
    }
  }
  
  await prisma.$disconnect();
}

fixRecipes().catch(console.error); 
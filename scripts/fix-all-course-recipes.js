const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Manually list all course recipe slugs based on meal plans
const BASICS_RECIPES = [
  'agg-med-majonnas-och-kaffe',
  'aggrora-med-tomat-och-paprika',
  'ananas-tofu-bowl',
  'asiatisk-nudelgryta',
  'asiatisk-nudelsallad',
  'bakad-feta-med-tomat-och-rostad-sotpotatissallad',
  'banankeso-plattar-med-frukt-och-bar',
  'biff-med-jordnotssas-och-nudelsallad',
  'blomkalssoppa-med-kyckling',
  'chiapudding-med-mango-och-granatapple',
  'chili-con-carne',
  'chili-sin-carne',
  'choklad-kokoschiapudding',
  'fiskgryta-med-tomat-och-fettaost',
  'frukt-och-notbowl',
  'granola-med-mango-och-granatapple',
  'grundrecept-benbuljong',
  'gron-smoothie-med-spenat',
  'guacamole-brod',
  'keso-med-bar-och-notter',
  'kyckling-i-senapssas',
  'kyckling-med-oregano-och-fetaost',
  'kycklingwok-med-cashewnotter',
  'lax-med-mangosalsa',
  'lax-med-rodbetssallad',
  'linsbolognese',
  'mozzarellasallad',
  'musli-med-bar',
  'nyponsoppa-med-mandelbiskvier',
  'omelett-med-keso-och-bar',
  'omelett-med-ost-och-spenat',
  'paprika-och-linssoppa',
  'paprikagryta-med-vita-bonor',
  'raggmuffins-med-appelkompott',
  'spenat-och-avokadosmoothie',
  'stekt-agg-med-lax',
  'tacopaj',
  'tacosallad',
  'tofu-pad-thai',
  'tomatsoppa-med-keso',
  'yoghurt-med-appelgranola'
];

const FLOW_RECIPES = [
  'appelklyftor-med-jordnotssmor',
  'asiatisk-kottfarsgryta',
  'avokado-och-aggrost',
  'bananpannkakor-med-bar',
  'bonburgare-med-avokadokram',
  'bongryta-med-chili',
  'chiapudding-med-mango',
  'choklad-och-kokoschiapudding',
  'falafel-med-hummus',
  'gronkalschips-med-aioli',
  'gronkalssoppa-med-valnotter',
  'halloumiburgare-med-rodbetsslaw',
  'het-ratatouille',
  'kanel-och-kardemummabullar',
  'kassler-med-senapssas',
  'keso-med-frukt-och-bar',
  'kyckling-i-currysas',
  'kycklingburgare-med-papayasallad',
  'lax-i-ugn-med-sparris',
  'laxpoke-bowl',
  'linsbiffar-med-tzatziki',
  'overnight-oats-med-bar',
  'papayabatar',
  'quinoasallad-med-rostade-gronsaker',
  'ratatouille-med-fetaost',
  'rodbetor-med-chevre',
  'shakshuka',
  'smoothie-bowl-med-granola',
  'spenat-och-fetapaj',
  'stekt-agg-med-bacon',
  'tofu-tikka-masala',
  'vegetarisk-lasagne',
  'yoghurt-med-ketomusli'
];

const ENERGY_RECIPES = [
  'energibollar-med-dadlar',
  'gronkalssallad-med-quinoa',
  'hummus-med-gronsaker',
  'lax-med-broccoli',
  'linssoppa-med-kokos',
  'omelett-med-gronsaker',
  'quinoabowl-med-rostade-kikarter',
  'smoothie-med-spenat-och-mango',
  'sotpotatissoppa-med-ingefara'
];

async function main() {
  console.log('🔧 Fixing all course recipes with proper tags and access...\n');

  // First, reset ALL recipes to free
  console.log('1️⃣ Resetting all recipes to free...');
  await prisma.recipe.updateMany({
    data: {
      isPremium: false,
      isFree: true
    }
  });

  // Update Basics recipes
  console.log('\n2️⃣ Updating Functional Basics recipes...');
  for (const slug of BASICS_RECIPES) {
    try {
      await prisma.recipe.update({
        where: { slug },
        data: {
          isPremium: false,
          isFree: false,
          tags: ['Basic']
        }
      });
      console.log(`   ✅ ${slug}`);
    } catch (e) {
      console.log(`   ⚠️  ${slug} - not found`);
    }
  }

  // Update Flow recipes
  console.log('\n3️⃣ Updating Functional Flow recipes...');
  for (const slug of FLOW_RECIPES) {
    try {
      await prisma.recipe.update({
        where: { slug },
        data: {
          isPremium: false,
          isFree: false,
          tags: ['Flow']
        }
      });
      console.log(`   ✅ ${slug}`);
    } catch (e) {
      console.log(`   ⚠️  ${slug} - not found`);
    }
  }

  // Update Energy recipes
  console.log('\n4️⃣ Updating Functional Energy recipes...');
  for (const slug of ENERGY_RECIPES) {
    try {
      await prisma.recipe.update({
        where: { slug },
        data: {
          isPremium: false,
          isFree: false,
          tags: ['Energy']
        }
      });
      console.log(`   ✅ ${slug}`);
    } catch (e) {
      console.log(`   ⚠️  ${slug} - not found`);
    }
  }

  // Final stats
  console.log('\n📊 Final database status:');
  const stats = await prisma.recipe.groupBy({
    by: ['isFree'],
    _count: true
  });
  
  stats.forEach(s => {
    console.log(`   ${s.isFree ? 'Free' : 'Course'} recipes: ${s._count}`);
  });

  const tagStats = await prisma.$queryRaw`
    SELECT 
      SUM(CASE WHEN 'Basic' = ANY(tags) THEN 1 ELSE 0 END) as basic_count,
      SUM(CASE WHEN 'Flow' = ANY(tags) THEN 1 ELSE 0 END) as flow_count,
      SUM(CASE WHEN 'Energy' = ANY(tags) THEN 1 ELSE 0 END) as energy_count
    FROM "Recipe"
  `;
  
  console.log(`   Basic tagged: ${tagStats[0].basic_count}`);
  console.log(`   Flow tagged: ${tagStats[0].flow_count}`);
  console.log(`   Energy tagged: ${tagStats[0].energy_count}`);

  await prisma.$disconnect();
  console.log('\n✅ Done!');
}

main().catch(console.error);

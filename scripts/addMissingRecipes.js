const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMissingRecipes() {
  console.log('🍳 Adding missing recipes to database...');

  try {
    // 1. Köttfärsbiffar med tomatsallad (Flow)
    const recipe1 = await prisma.recipe.create({
      data: {
        title: 'Köttfärsbiffar med tomatsallad',
        slug: 'kottfarsbiffar-med-tomatsallad',
        excerpt: 'Saftiga köttfärsbiffar serverade med fräsch tomatsallad. En proteinrik och näringsrik måltid med antioxidanter från tomater.',
        content: 'En enkel och smakrik måltid med proteinrika köttfärsbiffar och vitaminfylld tomatsallad.',
        instructions: 'Blanda köttfärs med ägg, salt och peppar i en skål. Forma färsen till 4 platta biffar. Hetta upp en stekpanna med olivolja. Stek köttfärsbiffarna i 3-4 minuter på varje sida. Skär tomater i klyftor och blanda med rödlök, basilika och olivolja. Servera köttfärsbiffarna med tomatsalladen. Garnera med färsk basilika.',
        ingredients: ['500g köttfärs', '1 ägg', 'Salt och peppar', '2 msk olivolja', '4 tomater', '1/2 rödlök', 'Färsk basilika'],
        prepTime: '15',
        cookTime: '10',
        servings: 2,
        difficulty: 'Lätt',
        categories: ['Middag', 'Protein'],
        tags: ['Flow', 'Snabb', 'Proteinrik'],
        isPremium: true,
        isFree: false,
        imageUrl: '/images/recipe-placeholder.svg'
      }
    });

    // 2. Högrevsburgare med hummus (Basic)
    const recipe2 = await prisma.recipe.create({
      data: {
        title: 'Högrevsburgare med hummus',
        slug: 'hogrevsburgare-med-hummus',
        excerpt: 'Högkvalitativa nötköttsburgare serverade med krämig hummus och färska grönsaker. En proteinrik måltid med medelhavsinspiration.',
        content: 'Näringsrika burgare med högkvalitativ köttfärs, serverade med protein- och fiberrik hummus.',
        instructions: 'Forma högrevsfärsen till 2 burgare. Krydda med salt, peppar och örtagårdskrydda. Hetta upp en stekpanna med olivolja. Stek burgarna i 4-5 minuter på varje sida. Skiva tomater och rödlök. Lägg rucola på tallrikar. Placera burgarna på rucolabädden. Servera med hummus och grönsaker vid sidan.',
        ingredients: ['300g högrevsfärs', 'Salt och peppar', '1 tsk örtagårdskrydda', '2 msk olivolja', '2 tomater', '1/2 rödlök', 'Rucola', '4 msk hummus'],
        prepTime: '10',
        cookTime: '10',
        servings: 2,
        difficulty: 'Lätt',
        categories: ['Middag', 'Protein'],
        tags: ['Basic', 'Medelhav', 'Proteinrik'],
        isPremium: true,
        isFree: false,
        imageUrl: '/images/recipe-placeholder.svg'
      }
    });

    // 3. Asiatisk köttfärswok med grönkål (Flow)
    const recipe3 = await prisma.recipe.create({
      data: {
        title: 'Asiatisk köttfärswok med grönkål',
        slug: 'asiatisk-kottfarswok-med-gronkal',
        excerpt: 'En smakrik wok med köttfärs och näringsrik grönkål, kryddad med asiatiska smaker. Snabb och hälsosam vardagsmat.',
        content: 'Snabb och näringsrik wok med antiinflammatoriska kryddor och vitamin K-rik grönkål.',
        instructions: 'Hetta upp en wokpanna eller stor stekpanna med olja. Stek köttfärsen i 3-4 minuter tills den bryns. Tillsätt vitlök, ingefära och chili. Stek i ytterligare 1 minut. Tillsätt sojasås och sesamolja. Lägg i grönkålen och woka i 2-3 minuter. Smaka av med salt och peppar. Garnera med sesamfrön och salladslök.',
        ingredients: ['400g köttfärs', '2 vitlöksklyftor', '1 msk ingefära', '1 chili', '3 msk sojasås', '1 msk sesamolja', '200g grönkål', 'Sesamfrön', 'Salladslök'],
        prepTime: '10',
        cookTime: '8',
        servings: 2,
        difficulty: 'Lätt',
        categories: ['Middag', 'Wok'],
        tags: ['Flow', 'Asiatisk', 'Snabb'],
        isPremium: true,
        isFree: false,
        imageUrl: '/images/recipe-placeholder.svg'
      }
    });

    console.log('✅ Successfully added missing recipes:');
    console.log(`- ${recipe1.title} (${recipe1.slug})`);
    console.log(`- ${recipe2.title} (${recipe2.slug})`);
    console.log(`- ${recipe3.title} (${recipe3.slug})`);
    
  } catch (error) {
    console.error('❌ Error adding recipes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingRecipes(); 
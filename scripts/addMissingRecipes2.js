const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addMissingRecipes() {
  console.log('🍳 Adding 2 missing recipes to database...');

  try {
    // 1. Rödbetsjuice
    const recipe1 = await prisma.recipe.create({
      data: {
        title: 'Rödbetsjuice',
        slug: 'rodbetsjuice',
        excerpt: 'Näringsrik rödbetsjuice med naturliga nitrat som stödjer cirkulationen och ger energi. Perfekt för att starta dagen.',
        content: 'En kraftfull juice som stöder blodcirkulationen och ger naturlig energi genom rödbetans höga nitratinnehåll.',
        instructions: 'Skölj rödbetorna noggrant under rinnande vatten. Skala rödbetorna och skär i mindre bitar. Kör genom juicepressen tillsammans med eventuella andra ingredienser. Rör om och servera direkt. Kan spädes med lite vatten om den blir för koncentrerad.',
        ingredients: ['2-3 rödbetor', '1 morot (valfritt)', '1 äpple (valfritt)', '1 bit ingefära (valfritt)', 'Citron (valfritt)'],
        prepTime: '10',
        cookTime: '0',
        servings: 1,
        difficulty: 'Lätt',
        categories: ['Dryck', 'Smoothie'],
        tags: ['Hälsosam', 'Energigivande', 'Antioxidanter'],
        isPremium: true,
        isFree: false,
        imageUrl: '/images/recipe-placeholder.svg'
      }
    });

    // 2. Köttfärsbiffar med stekt blomkål
    const recipe2 = await prisma.recipe.create({
      data: {
        title: 'Köttfärsbiffar med stekt blomkål',
        slug: 'kottfarsbiffar-med-stekt-blomkal',
        excerpt: 'Saftiga köttfärsbiffar serverade med krispigt stekt blomkål. En proteinrik och näringsrik måltid med låg kolhydrathalt.',
        content: 'En klassisk kombination av protein och grönsaker som ger mättnad och näring utan onödiga kolhydrater.',
        instructions: 'Blanda köttfärs med ägg, salt, peppar och örtkrydda i en skål. Forma till 4 biffar. Hetta upp en stekpanna med olivolja. Stek köttfärsbiffarna 3-4 minuter på varje sida. Dela blomkålen i buketter och stek i samma panna eller en separat panna tills den är gyllene och knaprig, ca 5-7 minuter. Krydda blomkålen med salt och peppar. Servera köttfärsbiffarna med det stekta blomkålet.',
        ingredients: ['400g köttfärs', '1 ägg', 'Salt och peppar', '1 tsk örtkrydda', '1 blomkålshuvud', '3 msk olivolja', 'Färsk persilja för garnering'],
        prepTime: '15',
        cookTime: '15',
        servings: 2,
        difficulty: 'Lätt',
        categories: ['Middag', 'Protein', 'LCHF'],
        tags: ['Proteinrik', 'Låg kolhydrat', 'Snabb'],
        isPremium: true,
        isFree: false,
        imageUrl: '/images/recipe-placeholder.svg'
      }
    });

    console.log('✅ Successfully added missing recipes:');
    console.log(`- ${recipe1.title} (${recipe1.slug})`);
    console.log(`- ${recipe2.title} (${recipe2.slug})`);
    
  } catch (error) {
    console.error('❌ Error adding recipes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingRecipes(); 
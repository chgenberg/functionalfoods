const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Convert title to slug
function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a') 
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function createMissingRecipes() {
  console.log('🔧 Creating missing recipe placeholders...');

  const missingRecipes = [
    '1 havrefrallor med morötter och aprikoser + valfritt pålägg',
    'Lax med fetaost och rostade rotfrukter och brysselkål',
    'Blåbärs smoothiebowl',
    'Äggröra med rökt lax',
    'Rödbetsjuice',
    'Grillade köttspett med grekisk sallad och morotstzatziki',
    'Japansk kycklingfärswok med groddar',
    'Grekisk sallad med fetaost',
    'Köttfärslimpa med ajvar, fetaost och rostad sötpotatis',
    'Lammgryta plommon och bulgur',
  ];

  for (const title of missingRecipes) {
    const slug = titleToSlug(title);
    
    // Check if already exists
    const existing = await prisma.recipe.findUnique({ where: { slug } });
    if (existing) {
      console.log(`⏭️  Recipe "${title}" already exists, skipping.`);
      continue;
    }

    await prisma.recipe.create({
      data: {
        title,
        slug,
        excerpt: 'Receptinformation kommer snart...',
        content: 'Detta recept håller på att fyllas i med fullständigt innehåll.',
        ingredients: ['Ingredienser kommer snart'],
        instructions: 'Instruktioner kommer snart.',
        categories: ['Basic'],
        tags: ['Basic'],
        isPremium: false,
        isFree: true,
        status: 'PUBLISHED',
      },
    });
    
    console.log(`✅ Created placeholder: "${title}" -> ${slug}`);
  }
  
  console.log('🎉 All missing recipes created as placeholders!');
  await prisma.$disconnect();
}

createMissingRecipes().catch(console.error); 
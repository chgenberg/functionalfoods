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

async function createMissingFlowRecipes() {
  console.log('🔧 Creating missing Flow recipe placeholders...');

  const missingRecipes = [
    'Laxgratäng med scampi och broccoli',
    'Ugnsomelett med bär',
    'Färskostmacka med ost och paprika',
    'Kyckling med blomkålsris och dillyoghurt',
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
        excerpt: 'Flow-receptinformation kommer snart...',
        content: 'Detta Flow-recept håller på att fyllas i med fullständigt innehåll.',
        ingredients: ['Ingredienser kommer snart'],
        instructions: 'Instruktioner kommer snart.',
        categories: ['Flow'],
        tags: ['Flow'],
        isPremium: true,
        isFree: false,
        status: 'PUBLISHED',
      },
    });
    
    console.log(`✅ Created Flow placeholder: "${title}" -> ${slug}`);
  }
  
  console.log('🎉 All missing Flow recipes created as placeholders!');
  await prisma.$disconnect();
}

createMissingFlowRecipes().catch(console.error); 
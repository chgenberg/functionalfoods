const { PrismaClient } = require('@prisma/client');

const recipe = {
  slug: 'yoghurt-med-ketomusli',
  title: 'Yoghurt med ketomüsli',
  excerpt: 'Enkel och näringsrik frukost med grekisk yoghurt och hemgjord ketomüsli',
  servings: 1,
  ingredients: [
    '1 dl grekisk yoghurt (10%)',
    '¾ dl ketomüsli'
  ],
  instructions: `1. Lägg yoghurt i en skål.
2. Toppa med ketomüsli.

Tips: Du kan göra din egen ketomüsli genom att blanda nötter, frön och kokosflingor. Rosta i ugn på 150°C i 15-20 minuter.`,
  categories: ['Frukost'],
  difficulty: 'Lätt',
  prepTime: '2 min',
  cookTime: '0 min',
  tags: ['Frukost', 'Keto', 'Lågkolhydrat'],
  status: 'PUBLISHED',
  isPremium: false,
  isFree: true,
  nutrition: {
    perServing: {
      energy: 350,
      protein: 18,
      carbohydrates: 8,
      fat: 28,
      fiber: 4,
      sugar: 5,
      salt: 0.2
    }
  }
};

(async () => {
  const prisma = new PrismaClient();
  try {
    // First check if it exists
    const existing = await prisma.recipe.findUnique({
      where: { slug: recipe.slug }
    });

    if (existing) {
      // Update if exists
      await prisma.recipe.update({
        where: { slug: recipe.slug },
        data: recipe
      });
      console.log('✅ Updated:', recipe.title);
    } else {
      // Create if doesn't exist
      await prisma.recipe.create({
        data: recipe
      });
      console.log('✅ Created:', recipe.title);
    }
  } catch (e) {
    console.error('❌ Failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

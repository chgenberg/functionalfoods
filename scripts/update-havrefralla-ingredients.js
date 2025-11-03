/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const slug = 'havrefralla-med-morotter-och-torkade-aprikoser';
  
  const ingredients = [
    '4 dl havregryn',
    '4 torkade aprikoser',
    '1 morot',
    '3 dl keso 4%',
    '4 ägg',
    '1 dl solroskärnor',
    '1 dl pumpafrön',
    '1 dl hampafrön',
    '1 dl sesamfrön',
    '1.5 tsk bakpulver',
    '1 krm salt',
    'Topping: 1/2 dl hampafrön'
  ];

  const recipe = await prisma.recipe.findUnique({ 
    where: { slug },
    select: { id: true, title: true, ingredients: true }
  });

  if (!recipe) {
    console.error(`❌ Recipe not found: ${slug}`);
    process.exit(1);
  }

  console.log('Found recipe:', { 
    slug, 
    title: recipe.title,
    currentIngredients: recipe.ingredients 
  });

  const updated = await prisma.recipe.update({
    where: { slug },
    data: {
      ingredients
    }
  });

  console.log('✅ Updated ingredients for recipe', { 
    slug: updated.slug, 
    title: updated.title,
    ingredients: updated.ingredients 
  });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


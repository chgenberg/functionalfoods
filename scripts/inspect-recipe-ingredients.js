const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const slug = process.argv[2] || 'shiitake-med-nudlar';
    const r = await prisma.recipe.findUnique({ where: { slug } });
    if (!r) { console.log('Not found'); process.exit(0); }
    console.log('Title:', r.title);
    console.log('Ingredients:');
    r.ingredients.forEach((ing, i) => console.log(i+1, JSON.stringify(ing)));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();

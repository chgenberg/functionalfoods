const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const r = await prisma.recipe.findUnique({ where: { slug: 'shiitake-med-nudlar' } });
    if (!r) {
      console.log('Not found');
      process.exit(0);
    }
    await prisma.recipe.update({
      where: { id: r.id },
      data: { imageUrl: '/recept_images_2025/Shitake med nudlar.jpg', updatedAt: new Date() }
    });
    console.log('Updated shiitake-med-nudlar imageUrl');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

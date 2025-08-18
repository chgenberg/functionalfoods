const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  const slugs = [
    'kottfarsbiffar-med-stekt-blomkal-rester',
    'kycklinggryta-med-bakad-spetskal-rester',
  ];
  try {
    for (const slug of slugs) {
      const r = await prisma.recipe.findUnique({ where: { slug } });
      if (r) {
        await prisma.recipe.delete({ where: { slug } });
        console.log('🗑️  deleted', slug);
      } else {
        console.log('⏭️  not-found', slug);
      }
    }
  } catch (e) {
    console.error('Error during cleanup:', e.message || e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})(); 
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const a = await prisma.recipe.findUnique({ where: { slug: 'gronsakspannkaka-med-asiatisk-sas' } });
    const b = await prisma.recipe.findUnique({ where: { slug: 'gronsakspankaka-med-asiatisk-sas' } });
    console.log('2x n (gronsakspannkaka):', a && { id:a.id, isFree:a.isFree, isPremium:a.isPremium, tags:a.tags });
    console.log('1x n (gronsakspankaka):', b && { id:b.id, isFree:b.isFree, isPremium:b.isPremium, tags:b.tags });
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

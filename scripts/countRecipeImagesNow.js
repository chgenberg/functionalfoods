const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const total = await prisma.recipe.count();
  const withAny = await prisma.recipe.count({ where: { OR: [{ imageUrl: { not: null } }, { imageMobileUrl: { not: null } }] } });
  const withBoth = await prisma.recipe.count({ where: { AND: [{ imageUrl: { not: null } }, { imageMobileUrl: { not: null } }] } });
  const onlyDesktop = await prisma.recipe.count({ where: { AND: [{ imageUrl: { not: null } }, { imageMobileUrl: null }] } });
  const onlyMobile = await prisma.recipe.count({ where: { AND: [{ imageUrl: null }, { imageMobileUrl: { not: null } }] } });
  const without = await prisma.recipe.count({ where: { AND: [{ imageUrl: null }, { imageMobileUrl: null }] } });
  console.log(JSON.stringify({ total, withAny, withBoth, onlyDesktop, onlyMobile, without }, null, 2));
  await prisma.$disconnect();
})();

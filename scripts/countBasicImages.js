const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugs = process.env.SLUGS.split(',').filter(Boolean);
(async () => {
  const recipes = await prisma.recipe.findMany({ where: { slug: { in: slugs } }, select: { slug: true, imageUrl: true, imageMobileUrl: true } });
  const present = new Set(recipes.map(r => r.slug));
  const missing = slugs.filter(s => !present.has(s));
  const withAny = recipes.filter(r => r.imageUrl || r.imageMobileUrl).length;
  const withBoth = recipes.filter(r => r.imageUrl && r.imageMobileUrl).length;
  const onlyDesktop = recipes.filter(r => r.imageUrl && !r.imageMobileUrl).length;
  const onlyMobile = recipes.filter(r => !r.imageUrl && r.imageMobileUrl).length;
  const without = recipes.length - withAny;
  console.log(JSON.stringify({ totalBasicSlugs: slugs.length, inDatabase: recipes.length, missingInDB: missing.length, withAny, withBoth, onlyDesktop, onlyMobile, without }, null, 2));
  await prisma.$disconnect();
})();

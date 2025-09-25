const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const a = await prisma.recipe.findUnique({ where: { slug: 'gronsakspannkaka-med-asiatisk-sas' } });
    const b = await prisma.recipe.findUnique({ where: { slug: 'gronsakspankaka-med-asiatisk-sas' } });

    if (a) {
      const cleanTags = (a.tags || []).filter(t => !['Basic','Flow','Energy'].includes(t));
      await prisma.recipe.update({
        where: { id: a.id },
        data: { isFree: true, isPremium: false, tags: cleanTags, status: 'PUBLISHED' }
      });
      console.log('✅ Cleaned free recipe tags and ensured published:', a.slug);
    }

    if (b) {
      await prisma.recipe.update({ where: { id: b.id }, data: { status: 'ARCHIVED' } });
      console.log('📦 Archived duplicate slug:', b.slug);
    }

    // Global cleanup: remove course tags from ALL free recipes
    const freeWithCourseTags = await prisma.recipe.findMany({
      where: { isFree: true, tags: { hasSome: ['Basic','Flow','Energy'] } },
      select: { id: true, slug: true, tags: true }
    });
    for (const r of freeWithCourseTags) {
      const tags = (r.tags || []).filter(t => !['Basic','Flow','Energy'].includes(t));
      await prisma.recipe.update({ where: { id: r.id }, data: { tags } });
      console.log('🔧 Removed course tag(s) from free recipe:', r.slug);
    }

    console.log('Done.');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

(async () => {
  const prisma = new PrismaClient();
  try {
    const recipes = await prisma.recipe.findMany({ select: { id:true, title:true, slug:true, imageUrl:true } });
    const publicDir = path.resolve('public');
    const missing = [];

    for (const r of recipes) {
      const url = (r.imageUrl || '').trim();
      if (!url) {
        missing.push({ id:r.id, slug:r.slug, title:r.title, reason:'no_image_url' });
        continue;
      }
      let rel = url;
      if (url.startsWith('/api/images')) {
        rel = url.replace('/api/images','');
      }
      const fullPath = path.join(publicDir, rel.startsWith('/') ? rel.slice(1) : rel);
      if (!fs.existsSync(fullPath)) {
        missing.push({ id:r.id, slug:r.slug, title:r.title, reason:'file_missing', imageUrl:url, expectedPath: fullPath });
      }
    }

    console.log(JSON.stringify({ total: recipes.length, missingCount: missing.length, missing }, null, 2));
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

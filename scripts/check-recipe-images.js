const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    const recipes = await prisma.recipe.findMany({ select: { id: true, slug: true, title: true, imageUrl: true } });
    let ok = 0;
    let missingUrl = 0;
    let missingFile = 0;
    const missingList = [];

    for (const r of recipes) {
      if (!r.imageUrl) {
        missingUrl++;
        missingList.push({ slug: r.slug, reason: 'NO_URL' });
        continue;
      }
      const rel = r.imageUrl.replace(/^\//, '');
      const abs = path.join(process.cwd(), 'public', rel);
      if (!fs.existsSync(abs)) {
        missingFile++;
        missingList.push({ slug: r.slug, reason: 'NO_FILE', path: r.imageUrl });
        continue;
      }
      ok++;
    }

    console.log('Result');
    console.log({ total: recipes.length, ok, missingUrl, missingFile });
    if (missingList.length) {
      console.log('\nMissing details (first 30):');
      for (const m of missingList.slice(0, 30)) {
        console.log(`- ${m.slug} (${m.reason}${m.path ? `: ${m.path}` : ''})`);
      }
      if (missingList.length > 30) console.log(`... and ${missingList.length - 30} more`);
    }
  } catch (e) {
    console.error('Check error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 
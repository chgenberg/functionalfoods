const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  try {
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const content = fs.readFileSync(mealPlansPath, 'utf8');

    // Extract all meal entries
    const pairRegex = /"name":\s*"([^"]+)"([\s\S]*?)"recipeLink":\s*"([^"]*)"/g;
    const entries = [];
    let m;
    while ((m = pairRegex.exec(content)) !== null) {
      const name = m[1];
      const link = m[3] || '';
      let slug = '';
      if (link.includes('/kunskapsbank/recept/')) {
        const sm = link.match(/\/kunskapsbank\/recept\/([^\"\s]+)/);
        slug = sm ? sm[1] : '';
      }
      entries.push({ name, link, slug });
    }

    // Load DB slugs
    const recipes = await prisma.recipe.findMany({ select: { slug: true, title: true, tags: true } });
    const slugSet = new Set(recipes.map(r => r.slug));

    const missing = entries.filter(e => !e.slug || !slugSet.has(e.slug));

    console.log(`Totala måltider: ${entries.length}`);
    console.log(`Saknade/ogiltiga länkar: ${missing.length}`);

    const sample = missing.slice(0, 100);
    for (const e of sample) {
      console.log(`- ${e.name} -> ${e.slug || '(tom)'} (${e.link})`);
    }

  } catch (err) {
    console.error('❌ Fel i diagnostik:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 
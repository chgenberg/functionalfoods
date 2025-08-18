const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs').promises;

const INPUT_PATH = path.resolve(process.cwd(), 'scripts', 'generatedMealPlans.functional1.json');

function extractSlugFromLink(link) {
  if (!link) return null;
  const m = link.match(/\/kunskapsbank\/recept\/([a-z0-9\-]+)/i);
  return m ? m[1] : null;
}

async function main() {
  const raw = await fs.readFile(INPUT_PATH, 'utf8');
  const data = JSON.parse(raw);
  const week = data.week1;
  if (!week || !week.days) throw new Error('Invalid input: week1.days missing');

  const slugs = new Set();
  for (const day of Object.keys(week.days)) {
    const meals = week.days[day];
    for (const slot of Object.keys(meals)) {
      const slug = extractSlugFromLink(meals[slot]?.recipeLink || '');
      if (slug) slugs.add(slug);
    }
  }

  const prisma = new PrismaClient();
  const missing = [];
  const found = [];

  try {
    for (const slug of slugs) {
      const rec = await prisma.recipe.findUnique({ where: { slug } });
      if (rec) found.push(slug); else missing.push(slug);
    }
  } catch (e) {
    console.error('⚠️  DB check failed, printing required slugs only:', e.message || e);
    console.log('Required slugs:', Array.from(slugs));
    process.exit(0);
  } finally {
    await prisma.$disconnect();
  }

  console.log('✅ Found in DB:', found.length);
  if (found.length) console.log(found.join('\n'));
  console.log('\n❌ Missing in DB:', missing.length);
  if (missing.length) console.log(missing.join('\n'));

  if (missing.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error('Validation failed:', e.message || e);
  process.exit(1);
}); 
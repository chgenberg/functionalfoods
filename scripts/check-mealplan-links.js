const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function extractPairs() {
  const file = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
  const src = await fsp.readFile(file, 'utf-8');
  const pairRegex = /\{\s*"name":\s*"([^"]+)"[\s\S]*?"recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g;
  const pairs = [];
  let m;
  while ((m = pairRegex.exec(src)) !== null) {
    const name = m[1];
    const slug = m[2];
    // skip leftovers
    if (/rester/i.test(name)) continue;
    pairs.push({ name, slug });
  }
  return pairs;
}

function sample(array, n) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

async function main() {
  try {
    const pairs = await extractPairs();
    const picks = sample(pairs, Math.min(12, pairs.length));

    let ok = 0;
    let missing = 0;
    let imgMissing = 0;

    for (const { name, slug } of picks) {
      const r = await prisma.recipe.findUnique({ where: { slug } });
      if (!r) {
        console.log(`❌ Missing recipe for slug='${slug}' (name='${name}')`);
        missing++;
        continue;
      }
      let imgOk = true;
      if (r.imageUrl) {
        const imgPath = path.join(process.cwd(), 'public', r.imageUrl.replace(/^\//, ''));
        imgOk = fs.existsSync(imgPath);
      }
      if (!imgOk) imgMissing++;
      console.log(`✅ ${slug} -> '${r.title}'  image: ${r.imageUrl || 'none'} ${imgOk ? '' : '(missing)'}`);
      ok++;
    }

    console.log('\nResult');
    console.log(`OK: ${ok}, Missing recipes: ${missing}, Missing images: ${imgMissing}`);
  } catch (e) {
    console.error('Check failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 
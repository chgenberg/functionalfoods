const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

const prisma = new PrismaClient();

const FIX_MODE = true;

// Priority order per user's instruction
const IMAGE_DIRS = [
  'public/Recept_complete/images/_optimized',
  'public/Recept_complete/images',
  'public/Bilder_basic/_optimized',
  'public/Bilder_flow/_optimized'
];

const IGNORE_WORDS = ['med', 'och', 'från', 'för', 'på', 'i', 'av', 'till', 'rester'];

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[éè]/g, 'e')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !IGNORE_WORDS.includes(w))
    .join(' ');
}

function buildImageIndex() {
  const index = [];
  for (const dir of IMAGE_DIRS) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) continue;
    const files = fs.readdirSync(dirPath).filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f));
    for (const file of files) {
      const base = path.basename(file, path.extname(file));
      index.push({
        dir,
        file,
        base,
        normBase: normalizeText(base),
        publicPath: `/${path.join(dir.replace('public/', ''), file)}`
      });
    }
  }
  return index;
}

function bestMatchForRecipe(recipe, imageIndex) {
  const normTitle = normalizeText(recipe.title);
  const slug = recipe.slug || '';
  let best = null;
  let bestScore = 0;

  for (const img of imageIndex) {
    let score = stringSimilarity.compareTwoStrings(normTitle, img.normBase) * 100;

    // Strong bonus if filename contains slug or vice versa
    const lbase = img.base.toLowerCase();
    if (slug && (lbase.includes(slug) || slug.includes(lbase))) score += 30;

    // Tiny bonus for same directory priority (earlier dirs first)
    score += (IMAGE_DIRS.length - IMAGE_DIRS.indexOf(img.dir)) * 0.1;

    if (score > bestScore) {
      bestScore = score;
      best = img;
    }
  }

  if (best && bestScore >= 50) {
    return { path: best.publicPath, score: Math.round(bestScore), file: best.file, dir: best.dir };
  }
  return null;
}

async function main() {
  console.log('🔎 Force fuzzy image assignment');
  const imageIndex = buildImageIndex();
  console.log(`🖼️ Images indexed: ${imageIndex.length}`);

  const recipes = await prisma.recipe.findMany({
    select: { id: true, title: true, slug: true, imageUrl: true },
    orderBy: { title: 'asc' }
  });
  console.log(`📚 Recipes: ${recipes.length}`);

  const fixes = [];
  const noMatch = [];

  for (const r of recipes) {
    const match = bestMatchForRecipe(r, imageIndex);
    if (!match) {
      noMatch.push({ title: r.title, slug: r.slug });
      continue;
    }

    if (FIX_MODE && r.imageUrl !== match.path) {
      await prisma.recipe.update({ where: { id: r.id }, data: { imageUrl: match.path } });
      fixes.push({ title: r.title, slug: r.slug, newImage: match.path, score: match.score });
    }
  }

  console.log(`\n✅ Fixes applied: ${fixes.length}`);
  console.log(`❌ No match: ${noMatch.length}`);

  fs.writeFileSync(
    path.join(process.cwd(), 'force-fuzzy-image-assign-report.json'),
    JSON.stringify({ fixes, noMatch }, null, 2)
  );
  console.log('📄 Report: force-fuzzy-image-assign-report.json');

  await prisma.$disconnect();
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
} 
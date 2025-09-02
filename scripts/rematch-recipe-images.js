const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const fssync = require('fs');
const path = require('path');
const stringSimilarity = require('string-similarity');

const prisma = new PrismaClient();

function normalizeSwedish(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[éèêë]/g, 'e')
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function basenameNoExt(p) {
  if (!p) return '';
  const base = p.split(/[\\/]/).pop();
  return base ? base.replace(/\.(jpg|jpeg|png|webp)$/i, '') : '';
}

const STOP = new Set(['med','och','eller','fran','från','i','en','ett','att','av','till','for','för']);
function tokenize(str) {
  return normalizeSwedish(str)
    .split(' ')
    .filter(w => w && w.length > 2 && !STOP.has(w));
}

function tokenOverlap(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  let c = 0;
  for (const t of a) if (b.has(t)) c++;
  return c;
}

function scoreCandidate(title, featuredBase, candidateName) {
  const normCand = normalizeSwedish(candidateName);
  const normTitle = normalizeSwedish(title);
  const normFeat = normalizeSwedish(featuredBase);

  const tTitle = tokenize(title);
  const tCand = tokenize(candidateName);
  const overlap = tokenOverlap(tTitle, tCand);
  const unionSize = new Set([...tTitle, ...tCand]).size || 1;
  const jaccard = overlap / unionSize;

  // Prefer exact featured match only if it shares at least one meaningful token with title
  if (normFeat && normCand === normFeat) {
    return overlap >= 1 ? 1.0 : 0.7;
  }

  // Exact title match
  if (normCand === normTitle) return 0.95;

  // String similarity signals
  const simTitle = stringSimilarity.compareTwoStrings(normTitle, normCand);
  const simFeat = normFeat ? stringSimilarity.compareTwoStrings(normFeat, normCand) : 0;

  // Coverage: how much of title tokens are included in candidate
  const coverage = tTitle.length ? Math.min(1, overlap / Math.max(1, tTitle.length - 1)) : 0;

  // Weighted score with extra weight for coverage
  const composite = jaccard * 0.45 + simTitle * 0.35 + coverage * 0.2;
  return Math.max(composite, simFeat * 0.85);
}

function parseTSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const headers = lines[0].split('\t');
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] !== undefined ? cols[idx] : '';
    });
    rows.push(row);
  }
  return rows;
}

async function main() {
  const apply = process.argv.includes('--apply');
  try {
    const imagesDir = path.join(process.cwd(), 'public', 'Recept_complete', 'images');
    const recipesCsvPath = path.join(process.cwd(), 'public', 'Recept_complete', 'recipes.csv');

    const [imageFiles, recipesCsv] = await Promise.all([
      fs.readdir(imagesDir),
      fs.readFile(recipesCsvPath, 'utf-8')
    ]);

    const imageList = imageFiles.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    const imageBaseNames = imageList.map(f => f.replace(/\.(jpg|jpeg|png|webp)$/i, ''));

    const csvRows = parseTSV(recipesCsv);
    // Map title -> featured base filename
    const titleToFeatured = new Map();
    for (const row of csvRows) {
      const title = (row.title || '').trim();
      const featured = basenameNoExt(row.featured_image_path || '');
      if (title) titleToFeatured.set(title, featured);
    }

    const dbRecipes = await prisma.recipe.findMany({ select: { id: true, title: true, slug: true, imageUrl: true } });

    let changed = 0;
    let unchanged = 0;
    let missing = 0;

    for (const r of dbRecipes) {
      const featuredBase = titleToFeatured.get(r.title) || '';

      let best = { file: null, score: 0, overlap: 0 };
      const titleTokens = tokenize(r.title);
      for (const base of imageBaseNames) {
        const s = scoreCandidate(r.title, featuredBase, base);
        const ov = tokenOverlap(titleTokens, tokenize(base));
        if (s > best.score || (Math.abs(s - best.score) < 0.02 && ov > best.overlap)) {
          best = { file: base, score: s, overlap: ov };
        }
      }

      if (!best.file || best.score < 0.6) {
        missing++;
        continue;
      }

      const chosenFile = imageList.find(f => f.toLowerCase().startsWith(best.file.toLowerCase()));
      if (!chosenFile) {
        missing++;
        continue;
      }

      const targetUrl = `/Recept_complete/images/${chosenFile}`;
      const fileExists = fssync.existsSync(path.join(process.cwd(), 'public', targetUrl.replace(/^\//, '')));
      if (!fileExists) {
        missing++;
        continue;
      }

      const suspicious = best.overlap === 0;

      if (r.imageUrl !== targetUrl) {
        if (apply) {
          await prisma.recipe.update({ where: { id: r.id }, data: { imageUrl: targetUrl, imageAlt: r.title } });
        }
        changed++;
        console.log(`${apply ? 'Updated' : 'Would update'}: ${r.slug} -> ${targetUrl} (score ${best.score.toFixed(2)}${suspicious ? ', LOW-OVERLAP' : ''})`);
      } else {
        unchanged++;
      }
    }

    console.log('\nSummary');
    console.log(`Changed: ${changed}${apply ? '' : ' (dry-run)'}`);
    console.log(`Unchanged: ${unchanged}`);
    console.log(`Missing/low-confidence: ${missing}`);
    if (!apply) console.log('Run with --apply to persist changes.');
  } catch (e) {
    console.error('Rematch error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 
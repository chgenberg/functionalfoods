const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
let similarity;
try { similarity = require('string-similarity'); } catch (e) { similarity = null; }

const prisma = new PrismaClient();

function normalizeSwedish(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOPWORDS = new Set([
  'med','och','eller','fran','mot','utan','till','i','pa','av','for','utan','som','en','ett','den','det','de','att',
  'rester','resterna','resterfran','fran','frysen','fysen','mellanostern','typ','kcal','komma','rest','kommersnart'
]);

function tokenize(str) {
  return normalizeSwedish(str)
    .split(' ')
    .filter(w => w && !STOPWORDS.has(w));
}

function cleanMealName(name) {
  let n = name || '';
  // Remove calorie info and trailing parentheses content
  n = n.replace(/\(\s*\d+\s*kcal\s*\)/gi, '');
  n = n.replace(/\([^)]*\)/g, '');
  // Remove leftovers markers and freezer phrases
  n = n.replace(/rester(\s*fran\s*(frysen|fysen))?/gi, '');
  n = n.replace(/fran\s*(frysen|fysen)/gi, '');
  // Geographies/descriptors
  n = n.replace(/fran\s*mellanostern/gi, '');
  // Common noise
  n = n.replace(/\s+/g, ' ').trim();
  return n;
}

function jaccardScore(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  const inter = [...a].filter(x => b.has(x));
  const union = new Set([...a, ...b]);
  return inter.length / Math.max(1, union.size);
}

async function main() {
  try {
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const content = fs.readFileSync(mealPlansPath, 'utf8');

    // Load all recipes from DB
    const recipes = await prisma.recipe.findMany({ select: { slug: true, title: true } });
    const slugSet = new Set(recipes.map(r => r.slug));

    const candidates = recipes.map(r => ({
      slug: r.slug,
      title: r.title,
      normTitle: normalizeSwedish(r.title),
      titleTokens: tokenize(r.title),
      slugTokens: tokenize(r.slug.replace(/-/g, ' '))
    }));

    let updated = 0;
    let unresolved = 0;

    // Regex to find meal name + recipeLink pairs
    const pairRegex = /"name":\s*"([^"]+)"([\s\S]*?)"recipeLink":\s*"([^"]*)"/g;
    let match;
    let newContent = content;

    const edits = [];

    while ((match = pairRegex.exec(content)) !== null) {
      const fullMatch = match[0];
      const mealName = match[1];
      const currentLink = match[3];

      // Extract slug from link (may be empty)
      let currentSlug = '';
      if (currentLink && currentLink.includes('/kunskapsbank/recept/')) {
        const m = currentLink.match(/\/kunskapsbank\/recept\/([^\"]+)/);
        currentSlug = m ? m[1] : '';
      }

      if (currentSlug && slugSet.has(currentSlug)) {
        continue; // Already valid
      }

      const cleaned = cleanMealName(mealName);
      const normCleaned = normalizeSwedish(cleaned);
      const tokens = tokenize(cleaned);
      if (!normCleaned || tokens.length === 0) continue;

      // Compute combined score: average of string similarity and token Jaccard on titles; and token overlap with slug words
      let bestIdx = -1;
      let bestScore = -1;

      const titleTargets = candidates.map(c => c.normTitle);
      for (let idx = 0; idx < candidates.length; idx++) {
        const c = candidates[idx];
        let simScore = 0;
        if (similarity) {
          // string-similarity compare to normTitle
          simScore = similarity.compareTwoStrings(normCleaned, c.normTitle);
        } else {
          // crude char overlap ratio
          const a = new Set(normCleaned.split(' '));
          const b = new Set(c.normTitle.split(' '));
          const inter = [...a].filter(x => b.has(x));
          simScore = inter.length / Math.max(1, Math.min(a.size, b.size));
        }
        const tokenScoreTitle = jaccardScore(tokens, c.titleTokens);
        const tokenScoreSlug = jaccardScore(tokens, c.slugTokens);
        const combined = (simScore + tokenScoreTitle + tokenScoreSlug) / 3;
        if (combined > bestScore) { bestScore = combined; bestIdx = idx; }
      }

      // Accept if reasonably close
      if (bestIdx >= 0 && bestScore >= 0.5) {
        const chosen = candidates[bestIdx];
        const newLink = `/kunskapsbank/recept/${chosen.slug}`;
        const newPair = fullMatch.replace(currentLink, newLink);
        edits.push({ start: match.index, end: match.index + fullMatch.length, replacement: newPair });
        updated++;
      } else {
        unresolved++;
      }
    }

    if (edits.length === 0) {
      console.log('✅ Inga trasiga länkar att uppdatera eller inga bättre matchningar hittades.');
    } else {
      // Apply edits from last to first to keep indices valid
      edits.sort((a, b) => b.start - a.start);
      let buf = newContent;
      for (const e of edits) {
        buf = buf.slice(0, e.start) + e.replacement + buf.slice(e.end);
      }
      fs.writeFileSync(mealPlansPath, buf, 'utf8');
      console.log(`✅ Uppdaterade ${updated} länkar i mealPlans.ts`);
      if (unresolved > 0) console.log(`⚠️  Kunde inte hitta bra matchningar för ${unresolved} poster`);
    }

  } catch (err) {
    console.error('❌ Fel i auto-fix:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 
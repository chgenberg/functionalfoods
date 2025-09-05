const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
let similarity;
try { similarity = require('string-similarity'); } catch (e) { similarity = null; }

const prisma = new PrismaClient();

function normalizeSv(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP = new Set([
  'med','och','eller','fran','mot','utan','till','i','pa','av','for','utan','som','en','ett','den','det','de','att',
  'rester','resterna','resterfran','frysen','fysen','mellanostern','typ','kcal','komma','rest','kommer','snart','kommer-snart'
]);

function tokenize(str) {
  return normalizeSv(str).split(' ').filter(w => w && !STOP.has(w));
}

function cleanMealName(name) {
  let n = name || '';
  n = n.replace(/\(\s*\d+\s*kcal\s*\)/gi, '');
  n = n.replace(/\([^)]*\)/g, '');
  n = n.replace(/rester(\s*fran\s*(frysen|fysen))?/gi, '');
  n = n.replace(/fran\s*(frysen|fysen)/gi, '');
  n = n.replace(/fran\s*mellanostern/gi, '');
  n = n.replace(/\s+/g, ' ').trim();
  return n;
}

function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  const inter = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return inter / Math.max(1, union);
}

function containsEither(a, b) {
  const na = normalizeSv(a), nb = normalizeSv(b);
  return na.includes(nb) || nb.includes(na);
}

async function main() {
  try {
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const content = fs.readFileSync(mealPlansPath, 'utf8');

    // Load all recipes (include UD now; we'll convert later if used in courses)
    const recipes = await prisma.recipe.findMany({ select: { slug: true, title: true, tags: true } });
    const bySlug = new Map(recipes.map(r => [r.slug, r]));
    const candidates = recipes.map(r => ({
      slug: r.slug,
      title: r.title,
      normTitle: normalizeSv(r.title),
      titleTokens: tokenize(r.title),
      slugTokens: tokenize(r.slug.replace(/-/g, ' ')),
      isUD: (r.tags || []).includes('UD')
    }));

    // Parse all pairs
    const pairRegex = /"name":\s*"([^"]+)"([\s\S]*?)"recipeLink":\s*"([^"]*)"/g;
    const edits = [];
    let updated = 0, unresolved = 0;

    let m;
    while ((m = pairRegex.exec(content)) !== null) {
      const fullMatch = m[0];
      const name = m[1];
      const link = m[3] || '';
      let slug = '';
      if (link.includes('/kunskapsbank/recept/')) {
        const sm = link.match(/\/kunskapsbank\/recept\/([^\"]+)/);
        slug = sm ? sm[1] : '';
      }
      // If slug exists in DB, keep
      if (slug && bySlug.has(slug)) {
        continue;
      }

      // Need fixing: find best candidate
      const cleaned = cleanMealName(name);
      const norm = normalizeSv(cleaned);
      const tokens = tokenize(cleaned);
      if (!norm || tokens.length === 0) continue;

      // 1) Exact/contains match on titles first
      let chosen = null;
      for (const c of candidates) {
        if (c.normTitle === norm || containsEither(c.title, cleaned)) {
          chosen = c; break;
        }
      }

      // 2) Fallback to weighted fuzzy + token overlap
      if (!chosen) {
        let bestIdx = -1, bestScore = -1;
        for (let i = 0; i < candidates.length; i++) {
          const c = candidates[i];
          let sim = 0;
          if (similarity) sim = similarity.compareTwoStrings(norm, c.normTitle);
          else {
            const A = new Set(norm.split(' ')), B = new Set(c.normTitle.split(' '));
            const inter = [...A].filter(x => B.has(x)).length;
            sim = inter / Math.max(1, Math.min(A.size, B.size));
          }
          const jt = jaccard(tokens, c.titleTokens);
          const js = jaccard(tokens, c.slugTokens);
          const score = (sim + jt + js) / 3;
          if (score > bestScore) { bestScore = score; bestIdx = i; }
        }
        if (bestIdx >= 0 && bestScore >= 0.62) {
          chosen = candidates[bestIdx];
        }
      }

      if (chosen) {
        const newLink = `/kunskapsbank/recept/${chosen.slug}`;
        const replaced = fullMatch.replace(link, newLink);
        edits.push({ start: m.index, end: m.index + fullMatch.length, replacement: replaced, from: name, to: chosen.slug, isUD: chosen.isUD });
        updated++;
      } else {
        unresolved++;
      }
    }

    if (edits.length === 0) {
      console.log('✅ Inget att uppdatera.');
    } else {
      edits.sort((a, b) => b.start - a.start);
      let buf = content;
      for (const e of edits) {
        buf = buf.slice(0, e.start) + e.replacement + buf.slice(e.end);
      }
      fs.writeFileSync(mealPlansPath, buf, 'utf8');
      console.log(`✅ Uppdaterade ${updated} länkar.`);
      const usedUd = edits.filter(e => e.isUD).length;
      if (usedUd > 0) console.log(`ℹ️  ${usedUd} av dessa pekar på UD-recept (konverteras i nästa steg).`);
      if (unresolved > 0) console.log(`⚠️  Kvar olösta: ${unresolved}`);

      console.log('\nExempel (första 10):');
      edits.slice(0, 10).forEach(e => console.log(`- ${e.from} → ${e.to}${e.isUD ? ' [UD]' : ''}`));
    }
  } catch (err) {
    console.error('❌ Fel:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 
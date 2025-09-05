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

const STOP = new Set(['med','och','eller','fran','mot','utan','till','i','pa','av','for','som','en','ett','den','det','de','att']);
function tokenize(str) {
  return normalizeSv(str).split(' ').filter(w => w && !STOP.has(w));
}
function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  const inter = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return inter / Math.max(1, union);
}

async function main() {
  try {
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    let content = fs.readFileSync(mealPlansPath, 'utf8');

    // Parse all meal entries
    const pairRegex = /"name":\s*"([^"]+)"([\s\S]*?)"recipeLink":\s*"([^"]*)"/g;
    const entries = [];
    let m;
    while ((m = pairRegex.exec(content)) !== null) {
      const fullMatch = m[0];
      const idx = m.index;
      const name = m[1];
      const link = m[3] || '';
      let slug = '';
      if (link.includes('/kunskapsbank/recept/')) {
        const sm = link.match(/\/kunskapsbank\/recept\/([^\"\s]+)/);
        slug = sm ? sm[1] : '';
      }
      entries.push({ name, link, slug, idx, len: fullMatch.length, fullMatch });
    }

    // Load DB recipes
    const recipes = await prisma.recipe.findMany({ select: { slug: true, title: true, tags: true } });
    const slugSet = new Set(recipes.map(r => r.slug));

    const candidates = recipes.map(r => ({
      slug: r.slug,
      title: r.title,
      normTitle: normalizeSv(r.title),
      tokens: tokenize(r.title),
      isUD: (r.tags || []).includes('UD')
    }));

    // Find missing
    const missing = entries.filter(e => !e.slug || !slugSet.has(e.slug));
    console.log(`Saknade/ogiltiga länkar att uppdatera: ${missing.length}`);

    // Build replacements
    const edits = [];
    for (const e of missing) {
      const query = e.name.replace(/\(.*?\)/g, '').trim();
      const norm = normalizeSv(query);
      const tokens = tokenize(query);
      if (!norm) continue;

      // Score candidates
      const scored = candidates.map(c => {
        let sim = 0;
        if (similarity) sim = similarity.compareTwoStrings(norm, c.normTitle);
        else {
          const A = new Set(norm.split(' ')), B = new Set(c.normTitle.split(' '));
          const inter = [...A].filter(x => B.has(x)).length;
          sim = inter / Math.max(1, Math.min(A.size, B.size));
        }
        const jt = jaccard(tokens, c.tokens);
        const score = (sim + jt) / 2;
        return { ...c, score };
      }).sort((a, b) => b.score - a.score);

      const best = scored[0];
      if (!best || best.score < 0.35) continue; // too weak

      const newLink = `/kunskapsbank/recept/${best.slug}`;
      const newFull = e.fullMatch.replace(e.link, newLink);
      edits.push({ start: e.idx, end: e.idx + e.len, replacement: newFull, fromName: e.name, toSlug: best.slug, score: best.score.toFixed(2) });
    }

    if (edits.length === 0) {
      console.log('✅ Inget att uppdatera baserat på tröskel.');
    } else {
      // Apply edits from end to start
      edits.sort((a, b) => b.start - a.start);
      let buf = content;
      for (const e of edits) {
        buf = buf.slice(0, e.start) + e.replacement + buf.slice(e.end);
      }
      fs.writeFileSync(mealPlansPath, buf, 'utf8');
      console.log(`✅ Uppdaterade ${edits.length} länkar i mealPlans.ts`);
      edits.slice(0, 10).forEach(e => console.log(`- ${e.fromName} → ${e.toSlug} (score ${e.score})`));
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
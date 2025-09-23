const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(s) { return normalize(s).replace(/\s+/g, '-'); }
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function mergeNutrition(db, incoming) {
  const base = (typeof db === 'string') ? (()=>{ try{return JSON.parse(db);}catch{return {};}})() : (db || {});
  const out = { ...base };
  const keys = ['calories','protein','carbohydrates','fat','fiber'];
  for (const k of keys) if (incoming[k] != null) out[k] = incoming[k];
  return out;
}

async function ensureUniqueSlug(prisma, desired) {
  let slug = desired, n = 1;
  while (true) {
    const exists = await prisma.recipe.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) return slug;
    n += 1; slug = `${desired}-auto-${n}`;
  }
}

async function run() {
  const prisma = new PrismaClient();
  const report = { updated: [], created: [], skipped: [] };
  try {
    const jsonPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(process.cwd(), 'public', 'week_manual_parsed.json');
    console.log(`🚀 Apply från JSON: ${jsonPath}`);
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

    const dbRecipes = await prisma.recipe.findMany({ select: { id: true, title: true, slug: true, servings: true, nutrition: true } });
    const idx = dbRecipes.map(r => ({ key: normalize(r.title), ...r }));

    for (const man of json) {
      const key = normalize(man.title);
      let best = idx.find(x => x.key === key) || null;
      if (!best) {
        let cand = { it: null, d: Infinity };
        for (const x of idx) {
          const d = levenshtein(key, x.key);
          if (d < cand.d) cand = { it: x, d };
        }
        const threshold = Math.ceil(Math.max(key.length, (cand.it?.key || '').length) * 0.25);
        if (cand.it && cand.d <= threshold) best = cand.it;
      }
      if (best) {
        const nextNutrition = mergeNutrition(best.nutrition, man.nutrition);
        const nextServings = man.servings ?? best.servings ?? null;
        const changed = (JSON.stringify(nextNutrition) !== JSON.stringify(best.nutrition)) || (nextServings !== (best.servings ?? null));
        if (!changed) { report.skipped.push({ title: best.title }); continue; }
        await prisma.recipe.update({ where: { slug: best.slug }, data: { nutrition: nextNutrition, servings: nextServings } });
        report.updated.push({ title: best.title, slug: best.slug });
        console.log(`✅ Uppdaterade: ${best.title}`);
      } else {
        const desired = slugify(man.title);
        const slug = await ensureUniqueSlug(prisma, desired);
        const created = await prisma.recipe.create({ data: { title: man.title, slug, servings: man.servings ?? undefined, nutrition: mergeNutrition({}, man.nutrition), status: 'PUBLISHED', isFree: true, isPremium: false, categories: ['basic'], tags: ['auto-week-import-2025-09'] }, select: { title: true, slug: true } });
        report.created.push(created);
        console.log(`➕ Skapade nytt recept: ${created.title}`);
      }
    }

    const out = path.join(process.cwd(), 'public', 'APPLY_WEEK_FROM_JSON_REPORT.json');
    fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📄 Rapport: ${out}`);
    console.log(`Uppdaterade: ${report.updated.length}, Skapade: ${report.created.length}, Skippade: ${report.skipped.length}`);
  } catch (e) {
    console.error('❌ Misslyckades:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();

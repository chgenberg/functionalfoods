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

const STOP = new Set(['med','och','eller','fran','mot','utan','till','i','pa','av','for','som','en','ett','den','det','de','att','rester','fran','frysen']);
function tokenize(str) {
  return normalizeSv(str).split(' ').filter(w => w && !STOP.has(w));
}

const PROTEIN_TOKENS = [
  'kyckling','lax','torsk','tonfisk','tofu','halloumi','not','notfars','kottfars','kott','fars','flask','lamm','scampi','räkor','skaldjur','ägg','kalkon','biff','entrecote','burgare','hamburgare','jarpar','bullar','paj','gratang','gryta','sallad','soppa','omelett','smoothie','gröt','våffla','pannkaka','chiapudding','muffins','kaka','bar'
];

function extractProteinHints(text) {
  const toks = tokenize(text);
  return toks.filter(t => PROTEIN_TOKENS.includes(t));
}

function ingredientTokens(recipe) {
  const bag = new Set();
  const add = (v) => {
    tokenize(v || '').forEach(t => bag.add(t));
  };
  if (Array.isArray(recipe.ingredients)) recipe.ingredients.forEach(add);
  if (Array.isArray(recipe.ingredientsStructured)) {
    recipe.ingredientsStructured.forEach(i => add(i?.label || ''));
  }
  add(recipe.title || '');
  return bag;
}

async function main() {
  try {
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const content = fs.readFileSync(mealPlansPath, 'utf8');

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

    // Load recipes dict
    const recipes = await prisma.recipe.findMany({ select: { slug: true, title: true, ingredients: true, ingredientsStructured: true, tags: true } });
    const bySlug = new Map(recipes.map(r => [r.slug, r]));

    const issues = [];
    for (const e of entries) {
      if (!e.slug) {
        issues.push({ type: 'MISSING_LINK', name: e.name, link: e.link });
        continue;
      }
      const r = bySlug.get(e.slug);
      if (!r) {
        issues.push({ type: 'MISSING_RECIPE', name: e.name, slug: e.slug });
        continue;
      }
      // Similarity between meal name and recipe title
      const mealNameCore = e.name.replace(/\(.*?\)/g, '').replace(/rester/gi, '').trim();
      const normMeal = normalizeSv(mealNameCore);
      const normTitle = normalizeSv(r.title || '');
      let sim = 0;
      if (similarity) sim = similarity.compareTwoStrings(normMeal, normTitle); else {
        const A = new Set(normMeal.split(' '));
        const B = new Set(normTitle.split(' '));
        const inter = [...A].filter(x => B.has(x)).length;
        sim = inter / Math.max(1, Math.min(A.size, B.size));
      }

      // Protein/keyword hints
      const mealHints = new Set(extractProteinHints(e.name));
      const recipeBag = ingredientTokens(r);
      const recipeHasAnyHint = [...mealHints].some(h => recipeBag.has(h) || normalizeSv(r.title).includes(h));

      const lowSimilarity = sim < 0.45; // threshold
      const hintMismatch = mealHints.size > 0 && !recipeHasAnyHint;

      if (lowSimilarity || hintMismatch) {
        issues.push({ type: 'SUSPECT', name: e.name, slug: e.slug, recipeTitle: r.title, sim: sim.toFixed(2), mealHints: [...mealHints].join(','), hintMismatch });
      }
    }

    // Report
    const summary = {
      totalMeals: entries.length,
      missingLink: issues.filter(i => i.type === 'MISSING_LINK').length,
      missingRecipe: issues.filter(i => i.type === 'MISSING_RECIPE').length,
      suspect: issues.filter(i => i.type === 'SUSPECT').length
    };

    console.log('Audit summary:', summary);
    console.log('\nFlaggade poster (max 100):');
    issues.slice(0, 100).forEach(i => {
      if (i.type === 'SUSPECT') {
        console.log(`SUSPECT | sim=${i.sim} | hints=${i.mealHints}${i.hintMismatch ? ' [HINT_MISMATCH]' : ''} | ${i.name} -> ${i.slug} (${i.recipeTitle})`);
      } else if (i.type === 'MISSING_RECIPE') {
        console.log(`MISSING_RECIPE | ${i.name} -> ${i.slug}`);
      } else {
        console.log(`MISSING_LINK | ${i.name}`);
      }
    });

  } catch (err) {
    console.error('❌ Fel i audit:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 
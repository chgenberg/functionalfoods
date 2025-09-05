const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function includes(hay, needle) { return hay.toLowerCase().includes(needle.toLowerCase()); }

// Name → desired slug
const rules = [
  { match: 'ugnsbakad tomat med köttfärs', slug: 'kottfarsbiffar-stekt-blomkal' },
  { match: 'torskrygg med ägghack och sparris', slug: 'torsk-teriyaki-med-gronsaker' },
  { match: 'äggröra med rökt lax', slug: 'aggrora-lax-2' },
  { match: 'tropisk fruktsallad', slug: 'smoothie-smoothiebowl' },
  { match: 'kycklingpizza', slug: 'kesotortilla-med-tomat-pesto-och-kalkon' },
  { match: 'torsk med saffranssås', slug: 'panerad-torsk-med-blomkalsris' },
  { match: 'pestotorsk med capresesallad', slug: 'panerad-torsk-med-blomkalsris' },
  { match: 'varm tacosallad', slug: 'tacokyckling-med-blomkalssallad' },
  { match: 'hamburgare med fetaostkräm och rostad sötpotatis', slug: 'hamburgare-med-grekisk-sallad' },
  { match: 'paprikastekt torsk med linssallad och citronyoghurt', slug: 'torsk-teriyaki-med-gronsaker' }
];

async function main() {
  try {
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    let content = fs.readFileSync(mealPlansPath, 'utf8');

    const recipes = await prisma.recipe.findMany({ select: { slug: true } });
    const slugSet = new Set(recipes.map(r => r.slug));

    const pairRegex = /"name":\s*"([^"]+)"([\s\S]*?)"recipeLink":\s*"([^"]*)"/g;
    const edits = [];
    let m;
    while ((m = pairRegex.exec(content)) !== null) {
      const full = m[0];
      const idx = m.index;
      const name = m[1];
      const link = m[3] || '';
      const rule = rules.find(r => includes(name, r.match));
      if (!rule) continue;
      if (!slugSet.has(rule.slug)) continue; // only map to existing
      const newLink = `/kunskapsbank/recept/${rule.slug}`;
      if (link === newLink) continue; // already set
      const replaced = full.replace(link, newLink);
      edits.push({ start: idx, end: idx + full.length, replacement: replaced, from: name, to: rule.slug });
    }

    if (edits.length === 0) {
      console.log('✅ Inga refinements att applicera.');
    } else {
      edits.sort((a, b) => b.start - a.start);
      let buf = content;
      for (const e of edits) buf = buf.slice(0, e.start) + e.replacement + buf.slice(e.end);
      fs.writeFileSync(mealPlansPath, buf, 'utf8');
      console.log(`✅ Applicerade ${edits.length} refinements.`);
      edits.slice(0, 12).forEach(e => console.log(`- ${e.from} → ${e.to}`));
    }
  } catch (err) {
    console.error('❌ Fel i refinement:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function includes(hay, needle) { return hay.toLowerCase().includes(needle.toLowerCase()); }

// Name → desired slug
const rules = [
  { match: 'ugnsbakad tomat med köttfärs', slug: 'kottfarsbiffar-stekt-blomkal' },
  { match: 'torskrygg med ägghack och sparris', slug: 'torskrygg-med-agghack-och-sparris' },
  { match: 'turkiska lammfärsspett med raita och sallad', slug: 'turkiska-lammfarsspett-med-raita-och-sallad' },
  { match: 'kycklingfylld aubergine', slug: 'kycklingfylld-aubergine' },
  { match: 'torsk från mellanöstern', slug: 'torsk-fran-mellanostern' },
  { match: 'indisk laxgryta med röda linser', slug: 'indisk-laxgryta-med-roda-linser' },
  { match: 'tropisk fruktsallad', slug: 'tropisk-fruktsallad' },
  { match: 'kycklingpizza', slug: 'kycklingpizza' },
  { match: 'torsk med saffranssås', slug: 'torsk-med-saffranssas' },
  { match: 'pestotorsk med capresesallad', slug: 'pestotorsk-med-capresesallad' },
  { match: 'nötgryta med rotfrukter', slug: 'notgryta-med-rotfrukter' },
  { match: 'varm tacosallad', slug: 'varm-tacosallad' },
  { match: 'hamburgare med fetaostkräm och rostad sötpotatis', slug: 'hamburgare-med-fetaostkram-och-rostad-sotpotatis' },
  { match: 'paprikastekt torsk med linssallad och citronyoghurt', slug: 'paprikastekt-torsk-med-linssallad-och-citronyoghurt' },
  { match: 'ugnsbakade ägg med spenat', slug: 'ugnsbakade-agg-med-spenat' },
  { match: 'stekt kyckling med asiatisk tomatsallad', slug: 'stekt-kyckling-med-asiatisk-tomatsallad' },
  { match: 'bananpannkaka med pistagenötter och bär', slug: 'bananpannkakor-med-pistagenotter-och-bar' },
  { match: 'stekt ägg med kalkon och senapsmajonnäs', slug: 'stekt-agg-med-kalkon-och-senapsmajonnas' },
  { match: 'entrecote med sparris', slug: 'entrecote-med-sparris-och-artpesto' },
  { match: 'halstrad tonfisk med grönsaker och sesamdressing', slug: 'halstrad-tonfisk-med-gronsaker-och-sesamdressing' },
  { match: 'äggröra med rökt lax', slug: 'aggrora-lax-2' },
  { match: 'äggröra med kalkon och granatäpple', slug: 'aggrora-med-kalkon-och-granatapple' }
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
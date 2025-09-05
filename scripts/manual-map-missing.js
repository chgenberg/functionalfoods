const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function includes(name, needle) {
  return name.toLowerCase().includes(needle.toLowerCase());
}

const rules = [
  { match: 'laxburgare', slug: 'hamburgare-med-grekisk-sallad' },
  { match: 'torskrygg med ägghack', slug: 'panerad-torsk-med-blomkalsris' },
  { match: 'turkiska lammfärsspett', slug: 'grillspett-med-grekisk-sallad-och-morotstzatziki' },
  { match: 'kycklingfylld aubergine', slug: 'kycklingrullader-med-gorgonzola' },
  { match: 'högrevsburgare med hummus', slug: 'hamburgare-med-grekisk-sallad' },
  { match: 'torsk från mellanöstern', slug: 'asiatisk-torsk' },
  { match: 'indisk laxgryta', slug: 'laxfile-med-ratatouille' },
  { match: 'färgstark fetaostsallad', slug: 'laxsallad-med-fetaost' },
  { match: 'chokladbar med majskakor', slug: 'mandelkaka-med-med-choklad' },
  { match: 'torsk med saffranssås', slug: 'panerad-torsk-med-blomkalsris' },
  { match: 'pestotorsk med capresesallad', slug: 'torsk-teriyaki-med-gronsaker' },
  { match: 'nötgryta med rotfrukter', slug: 'biff-med-sotpotatis' },
  { match: 'varma grönsaker med halloumi', slug: 'tomatsoppa-med-halloumi' },
  { match: 'grönsakswok med kyckling', slug: 'poke-bowl-kyckling' },
  { match: 'kycklingfärsbiffar med vitlöksost', slug: 'kycklingfarstimbaler-med-farskost-och-sweet-chili' },
  { match: 'kycklingpizza', slug: 'kycklingburgare-papayasallad-sallad' },
  { match: 'varm tacosallad', slug: 'sotpotatissallad' },
  { match: 'ugnsbakade ägg med spenat', slug: 'omelett-ost-spenat' },
  { match: 'laxgratäng med blomkålsmos', slug: 'laxgratang-med-broccoli-och-scampi' },
  { match: 'kycklinggryta med röda linser', slug: 'kycklinggryta-fran-medelhavet' }
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
      let slug = '';
      if (link.includes('/kunskapsbank/recept/')) {
        const sm = link.match(/\/kunskapsbank\/recept\/([^\"\s]+)/);
        slug = sm ? sm[1] : '';
      }
      if (slug && slugSet.has(slug)) continue; // valid already

      const rule = rules.find(r => includes(name, r.match));
      if (!rule) continue;
      if (!slugSet.has(rule.slug)) continue; // safety: only map to existing slug

      const newLink = `/kunskapsbank/recept/${rule.slug}`;
      const replaced = full.replace(link, newLink);
      edits.push({ start: idx, end: idx + full.length, replacement: replaced, from: name, to: rule.slug });
    }

    if (edits.length === 0) {
      console.log('✅ Inga manuella ersättningar kunde appliceras.');
    } else {
      edits.sort((a, b) => b.start - a.start);
      let buf = content;
      for (const e of edits) buf = buf.slice(0, e.start) + e.replacement + buf.slice(e.end);
      fs.writeFileSync(mealPlansPath, buf, 'utf8');
      console.log(`✅ Applicerade ${edits.length} manuella ersättningar.`);
      edits.slice(0, 12).forEach(e => console.log(`- ${e.from} → ${e.to}`));
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
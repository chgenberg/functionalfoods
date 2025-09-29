const fs = require('fs');
const path = require('path');

function load(file) {
  return fs.readFileSync(file, 'utf8');
}

function save(file, content) {
  fs.writeFileSync(file, content, 'utf8');
}

function normalizeSlug(s) {
  return s
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function main() {
  const repoRoot = process.cwd();
  const mealPlansPath = path.join(repoRoot, 'app', 'data', 'mealPlans.ts');
  let src = load(mealPlansPath);

  // Map of common known wrong -> canonical slugs for Basics
  const corrections = new Map([
    ['/kunskapsbank/recept/tonfisksallad-apple-sallad', '/kunskapsbank/recept/tonfisksallad-med-apple'],
    ['/kunskapsbank/recept/squashspagetti-kottfarssas', '/kunskapsbank/recept/squashspagetti-med-kottfarssas'],
    ['/kunskapsbank/recept/laxfile-med-ratatouille', '/kunskapsbank/recept/het-ratatouille'],
    // Week 2+ common corrections from DB/API naming
    ['/kunskapsbank/recept/jordgubbar-mango-vit', '/kunskapsbank/recept/smoothiebowl-med-mango-och-jordgubbar'],
    ['/kunskapsbank/recept/laxsallad-med-vindruvor', '/kunskapsbank/recept/laxsallad-med-druvor'],
    ['/kunskapsbank/recept/agghack-kalkon', '/kunskapsbank/recept/agghack-med-kalkon'],
    ['/kunskapsbank/recept/omelett-bar', '/kunskapsbank/recept/ugnsomelett-med-keso-och-bar'],
    ['/kunskapsbank/recept/stek-torsk-med-bearnaisesas-och-haricot-verts', '/kunskapsbank/recept/stekt-torsk-med-bearnaisesas-och-haricots-verts'],
    ['/kunskapsbank/recept/stekt-agg-lax-2', '/kunskapsbank/recept/stekt-agg-med-champinjoner-2']
  ]);

  let changes = 0;
  for (const [from, to] of corrections) {
    if (src.includes(from)) {
      src = src.split(from).join(to);
      changes++;
    }
  }

  if (changes > 0) {
    save(mealPlansPath, src);
    console.log(`Applied ${changes} Basic slug corrections in mealPlans.ts`);
  } else {
    console.log('No Basic slug corrections applied (already canonical).');
  }
}

main();



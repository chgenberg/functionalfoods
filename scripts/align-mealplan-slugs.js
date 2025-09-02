const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');
const stringSimilarity = require('string-similarity');

const prisma = new PrismaClient();

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[éèêë]/g, 'e')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  try {
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const src = await fs.readFile(mealPlansPath, 'utf-8');

    // Extract all (name, slug) pairs from both mealPlans and flowMealPlans
    const pairRegex = /\{\s*"name":\s*"([^"]+)"[\s\S]*?"recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g;
    const pairs = [];
    let m;
    while ((m = pairRegex.exec(src)) !== null) {
      const name = m[1];
      const slug = m[2];
      pairs.push({ name, slug });
    }

    console.log(`Found ${pairs.length} meal items with recipeLink slugs.`);

    // Load all recipes
    const recipes = await prisma.recipe.findMany({});
    const existingSlugs = new Set(recipes.map(r => r.slug));
    const titleIndex = new Map(); // normalized title -> recipes with that title
    for (const r of recipes) {
      const key = normalize(r.title);
      if (!titleIndex.has(key)) titleIndex.set(key, []);
      titleIndex.get(key).push(r);
    }

    let updated = 0;
    let alreadyOk = 0;
    const unresolved = [];

    for (const { name, slug } of pairs) {
      // Skip leftovers entries if present in data
      if (/rester/i.test(name)) {
        alreadyOk++;
        continue;
      }

      // If slug already exists (including from earlier updates), consider it OK
      if (existingSlugs.has(slug)) {
        alreadyOk++;
        continue;
      }

      const key = normalize(name);
      const candidates = titleIndex.get(key) || [];
      if (candidates.length === 1) {
        const r = candidates[0];
        try {
          await prisma.recipe.update({ where: { id: r.id }, data: { slug } });
          updated++;
          existingSlugs.add(slug);
          console.log(`Updated slug -> '${slug}' for title '${r.title}'.`);
          continue;
        } catch (e) {
          console.warn(`Failed to update slug for '${r.title}': ${e.message}`);
        }
      }

      // Fallback: fuzzy match by title among all recipes
      const titles = recipes.map(r => r.title);
      const matches = stringSimilarity.findBestMatch(name, titles);
      const best = matches.bestMatch;
      if (best && best.rating >= 0.6) {
        const r = recipes.find(x => x.title === best.target);
        if (r) {
          try {
            await prisma.recipe.update({ where: { id: r.id }, data: { slug } });
            updated++;
            existingSlugs.add(slug);
            console.log(`Updated via fuzzy match -> '${slug}' for title '${r.title}' (score ${best.rating.toFixed(2)}).`);
            continue;
          } catch (e) {
            console.warn(`Failed to update slug for '${r.title}': ${e.message}`);
          }
        }
      }

      unresolved.push({ name, slug });
    }

    console.log('\nSummary');
    console.log(`- Already matched: ${alreadyOk}`);
    console.log(`- Updated slugs:   ${updated}`);
    console.log(`- Unresolved:      ${unresolved.length}`);
    if (unresolved.length) {
      console.log('\nUnresolved items (need manual review):');
      for (const u of unresolved.slice(0, 50)) {
        console.log(`  name='${u.name}' -> slug='${u.slug}'`);
      }
      if (unresolved.length > 50) console.log(`  ...and ${unresolved.length - 50} more`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 
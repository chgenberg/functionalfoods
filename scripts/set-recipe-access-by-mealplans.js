const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

function extractSection(src, startMarker, endMarker) {
  const start = src.indexOf(startMarker);
  if (start === -1) return '';
  const end = endMarker ? src.indexOf(endMarker, start) : -1;
  return src.substring(start, end === -1 ? src.length : end);
}

function extractPairsFrom(src) {
  const pairRegex = /\{\s*"name":\s*"([^"]+)"[\s\S]*?"recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g;
  const set = new Set();
  let m;
  while ((m = pairRegex.exec(src)) !== null) {
    const slug = m[2];
    if (/rester/i.test(m[1])) continue;
    set.add(slug);
  }
  return set;
}

async function main() {
  try {
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    const src = await fs.readFile(mealPlansPath, 'utf-8');

    const basicsSection = extractSection(src, 'export const mealPlans', 'export const flowMealPlans');
    const flowSection = extractSection(src, 'export const flowMealPlans', null);

    const basicsSlugs = extractPairsFrom(basicsSection);
    const flowSlugs = extractPairsFrom(flowSection);

    console.log(`Basics slugs: ${basicsSlugs.size}, Flow slugs: ${flowSlugs.size}`);

    // Default all recipes to free/open
    console.log('Setting all recipes to free/open and clearing tags...');
    await prisma.recipe.updateMany({
      data: { isPremium: false, isFree: true, tags: [] }
    });

    // Update Basics -> premium false? premium true
    if (basicsSlugs.size > 0) {
      console.log('Marking Basics recipes as premium and tagging Basic...');
      const basics = Array.from(basicsSlugs);
      // Fetch to merge tags properly per row
      const basicsRecipes = await prisma.recipe.findMany({ where: { slug: { in: basics } } });
      for (const r of basicsRecipes) {
        const newTags = Array.from(new Set([...(r.tags || []), 'Basic']));
        await prisma.recipe.update({ where: { id: r.id }, data: { isPremium: true, isFree: false, tags: newTags } });
      }
    }

    // Update Flow -> premium and tag Flow
    if (flowSlugs.size > 0) {
      console.log('Marking Flow recipes as premium and tagging Flow...');
      const flows = Array.from(flowSlugs);
      const flowRecipes = await prisma.recipe.findMany({ where: { slug: { in: flows } } });
      for (const r of flowRecipes) {
        const newTags = Array.from(new Set([...(r.tags || []), 'Flow']));
        await prisma.recipe.update({ where: { id: r.id }, data: { isPremium: true, isFree: false, tags: newTags } });
      }
    }

    const counts = {
      total: await prisma.recipe.count(),
      premium: await prisma.recipe.count({ where: { isPremium: true } }),
      free: await prisma.recipe.count({ where: { isFree: true } }),
      basicsTagged: await prisma.recipe.count({ where: { tags: { has: 'Basic' } } }),
      flowTagged: await prisma.recipe.count({ where: { tags: { has: 'Flow' } } }),
    };

    console.log('Done.');
    console.log(counts);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 
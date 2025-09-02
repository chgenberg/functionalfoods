const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

function normalizeSwedish(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[éèêë]/g, 'e')
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function createSlug(title) {
  return normalizeSwedish(title)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseTSV(content) {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
  const headers = lines[0].split('\t');
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] !== undefined ? cols[idx] : '';
    });
    rows.push(row);
  }
  return rows;
}

function buildMealPlanSlugMap(mealPlansSource) {
  const map = new Map(); // normalized name -> slug
  // Regex to pair name with nearby recipeLink
  const regex = /"name":\s*"([^"]+)"[\s\S]*?"recipeLink":\s*"\/kunskapsbank\/recept\/([^"]+)"/g;
  let m;
  while ((m = regex.exec(mealPlansSource)) !== null) {
    const name = m[1];
    const slug = m[2];
    const key = normalizeSwedish(name);
    if (!map.has(key)) map.set(key, slug);
  }
  return map;
}

function ensureUniqueSlug(baseSlug, usedSlugs) {
  let slug = baseSlug;
  let counter = 2;
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }
  usedSlugs.add(slug);
  return slug;
}

function findMatchingImage(title, availableImages) {
  if (!title || availableImages.length === 0) return null;
  const normalizedTitle = normalizeSwedish(title)
    .replace(/\s+/g, '_');

  // exact
  const exact = availableImages.find(img => {
    const base = img.replace(/\.(jpg|jpeg|png|webp)$/i, '')
      .toLowerCase()
      .replace(/[åäà]/g, 'a')
      .replace(/[öø]/g, 'o')
      .replace(/[ü]/g, 'u')
      .replace(/[éèêë]/g, 'e')
      .replace(/[^a-z0-9_]/g, '')
      .trim();
    return base === normalizedTitle.replace(/[^a-z0-9_]/g, '');
  });
  if (exact) return `/Recept_complete/images/${exact}`;

  // fuzzy on words
  const words = normalizedTitle.split('_').filter(w => w.length > 2);
  const good = availableImages.find(img => {
    const base = img.replace(/\.(jpg|jpeg|png|webp)$/i, '')
      .toLowerCase()
      .replace(/[åäà]/g, 'a')
      .replace(/[öø]/g, 'o')
      .replace(/[ü]/g, 'u')
      .replace(/[éèêë]/g, 'e')
      .replace(/[^a-z0-9_]/g, '');
    const matches = words.filter(w => base.includes(w));
    return matches.length >= Math.min(2, words.length);
  });
  if (good) return `/Recept_complete/images/${good}`;

  const single = availableImages.find(img => {
    const base = img.replace(/\.(jpg|jpeg|png|webp)$/i, '')
      .toLowerCase()
      .replace(/[åäà]/g, 'a')
      .replace(/[öø]/g, 'o')
      .replace(/[ü]/g, 'u')
      .replace(/[éèêë]/g, 'e')
      .replace(/[^a-z0-9_]/g, '');
    return words.some(w => base.includes(w) && w.length > 4);
  });
  if (single) return `/Recept_complete/images/${single}`;

  return null;
}

async function main() {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('Warning: DATABASE_URL is not set. This script requires database access.');
    }

    const recipesCsvPath = path.join(process.cwd(), 'public', 'Recept_complete', 'recipes.csv');
    const ingredientsCsvPath = path.join(process.cwd(), 'public', 'Recept_complete', 'ingredients.csv');
    const imagesDir = path.join(process.cwd(), 'public', 'Recept_complete', 'images');
    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');

    console.log('Reading CSVs and assets...');
    const [recipesCsv, ingredientsCsv, mealPlansSrc] = await Promise.all([
      fsp.readFile(recipesCsvPath, 'utf-8'),
      fsp.readFile(ingredientsCsvPath, 'utf-8'),
      fsp.readFile(mealPlansPath, 'utf-8'),
    ]);

    let imageFiles = [];
    try {
      imageFiles = await fsp.readdir(imagesDir);
      imageFiles = imageFiles.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
      console.log(`Found ${imageFiles.length} images`);
    } catch (e) {
      console.warn('Could not read images directory:', e.message);
    }

    const mealSlugMap = buildMealPlanSlugMap(mealPlansSrc);

    const recipesRows = parseTSV(recipesCsv);
    const ingredientsRows = parseTSV(ingredientsCsv);

    // Build ingredients by post_id map
    const ingredientsByPostId = new Map();
    for (const row of ingredientsRows) {
      const key = row.post_id;
      if (!ingredientsByPostId.has(key)) ingredientsByPostId.set(key, []);
      const label = (row.ingredient_label || '').trim();
      if (label) {
        ingredientsByPostId.get(key).push(label);
      }
    }

    console.log('Deleting existing recipes...');
    await prisma.recipe.deleteMany({});

    console.log(`Importing ${recipesRows.length} recipes...`);
    let imported = 0;
    let failed = 0;
    const usedSlugs = new Set();

    for (const row of recipesRows) {
      const title = (row.title || '').trim();
      if (!title) continue;

      const normalizedName = normalizeSwedish(title);
      const slugFromPlans = mealSlugMap.get(normalizedName);
      const baseSlug = slugFromPlans || createSlug(title);
      const slug = ensureUniqueSlug(baseSlug, usedSlugs);

      const excerpt = (row.benefit_text || '').trim();
      const instructions = (row.gor_sa_har_text || '').trim();
      const postId = row.post_id;
      const ingredients = ingredientsByPostId.get(postId) || [];

      const imageUrl = findMatchingImage(title, imageFiles);

      const searchText = [title, excerpt, ingredients.join(' ')].join(' ').slice(0, 10000);

      try {
        await prisma.recipe.create({
          data: {
            title,
            slug,
            excerpt,
            content: instructions, // store full text as content
            imageUrl,
            imageAlt: title,
            categories: [],
            ingredients,
            instructions, // also in instructions field
            difficulty: null,
            prepTime: null,
            cookTime: null,
            totalTime: null,
            servings: null,
            nutrition: null,
            tips: null,
            tags: [],
            status: 'PUBLISHED',
            isPremium: false,
            isFree: true,
            searchText,
          },
        });
        imported++;
        if (imported % 25 === 0) console.log(`Imported ${imported}...`);
      } catch (e) {
        console.error(`Failed to import '${title}' (${slug}):`, e.message);
        failed++;
      }
    }

    const total = await prisma.recipe.count();
    console.log('Done.');
    console.log(`Imported: ${imported}, Failed: ${failed}, Total in DB: ${total}`);
  } catch (err) {
    console.error('Import error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 
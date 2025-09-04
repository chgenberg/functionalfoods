/*
  Import UD recipes from CSVs under public/UD_recept_complete
  - recipes_ulrika.csv and ingredients_ulrika.csv
  - fuzzy match images in subfolder(s)
  - mark recipes as admin-only via tags: ['ADMIN_ONLY','UD'] and premium-only
*/

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const similarity = require('string-similarity');

const prisma = new PrismaClient();

function normalizeSwedish(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toSlug(title) {
  return normalizeSwedish(title)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ensureUniqueSlug(base, used) {
  let slug = base;
  let i = 2;
  while (used.has(slug)) {
    slug = `${base}-${i++}`;
  }
  used.add(slug);
  return slug;
}

async function readCsvAuto(filePath) {
  const text = await fsp.readFile(filePath, 'utf8');
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];
  // Detect delimiter by header
  const header = lines[0];
  const delimiters = [',',';','\t'];
  const delim = delimiters.reduce((best, d) => {
    const count = (header.match(new RegExp(`\\${d}`, 'g')) || []).length;
    return count > best.count ? { d, count } : best;
  }, { d: ',', count: -1 }).d;

  const cols = header.split(delim).map(s => s.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(delim);
    if (parts.length === 1 && parts[0].trim() === '') continue;
    const obj = {};
    cols.forEach((c, idx) => {
      obj[c] = (parts[idx] || '').trim();
    });
    rows.push(obj);
  }
  return rows;
}

async function listAllImagesRecursively(rootDir) {
  const out = [];
  async function walk(dir) {
    let entries = [];
    try { entries = await fsp.readdir(dir, { withFileTypes: true }); } catch (e) { return; }
    for (const ent of entries) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) await walk(p);
      else if (/\.(jpe?g|png|webp)$/i.test(ent.name)) out.push(p);
    }
  }
  await walk(rootDir);
  return out;
}

function bestImageMatch(title, imagePaths) {
  if (!title || imagePaths.length === 0) return null;
  const target = normalizeSwedish(title);
  const candidates = imagePaths.map(p => ({
    path: p,
    name: normalizeSwedish(path.basename(p).replace(/\.(jpe?g|png|webp)$/i, ''))
  }));
  // Exact name contains check first
  let exact = candidates.find(c => c.name === target || c.name.includes(target) || target.includes(c.name));
  if (exact) return exact.path;
  // Fuzzy best match
  const matches = similarity.findBestMatch(target, candidates.map(c => c.name));
  if (matches.bestMatch.rating >= 0.55) {
    const idx = matches.ratings.findIndex(r => r.target === matches.bestMatch.target);
    return candidates[idx].path;
  }
  return null;
}

async function main() {
  try {
    const baseDir = path.join(process.cwd(), 'public', 'UD_recept_complete');
    const recipesCsvPath = path.join(baseDir, 'recipes_ulrika.csv');
    const ingredientsCsvPath = path.join(baseDir, 'ingredients_ulrika.csv');

    const imagesDir = baseDir; // images live in a subfolder under baseDir; we will scan recursively

    console.log('📥 Läser källor...');
    const [recipesRows, ingredientsRows, imagePaths] = await Promise.all([
      readCsvAuto(recipesCsvPath),
      readCsvAuto(ingredientsCsvPath),
      listAllImagesRecursively(imagesDir)
    ]);

    console.log(`📄 Recept-rader: ${recipesRows.length}`);
    console.log(`🥗 Ingrediens-rader: ${ingredientsRows.length}`);
    console.log(`🖼️ Bilder funna: ${imagePaths.length}`);

    // Group ingredients by a key present in both CSVs (guess common keys)
    // Try post_id, recipe_id, or title as fallback
    const ingredientGroups = new Map();
    for (const row of ingredientsRows) {
      const key = row.post_id || row.recipe_id || row.recipeId || row.slug || row.title;
      if (!key) continue;
      if (!ingredientGroups.has(key)) ingredientGroups.set(key, []);
      ingredientGroups.get(key).push(row);
    }

    let imported = 0, failed = 0, updated = 0;
    const usedSlugs = new Set();

    for (const row of recipesRows) {
      try {
        const title = (row.title || row.namn || row.name || '').trim();
        if (!title) continue;

        const baseSlug = toSlug(title);
        const slug = ensureUniqueSlug(baseSlug, usedSlugs);

        const excerpt = (row.excerpt || row.summary || row.intro || '').trim() || null;
        const instructions = (row.instructions || row['gor_sa_har_text'] || row.description || '').trim() || null;
        const servings = row.servings ? parseInt(row.servings) : (row.portioner ? parseInt(row.portioner) : null);

        // Collect ingredients for this recipe
        const groupKey = row.post_id || row.recipe_id || row.recipeId || row.slug || row.title;
        const ingRows = ingredientGroups.get(groupKey) || [];
        const ingredientLabels = ingRows.map(i => (i.label || i.ingredient || i.name || '').trim()).filter(Boolean);

        // Structured ingredients if present
        const ingredientsStructured = ingRows.map(i => ({
          label: (i.label || i.ingredient || i.name || '').trim(),
          baseAmount: i.amount ? Number(i.amount.replace(',', '.')) : null,
          baseUnit: (i.unit || i.enhet || '').trim() || null,
          finalAmount: i.amount ? Number(i.amount.replace(',', '.')) : null,
          finalUnit: (i.unit || i.enhet || '').trim() || null
        }));

        // Match image
        const matchedImagePath = bestImageMatch(title, imagePaths);
        const publicImageUrl = matchedImagePath 
          ? matchedImagePath.replace(path.join(process.cwd(), 'public'), '').replace(/\\/g, '/')
          : null;

        const data = {
          title,
          slug,
          excerpt,
          content: instructions,
          imageUrl: publicImageUrl,
          imageAlt: title,
          categories: [],
          ingredients: ingredientLabels,
          ingredientsStructured,
          instructions,
          servings: isFinite(servings) ? servings : null,
          status: 'PUBLISHED',
          isPremium: true,
          isFree: false,
          tips: row.tips || null,
          tags: ['ADMIN_ONLY','UD'],
          searchText: [title, excerpt || '', ingredientLabels.join(' ')].join(' ').slice(0, 10000)
        };

        const existing = await prisma.recipe.findUnique({ where: { slug } });
        if (existing) {
          await prisma.recipe.update({ where: { slug }, data });
          updated++;
        } else {
          await prisma.recipe.create({ data });
          imported++;
        }
        if ((imported + updated) % 50 === 0) console.log(`↻ Bearbetat: ${imported + updated}`);
      } catch (e) {
        console.error('❌ Importfel för rad:', e.message);
        failed++;
      }
    }

    const total = await prisma.recipe.count();
    const adminOnly = await prisma.recipe.count({ where: { tags: { has: 'ADMIN_ONLY' } } });

    console.log('\n✅ Klart!');
    console.log(`Importerade: ${imported}, Uppdaterade: ${updated}, Misslyckade: ${failed}`);
    console.log(`Totalt i DB: ${total}, ADMIN_ONLY: ${adminOnly}`);
  } catch (err) {
    console.error('🚨 Import error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 
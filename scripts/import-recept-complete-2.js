/*
  Import recipes from public/Recept_complete2.0
  - recipes.csv
  - ingredients.csv
  - images (all in one folder under Recept_complete2.0)
  Actions:
  - fuzzy-match images by title
  - upsert recipes by slug (update if exists, else create)
  - attach ingredientsStructured and ingredients labels
  - optimize image to webp (_optimized) when possible; fallback to original
  - tag with ['RC2'] for traceability; leave isPremium=false, isFree=true
*/

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
let similarity;
try { similarity = require('string-similarity'); } catch (e) { similarity = null; }
let sharp;
try { sharp = require('sharp'); } catch (e) { sharp = null; }

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
  // direct contains either way
  let exact = candidates.find(c => c.name === target || c.name.includes(target) || target.includes(c.name));
  if (exact) return exact.path;
  if (similarity) {
    const matches = similarity.findBestMatch(target, candidates.map(c => c.name));
    if (matches.bestMatch.rating >= 0.55) {
      const idx = matches.ratings.findIndex(r => r.target === matches.bestMatch.target);
      return candidates[idx].path;
    }
  }
  return null;
}

async function maybeOptimizeToWebp(absImagePath, publicRoot) {
  try {
    if (!sharp) return null;
    const relFromPublic = absImagePath.replace(publicRoot, '').replace(/\\/g, '/').replace(/^\//, '');
    const dir = path.dirname(relFromPublic);
    const base = path.basename(relFromPublic, path.extname(relFromPublic));
    const optimizedRel = path.join(dir, '_optimized', `${base}.webp`).replace(/\\/g, '/');
    const optimizedAbs = path.join(publicRoot, optimizedRel);
    await fsp.mkdir(path.dirname(optimizedAbs), { recursive: true });
    await sharp(absImagePath).webp({ quality: 80 }).toFile(optimizedAbs);
    return '/' + optimizedRel.replace(/\\/g, '/');
  } catch (e) {
    return null;
  }
}

async function main() {
  try {
    const baseDir = path.join(process.cwd(), 'public', 'Recept_complete2.0');
    const recipesCsvPath = path.join(baseDir, 'recipes.csv');
    const ingredientsCsvPath = path.join(baseDir, 'ingredients.csv');

    console.log('📥 Läser källor...');
    const [recipesRows, ingredientsRows, imagePaths] = await Promise.all([
      readCsvAuto(recipesCsvPath),
      readCsvAuto(ingredientsCsvPath),
      listAllImagesRecursively(baseDir)
    ]);

    console.log(`📄 Recept-rader: ${recipesRows.length}`);
    console.log(`🥗 Ingrediens-rader: ${ingredientsRows.length}`);
    console.log(`🖼️ Bilder funna: ${imagePaths.length}`);

    // group ingredients by a key present in both files
    const ingredientGroups = new Map();
    for (const row of ingredientsRows) {
      const key = row.post_id || row.recipe_id || row.recipeId || row.slug || row.title || row.name || row.id;
      if (!key) continue;
      if (!ingredientGroups.has(key)) ingredientGroups.set(key, []);
      ingredientGroups.get(key).push(row);
    }

    // Preload existing recipes to avoid slug collisions by updating existing when possible
    const existingRecipes = await prisma.recipe.findMany({ select: { id: true, slug: true, title: true } });
    const slugToId = new Map(existingRecipes.map(r => [r.slug, r.id]));

    let imported = 0, updated = 0, failed = 0;
    const usedSlugs = new Set(existingRecipes.map(r => r.slug));
    const publicRoot = path.join(process.cwd(), 'public');

    for (const row of recipesRows) {
      try {
        const title = (row.title || row.namn || row.name || '').trim();
        if (!title) continue;

        const baseSlug = toSlug(title);
        const slug = slugToId.has(baseSlug) ? baseSlug : ensureUniqueSlug(baseSlug, usedSlugs);

        const excerpt = (row.excerpt || row.summary || row.intro || '').trim() || null;
        const instructions = (row.instructions || row['gor_sa_har_text'] || row.description || row.method || '').trim() || null;
        const servings = row.servings ? parseInt(row.servings) : (row.portioner ? parseInt(row.portioner) : null);

        const groupKey = row.post_id || row.recipe_id || row.recipeId || row.slug || row.title || row.name || row.id;
        const ingRows = ingredientGroups.get(groupKey) || [];
        const ingredientLabels = ingRows.map(i => (i.label || i.ingredient || i.name || '').trim()).filter(Boolean);

        const ingredientsStructured = ingRows.map(i => ({
          label: (i.label || i.ingredient || i.name || '').trim(),
          baseAmount: i.amount ? Number(String(i.amount).replace(',', '.')) : null,
          baseUnit: (i.unit || i.enhet || '').trim() || null,
          finalAmount: i.amount ? Number(String(i.amount).replace(',', '.')) : null,
          finalUnit: (i.unit || i.enhet || '').trim() || null
        }));

        const matchedImagePath = bestImageMatch(title, imagePaths);
        let publicImageUrl = null;
        if (matchedImagePath) {
          const optimized = await maybeOptimizeToWebp(matchedImagePath, publicRoot);
          if (optimized) publicImageUrl = optimized;
          else publicImageUrl = matchedImagePath.replace(publicRoot, '').replace(/\\/g, '/');
        }

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
          isPremium: false,
          isFree: true,
          tips: row.tips || null,
          tags: ['RC2'],
          searchText: [title, excerpt || '', ingredientLabels.join(' ')].join(' ').slice(0, 10000)
        };

        if (slugToId.has(slug)) {
          await prisma.recipe.update({ where: { id: slugToId.get(slug) }, data });
          updated++;
        } else {
          const created = await prisma.recipe.create({ data });
          slugToId.set(slug, created.id);
          updated += 0; imported++;
        }

        if ((imported + updated) % 50 === 0) console.log(`↻ Bearbetat: ${imported + updated}`);
      } catch (e) {
        console.error('❌ Importfel för rad:', e.message);
        failed++;
      }
    }

    const total = await prisma.recipe.count();
    const rc2 = await prisma.recipe.count({ where: { tags: { has: 'RC2' } } });

    console.log('\n✅ Klart!');
    console.log(`Importerade: ${imported}, Uppdaterade: ${updated}, Misslyckade: ${failed}`);
    console.log(`Totalt i DB: ${total}, RC2-tag: ${rc2}`);
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
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const sharp = require('sharp');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ROOT = process.cwd();
const PUBLIC_DIRS = [
  path.join(ROOT, 'public', 'Bilder_basic'),
  path.join(ROOT, 'public', 'Bilder_flow'),
  path.join(ROOT, 'public', 'Recept_complete', 'images'),
  path.join(ROOT, 'public', 'UD_recept_complete', 'images_ulrika'),
  path.join(ROOT, 'public', 'images')
];

const OUTPUT_SUBDIR = '_optimized';
const MAX_WIDTH = 1600; // px
const QUALITY = 78; // JPEG/WebP quality

function isImage(file) {
  return /\.(jpe?g|png|webp)$/i.test(file);
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true }).catch(() => {});
}

async function compressImage(inputPath) {
  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath);
  const outDir = path.join(dir, OUTPUT_SUBDIR);
  await ensureDir(outDir);

  const outWebp = path.join(outDir, base.replace(/\.(jpe?g|png)$/i, '.webp'));

  try {
    const img = sharp(inputPath);
    const meta = await img.metadata();

    const pipeline = img.resize({ width: meta.width && meta.width > MAX_WIDTH ? MAX_WIDTH : meta.width, withoutEnlargement: true })
      .webp({ quality: QUALITY });

    await pipeline.toFile(outWebp);
    const rel = outWebp.replace(path.join(ROOT, 'public'), '').replace(/\\/g, '/');
    return rel; // public-relative path of optimized image
  } catch (e) {
    console.error('Compress error for', inputPath, e.message);
    return null;
  }
}

async function walk(dir, out = []) {
  let entries = [];
  try { entries = await fsp.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === OUTPUT_SUBDIR) continue;
      await walk(p, out);
    } else if (isImage(p)) {
      out.push(p);
    }
  }
  return out;
}

async function updateDbImageUrls(optimizedMap) {
  // optimizedMap: original public-relative path -> optimized relative path
  const recipes = await prisma.recipe.findMany({ select: { id: true, imageUrl: true } });
  let updated = 0;
  for (const r of recipes) {
    if (!r.imageUrl) continue;
    const key = r.imageUrl; // already public-relative
    if (optimizedMap.has(key)) {
      await prisma.recipe.update({ where: { id: r.id }, data: { imageUrl: optimizedMap.get(key) } });
      updated++;
    }
  }
  console.log(`✅ Uppdaterade ${updated} recipe.imageUrl till optimerade kopior`);
}

async function main() {
  try {
    console.log('📦 Komprimerar bilder i public/...');
    const files = (await Promise.all(PUBLIC_DIRS.map(d => walk(d)))).flat();
    console.log(`🔍 Hittade ${files.length} bildfiler att utvärdera`);

    const optimizedMap = new Map();
    let processed = 0, skipped = 0;

    for (const file of files) {
      try {
        const stat = await fsp.stat(file);
        // Komprimera endast om > 900KB
        if (stat.size <= 900 * 1024) { skipped++; continue; }
        const rel = file.replace(path.join(ROOT, 'public'), '').replace(/\\/g, '/');
        const outRel = await compressImage(file);
        if (outRel) optimizedMap.set(rel, outRel);
        processed++;
        if (processed % 50 === 0) console.log(`↻ Bearbetat ${processed} bilder...`);
      } catch (e) {
        console.error('Fel vid fil', file, e.message);
      }
    }

    console.log(`\n✅ Klart! Komprimerade: ${processed}, Skippade: ${skipped}`);
    await updateDbImageUrls(optimizedMap);
  } catch (e) {
    console.error('🚨 Komprimering fel:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 
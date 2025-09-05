const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const prisma = new PrismaClient();

async function listFilesRecursive(rootDir) {
  const out = [];
  async function walk(dir) {
    let entries = [];
    try { entries = await fsp.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const ent of entries) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) await walk(p);
      else out.push(p);
    }
  }
  await walk(rootDir);
  return out;
}

async function main() {
  try {
    const publicRoot = path.join(process.cwd(), 'public');
    const baseDir = path.join(publicRoot, 'Recept_complete2.0');
    const imagesDir = path.join(baseDir, 'images');

    const [recipes, allFiles] = await Promise.all([
      prisma.recipe.findMany({ select: { imageUrl: true } }),
      listFilesRecursive(baseDir)
    ]);

    const usedAbs = new Set();
    for (const r of recipes) {
      const url = (r.imageUrl || '').trim();
      if (!url) continue;
      if (!url.startsWith('/')) continue;
      const abs = path.join(publicRoot, url.replace(/^\//, ''));
      usedAbs.add(abs);
    }

    let deleted = 0, kept = 0;
    for (const file of allFiles) {
      const rel = file.replace(publicRoot, '').replace(/\\/g, '/');
      const isCsv = /\/Recept_complete2\.0\/(recipes|ingredients)\.csv$/i.test(rel);

      const isImage = /\.(jpe?g|png|webp)$/i.test(file);
      const isInImagesFolder = file.startsWith(imagesDir);

      const shouldKeep = usedAbs.has(file);
      if (isCsv) {
        await fsp.unlink(file).catch(() => {});
        deleted++;
        continue;
      }
      // Remove any unreferenced image under Recept_complete2.0/images (including originals)
      if (isInImagesFolder && isImage && !shouldKeep) {
        await fsp.unlink(file).catch(() => {});
        deleted++;
      } else {
        kept++;
      }
    }

    console.log(`Prune done. Kept: ${kept}, Deleted: ${deleted}`);
  } catch (err) {
    console.error('❌ Prune error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main }; 
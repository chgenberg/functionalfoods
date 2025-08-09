const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await optimizeDir(p);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const tmpPath = path.join(dir, `${entry.name}.optimized`);
    try {
      // Read metadata to decide whether to resize
      const img = sharp(p);
      const meta = await img.metadata();
      const width = meta.width || 0;

      let pipeline = img;
      if (width > 1600) {
        pipeline = pipeline.resize({ width: 1600, withoutEnlargement: true });
      }

      if (ext === '.png') {
        // Convert PNG to JPEG to save size (no alpha expected for photos)
        await pipeline.jpeg({ quality: 75, mozjpeg: true }).toFile(tmpPath);
      } else {
        await pipeline.jpeg({ quality: 75, mozjpeg: true }).toFile(tmpPath);
      }

      // Replace original (keep original extension; if png, overwrite with JPEG content)
      await fs.rename(tmpPath, p);
      console.log('Optimized', p);
    } catch (e) {
      console.warn('Skip (failed):', p, e?.message);
      try { await fs.unlink(tmpPath); } catch {}
    }
  }
}

async function run() {
  const root = process.cwd();
  const target = path.join(root, 'public', 'kunskapsbank');
  await optimizeDir(target);
}

run().catch(e => { console.error(e); process.exit(1); }); 
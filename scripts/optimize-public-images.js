const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function walk(dir, out = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

async function optimizeFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return false;
  try {
    const stat = await fs.stat(file);
    if (stat.size < 150 * 1024) return false; // skip små filer

    const img = sharp(file);
    const meta = await img.metadata();

    let pipeline = img;
    const width = meta.width || 0;
    if (width > 1600) pipeline = pipeline.resize({ width: 1600, withoutEnlargement: true });

    const tmp = file + '.optimized';
    if (ext === '.png') {
      if (meta.hasAlpha) {
        // behåll alfa, komprimera PNG
        await pipeline.png({ compressionLevel: 9, palette: true }).toFile(tmp);
      } else {
        await pipeline.jpeg({ quality: 75, mozjpeg: true }).toFile(tmp);
      }
    } else {
      await pipeline.jpeg({ quality: 75, mozjpeg: true }).toFile(tmp);
    }

    const newStat = await fs.stat(tmp);
    // ersätt bara om filen blev mindre
    if (newStat.size < stat.size * 0.98) {
      await fs.rename(tmp, file);
      console.log('Optimized', path.relative(process.cwd(), file), `${(stat.size/1024/1024).toFixed(2)}MB -> ${(newStat.size/1024/1024).toFixed(2)}MB`);
      return true;
    } else {
      await fs.unlink(tmp);
      return false;
    }
  } catch (e) {
    console.warn('Skip (error)', file, e.message);
    try { await fs.unlink(file + '.optimized'); } catch {}
    return false;
  }
}

async function run() {
  const root = process.cwd();
  const publicDir = path.join(root, 'public');
  const files = await walk(publicDir);
  let optimized = 0;
  for (const f of files) {
    const ok = await optimizeFile(f);
    if (ok) optimized++;
  }
  console.log('Done. Optimized files:', optimized);
}

run().catch(e => { console.error(e); process.exit(1); }); 
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const OUTPUT_SUBDIR = '_optimized';

function isImage(file) { return /\.(jpe?g|png|webp)$/i.test(file); }

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

async function main() {
  const files = await walk(PUBLIC_DIR);
  let removed = 0, kept = 0;
  for (const file of files) {
    const dir = path.dirname(file);
    const base = path.basename(file);
    const stat = await fsp.stat(file).catch(() => null);
    if (!stat) continue;
    if (stat.size <= 900 * 1024) { kept++; continue; }
    const optimized = path.join(dir, OUTPUT_SUBDIR, base.replace(/\.(jpe?g|png)$/i, '.webp'));
    const exists = fs.existsSync(optimized);
    if (exists) {
      await fsp.unlink(file).catch(() => {});
      console.log('🗑️  Removed:', path.relative(ROOT, file));
      removed++;
    } else {
      kept++;
    }
  }
  console.log(`\n✅ Cleanup done. Removed: ${removed}, Kept: ${kept}`);
}

if (require.main === module) {
  main();
}

module.exports = { main }; 
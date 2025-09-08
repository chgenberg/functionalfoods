/*
  Run with: node scripts/normalize-images.js
*/
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(process.cwd(), 'public', 'Recept_complete2.0', 'images', '_optimized');
const MAP_PATH = path.join(process.cwd(), 'public', 'Recept_complete2.0', 'images', 'rename-map.json');

function slugify(base) {
  return base
    .replace(/[ÅÄåä]/g, 'a')
    .replace(/[Öö]/g, 'o')
    .replace(/[Üü]/g, 'u')
    .replace(/[ÉéÈèÊêËë]/g, 'e')
    .replace(/[ÁáÀàÂâÄä]/g, 'a')
    .replace(/[ÍíÌìÎîÏï]/g, 'i')
    .replace(/[ÓóÒòÔôÖö]/g, 'o')
    .replace(/[ÚúÙùÛûÜü]/g, 'u')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function main() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error('Images dir not found:', IMAGES_DIR);
    process.exit(1);
  }

  const files = fs.readdirSync(IMAGES_DIR).filter(f => f.toLowerCase().endsWith('.webp'));
  const mapping = {};
  const taken = new Set(fs.readdirSync(IMAGES_DIR).map(f => f.toLowerCase()));

  let renamed = 0;
  for (const file of files) {
    const base = file.replace(/\.[^/.]+$/, '');
    const slug = slugify(base) + '.webp';
    if (slug.toLowerCase() === file.toLowerCase()) continue;

    let target = slug;
    let counter = 1;
    while (taken.has(target.toLowerCase())) {
      const withoutExt = slug.replace(/\.webp$/i, '');
      target = `${withoutExt}-${counter}.webp`;
      counter += 1;
    }

    const src = path.join(IMAGES_DIR, file);
    const dst = path.join(IMAGES_DIR, target);
    fs.renameSync(src, dst);
    taken.add(target.toLowerCase());
    mapping[file] = target;
    renamed += 1;
    console.log(`Renamed: ${file} -> ${target}`);
  }

  fs.writeFileSync(MAP_PATH, JSON.stringify(mapping, null, 2), 'utf8');
  console.log(`\nDone. Renamed ${renamed} files. Mapping written to ${MAP_PATH}`);
}

main(); 
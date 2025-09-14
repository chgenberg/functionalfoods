/*
  Convert knowledge document images to WebP and update JSON references
  Run with: node scripts/convert-knowledge-images-to-webp.js
*/

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const ROOT = process.cwd();
const FLOW_DIR = path.join(ROOT, 'public', 'Kunskapsdokument', 'Functional Flow', 'Bilder');
const BASIC_DIR = path.join(ROOT, 'public', 'Kunskapsdokument', 'Functional Basics', 'Bilder');
const JSON_FLOW = path.join(ROOT, 'public', 'data', 'knowledge-documents-flow.json');
const JSON_BASIC = path.join(ROOT, 'public', 'data', 'knowledge-documents-basic.json');

function slugifyFilename(name) {
  const withoutExt = name.replace(/\.[^/.]+$/, '');
  return (
    withoutExt
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
      .toLowerCase()
  ) + '.webp';
}

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function convertDirToWebP(dir) {
  const entries = await fsp.readdir(dir);
  let converted = 0;

  for (const file of entries) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

    const inputPath = path.join(dir, file);
    const outputName = slugifyFilename(file);
    const outputPath = path.join(dir, outputName);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      continue;
    }

    try {
      await sharp(inputPath)
        .rotate()
        .webp({ quality: 82 })
        .toFile(outputPath);
      converted += 1;
      console.log(`  ✅ ${path.relative(ROOT, outputPath)}`);
    } catch (e) {
      console.error(`  ❌ Failed for ${file}:`, e.message);
    }
  }

  return converted;
}

function toWebPPath(originalPath) {
  // original like /Kunskapsdokument/Functional Flow/Bilder/Att-äta....jpg
  const dir = path.dirname(originalPath);
  const base = path.basename(originalPath);
  return `${dir}/${slugifyFilename(base)}`;
}

async function updateJsonReferences(jsonPath) {
  const raw = await fsp.readFile(jsonPath, 'utf-8');
  const docs = JSON.parse(raw);

  for (const doc of docs) {
    if (doc.headerImage) {
      doc.headerImage = toWebPPath(doc.headerImage);
    }
    if (Array.isArray(doc.relatedImages)) {
      doc.relatedImages = doc.relatedImages.map(toWebPPath);
    }
  }

  await fsp.writeFile(jsonPath, JSON.stringify(docs, null, 2), 'utf-8');
  console.log(`📝 Updated JSON references: ${path.basename(jsonPath)}`);
}

async function main() {
  console.log('🖼️ Converting knowledge images to WebP...');
  await ensureDir(FLOW_DIR);
  await ensureDir(BASIC_DIR);

  const flowCount = await convertDirToWebP(FLOW_DIR);
  const basicCount = await convertDirToWebP(BASIC_DIR);

  console.log(`✅ Converted: flow=${flowCount}, basic=${basicCount}`);

  console.log('🔗 Updating JSON references...');
  await updateJsonReferences(JSON_FLOW);
  await updateJsonReferences(JSON_BASIC);

  console.log('🎉 Done.');
}

// Dependency check
try {
  require('sharp');
  main().catch((e) => {
    console.error('Unexpected error:', e);
    process.exit(1);
  });
} catch (e) {
  console.error('Missing dependency. Run: npm install sharp');
  process.exit(1);
} 
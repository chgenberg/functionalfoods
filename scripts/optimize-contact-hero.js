const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function run() {
  const projectRoot = process.cwd();
  const srcPath = path.join(projectRoot, 'public', 'kontakta-oss', 'gronsallad.jpg');
  const tmpPath = path.join(projectRoot, 'public', 'kontakta-oss', 'gronsallad.optimized.jpg');

  try {
    await sharp(srcPath)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 75, mozjpeg: true })
      .toFile(tmpPath);

    await fs.rename(tmpPath, srcPath);
    console.log('Optimized hero image saved to', srcPath);
  } catch (err) {
    console.error('Image optimization failed:', err);
    process.exit(1);
  }
}

run(); 
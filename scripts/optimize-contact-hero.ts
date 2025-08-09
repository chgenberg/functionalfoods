import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

async function run() {
  const projectRoot = process.cwd();
  const srcPath = path.join(projectRoot, 'public', 'kontakta-oss', 'gronsallad.jpg');
  const tmpPath = path.join(projectRoot, 'public', 'kontakta-oss', 'gronsallad.optimized.jpg');

  try {
    // Läs in och optimera
    await sharp(srcPath)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 75, mozjpeg: true })
      .toFile(tmpPath);

    // Ersätt originalet
    await fs.rename(tmpPath, srcPath);
    console.log('Optimized hero image saved to', srcPath);
  } catch (err) {
    console.error('Image optimization failed:', err);
    process.exit(1);
  }
}

run(); 
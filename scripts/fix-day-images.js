const fs = require('fs');
const path = require('path');

function fixDayImages() {
  try {
    console.log('🖼️ Fixing dayImages.ts with correct image paths...');

    // Get available optimized images
    const basicImagesDir = 'public/Bilder_basic/_optimized';
    const flowImagesDir = 'public/Bilder_flow/_optimized';
    
    const basicImages = fs.existsSync(basicImagesDir) ? fs.readdirSync(basicImagesDir).filter(f => f.endsWith('.webp')) : [];
    const flowImages = fs.existsSync(flowImagesDir) ? fs.readdirSync(flowImagesDir).filter(f => f.endsWith('.webp')) : [];
    
    console.log(`Found ${basicImages.length} basic images and ${flowImages.length} flow images`);

    // Create a mapping of available images (use first 10 unique images for variety)
    const availableImages = [
      ...basicImages.slice(0, 7).map(img => `/Bilder_basic/_optimized/${img}`),
      ...flowImages.slice(0, 7).map(img => `/Bilder_flow/_optimized/${img}`)
    ].slice(0, 10);

    console.log('Available images:', availableImages);

    // Create new dayImages structure with existing images
    const newDayImages = {
      "1": {},
      "2": {},
      "3": {},
      "4": {},
      "5": {},
      "6": {}
    };

    // Assign images to each week/day
    for (let week = 1; week <= 6; week++) {
      for (let day = 1; day <= 7; day++) {
        // Use different images for variety, cycling through available images
        const imageIndex = ((week - 1) * 7 + (day - 1)) % availableImages.length;
        newDayImages[week.toString()][day.toString()] = availableImages[imageIndex] || null;
      }
    }

    // Generate the new dayImages.ts content
    const dayImagesContent = `export const dayImages: Record<string, Record<string, string | null>> = ${JSON.stringify(newDayImages, null, 2)};`;

    // Write to file
    const dayImagesPath = path.join(process.cwd(), 'app', 'data', 'dayImages.ts');
    fs.writeFileSync(dayImagesPath, dayImagesContent);

    console.log('✅ dayImages.ts updated successfully!');

    // Verify some images exist
    let existingCount = 0;
    let missingCount = 0;

    for (let week = 1; week <= 6; week++) {
      for (let day = 1; day <= 7; day++) {
        const imagePath = newDayImages[week.toString()][day.toString()];
        if (imagePath) {
          const fullPath = path.join(process.cwd(), 'public', imagePath.replace('/', ''));
          if (fs.existsSync(fullPath)) {
            existingCount++;
          } else {
            missingCount++;
            console.log(`⚠️ Missing: ${imagePath}`);
          }
        }
      }
    }

    console.log(`📊 Image verification: ${existingCount} exist, ${missingCount} missing`);

  } catch (error) {
    console.error('❌ Error fixing dayImages:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  fixDayImages();
}

module.exports = { fixDayImages }; 
const fs = require('fs');
const path = require('path');

function verifyAllThumbnails() {
  try {
    console.log('🔍 Verifying thumbnails for all courses...');

    // Read dayImages.ts
    const dayImagesPath = path.join(process.cwd(), 'app', 'data', 'dayImages.ts');
    const dayImagesContent = fs.readFileSync(dayImagesPath, 'utf8');
    
    // Extract the dayImages object (simple regex parsing)
    const match = dayImagesContent.match(/export const dayImages[^{]*(\{[\s\S]*\});/);
    if (!match) {
      throw new Error('Could not parse dayImages.ts');
    }

    const dayImages = JSON.parse(match[1]);
    console.log('📚 Loaded dayImages configuration');

    // Check all weeks 1-6 (used by all courses)
    const courses = ['basics', 'flow', 'energy'];
    const weeks = [1, 2, 3, 4, 5, 6];
    const days = [1, 2, 3, 4, 5, 6, 7];

    let totalThumbnails = 0;
    let existingThumbnails = 0;
    let missingThumbnails = 0;
    const missingImages = [];

    console.log('\n📊 Checking thumbnails for all courses:');

    for (const course of courses) {
      console.log(`\n🎓 Course: ${course.toUpperCase()}`);
      
      for (const week of weeks) {
        console.log(`  📅 Week ${week}:`);
        
        for (const day of days) {
          totalThumbnails++;
          const imagePath = dayImages[week.toString()]?.[day.toString()];
          
          if (imagePath) {
            const fullPath = path.join(process.cwd(), 'public', imagePath.startsWith('/') ? imagePath.substring(1) : imagePath);
            
            if (fs.existsSync(fullPath)) {
              existingThumbnails++;
              console.log(`    ✅ Day ${day}: ${path.basename(imagePath)}`);
            } else {
              missingThumbnails++;
              missingImages.push({ course, week, day, path: imagePath });
              console.log(`    ❌ Day ${day}: MISSING ${imagePath}`);
            }
          } else {
            missingThumbnails++;
            missingImages.push({ course, week, day, path: 'NO_PATH_DEFINED' });
            console.log(`    ⚠️  Day ${day}: NO IMAGE DEFINED`);
          }
        }
      }
    }

    console.log('\n📈 SUMMARY:');
    console.log(`Total thumbnails needed: ${totalThumbnails}`);
    console.log(`Existing thumbnails: ${existingThumbnails}`);
    console.log(`Missing thumbnails: ${missingThumbnails}`);

    if (missingThumbnails > 0) {
      console.log('\n❌ MISSING IMAGES:');
      missingImages.forEach(img => {
        console.log(`  ${img.course} Week ${img.week} Day ${img.day}: ${img.path}`);
      });
    }

    // Check available image pools
    console.log('\n🖼️ AVAILABLE IMAGE POOLS:');
    
    const basicDir = path.join(process.cwd(), 'public', 'Bilder_basic', '_optimized');
    const flowDir = path.join(process.cwd(), 'public', 'Bilder_flow', '_optimized');
    
    if (fs.existsSync(basicDir)) {
      const basicImages = fs.readdirSync(basicDir).filter(f => f.endsWith('.webp'));
      console.log(`  Bilder_basic/_optimized: ${basicImages.length} images`);
    }
    
    if (fs.existsSync(flowDir)) {
      const flowImages = fs.readdirSync(flowDir).filter(f => f.endsWith('.webp'));
      console.log(`  Bilder_flow/_optimized: ${flowImages.length} images`);
    }

    // Final verdict
    if (missingThumbnails === 0) {
      console.log('\n🎉 ALL THUMBNAILS ARE WORKING FOR ALL COURSES!');
      return true;
    } else {
      console.log(`\n⚠️ ${missingThumbnails} thumbnails need fixing`);
      return false;
    }

  } catch (error) {
    console.error('❌ Error verifying thumbnails:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  verifyAllThumbnails();
}

module.exports = { verifyAllThumbnails }; 
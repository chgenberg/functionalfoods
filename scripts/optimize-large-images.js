const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function optimizeLargeImages() {
  try {
    console.log('🖼️ Optimerar stora bilder för bättre Git performance...\n');
    
    // Hitta stora filer i public-mappen
    const publicDir = path.join(process.cwd(), 'public');
    
    // Använd find för att hitta filer större än 1MB
    const largeFiles = execSync(
      `find "${publicDir}" -type f \\( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.JPG" \\) -size +1M`,
      { encoding: 'utf8' }
    ).trim().split('\n').filter(Boolean);
    
    console.log(`🔍 Hittade ${largeFiles.length} stora bildfiler (>1MB)`);
    
    if (largeFiles.length === 0) {
      console.log('✅ Inga stora filer att optimera');
      return;
    }
    
    // Visa de största filerna
    console.log('\n📊 Största filer:');
    const fileSizes = largeFiles.map(file => {
      const stats = fs.statSync(file);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
      return { file, sizeMB: parseFloat(sizeMB) };
    }).sort((a, b) => b.sizeMB - a.sizeMB);
    
    fileSizes.slice(0, 10).forEach(({ file, sizeMB }) => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`   ${sizeMB.toString().padStart(6)}MB - ${relativePath}`);
    });
    
    // Räkna total storlek
    const totalSizeMB = fileSizes.reduce((sum, { sizeMB }) => sum + sizeMB, 0);
    console.log(`\n📦 Total storlek stora filer: ${totalSizeMB.toFixed(1)}MB`);
    
    // Föreslå lösningar
    console.log('\n💡 LÖSNINGAR FÖR GIT PUSH-PROBLEM:');
    console.log('1. 🗑️  Ta bort onödiga stora bilder');
    console.log('2. 📁 Flytta stora filer till .gitignore');
    console.log('3. 🔗 Använd externa bildtjänster (Cloudinary/AWS S3)');
    console.log('4. 📉 Komprimera bilder automatiskt');
    
    // Ta bort de allra största filerna som troligen inte behövs
    const veryLargeFiles = fileSizes.filter(f => f.sizeMB > 5);
    
    if (veryLargeFiles.length > 0) {
      console.log(`\n🗑️  FÖRSLAG: Ta bort ${veryLargeFiles.length} filer större än 5MB:`);
      veryLargeFiles.forEach(({ file, sizeMB }) => {
        const relativePath = path.relative(process.cwd(), file);
        console.log(`   rm "${relativePath}" # ${sizeMB}MB`);
      });
      
      console.log('\n🔧 Kör detta för att ta bort stora filer:');
      console.log('git rm ' + veryLargeFiles.map(f => `"${path.relative(process.cwd(), f.file)}"`).join(' '));
    }
    
  } catch (error) {
    console.error('❌ Fel:', error.message);
  }
}

if (require.main === module) {
  optimizeLargeImages();
}

module.exports = { optimizeLargeImages }; 
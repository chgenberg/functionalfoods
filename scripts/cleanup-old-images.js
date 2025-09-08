/*
  Cleanup old image directories that are no longer needed
  Run with: node scripts/cleanup-old-images.js
*/
const fs = require('fs');
const path = require('path');

// Directories to remove (old recipe image folders)
const DIRS_TO_REMOVE = [
  'public/Bilder_basic',
  'public/Bilder_flow', 
  'public/Recept_complete2.0',
  'public/Recept_complete',
  'public/Recept',
  'public/scraped_content_basic',
  'public/scraped_pages_basic'
];

// Directories to keep (important for site functionality)
const DIRS_TO_KEEP = [
  'public/recept_images_optimized', // Our new optimized images
  'public/images',                  // Site assets
  'public/kunskapsbank',           // Knowledge base assets  
  'public/kurser',                 // Course assets
  'public/Ulrika_portratt',        // Portrait images
  'public/kontakta-oss',           // Contact assets
  'public/leaflet',                // Map assets
  'public/uploads',                // User uploads
  'public/tests',                  // Test files
  'public/artiklar_2025',          // Articles
  'public/Blogginlagg',            // Blog posts
  'public/Hem',                    // Home page assets
  'public/Kostscheman_energy'      // Energy meal plans
];

function removeDirectory(dirPath) {
  try {
    if (fs.existsSync(dirPath)) {
      const stats = fs.statSync(dirPath);
      if (stats.isDirectory()) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`✅ Removed directory: ${dirPath}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`❌ Failed to remove ${dirPath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🧹 Starting cleanup of old image directories...\n');
  
  let removedCount = 0;
  let totalSize = 0;
  
  for (const dir of DIRS_TO_REMOVE) {
    const fullPath = path.join(process.cwd(), dir);
    
    if (fs.existsSync(fullPath)) {
      // Calculate directory size before removal
      try {
        const dirSize = getDirSize(fullPath);
        totalSize += dirSize;
        console.log(`📁 ${dir} (${(dirSize / 1024 / 1024).toFixed(2)} MB)`);
      } catch (e) {
        console.log(`📁 ${dir}`);
      }
      
      if (removeDirectory(fullPath)) {
        removedCount++;
      }
    } else {
      console.log(`⏭️  ${dir} (already removed)`);
    }
  }
  
  console.log('\n=== CLEANUP COMPLETE ===');
  console.log(`Removed: ${removedCount} directories`);
  console.log(`Space freed: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('\nKept directories:');
  DIRS_TO_KEEP.forEach(dir => {
    if (fs.existsSync(path.join(process.cwd(), dir))) {
      console.log(`✅ ${dir}`);
    }
  });
}

function getDirSize(dirPath) {
  let totalSize = 0;
  
  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        traverse(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  }
  
  traverse(dirPath);
  return totalSize;
}

main(); 
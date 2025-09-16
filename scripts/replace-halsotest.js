#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Word replacements mapping
const replacements = {
  'hälsoquiz': 'hälsoquiz',
  'Hälsoquiz': 'Hälsoquiz',
  'HÄLSOQUIZ': 'HÄLSOQUIZ',
  'hälsoquizet': 'hälsoquizet',
  'Hälsoquizet': 'Hälsoquizet',
  'HÄLSOQUIZET': 'HÄLSOQUIZET',
  'hälsoquizets': 'hälsoquizets',
  'Hälsoquizets': 'Hälsoquizets',
  'HÄLSOQUIZETS': 'HÄLSOQUIZETS'
};

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Apply all replacements
    for (const [oldWord, newWord] of Object.entries(replacements)) {
      if (newContent.includes(oldWord)) {
        // Use word boundaries to avoid partial replacements
        const regex = new RegExp(`\\b${escapeRegex(oldWord)}\\b`, 'g');
        const matches = newContent.match(regex);
        if (matches && matches.length > 0) {
          newContent = newContent.replace(regex, newWord);
          modified = true;
          console.log(`  - Replaced ${matches.length} instance(s) of "${oldWord}" with "${newWord}"`);
        }
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Helper function to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Main function
async function main() {
  console.log('🚀 Starting hälsoquiz → hälsoquiz replacement process...\n');
  
  // Find all relevant files (TSX, JSX, TS, JS, JSON, MD)
  const files = await glob('**/*.{tsx,jsx,ts,js,json,md}', {
    ignore: [
      'node_modules/**', 
      '.next/**', 
      'dist/**', 
      'build/**',
      '.git/**',
      'package-lock.json'
    ]
  });
  
  let processedCount = 0;
  let modifiedCount = 0;
  
  for (const file of files) {
    processedCount++;
    const wasModified = processFile(file);
    if (wasModified) {
      modifiedCount++;
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Files processed: ${processedCount}`);
  console.log(`   Files modified: ${modifiedCount}`);
  console.log(`   Replacements available: ${Object.keys(replacements).length}`);
  
  if (modifiedCount > 0) {
    console.log('\n🎉 Word replacement completed successfully!');
    console.log('💡 All instances of "hälsoquiz" have been replaced with "hälsoquiz"');
    console.log('📝 Remember to test your application after these changes');
  } else {
    console.log('\n✨ No instances of "hälsoquiz" found to replace.');
  }
}

// Run the script
main().catch(console.error); 
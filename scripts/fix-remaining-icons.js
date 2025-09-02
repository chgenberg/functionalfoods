#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Specific fixes for remaining errors
const fixes = [
  {
    file: 'app/dashboard/courses/functional-basics/goals/page.tsx',
    find: 'FiFlag',
    replace: 'Flag',
    addImport: 'Flag'
  },
  {
    file: 'app/dashboard/courses/functional-flow/goals/page.tsx', 
    find: 'FiFlag',
    replace: 'Flag',
    addImport: 'Flag'
  },
  {
    file: 'app/kunskapsbank/blogg/functional-foods/page.tsx',
    find: 'FiBookmark',
    replace: 'Bookmark', 
    addImport: 'Bookmark'
  },
  {
    file: 'app/kunskapsbank/blogg/longevity/page.tsx',
    find: 'FiBookmark',
    replace: 'Bookmark',
    addImport: 'Bookmark'
  },
  {
    file: 'app/dashboard/downloads/page.tsx',
    find: 'FileText',
    replace: 'FileText',
    addImport: 'FileText'
  }
];

function fixFile(fixConfig) {
  const filePath = path.join(process.cwd(), fixConfig.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fixConfig.file}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // Check if fix is needed
  if (content.includes(fixConfig.find)) {
    console.log(`🔧 Fixing: ${fixConfig.file}`);
    
    // Add import if needed
    if (fixConfig.addImport && !content.includes(fixConfig.addImport)) {
      const lucideImportRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"];?/;
      const match = content.match(lucideImportRegex);
      
      if (match) {
        const currentImports = match[1];
        const newImports = currentImports + ', ' + fixConfig.addImport;
        content = content.replace(lucideImportRegex, `import { ${newImports} } from 'lucide-react';`);
        hasChanges = true;
      }
    }
    
    // Replace usage
    const regex = new RegExp(`\\b${fixConfig.find}\\b`, 'g');
    content = content.replace(regex, fixConfig.replace);
    hasChanges = true;
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${fixConfig.file}`);
  }
  
  return hasChanges;
}

function main() {
  console.log('🔧 Fixing remaining icon errors...\n');
  
  let fixedCount = 0;
  
  fixes.forEach(fix => {
    if (fixFile(fix)) {
      fixedCount++;
    }
  });
  
  console.log(`\n🎉 Fixed ${fixedCount} files!`);
  console.log('🚀 Ready for build!');
}

if (require.main === module) {
  main();
} 
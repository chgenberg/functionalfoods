#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files that still have Fi icon references
function findRemainingErrors() {
  try {
    const result = execSync('grep -r "Fi[A-Z]" app/ --include="*.tsx" --include="*.ts"', { encoding: 'utf8' });
    return result.split('\n').filter(line => line.trim());
  } catch (error) {
    return [];
  }
}

// Global replacements for common patterns
const globalReplacements = [
  { from: /\bFiHeart\b/g, to: 'Heart' },
  { from: /\bFiPackage\b/g, to: 'Package' },
  { from: /\bFiFlag\b/g, to: 'Flag' },
  { from: /\bFiBookmark\b/g, to: 'Bookmark' },
  { from: /\bFiFileText\b/g, to: 'FileText' },
  { from: /\bFiSearch\b/g, to: 'Search' },
  { from: /\bFiArrowLeft\b/g, to: 'ArrowLeft' },
  { from: /\bFiChevronLeft\b/g, to: 'ChevronLeft' },
  { from: /\bFiChevronRight\b/g, to: 'ChevronRight' },
  { from: /\bFiLoader\b/g, to: 'Loader' },
  { from: /\bFiUser\b/g, to: 'User' },
  { from: /\bFiMail\b/g, to: 'Mail' },
  { from: /\bFiLock\b/g, to: 'Lock' },
  { from: /\bFiEye\b/g, to: 'Eye' },
  { from: /\bFiEyeOff\b/g, to: 'EyeOff' },
  { from: /\bFiSend\b/g, to: 'Send' },
  { from: /\bFiPhone\b/g, to: 'Phone' },
  { from: /\bFiMapPin\b/g, to: 'MapPin' },
  { from: /\bFiPlayCircle\b/g, to: 'PlayCircle' },
  { from: /\bFiPauseCircle\b/g, to: 'PauseCircle' },
  { from: /\bFiHeadphones\b/g, to: 'Headphones' }
];

function addMissingImports(filePath, content) {
  // Icons that might be used but not imported
  const neededIcons = [
    'Heart', 'Package', 'Flag', 'Bookmark', 'FileText', 
    'Search', 'ArrowLeft', 'ChevronLeft', 'ChevronRight',
    'Loader', 'User', 'Mail', 'Lock', 'Eye', 'EyeOff',
    'Send', 'Phone', 'MapPin', 'PlayCircle', 'PauseCircle',
    'Headphones'
  ];
  
  const usedIcons = [];
  neededIcons.forEach(icon => {
    if (content.includes(icon + ' ') || content.includes(icon + '(') || content.includes(icon + '\n') || content.includes('<' + icon + ' ')) {
      usedIcons.push(icon);
    }
  });
  
  if (usedIcons.length === 0) return content;
  
  // Check if lucide import exists
  const lucideImportRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"];?/;
  const match = content.match(lucideImportRegex);
  
  if (match) {
    const currentImports = match[1].split(',').map(imp => imp.trim());
    const newIcons = usedIcons.filter(icon => !currentImports.includes(icon));
    
    if (newIcons.length > 0) {
      const allImports = [...currentImports, ...newIcons].sort().join(', ');
      content = content.replace(lucideImportRegex, `import { ${allImports} } from 'lucide-react';`);
    }
  } else {
    // Add new import
    const importLine = `import { ${usedIcons.join(', ')} } from 'lucide-react';\n`;
    const firstImportIndex = content.indexOf('import');
    if (firstImportIndex !== -1) {
      content = content.slice(0, firstImportIndex) + importLine + content.slice(firstImportIndex);
    }
  }
  
  return content;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Apply global replacements
  globalReplacements.forEach(replacement => {
    if (replacement.from.test(content)) {
      content = content.replace(replacement.from, replacement.to);
      hasChanges = true;
    }
  });
  
  // Add missing imports
  const originalContent = content;
  content = addMissingImports(filePath, content);
  if (content !== originalContent) {
    hasChanges = true;
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
  }
  
  return hasChanges;
}

function main() {
  console.log('🔧 Final icon fix - scanning for remaining errors...\n');
  
  const errorLines = findRemainingErrors();
  console.log(`Found ${errorLines.length} potential issues\n`);
  
  // Extract unique file paths
  const filePaths = new Set();
  errorLines.forEach(line => {
    const filePath = line.split(':')[0];
    if (filePath && filePath.startsWith('app/')) {
      filePaths.add(path.join(process.cwd(), filePath));
    }
  });
  
  let fixedCount = 0;
  filePaths.forEach(filePath => {
    if (fs.existsSync(filePath) && fixFile(filePath)) {
      fixedCount++;
    }
  });
  
  console.log(`\n🎉 Fixed ${fixedCount} files!`);
  
  // Also scan specific problematic directories
  const problematicDirs = [
    'app/dashboard/courses',
    'app/kunskapsbank/blogg',
    'app/dashboard/downloads',
    'app/kontakt'
  ];
  
  problematicDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
      execSync(`find "${dirPath}" -name "*.tsx" -exec grep -l "Fi[A-Z]" {} \\;`, { encoding: 'utf8' })
        .split('\n')
        .filter(file => file.trim())
        .forEach(file => {
          if (fixFile(file)) {
            fixedCount++;
          }
        });
    }
  });
  
  console.log(`\n🚀 Total fixes applied: ${fixedCount}`);
  console.log('Ready for build!');
}

if (require.main === module) {
  main();
} 
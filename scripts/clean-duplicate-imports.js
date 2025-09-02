#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Remove all react-icons/fi imports
  const fiImportRegex = /import\s*\{\s*[^}]+\s*\}\s*from\s*['"]react-icons\/fi['"];?\s*\n?/g;
  if (fiImportRegex.test(content)) {
    content = content.replace(fiImportRegex, '');
    hasChanges = true;
  }
  
  // Clean up any remaining Fi references
  const fiReplacements = [
    { from: /\bFiArrowRight\b/g, to: 'ArrowRight' },
    { from: /\bFiArrowLeft\b/g, to: 'ArrowLeft' },
    { from: /\bFiChevronRight\b/g, to: 'ChevronRight' },
    { from: /\bFiChevronLeft\b/g, to: 'ChevronLeft' },
    { from: /\bFiHeart\b/g, to: 'Heart' },
    { from: /\bFiPackage\b/g, to: 'Package' },
    { from: /\bFiFlag\b/g, to: 'Flag' },
    { from: /\bFiBookmark\b/g, to: 'Bookmark' },
    { from: /\bFiFileText\b/g, to: 'FileText' },
    { from: /\bFiSearch\b/g, to: 'Search' },
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
    { from: /\bFiHeadphones\b/g, to: 'Headphones' },
    { from: /\bFiClock\b/g, to: 'Clock' },
    { from: /\bFiCalendar\b/g, to: 'Calendar' },
    { from: /\bFiCheckCircle\b/g, to: 'CheckCircle' },
    { from: /\bFiFilter\b/g, to: 'Filter' },
    { from: /\bFiBookOpen\b/g, to: 'BookOpen' },
    { from: /\bFiDownload\b/g, to: 'Download' },
    { from: /\bFiShare2\b/g, to: 'Share2' },
    { from: /\bFiTag\b/g, to: 'Tag' },
    { from: /\bFiStar\b/g, to: 'Star' },
    { from: /\bFiUsers\b/g, to: 'Users' },
    { from: /\bFiPlay\b/g, to: 'Play' },
    { from: /\bFiPause\b/g, to: 'Pause' },
    { from: /\bFiSkipForward\b/g, to: 'SkipForward' },
    { from: /\bFiVolume2\b/g, to: 'Volume2' },
    { from: /\bFiVideo\b/g, to: 'Video' },
    { from: /\bFiBook\b/g, to: 'Book' },
    { from: /\bFiMessageCircle\b/g, to: 'MessageCircle' },
    { from: /\bFiPlus\b/g, to: 'Plus' }
  ];
  
  fiReplacements.forEach(replacement => {
    if (replacement.from.test(content)) {
      content = content.replace(replacement.from, replacement.to);
      hasChanges = true;
    }
  });
  
  // Ensure all used icons are imported
  const allPossibleIcons = [
    'ArrowRight', 'ArrowLeft', 'ChevronRight', 'ChevronLeft', 'Heart', 'Package', 
    'Flag', 'Bookmark', 'FileText', 'Search', 'Loader', 'User', 'Mail', 'Lock',
    'Eye', 'EyeOff', 'Send', 'Phone', 'MapPin', 'PlayCircle', 'PauseCircle',
    'Headphones', 'Clock', 'Calendar', 'CheckCircle', 'Filter', 'BookOpen',
    'Download', 'Share2', 'Tag', 'Star', 'Users', 'Play', 'Pause', 'SkipForward',
    'Volume2', 'Video', 'Book', 'MessageCircle', 'Plus'
  ];
  
  const usedIcons = [];
  allPossibleIcons.forEach(icon => {
    if (content.includes(`<${icon} `) || content.includes(`{${icon}}`)) {
      usedIcons.push(icon);
    }
  });
  
  if (usedIcons.length > 0) {
    // Check if lucide import exists
    const lucideImportRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"];?/;
    const match = content.match(lucideImportRegex);
    
    if (match) {
      const currentImports = match[1].split(',').map(imp => imp.trim()).filter(imp => imp);
      const allNeededImports = [...new Set([...currentImports, ...usedIcons])].sort();
      content = content.replace(lucideImportRegex, `import { ${allNeededImports.join(', ')} } from 'lucide-react';`);
      hasChanges = true;
    } else {
      // Add new import after other imports
      const lastImportIndex = content.lastIndexOf('import');
      if (lastImportIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        const importLine = `import { ${usedIcons.sort().join(', ')} } from 'lucide-react';\n`;
        content = content.slice(0, nextLineIndex + 1) + importLine + content.slice(nextLineIndex + 1);
        hasChanges = true;
      }
    }
  }
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Cleaned: ${path.relative(process.cwd(), filePath)}`);
  }
  
  return hasChanges;
}

function main() {
  console.log('🧹 Cleaning up duplicate imports and fixing remaining icons...\n');
  
  // Find all files with potential issues
  let problemFiles = [];
  try {
    const result = execSync('grep -r "react-icons/fi\\|Fi[A-Z]" app/ --include="*.tsx" --include="*.ts"', { encoding: 'utf8' });
    const lines = result.split('\n').filter(line => line.trim());
    
    const fileSet = new Set();
    lines.forEach(line => {
      const filePath = line.split(':')[0];
      if (filePath && filePath.startsWith('app/')) {
        fileSet.add(path.join(process.cwd(), filePath));
      }
    });
    
    problemFiles = Array.from(fileSet);
  } catch (error) {
    console.log('No remaining issues found');
  }
  
  console.log(`Found ${problemFiles.length} files to clean\n`);
  
  let fixedCount = 0;
  problemFiles.forEach(filePath => {
    if (fs.existsSync(filePath) && cleanFile(filePath)) {
      fixedCount++;
    }
  });
  
  console.log(`\n🎉 Cleaned ${fixedCount} files!`);
  console.log('🚀 All icon migration issues should now be resolved!');
}

if (require.main === module) {
  main();
} 
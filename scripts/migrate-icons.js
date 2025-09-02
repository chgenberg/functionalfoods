#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Icon mapping from Feather to Lucide
const iconMapping = {
  // Navigation & UI
  'FiArrowRight': 'ArrowRight',
  'FiArrowLeft': 'ArrowLeft', 
  'FiArrowUp': 'ArrowUp',
  'FiArrowDown': 'ArrowDown',
  'FiChevronRight': 'ChevronRight',
  'FiChevronLeft': 'ChevronLeft',
  'FiChevronUp': 'ChevronUp',
  'FiChevronDown': 'ChevronDown',
  'FiX': 'X',
  'FiMenu': 'Menu',
  'FiSearch': 'Search',
  'FiFilter': 'Filter',
  'FiGrid': 'Grid3X3',
  'FiList': 'List',
  'FiHome': 'Home',
  'FiSettings': 'Settings',
  
  // Content & Media
  'FiBook': 'Book',
  'FiBookOpen': 'BookOpen',
  'FiFileText': 'FileText',
  'FiFile': 'File',
  'FiImage': 'Image',
  'FiVideo': 'Video',
  'FiPlay': 'Play',
  'FiPause': 'Pause',
  'FiDownload': 'Download',
  'FiUpload': 'Upload',
  'FiLink': 'Link',
  'FiExternalLink': 'ExternalLink',
  'FiCopy': 'Copy',
  
  // Communication
  'FiMail': 'Mail',
  'FiPhone': 'Phone',
  'FiMessageCircle': 'MessageCircle',
  'FiMessageSquare': 'MessageSquare',
  'FiSend': 'Send',
  'FiShare': 'Share',
  'FiShare2': 'Share2',
  
  // Status & Feedback
  'FiCheck': 'Check',
  'FiCheckCircle': 'CheckCircle',
  'FiX': 'X',
  'FiXCircle': 'XCircle',
  'FiAlertCircle': 'AlertCircle',
  'FiAlertTriangle': 'AlertTriangle',
  'FiInfo': 'Info',
  'FiHelpCircle': 'HelpCircle',
  'FiLoader': 'Loader',
  'FiRefreshCw': 'RefreshCw',
  
  // User & Account
  'FiUser': 'User',
  'FiUsers': 'Users',
  'FiUserPlus': 'UserPlus',
  'FiLogIn': 'LogIn',
  'FiLogOut': 'LogOut',
  'FiLock': 'Lock',
  'FiUnlock': 'Unlock',
  'FiEye': 'Eye',
  'FiEyeOff': 'EyeOff',
  'FiShield': 'Shield',
  
  // Commerce
  'FiShoppingCart': 'ShoppingCart',
  'FiShoppingBag': 'ShoppingBag',
  'FiCreditCard': 'CreditCard',
  'FiDollarSign': 'DollarSign',
  'FiTag': 'Tag',
  'FiPackage': 'Package',
  'FiTruck': 'Truck',
  
  // Time & Calendar
  'FiCalendar': 'Calendar',
  'FiClock': 'Clock',
  'FiWatch': 'Watch',
  'FiSun': 'Sun',
  'FiMoon': 'Moon',
  'FiSunrise': 'Sunrise',
  'FiSunset': 'Sunset',
  
  // Health & Activity
  'FiHeart': 'Heart',
  'FiActivity': 'Activity',
  'FiZap': 'Zap',
  'FiTarget': 'Target',
  'FiTrendingUp': 'TrendingUp',
  'FiTrendingDown': 'TrendingDown',
  'FiAward': 'Award',
  'FiStar': 'Star',
  'FiThumbsUp': 'ThumbsUp',
  
  // Tools & Objects
  'FiEdit': 'Edit',
  'FiEdit2': 'Edit2',
  'FiEdit3': 'Edit3',
  'FiTrash': 'Trash',
  'FiTrash2': 'Trash2',
  'FiPlus': 'Plus',
  'FiMinus': 'Minus',
  'FiSave': 'Save',
  'FiPrinter': 'Printer',
  'FiScissors': 'Scissors',
  'FiCoffee': 'Coffee',
  'FiDroplet': 'Droplet',
  'FiMapPin': 'MapPin',
  'FiSmartphone': 'Smartphone',
  
  // Specific icons that might need different names
  'FiChefHat': 'ChefHat',
  'FiInstagram': 'Instagram',
  'FiBell': 'Bell',
  'FiFlag': 'Flag',
  'FiBookmark': 'Bookmark',
  'FiGrid3x3': 'Grid3X3'
};

// Get all icon names for import generation
const allLucideIcons = [...new Set(Object.values(iconMapping))];

function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Check if file uses Feather icons
  if (!content.includes("from 'react-icons/fi'")) {
    return false;
  }
  
  console.log(`Migrating: ${filePath}`);
  
  // Extract current Feather imports
  const fiImportRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]react-icons\/fi['"];?/g;
  const matches = [...content.matchAll(fiImportRegex)];
  
  if (matches.length === 0) {
    return false;
  }
  
  // Collect all Feather icons used in this file
  const usedFeatherIcons = new Set();
  matches.forEach(match => {
    const imports = match[1].split(',').map(imp => imp.trim());
    imports.forEach(imp => {
      if (iconMapping[imp]) {
        usedFeatherIcons.add(imp);
      }
    });
  });
  
  if (usedFeatherIcons.size === 0) {
    return false;
  }
  
  // Generate new Lucide imports
  const lucideIcons = Array.from(usedFeatherIcons).map(fi => iconMapping[fi]);
  const newImport = `import { ${lucideIcons.join(', ')} } from 'lucide-react';`;
  
  // Remove old Feather imports
  content = content.replace(fiImportRegex, '');
  
  // Add new Lucide import (find a good place to insert it)
  const importSectionEnd = content.lastIndexOf("import");
  if (importSectionEnd !== -1) {
    const nextLineAfterImports = content.indexOf('\n', importSectionEnd);
    if (nextLineAfterImports !== -1) {
      content = content.slice(0, nextLineAfterImports + 1) + newImport + '\n' + content.slice(nextLineAfterImports + 1);
    }
  }
  
  // Replace icon usage in JSX
  usedFeatherIcons.forEach(fiIcon => {
    const lucideIcon = iconMapping[fiIcon];
    const regex = new RegExp(`\\b${fiIcon}\\b`, 'g');
    content = content.replace(regex, lucideIcon);
  });
  
  // Clean up any duplicate imports or empty lines
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  fs.writeFileSync(filePath, content, 'utf8');
  hasChanges = true;
  
  return hasChanges;
}

function main() {
  console.log('🚀 Starting icon migration from Feather to Lucide...\n');
  
  const projectRoot = process.cwd();
  const appDir = path.join(projectRoot, 'app');
  
  if (!fs.existsSync(appDir)) {
    console.error('❌ App directory not found!');
    process.exit(1);
  }
  
  const tsxFiles = findTsxFiles(appDir);
  console.log(`📁 Found ${tsxFiles.length} TypeScript/React files\n`);
  
  let migratedCount = 0;
  const migratedFiles = [];
  
  tsxFiles.forEach(file => {
    try {
      if (migrateFile(file)) {
        migratedCount++;
        migratedFiles.push(file);
        console.log(`✅ Migrated: ${path.relative(projectRoot, file)}`);
      }
    } catch (error) {
      console.error(`❌ Error migrating ${file}:`, error.message);
    }
  });
  
  console.log(`\n🎉 Migration complete!`);
  console.log(`📊 Migrated ${migratedCount} files out of ${tsxFiles.length} total files\n`);
  
  if (migratedFiles.length > 0) {
    console.log('📋 Migrated files:');
    migratedFiles.forEach(file => {
      console.log(`   - ${path.relative(projectRoot, file)}`);
    });
    
    console.log('\n💡 Next steps:');
    console.log('1. Run: npm run build (to check for any errors)');
    console.log('2. Test the application');
    console.log('3. Commit changes: git add . && git commit -m "Complete icon migration to Lucide"');
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateFile, iconMapping }; 
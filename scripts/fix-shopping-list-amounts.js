const fs = require('fs');
const path = require('path');

const SHOPPING_LISTS_DIR = path.join(__dirname, '..', 'app', 'data', 'shoppingLists');

// Define reasonable maximum amounts for different units
const MAX_AMOUNTS = {
  'g': 5000,      // Max 5kg for gram items
  'kg': 10,       // Max 10kg 
  'dl': 50,       // Max 5 liters
  'l': 5,         // Max 5 liters
  'ml': 5000,     // Max 5 liters
  'st': 50,       // Max 50 pieces (except specific items)
  'msk': 100,     // Max 100 tablespoons
  'tsk': 100,     // Max 100 teaspoons
  'krm': 50,      // Max 50 pinches
  'förp': 10,     // Max 10 packages
  'påse': 10,     // Max 10 bags
  'burk': 10,     // Max 10 cans
};

// Special cases where higher amounts might be OK
const SPECIAL_CASES = {
  'salt och peppar': { unit: 'förp', amount: 1 },
  'salt': { unit: 'förp', amount: 1 },
  'peppar': { unit: 'förp', amount: 1 },
};

// Known problematic conversions
const FIXES = {
  'fryst ananas': { from: 'st', to: 'g', multiplier: 100 },
  'fryst mango': { from: 'st', to: 'g', multiplier: 100 },
  'frysta bär': { from: 'st', to: 'g', multiplier: 100 },
  'frysta hallon': { from: 'st', to: 'g', multiplier: 100 },
  'frysta blåbär': { from: 'st', to: 'g', multiplier: 100 },
  'sockerärtor': { from: 'kg', to: 'g', multiplier: 100 },
  'konserverade krossade tomater': { from: 'st', to: 'burk', multiplier: 1 },
};

function fixShoppingList(filePath) {
  console.log(`\n📋 Processing: ${path.basename(filePath)}`);
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  let fixedCount = 0;
  const fixes = [];
  
  if (!data.items || !Array.isArray(data.items)) {
    console.log('❌ Invalid format - skipping');
    return;
  }
  
  data.items.forEach((item, index) => {
    const nameLower = item.name.toLowerCase();
    let needsFix = false;
    let oldAmount = item.amount;
    let oldUnit = item.unit;
    let newAmount = item.amount;
    let newUnit = item.unit;
    
    // Check for special cases first
    if (SPECIAL_CASES[nameLower]) {
      if (item.unit !== SPECIAL_CASES[nameLower].unit || item.amount > SPECIAL_CASES[nameLower].amount * 2) {
        newUnit = SPECIAL_CASES[nameLower].unit;
        newAmount = SPECIAL_CASES[nameLower].amount;
        needsFix = true;
      }
    }
    // Check for known fixes
    else if (FIXES[nameLower] && item.unit === FIXES[nameLower].from) {
      newUnit = FIXES[nameLower].to;
      newAmount = item.amount * FIXES[nameLower].multiplier;
      needsFix = true;
    }
    // Check if amount exceeds reasonable maximum
    else if (item.unit && MAX_AMOUNTS[item.unit] && item.amount > MAX_AMOUNTS[item.unit]) {
      // Try to fix by dividing by 100 or 1000
      if (item.amount > MAX_AMOUNTS[item.unit] * 100) {
        newAmount = Math.round(item.amount / 1000);
      } else if (item.amount > MAX_AMOUNTS[item.unit] * 10) {
        newAmount = Math.round(item.amount / 100);
      } else {
        newAmount = Math.round(item.amount / 10);
      }
      needsFix = true;
    }
    
    // Apply fix if needed
    if (needsFix) {
      fixes.push({
        name: item.name,
        oldAmount,
        oldUnit,
        newAmount,
        newUnit
      });
      
      item.amount = newAmount;
      item.unit = newUnit;
      fixedCount++;
    }
  });
  
  if (fixedCount > 0) {
    // Create backup
    const backupPath = filePath.replace('.json', '.backup-' + Date.now() + '.json');
    fs.copyFileSync(filePath, backupPath);
    
    // Write fixed file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Fixed ${fixedCount} items:`);
    fixes.forEach(fix => {
      console.log(`   ${fix.name}: ${fix.oldAmount} ${fix.oldUnit} → ${fix.newAmount} ${fix.newUnit}`);
    });
  } else {
    console.log('✅ No fixes needed');
  }
  
  return fixedCount;
}

// Process all curated lists
console.log('🛒 Fixing shopping list amounts...\n');

let totalFixed = 0;
const files = fs.readdirSync(SHOPPING_LISTS_DIR);

files.forEach(file => {
  if (file.startsWith('curated-') && file.endsWith('.json') && !file.includes('.backup')) {
    const filePath = path.join(SHOPPING_LISTS_DIR, file);
    totalFixed += fixShoppingList(filePath) || 0;
  }
});

console.log(`\n🎉 Total fixes: ${totalFixed} items across all shopping lists`); 
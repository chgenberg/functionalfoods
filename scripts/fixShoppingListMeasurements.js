const fs = require('fs');
const path = require('path');

// Standard Swedish cooking measurements based on research
const STANDARD_MEASUREMENTS = {
  // Dairy products - usually in dl, l, or packages
  'mjölk': { unit: 'l', standardAmount: 1 },
  'grädde': { unit: 'dl', standardAmount: 2 },
  'grekisk yoghurt': { unit: 'dl', standardAmount: 5 }, // Usually sold in 500g containers ≈ 5dl
  'yoghurt': { unit: 'dl', standardAmount: 5 },
  'kvarg': { unit: 'dl', standardAmount: 5 },
  'keso': { unit: 'dl', standardAmount: 4 },
  'crème fraiche': { unit: 'dl', standardAmount: 2 },
  'gräddfil': { unit: 'dl', standardAmount: 2 },
  'smör': { unit: 'g', standardAmount: 500 },
  'ägg': { unit: 'st', standardAmount: 12 }, // Usually sold in dozens
  
  // Cheese - usually in g or packages
  'fetaost': { unit: 'g', standardAmount: 200 },
  'mozzarella': { unit: 'g', standardAmount: 125 },
  'parmesan': { unit: 'g', standardAmount: 100 },
  'halloumi': { unit: 'g', standardAmount: 225 },
  'ricotta': { unit: 'g', standardAmount: 250 },
  
  // Meat & Fish - usually in g or kg
  'kyckling': { unit: 'g', standardAmount: 500 },
  'kycklingfilé': { unit: 'g', standardAmount: 400 },
  'kycklinglårfilé': { unit: 'g', standardAmount: 500 },
  'lax': { unit: 'g', standardAmount: 400 },
  'torsk': { unit: 'g', standardAmount: 400 },
  'nötkött': { unit: 'g', standardAmount: 500 },
  'nötfärs': { unit: 'g', standardAmount: 500 },
  'köttfärs': { unit: 'g', standardAmount: 500 },
  'bacon': { unit: 'g', standardAmount: 140 },
  'skinka': { unit: 'g', standardAmount: 200 },
  'räkor': { unit: 'g', standardAmount: 200 },
  
  // Vegetables - usually in st, kg, or packages
  'tomat': { unit: 'st', standardAmount: 4 },
  'bifftomater': { unit: 'st', standardAmount: 2 },
  'cocktailtomater': { unit: 'g', standardAmount: 250 },
  'gurka': { unit: 'st', standardAmount: 1 },
  'paprika': { unit: 'st', standardAmount: 2 },
  'grön paprika': { unit: 'st', standardAmount: 1 },
  'gul paprika': { unit: 'st', standardAmount: 1 },
  'röd paprika': { unit: 'st', standardAmount: 1 },
  'lök': { unit: 'st', standardAmount: 2 },
  'gul lök': { unit: 'st', standardAmount: 2 },
  'rödlök': { unit: 'st', standardAmount: 1 },
  'salladslök': { unit: 'st', standardAmount: 1 },
  'vitlök': { unit: 'st', standardAmount: 1 },
  'vitlöksklyfta': { unit: 'st', standardAmount: 3 },
  'morötter': { unit: 'kg', standardAmount: 1 },
  'potatis': { unit: 'kg', standardAmount: 2 },
  'sötpotatis': { unit: 'st', standardAmount: 2 },
  'avokado': { unit: 'st', standardAmount: 2 },
  'broccoli': { unit: 'st', standardAmount: 1 },
  'blomkål': { unit: 'st', standardAmount: 1 },
  'zucchini': { unit: 'st', standardAmount: 1 },
  'squash': { unit: 'st', standardAmount: 1 },
  'aubergine': { unit: 'st', standardAmount: 1 },
  'champinjoner': { unit: 'g', standardAmount: 250 },
  'svamp': { unit: 'g', standardAmount: 250 },
  'spenat': { unit: 'g', standardAmount: 200 },
  'sallad': { unit: 'st', standardAmount: 1 },
  'hjärtsallad': { unit: 'st', standardAmount: 1 },
  'isberg': { unit: 'st', standardAmount: 1 },
  'rucola': { unit: 'g', standardAmount: 100 },
  'lime': { unit: 'st', standardAmount: 2 },
  'citron': { unit: 'st', standardAmount: 2 },
  'äpple': { unit: 'st', standardAmount: 4 },
  'banan': { unit: 'st', standardAmount: 6 },
  'mango': { unit: 'st', standardAmount: 1 },
  'ananas': { unit: 'st', standardAmount: 1 },
  
  // Pantry items - usually in packages or kg
  'mjöl': { unit: 'kg', standardAmount: 2 },
  'vetemjöl': { unit: 'kg', standardAmount: 2 },
  'pasta': { unit: 'g', standardAmount: 500 },
  'ris': { unit: 'kg', standardAmount: 1 },
  'quinoa': { unit: 'g', standardAmount: 500 },
  'bulgur': { unit: 'g', standardAmount: 500 },
  'couscous': { unit: 'g', standardAmount: 500 },
  'havregryn': { unit: 'g', standardAmount: 500 },
  'linser': { unit: 'g', standardAmount: 400 },
  'bönor': { unit: 'g', standardAmount: 400 },
  'kikärtor': { unit: 'g', standardAmount: 400 },
  'bröd': { unit: 'st', standardAmount: 1 },
  
  // Oils & condiments
  'olivolja': { unit: 'dl', standardAmount: 5 },
  'olja': { unit: 'dl', standardAmount: 5 },
  'salt': { unit: 'g', standardAmount: 500 },
  'peppar': { unit: 'g', standardAmount: 50 },
  'socker': { unit: 'kg', standardAmount: 1 },
  
  // Seeds & nuts
  'hampafrön': { unit: 'g', standardAmount: 200 },
  'solroskärnor': { unit: 'g', standardAmount: 200 },
  'pumpafrön': { unit: 'g', standardAmount: 200 },
  'sesamfrön': { unit: 'g', standardAmount: 100 },
  'mandelmjölk': { unit: 'l', standardAmount: 1 },
  
  // Herbs & spices - usually small amounts
  'basilika': { unit: 'g', standardAmount: 20 },
  'persilja': { unit: 'g', standardAmount: 20 },
  'oregano': { unit: 'g', standardAmount: 10 },
  'timjan': { unit: 'g', standardAmount: 10 },
  'koriander': { unit: 'g', standardAmount: 20 },
  'ingefära': { unit: 'g', standardAmount: 50 },
  'chili': { unit: 'st', standardAmount: 2 },
  
  // Sauces & condiments
  'soja': { unit: 'ml', standardAmount: 150 },
  'senap': { unit: 'g', standardAmount: 200 },
  'ketchup': { unit: 'g', standardAmount: 300 },
  'majonnäs': { unit: 'g', standardAmount: 250 },
  'pesto': { unit: 'g', standardAmount: 190 },
  'honung': { unit: 'g', standardAmount: 350 }
};

function fixMeasurement(name, currentAmount, currentUnit) {
  const lowerName = name.toLowerCase();
  
  // Find matching standard measurement
  let standard = null;
  for (const [key, value] of Object.entries(STANDARD_MEASUREMENTS)) {
    if (lowerName.includes(key)) {
      standard = value;
      break;
    }
  }
  
  if (!standard) {
    // Default logic for unknown items
    if (currentUnit === 'st' && typeof currentAmount === 'number' && currentAmount < 1) {
      // Fractional pieces should probably be whole pieces or weight
      if (lowerName.includes('ost') || lowerName.includes('kött') || lowerName.includes('fisk')) {
        return { amount: Math.round(currentAmount * 200), unit: 'g' };
      } else {
        return { amount: Math.ceil(currentAmount), unit: 'st' };
      }
    }
    return { amount: currentAmount, unit: currentUnit };
  }
  
  // Use standard measurement but be more conservative with scaling
  let adjustedAmount = currentAmount;
  let adjustedUnit = standard.unit;
  
  // Only change unit if current unit is clearly wrong
  if (currentUnit === 'st' && standard.unit !== 'st') {
    // Convert pieces to proper unit, but be reasonable about amounts
    if (typeof currentAmount === 'number') {
      if (standard.unit === 'g' && currentAmount < 10) {
        // Small amounts in pieces -> reasonable gram amounts
        adjustedAmount = Math.round(currentAmount * 100); // More conservative multiplier
      } else if (standard.unit === 'dl' && currentAmount < 5) {
        // Small amounts in pieces -> reasonable dl amounts
        adjustedAmount = Math.round(currentAmount * 2);
      } else if (standard.unit === 'kg' && currentAmount < 3) {
        // Keep as pieces for vegetables that are sold individually
        adjustedAmount = Math.ceil(currentAmount);
        adjustedUnit = 'st';
      } else {
        // Use current amount with standard unit
        adjustedAmount = currentAmount;
      }
    }
  } else if (currentUnit === standard.unit) {
    // Same unit, keep current amount
    adjustedAmount = currentAmount;
  } else {
    // Different units, keep current
    return { amount: currentAmount, unit: currentUnit };
  }
  
  return { amount: adjustedAmount, unit: adjustedUnit };
}

async function fixShoppingListFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (!content.items || !Array.isArray(content.items)) {
      console.log(`Skipping ${filePath} - no items array found`);
      return;
    }
    
    let changesCount = 0;
    
    content.items = content.items.map(item => {
      const original = { ...item };
      const fixed = fixMeasurement(item.name, item.amount, item.unit);
      
      if (fixed.amount !== item.amount || fixed.unit !== item.unit) {
        changesCount++;
        console.log(`  ${item.name}: ${item.amount} ${item.unit} → ${fixed.amount} ${fixed.unit}`);
        return {
          ...item,
          amount: fixed.amount,
          unit: fixed.unit
        };
      }
      
      return item;
    });
    
    if (changesCount > 0) {
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`  ✅ Fixed ${changesCount} measurements in ${path.basename(filePath)}`);
    } else {
      console.log(`  ✅ No changes needed in ${path.basename(filePath)}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

async function main() {
  const shoppingListsDir = path.join(__dirname, '..', 'app', 'data', 'shoppingLists');
  
  if (!fs.existsSync(shoppingListsDir)) {
    console.error('Shopping lists directory not found:', shoppingListsDir);
    return;
  }
  
  const files = fs.readdirSync(shoppingListsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(shoppingListsDir, file));
  
  console.log(`Found ${files.length} shopping list files to process...\n`);
  
  for (const file of files) {
    await fixShoppingListFile(file);
    console.log('');
  }
  
  console.log('✅ All shopping lists processed!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixMeasurement, STANDARD_MEASUREMENTS }; 
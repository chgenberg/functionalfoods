const fs = require('fs');
const path = require('path');

// Ingredienser som ska filtreras bort från inköpslistan
const EXCLUDED_INGREDIENTS = [
  'vatten',
  'kranvatten',
  'ljummet vatten',
  'kallt vatten',
  'varmt vatten',
  'egenbakat',
  'hemgjord',
  'hemgjort',
  'färdiglagad',
  'färdiglagat',
  'färdigkokt',
  'kokat',
  'tillagad',
  'tillagat',
  'uppvärmd',
  'uppvärmt',
  'rest',
  'rester',
  'kvar',
  'sparad',
  'sparat'
];

// Synonymer för ingredienser som ska slås samman
const INGREDIENT_SYNONYMS = {
  'blomkålshuvud': 'blomkål',
  'blomkålsbit': 'blomkål',
  'färsk mango': 'mango',
  'mango färsk': 'mango',
  'grekisk yoghurt': 'grekisk yoghurt',
  'grekisk naturell yoghurt': 'grekisk yoghurt',
  'naturell grekisk yoghurt': 'grekisk yoghurt',
  'persiljekvist': 'persilja',
  'färsk persilja': 'persilja',
  'citronklyfta': 'citron',
  'citronskiva': 'citron',
  'vitlöksklyfta': 'vitlök',
  'vitlökstår': 'vitlök',
  'salladslök': 'lök',
  'gul lök': 'lök',
  'gul paprika': 'paprika',
  'röd paprika': 'paprika',
  'grön paprika': 'paprika',
  'isbergssalladshuvud': 'isbergssallad',
  'ruccolasallad': 'ruccola',
  'salt och svartpeppar': 'salt och peppar',
  'salt och peppar': 'salt och peppar'
};

// Kategorier för ingredienser
const CATEGORIES = {
  'Mejeri': ['mjölk', 'ost', 'yoghurt', 'smör', 'grädde', 'kvarg', 'keso', 'crème fraiche', 'fetaost', 'mozzarella', 'parmesan', 'ägg', 'halloumi', 'ricotta', 'mascarpone', 'gräddfil'],
  'Kött & Fisk': ['kyckling', 'lax', 'torsk', 'nötkött', 'fläsk', 'kalkon', 'lamm', 'räkor', 'tonfisk', 'bacon', 'köttfärs', 'korv', 'skinka', 'nötfärs', 'kycklingfilé', 'kycklinglårfilé', 'kallrökt'],
  'Frukt & Grönt': ['tomat', 'gurka', 'sallad', 'paprika', 'lök', 'vitlök', 'morötter', 'broccoli', 'spenat', 'äpple', 'banan', 'citron', 'lime', 'avokado', 'potatis', 'sötpotatis', 'zucchini', 'aubergine', 'svamp', 'champinjoner', 'sparris', 'blomkål', 'vitkål', 'rödkål', 'rödlök', 'squash', 'mango', 'ananas', 'sugarsnaps', 'sockerärtor', 'rucola', 'isberg', 'hjärtsallad', 'selleri', 'cocktailtomater', 'bifftomater'],
  'Skafferi': ['mjöl', 'pasta', 'ris', 'quinoa', 'bröd', 'havregryn', 'olivolja', 'salt', 'peppar', 'socker', 'bulgur', 'couscous', 'linser', 'bönor', 'kikärtor', 'ketomüsli', 'hampafrön', 'solroskärnor', 'pumpafrön', 'sesamfrön', 'mandelmjölk'],
  'Kryddor & Såser': ['basilika', 'oregano', 'timjan', 'persilja', 'soja', 'senap', 'vinäger', 'ketchup', 'majonnäs', 'sriracha', 'curry', 'paprikapulver', 'kanel', 'kardemumma', 'chili', 'ingefära', 'koriander', 'örter', 'pesto', 'ketjap', 'honung', 'spiskummin'],
  'Övrigt': []
};

function shouldExcludeIngredient(ingredient) {
  const lowerIngredient = ingredient.toLowerCase().trim();
  
  return EXCLUDED_INGREDIENTS.some(excluded => 
    lowerIngredient.includes(excluded.toLowerCase())
  );
}

function normalizeIngredientName(ingredient) {
  const lowerIngredient = ingredient.toLowerCase().trim();
  
  // Check for synonyms first
  for (const [synonym, canonical] of Object.entries(INGREDIENT_SYNONYMS)) {
    if (lowerIngredient.includes(synonym.toLowerCase())) {
      return canonical;
    }
  }
  
  return ingredient.trim();
}

function categorizeIngredient(ingredient) {
  const lowerIngredient = ingredient.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some(keyword => lowerIngredient.includes(keyword))) {
      return category;
    }
  }
  
  return 'Övrigt';
}

function cleanShoppingList(items) {
  const ingredientMap = new Map();
  let excludedCount = 0;
  let duplicateCount = 0;
  
  console.log(`Processing ${items.length} items...`);
  
  items.forEach((item, index) => {
    const normalizedName = normalizeIngredientName(item.name || '');
    
    if (shouldExcludeIngredient(normalizedName)) {
      console.log(`  Excluding: ${item.name} (${normalizedName})`);
      excludedCount++;
      return;
    }
    
    const key = `${normalizedName.toLowerCase()}_${item.unit || 'st'}`;
    const existing = ingredientMap.get(key);
    const amount = parseFloat(String(item.amount)) || 1;
    
    if (existing) {
      console.log(`  Merging duplicate: ${item.name} (${amount} ${item.unit}) + ${existing.originalName} (${existing.amount} ${existing.unit})`);
      existing.amount += amount;
      duplicateCount++;
    } else {
      ingredientMap.set(key, {
        amount: amount,
        unit: item.unit || 'st',
        category: item.category || categorizeIngredient(normalizedName),
        originalName: item.name
      });
    }
  });
  
  // Convert to array format
  const cleanedItems = Array.from(ingredientMap.entries()).map(([key, data]) => {
    const [name] = key.split('_');
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      amount: data.amount,
      unit: data.unit,
      category: data.category
    };
  });
  
  // Sort by category and name
  cleanedItems.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
  
  console.log(`Results: ${items.length} → ${cleanedItems.length} items (excluded: ${excludedCount}, merged: ${duplicateCount})`);
  
  return cleanedItems;
}

async function main() {
  const shoppingListsDir = path.join(__dirname, '..', 'app', 'data', 'shoppingLists');
  
  // Find all curated shopping list files
  const files = fs.readdirSync(shoppingListsDir)
    .filter(file => file.startsWith('curated-') && file.endsWith('.json'));
  
  console.log(`Found ${files.length} curated shopping list files to clean:`);
  files.forEach(file => console.log(`  - ${file}`));
  console.log('');
  
  for (const file of files) {
    console.log(`\n🧹 Cleaning ${file}...`);
    const filePath = path.join(shoppingListsDir, file);
    
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      if (!data.items || !Array.isArray(data.items)) {
        console.log(`  ⚠️  Skipping ${file}: No items array found`);
        continue;
      }
      
      const originalCount = data.items.length;
      const cleanedItems = cleanShoppingList(data.items);
      
      // Create backup
      const backupPath = filePath.replace('.json', '.backup.json');
      fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
      console.log(`  💾 Backup saved: ${path.basename(backupPath)}`);
      
      // Save cleaned version
      const cleanedData = {
        ...data,
        items: cleanedItems,
        cleanedAt: new Date().toISOString(),
        originalItemCount: originalCount,
        cleanedItemCount: cleanedItems.length
      };
      
      fs.writeFileSync(filePath, JSON.stringify(cleanedData, null, 2));
      console.log(`  ✅ Cleaned and saved: ${originalCount} → ${cleanedItems.length} items`);
      
    } catch (error) {
      console.error(`  ❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log('\n🎉 Shopping list cleaning completed!');
}

main().catch(console.error); 
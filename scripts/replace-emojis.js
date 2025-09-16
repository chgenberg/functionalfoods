#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Emoji to Lucide icon mapping based on the homepage design
const emojiToIconMap = {
  // Health & Wellness
  '🌱': 'Sprout',
  '💪': 'Zap', // Energy/strength
  '🧬': 'Microscope', // Science/DNA
  '🔬': 'Microscope',
  '🎯': 'Target',
  '⚡': 'Zap',
  '🌟': 'Star',
  '💚': 'Heart',
  '❤️': 'Heart',
  '💤': 'Moon', // Sleep
  '🌅': 'Sun', // Morning
  '☀️': 'Sun',
  '🌙': 'Moon',
  '⭐': 'Star',
  '✨': 'Sparkles',
  
  // Food & Nutrition
  '🍃': 'Leaf',
  '🌿': 'Leaf',
  '🥗': 'Salad',
  '🥑': 'Apple', // Avocado -> generic fruit
  '🫐': 'Cherry', // Blueberries -> berries
  '🥕': 'Carrot',
  '🌾': 'Wheat',
  '🍎': 'Apple',
  '🌶️': 'Pepper',
  '🧄': 'Onion',
  '🫒': 'Olive',
  '🥦': 'Broccoli',
  '🥬': 'Lettuce',
  '🍋': 'Lemon',
  '🥝': 'Kiwi',
  '🍇': 'Grapes',
  '🫘': 'Bean',
  '🌰': 'Nut',
  '🥜': 'Nut',
  '🍯': 'Honey',
  '🐟': 'Fish',
  '🥚': 'Egg',
  '🧀': 'Cheese',
  '🥛': 'Milk',
  '🫖': 'Coffee', // Tea pot -> coffee/tea
  '🍵': 'Coffee',
  '☕': 'Coffee',
  
  // Activities & Lifestyle  
  '🧘‍♀️': 'User', // Meditation
  '🏃‍♀️': 'Activity', // Running
  '👨‍🍳': 'ChefHat', // Cooking
  
  // Elements & Nature
  '🔥': 'Flame',
  '💧': 'Droplets',
  '🌊': 'Waves',
  '🏔️': 'Mountain',
  '🌳': 'Tree',
  '🌸': 'Flower',
  '🌺': 'Flower',
  '🦋': 'Butterfly',
  '🐝': 'Bug',
  '🌞': 'Sun',
  '🌛': 'Moon',
  '💫': 'Sparkles',
  
  // Success & Achievement
  '🏆': 'Trophy',
  '🎖️': 'Award',
  '🥇': 'Award',
  '🏅': 'Award',
  '🎉': 'PartyPopper',
  '🎊': 'PartyPopper',
  '🎈': 'Balloon',
  '🎁': 'Gift',
  '🎀': 'Gift',
  
  // Technology & Tools
  '💡': 'Lightbulb',
  '🕯️': 'Candle',
  '🔦': 'Flashlight',
  '🏮': 'Lantern',
  '🪔': 'Candle',
  '💎': 'Diamond',
  '💍': 'Ring',
  '💰': 'DollarSign',
  '💸': 'CreditCard',
  '💳': 'CreditCard',
  '💴': 'Banknote',
  '💵': 'DollarSign',
  '💶': 'Euro',
  '💷': 'PoundSterling',
  '🪙': 'Coins',
  '💱': 'ArrowRightLeft',
  '💲': 'DollarSign',
  '🖥️': 'Monitor',
  
  // Weather
  '🌈': 'Rainbow',
  '🌤️': 'CloudSun',
  '⛅': 'Cloud',
  '🌦️': 'CloudRain',
  '🌧️': 'CloudRain',
  '🌩️': 'CloudLightning',
  '❄️': 'Snowflake',
  '☃️': 'Snowman',
  '⛄': 'Snowman',
  '🌨️': 'CloudSnow',
  '🌬️': 'Wind',
  '💨': 'Wind',
  '🌪️': 'Tornado',
  '🌀': 'Tornado',
  '💥': 'Zap',
  
  // Buildings & Places
  '🏧': 'Building',
  '🏪': 'Store',
  '🏬': 'Building2',
  '🏭': 'Factory',
  '🏗️': 'Construction',
  '🏘️': 'Home',
  '🏚️': 'Home',
  '🏠': 'Home',
  '🏡': 'Home',
  '🏢': 'Building',
  '🏣': 'Building',
  '🏤': 'Building2',
  '🏥': 'Hospital',
  '🏦': 'Landmark',
  '🏨': 'Building',
  '🏩': 'Heart', // Love hotel -> heart
  '🏫': 'School',
  '🏮': 'Lantern',
  '🏯': 'Castle',
  '🏰': 'Castle',
  '🗼': 'Tower',
  '🗽': 'Landmark',
  '⛪': 'Church',
  '🕌': 'Building',
  '🛕': 'Building',
  '🕍': 'Building',
  '⛩️': 'Building',
  '🕋': 'Building',
  
  // Outdoor & Travel
  '⛲': 'Fountain',
  '⛱️': 'Umbrella',
  '🏖️': 'Palmtree',
  '🏝️': 'Island',
  '🏜️': 'Mountain',
  '🌋': 'Mountain',
  '⛰️': 'Mountain',
  '🗻': 'Mountain',
  '🏕️': 'Tent',
  '⛺': 'Tent',
  '🏞️': 'TreePine',
  '🛤️': 'Route',
  '🛣️': 'Route',
  '🗺️': 'Map',
  '🧭': 'Compass',
  
  // Miscellaneous common ones
  '🛡️': 'Shield',
  '🔆': 'Sun',
  '🔅': 'SunDim',
};

// Function to convert emoji to Lucide icon JSX
function emojiToIcon(emoji, className = '') {
  const iconName = emojiToIconMap[emoji];
  if (!iconName) {
    console.log(`⚠️  No mapping found for emoji: ${emoji}`);
    return emoji; // Return original emoji if no mapping
  }
  
  const classAttr = className ? ` className="${className}"` : ' className="w-5 h-5 inline"';
  return `<${iconName}${classAttr} />`;
}

// Function to process a single file
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Check if file already imports Lucide icons
    const hasLucideImport = content.includes('from "lucide-react"') || content.includes('from \'lucide-react\'');
    let lucideIcons = new Set();
    
    // Extract existing Lucide imports if any
    if (hasLucideImport) {
      const importMatch = content.match(/import\s*{([^}]+)}\s*from\s*['"]lucide-react['"]/);
      if (importMatch) {
        const existingIcons = importMatch[1].split(',').map(icon => icon.trim());
        existingIcons.forEach(icon => lucideIcons.add(icon));
      }
    }
    
    // Replace emojis with icons
    for (const [emoji, iconName] of Object.entries(emojiToIconMap)) {
      const emojiRegex = new RegExp(emoji, 'g');
      if (emojiRegex.test(newContent)) {
        modified = true;
        lucideIcons.add(iconName);
        
        // Handle different contexts more carefully
        
        // 1. In JSX span elements with dashboard-emoji class
        newContent = newContent.replace(
          new RegExp(`<span className="dashboard-emoji">${emoji}</span>`, 'g'),
          `<${iconName} className="w-5 h-5 inline text-accent" />`
        );
        
        // 2. In JSX span elements with text size classes
        newContent = newContent.replace(
          new RegExp(`<span className="text-2xl">${emoji}</span>`, 'g'),
          `<${iconName} className="w-8 h-8 inline text-accent" />`
        );
        
        newContent = newContent.replace(
          new RegExp(`<span className="text-lg">${emoji}</span>`, 'g'),
          `<${iconName} className="w-6 h-6 inline text-accent" />`
        );
        
        // 3. In object properties (icon: "🎯") - just replace with icon name
        newContent = newContent.replace(
          new RegExp(`icon:\\s*["']${emoji}["']`, 'g'),
          `icon: "${iconName}"`
        );
        
        // 4. In title strings that start with emoji - replace with icon name only
        newContent = newContent.replace(
          new RegExp(`(title:\\s*["'])${emoji}\\s*([^"']*["'])`, 'g'),
          `$1${iconName} $2`
        );
        
        // 5. In emoji property in objects - keep as string
        newContent = newContent.replace(
          new RegExp(`(emoji:\\s*["'])${emoji}(["'])`, 'g'),
          `$1${iconName}$2`
        );
        
        // 6. Simple emoji at start of strings (like "🎯 Some text")
        newContent = newContent.replace(
          new RegExp(`(["'])${emoji}\\s+([^"']*["'])`, 'g'),
          `$1${iconName} $2`
        );
        
        // 7. Only replace remaining standalone emojis that are in JSX context (not in strings)
        // This is a more conservative approach - only replace if it's clearly in JSX
        const jsxEmojiRegex = new RegExp(`(?<!["'].*?)${emoji}(?![^"']*?["'])(?![^<]*?>)`, 'g');
        newContent = newContent.replace(
          jsxEmojiRegex,
          `<${iconName} className="w-5 h-5 inline" />`
        );
      }
    }
    
    // Update or add Lucide imports if needed
    if (modified && lucideIcons.size > 0) {
      const iconsArray = Array.from(lucideIcons).sort();
      const newImport = `import { ${iconsArray.join(', ')} } from "lucide-react";`;
      
      if (hasLucideImport) {
        // Replace existing import
        newContent = newContent.replace(
          /import\s*{[^}]+}\s*from\s*['"]lucide-react['"]/,
          newImport
        );
      } else {
        // Add new import after other imports
        const importSection = newContent.match(/^((?:import.*\n)*)/m);
        if (importSection) {
          newContent = newContent.replace(
            importSection[0],
            importSection[0] + newImport + '\n'
          );
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

// Main function
async function main() {
  console.log('🚀 Starting emoji replacement process...\n');
  
  // Find all TSX and JSX files
  const files = await glob('app/**/*.{tsx,jsx}', {
    ignore: ['node_modules/**', '.next/**', 'dist/**']
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
  console.log(`   Emoji mappings available: ${Object.keys(emojiToIconMap).length}`);
  
  if (modifiedCount > 0) {
    console.log('\n🎉 Emoji replacement completed successfully!');
    console.log('💡 Make sure to test your application and adjust icon sizes/styles as needed.');
  } else {
    console.log('\n✨ No emojis found to replace.');
  }
}

// Run the script
main().catch(console.error); 
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Emoji to Lucide icon mapping
const emojiToIconMap = {
  // Health & Wellness
  '🌱': 'Sprout',
  '💪': 'Zap',
  '🧬': 'Microscope',
  '🔬': 'Microscope',
  '🎯': 'Target',
  '⚡': 'Zap',
  '🌟': 'Star',
  '💚': 'Heart',
  '❤️': 'Heart',
  '💤': 'Moon',
  '🌅': 'Sun',
  '☀️': 'Sun',
  '🌙': 'Moon',
  '⭐': 'Star',
  '✨': 'Sparkles',
  
  // Food & Nutrition
  '🍃': 'Leaf',
  '🌿': 'Leaf',
  '🥗': 'Salad',
  '🥑': 'Apple',
  '🫐': 'Cherry',
  '🥕': 'Carrot',
  '🌾': 'Wheat',
  '🍎': 'Apple',
  '🐟': 'Fish',
  '🥚': 'Egg',
  '🥛': 'Milk',
  '🥜': 'Nut',
  '🌰': 'Nut',
  '🍵': 'Coffee',
  '☕': 'Coffee',
  '🥬': 'Lettuce',
  
  // Activities & Success
  '🏆': 'Trophy',
  '🎉': 'PartyPopper',
  '👨‍🍳': 'ChefHat',
  
  // Technology & Tools
  '💡': 'Lightbulb',
  '💳': 'CreditCard',
  '🛡️': 'Shield',
  '🖥️': 'Monitor',
  
  // Elements
  '💧': 'Droplets',
  '🌊': 'Waves',
  '🔥': 'Flame',
  
  // Miscellaneous
  '📚': 'Book',
  '📝': 'FileText',
  '🚀': 'Rocket',
};

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
    
    // Replace emojis with icons - only in safe contexts
    for (const [emoji, iconName] of Object.entries(emojiToIconMap)) {
      if (newContent.includes(emoji)) {
        modified = true;
        lucideIcons.add(iconName);
        
        // 1. Replace in JSX span elements with specific classes
        newContent = newContent.replace(
          new RegExp(`<span className="dashboard-emoji">${escapeRegex(emoji)}</span>`, 'g'),
          `<${iconName} className="w-5 h-5 inline text-accent" />`
        );
        
        newContent = newContent.replace(
          new RegExp(`<span className="text-2xl">${escapeRegex(emoji)}</span>`, 'g'),
          `<${iconName} className="w-8 h-8 inline text-accent" />`
        );
        
        newContent = newContent.replace(
          new RegExp(`<span className="text-lg">${escapeRegex(emoji)}</span>`, 'g'),
          `<${iconName} className="w-6 h-6 inline text-accent" />`
        );
        
        // 2. Replace in simple span elements with mr-2 class (like in cart)
        newContent = newContent.replace(
          new RegExp(`<span className="mr-2">${escapeRegex(emoji)}</span>`, 'g'),
          `<${iconName} className="w-5 h-5 inline mr-2" />`
        );
        
        // 3. Replace standalone emojis that are clearly in JSX (not in strings)
        // Look for emojis that are not inside quotes and not part of object properties
        const lines = newContent.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Skip lines that look like object properties or string assignments
          if (line.includes('title:') || line.includes('icon:') || line.includes('emoji:') || 
              line.includes('text:') || line.includes('description:')) {
            continue;
          }
          
          // Skip lines inside strings (basic check)
          const emojiIndex = line.indexOf(emoji);
          if (emojiIndex !== -1) {
            // Check if emoji is inside quotes
            const beforeEmoji = line.substring(0, emojiIndex);
            const afterEmoji = line.substring(emojiIndex + emoji.length);
            
            const quotesBefore = (beforeEmoji.match(/"/g) || []).length;
            const quotesAfter = (afterEmoji.match(/"/g) || []).length;
            
            // If emoji is not inside quotes (even number of quotes before and after)
            if (quotesBefore % 2 === 0 && quotesAfter % 2 === 0) {
              lines[i] = line.replace(
                new RegExp(escapeRegex(emoji), 'g'),
                `<${iconName} className="w-5 h-5 inline" />`
              );
            }
          }
        }
        newContent = lines.join('\n');
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

// Helper function to escape regex special characters
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Main function
async function main() {
  console.log('🚀 Starting careful emoji replacement process...\n');
  
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
    console.log('\n⚠️  Note: Some emojis in strings were left unchanged to avoid syntax errors.');
    console.log('   You may need to manually replace these in appropriate contexts.');
  } else {
    console.log('\n✨ No emojis found to replace.');
  }
}

// Run the script
main().catch(console.error); 
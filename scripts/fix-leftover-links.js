const fs = require('fs');
const path = require('path');

function main() {
  try {
    console.log('🔄 Adding recipe links to leftover meals...\n');

    const mealPlansPath = path.join(process.cwd(), 'app', 'data', 'mealPlans.ts');
    let content = fs.readFileSync(mealPlansPath, 'utf-8');

    // Pattern to find meals with "rester" that don't have recipeLink
    const leftoverPattern = /"name":\s*"([^"]*rester[^"]*)"(?!\s*,\s*"recipeLink")/g;
    const fixes = [];
    let match;

    while ((match = leftoverPattern.exec(content)) !== null) {
      const fullName = match[1];
      const originalName = fullName.replace(/\s*(rester|från frysen)\s*/gi, '').trim();
      
      // Find the original recipe link in the same content
      const searchPattern = new RegExp(`"name":\\s*"[^"]*${originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"[^}]*"recipeLink":\\s*"([^"]+)"`, 'i');
      const originalMatch = content.match(searchPattern);
      
      if (originalMatch) {
        const recipeLink = originalMatch[1];
        fixes.push({
          leftoverName: fullName,
          originalName: originalName,
          recipeLink: recipeLink,
          fullMatch: match[0]
        });
      }
    }

    console.log(`Found ${fixes.length} leftover meals to fix:\n`);

    let updatedCount = 0;
    for (const fix of fixes) {
      const oldPattern = `"name": "${fix.leftoverName}"`;
      const newPattern = `"name": "${fix.leftoverName}", "recipeLink": "${fix.recipeLink}"`;
      
      // Only replace if it doesn't already have a recipeLink
      if (content.includes(oldPattern) && !content.includes(`"name": "${fix.leftoverName}", "recipeLink"`)) {
        content = content.replace(oldPattern, newPattern);
        console.log(`✅ ${fix.leftoverName} → ${fix.recipeLink}`);
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      fs.writeFileSync(mealPlansPath, content, 'utf-8');
      console.log(`\n✨ Added recipe links to ${updatedCount} leftover meals`);
      console.log('Now all leftover meals will be clickable and link to their original recipes!');
    } else {
      console.log('\n❌ No leftover meals were updated. They may already have links.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

if (require.main === module) {
  main();
} 
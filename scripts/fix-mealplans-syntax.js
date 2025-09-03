const fs = require('fs');
const path = require('path');

async function fixMealPlansSyntax() {
  console.log('🔧 Fixar syntaxfel i mealPlans.ts...');
  
  const filePath = path.join(__dirname, '../app/data/mealPlans.ts');
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the specific syntax errors identified in the build log
    
    // Fix line 34 - Missing recipeLink for breakfast and malformed dinner name
    content = content.replace(
      /"Lördag": { "breakfast": { "name": "Blåbärs smoothiebowl" }, "lunch"/,
      '"Lördag": { "breakfast": { "name": "Blåbärs smoothiebowl", "recipeLink": "/kunskapsbank/recept/blabars-smoothiebowl" }, "lunch"'
    );
    
    content = content.replace(
      /"name": "Asiatiska köttbullar med nudelsalladMango och jordgubbar med vit chokladcréme"/,
      '"name": "Asiatiska köttbullar med nudelsallad"'
    );
    
    // Fix line 35 - Malformed breakfast name and recipeLink
    content = content.replace(
      /"breakfast": { "name": ", "recipeLink": "\/kunskapsbank\/recept\/blabars-smoothiebowl"Blåbärs smoothiebowl rester" }/,
      '"breakfast": { "name": "Blåbärs smoothiebowl rester", "recipeLink": "/kunskapsbank/recept/blabars-smoothiebowl" }'
    );
    
    // Fix similar pattern with malformed names and recipeLinks
    content = content.replace(
      /"name": ", "recipeLink": "([^"]+)"([^"]+)"/g,
      (match, recipeLink, name) => {
        return `"name": "${name.trim()}", "recipeLink": "${recipeLink}"`;
      }
    );
    
    // Fix any remaining malformed JSON patterns
    content = content.replace(
      /"recipeLink": "([^"]+)"([^"]+)"/g,
      (match, recipeLink, extraText) => {
        // If there's extra text after recipeLink, it's likely a malformed name
        return `"recipeLink": "${recipeLink}"`;
      }
    );
    
    // Validate that the fixed content is valid JavaScript
    try {
      // Try to evaluate a small portion to check syntax
      eval('const test = {' + content.substring(content.indexOf('{') + 1, content.indexOf('export')) + '};');
      console.log('✅ Syntax validation passed');
    } catch (syntaxError) {
      console.error('❌ Syntax still invalid after fixes:', syntaxError.message);
      return false;
    }
    
    // Write the fixed content back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ mealPlans.ts syntax errors fixed!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error fixing mealPlans.ts:', error);
    return false;
  }
}

// Run the fix
fixMealPlansSyntax().then(success => {
  process.exit(success ? 0 : 1);
}); 
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

async function extractTextFromDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

function parseMealPlan(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const mealPlan = {};
  const days = ['Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör', 'Sön'];
  const fullDays = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
  
  let currentDayIndex = -1;
  let currentMealIndex = 0; // 0=frukost, 1=lunch, 2=middag
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line is a day abbreviation
    const dayIndex = days.indexOf(line);
    if (dayIndex !== -1) {
      currentDayIndex = dayIndex;
      currentMealIndex = 0;
      mealPlan[fullDays[dayIndex]] = {
        breakfast: { name: '', recipeLink: '' },
        lunch: { name: '', recipeLink: '' },
        dinner: { name: '', recipeLink: '' }
      };
      continue;
    }
    
    // If we're in a day and this looks like a meal
    if (currentDayIndex !== -1 && line.includes('kcal') && !line.includes('rester')) {
      const mealName = line.replace(/\s*\(\d+\s*kcal\).*$/, '').trim();
      
      if (mealName.length > 3) {
        const dayName = fullDays[currentDayIndex];
        
        if (currentMealIndex === 0) {
          mealPlan[dayName].breakfast.name = mealName;
        } else if (currentMealIndex === 1) {
          mealPlan[dayName].lunch.name = mealName;
        } else if (currentMealIndex === 2) {
          mealPlan[dayName].dinner.name = mealName;
        }
        
        currentMealIndex++;
      }
    }
  }
  
  return mealPlan;
}

async function extractAllMealPlans() {
  console.log('🔍 Extracting all meal plans from DOCX files...\n');

  // Basic course documents
  const basicFiles = [
    'Functionalbasic_1.docx',
    'Functionalbasic_2.docx', 
    'Functionalbasic_3.docx',
    'Functionalbasic_4.docx',
    'Functionalbasic_5.docx',
    'Functionalbasic_6.docx'
  ];

  // Flow course documents  
  const flowFiles = [
    'Functionalflow_1.docx',
    'Functionalflow_2.docx',
    'Functionalflow_3.docx', 
    'Functionalflow_4.docx',
    'Functionalflow _5.docx',
    'Functionalflow_6.docx'
  ];

  console.log('📋 FUNCTIONAL BASICS MEAL PLANS:\n');

  for (let i = 0; i < basicFiles.length; i++) {
    const fileName = basicFiles[i];
    const filePath = path.join('public/kurser', fileName);
    
    if (fs.existsSync(filePath)) {
      console.log(`\n=== BASIC VECKA ${i + 1} (${fileName}) ===`);
      const text = await extractTextFromDocx(filePath);
      
      if (text) {
        const mealPlan = parseMealPlan(text);
        
        Object.keys(mealPlan).forEach(day => {
          console.log(`${day}:`);
          console.log(`  Frukost: "${mealPlan[day].breakfast.name}"`);
          console.log(`  Lunch: "${mealPlan[day].lunch.name}"`);
          console.log(`  Middag: "${mealPlan[day].dinner.name}"`);
        });
      }
    } else {
      console.log(`❌ File not found: ${fileName}`);
    }
  }

  console.log('\n\n🔄 FUNCTIONAL FLOW MEAL PLANS:\n');

  for (let i = 0; i < flowFiles.length; i++) {
    const fileName = flowFiles[i];
    const filePath = path.join('public/kurser/flow', fileName);
    
    if (fs.existsSync(filePath)) {
      console.log(`\n=== FLOW VECKA ${i + 1} (${fileName}) ===`);
      const text = await extractTextFromDocx(filePath);
      
      if (text) {
        const mealPlan = parseMealPlan(text);
        
        Object.keys(mealPlan).forEach(day => {
          console.log(`${day}:`);
          console.log(`  Frukost: "${mealPlan[day].breakfast.name}"`);
          console.log(`  Lunch: "${mealPlan[day].lunch.name}"`);
          console.log(`  Middag: "${mealPlan[day].dinner.name}"`);
        });
      }
    } else {
      console.log(`❌ File not found: ${fileName}`);
    }
  }
}

extractAllMealPlans().catch(console.error); 
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

async function extractMealPlans() {
  console.log('🔍 Extracting meal plans from DOCX files...\n');

  // Start with just one file to see the structure
  const testFile = 'public/kurser/Functionalbasic_1.docx';
  
  console.log(`=== TESTING FILE: ${testFile} ===\n`);
  
  const text = await extractTextFromDocx(testFile);
  
  if (text) {
    console.log('RAW TEXT CONTENT:');
    console.log('==================');
    console.log(text);
    console.log('==================\n');
    
    // Split into lines and filter
    const lines = text.split('\n');
    console.log('LINES ANALYSIS:');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        console.log(`${index + 1}: "${trimmed}"`);
      }
    });
  }

  // Also test a Flow file
  console.log('\n\n=== TESTING FLOW FILE ===\n');
  const flowTestFile = 'public/kurser/flow/Functionalflow_1.docx';
  
  const flowText = await extractTextFromDocx(flowTestFile);
  
  if (flowText) {
    console.log('FLOW RAW TEXT CONTENT:');
    console.log('======================');
    console.log(flowText);
    console.log('======================\n');
  }
}

extractMealPlans().catch(console.error); 
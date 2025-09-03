const mammoth = require('mammoth');
const path = require('path');

async function debugDocx(weekNumber) {
  const filePath = path.join(process.cwd(), 'public', 'Kostscheman_energy', `Typ-2 Diabetes - Kostschema v. ${weekNumber}.docx`);
  
  console.log(`\n📄 Debugging Week ${weekNumber} DOCX file:`);
  console.log(`File: ${filePath}`);
  
  try {
    // Try raw text extraction
    const rawResult = await mammoth.extractRawText({ path: filePath });
    console.log(`\n📝 Raw text (${rawResult.value.length} chars):`);
    console.log('---START---');
    console.log(rawResult.value);
    console.log('---END---');
    
    // Try HTML extraction for better structure
    const htmlResult = await mammoth.convertToHtml({ path: filePath });
    console.log(`\n🌐 HTML content (${htmlResult.value.length} chars):`);
    console.log('---START---');
    console.log(htmlResult.value);
    console.log('---END---');
    
    if (rawResult.messages.length > 0) {
      console.log(`\n⚠️  Messages:`, rawResult.messages);
    }
    
  } catch (error) {
    console.error(`❌ Error reading file:`, error);
  }
}

async function main() {
  console.log('🔍 Debugging DOCX content extraction...');
  
  // Debug first file
  await debugDocx(1);
}

main(); 
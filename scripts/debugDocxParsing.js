const path = require('path');
const mammoth = require('mammoth');
const cheerio = require('cheerio');

const DOCX_PATH = path.resolve(process.cwd(), 'Recept-Final', 'vecka-3-basic.docx');

function cleanLine(s) {
  return String(s || '')
    .replace(/[•·‣▪︎]/g, '-')
    .replace(/\u00A0/g, ' ')
    .trim();
}

function splitSectionsByDashes(rawText) {
  const text = rawText.replace(/\u00A0|\u2028/g, ' ');
  const lines = text.split(/\r?\n/);
  const sections = [];
  let current = [];
  for (const l of lines) {
    if (/^---\s*$/.test(l.trim())) {
      if (current.length) { sections.push(current.join('\n').trim()); current = []; }
      continue;
    }
    current.push(l);
  }
  if (current.length) sections.push(current.join('\n').trim());
  const filtered = sections.filter(Boolean);
  return filtered.length >= 2 ? filtered : null;
}

function parseSection(sectionText, sectionIndex) {
  console.log(`\n=== SECTION ${sectionIndex + 1} ===`);
  console.log('Raw text:');
  console.log(sectionText);
  console.log('\n--- Parsing ---');

  const lines = sectionText.split(/\n+/).map(l => cleanLine(l.replace(/\u00A0/g,' '))).filter(l => l.length > 0);
  
  console.log('Cleaned lines:');
  lines.forEach((line, i) => console.log(`${i}: "${line}"`));

  let title = '';
  let servings = null;
  let ingredients = [];
  let instructions = [];

  // Extract title from first line
  const firstLine = lines[0];
  if (/^namn på rätt/i.test(firstLine)) {
    title = firstLine
      .replace(/^namn på rätt\s*[:\-–—]?\s*/i, '')
      .replace(/\s*[–—-]\s*\d+\s*portion.*$/i, '')
      .replace(/\s*\d+\s*(dl|g|ml|kg)\b.*$/i, '')
      .trim();
    
    const servMatch = firstLine.match(/\b(\d+)\s*portion(er)?\b/i);
    if (servMatch) servings = parseInt(servMatch[1], 10);
  } else {
    title = firstLine;
  }

  console.log(`\nExtracted title: "${title}"`);
  console.log(`Servings: ${servings}`);

  // Process remaining lines
  let mode = 'ingredients';
  let foundInstructions = false;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (/^(ingredienser|beskrivning|instruktion|gör så här)/i.test(line)) {
      console.log(`Line ${i}: HEADER - "${line}"`);
      continue;
    }

    const verbs = ['vispa','lägg','skär','heta','blanda','mixa','riv','sätt','servera','dela','tillsätt','toppa','dekorera','rosta','strö','hacka','koka','stek','häll','låt','rör','forma','fyll','bryn','smaka','skala'];
    const startsWithVerb = verbs.some(v => lower.startsWith(v + ' '));
    const isSentence = /\.\s*$/.test(line) && line.length > 15;
    
    if ((startsWithVerb || isSentence) && !foundInstructions) {
      mode = 'instructions';
      foundInstructions = true;
      console.log(`Line ${i}: SWITCH TO INSTRUCTIONS - "${line}"`);
    }

    if (mode === 'ingredients') {
      if (/^(\d+|[½¼¾⅓⅔])/.test(line) || 
          /(dl|g|ml|kg|l|tsk|msk|st|cm)\b/i.test(line) ||
          line.startsWith('- ') ||
          /^(salt|peppar|topping|dekoration)/i.test(line)) {
        ingredients.push(line.replace(/^-\s*/, ''));
        console.log(`Line ${i}: INGREDIENT - "${line}"`);
      } else if (startsWithVerb || isSentence) {
        mode = 'instructions';
        foundInstructions = true;
        instructions.push(line);
        console.log(`Line ${i}: INSTRUCTION (verb/sentence) - "${line}"`);
      } else {
        if (ingredients.length > 0) {
          mode = 'instructions';
          foundInstructions = true;
          instructions.push(line);
          console.log(`Line ${i}: INSTRUCTION (after ingredients) - "${line}"`);
        } else {
          ingredients.push(line);
          console.log(`Line ${i}: INGREDIENT (fallback) - "${line}"`);
        }
      }
    } else if (mode === 'instructions') {
      instructions.push(line);
      console.log(`Line ${i}: INSTRUCTION - "${line}"`);
    }
  }

  console.log(`\n--- RESULT ---`);
  console.log(`Title: "${title}"`);
  console.log(`Servings: ${servings}`);
  console.log(`Ingredients (${ingredients.length}):`);
  ingredients.forEach((ing, i) => console.log(`  ${i + 1}. ${ing}`));
  console.log(`Instructions (${instructions.length}):`);
  instructions.forEach((inst, i) => console.log(`  ${i + 1}. ${inst}`));

  return { title, servings, ingredients, instructions };
}

(async () => {
  try {
    const { value: rawText } = await mammoth.extractRawText({ path: DOCX_PATH });
    const sections = splitSectionsByDashes(rawText);
    
    if (!sections) {
      console.log('❌ No sections found with --- delimiter');
      return;
    }

    console.log(`📄 Found ${sections.length} sections in ${DOCX_PATH}`);
    
    // Debug first 3 sections
    for (let i = 0; i < Math.min(3, sections.length); i++) {
      parseSection(sections[i], i);
    }

  } catch (e) {
    console.error('❌ Debug failed:', e.message || e);
    process.exit(1);
  }
})(); 
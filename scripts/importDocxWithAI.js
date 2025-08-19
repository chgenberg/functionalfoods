const path = require('path');
const { PrismaClient } = require('@prisma/client');
const mammoth = require('mammoth');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const argPath = process.argv[2];
const DOCX_PATH = path.resolve(process.cwd(), argPath || '');

if (!argPath) {
  console.error('Usage: node scripts/importDocxWithAI.js <path-to-docx>');
  process.exit(1);
}

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

function splitSectionsByMarker(rawText) {
  const text = rawText.replace(/\u00A0|\u2028/g, ' ');
  const lines = text.split(/\r?\n/);
  const norm = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  const isMarker = (s) => {
    const n = norm(s);
    return /^namn pa ratt\s*(?:[:\-–—]|\s)\s*/.test(n);
  };
  const indices = [];
  for (let i = 0; i < lines.length; i++) {
    if (isMarker(lines[i])) indices.push(i);
  }
  if (indices.length >= 2) {
    const sections = [];
    for (let s = 0; s < indices.length; s++) {
      const start = indices[s];
      const end = s + 1 < indices.length ? indices[s + 1] : lines.length;
      sections.push(lines.slice(start, end).join('\n'));
    }
    return sections.filter(Boolean);
  }
  return null;
}

function createSlug(title) {
  return (title || '')
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function parseRecipeWithAI(sectionText) {
  const prompt = `Analysera följande recepttext och extrahera strukturerad data. Svara ENDAST med JSON i detta format:

{
  "title": "Receptets namn (utan portionsinfo)",
  "servings": antal_portioner_som_nummer,
  "ingredients": ["ingrediens 1", "ingrediens 2", ...],
  "instructions": "Fullständiga tillagningsinstruktioner som en text"
}

Viktigt:
- title ska bara vara receptnamnet, ingen portionsinfo
- servings ska vara ett nummer (t.ex. 1, 2, 4)
- ingredients ska vara en array med varje ingrediens som separat string
- instructions ska vara alla tillagningssteg som en sammanhängande text
- Ignorera "Namn på rätt:" om det finns

Recepttext:
${sectionText}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.1
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) throw new Error('No response from AI');

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!parsed.title || !Array.isArray(parsed.ingredients)) {
      throw new Error('Invalid AI response structure');
    }

    return {
      title: String(parsed.title).trim(),
      servings: parsed.servings ? parseInt(parsed.servings, 10) : null,
      ingredients: parsed.ingredients.filter(Boolean),
      instructions: String(parsed.instructions || '').trim()
    };

  } catch (e) {
    console.error(`❌ AI parsing failed: ${e.message}`);
    return null;
  }
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const { value: rawText } = await mammoth.extractRawText({ path: DOCX_PATH });
    let sections = splitSectionsByDashes(rawText);
    if (!sections) sections = splitSectionsByMarker(rawText);
    
    if (!sections) {
      console.log('❌ No sections found with --- or Namn på rätt: delimiters');
      return;
    }

    console.log(`📄 ${DOCX_PATH}\n→ Hittade ${sections.length} receptsektioner`);

    let created = 0, updated = 0, skipped = 0;
    
    for (let i = 0; i < sections.length; i++) {
      console.log(`\n🤖 Processing section ${i + 1}/${sections.length} with AI...`);
      
      const parsed = await parseRecipeWithAI(sections[i]);
      if (!parsed) { 
        skipped++; 
        console.log('⚠️ Skipped due to AI parsing failure');
        continue; 
      }
      
      const { title, ingredients, instructions, servings } = parsed;
      const slug = createSlug(title);

      console.log(`📝 Parsed: "${title}" (${ingredients.length} ingredients, ${instructions.length} chars instructions)`);

      const existing = await prisma.recipe.findUnique({ where: { slug } });
      const data = {
        title,
        slug,
        ingredients: ingredients || [],
        instructions: instructions || null,
        servings: servings || null,
        status: 'PUBLISHED',
        isPremium: false,
        isFree: true,
      };

      if (existing) { 
        await prisma.recipe.update({ where: { slug }, data }); 
        updated++; 
        console.log('🔁 Updated'); 
      } else { 
        await prisma.recipe.create({ data }); 
        created++; 
        console.log('✅ Created'); 
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✨ Klart. Skapade: ${created}, Uppdaterade: ${updated}, Skippade: ${skipped}.`);
  } catch (e) {
    console.error('❌ Import failed:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 
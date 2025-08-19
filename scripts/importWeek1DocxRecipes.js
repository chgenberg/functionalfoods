const path = require('path');
const { PrismaClient } = require('@prisma/client');
const mammoth = require('mammoth');
const cheerio = require('cheerio');

const DOCX_PATH = path.resolve(process.cwd(), 'Recept-Final', 'Vecka-1-basic.docx');

function toSlug(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function cleanLine(s) {
  return String(s || '')
    .replace(/[•·‣▪︎]/g, '-')
    .replace(/\u00A0/g, ' ')
    .trim();
}

function splitSectionsFromLines(lines) {
  const sections = [];
  let current = [];
  let blanks = 0;
  for (const raw of lines) {
    const l = raw; // already trimmed
    if (l === '') {
      blanks++;
      if (blanks >= 3) {
        if (current.length) {
          sections.push(current.join('\n').trim());
          current = [];
        }
        continue; // keep consuming blanks
      }
      // if fewer than 3, keep single blank as separator inside a section
      current.push('');
    } else {
      blanks = 0;
      current.push(l);
    }
  }
  if (current.length) sections.push(current.join('\n').trim());
  return sections.filter(Boolean);
}

function splitSectionsByMarker(rawText) {
  const text = rawText.replace(/\u00A0/g, ' ');
  const lines = text.split(/\r?\n/).map(l => l.trim());
  const indices = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^namn på rätt\s*:/i.test(lines[i])) indices.push(i);
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

function parseSection(sectionText) {
  const lines = sectionText.split(/\n+/).map(l => cleanLine(l)).filter(l => l.length > 0);
  if (lines.length === 0) return null;

  // Try labeled format first
  let title = '';
  let servings = null;
  let calories = null;
  let ingredients = [];
  let instructions = [];

  let mode = 'auto';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    if (lower.startsWith('namn på rätt:')) {
      title = cleanLine(line.split(':')[1] || '').trim();
      continue;
    }
    if (lower.startsWith('antal portioner:')) {
      const m = line.match(/(\d+)/);
      if (m) servings = parseInt(m[1], 10);
      continue;
    }
    if (lower.startsWith('kalorier per rätt:')) {
      calories = cleanLine(line.split(':')[1] || '').trim();
      continue;
    }
    if (lower === 'ingredienser:' || lower.startsWith('ingredienser')) { mode = 'ingredients'; continue; }
    if (lower.startsWith('beskrivning') || lower.startsWith('instruktion')) { mode = 'instructions'; continue; }

    if (mode === 'ingredients' && (line.startsWith('- ') || /^[0-9]+\s*(dl|g|ml|kg|l|tsk|msk|st)\b/i.test(line))) {
      ingredients.push(line.replace(/^-\s*/, ''));
      continue;
    }
    if (mode === 'instructions') {
      instructions.push(line);
      continue;
    }
  }

  if (!title) {
    // Heuristic parse: first line = title
    title = lines[0];
    // Ingredients: consecutive bullet/quantity lines after title until a non-ingredient line
    let i = 1;
    for (; i < lines.length; i++) {
      const l = lines[i];
      if (l.startsWith('- ') || /^[0-9]+\s*(dl|g|ml|kg|l|tsk|msk|st)\b/i.test(l)) {
        ingredients.push(l.replace(/^-\s*/, ''));
      } else {
        break;
      }
    }
    // Rest = instructions (skip possible header)
    for (; i < lines.length; i++) {
      const l = lines[i];
      if (/^(beskrivning|instruktion)/i.test(l)) continue;
      instructions.push(l);
    }
  }

  // Cleanup
  title = title.trim();
  ingredients = ingredients.map(cleanLine).filter(Boolean);
  instructions = instructions.map(cleanLine).filter(Boolean);

  if (!title) return null;
  return { title, servings, calories, ingredients, instructions };
}

async function extractDocxLines(docxPath) {
  const { value: html } = await mammoth.convertToHtml({ path: docxPath });
  const $ = cheerio.load(html);
  const lines = [];
  $('p, li, h1, h2, h3').each((_, el) => {
    const txt = cleanLine($(el).text());
    if (txt) lines.push(txt);
    else lines.push(''); // preserve empty
  });
  return lines;
}

(async () => {
  const prisma = new PrismaClient();
  try {
    // Try marker-based split first (from raw text)
    const { value: rawText } = await mammoth.extractRawText({ path: DOCX_PATH });
    let sections = splitSectionsByMarker(rawText);

    if (!sections) {
      // Fallback to blank-line splitter
      const lines = await extractDocxLines(DOCX_PATH);
      sections = splitSectionsFromLines(lines);
    }

    console.log(`📄 Hittade ${sections.length} receptsektioner i dokumentet`);

    let created = 0, updated = 0, skipped = 0;
    for (const sec of sections) {
      const parsed = parseSection(sec);
      if (!parsed) { skipped++; continue; }
      const { title, ingredients, instructions, servings } = parsed;
      const slug = toSlug(title);

      const existing = await prisma.recipe.findUnique({ where: { slug } });
      const data = {
        title,
        slug,
        ingredients: ingredients || [],
        instructions: instructions && instructions.length ? instructions.join('\n') : null,
        servings: servings || null,
        status: 'PUBLISHED',
        isPremium: false,
        isFree: true,
      };

      if (existing) {
        await prisma.recipe.update({ where: { slug }, data });
        updated++;
        console.log(`🔁 Uppdaterade: ${title}`);
      } else {
        await prisma.recipe.create({ data });
        created++;
        console.log(`✅ Skapade: ${title}`);
      }
    }

    console.log(`\n✨ Klart. Skapade: ${created}, Uppdaterade: ${updated}, Skippade: ${skipped}.`);
  } catch (e) {
    console.error('❌ Importfel:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 
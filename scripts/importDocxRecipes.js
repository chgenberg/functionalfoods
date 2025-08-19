const path = require('path');
const { PrismaClient } = require('@prisma/client');
const mammoth = require('mammoth');
const cheerio = require('cheerio');

const argPath = process.argv[2];
const envPath = process.env.DOCX_PATH;
const DOCX_PATH = path.resolve(process.cwd(), argPath || envPath || '');

if (!argPath && !envPath) {
  console.error('Usage: node scripts/importDocxRecipes.js <path-to-docx>  (or set DOCX_PATH env)');
  process.exit(1);
}

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
      if (blanks >= 2) { // changed from 3 to 2
        if (current.length) {
          sections.push(current.join('\n').trim());
          current = [];
        }
        continue; // keep consuming blanks
      }
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

function splitSectionsByMarkerHtml(paragraphs) {
  const norm = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  const isMarker = (s) => /^namn pa ratt\s*(?:[:\-–—]|\s)?\s*/.test(norm(s));
  const idx = [];
  for (let i = 0; i < paragraphs.length; i++) {
    if (isMarker(paragraphs[i])) idx.push(i);
  }
  if (idx.length >= 2) {
    const sections = [];
    for (let s = 0; s < idx.length; s++) {
      const start = idx[s];
      const end = s + 1 < idx.length ? idx[s + 1] : paragraphs.length;
      sections.push(paragraphs.slice(start, end).join('\n'));
    }
    return sections.filter(Boolean);
  }
  return null;
}

function splitSectionsByRawMarker(rawText) {
  // Normalize NBSP/line separators and lowercase without diacritics for detection,
  // but keep original for slicing by split.
  const cleaned = rawText.replace(/\u00A0|\u2028/g, ' ');
  // Split keeping the marker line at the start of each chunk
  const parts = cleaned.split(/(?=\s*Namn\s+p[åa]\s*r[äa]tt\s*[:\-–—]?\s*)/i)
    .map(p => p.trim())
    .filter(p => /^Namn\s+p[åa]\s*r[äa]tt/i.test(p));
  return parts.length >= 2 ? parts : null;
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

function parseSection(sectionText) {
  const lines = sectionText.split(/\n+/).map(l => cleanLine(l.replace(/\u00A0/g,' '))).filter(l => l.length > 0);
  if (lines.length === 0) return null;

  let title = '';
  let servings = null;
  let ingredients = [];
  let instructions = [];

  // Extract title from first line
  const firstLine = lines[0];
  if (/^namn på rätt/i.test(firstLine)) {
    // Clean title: remove marker and everything after portion info
    title = firstLine
      .replace(/^namn på rätt\s*[:\-–—]?\s*/i, '')
      .replace(/\s*[–—-]\s*\d+\s*portion.*$/i, '')
      .replace(/\s*\d+\s*(dl|g|ml|kg)\b.*$/i, '')
      .trim();
    
    // Extract servings
    const servMatch = firstLine.match(/\b(\d+)\s*portion(er)?\b/i);
    if (servMatch) servings = parseInt(servMatch[1], 10);
  } else {
    title = firstLine;
  }

  // Process remaining lines
  let mode = 'ingredients'; // start with ingredients after title
  let foundInstructions = false;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Skip headers
    if (/^(ingredienser|beskrivning|instruktion|gör så här)/i.test(line)) continue;

    // Detect instruction start (verbs or sentences)
    const verbs = ['vispa','lägg','skär','heta','blanda','mixa','riv','sätt','servera','dela','tillsätt','toppa','dekorera','rosta','strö','hacka','koka','stek','häll','låt','rör','forma','fyll','bryn','smaka','skala'];
    const startsWithVerb = verbs.some(v => lower.startsWith(v + ' '));
    const isSentence = /\.\s*$/.test(line) && line.length > 15;
    
    if ((startsWithVerb || isSentence) && !foundInstructions) {
      mode = 'instructions';
      foundInstructions = true;
    }

    if (mode === 'ingredients') {
      // Keep as ingredient if it looks like one
      if (/^(\d+|[½¼¾⅓⅔])/.test(line) || 
          /(dl|g|ml|kg|l|tsk|msk|st|cm)\b/i.test(line) ||
          line.startsWith('- ') ||
          /^(salt|peppar|topping|dekoration)/i.test(line)) {
        ingredients.push(line.replace(/^-\s*/, ''));
      } else if (startsWithVerb || isSentence) {
        // Switch to instructions
        mode = 'instructions';
        foundInstructions = true;
        instructions.push(line);
      } else {
        // Ambiguous line - if we have ingredients already, treat as instruction
        if (ingredients.length > 0) {
          mode = 'instructions';
          foundInstructions = true;
          instructions.push(line);
        } else {
          ingredients.push(line);
        }
      }
    } else if (mode === 'instructions') {
      instructions.push(line);
    }
  }

  // Clean up results
  title = title.trim();
  ingredients = ingredients.filter(Boolean);
  instructions = instructions.filter(Boolean);

  if (!title) return null;
  return { title, servings, ingredients, instructions };
}

async function extractDocxLines(docxPath) {
  const { value: html } = await mammoth.convertToHtml({ path: docxPath });
  const $ = cheerio.load(html);
  const lines = [];
  $('p, li, h1, h2, h3').each((_, el) => {
    const txt = cleanLine($(el).text());
    if (txt) lines.push(txt); else lines.push('');
  });
  return lines;
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const { value: rawText } = await mammoth.extractRawText({ path: DOCX_PATH });
    let sections = splitSectionsByDashes(rawText);
    if (!sections) sections = splitSectionsByRawMarker(rawText);
    if (!sections) sections = splitSectionsByMarker(rawText);

    if (!sections) {
      const lines = await extractDocxLines(DOCX_PATH);
      // try paragraph-based marker split first
      sections = splitSectionsByMarkerHtml(lines);
      if (!sections) {
        sections = splitSectionsFromLines(lines);
      }
    }

    console.log(`📄 ${DOCX_PATH}\n→ Hittade ${sections.length} receptsektioner`);

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

      if (existing) { await prisma.recipe.update({ where: { slug }, data }); updated++; console.log('🔁', title); }
      else { await prisma.recipe.create({ data }); created++; console.log('✅', title); }
    }

    console.log(`\n✨ Klart. Skapade: ${created}, Uppdaterade: ${updated}, Skippade: ${skipped}.`);
  } catch (e) {
    console.error('❌ Importfel:', e.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})(); 
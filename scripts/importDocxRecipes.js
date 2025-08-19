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
  const rawLines = sectionText.split(/\n+/);
  const lines = rawLines.map(l => cleanLine(l.replace(/\u00A0/g,' '))).filter(l => l.length >= 0);
  if (lines.length === 0) return null;

  let title = '';
  let servings = null;
  let calories = null;
  let ingredients = [];
  let instructions = [];

  const norm = (s)=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  const isServingsLine = (s)=>/\b(\d+)\s*portion(er)?\b/i.test(s);
  const extractServings = (s)=>{ const m = s.match(/\b(\d+)\s*portion(er)?\b/i); return m?parseInt(m[1],10):null; };

  // Title: if marker present, take next lines until we hit servings line or a blank, join with space
  const markerIdx = rawLines.findIndex(l => /^namn pa ratt/i.test(norm(l)) || /^namn på rätt/i.test(norm(l)));
  if (markerIdx !== -1) {
    const after = cleanLine(rawLines[markerIdx].split(/namn på rätt\s*[:\-–—]?\s*|namn pa ratt\s*[:\-–—]?\s*/i).pop());
    if (after) {
      // Cut everything from '– N portion(er)' and onward
      title = after.replace(/\s*[–—-]\s*\d+\s*portion(er)?\b[\s\S]*$/i,'').trim();
      const s = extractServings(after);
      if (s) servings = s;
    }
    if (!title) {
      // try next lines, concatenate until servings line
      const buff = [];
      for (let i=markerIdx+1;i<rawLines.length;i++){
        const t = cleanLine(rawLines[i]);
        if (!t) break;
        if (isServingsLine(t)) { servings = extractServings(t); break; }
        // if t has ' - N portioner', split
        const split = t.split(/\s*[–—-]\s*\d+\s*portion(er)?\b/i)[0];
        buff.push(split || t);
        if (split !== t) { servings = extractServings(t); break; }
        // stop if line looks like ingredient (starts with digit/unit)
        if (/^(\d+|[½¼¾⅓⅔])/.test(t)) break;
      }
      title = buff.join(' ').trim();
    }
  }

  // Decide when to switch from ingredients to instructions
  const verbs = ['vispa','lägg','skär','heta','blanda','mixa','riv','sätt','servera','dela','tillsätt','toppa','dekorera','rosta','strö','hacka','koka','stek','häll','låt','rör'];
  const isVerbLine = (s)=>{ const n=norm(s); return verbs.some(v=>n.startsWith(v+' ')); };
  const looksLikeIngredient = (s)=>{
    if (!s) return false;
    if (s.startsWith('- ')) return true;
    if (/^(\d+|[½¼¾⅓⅔])/.test(s)) return true;
    if (/(dl|g|ml|kg|l|tsk|msk|st|cm|%|gram|liter)\b/i.test(s)) return true;
    if (/^salt( och)?( svart)?peppar$/i.test(s)) return true;
    if (/^(topping|dekoration|hummus|citronyoghurt)\b/i.test(s)) return true; // treat headers as ingredient context
    return false;
  };

  let mode = 'auto';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    if (!title && lower.startsWith('namn på rätt')) { title = cleanLine(line.split(/[:\-–—]/)[1] || '').trim(); continue; }
    if (lower.startsWith('antal portioner')) { const m = line.match(/(\d+)/); if (m) servings = parseInt(m[1], 10); continue; }
    if (lower.startsWith('kalorier per rätt')) { calories = cleanLine(line.split(':')[1] || '').trim(); continue; }
    if (lower === 'ingredienser:' || lower.startsWith('ingredienser')) { mode = 'ingredients'; continue; }

    if (mode === 'auto') {
      // until we hit verb/sentence, treat as ingredients
      if (looksLikeIngredient(line)) { ingredients.push(line.replace(/^-\s*/,'')); continue; }
      if (isVerbLine(line) || /\.[\s\)]?$/.test(line)) { mode = 'instructions'; instructions.push(line); continue; }
      // lines like labels keep as ingredient context
      if (/^(topping|dekoration|hummus|citronyoghurt)\b/i.test(line)) { ingredients.push(line+':'); continue; }
      // if empty, skip
      if (!line) continue;
      // default: if we already have some ingredients, consider remaining as instructions
      if (ingredients.length>0) { mode='instructions'; instructions.push(line); continue; }
      // else append to title continuation (rare)
      if (!title) title = line; else title += ' ' + line;
      continue;
    }

    if (mode === 'ingredients') {
      if (looksLikeIngredient(line) || /^(topping|dekoration|hummus|citronyoghurt)\b/i.test(line)) { ingredients.push(line.replace(/^-\s*/,'')); continue; }
      // switch to instructions on verb/sentence
      if (isVerbLine(line) || /\.[\s\)]?$/.test(line)) { mode='instructions'; instructions.push(line); continue; }
      // blank lines keep going
      if (!line) continue;
      // otherwise, still ingredients (free text ingredient)
      ingredients.push(line);
      continue;
    }

    if (mode === 'instructions') {
      if (line) instructions.push(line);
      continue;
    }
  }

  if (!title) {
    const first = lines.find(l => l && !/^namn på rätt/i.test(l));
    if (first) title = first;
  }

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
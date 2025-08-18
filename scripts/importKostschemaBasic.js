const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');
const JSZip = require('jszip');
const { XMLParser } = require('fast-xml-parser');
const cheerio = require('cheerio');

// ---------- Config ----------
const BASE_DIR = path.resolve(process.cwd(), 'Recept-Final', 'Kostschema-basic');
const DOCX_FILE = 'Functional-1.docx';
const PPTX_FILE = 'Functional-1.pptx';
const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

// Blue-ish color palette likely used in slides (hex without #)
const BLUE_HEX_CANDIDATES = new Set([
  '2E75B6', '4F81BD', '5B9BD5', '4472C4', '1F4E79', '6EA9D1', '2A6099', '2196F3', '1976D2',
  '3F6FB5', '3366CC', '2B579A', '255E91', '5A9BD5', '4A86E8'
]);
const THEME_ACCENTS_ALLOWED = new Set(['accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6']);

// Meals order per day (adjust if DOCX has snack/dessert)
const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner'];
const SLOT_LABEL = { breakfast: 'Frukost', lunch: 'Lunch', dinner: 'Middag' };
const DAY_NORMALIZE = {
  'mån': 'Måndag', 'måndag': 'Måndag',
  'tis': 'Tisdag', 'tisdag': 'Tisdag',
  'ons': 'Onsdag', 'onsdag': 'Onsdag',
  'tors': 'Torsdag', 'torsdag': 'Torsdag',
  'fre': 'Fredag', 'fredag': 'Fredag',
  'lör': 'Lördag', 'lördag': 'Lördag',
  'sön': 'Söndag', 'söndag': 'Söndag',
};

// ---------- Utils ----------
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

function normalize(str) {
  return (str || '')
    .toLowerCase()
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[a.length][b.length];
}

async function fileExists(absPath) {
  try { await fsp.access(absPath); return true; } catch { return false; }
}

function isLikelyRecipeName(name) {
  if (!name) return false;
  const n = name.trim();
  if (!n || n.length < 3) return false;
  const lower = n.toLowerCase();
  if (lower.includes('rester')) return false;
  if (lower.includes('frysen')) return false;
  if (/^\d+$/.test(lower)) return false;
  return true;
}

function stripKcalAndRester(text) {
  if (!text) return '';
  let t = String(text);
  // remove kcal parentheses e.g., (337 kcal)
  t = t.replace(/\(\s*\d+\s*kcal\s*\)/gi, '').trim();
  // remove trailing 'rester' even without whitespace before
  t = t.replace(/\s*rester\s*$/i, '').trim();
  return t;
}

function baseTitleFromCell(name) {
  if (!name) return '';
  // If multiple items in one cell like "Laxburgare ... (700 kcal) Mangoglass (123 kcal)", take the part up to first ") "
  const parts = String(name).split(/\)\s+/);
  const first = parts[0] + (parts.length ? ')' : '');
  return stripKcalAndRester(first);
}

// ---------- PPTX Parsing (unchanged) ----------
async function extractBlueTextFromPptx(pptxPath) {
  const buf = await fsp.readFile(pptxPath);
  const zip = await JSZip.loadAsync(buf);
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

  const slideEntries = Object.keys(zip.files)
    .filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)[1], 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)[1], 10);
      return na - nb;
    });

  const collectedTexts = [];

  for (const slidePath of slideEntries) {
    const xmlText = await zip.files[slidePath].async('text');
    const xml = parser.parse(xmlText);
    const spTree = xml?.['p:sld']?.['p:cSld']?.['p:spTree'];
    if (!spTree) continue;

    const shapes = [];
    if (Array.isArray(spTree['p:sp'])) shapes.push(...spTree['p:sp']);
    else if (spTree['p:sp']) shapes.push(spTree['p:sp']);
    const grp = spTree['p:grpSp'];
    if (grp) {
      const inner = Array.isArray(grp) ? grp : [grp];
      for (const g of inner) {
        const gShapes = Array.isArray(g['p:sp']) ? g['p:sp'] : (g['p:sp'] ? [g['p:sp']] : []);
        shapes.push(...gShapes);
      }
    }

    for (const sp of shapes) {
      const spPr = sp?.['p:spPr'] || {};
      const solidFill = spPr?.['a:solidFill'];
      let keep = false;
      if (solidFill) {
        const srgb = solidFill['a:srgbClr'] && solidFill['a:srgbClr']['@_val'] ? String(solidFill['a:srgbClr']['@_val']).toUpperCase() : null;
        const scheme = solidFill['a:schemeClr'] && solidFill['a:schemeClr']['@_val'] ? String(solidFill['a:schemeClr']['@_val']).toLowerCase() : null;
        if (srgb && BLUE_HEX_CANDIDATES.has(srgb)) keep = true;
        if (scheme && THEME_ACCENTS_ALLOWED.has(scheme)) keep = true;
      }
      if (!keep) continue;

      const txBody = sp['p:txBody'];
      if (!txBody) continue;
      const paras = Array.isArray(txBody['a:p']) ? txBody['a:p'] : (txBody['a:p'] ? [txBody['a:p']] : []);
      const parts = [];
      for (const p of paras) {
        const runs = Array.isArray(p['a:r']) ? p['a:r'] : (p['a:r'] ? [p['a:r']] : []);
        for (const r of runs) {
          const t = r['a:t'];
          if (typeof t === 'string') parts.push(t.trim());
        }
      }
      const text = parts.join(' ').replace(/\s+/g, ' ').trim();
      if (text && isLikelyRecipeName(text)) collectedTexts.push(text);
    }

    const gFrames = Array.isArray(spTree['p:graphicFrame']) ? spTree['p:graphicFrame'] : (spTree['p:graphicFrame'] ? [spTree['p:graphicFrame']] : []);
    for (const gf of gFrames) {
      const tbl = gf?.['a:graphic']?.['a:graphicData']?.['a:tbl'];
      if (!tbl) continue;
      const rows = Array.isArray(tbl['a:tr']) ? tbl['a:tr'] : (tbl['a:tr'] ? [tbl['a:tr']] : []);
      for (const row of rows) {
        const cells = Array.isArray(row['a:tc']) ? row['a:tc'] : (row['a:tc'] ? [row['a:tc']] : []);
        for (const cell of cells) {
          const txBody = cell['a:txBody'];
          if (!txBody) continue;
          const paras = Array.isArray(txBody['a:p']) ? txBody['a:p'] : (txBody['a:p'] ? [txBody['a:p']] : []);
          const parts = [];
          for (const p of paras) {
            const runs = Array.isArray(p['a:r']) ? p['a:r'] : (p['a:r'] ? [p['a:r']] : []);
            for (const r of runs) {
              const t = r['a:t'];
              if (typeof t === 'string') parts.push(t.trim());
            }
          }
          const text = parts.join(' ').replace(/\s+/g, ' ').trim();
          if (text && isLikelyRecipeName(text)) collectedTexts.push(text);
        }
      }
    }
  }

  return Array.from(new Set(collectedTexts));
}

// ---------- DOCX Parsing via HTML Tables ----------
async function extractWeekScheduleFromDocx(docxPath) {
  const { value: html } = await mammoth.convertToHtml({ path: docxPath }, { styleMap: [] });
  const $ = cheerio.load(html);

  const weekPlan = { title: 'Vecka 1: Synkroniserad från DOCX/PPTX', days: {} };

  function normalizeDayCell(text) {
    const t = (text || '').toLowerCase().replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
    // Match if cell contains any day token anywhere
    if (t.includes('mån')) return 'Måndag';
    if (t.includes('måndag')) return 'Måndag';
    if (t.includes('tis')) return 'Tisdag';
    if (t.includes('tisdag')) return 'Tisdag';
    if (t.includes('ons')) return 'Onsdag';
    if (t.includes('onsdag')) return 'Onsdag';
    if (t.includes('tors')) return 'Torsdag';
    if (t.includes('tor ')) return 'Torsdag';
    if (t.includes('torsdag')) return 'Torsdag';
    if (t.includes('fre')) return 'Fredag';
    if (t.includes('fredag')) return 'Fredag';
    if (t.includes('lör')) return 'Lördag';
    if (t.includes('lor')) return 'Lördag';
    if (t.includes('lördag')) return 'Lördag';
    if (t.includes('sön')) return 'Söndag';
    if (t.includes('son')) return 'Söndag';
    if (t.includes('söndag')) return 'Söndag';
    return null;
  }

  $('table').each((_, table) => {
    const rows = $(table).find('tr');
    if (rows.length < 2) return; // header + at least one row

    const headers = [];
    $(rows[0]).find('td,th').each((i, cell) => {
      const text = $(cell).text().trim().toLowerCase();
      headers.push(text);
    });

    let dayIdx = headers.findIndex(h => h.includes('dag'));
    let frIdx = headers.findIndex(h => h.includes('frukost'));
    let luIdx = headers.findIndex(h => h.includes('lunch'));
    let miIdx = headers.findIndex(h => h.includes('middag'));
    if (dayIdx === -1 || frIdx === -1 || luIdx === -1 || miIdx === -1) return;

    for (let r = 1; r < rows.length; r++) {
      const cells = $(rows[r]).find('td,th');
      if (cells.length < Math.max(dayIdx, frIdx, luIdx, miIdx) + 1) continue;

      const dayCellRaw = $(cells[dayIdx]).text().trim();
      const day = normalizeDayCell(dayCellRaw);
      if (!day) continue;

      let fr = $(cells[frIdx]).text().trim();
      const lu = $(cells[luIdx]).text().trim();
      const mi = $(cells[miIdx]).text().trim();

      // If "16:8" is present in day cell and breakfast empty, set it
      if ((!fr || fr.length === 0) && /16\s*:\s*8/.test(dayCellRaw)) {
        fr = '16:8';
      }

      weekPlan.days[day] = {
        breakfast: { name: fr },
        lunch: { name: lu },
        dinner: { name: mi },
      };
    }
  });

  return weekPlan;
}

// ---------- Main (unchanged thereafter) ----------
async function main() {
  const prisma = DRY_RUN ? null : new PrismaClient();

  try {
    const pptxPath = path.join(BASE_DIR, PPTX_FILE);
    const docxPath = path.join(BASE_DIR, DOCX_FILE);

    if (!(await fileExists(pptxPath))) throw new Error(`PPTX not found at ${pptxPath}`);
    if (!(await fileExists(docxPath))) throw new Error(`DOCX not found at ${docxPath}`);

    console.log('🔎 Parsing PPTX for blue recipe boxes...');
    const pptxRecipes = await extractBlueTextFromPptx(pptxPath);
    console.log(`🟦 Found ${pptxRecipes.length} recipe titles in PPTX blue boxes`);

    console.log('📄 Parsing DOCX for weekly schedule (table-aware)...');
    const weekPlan = await extractWeekScheduleFromDocx(docxPath);

    const docxNamesSet = new Set();
    for (const day of Object.keys(weekPlan.days)) {
      for (const slot of Object.keys(weekPlan.days[day])) {
        const name = weekPlan.days[day][slot]?.name;
        const base = baseTitleFromCell(name);
        if (isLikelyRecipeName(base)) docxNamesSet.add(base);
      }
    }

    const unionNames = Array.from(new Set([ ...pptxRecipes, ...docxNamesSet ]));

    let dbRecipes = [];
    if (!DRY_RUN) {
      dbRecipes = await prisma.recipe.findMany({ select: { id: true, slug: true, title: true } });
    }
    const normalizedDb = dbRecipes.map((r) => ({ ...r, norm: normalize(r.title) }));

    console.log('🗂️  Upserting recipes from PPTX+DOCX union...');
    const createdOrFound = new Map();

    for (const title of unionNames) {
      const slug = createSlug(title);
      const existing = dbRecipes.find((r) => r.slug === slug);
      if (existing) {
        createdOrFound.set(title, existing);
        continue;
      }
      if (DRY_RUN) {
        const fake = { id: `dry_${slug}`, slug, title };
        createdOrFound.set(title, fake);
        continue;
      }
      const rec = await prisma.recipe.create({
        data: {
          title,
          slug,
          excerpt: null,
          content: null,
          categories: [],
          ingredients: [],
          instructions: null,
          status: 'PUBLISHED',
          isPremium: false,
          isFree: true,
        },
        select: { id: true, slug: true, title: true },
      });
      createdOrFound.set(title, rec);
      console.log(`✅ Created recipe: ${title} (${slug})`);
    }

    function findBestMatch(mealName) {
      const base = baseTitleFromCell(mealName);
      const n = normalize(base);
      let best = null;
      let bestDist = 4;
      for (const r of normalizedDb) {
        const d = levenshtein(n, r.norm);
        if (d < bestDist) { bestDist = d; best = r; }
      }
      if (!best) {
        const slug = createSlug(base);
        const exact = dbRecipes.find((r) => r.slug === slug);
        if (exact) best = exact;
      }
      if (!best && createdOrFound.has(base)) {
        best = createdOrFound.get(base);
      }
      return best;
    }

    for (const day of Object.keys(weekPlan.days)) {
      const meals = weekPlan.days[day];
      for (const slot of Object.keys(meals)) {
        const name = meals[slot]?.name || '';
        if (!name) continue;
        // If leftovers, keep text only
        if (/rester/i.test(name)) {
          meals[slot] = { name };
          continue;
        }
        const match = findBestMatch(name);
        if (match) {
          meals[slot] = {
            name, // keep original with kcal
            recipeLink: `/kunskapsbank/recept/${match.slug}`,
          };
        }
      }
    }

    const outPath = path.resolve(process.cwd(), 'scripts', 'generatedMealPlans.functional1.json');
    await fsp.writeFile(outPath, JSON.stringify({ week1: weekPlan }, null, 2), 'utf8');
    console.log(`\n📦 Wrote week1 plan to: ${outPath}`);

    console.log(`\n🎉 Done${DRY_RUN ? ' (DRY_RUN)' : ''}. You can now wire this JSON into app/data/mealPlans.ts (replace week1) or extend the app to read from DB.`);
  } catch (err) {
    console.error('❌ Import failed:', err.message || err);
    process.exitCode = 1;
  } finally {
    if (prisma) await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
} 
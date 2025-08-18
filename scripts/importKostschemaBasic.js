const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const mammoth = require('mammoth');
const JSZip = require('jszip');
const { XMLParser } = require('fast-xml-parser');

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
const DAY_NAME_MAP = {
  'Mån': 'Måndag', 'Tis': 'Tisdag', 'Ons': 'Onsdag', 'Tors': 'Torsdag', 'Fre': 'Fredag', 'Lör': 'Lördag', 'Sön': 'Söndag',
  'Måndag': 'Måndag', 'Tisdag': 'Tisdag', 'Onsdag': 'Onsdag', 'Torsdag': 'Torsdag', 'Fredag': 'Fredag', 'Lördag': 'Lördag', 'Söndag': 'Söndag'
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
  if (lower === '16:8' || lower.includes('16:8')) return false;
  if (/^\d+$/.test(lower)) return false;
  return true;
}

// ---------- PPTX Parsing ----------
async function extractBlueTextFromPptx(pptxPath) {
  const buf = await fsp.readFile(pptxPath);
  const zip = await JSZip.loadAsync(buf);
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

  // Find slide files
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

    // Path to shapes: p:sld -> p:cSld -> p:spTree -> p:sp[]
    const spTree = xml?.['p:sld']?.['p:cSld']?.['p:spTree'];
    if (!spTree) continue;

    const shapes = [];
    if (Array.isArray(spTree['p:sp'])) shapes.push(...spTree['p:sp']);
    else if (spTree['p:sp']) shapes.push(spTree['p:sp']);

    // Some content might be inside grouped shapes p:grpSp
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

      // Extract text runs: p:txBody -> a:p[] -> a:r[] -> a:t
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

    // Also extract from tables if present (p:graphicFrame -> a:tbl)
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

  // Deduplicate
  const unique = Array.from(new Set(collectedTexts));
  return unique;
}

// ---------- DOCX Parsing ----------
async function extractWeekScheduleFromDocx(docxPath) {
  const { value: rawText } = await mammoth.extractRawText({ path: docxPath });
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  const weekPlan = { title: 'Vecka 1: Synkroniserad från DOCX/PPTX', days: {} };
  let currentDay = null;
  let mealIdx = 0; // 0..MEAL_SLOTS.length-1

  for (const line of lines) {
    if (DAY_NAME_MAP[line]) {
      currentDay = DAY_NAME_MAP[line];
      weekPlan.days[currentDay] = {};
      mealIdx = 0;
      continue;
    }

    if (!currentDay) continue;

    if (mealIdx < MEAL_SLOTS.length) {
      // Strip kcal markers like (450 kcal)
      const cleaned = line.replace(/\s*\([\d\s,]+kcal\)/i, '').trim();
      weekPlan.days[currentDay][MEAL_SLOTS[mealIdx]] = { name: cleaned };
      mealIdx += 1;
    }
  }

  return weekPlan;
}

// ---------- Main ----------
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

    console.log('📄 Parsing DOCX for weekly schedule...');
    const weekPlan = await extractWeekScheduleFromDocx(docxPath);

    // Collect unique names from DOCX schedule
    const docxNamesSet = new Set();
    for (const day of Object.keys(weekPlan.days)) {
      for (const slot of Object.keys(weekPlan.days[day])) {
        const name = weekPlan.days[day][slot]?.name;
        if (isLikelyRecipeName(name)) docxNamesSet.add(name);
      }
    }

    const unionNames = Array.from(new Set([ ...pptxRecipes, ...docxNamesSet ]));

    // Fetch existing recipes
    let dbRecipes = [];
    if (!DRY_RUN) {
      dbRecipes = await prisma.recipe.findMany({ select: { id: true, slug: true, title: true } });
    }
    const normalizedDb = dbRecipes.map((r) => ({ ...r, norm: normalize(r.title) }));

    // Upsert union of names
    console.log('🗂️  Upserting recipes from PPTX+DOCX union...');
    const createdOrFound = new Map(); // title -> { id, slug, title }

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

    // Helper: find best DB match for a meal name
    function findBestMatch(mealName) {
      const n = normalize(mealName);
      let best = null;
      let bestDist = 4; // threshold
      for (const r of normalizedDb) {
        const d = levenshtein(n, r.norm);
        if (d < bestDist) { bestDist = d; best = r; }
      }
      // Try exact slug match as fallback
      if (!best) {
        const slug = createSlug(mealName);
        const exact = dbRecipes.find((r) => r.slug === slug);
        if (exact) best = exact;
      }
      // Also try newly created list from union names
      if (!best && createdOrFound.has(mealName)) {
        best = createdOrFound.get(mealName);
      }
      return best;
    }

    // Link week plan meals to recipe slugs when possible
    for (const day of Object.keys(weekPlan.days)) {
      const meals = weekPlan.days[day];
      for (const slot of Object.keys(meals)) {
        const name = meals[slot]?.name || '';
        if (!name) continue;
        const match = findBestMatch(name);
        if (match) {
          meals[slot] = {
            name,
            recipeLink: `/kunskapsbank/recept/${match.slug}`,
          };
        }
      }
    }

    // Output JSON for week1 mapping
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
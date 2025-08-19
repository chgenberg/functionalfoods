const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const JSZip = require('jszip');
const { XMLParser } = require('fast-xml-parser');
const { PrismaClient } = require('@prisma/client');

const PPTX_PATH = path.resolve(process.cwd(), 'Recept-Final', 'Kostschema-basic', 'Functional-1.pptx');
const BASIC_DIR = path.resolve(process.cwd(), 'Recept', 'basic');
const CSV_PATH = path.resolve(process.cwd(), 'Recept', 'Recept_Functional.csv.backup');

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function stripKcalAndRester(text) {
  if (!text) return '';
  let t = String(text);
  t = t.replace(/\(\s*\d+\s*kcal\s*\)/gi, '').trim();
  t = t.replace(/\s*rester\s*$/i, '').trim();
  return t;
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

async function extractAllTextFromPptx(pptxPath) {
  const buf = await fsp.readFile(pptxPath);
  const zip = await JSZip.loadAsync(buf);
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const slideEntries = Object.keys(zip.files)
    .filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
    .sort((a, b) => parseInt(a.match(/slide(\d+)\.xml/)[1]) - parseInt(b.match(/slide(\d+)\.xml/)[1]));

  const texts = [];
  const collectFromTxBody = (txBody) => {
    const paras = Array.isArray(txBody['a:p']) ? txBody['a:p'] : (txBody['a:p'] ? [txBody['a:p']] : []);
    const parts = [];
    for (const p of paras) {
      const runs = Array.isArray(p['a:r']) ? p['a:r'] : (p['a:r'] ? [p['a:r']] : []);
      for (const r of runs) { const t = r['a:t']; if (typeof t === 'string') parts.push(t.trim()); }
    }
    const text = parts.join(' ').replace(/\s+/g, ' ').trim();
    if (text) texts.push(text);
  };

  for (const slidePath of slideEntries) {
    const xmlText = await zip.files[slidePath].async('text');
    const xml = parser.parse(xmlText);
    const spTree = xml?.['p:sld']?.['p:cSld']?.['p:spTree'];
    if (!spTree) continue;
    const shapes = [];
    if (Array.isArray(spTree['p:sp'])) shapes.push(...spTree['p:sp']);
    else if (spTree['p:sp']) shapes.push(spTree['p:sp']);
    for (const sp of shapes) {
      const txBody = sp['p:txBody'];
      if (txBody) collectFromTxBody(txBody);
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
          if (txBody) collectFromTxBody(txBody);
        }
      }
    }
  }
  return Array.from(new Set(texts));
}

async function extractBlueTextFromPptx(pptxPath) {
  const buf = await fsp.readFile(pptxPath);
  const zip = await JSZip.loadAsync(buf);
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const slideEntries = Object.keys(zip.files)
    .filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
    .sort((a, b) => parseInt(a.match(/slide(\d+)\.xml/)[1]) - parseInt(b.match(/slide(\d+)\.xml/)[1]));

  const BLUE = '276564';
  const texts = [];
  const collectFromTxBody = (txBody) => {
    const paras = Array.isArray(txBody['a:p']) ? txBody['a:p'] : (txBody['a:p'] ? [txBody['a:p']] : []);
    const parts = [];
    for (const p of paras) {
      const runs = Array.isArray(p['a:r']) ? p['a:r'] : (p['a:r'] ? [p['a:r']] : []);
      for (const r of runs) { const t = r['a:t']; if (typeof t === 'string') parts.push(t.trim()); }
    }
    const text = parts.join(' ').replace(/\s+/g, ' ').trim();
    if (text) texts.push(text);
  };

  for (const slidePath of slideEntries) {
    const xmlText = await zip.files[slidePath].async('text');
    const xml = parser.parse(xmlText);
    const spTree = xml?.['p:sld']?.['p:cSld']?.['p:spTree'];
    if (!spTree) continue;

    const shapes = Array.isArray(spTree['p:sp']) ? spTree['p:sp'] : (spTree['p:sp'] ? [spTree['p:sp']] : []);
    for (const sp of shapes) {
      const spPr = sp?.['p:spPr'];
      const solid = spPr?.['a:solidFill'];
      const srgb = solid?.['a:srgbClr']?.['@_val']?.toUpperCase();
      if (srgb === BLUE) {
        const tx = sp['p:txBody'];
        if (tx) collectFromTxBody(tx);
      }
    }

    const gFrames = Array.isArray(spTree['p:graphicFrame']) ? spTree['p:graphicFrame'] : (spTree['p:graphicFrame'] ? [spTree['p:graphicFrame']] : []);
    for (const gf of gFrames) {
      const tbl = gf?.['a:graphic']?.['a:graphicData']?.['a:tbl'];
      if (!tbl) continue;
      const rows = Array.isArray(tbl['a:tr']) ? tbl['a:tr'] : (tbl['a:tr'] ? [tbl['a:tr']] : []);
      for (const row of rows) {
        const cells = Array.isArray(row['a:tc']) ? row['a:tc'] : (row['a:tc'] ? [row['a:tc']] : []);
        for (const tc of cells) {
          const tcPr = tc?.['a:tcPr'];
          const solid = tcPr?.['a:solidFill'];
          const srgb = solid?.['a:srgbClr']?.['@_val']?.toUpperCase();
          if (srgb === BLUE) {
            const tx = tc['a:txBody'];
            if (tx) collectFromTxBody(tx);
          }
        }
      }
    }
  }
  return Array.from(new Set(texts));
}

async function loadLocalRecipeTitles() {
  const titles = new Set();
  // From CSV backup
  try {
    const raw = await fsp.readFile(CSV_PATH, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const title = parts[1]?.replace(/^"|"$/g, '').trim();
        if (title && title !== 'title') titles.add(title);
      }
    }
  } catch {}
  // From file names
  try {
    const files = await fsp.readdir(BASIC_DIR);
    for (const f of files) {
      if (f.toLowerCase().endsWith('.txt')) {
        const name = f.replace(/_/g, ' ').replace(/\.[^.]+$/, '').trim();
        // Heuristic: strip trailing portion descriptors
        titles.add(name.split(' 1 portion')[0].trim());
      }
    }
  } catch {}
  return Array.from(titles);
}

function isLikelyRecipeName(text) {
  const t = stripKcalAndRester(text);
  const n = normalize(t);
  if (!n || n.length < 4) return false;
  // avoid day labels etc
  if (/(mån|tis|ons|tors|fre|lör|sön)/i.test(n)) return false;
  if (/(frukost|lunch|middag)/i.test(n)) return false;
  // contains at least one letter
  return /[a-z]/i.test(n);
}

(async () => {
  const prisma = new PrismaClient();
  try {
    const pptxTexts = await extractBlueTextFromPptx(PPTX_PATH);
    const localTitles = await loadLocalRecipeTitles();
    const localNorm = localTitles.map(t => ({ t, n: normalize(t) }));

    // Pick candidate titles from PPTX by matching against known titles
    const candidates = new Set();
    for (const raw of pptxTexts) {
      if (!isLikelyRecipeName(raw)) continue;
      const base = stripKcalAndRester(raw);
      const n = normalize(base);
      // exact or close match with local title
      let best = null; let dmin = 3;
      for (const lt of localNorm) {
        const d = levenshtein(n, lt.n);
        if (d < dmin) { dmin = d; best = lt; if (d === 0) break; }
      }
      if (best) candidates.add(best.t);
    }

    const titles = Array.from(candidates);
    console.log(`🧾 Candidates from PPTX matched to local titles: ${titles.length}`);
    titles.sort();
    titles.forEach(t => console.log(' -', t));

    // Upsert into Prisma
    let created = 0; let ensured = 0; let errors = 0;
    for (const title of titles) {
      const slug = toSlug(title);
      try {
        const existing = await prisma.recipe.findUnique({ where: { slug } });
        if (existing) { ensured++; continue; }
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
          }
        });
        created++;
      } catch (e) {
        console.error('❌ Upsert failed for', title, e.message || e);
        errors++;
      }
    }

    console.log(`\n✅ Ensured existing: ${ensured}\n✨ Created: ${created}\n⚠️ Errors: ${errors}`);
  } catch (e) {
    console.error('Failed:', e.message || e);
    process.exit(1);
  } finally {
    // eslint-disable-next-line no-unsafe-finally
    await prisma.$disconnect();
  }
})(); 
const path = require('path');
const fs = require('fs').promises;
const JSZip = require('jszip');
const { XMLParser } = require('fast-xml-parser');

const WEEK_JSON = path.resolve(process.cwd(), 'scripts', 'generatedMealPlans.functional1.json');
const PPTX_PATH = path.resolve(process.cwd(), 'Recept-Final', 'Kostschema-basic', 'Functional-1.pptx');
const REPORT_CSV = path.resolve(process.cwd(), 'scripts', 'functional1_week1_match_report.csv');

function stripKcalAndRester(text) {
  if (!text) return '';
  let t = String(text);
  t = t.replace(/\(\s*\d+\s*kcal\s*\)/gi, '').trim();
  t = t.replace(/\s+rester\s*$/i, '').trim();
  return t;
}

function removeUnbalancedParens(s) {
  if (!s) return '';
  let t = String(s).trim();
  const open = (t.match(/\(/g) || []).length;
  const close = (t.match(/\)/g) || []).length;
  if (open === 0 && close > 0) {
    // drop trailing ) chars
    t = t.replace(/\)+$/g, '').trim();
  }
  return t;
}

function baseTitleFromCell(name) {
  if (!name) return '';
  const parts = String(name).split(/\)\s+/);
  const first = parts[0] + (parts.length > 1 ? ')' : '');
  return removeUnbalancedParens(stripKcalAndRester(first));
}

function normalize(s) {
  const cleaned = removeUnbalancedParens(s);
  return (cleaned || '')
    .toLowerCase()
    .replace(/[åäà]/g, 'a')
    .replace(/[öø]/g, 'o')
    .replace(/[ü]/g, 'u')
    .replace(/[éè]/g, 'e')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
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

function tokenize(s) {
  return normalize(s)
    .split(' ')
    .filter(Boolean)
    .filter(w => !['med','och','valfritt','palagg','plus','och/eller','eller','rester','dl','kcal','g','ml','kg','l','st','1','2','3','4','5','6','7','8','9','0','mm'].includes(w));
}

async function extractAllTextFromPptx(pptxPath) {
  const buf = await fs.readFile(pptxPath);
  const zip = await JSZip.loadAsync(buf);
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

  const slideEntries = Object.keys(zip.files)
    .filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)\.xml/)[1], 10);
      const nb = parseInt(b.match(/slide(\d+)\.xml/)[1], 10);
      return na - nb;
    });

  const texts = [];

  for (const slidePath of slideEntries) {
    const xmlText = await zip.files[slidePath].async('text');
    const xml = parser.parse(xmlText);
    const spTree = xml?.['p:sld']?.['p:cSld']?.['p:spTree'];
    if (!spTree) continue;

    const collectFromTxBody = (txBody) => {
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
      if (text) texts.push(removeUnbalancedParens(text));
    };

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

async function main() {
  const raw = await fs.readFile(WEEK_JSON, 'utf8');
  const data = JSON.parse(raw);
  const week = data.week1;
  if (!week || !week.days) throw new Error('Invalid week JSON');

  // Collect meal base titles
  const planTitles = [];
  for (const day of Object.keys(week.days)) {
    const meals = week.days[day];
    for (const slot of Object.keys(meals)) {
      const original = meals[slot]?.name || '';
      const base = baseTitleFromCell(original);
      if (base) planTitles.push({ day, slot, original, base, norm: normalize(base) });
    }
  }

  const pptxTexts = await extractAllTextFromPptx(PPTX_PATH);
  const pptxNorm = pptxTexts.map((t) => normalize(baseTitleFromCell(t)));
  const pptxTokens = pptxNorm.map(t => new Set(tokenize(t)));

  const rows = [];
  let matchedCount = 0;

  for (const item of planTitles) {
    let status = 'NO_MATCH';
    let method = '';
    let sample = '';

    // manual override for items known to be images in PPTX
    if (item.norm === 'gron juice') {
      status = 'MATCH';
      method = 'override(image-cell)';
    }

    // exact/contains
    if (status !== 'MATCH') {
      let idx = pptxNorm.findIndex((p) => p && (p === item.norm));
      if (idx !== -1) {
        status = 'MATCH'; method = 'exact'; sample = pptxTexts[idx];
      } else {
        idx = pptxNorm.findIndex((p) => p && (p.includes(item.norm) || item.norm.includes(p)));
        if (idx !== -1) { status = 'MATCH'; method = 'contains'; sample = pptxTexts[idx]; }
      }
    }

    // fuzzy
    if (status !== 'MATCH') {
      let best = { d: Infinity, i: -1 };
      for (let i = 0; i < pptxNorm.length; i++) {
        const p = pptxNorm[i];
        if (!p) continue;
        const d = levenshtein(item.norm, p);
        if (d < best.d) best = { d, i };
        if (d <= 3) break;
      }
      if (best.d <= 3 && best.i >= 0) { status = 'MATCH'; method = `lev<=3(${best.d})`; sample = pptxTexts[best.i]; }
    }

    // token overlap
    if (status !== 'MATCH') {
      const want = tokenize(item.base);
      for (let i = 0; i < pptxTokens.length; i++) {
        const got = pptxTokens[i];
        let overlap = 0;
        for (const w of want) if (got.has(w)) overlap++;
        if (overlap >= Math.min(2, want.length)) { status = 'MATCH'; method = `tokens(${overlap})`; sample = pptxTexts[i]; break; }
      }
    }

    if (status === 'MATCH') matchedCount++;

    rows.push({
      day: item.day,
      meal: item.slot,
      name: item.original,
      base: item.base,
      matched: status,
      method,
      pptxSample: sample,
    });
  }

  // Write CSV report (semicolon for sv-SE Excel)
  const header = ['Dag', 'Måltid', 'Plan-namn', 'Bas-namn', 'Match', 'Metod', 'PPTX-exempel'];
  const csv = [header.join(';')].concat(rows.map(r => [r.day, r.meal, r.name, r.base, r.matched, r.method, r.pptxSample].map(v => '"' + String(v || '').replace(/"/g, '""') + '"').join(';')));
  await fs.writeFile(REPORT_CSV, csv.join('\n'), 'utf8');

  console.log(`PPTX text entries: ${pptxTexts.length}`);
  console.log(`Meals in plan: ${planTitles.length}`);
  console.log(`Matched: ${matchedCount}`);
  console.log(`Missing: ${planTitles.length - matchedCount}`);
  console.log(`Report: ${REPORT_CSV}`);

  if (matchedCount !== planTitles.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error('Validation error:', e.message || e);
  process.exit(1);
}); 
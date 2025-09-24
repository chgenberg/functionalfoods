const fs = require('fs');
const path = require('path');

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function levenshtein(a, b) {
  const m = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) m[i][0] = i;
  for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      m[i][j] = Math.min(
        m[i - 1][j] + 1,
        m[i][j - 1] + 1,
        m[i - 1][j - 1] + cost
      );
    }
  }
  return m[a.length][b.length];
}

function bestMatchSlugToImages(slug, images) {
  const ns = normalize(slug);
  let best = null;
  let bestScore = Infinity;
  for (const img of images) {
    const base = img.replace(/\.(webp|jpg|jpeg|png)$/i, '');
    const score = levenshtein(ns, base);
    if (score < bestScore) { bestScore = score; best = img; }
  }
  return { filename: best, score: bestScore };
}

function runForCourse(jsonRelPath, imagesDirRel) {
  const jsonPath = path.join(process.cwd(), jsonRelPath);
  const publicImagesDir = path.join(process.cwd(), 'public', imagesDirRel);
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ JSON saknas:', jsonPath);
    return { file: jsonRelPath, changed: 0, total: 0, missingImages: 0 };
  }
  if (!fs.existsSync(publicImagesDir)) {
    console.error('❌ Bildmapp saknas:', publicImagesDir);
    return { file: jsonRelPath, changed: 0, total: 0, missingImages: 0 };
  }

  const images = fs.readdirSync(publicImagesDir).filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f)).map(f => f.toLowerCase());
  const docs = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let changed = 0;
  let missing = 0;

  for (const doc of docs) {
    const slug = doc.slug || normalize(doc.title || '');
    const { filename } = bestMatchSlugToImages(slug, images);
    if (!filename) { missing++; continue; }
    const webPath = `/${imagesDirRel}/${filename}`;
    if (doc.headerImage !== webPath) {
      doc.headerImage = webPath;
      changed++;
    }
  }

  if (changed > 0) {
    fs.writeFileSync(jsonPath, JSON.stringify(docs, null, 2), 'utf8');
  }
  return { file: jsonRelPath, changed, total: docs.length, missingImages: missing };
}

(function main(){
  const res = [];
  res.push(runForCourse('data/knowledge-documents-basic.json', 'Kunskapsdokument/Functional Basics/Bilder'));
  res.push(runForCourse('data/knowledge-documents-flow.json', 'Kunskapsdokument/Functional Flow/Bilder'));
  console.log(JSON.stringify({ ok: true, results: res }, null, 2));
})();



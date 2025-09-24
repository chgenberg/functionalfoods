const fs = require('fs');
const path = require('path');

function updateHeaderImages(filePath, fixes) {
  const abs = path.resolve(filePath);
  const basePublic = path.join(process.cwd(), 'public');
  if (!fs.existsSync(abs)) {
    console.error('❌ JSON saknas:', abs);
    return { file: filePath, changed: 0, total: 0 };
  }
  const docs = JSON.parse(fs.readFileSync(abs, 'utf8'));
  let changed = 0;
  for (const doc of docs) {
    const fix = fixes[doc.slug];
    if (!fix) continue;
    const target = path.join(basePublic, fix.replace(/^\//, ''));
    if (fs.existsSync(target)) {
      if (doc.headerImage !== fix) {
        doc.headerImage = fix;
        changed++;
      }
    } else {
      console.warn('⚠️  Hittar inte filen på disk för', doc.slug, '→', fix);
    }
  }
  if (changed > 0) {
    fs.writeFileSync(abs, JSON.stringify(docs, null, 2));
  }
  return { file: filePath, changed, total: docs.length };
}

(function run() {
  const basicFixes = {
    'vad-a-r-functional-foods': '/Kunskapsdokument/Functional Basics/Bilder/vad-a-r-functional-foods.webp',
    'ma-ldokument-styrelsemo-te-2': '/Kunskapsdokument/Functional Basics/Bilder/ma-ldokument-styrelsemo-te-1.webp',
    'fo-rdelarna-med-functional-foods': '/Kunskapsdokument/Functional Basics/Bilder/functional-foods-som-livsstil.webp',
  };

  const flowFixes = {
    'vad-a-r-functional-foods': '/Kunskapsdokument/Functional Flow/Bilder/vad-a-r-functional-foods.webp',
    'vanliga-mag-och-tarmproblem': '/Kunskapsdokument/Functional Flow/Bilder/vanliga-mag-ocj-tarmproblem-1.webp',
  };

  const results = [];
  results.push(updateHeaderImages('public/data/knowledge-documents-basic.json', basicFixes));
  results.push(updateHeaderImages('public/data/knowledge-documents-flow.json', flowFixes));

  console.log(JSON.stringify({ ok: true, results }, null, 2));
})();



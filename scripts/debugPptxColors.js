const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const { XMLParser } = require('fast-xml-parser');

const PPTX = path.resolve(process.cwd(), 'Recept-Final', 'Kostschema-basic', 'Functional-1.pptx');

(async () => {
  const buf = fs.readFileSync(PPTX);
  const zip = await JSZip.loadAsync(buf);
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

  const slides = Object.keys(zip.files)
    .filter(k => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'))
    .sort((a,b)=>parseInt(a.match(/slide(\d+)\.xml/)[1]) - parseInt(b.match(/slide(\d+)\.xml/)[1]));

  const colorCount = new Map();
  const inc = (key) => colorCount.set(key, (colorCount.get(key)||0)+1);

  for (const s of slides) {
    const xml = parser.parse(await zip.files[s].async('text'));
    const tree = xml?.['p:sld']?.['p:cSld']?.['p:spTree'];
    if (!tree) continue;

    const pushShape = (sp) => {
      const spPr = sp?.['p:spPr'];
      const solid = spPr?.['a:solidFill'];
      if (solid) {
        const srgb = solid?.['a:srgbClr']?.['@_val'];
        const scheme = solid?.['a:schemeClr']?.['@_val'];
        if (srgb) inc('shape:srgb:'+srgb.toUpperCase());
        if (scheme) inc('shape:scheme:'+scheme.toLowerCase());
      }
    };

    const shapes = Array.isArray(tree['p:sp']) ? tree['p:sp'] : (tree['p:sp'] ? [tree['p:sp']] : []);
    shapes.forEach(pushShape);

    const gFrames = Array.isArray(tree['p:graphicFrame']) ? tree['p:graphicFrame'] : (tree['p:graphicFrame'] ? [tree['p:graphicFrame']] : []);
    for (const gf of gFrames) {
      const tbl = gf?.['a:graphic']?.['a:graphicData']?.['a:tbl'];
      if (!tbl) continue;
      const rows = Array.isArray(tbl['a:tr']) ? tbl['a:tr'] : (tbl['a:tr'] ? [tbl['a:tr']] : []);
      for (const row of rows) {
        const cells = Array.isArray(row['a:tc']) ? row['a:tc'] : (row['a:tc'] ? [row['a:tc']] : []);
        for (const tc of cells) {
          const tcPr = tc?.['a:tcPr'];
          const solid = tcPr?.['a:solidFill'];
          if (solid) {
            const srgb = solid?.['a:srgbClr']?.['@_val'];
            const scheme = solid?.['a:schemeClr']?.['@_val'];
            if (srgb) inc('cell:srgb:'+srgb.toUpperCase());
            if (scheme) inc('cell:scheme:'+scheme.toLowerCase());
          }
        }
      }
    }
  }

  const entries = Array.from(colorCount.entries()).sort((a,b)=>b[1]-a[1]);
  console.log('Top colors:');
  for (const [k,v] of entries.slice(0,50)) console.log(v, k);
})(); 
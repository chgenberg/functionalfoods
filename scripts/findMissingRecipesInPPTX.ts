import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

const pptxDir = path.resolve(__dirname, '../public/kurser');

const missingSlugs = [
  'kyckling-i-curry-med-kokosmjolk',
  'paronmusli-med-mandlar',
  'kott-i-mustig-tomatsas',
  'linssoppa-med-curry-och-spiskummin',
  'notgryta-med-sotpotatis',
  'glasnudelsallad-med-gronsaker',
  'halloumiburgare-med-rodbetor',
  'wokad-lovbiff-med-nudlar',
  'rotfruktssoppa',
  'kottfarssas-med-konjaksnudlar',
  'asiatisk-tonfisksallad',
  'squashspagetti-med-gronsakssos',
  'grillade-kottspett-med-grekisk-sallad',
];

const slugToTitle = (slug: string) =>
  slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Kott/g, 'Kött')
    .replace(/Sas/g, 'sås')
    .replace(/O/g, 'ö');

(async () => {
  const files = fs
    .readdirSync(pptxDir)
    .filter((f) => f.toLowerCase().includes('functional') && f.toLowerCase().endsWith('.pptx') );

  console.log('Scanning PPTX files:', files);

  const parser = new XMLParser({ ignoreAttributes: false });

  const found: Record<string, string> = {};

  for (const file of files) {
    const filePath = path.join(pptxDir, file);
    const data = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(data);

    const slideEntries = Object.keys(zip.files).filter((k) => k.startsWith('ppt/slides/slide'));

    let slideText = '';
    for (const entry of slideEntries) {
      const xmlStr = await zip.files[entry].async('string');
      const obj = parser.parse(xmlStr);
      // traverse recursively to collect text in <a:t>
      const collectText = (node: any) => {
        if (!node) return;
        if (typeof node === 'object') {
          for (const val of Object.values(node)) {
            collectText(val);
          }
        } else if (typeof node === 'string') {
          slideText += ' ' + node;
        }
      };
      collectText(obj);
    }
    const lowerText = slideText.toLowerCase();
    for (const slug of missingSlugs) {
      if (found[slug]) continue;
      const title = slugToTitle(slug).toLowerCase();
      if (lowerText.includes(title)) {
        found[slug] = file;
        console.log(`✅ Found "${title}" in ${file}`);
      }
    }
  }

  const notFound = missingSlugs.filter((s) => !found[s]);
  console.log('\nSummary');
  console.log('Found:', Object.keys(found).length);
  console.log('Not found:', notFound.length);
  if (notFound.length) console.log(notFound.join(', '));
})(); 
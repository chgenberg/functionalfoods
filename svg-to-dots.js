const fs = require('fs');

// Läs in SVG-filen
const svg = fs.readFileSync('bodymap/dots.svg', 'utf8');

// Matcha alla <circle ...><title>...</title></circle>
const regex = /<circle\s+([^>]+)>\s*<title>([^<]+)<\/title>\s*<\/circle>/g;

let match;
const dots = [];

while ((match = regex.exec(svg)) !== null) {
  const attrs = match[1];
  const label = match[2].trim();

  // Extrahera id, cx, cy
  const id = /id="([^"]+)"/.exec(attrs)?.[1] || '';
  const cx = parseFloat(/cx="([^"]+)"/.exec(attrs)?.[1] || '0');
  const cy = parseFloat(/cy="([^"]+)"/.exec(attrs)?.[1] || '0');

  dots.push({ id, label, cx, cy });
}

console.log(dots);
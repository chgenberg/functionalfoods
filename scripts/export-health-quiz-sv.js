const fs = require('fs');
const path = require('path');

const src = path.resolve('app/components/HealthQuiz.tsx');
const out = path.resolve('public/health_quiz_sv.txt');

const file = fs.readFileSync(src, 'utf8');

// Extract QUIZ_SV array block
const startIdx = file.indexOf('const QUIZ_SV');
if (startIdx === -1) {
  console.error('QUIZ_SV not found');
  process.exit(1);
}
const slice = file.slice(startIdx);
const arrayStart = slice.indexOf('[');
const arrayEnd = slice.indexOf('];');
if (arrayStart === -1 || arrayEnd === -1) {
  console.error('Could not locate array bounds');
  process.exit(1);
}
const arrayBlock = slice.slice(arrayStart, arrayEnd + 1);

// Parse questions and options via regex (tolerant parsing)
const questionRegex = /question:\s*"([^"]+)"[\s\S]*?subtitle:\s*"([^"]*)"[\s\S]*?icon:\s*"([^"]+)"[\s\S]*?options:\s*\[([\s\S]*?)\]\s*,/g;
const optionRegex = /label:\s*"([^"]+)"[\s\S]*?description:\s*"([^"]*)"[\s\S]*?value:\s*"([^"]+)"[\s\S]*?icon:\s*"([^"]+)"/g;

let m;
const lines = [];
let qIndex = 0;
while ((m = questionRegex.exec(arrayBlock)) !== null) {
  qIndex += 1;
  const [_, question, subtitle, icon, optionsBlock] = m;
  lines.push(`Fråga ${qIndex}: ${question}`);
  if (subtitle) lines.push(`Beskrivning: ${subtitle}`);
  if (icon) lines.push(`Ikon: ${icon}`);
  lines.push('Alternativ:');
  let om;
  let optIdx = 0;
  while ((om = optionRegex.exec(optionsBlock)) !== null) {
    optIdx += 1;
    const [__, label, description, value, optIcon] = om;
    lines.push(`  - ${optIdx}. ${label}` + (optIcon ? ` (${optIcon})` : ''));
    if (description) lines.push(`      ${description}`);
    lines.push(`      value: ${value}`);
  }
  lines.push('');
}

const header = 'Functional Foods – Hälsoquiz (svenska)\n====================================\n\n';
fs.writeFileSync(out, header + lines.join('\n'), 'utf8');
console.log('Exported to', out);

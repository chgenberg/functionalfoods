const fs = require('fs');
const path = require('path');

const TS_PATH = path.resolve(process.cwd(), 'app', 'data', 'mealPlans.ts');
const WEEK_JSON = path.resolve(process.cwd(), 'scripts', 'generatedMealPlans.functional1.json');

function read(file) { return fs.readFileSync(file, 'utf8'); }

function stringifyWeek(weekObj) {
  // Pretty-print WeekMealPlan.days with 2-space indents matching file style
  const json = JSON.stringify(weekObj, null, 2)
    .replace(/"([^\"]+)":/g, '"$1":') // keep keys as strings
  return json;
}

(function main() {
  const ts = read(TS_PATH);
  const data = JSON.parse(read(WEEK_JSON));
  const week1 = data.week1;
  if (!week1 || !week1.days) {
    console.error('Invalid week1 JSON.');
    process.exit(1);
  }

  // Find the week1 block range: from "  "week1": {" to just before "  "week2": {"
  const startMarker = /\n\s*"week1"\s*:\s*\{/g;
  const startMatch = startMarker.exec(ts);
  if (!startMatch) {
    console.error('Could not find week1 start in mealPlans.ts');
    process.exit(1);
  }
  const startIdx = startMatch.index + startMatch[0].length;

  const week2Idx = ts.indexOf('\n  "week2"', startIdx);
  if (week2Idx === -1) {
    console.error('Could not find week2 marker to delimit week1 block');
    process.exit(1);
  }

  // Reconstruct the new week1 block as valid TS object body
  const newWeek1Body = `\n    "title": ${JSON.stringify(week1.title)},\n    "days": ${stringifyWeek(week1.days).replace(/^/gm, '    ')}`;

  // Build new file content
  const before = ts.slice(0, startMatch.index + startMatch[0].length);
  // Find the closing brace for week1 before week2 start. We assume structure is well-formed.
  const replaced = before + newWeek1Body + '\n  },';
  // Skip old content up to just before week2 marker's opening quote
  const after = ts.slice(week2Idx);

  const updated = ts.slice(0, startMatch.index) + ts.slice(startMatch.index, startMatch.index + startMatch[0].length) + newWeek1Body + '\n  ,' + ts.slice(week2Idx);

  // Simpler and safer: rebuild explicitly
  const tsHead = ts.slice(0, startMatch.index + startMatch[0].length);
  const tsTail = ts.slice(week2Idx);
  const finalContent = tsHead + newWeek1Body + '\n  ,' + tsTail;

  fs.writeFileSync(TS_PATH, finalContent);
  console.log('✅ Updated week1 in', TS_PATH);
})(); 
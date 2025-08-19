const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const cheerio = require('cheerio');

const BASE_DIR = path.resolve(process.cwd(), 'Recept-Final', 'Kostschema-basic');
const MEAL_PLANS_PATH = path.resolve(process.cwd(), 'app', 'data', 'mealPlans.ts');

const DAY_NORMALIZE = {
  'mån': 'Måndag', 'måndag': 'Måndag',
  'tis': 'Tisdag', 'tisdag': 'Tisdag', 
  'ons': 'Onsdag', 'onsdag': 'Onsdag',
  'tors': 'Torsdag', 'torsdag': 'Torsdag', 'tor': 'Torsdag',
  'fre': 'Fredag', 'fredag': 'Fredag',
  'lör': 'Lördag', 'lördag': 'Lördag', 'lor': 'Lördag',
  'sön': 'Söndag', 'söndag': 'Söndag', 'son': 'Söndag'
};

function normalizeDayCell(text) {
  const t = (text || '').toLowerCase().replace(/\./g, ' ').replace(/\s+/g, ' ').trim();
  for (const [key, value] of Object.entries(DAY_NORMALIZE)) {
    if (t.includes(key)) return value;
  }
  return null;
}

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

function stripKcalAndRester(text) {
  if (!text) return '';
  let t = String(text);
  t = t.replace(/\(\s*\d+\s*kcal\s*\)/gi, '').trim();
  t = t.replace(/\s*rester\s*$/i, '').trim();
  return t;
}

async function extractWeekScheduleFromDocx(docxPath) {
  const { value: html } = await mammoth.convertToHtml({ path: docxPath }, { styleMap: [] });
  const $ = cheerio.load(html);

  const weekPlan = { title: `Vecka: Synkroniserad från DOCX`, days: {} };

  $('table').each((_, table) => {
    const rows = $(table).find('tr');
    if (rows.length < 2) return;

    const headers = [];
    $(rows[0]).find('td,th').each((i, cell) => {
      const text = $(cell).text().trim().toLowerCase();
      headers.push(text);
    });

    let dayIdx = headers.findIndex(h => h.includes('dag'));
    let frIdx = headers.findIndex(h => h.includes('frukost'));
    let luIdx = headers.findIndex(h => h.includes('lunch'));
    let miIdx = headers.findIndex(h => h.includes('middag'));
    if (dayIdx === -1 || frIdx === -1 || luIdx === -1 || miIdx === -1) return;

    for (let r = 1; r < rows.length; r++) {
      const cells = $(rows[r]).find('td,th');
      if (cells.length < Math.max(dayIdx, frIdx, luIdx, miIdx) + 1) continue;

      const dayCellRaw = $(cells[dayIdx]).text().trim();
      const day = normalizeDayCell(dayCellRaw);
      if (!day) continue;

      let fr = $(cells[frIdx]).text().trim();
      const lu = $(cells[luIdx]).text().trim();
      const mi = $(cells[miIdx]).text().trim();

      // Handle 16:8 in day cell
      if ((!fr || fr.length === 0) && /16\s*:\s*8/.test(dayCellRaw)) {
        fr = '16:8';
      }

      const createMealItem = (name) => {
        if (!name) return { name: '' };
        if (/rester/i.test(name)) return { name };
        if (name === '16:8') return { name };
        
        const base = stripKcalAndRester(name);
        const slug = createSlug(base);
        return {
          name,
          recipeLink: `/kunskapsbank/recept/${slug}`
        };
      };

      weekPlan.days[day] = {
        breakfast: createMealItem(fr),
        lunch: createMealItem(lu),
        dinner: createMealItem(mi)
      };
    }
  });

  return weekPlan;
}

(async () => {
  try {
    const allWeeks = {};
    
    for (let weekNum = 1; weekNum <= 6; weekNum++) {
      const fileName = `Functional-${weekNum}.docx`;
      const filePath = path.join(BASE_DIR, fileName);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${fileName}, skipping`);
        continue;
      }

      console.log(`📄 Processing ${fileName}...`);
      const weekPlan = await extractWeekScheduleFromDocx(filePath);
      weekPlan.title = `Vecka ${weekNum}: Synkroniserad från DOCX`;
      allWeeks[`week${weekNum}`] = weekPlan;
    }

    // Read current mealPlans.ts to preserve structure
    const currentContent = fs.readFileSync(MEAL_PLANS_PATH, 'utf8');
    
    // Extract the interfaces and comments at the top
    const interfaceMatch = currentContent.match(/(export interface[\s\S]*?^\/\/ Functional Basics meal plans[\s\S]*?= \{)/m);
    if (!interfaceMatch) {
      throw new Error('Could not find mealPlans structure in file');
    }
    
    const prefix = interfaceMatch[1];
    
    // Find the end of mealPlans object
    const endMatch = currentContent.match(/^(\/\/ Functional Flow meal plans[\s\S]*)/m);
    const suffix = endMatch ? endMatch[1] : '';

    // Generate new content
    const newContent = `${prefix}
${JSON.stringify(allWeeks, null, 2).slice(1, -1)},
};

${suffix}`;

    fs.writeFileSync(MEAL_PLANS_PATH, newContent);
    console.log('✅ Updated app/data/mealPlans.ts with schedules from Functional-1..6.docx');
    
    console.log('\n📊 Summary:');
    Object.keys(allWeeks).forEach(week => {
      const days = Object.keys(allWeeks[week].days).length;
      console.log(`  ${week}: ${days} days`);
    });

  } catch (e) {
    console.error('❌ Sync failed:', e.message || e);
    process.exit(1);
  }
})(); 
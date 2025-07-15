import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hårdkodade inköpslistor för varje vecka
const hardcodedShoppingLists: Record<number, Record<string, string[]>> = {
  1: {
    'Frukt & Grönt': [
      '1.25 rödlök', '0.5 äpple', '2 citronklyftor', '7.5 klyftor vitlök',
      '2 selleristjälkar', '1,25 blomkålshuvud', '40 gram bladspenat',
      '1 apelsin', '2.5 lime', '150 gram sockerärtor', '2 rädisor',
      '4 cocktailtomater', '1 spetskålshuvud', '1 dl oliver', '1 passionsfrukt',
      '7 bifftomater', '2.5 paprika', '1 hjärtsallad', '1.75 gul lök',
      '3.5 morötter', '1.25 squash', '7 dl rucola', '0.5 gurka',
      'ca 2.5 cm ingefära', '4 dl isbergssallad', '0.75 färsk mango',
      '0.75 dl granatäppelkärnor', '25 gram ärtskott', '1 banan',
      '2.5 salladslök', '275 gram frysta sojabönor', '350 gram fryst mango',
      '100 gram fryst ananas'
    ],
    'Kryddor & Smaksättare': [
      'salt', 'svartpeppar', '1 msk kanel', '7 msk färsk persilja',
      '2 tsk srirachasås', '1 kvist färsk basilika', '0.5 krm chiliflakes',
      '1 msk ketjap manis', '1 tsk soja', '1.5 msk röd pesto',
      '4 msk färsk timjan', '0.5 msk curry', '1,25 tsk torkade örter',
      '1 tsk kardemumma', '2 msk färsk koriander', '1 tsk örtagårdskrydda',
      '1 hönsbuljongtärning', '1 msk furikakekrydda'
    ],
    'Mejeri': [
      '4,25 dl grekisk yoghurt', '4 msk grädde', '3 tsk smör',
      '0.5 dl gräddfil', '25 gram fetaost', '3 dl keso'
    ],
    'Kött, Fisk & Ägg': [
      '125 gram tonfisk i vatten', '10 ägg', '50 gram kallrökt lax',
      '800 gram kycklinglårfilé', '250 gram laxfilé', '800 gram nötfärs',
      '250 gram kycklingfilé', '250 gram kabanoss', '100 gram kräftstjärtar i lag'
    ],
    'Torrvaror': [
      '400 gram krossade tomater', '1 dl valnötter', '1 dl mandel',
      '4 dl mandelmjöl', '1 msk rapsolja', '2 dl kokosflingor',
      '5 msk olivolja', '1 dl rostad lök', '2 msk pistagenötter',
      '1 dl paranötter', '1 dl hasselnötter', '1 dl pekannötter',
      '1 msk fiberhonung Nicks', '2.5 dl kokosskivor', '1.5 dl sesamfrön',
      '4 dl havregryn', '4 torkade aprikoser', '1 dl pumpafrön',
      '1 dl solroskärnor', '1.5 dl hampafrön', '1.5 tsk bakpulver'
    ],
    'Övrigt': [
      '1.5 tsk flytande honung', '25 gram picklad rödlök', '1 dl mandelmjölk',
      '2 msk majonäs', '1.5 msk gröna oliver', '0.5 dl ajvar relish',
      'valfritt pålägg till en fralla'
    ]
  },
  2: {
    'Frukt & Grönt': [
      '4 klyftor vitlök', '1,3kg morötter', '100 gram blomkål',
      'ca 5 cm färsk ingefära', '4 skogschampinjoner', '1.5 dl granatäppelkärnor',
      '1 äpple', '0.5 gul lök', '1 rödlök', '10 cocktailtomater',
      '2 tomater', '1 sötpotatis', '250 gram brysselkål', '14 färska jordgubbar',
      '1 chili', '1 paprika', '1 päron', '1 salladslök', '100 gram broccoli',
      '200 gram sockerärtor', '1 apelsin', '1 msk gräslök', '5 cm gurka',
      '1 citron', '1 hjärtsallad', '1 palsternacka', '1 banan', '1 dl purjolök',
      '0.5 mango', '20 gram bladspenat', '250 gram grön sparris',
      '2 dl frysta hallon', '2 dl frysta blåbär'
    ],
    'Kryddor & Smaksättare': [
      'salt', 'svartpeppar', '0.5 msk curry mango krydda', '0.5 msk ketjap manis',
      '2 krukor färsk persilja', '5 dl färsk persilja', '1 krm torkad oregano',
      '1 kruka färsk basilika', '1 tsk örtagårdskrydda', '2 msk färsk timjan',
      '0.5 hönsbuljongtärning', '2 msk färsk koriander', '2 färska dillkvistar',
      '0.5 msk köftekrydda', '1 msk färsk mynta', '3 msk teriyakisås'
    ],
    'Mejeri': [
      '3 dl grekisk yoghurt', '150 gram fetaost', '75 gram chevreost',
      '2 tsk smör', '50 gram philadelphiaost'
    ],
    'Kött, Fisk & Ägg': [
      '5 ägg', '300 gram lammfärs', '600 gram laxfilé', '300 gram torskrygg',
      '0.5 grillad kyckling', '350 gram nötfärs'
    ],
    'Torrvaror': [
      '5.5 tsk olivolja', '0.25 dl saltade jordnötter', '3 soltorkade tomater',
      '1 dl pekannötter', '80 gram glasnudlar', '1 msk torkade tranbär',
      '1 dl valnötter', '2 msk pinjenötter'
    ],
    'Övrigt': [
      '2 dl mandelmjölk', '0.5 dl kokosnötskräm', '1 msk majonäs'
    ]
  },
  3: {
    'Frukt & Grönt': [
      '1 aubergine', '1.5 granatäpplen', '3.25 citroner', 'ca 12 cm purjolök',
      '1 avokado', '1 dl rucola', 'ca 8 cm ingefära', '5 morötter',
      '0.5 broccolistånd', '3 hjärtsallad', '100 gram färsk mango', '0.5 rödlök',
      '0.5 äpple', '3.5 klyftor vitlök', '1 salladsblad', '0.75 blomkålshuvud',
      '5 cocktailtomater', '1 kg rödbetor', '1 gul lök', '2.5 paprikor',
      '3 selleristjälkar', '100 gram vattenmelon', '1 dl färska blåbär',
      '25 cm gurka', '2 färska jordgubbar', '1 rättika', '2 dl frysta hallon'
    ],
    'Kryddor & Smaksättare': [
      'salt', 'svartpeppar', '3 krm örtagårdskrydda', '2 krm paprikapulver',
      '1 msk tandoorikrydda', '0.75 tsk curry', '1 krm spiskummin',
      '20 gram kerala curry kryddmix', '3 msk mango chutney',
      '1 msk ketjap manis', '1 msk sötstark senap', '5 msk färsk dill',
      '2.5 dl färsk persilja', '1 msk färsk mynta'
    ],
    'Mejeri': [
      '2.25 dl grekisk yoghurt', '50 gram fetaost', '2 tsk smör', '1 dl keso',
      '0.75 dl creme fraiche', '3 msk grädde', '225 gram Apetina panéer'
    ],
    'Kött, Fisk & Ägg': [
      '0.75 grillad kyckling', '130 gram rökt lax', '300 gram högrevsburgare',
      '300 gram laxfilé', '6 ägg', '300 gram kycklinglårfilé'
    ]
  },
  4: {
    'Frukt/grönt': [ '2 morötter', '3.25 paprikor', '4 klyftor vitlök', 'ca 5 cm ingefära', '0.75 lime', '2 cocktailtomater', '1.25 rödlök', '1.25 apelsiner', '1 granatäpple', '1 gul lök', '45 gram bladspenat', '2 bananer', '0.5 fänkål', 'ca 12 cm purjolök', '5 aprikoser', '15 färska hallon', '1 salladslök', '0.75 squash', '0.5 röd chili', '100 gram sockerärtor', '150 gram böngroddar', '1.5 tomater', '0.75 citron', '100 gram ananas', '1 sötpotatis', '4 färska jordgubbar', '12 körsbär', '150 gram fryst mango', '50 gram fryst spenat' ],
    'Kryddor/smaksättare': [ 'salt', 'svartpeppar', '1 msk furikakekrydda', '0.5 msk köftekrydda', '1 tsk vaniljpulver', '0.5 tsk örtkryddor provencale', '1 tsk örtagårdskrydda', '1.5 tsk sambal oelek', '3 msk teriyakisås', '1 tsk rödvinsvinäger', '0.75 tsk srirachasås', '0.75 dl ajvar relish', '2 tsk gul currypasta', '0.5 fiskbuljongtärning', '2.5 krukor färsk persilja', '4 msk färsk dill', '2 msk färsk basilika', '2 msk färsk gräslök', '2 msk färsk mynta' ],
    'Mejeri': [ '2 dl grekisk yoghurt', '225 gram smör', '0.5 msk grädde', '125 gram fetaost', '70 gram mozzarella' ],
    'Kött/fisk/fågel/ägg/vego': [ '500 gram kycklingfärs', '300 gram nötfärs', '150 gram fryst scampi', '300 gram laxfilé', '8.5 ägg', '250 gram fryst torskrygg', '150 gram frysta musslor (utan skal)' ],
    'Torrvaror': [ '5 tsk olivolja', '2 msk pekannötter', '1 dl havregryn', '0.5 dl kokosskivor', '4 dl mandelmjöl', '1.5 tsk bakpulver', '200 gram krossade tomater', '1 tsk sesamolja', '2 msk chiafrön', '2 msk pumpafrön', '1 dl röda linser', '1 dl agavesirap', '25 gram mandelspån' ],
    'Övrigt': [ '1.5 dl mandelmjölk', '0.75 tsk flytande honung', '200 ml kokosmjölk', '5 svarta oliver', '4 träspett' ]
  },
  5: {
    'Frukt/grönt': [ '2 morötter', '3.25 paprikor', '4 klyftor vitlök', 'ca 5 cm ingefära', '0.75 lime', '2 cocktailtomater', '1.25 rödlök', '1.25 apelsiner', '1 granatäpple', '1 gul lök', '45 gram bladspenat', '2 bananer', '0.5 fänkål', 'ca 12 cm purjolök', '5 aprikoser', '15 färska hallon', '1 salladslök', '0.75 squash', '0.5 röd chili', '100 gram sockerärtor', '150 gram böngroddar', '1.5 tomater', '0.75 citron', '100 gram ananas', '1 sötpotatis', '4 färska jordgubbar', '12 körsbär', '150 gram fryst mango', '50 gram fryst spenat' ],
    'Kryddor/smaksättare': [ 'salt', 'svartpeppar', '1 msk furikakekrydda', '0.5 msk köftekrydda', '1 tsk vaniljpulver', '0.5 tsk örtkryddor provencale', '1 tsk örtagårdskrydda', '1.5 tsk sambal oelek', '3 msk teriyakisås', '1 tsk rödvinsvinäger', '0.75 tsk srirachasås', '0.75 dl ajvar relish', '2 tsk gul currypasta', '0.5 fiskbuljongtärning', '2.5 krukor färsk persilja', '4 msk färsk dill', '2 msk färsk basilika', '2 msk färsk gräslök', '2 msk färsk mynta' ],
    'Mejeri': [ '2 dl grekisk yoghurt', '225 gram smör', '0.5 msk grädde', '125 gram fetaost', '70 gram mozzarella' ],
    'Kött/fisk/fågel/ägg/vego': [ '500 gram kycklingfärs', '300 gram nötfärs', '150 gram fryst scampi', '300 gram laxfilé', '8.5 ägg', '250 gram fryst torskrygg', '150 gram frysta musslor (utan skal)' ],
    'Torrvaror': [ '5 tsk olivolja', '2 msk pekannötter', '1 dl havregryn', '0.5 dl kokosskivor', '4 dl mandelmjöl', '1.5 tsk bakpulver', '200 gram krossade tomater', '1 tsk sesamolja', '2 msk chiafrön', '2 msk pumpafrön', '1 dl röda linser', '1 dl agavesirap', '25 gram mandelspån' ],
    'Övrigt': [ '1.5 dl mandelmjölk', '0.75 tsk flytande honung', '200 ml kokosmjölk', '5 svarta oliver', '4 träspett' ]
  },
  6: {
    'Frukt/grönt': [ '6 klyftor vitlök', '2 röd chili', '2 paprikor', '0.25 squash', '0.25 fänkål', '5 cocktailtomater', '3 morötter', '10 brysselkål', '0.5 kiwi', '0.25 rödlök', '2 dl rucola', 'ca 10 cm purjolök', '1 pak choi', '0.25 lime', '0.5 ananas', 'ca 7 cm ingefära', '1 salladslök', '2 gul lök', '100 gram haricots verts', '0.25 aubergine', '5 färska champinjoner', '0.75 färsk mango', '1 palsternacka', '0.75 granatäpple', '0.5 citron', '160 gram majs', '1.5 apelsin', '1 banan', '1 cantaloupemelon', '2 dl frysta blåbär', '2 dl frysta hallon', '300 gram frysta wokgrönsaker' ],
    'Kryddor/smaksättare': [ 'salt', 'svartpeppar', '1.5 tsk örtagårdskrydda', '1 krm paprikapulver', '0.75 tsk kardemumma', '1 tsk curry', '1 tsk garam masala', '0.5 msk furikakekrydda', '1 tsk malen kanel', '0.5 tsk spiskummin', '1 dl teriyakisås', '1 tsk srirachasås', '1 msk ketjap manis', '1 köttbuljongtärning', '1 hönsbuljongtärning', '1 msk färsk koriander', '2 msk färsk basilika', '1 dl färsk mynta', '1.75 dl färsk persilja' ],
    'Mejeri': [ '1 dl keso', '2 msk smör', '1 dl grekisk yoghurt', '0.5 dl gräddfil', '150 gram halloumi' ],
    'Kött/fisk/fågel/ägg/vego': [ '300 gram kycklingfilé', '300 gram nötfärs', '350 gram torskrygg', '4 ägg', '500 gram laxfilé', '800 gram lammstek' ],
    'Torrvaror': [ '1 tsk rapsolja', '2.5 msk olivolja', '1 msk pekannötter', '600 gram krossade tomater', '5 torkade aprikoser', '1 dl havregryn', '6 torkade plommon', '1 msk jordnötter', '3 soltorkade tomater', '0.5 msk pistagenötter', '1 dl röda linser', '1 dl vit quinoa', '3 dl bulgur', '1 msk kokosflingor', '2 msk kokosskivor' ],
    'Övrigt': [ '0.5 msk majonnäs', '1 dl mandelmjölk', '1 dl syltlök', 'valfritt pålägg till en fralla', '10 cornichongurkor', '1 dl lingonsylt' ]
  }
};

interface ParsedIngredient {
  amount: number;
  unit: string;
  item: string;
  originalText: string;
}

// Normalisera ingrediensnamn för att slå ihop liknande
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .replace(/färsk( |en)?/g, '') // Ta bort "färsk" / "färken"
    .replace(/fryst(a)?/g, '')     // Ta bort "fryst" / "frysta"
    .replace(/kallrökt/g, '')      // Ta bort "kallrökt"
    .replace(/konserverade/g, '') // Ta bort "konserverade"
    .replace(/ca /g, '')           // Ta bort "ca "
    .trim();
}

// Parsa ingredienssträng till mängd, enhet och vara
function parseIngredient(ingredient: string): ParsedIngredient {
  const trimmed = ingredient.trim();
  
  // Matcha mönster som "1.5 dl något" eller "2 stycken något"
  const match = trimmed.match(/^([\d.,]+)\s*([a-zA-ZåäöÅÄÖ]+)?\s*(.+)$/);
  
  if (match) {
    const amount = parseFloat(match[1].replace(',', '.'));
    const unit = match[2] || 'st';
    const item = match[3];
    return { amount, unit, item, originalText: trimmed };
  }
  
  // Om inget mönster matchar, anta 1 st
  return { amount: 1, unit: 'st', item: trimmed, originalText: trimmed };
}

// Avrunda mängder till praktiska värden
function roundToPractical(amount: number, unit: string, item: string): number {
  // För hela frukter/grönsaker, avrunda alltid uppåt
  const wholeItems = ['äpple', 'apelsin', 'banan', 'kiwi', 'lime', 'citron', 
    'paprika', 'tomat', 'gurka', 'lök', 'morötter', 'potatis', 'ägg',
    'avokado', 'mango', 'fänkål', 'squash', 'aubergine', 'granatäpple'];
  
  if (wholeItems.some(whole => item.toLowerCase().includes(whole))) {
    return Math.ceil(amount);
  }
  
  // För dl, avrunda till närmaste 0.5
  if (unit === 'dl') {
    return Math.ceil(amount * 2) / 2;
  }
  
  // För msk/tsk, avrunda till närmaste 0.5
  if (unit === 'msk' || unit === 'tsk') {
    return Math.ceil(amount * 2) / 2;
  }
  
  // För gram under 100, avrunda till närmaste 25
  if (unit === 'gram' || unit === 'g') {
    if (amount < 100) {
      return Math.ceil(amount / 25) * 25;
    }
    // För gram över 100, avrunda till närmaste 50
    return Math.ceil(amount / 50) * 50;
  }
  
  // För kg, avrunda till närmaste 0.1
  if (unit === 'kg') {
    return Math.ceil(amount * 10) / 10;
  }
  
  // För övriga, behåll som de är men avrunda decimaler
  if (amount % 1 !== 0) {
    return Math.ceil(amount);
  }
  
  return amount;
}

// Kombinera och summera ingredienser
function combineIngredients(ingredients: string[]): string[] {
  const combined: Record<string, { amount: number; unit: string; originalItem: string }> = {};
  
  ingredients.forEach(ing => {
    const parsed = parseIngredient(ing);
    const normalizedItem = normalizeIngredientName(parsed.item);
    const key = `${normalizedItem}_${parsed.unit}`;
    
    if (combined[key]) {
      combined[key].amount += parsed.amount;
    } else {
      combined[key] = { amount: parsed.amount, unit: parsed.unit, originalItem: parsed.item };
    }
  });
  
  // Konvertera tillbaka till strängar med avrundade värden
  return Object.entries(combined).map(([key, value]) => {
    const item = value.originalItem; // Använd originalnamnet för display
    const roundedAmount = roundToPractical(value.amount, value.unit, item);
    
    // Formatera snyggt
    if (value.unit === 'st' && roundedAmount === 1) {
      return `1 ${item}`;
    } else if (value.unit === 'st') {
      return `${roundedAmount} ${item}`;
    } else {
      return `${roundedAmount} ${value.unit} ${item}`;
    }
  });
}

async function main() {
  const course = await prisma.courseProduct.findFirst({ 
    where: { name: 'Functional Basics' } 
  });
  
  if (!course) {
    console.error('Functional Basics course product not found');
    return;
  }

  for (let week = 1; week <= 6; week++) {
    console.log(`\nProcessing week ${week}...`);
    
    // Använd hårdkodade listor om de finns
    const hardcodedList = hardcodedShoppingLists[week];
    
    if (hardcodedList) {
      // Ta bort befintlig lista
      await prisma.weeklyShoppingList.deleteMany({ 
        where: { courseId: course.id, week } 
      });

      // Skapa ny lista
      const list = await prisma.weeklyShoppingList.create({ 
        data: { courseId: course.id, week } 
      });

      // Bearbeta varje kategori
      const allIngredients: string[] = [];
      
      Object.entries(hardcodedList).forEach(([category, items]) => {
        console.log(`  Processing ${category}: ${items.length} items`);
        
        // Kombinera och avrunda ingredienser
        const processedItems = combineIngredients(items);
        
        // Lägg till kategori som prefix för bättre organisation
        processedItems.forEach(item => {
          allIngredients.push(`[${category}] ${item}`);
        });
      });

      // Skapa alla ingredienser i databasen
      if (allIngredients.length > 0) {
        await prisma.shoppingListItem.createMany({
          data: allIngredients.map(ingredient => ({
            ingredient,
            listId: list.id
          }))
        });
      }

      console.log(`Week ${week} synced with ${allIngredients.length} items`);
    } else {
      console.log(`No hardcoded list for week ${week}, skipping...`);
    }
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 
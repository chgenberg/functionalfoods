const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Local nutrition database for common Swedish ingredients (per 100g)
const localNutritionData = {
  'ägg': { energy: 155, protein: 13, fat: 11, carbohydrates: 0.7, fiber: 0, sugar: 0.7, salt: 0.35 },
  'äg': { energy: 155, protein: 13, fat: 11, carbohydrates: 0.7, fiber: 0, sugar: 0.7, salt: 0.35 },
  'smör': { energy: 717, protein: 0.7, fat: 81, carbohydrates: 0.6, fiber: 0, sugar: 0.6, salt: 0.11 },
  'banan': { energy: 89, protein: 1.1, fat: 0.3, carbohydrates: 23, fiber: 2.6, sugar: 12, salt: 0.001 },
  'keso': { energy: 98, protein: 11, fat: 4.3, carbohydrates: 3.4, fiber: 0, sugar: 3.4, salt: 0.4 },
  'hallon': { energy: 52, protein: 1.2, fat: 0.7, carbohydrates: 12, fiber: 6.5, sugar: 4.4, salt: 0.001 },
  'frysta hallon': { energy: 52, protein: 1.2, fat: 0.7, carbohydrates: 12, fiber: 6.5, sugar: 4.4, salt: 0.001 },
  'vanilj': { energy: 288, protein: 0.1, fat: 0.1, carbohydrates: 13, fiber: 0, sugar: 13, salt: 0.009 },
  'vaniljpulver': { energy: 288, protein: 0.1, fat: 0.1, carbohydrates: 13, fiber: 0, sugar: 13, salt: 0.009 },
  'olivolja': { energy: 884, protein: 0, fat: 100, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.002 },
  'kokosolja': { energy: 862, protein: 0, fat: 100, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0 },
  'rapsolja': { energy: 884, protein: 0, fat: 100, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0 },
  'mjölk': { energy: 64, protein: 3.4, fat: 3.5, carbohydrates: 4.7, fiber: 0, sugar: 4.7, salt: 0.044 },
  'vetemjöl': { energy: 364, protein: 10, fat: 1.3, carbohydrates: 76, fiber: 2.7, sugar: 0.3, salt: 0.002 },
  'salt': { energy: 0, protein: 0, fat: 0, carbohydrates: 0, fiber: 0, sugar: 0, salt: 100 },
  'peppar': { energy: 251, protein: 10, fat: 3.3, carbohydrates: 64, fiber: 25, sugar: 0.6, salt: 0.02 },
  'vitlök': { energy: 149, protein: 6.4, fat: 0.5, carbohydrates: 33, fiber: 2.1, sugar: 1, salt: 0.017 },
  'lök': { energy: 40, protein: 1.1, fat: 0.1, carbohydrates: 9.3, fiber: 1.7, sugar: 4.2, salt: 0.004 },
  'tomat': { energy: 18, protein: 0.9, fat: 0.2, carbohydrates: 3.9, fiber: 1.2, sugar: 2.6, salt: 0.005 },
  'gurka': { energy: 16, protein: 0.7, fat: 0.1, carbohydrates: 3.6, fiber: 0.5, sugar: 1.7, salt: 0.002 },
  'sallad': { energy: 15, protein: 1.4, fat: 0.2, carbohydrates: 2.9, fiber: 1.3, sugar: 2.2, salt: 0.028 },
  'potatis': { energy: 77, protein: 2, fat: 0.1, carbohydrates: 17, fiber: 2.2, sugar: 0.8, salt: 0.006 },
  'lax': { energy: 208, protein: 20, fat: 13, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.59 },
  'kyckling': { energy: 165, protein: 31, fat: 3.6, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.074 },
  'nötfärs': { energy: 250, protein: 20, fat: 18, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.07 },
  'fläskfärs': { energy: 263, protein: 18, fat: 20, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.075 },
  'blandfärs': { energy: 256, protein: 19, fat: 19, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.072 },
  'äpple': { energy: 52, protein: 0.3, fat: 0.2, carbohydrates: 14, fiber: 2.4, sugar: 10, salt: 0.001 },
  'äpplen': { energy: 52, protein: 0.3, fat: 0.2, carbohydrates: 14, fiber: 2.4, sugar: 10, salt: 0.001 },
  'morot': { energy: 41, protein: 0.9, fat: 0.2, carbohydrates: 10, fiber: 2.8, sugar: 4.7, salt: 0.069 },
  'morötter': { energy: 41, protein: 0.9, fat: 0.2, carbohydrates: 10, fiber: 2.8, sugar: 4.7, salt: 0.069 },
  'broccoli': { energy: 34, protein: 2.8, fat: 0.4, carbohydrates: 7, fiber: 2.6, sugar: 1.5, salt: 0.033 },
  'spenat': { energy: 23, protein: 2.9, fat: 0.4, carbohydrates: 3.6, fiber: 2.2, sugar: 0.4, salt: 0.079 },
  'avokado': { energy: 160, protein: 2, fat: 15, carbohydrates: 9, fiber: 6.7, sugar: 0.7, salt: 0.007 },
  'quinoa': { energy: 368, protein: 14, fat: 6.1, carbohydrates: 64, fiber: 7, sugar: 0, salt: 0.005 },
  'ris': { energy: 365, protein: 7.1, fat: 0.7, carbohydrates: 80, fiber: 1.3, sugar: 0.1, salt: 0.005 },
  'linser': { energy: 353, protein: 25, fat: 1.1, carbohydrates: 63, fiber: 11, sugar: 2, salt: 0.006 },
  'kikärtor': { energy: 364, protein: 19, fat: 6, carbohydrates: 61, fiber: 17, sugar: 11, salt: 0.024 },
  'mandel': { energy: 579, protein: 21, fat: 50, carbohydrates: 22, fiber: 12, sugar: 4.4, salt: 0.001 },
  'valnötter': { energy: 654, protein: 15, fat: 65, carbohydrates: 14, fiber: 6.7, sugar: 2.6, salt: 0.002 },
  'chiafrön': { energy: 486, protein: 17, fat: 31, carbohydrates: 42, fiber: 34, sugar: 0, salt: 0.016 },
  'linfrön': { energy: 534, protein: 18, fat: 42, carbohydrates: 29, fiber: 27, sugar: 1.6, salt: 0.03 },
  'majonnäs': { energy: 680, protein: 1.1, fat: 75, carbohydrates: 0.6, fiber: 0, sugar: 0.6, salt: 1.1 },
  'pasta': { energy: 371, protein: 13, fat: 1.5, carbohydrates: 75, fiber: 3.2, sugar: 2.7, salt: 0.006 },
  'yoghurt': { energy: 61, protein: 3.5, fat: 3, carbohydrates: 4.7, fiber: 0, sugar: 4.7, salt: 0.046 },
  'ost': { energy: 402, protein: 25, fat: 33, carbohydrates: 0.1, fiber: 0, sugar: 0.1, salt: 1.6 },
  'fisk': { energy: 206, protein: 22, fat: 12, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.14 },
  'kött': { energy: 250, protein: 26, fat: 15, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.075 },
  // Saknade ingredienser från de misslyckade recepten
  'apelsin': { energy: 47, protein: 0.9, fat: 0.1, carbohydrates: 12, fiber: 2.4, sugar: 9.4, salt: 0.001 },
  'rödkål': { energy: 31, protein: 1.4, fat: 0.1, carbohydrates: 7.4, fiber: 2.5, sugar: 3.8, salt: 0.027 },
  'ingefära': { energy: 80, protein: 1.8, fat: 0.8, carbohydrates: 18, fiber: 2, sugar: 1.7, salt: 0.013 },
  'färsk ingefära': { energy: 80, protein: 1.8, fat: 0.8, carbohydrates: 18, fiber: 2, sugar: 1.7, salt: 0.013 },
  'rödbetsjuice': { energy: 43, protein: 1.6, fat: 0.2, carbohydrates: 10, fiber: 2.8, sugar: 6.8, salt: 0.078 },
  'rödbetor': { energy: 43, protein: 1.6, fat: 0.2, carbohydrates: 10, fiber: 2.8, sugar: 6.8, salt: 0.078 },
  'citron': { energy: 29, protein: 1.1, fat: 0.3, carbohydrates: 9, fiber: 2.8, sugar: 1.5, salt: 0.002 },
  'mango': { energy: 60, protein: 0.8, fat: 0.4, carbohydrates: 15, fiber: 1.6, sugar: 13.7, salt: 0.001 },
  'färsk mango': { energy: 60, protein: 0.8, fat: 0.4, carbohydrates: 15, fiber: 1.6, sugar: 13.7, salt: 0.001 },
  'jordgubbar': { energy: 32, protein: 0.7, fat: 0.3, carbohydrates: 8, fiber: 2, sugar: 4.9, salt: 0.001 },
  'färska jordgubbar': { energy: 32, protein: 0.7, fat: 0.3, carbohydrates: 8, fiber: 2, sugar: 4.9, salt: 0.001 },
  'vit choklad': { energy: 539, protein: 5.9, fat: 32, carbohydrates: 59, fiber: 0.2, sugar: 59, salt: 0.19 },
  'philadelphiaost': { energy: 265, protein: 5.5, fat: 26, carbohydrates: 3.5, fiber: 0, sugar: 3.5, salt: 0.8 },
  'färsk mynta': { energy: 70, protein: 3.8, fat: 0.9, carbohydrates: 15, fiber: 8, sugar: 0, salt: 0.031 },
  'cantaloupemelon': { energy: 34, protein: 0.8, fat: 0.2, carbohydrates: 8, fiber: 0.9, sugar: 7.9, salt: 0.016 },
  'ananas': { energy: 50, protein: 0.5, fat: 0.1, carbohydrates: 13, fiber: 1.4, sugar: 9.9, salt: 0.001 },
  'kokosskivor': { energy: 354, protein: 3.3, fat: 33, carbohydrates: 15, fiber: 9, sugar: 6.2, salt: 0.02 },
  'kvist färsk mynta': { energy: 70, protein: 3.8, fat: 0.9, carbohydrates: 15, fiber: 8, sugar: 0, salt: 0.031 },
  'blodapelsin': { energy: 47, protein: 0.9, fat: 0.1, carbohydrates: 12, fiber: 2.4, sugar: 9.4, salt: 0.001 },
  'björnbär': { energy: 43, protein: 1.4, fat: 0.5, carbohydrates: 10, fiber: 5.3, sugar: 4.9, salt: 0.001 },
  'färska björnbär': { energy: 43, protein: 1.4, fat: 0.5, carbohydrates: 10, fiber: 5.3, sugar: 4.9, salt: 0.001 },
  // Fler saknade ingredienser
  'paprika': { energy: 31, protein: 1, fat: 0.3, carbohydrates: 7.3, fiber: 2.5, sugar: 4.2, salt: 0.004 },
  'rödlök': { energy: 40, protein: 1.1, fat: 0.1, carbohydrates: 9.3, fiber: 1.7, sugar: 4.2, salt: 0.004 },
  'päron': { energy: 57, protein: 0.4, fat: 0.1, carbohydrates: 15, fiber: 3.1, sugar: 10, salt: 0.001 },
  'chevreost': { energy: 364, protein: 21, fat: 30, carbohydrates: 2.5, fiber: 0, sugar: 2.5, salt: 1.2 },
  'pekannötter': { energy: 691, protein: 9.2, fat: 72, carbohydrates: 14, fiber: 9.6, sugar: 4, salt: 0.0004 },
  'tranbär': { energy: 46, protein: 0.4, fat: 0.1, carbohydrates: 12, fiber: 4.6, sugar: 4, salt: 0.002 },
  'torkade tranbär': { energy: 308, protein: 0.1, fat: 1.4, carbohydrates: 83, fiber: 5.3, sugar: 65, salt: 0.003 },
  'balsamvinäger': { energy: 88, protein: 0.5, fat: 0, carbohydrates: 17, fiber: 0, sugar: 14, salt: 0.023 },
  'grädde': { energy: 292, protein: 2.1, fat: 31, carbohydrates: 3.4, fiber: 0, sugar: 3.4, salt: 0.043 },
  'majonäs': { energy: 680, protein: 1.1, fat: 75, carbohydrates: 0.6, fiber: 0, sugar: 0.6, salt: 1.1 },
  'scampi': { energy: 106, protein: 20, fat: 1.7, carbohydrates: 1, fiber: 0, sugar: 0, salt: 0.27 },
  'fryst scampi': { energy: 106, protein: 20, fat: 1.7, carbohydrates: 1, fiber: 0, sugar: 0, salt: 0.27 },
  'torsk': { energy: 82, protein: 18, fat: 0.7, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.54 },
  'torskrygg': { energy: 82, protein: 18, fat: 0.7, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.54 },
  'vitlök': { energy: 149, protein: 6.4, fat: 0.5, carbohydrates: 33, fiber: 2.1, sugar: 1, salt: 0.017 },
  'klyfta vitlök': { energy: 149, protein: 6.4, fat: 0.5, carbohydrates: 33, fiber: 2.1, sugar: 1, salt: 0.017 },
  'klyftor vitlök': { energy: 149, protein: 6.4, fat: 0.5, carbohydrates: 33, fiber: 2.1, sugar: 1, salt: 0.017 },
  'gul lök': { energy: 40, protein: 1.1, fat: 0.1, carbohydrates: 9.3, fiber: 1.7, sugar: 4.2, salt: 0.004 },
  'riven ost': { energy: 402, protein: 25, fat: 33, carbohydrates: 0.1, fiber: 0, sugar: 0.1, salt: 1.6 },
  // Ytterligare ingredienser
  'fetaost': { energy: 264, protein: 14, fat: 21, carbohydrates: 4, fiber: 0, sugar: 4, salt: 4 },
  'champinjoner': { energy: 22, protein: 3.1, fat: 0.3, carbohydrates: 4, fiber: 1, sugar: 1.98, salt: 0.005 },
  'färska champinjoner': { energy: 22, protein: 3.1, fat: 0.3, carbohydrates: 4, fiber: 1, sugar: 1.98, salt: 0.005 },
  'grönkål': { energy: 49, protein: 4.3, fat: 0.9, carbohydrates: 9, fiber: 3.6, sugar: 2.3, salt: 0.043 },
  'grönkålsblad': { energy: 49, protein: 4.3, fat: 0.9, carbohydrates: 9, fiber: 3.6, sugar: 2.3, salt: 0.043 },
  'sesamfrön': { energy: 573, protein: 17, fat: 50, carbohydrates: 23, fiber: 11.8, sugar: 0.3, salt: 0.011 },
  'fiberhusk': { energy: 42, protein: 1.5, fat: 0.6, carbohydrates: 88, fiber: 84, sugar: 0, salt: 0.016 },
  'mandelmjöl': { energy: 579, protein: 21, fat: 50, carbohydrates: 22, fiber: 12, sugar: 4.4, salt: 0.001 },
  'vatten': { energy: 0, protein: 0, fat: 0, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0 },
  'persilja': { energy: 36, protein: 3, fat: 0.8, carbohydrates: 6.3, fiber: 3.3, sugar: 0.9, salt: 0.056 },
  'färsk persilja': { energy: 36, protein: 3, fat: 0.8, carbohydrates: 6.3, fiber: 3.3, sugar: 0.9, salt: 0.056 },
  'basilika': { energy: 22, protein: 3.2, fat: 0.6, carbohydrates: 2.6, fiber: 1.6, sugar: 0.3, salt: 0.004 },
  'färsk basilika': { energy: 22, protein: 3.2, fat: 0.6, carbohydrates: 2.6, fiber: 1.6, sugar: 0.3, salt: 0.004 },
  'gräslök': { energy: 30, protein: 3.3, fat: 0.7, carbohydrates: 4.4, fiber: 2.5, sugar: 1.9, salt: 0.003 },
  'färsk gräslök': { energy: 30, protein: 3.3, fat: 0.7, carbohydrates: 4.4, fiber: 2.5, sugar: 1.9, salt: 0.003 },
  // Kritiska ingredienser som saknas
  'selleri': { energy: 16, protein: 0.7, fat: 0.2, carbohydrates: 3, fiber: 1.6, sugar: 1.3, salt: 0.08 },
  'selleristjälkar': { energy: 16, protein: 0.7, fat: 0.2, carbohydrates: 3, fiber: 1.6, sugar: 1.3, salt: 0.08 },
  'jordnötssmör': { energy: 588, protein: 25, fat: 50, carbohydrates: 20, fiber: 8, sugar: 6.3, salt: 0.17 },
  'jordnötskräm': { energy: 588, protein: 25, fat: 50, carbohydrates: 20, fiber: 8, sugar: 6.3, salt: 0.17 },
  'kokosgrädde': { energy: 230, protein: 2.3, fat: 24, carbohydrates: 6, fiber: 2.2, sugar: 3.3, salt: 0.015 },
  'bananmuffin': { energy: 277, protein: 4.2, fat: 11, carbohydrates: 42, fiber: 2.6, sugar: 23, salt: 0.35 },
  'burrata': { energy: 330, protein: 17, fat: 28, carbohydrates: 3, fiber: 0, sugar: 3, salt: 0.5 },
  'haricots verts': { energy: 31, protein: 1.8, fat: 0.1, carbohydrates: 7, fiber: 2.7, sugar: 3.3, salt: 0.006 },
  'bearnaisesås': { energy: 468, protein: 3.1, fat: 51, carbohydrates: 1.2, fiber: 0, sugar: 1.2, salt: 1.2 },
  'fänkål': { energy: 31, protein: 1.2, fat: 0.2, carbohydrates: 7.3, fiber: 3.1, sugar: 3.9, salt: 0.052 },
  'grapefrukt': { energy: 42, protein: 0.8, fat: 0.1, carbohydrates: 11, fiber: 1.6, sugar: 6.9, salt: 0.001 },
  'färskost': { energy: 98, protein: 11, fat: 4.3, carbohydrates: 3.4, fiber: 0, sugar: 3.4, salt: 0.4 },
  'glasnudlar': { energy: 351, protein: 0.1, fat: 0.1, carbohydrates: 86, fiber: 0.5, sugar: 0, salt: 0.006 },
  'bovete': { energy: 343, protein: 13, fat: 3.4, carbohydrates: 72, fiber: 10, sugar: 0, salt: 0.001 },
  'bovetegranola': { energy: 471, protein: 13, fat: 20, carbohydrates: 60, fiber: 10, sugar: 12, salt: 0.2 },
  'havregryn': { energy: 389, protein: 17, fat: 6.9, carbohydrates: 66, fiber: 10, sugar: 0.99, salt: 0.002 },
  'entrecote': { energy: 271, protein: 26, fat: 18, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.054 },
  'lövbiff': { energy: 271, protein: 26, fat: 18, carbohydrates: 0, fiber: 0, sugar: 0, salt: 0.054 },
  'aubergine': { energy: 25, protein: 1, fat: 0.2, carbohydrates: 6, fiber: 3, sugar: 3.5, salt: 0.002 },
  'créme fraiche': { energy: 292, protein: 2.6, fat: 30, carbohydrates: 4, fiber: 0, sugar: 4, salt: 0.035 },
  'tandoorikrydda': { energy: 325, protein: 14, fat: 14, carbohydrates: 34, fiber: 14, sugar: 6, salt: 0.5 },
  'granatäppelkärnor': { energy: 83, protein: 1.7, fat: 1.2, carbohydrates: 19, fiber: 4, sugar: 14, salt: 0.003 },
  'pistagenötter': { energy: 560, protein: 20, fat: 45, carbohydrates: 28, fiber: 10, sugar: 8, salt: 0.001 },
  // Ytterligare saknade ingredienser
  'agavesirap': { energy: 310, protein: 0.1, fat: 0, carbohydrates: 76, fiber: 0, sugar: 68, salt: 0.004 },
  'cayennepeppar': { energy: 318, protein: 12, fat: 17, carbohydrates: 57, fiber: 27, sugar: 10, salt: 0.03 },
  'morot- och kesolimpa': { energy: 250, protein: 8, fat: 4, carbohydrates: 45, fiber: 6, sugar: 3, salt: 1.2 },
  'skiva morot- och kesolimpa': { energy: 250, protein: 8, fat: 4, carbohydrates: 45, fiber: 6, sugar: 3, salt: 1.2 },
  'squash': { energy: 16, protein: 1.2, fat: 0.2, carbohydrates: 3.4, fiber: 1.1, sugar: 2.2, salt: 0.001 },
  'vattenmelon': { energy: 30, protein: 0.6, fat: 0.2, carbohydrates: 8, fiber: 0.4, sugar: 6.2, salt: 0.001 },
  'ketomüsli': { energy: 520, protein: 15, fat: 45, carbohydrates: 12, fiber: 8, sugar: 4, salt: 0.1 },
  'mandarin': { energy: 53, protein: 0.8, fat: 0.3, carbohydrates: 13, fiber: 1.8, sugar: 11, salt: 0.002 },
  'halloumi': { energy: 321, protein: 24, fat: 25, carbohydrates: 0, fiber: 0, sugar: 0, salt: 2.7 },
  'pumpakärnor': { energy: 559, protein: 19, fat: 49, carbohydrates: 11, fiber: 6, sugar: 1.4, salt: 0.007 },
  'bakpulver': { energy: 53, protein: 0, fat: 0, carbohydrates: 28, fiber: 0, sugar: 0, salt: 27 },
  'kakaopulver': { energy: 228, protein: 20, fat: 14, carbohydrates: 58, fiber: 37, sugar: 2, salt: 0.021 },
  'mörka chokladknappar': { energy: 546, protein: 5, fat: 31, carbohydrates: 61, fiber: 7, sugar: 48, salt: 0.006 },
  'mörk choklad': { energy: 546, protein: 5, fat: 31, carbohydrates: 61, fiber: 7, sugar: 48, salt: 0.006 },
  'paranötter': { energy: 659, protein: 14, fat: 67, carbohydrates: 12, fiber: 7.5, sugar: 2.3, salt: 0.003 },
  'hasselnötter': { energy: 628, protein: 15, fat: 61, carbohydrates: 17, fiber: 9.7, sugar: 4.3, salt: 0.0002 },
  'fiberhonung': { energy: 304, protein: 0.3, fat: 0, carbohydrates: 82, fiber: 0, sugar: 82, salt: 0.004 },
  'honung': { energy: 304, protein: 0.3, fat: 0, carbohydrates: 82, fiber: 0, sugar: 82, salt: 0.004 },
  'kanel': { energy: 247, protein: 4, fat: 1.2, carbohydrates: 81, fiber: 53, sugar: 2.2, salt: 0.01 },
  'kardemumma': { energy: 311, protein: 11, fat: 6.7, carbohydrates: 68, fiber: 28, sugar: 0, salt: 0.018 },
  'kokosflingor': { energy: 660, protein: 6.9, fat: 65, carbohydrates: 24, fiber: 16, sugar: 7.4, salt: 0.02 },
  // Sista saknade ingredienserna
  'palsternacka': { energy: 75, protein: 1.2, fat: 0.3, carbohydrates: 18, fiber: 4.9, sugar: 4.8, salt: 0.01 },
  'kålrot': { energy: 35, protein: 1.1, fat: 0.2, carbohydrates: 8.6, fiber: 2.3, sugar: 6.2, salt: 0.02 },
  'spiskummin': { energy: 375, protein: 18, fat: 22, carbohydrates: 44, fiber: 11, sugar: 2.2, salt: 0.168 },
  'lagerblad': { energy: 313, protein: 7.6, fat: 8.4, carbohydrates: 75, fiber: 26, sugar: 0, salt: 0.023 },
  'tomatpuré': { energy: 82, protein: 4.3, fat: 0.2, carbohydrates: 19, fiber: 4.1, sugar: 12, salt: 0.059 },
  'grönsaksbuljongtärning': { energy: 259, protein: 11, fat: 2.8, carbohydrates: 51, fiber: 3.5, sugar: 31, salt: 23 },
  'aprikos': { energy: 48, protein: 1.4, fat: 0.4, carbohydrates: 11, fiber: 2, sugar: 9.2, salt: 0.001 },
  'äppelgranola': { energy: 471, protein: 13, fat: 20, carbohydrates: 60, fiber: 10, sugar: 12, salt: 0.2 },
  'kiwi': { energy: 61, protein: 1.1, fat: 0.5, carbohydrates: 15, fiber: 3, sugar: 9, salt: 0.003 },
  'mandlar': { energy: 579, protein: 21, fat: 50, carbohydrates: 22, fiber: 12, sugar: 4.4, salt: 0.001 },
  'blomkål': { energy: 25, protein: 1.9, fat: 0.3, carbohydrates: 5, fiber: 2, sugar: 1.9, salt: 0.03 },
  'blomkålshuvud': { energy: 25, protein: 1.9, fat: 0.3, carbohydrates: 5, fiber: 2, sugar: 1.9, salt: 0.03 },
  'chiliflakes': { energy: 318, protein: 12, fat: 17, carbohydrates: 57, fiber: 27, sugar: 10, salt: 0.03 },
  'flytande honung': { energy: 304, protein: 0.3, fat: 0, carbohydrates: 82, fiber: 0, sugar: 82, salt: 0.004 },
  'torkade örter': { energy: 233, protein: 9, fat: 4.9, carbohydrates: 48, fiber: 18, sugar: 4, salt: 0.25 },
  'rucola': { energy: 25, protein: 2.6, fat: 0.7, carbohydrates: 3.7, fiber: 1.6, sugar: 2, salt: 0.027 },
  'blåbär': { energy: 57, protein: 0.7, fat: 0.3, carbohydrates: 14, fiber: 2.4, sugar: 10, salt: 0.001 },
  'färska blåbär': { energy: 57, protein: 0.7, fat: 0.3, carbohydrates: 14, fiber: 2.4, sugar: 10, salt: 0.001 }
};

// Parse amount from ingredient string
const parseAmount = (ingredient) => {
  const amountMatch = ingredient.match(/(\d+(?:\.\d+)?)\s*(dl|ml|l|g|kg|tsk|msk|st|krm)?/i);
  
  if (amountMatch) {
    let amount = parseFloat(amountMatch[1]);
    let unit = amountMatch[2]?.toLowerCase() || 'st';
    
    // Special handling for nuts and small items
    if (unit === 'st') {
      const ingredientLower = ingredient.toLowerCase();
      if (ingredientLower.includes('nöt') || ingredientLower.includes('mandel') || ingredientLower.includes('mandlar')) {
        amount = amount * 3; // ~3g per nut
      } else if (ingredientLower.includes('ägg')) {
        amount = amount * 50; // ~50g per egg
      } else if (ingredientLower.includes('tomat') && ingredientLower.includes('cocktail')) {
        amount = amount * 20; // ~20g per cherry tomato
      } else if (ingredientLower.includes('tomat')) {
        amount = amount * 150; // ~150g per tomato
      } else if (ingredientLower.includes('lök')) {
        amount = amount * 80; // ~80g per onion
      } else if (ingredientLower.includes('vitlök') && ingredientLower.includes('klyfta')) {
        amount = amount * 3; // ~3g per garlic clove
      } else if (ingredientLower.includes('paprika')) {
        amount = amount * 120; // ~120g per bell pepper
      } else {
        amount = amount * 100; // Default 100g per piece
      }
    } else {
      const conversions = {
        'kg': 1000,
        'l': 1000,
        'dl': 100,
        'ml': 1,
        'msk': 15,
        'tsk': 5,
        'krm': 1
      };
      
      if (conversions[unit]) {
        amount = amount * conversions[unit];
      }
    }
    
    return { amount, unit: 'g' };
  }
  
  return { amount: 100, unit: 'g' };
};

// Normalize ingredient name to find in local database
const normalizeIngredientName = (ingredient) => {
  const cleaned = ingredient
    .replace(/\d+(\.\d+)?/g, '')
    .replace(/\s*(dl|ml|l|g|kg|tsk|msk|st|port|portion|portioner|burk|paket|påse|krm|tesked|matsked|deciliter|milliliter|liter|gram|kilogram|styck|stycken)\b/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/,.*$/, '')
    .trim()
    .toLowerCase();

  // Check for exact matches first
  if (localNutritionData[cleaned]) {
    return cleaned;
  }

  // Priority matching for compound ingredients
  if (cleaned.includes('bovetegranola') || cleaned.includes('bovete')) {
    return 'bovetegranola';
  }
  if (cleaned.includes('äppelgranola')) {
    return 'äppelgranola';
  }
  if (cleaned.includes('ketomüsli')) {
    return 'ketomüsli';
  }

  // Check for partial matches (but avoid false positives)
  for (const key of Object.keys(localNutritionData)) {
    if (cleaned.includes(key) && key.length > 3) {
      return key;
    }
  }
  
  // Only check reverse match for longer keys to avoid false positives
  for (const key of Object.keys(localNutritionData)) {
    if (key.length > 5 && key.includes(cleaned)) {
      return key;
    }
  }

  return cleaned;
};

// Get nutrition data from local database
const getNutritionData = (ingredientName) => {
  const normalized = normalizeIngredientName(ingredientName);
  const data = localNutritionData[normalized];
  
  if (data) {
    console.log(`✅ Found local nutrition data for: "${ingredientName}" -> "${normalized}"`);
    return {
      name: normalized,
      nutrients: data
    };
  }
  
  console.log(`⚠️ No local nutrition data for: "${ingredientName}" -> "${normalized}"`);
  return null;
};

// Calculate total nutrition for a recipe
const calculateRecipeNutrition = (ingredients, servings) => {
  const nutritionData = {
    energy: 0,
    protein: 0,
    fat: 0,
    carbohydrates: 0,
    fiber: 0,
    sugar: 0,
    salt: 0
  };
  
  console.log(`🧮 Calculating nutrition for ${ingredients.length} ingredients, ${servings} servings`);
  
  for (const ingredient of ingredients) {
    const { amount } = parseAmount(ingredient);
    const data = getNutritionData(ingredient);
    
    if (data) {
      const scale = amount / 100;
      nutritionData.energy += (data.nutrients.energy || 0) * scale;
      nutritionData.protein += (data.nutrients.protein || 0) * scale;
      nutritionData.fat += (data.nutrients.fat || 0) * scale;
      nutritionData.carbohydrates += (data.nutrients.carbohydrates || 0) * scale;
      nutritionData.fiber += (data.nutrients.fiber || 0) * scale;
      nutritionData.sugar += (data.nutrients.sugar || 0) * scale;
      nutritionData.salt += (data.nutrients.salt || 0) * scale;
      
      console.log(`  ✅ ${ingredient}: ${Math.round(data.nutrients.energy * scale)} kcal`);
    } else {
      console.log(`  ⚠️ ${ingredient}: No nutrition data found`);
    }
  }
  
  // Calculate per serving
  const perServing = {
    energy: Math.round(nutritionData.energy / servings),
    protein: Math.round(nutritionData.protein / servings * 10) / 10,
    fat: Math.round(nutritionData.fat / servings * 10) / 10,
    carbohydrates: Math.round(nutritionData.carbohydrates / servings * 10) / 10,
    fiber: Math.round(nutritionData.fiber / servings * 10) / 10,
    sugar: Math.round(nutritionData.sugar / servings * 10) / 10,
    salt: Math.round(nutritionData.salt / servings * 10) / 10
  };
  
  // Calculate per 100g (rough estimate based on total weight)
  const estimatedTotalWeight = ingredients.reduce((total, ingredient) => {
    const { amount } = parseAmount(ingredient);
    return total + amount;
  }, 0);
  
  const per100g = {
    energy: Math.round((nutritionData.energy / estimatedTotalWeight) * 100),
    protein: Math.round((nutritionData.protein / estimatedTotalWeight) * 100 * 10) / 10,
    fat: Math.round((nutritionData.fat / estimatedTotalWeight) * 100 * 10) / 10,
    carbohydrates: Math.round((nutritionData.carbohydrates / estimatedTotalWeight) * 100 * 10) / 10,
    fiber: Math.round((nutritionData.fiber / estimatedTotalWeight) * 100 * 10) / 10,
    sugar: Math.round((nutritionData.sugar / estimatedTotalWeight) * 100 * 10) / 10,
    salt: Math.round((nutritionData.salt / estimatedTotalWeight) * 100 * 10) / 10
  };
  
  return {
    perServing,
    per100g
  };
};

async function calculateAllNutritionLocal() {
  console.log('🚀 Starting local nutrition calculation...');
  
  try {
    // Get all published recipes
    const recipes = await prisma.recipe.findMany({
      where: {
        status: 'PUBLISHED'
      },
      select: {
        id: true,
        title: true,
        slug: true,
        ingredients: true,
        servings: true,
        nutrition: true
      }
    });
    
    // Filter out recipes that already have good nutrition data
    const recipesWithoutNutrition = recipes.filter(recipe => 
      !recipe.nutrition || 
      Object.keys(recipe.nutrition).length === 0 ||
      (recipe.nutrition.perServing && recipe.nutrition.perServing.energy === 0)
    );
    
    console.log(`📊 Found ${recipesWithoutNutrition.length} recipes without nutrition data (out of ${recipes.length} total)`);
    
    let processed = 0;
    let successful = 0;
    let failed = 0;
    
    for (const recipe of recipesWithoutNutrition) {
      processed++;
      console.log(`\n📝 Processing recipe ${processed}/${recipesWithoutNutrition.length}: "${recipe.title}"`);
      
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        console.log(`⚠️ Skipping "${recipe.title}" - no ingredients`);
        failed++;
        continue;
      }
      
      try {
        const nutrition = calculateRecipeNutrition(recipe.ingredients, recipe.servings || 4);
        
        // Only update if we got meaningful data
        if (nutrition.perServing.energy > 0) {
          await prisma.recipe.update({
            where: { id: recipe.id },
            data: { nutrition }
          });
          
          console.log(`✅ Updated "${recipe.title}" with nutrition data:`);
          console.log(`   Per portion: ${nutrition.perServing.energy} kcal, ${nutrition.perServing.protein}g protein, ${nutrition.perServing.carbohydrates}g carbs, ${nutrition.perServing.fat}g fat`);
          
          successful++;
        } else {
          console.log(`⚠️ Skipping "${recipe.title}" - no recognizable ingredients`);
          failed++;
        }
        
      } catch (error) {
        console.error(`❌ Failed to process "${recipe.title}":`, error.message);
        failed++;
      }
    }
    
    console.log(`\n🎉 Local nutrition calculation completed!`);
    console.log(`📊 Summary:`);
    console.log(`   Total processed: ${processed}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}`);
    
  } catch (error) {
    console.error('❌ Error in local nutrition calculation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  calculateAllNutritionLocal();
}

module.exports = { calculateAllNutritionLocal }; 
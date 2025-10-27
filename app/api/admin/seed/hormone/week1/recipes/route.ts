import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type RecipeSeed = {
  title: string;
  servings?: number;
  categories?: string[];
  image?: string | null; // relative from /public
  ingredients: string[];
  instructions: string | string[];
};

const IMG_BASE = '/Hormonell_balans/Bilder_v1';

const RECIPES: RecipeSeed[] = [
  {
    title: 'Citronvatten och svart kaffe/te',
    servings: 1,
    image: `${IMG_BASE}/kaffe_vatten.PNG`,
    categories: ['frukost'],
    ingredients: [
      '3 dl vatten',
      '1 msk citronjuice',
      '1 kopp kaffe/te'
    ],
    instructions: [
      'Häll upp ett glas med vatten.',
      'Pressa ner citronjuice.',
      'Drick vatten och en kopp med kaffe eller te.'
    ]
  },
  {
    title: 'Kavring med frön',
    servings: 14,
    image: `${IMG_BASE}/KAVRING_MED_FRÖN.JPG`,
    categories: ['frukost','egenbakat'],
    ingredients: [
      '5 dl filmjölk',
      '1/2 dl brödsirap',
      '3 dl bovetemjöl',
      '3 dl havremjöl',
      '1/2 dl linfrö',
      '1/2 dl solroskärnor',
      '1/2 dl pumpafrön',
      '1 dl russin',
      '1 tsk bikarbonat',
      '1 tsk smör',
      '1 tsk bovetemjöl',
      '1 msk pumpafrön',
      '1 msk solrosfrön',
      '1 msk sesamfrön'
    ],
    instructions: [
      'Sätt ugnen på 175 grader.',
      'Blanda ihop alla ingredienser i en bunke.',
      'Låt stå och svälla i några minuter.',
      'Smöra och mjöla en brödform, 1 1/2 – 2 liter.',
      'Fördela smeten jämnt i formen och strö över frön.',
      'Grädda i nedre delen av ugnen i cirka 50 minuter.',
      'Låt svalna på galler.'
    ]
  },
  {
    title: 'Ostmacka med paprika',
    servings: 1,
    image: `${IMG_BASE}/OSTMACKA_MED_PAPRIKA.JPG`,
    categories: ['frukost'],
    ingredients: [
      '1 skiva kavring (egenbakad)',
      '1 tsk smör',
      '1 skiva ost',
      '3 paprikaringar',
      '2 cocktailtomater'
    ],
    instructions: [
      'Bred smör på mackan och lägg på ost och paprika.',
      'Servera med tomater.'
    ]
  },
  {
    title: 'Kokosgranola',
    servings: 15,
    image: `${IMG_BASE}/KOKOSGRANOLA.JPG`,
    categories: ['egenbakat','frukost'],
    ingredients: [
      '1 dl paranötter',
      '1 dl valnötter',
      '1 dl hasselnötter',
      '1 dl mandel',
      '1 dl pumpafrön',
      '4 dl mandelmjöl',
      '1 msk Nikks fiberhonung',
      '1 msk rapsolja',
      '1 msk malen kanel',
      '1 tsk malen kardemumma',
      '1 krm salt',
      '2 dl kokosflingor',
      '2 dl kokosskivor'
    ],
    instructions: [
      'Hacka alla nötter grovt.',
      'Hetta upp en stekpanna och lägg ner mandelmjöl.',
      'Tillsätt fiberhonung, olja, kanel, kardemumma och salt.',
      'Sänk värmen och låt rosta i 5 minuter under omrörning.',
      'Blanda ner kokosflingor och kokosskivor.',
      'Rosta nötter och pumpafrön i en torr stekpanna i några minuter.',
      'Blanda ner i stekpannan med mandelmjöl. Häll upp granolan i en burk med lock.'
    ]
  },
  {
    title: 'Yoghurt med kokosgranola',
    servings: 1,
    image: `${IMG_BASE}/YOGHURT MED_KOKOSGRANOLA.JPG`,
    categories: ['frukost'],
    ingredients: [
      '1 dl grekisk yoghurt, 6 %',
      '3/4 dl kokosgranola (egenbakat)',
      '3 jordgubbar'
    ],
    instructions: [
      'Lägg yoghurt i en skål och lägg på kokosgranola.',
      'Skiva jordgubbar och lägg över.'
    ]
  },
  {
    title: 'Mangosmoothie med spenat',
    servings: 2,
    image: `${IMG_BASE}/MANGOSMOOTHIE_MED_SPENAT.JPG`,
    categories: ['frukost'],
    ingredients: [
      '1 msk ingefära',
      '150 g fryst mango',
      '50 g färsk spenat',
      '2 dl vatten',
      '1/2 lime',
      '1 dl mandelmjölk'
    ],
    instructions: [
      'Skala och skär ingefära i små bitar och lägg i en mixer tillsammans med mango, spenat och vatten.',
      'Mixa till en smoothie.',
      'Pressa i lime och häll på mandelmjölk och mixa lite till.',
      'Häll upp i glas.'
    ]
  },
  {
    title: 'Tomatsoppa med kanel och ingefära',
    servings: 3,
    image: `${IMG_BASE}/TOMATSOPPA_MED_KANEL_OCH_INGEFÄRA.png`,
    categories: ['vego','lunch','middag'],
    ingredients: [
      '1 gul lök',
      '1 vitlöksklyfta',
      '1 tsk olivolja',
      '1 tsk ingefära',
      '1 tsk malen kanel',
      '400 ml krossade tomater',
      '5 dl vatten',
      '1 buljongtärning grönsak',
      'Salt och svartpeppar',
      '1 krm chiliflakes',
      '100 g halloumi',
      '10 mandlar',
      '1 tsk olivolja',
      '2 msk persilja'
    ],
    instructions: [
      'Skala och hacka lök och vitlök.',
      'Riv ingefära.',
      'Hetta upp en kastrull med olja och bryn lök, vitlök, ingefära och kanel i någon minut.',
      'Tillsätt tomater, vatten och smula i buljongtärningen.',
      'Låt koka upp och smaka av med salt, peppar och chiliflakes.',
      'Lägg soppan i en matberedare och mixa ihop eller använd en stavmixer.',
      'Skär halloumi i mindre bitar.',
      'Grovhacka mandlar och hacka persilja.',
      'Hetta upp en stekpanna och stek osten och mandlar i några minuter tills det får lite färg.',
      'Häll upp soppan i en skål och toppa med persilja.'
    ]
  },
  {
    title: 'Ratatouille med quinoa och raita',
    servings: 2,
    image: `${IMG_BASE}/RATATOUILLE_MED_QUINOA_OCH_RAITA.JPG`,
    categories: ['vego','lunch','middag'],
    ingredients: [
      '1 morot',
      '1 palsternacka',
      '1/2 gul paprika',
      '1/2 röd paprika',
      '1/2 gul lök',
      '1/2 röd chili',
      '1 vitlöksklyfta',
      '1 tsk olivolja',
      '200 ml krossade tomater',
      '2 msk hackad färsk persilja',
      '1/2 grönsaksbuljongtärning',
      '1 krm paprikapulver',
      '1 krm spiskummin',
      '1 krm örtagårdskrydda',
      'Salt och svartpeppar',
      'Lite vatten',
      '1/2 dl persilja',
      '1 dl grekisk yoghurt',
      '1/2 morot',
      '5 cm gurka',
      '1 krm malen spiskummin',
      '2 dl kokt vit quinoa',
      '2 msk rostade solrosfrön',
      '2 msk persilja'
    ],
    instructions: [
      'Koka quinoa enligt anvisningarna på förpackningen.',
      'Skala och skär morötter och palsternacka i bitar, strimla löken och skär paprikorna i större bitar.',
      'Finhacka chilin och riv vitlöken fint.',
      'Hacka persilja.',
      'Hetta upp en stekpanna med olivolja och stek morötter, palsternacka, lök, vitlök och chili i några minuter.',
      'Tillsätt paprika och häll i krossade tomater, kryddor och smula ner buljongtärningen.',
      'Låt puttra i några minuter tills grönsakerna har blivit mjuka.',
      'Tillsätt lite vatten om du vill ha mer sås.',
      'Smaka av med salt och svartpeppar och rör sist ner persilja.',
      'Gör såsen genom att finhacka morot och gurka och blanda ihop alla ingredienser i en skål.',
      'Rosta solrosfrön i en torr stekpanna.',
      'Lägg kokt quinoa i en skål och häll på ratatouille.',
      'Klicka på såsen och strö på lite persilja och rostade solrosfrön.'
    ]
  },
  {
    title: 'Kycklingbiffar med mangosalsa',
    servings: 2,
    image: `${IMG_BASE}/KYCKLINGBIFFAR_MED_MANGOSALSA.JPG`,
    categories: ['kyckling','lunch','middag'],
    ingredients: [
      '300 g kycklingfärs',
      '1/2 vitlöksklyfta',
      '1/4 rödlök',
      'salt och svartpeppar',
      '1 tsk olivolja',
      '1/2 mango',
      '5 cm gurka',
      '1/4 rödlök',
      '1 chili',
      '6 cocktailtomater',
      '2 msk koriander',
      '1/4 vitlöksklyfta',
      '1 tsk ingefära',
      '1 tsk sesamolja',
      '1/2 lime',
      'salt och svartpeppar',
      '2 msk koriander',
      '2 st limeklyftor'
    ],
    instructions: [
      'Lägg kycklingfärsen i en skål.',
      'Skala och riv vitlök och finhacka rödlök.',
      'Blanda ner i färsen tillsammans med salt och peppar.',
      'Forma till två biffar.',
      'Hetta upp en stekpanna med olivolja.',
      'Stek biffarna ett par minuter på var sida.',
      'Skala och skär mango i tärningar.',
      'Tärna gurka och skala och finhacka rödlök.',
      'Skiva chili fint och hacka koriander.',
      'Dela cocktailtomaterna.',
      'Blanda mango med alla grönsaker i en skål och tillsätt koriander.',
      'Skala och riv vitlök och ingefära och blanda ner tillsammans med sesamolja och juice från en halv lime.',
      'Salta och peppra.',
      'Lägg upp kycklingbiffarna på ett fat tillsammans mangosalsan.',
      'Dekorera med koriander och limeklyftor.'
    ]
  },
  {
    title: 'Kycklinggryta med garam masala',
    servings: 4,
    image: `${IMG_BASE}/KYCKLINGGRYTA_MED_GARAM_MASALA.JPG`,
    categories: ['kyckling','middag'],
    ingredients: [
      '2 tsk olivolja',
      '1 kg kycklingklubbor',
      '1 gul lök',
      '1 vitlöksklyfta',
      'Salt och svartpeppar',
      '1/4 blomkål',
      '2 tomater',
      '33 g garam masala (en förpackning)',
      '400 ml kokosmjölk',
      '2 msk persilja',
      '2 dl fefferoni',
      '1 dl grekisk yoghurt',
      '1 dl mango chutney',
      '1/2 dl persilja'
    ],
    instructions: [
      'Skala och hacka lök och riv vitlök.',
      'Hetta upp en stekpanna med olja och bryn kycklingklubborna.',
      'Lägg ner lök och vitlök.',
      'Strö på salt och peppar.',
      'Lägg över kycklingen i en gryta.',
      'Tillsätt garam masala och kokosmjölk.',
      'Låt sjuda på svag värme i 40 minuter.',
      'Skär blomkål i buketter och dela tomater i klyftor.',
      'Hacka persilja.',
      'Blanda ner i grytan och låt koka i några minuter.',
      'Strö på persilja.',
      'Servera grytan tillsammans med fefferoni, grekisk yoghurt, mango chutney och persilja.'
    ]
  },
  {
    title: 'Laxsallad med ägg',
    servings: 1,
    image: `${IMG_BASE}/LAXSALLAD_MED_ÄGG.JPG`,
    categories: ['fisk','lunch'],
    ingredients: [
      '2 kokta ägg',
      '1/2 msk majonnäs',
      'salt och svartpeppar',
      '3 dl ruccolasallad',
      '100 g rökt lax',
      '100 g broccoli',
      '1/4 citron',
      '2 cocktailtomater',
      '1 tsk gräslök'
    ],
    instructions: [
      'Skala ägg och hacka fint i en skål.',
      'Blanda i majonnäs, salt och peppar.',
      'Lägg ruccolasallad i en skål.',
      'Rulla ihop laxen till rosetter och lägg på ruccolasalladen.',
      'Skär broccoli i små buketter och pressa citronjuice över.',
      'Skär cocktailtomater i klyftor och hacka gräslök.',
      'Lägg äggen tillsammans med de övriga ingredienserna i skålen.',
      'Strö på gräslök.'
    ]
  },
  {
    title: 'Stekt lax med citronmarinerad broccoli',
    servings: 2,
    image: `${IMG_BASE}/STEKT_LAX_MED_CITRONMARINERAD_BROCCOLI.JPG`,
    categories: ['fisk','middag'],
    ingredients: [
      '300 g laxfilé',
      'Salt och svartpeppar',
      '1 tsk olivolja',
      '1/2 broccolistånd',
      '1/2 citron',
      '1 tsk olivolja',
      '2 citronskivor',
      '2 msk gräslök',
      '2 msk romsås (Erik Lallerstedt)'
    ],
    instructions: [
      'Dela laxen i 2 bitar och strö på salt och peppar.',
      'Skär broccoli i buketter och lägg i en skål.',
      'Tillsätt citronjuice, olivolja, salt och peppar.',
      'Hetta upp en stekpanna med olja och bryn laxen runt om i cirka 8 minuter.',
      'Servera laxen med den citronmarinerade broccolin och romsås.',
      'Hacka gräslök.',
      'Strö på gräslök och dekorera med citronskivor.'
    ]
  },
  {
    title: 'Torskgryta med rotfrukter och curry',
    servings: 2,
    image: `${IMG_BASE}/TORSKGRYTA_MED_ROTFRUKTER_OCH_CURRY.JPG`,
    categories: ['fisk','lunch','middag'],
    ingredients: [
      '300 g fryst torskrygg',
      'Salt och svartpeppar',
      '1 vitlöksklyfta',
      '1/2 fänkål',
      '1 morot',
      '1/2 palsternacka',
      '10 cm purjolök',
      '1/2 msk olivolja',
      '1 tsk malen curry',
      '1/2 fiskbuljongtärning',
      '3 dl vatten',
      '1/2 dl havregrädde',
      '8 cocktailtomater',
      '2 msk gräslök'
    ],
    instructions: [
      'Tina torsk och skär i bitar.',
      'Strö på salt och peppar.',
      'Skala och riv vitlöksklyftan.',
      'Hacka gräslök.',
      'Skär fänkål i mindre bitar.',
      'Skala och skär morot och palsternacka i mindre bitar.',
      'Strimla purjolök.',
      'Hetta upp en kastrull med olja och bryn vitlök, fänkål och rotfrukter i någon minut.',
      'Tillsätt curry.',
      'Smula ner buljongtärningen och häll på vatten och grädde.',
      'Låt koka ihop i 5 minuter och lägg ner torsk, tomater och purjolök.',
      'Låt sjuda några minuter och häll upp soppan i skålar.',
      'Strö på gräslök.'
    ]
  },
  {
    title: 'Lövbiff teriyaki med nudelsallad',
    servings: 2,
    image: `${IMG_BASE}/LÖVBIFF_TERIYAKI_MED_NUDELSALLAD.jpg`,
    categories: ['kött','lunch','middag'],
    ingredients: [
      '300 g lövbiff',
      '1/2 gul lök',
      '1 vitlöksklyfta',
      '1/2 dl teriyakisås',
      '1 msk ingefära',
      '1 tsk sesamolja',
      '1 msk sesamfrön',
      'Salt och svartpeppar',
      '80 g glasnudlar',
      '1 morot',
      '1 salladslök',
      '100 g sockerärtor',
      '1/2 röd chili',
      '1 tsk sesamolja',
      '1/2 msk ketjap manis',
      '2 msk färsk koriander',
      '1/2 dl grekisk yoghurt',
      '1 krm sriracha sås',
      '1/4 vitlök',
      'Salt och svartpeppar',
      'Färsk koriander',
      '1/2 dl salladslök'
    ],
    instructions: [
      'Strimla lövbiffen och lägg i en skål.',
      'Skala och strimla lök.',
      'Riv vitlök och ingefära.',
      'Blanda ner vitlök, ingefära, teriyakisås, sesamolja och sesamfrön i skålen med lövbiff.',
      'Strö på salt och peppar.',
      'Låt marinera en stund.',
      'Koka nudlar enligt anvisningen på paketet och häll av vattnet.',
      'Lägg nudlarna i en skål.',
      'Skala och skär morot i strimlor. Strimla salladslök och chili.',
      'Skär sockerärtor fint.',
      'Hacka koriander.',
      'Blanda ner alla grönsaker i nudelsalladen.',
      'Blanda ner sesamolja, ketjap manis, koriander, salt och peppar.',
      'Gör chiliyoghurten genom att riva vitlök och blanda ihop alla ingredienser i en skål.',
      'Hetta upp en stekpanna och stek lövbiffen i ett par minuter.',
      'Lägg upp nudlarna i en skål och lägg på lövbiffen.',
      'Hacka koriander och strimpla salladslök.',
      'Dekorera med färsk koriander och salladslök.',
      'Servera med chiliyoghurt.'
    ]
  },
  {
    title: 'Köttfärsbiffar med champinjonhattar',
    servings: 2,
    image: `${IMG_BASE}/KÖTTFÄRSB IFFAR_MED_CHAMPINJONHATTAR.JPG`,
    categories: ['kött','middag'],
    ingredients: [
      '1 vitlöksklyfta',
      '1/4 gul lök',
      '300 g nötfärs',
      '2 msk persilja',
      '1 krm örtagårdskrydda',
      'salt och svartpeppar',
      '4 champinjoner',
      '100 g ädelost',
      '1/2 dl pekannötter',
      '2 fikon',
      '1 tsk olivolja',
      '2 msk creme fraiche',
      '1 msk majonnäs',
      '1 tsk grön pesto',
      'salt och svartpeppar',
      '25 g rucolasallad'
    ],
    instructions: [
      'Sätt ugnen på 200 grader.',
      'Skala och riv vitlök fint och finhacka lök och persilja.',
      'Blanda ner färs, vitlök, lök, persilja, örtagårdskrydda, salt och peppar i en skål.',
      'Forma färsen till biffar.',
      'Gröp ur champinjonerna.',
      'Fyll champinjonerna med ädelost.',
      'Rosta pekannötterna hastigt i en torr stekpanna.',
      'Tryck fast två pekannötter i varje champinjon.',
      'Skär varje fikon i fyra delar.',
      'Lägg en klyfta fikon på varje champinjon.',
      'Häll olivolja på en plåt.',
      'Lägg biffarna och de fyllda champinjonerna på plåten.',
      'Sätt in i ugnen i 20 minuter.',
      'Blanda creme fraiche med majonnäs i en bunke.',
      'Tillsätt pesto.',
      'Salta och peppra.',
      'Placera biffarna och de fyllda champinjonerna tillsammans med rucolasallad på ett fat.',
      'Dekorera med resterande rostade pekannötter och fikon.',
      'Klicka på pestoröra.'
    ]
  },
  {
    title: 'Snickerskaka',
    servings: 20,
    image: `${IMG_BASE}/SNICKERSKAKA.jpg`,
    categories: ['dessert'],
    ingredients: [
      '150 g smör',
      '1 dl agavesirap',
      '1/2 dl kakao',
      '2 krm vaniljpulver',
      '2 dl mandelmjöl',
      '1 msk fiberhusk',
      '3 ägg',
      '1 dl saltade jordnötter',
      '150 g mörk choklad',
      '2 dl saltade jordnötter',
      '1 dl jordnötssmör'
    ],
    instructions: [
      'Sätt ugnen på 175 grader.',
      'Smält smör i en kastrull och blanda ner agave, kakao, vaniljpulver, mandelmjöl, fiberhusk och ägg.',
      'Häll blandningen i en bakplåtsklädd form cirka 20 x 25 cm.',
      'Strö på jordnötter och grädda i 20 minuter i ugnen.',
      'Ta ut och låt svalna.',
      'Smält choklad över vattenbad och blanda ner jordnötter.',
      'Bred på jordnötssmör på kakan och häll över chokladblandningen.',
      'Ställ in i kylen i 3-4 timmar.',
      'Skär upp i rutor.',
      'Förvara i kylen eller i frysen.'
    ]
  }
];

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
    // Upsert recipes
    const created: any[] = [];
    for (const r of RECIPES) {
      const slug = slugify(r.title);
      const instructionsString = Array.isArray(r.instructions)
        ? r.instructions.map((s, i) => `${i + 1}. ${s}`).join(' ')
        : (r.instructions || '');
      const doc = await prisma.recipe.upsert({
        where: { slug },
        create: {
          title: r.title,
          slug,
          content: instructionsString,
          instructions: instructionsString,
          ingredients: r.ingredients,
          categories: r.categories || [],
          servings: r.servings || null,
          imageUrl: r.image || undefined,
          isPremium: true,
          isFree: false
        },
        update: {
          content: instructionsString,
          instructions: instructionsString,
          ingredients: r.ingredients,
          categories: r.categories || [],
          servings: r.servings || null,
          imageUrl: r.image || undefined,
        }
      });
      created.push({ id: doc.id, slug });
    }

    // Update meal plan week 1 with recipe links
    const course = 'hormone';
    const weekNumber = 1;
    const getLink = (title: string) => `/kunskapsbank/recept/${slugify(title)}`;

    const days = {
      'Måndag': {
        breakfast: { name: 'Ostmacka med paprika', recipeLink: getLink('Ostmacka med paprika') },
        lunch: { name: 'Laxsallad med ägg', recipeLink: getLink('Laxsallad med ägg') },
        dinner: { name: 'Lövbiff teriyaki med nudelsallad', recipeLink: getLink('Lövbiff teriyaki med nudelsallad') },
        snack: { name: 'Kavring med frön', recipeLink: getLink('Kavring med frön') }
      },
      'Tisdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: getLink('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Torskgryta med rotfrukter och curry', recipeLink: getLink('Torskgryta med rotfrukter och curry') },
        dinner: { name: 'Kycklingbiffar med mangosalsa', recipeLink: getLink('Kycklingbiffar med mangosalsa') },
        snack: { name: 'Kokosgranola', recipeLink: getLink('Kokosgranola') }
      },
      'Onsdag': {
        breakfast: { name: 'Yoghurt med kokosgranola', recipeLink: getLink('Yoghurt med kokosgranola') },
        lunch: { name: 'Lövbiff teriyaki med nudelsallad (rester)', recipeLink: getLink('Lövbiff teriyaki med nudelsallad') },
        dinner: { name: 'Ratatouille med quinoa och raita', recipeLink: getLink('Ratatouille med quinoa och raita') }
      },
      'Torsdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: getLink('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Kycklingbiffar med mangosalsa (rester)', recipeLink: getLink('Kycklingbiffar med mangosalsa') },
        dinner: { name: 'Tomatsoppa med kanel och ingefära', recipeLink: getLink('Tomatsoppa med kanel och ingefära') }
      },
      'Fredag': {
        breakfast: { name: 'Mangosmoothie med spenat', recipeLink: getLink('Mangosmoothie med spenat') },
        lunch: { name: 'Ratatouille med quinoa och raita (rester)', recipeLink: getLink('Ratatouille med quinoa och raita') },
        dinner: { name: 'Kycklinggryta med garam masala', recipeLink: getLink('Kycklinggryta med garam masala') }
      },
      'Lördag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: getLink('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Kycklinggryta med garam masala (rester)', recipeLink: getLink('Kycklinggryta med garam masala') },
        dinner: { name: 'Köttfärsbiffar med champinjonhattar', recipeLink: getLink('Köttfärsbiffar med champinjonhattar') },
        dessert: { name: 'Snickerskaka', recipeLink: getLink('Snickerskaka') }
      },
      'Söndag': {
        breakfast: { name: 'Mangosmoothie med spenat (rester)', recipeLink: getLink('Mangosmoothie med spenat') },
        lunch: { name: 'Köttfärsbiffar med champinjonhattar (rester)', recipeLink: getLink('Köttfärsbiffar med champinjonhattar') },
        dinner: { name: 'Stekt lax med citronmarinerad broccoli', recipeLink: getLink('Stekt lax med citronmarinerad broccoli') }
      }
    } as any;

    await (prisma as any).mealPlanWeek?.upsert({
      where: { course_weekNumber: { course, weekNumber } },
      create: { course, weekNumber, title: 'Vecka 1', days },
      update: { title: 'Vecka 1', days }
    });

    return NextResponse.json({ ok: true, created });
  } catch (error) {
    console.error('Seed hormone week1 recipes error:', error);
    return NextResponse.json({ error: 'Failed to seed recipes' }, { status: 500 });
  }
}



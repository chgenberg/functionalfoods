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
    image: null,
    categories: ['frukost'],
    ingredients: [
      '3 dl vatten',
      '1 msk citronjuice',
      '1 kopp kaffe/te'
    ],
    instructions: [
      'Häll upp vatten i ett glas.',
      'Pressa ner citronjuice och rör om.',
      'Drick vattnet tillsammans med en kopp kaffe eller te.'
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
      'Smör och bovetemjöl till formen',
      '1 msk pumpafrön + 1 msk solrosfrön + 1 msk sesamfrön (topping)'
    ],
    instructions: [
      'Sätt ugnen på 175°C.',
      'Blanda filmjölk, brödsirap, bovetemjöl, havremjöl, linfrö, solroskärnor, pumpafrön, russin och bikarbonat i en bunke. Låt svälla några minuter.',
      'Smöra och mjöla en brödform (1,5–2 liter).',
      'Fördela smeten i formen och toppa med pumpafrön, solrosfrön och sesamfrön.',
      'Grädda i nedre delen av ugnen ca 50 minuter.',
      'Låt svalna på galler innan du skär upp.'
    ]
  },
  {
    title: 'Ostmacka med paprika',
    servings: 1,
    image: `${IMG_BASE}/OSTMACKA_MED_PAPRIKA.JPG`,
    categories: ['frukost'],
    ingredients: [
      '1 skiva kavring',
      '1 tsk smör',
      '1 skiva ost',
      '3 paprikaringar',
      '2 cocktailtomater'
    ],
    instructions: [
      'Bred smör på kavringen.',
      'Lägg på ost och paprikaringar.',
      'Servera med cocktailtomater.'
    ]
  },
  {
    title: 'Kokosgranola',
    servings: 15,
    image: `${IMG_BASE}/KOKOSGRANOLA.JPG`,
    categories: ['egenbakat','frukost'],
    ingredients: [
      '1 dl paranötter', '1 dl valnötter', '1 dl hasselnötter', '1 dl mandel', '1 dl pumpafrön', '4 dl mandelmjöl',
      '1 msk Nikks fiberhonung', '1 msk rapsolja', '1 msk malen kanel', '1 tsk malen kardemumma', '1 krm salt',
      '2 dl kokosflingor', '2 dl kokosskivor'
    ],
    instructions: [
      'Hacka alla nötter grovt.',
      'Hetta upp en stekpanna och rosta mandelmjöl med Nikks fiberhonung, rapsolja, kanel, kardemumma och salt ca 5 minuter på låg värme.',
      'Blanda ner kokosflingor och kokosskivor.',
      'Rosta nötter och pumpafrön i en torr stekpanna och blanda ner i granolan.',
      'Låt svalna och förvara i burk med lock.'
    ]
  },
  {
    title: 'Yoghurt med kokosgranola',
    servings: 1,
    image: `${IMG_BASE}/YOGHURT MED_KOKOSGRANOLA.JPG`,
    categories: ['frukost'],
    ingredients: ['1 dl grekisk yoghurt, 6 %', '3/4 dl kokosgranola (egenbakat)', '3 jordgubbar'],
    instructions: [
      'Lägg yoghurt i en skål.',
      'Toppa med kokosgranola (egenbakat).',
      'Skiva jordgubbar och lägg över.'
    ]
  },
  {
    title: 'Mangosmoothie med spenat',
    servings: 2,
    image: `${IMG_BASE}/MANGOSMOOTHIE_MED_SPENAT.JPG`,
    categories: ['frukost'],
    ingredients: ['1 msk ingefära', '150 g fryst mango', '50 g färsk spenat', '2 dl vatten', '1/2 lime', '1 dl mandelmjölk'],
    instructions: [
      'Skala och skär ingefäran i små bitar.',
      'Lägg ingefära, fryst mango, spenat och vatten i en mixer och mixa slätt.',
      'Pressa i lime och tillsätt mandelmjölk. Mixa kort igen.',
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
      'Skala och hacka lök och vitlök. Riv ingefära.',
      'Hetta upp en kastrull med olja och bryn lök, vitlök, ingefära och kanel i någon minut.',
      'Tillsätt krossade tomater, vatten och smula i buljongtärningen. Låt koka upp.',
      'Smaka av med salt, peppar och chiliflakes och mixa soppan slät.',
      'Skär halloumi i mindre bitar. Grovhacka mandlar och hacka persilja.',
      'Stek halloumi och mandlar i lite olja några minuter.',
      'Häll upp soppan och toppa med persilja.'
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
      'Raita: 1 dl grekisk yoghurt, 1/2 riven morot, 5 cm gurka, 1 krm malen spiskummin, salt och peppar',
      'Tillbehör: 2 dl kokt vit quinoa, 2 msk rostade solrosfrön, 2 msk persilja'
    ],
    instructions: [
      'Koka quinoan enligt anvisning.',
      'Skala och skär morot och palsternacka i bitar, strimla lök och skär paprikorna i större bitar.',
      'Finhacka chili och riv vitlök.',
      'Hetta upp olja och stek morot, palsternacka, lök, vitlök och chili några minuter.',
      'Tillsätt paprika, krossade tomater, kryddor och smula ner buljongtärning. Låt puttra tills grönsakerna mjuknat. Späd med lite vatten vid behov.',
      'Smaka av med salt och peppar och rör ner persilja.',
      'Raita: Blanda yoghurt, riven morot, finhackad gurka och spiskummin. Smaka av med salt och peppar.',
      'Servera med kokt vit quinoa, klicka på raita och toppa med persilja och rostade solrosfrön.'
    ]
  },
  {
    title: 'Kycklingbiffar med mangosalsa',
    servings: 2,
    image: `${IMG_BASE}/KYCKLINGBIFFAR_MED_MANGOSALSA.JPG`,
    categories: ['kyckling','lunch','middag'],
    ingredients: [
      '300 g kycklingfärs', '1/2 vitlöksklyfta', '1/4 rödlök', 'salt och svartpeppar', '1 tsk olivolja',
      '1/2 mango', '5 cm gurka', '1/4 rödlök', '1 chili', '6 cocktailtomater', '2 msk koriander',
      '1/4 vitlöksklyfta', '1 tsk ingefära', '1 tsk sesamolja', '1/2 lime', 'salt och svartpeppar',
      'Dekoration: 2 msk koriander, 2 limeklyftor'
    ],
    instructions: [
      'Lägg kycklingfärsen i en skål.',
      'Riv vitlök och finhacka rödlök. Blanda med färsen och krydda med salt och peppar.',
      'Forma två biffar och stek i olja några minuter per sida.',
      'Skala och tärna mango. Tärna gurka, finhacka rödlök och chili, dela cocktailtomater och hacka koriander.',
      'Riv vitlök och ingefära och blanda allt till en salsa med sesamolja och limesaft. Smaka av med salt och peppar.',
      'Servera biffarna med mangosalsan. Dekorera med koriander och limeklyftor.'
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
      'Tillbehör: 2 dl fefferoni, 1 dl grekisk yoghurt, 1 dl mango chutney, 1/2 dl persilja'
    ],
    instructions: 'Skala och hacka lök och riv vitlök. Hetta upp en stekpanna med olja och bryn kycklingklubborna. Lägg ner lök och vitlök och krydda med salt och peppar. Lägg över kycklingen i en gryta. Tillsätt garam masala och kokosmjölk och låt sjuda på svag värme i 40 minuter. Skär blomkål i buketter och dela tomater i klyftor, hacka persilja. Blanda ner i grytan och låt koka i några minuter. Strö på persilja. Servera grytan med fefferoni, grekisk yoghurt, mango chutney och persilja.'
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
      'Topping: 1 tsk gräslök'
    ],
    instructions: 'Skala ägg och hacka fint i en skål. Blanda i majonnäs, salt och peppar. Lägg ruccolasallad i en skål. Rulla ihop laxen till rosetter och lägg på ruccolan. Skär broccoli i små buketter och pressa citronjuice över. Skär cocktailtomater i klyftor och hacka gräslök. Lägg äggen tillsammans med de övriga ingredienserna i skålen. Strö på gräslök.'
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
      'Tillbehör: 2 citronskivor, 2 msk gräslök, 2 msk romsås (Erik Lallerstedt)'
    ],
    instructions: 'Dela laxen i 2 bitar och strö på salt och peppar. Skär broccoli i buketter och lägg i en skål. Tillsätt citronjuice, olivolja, salt och peppar. Hetta upp en stekpanna med olja och bryn laxen runt om i cirka 8 minuter. Servera laxen med den citronmarinerade broccolin och romsås. Hacka gräslök och strö på. Dekorera med citronskivor.'
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
    instructions: 'Tina torsk och skär i bitar, salta och peppra. Riv vitlök och hacka gräslök. Skär fänkål i mindre bitar, morot och palsternacka i mindre bitar och strimla purjolök. Hetta upp en kastrull med olja och bryn vitlök, fänkål och rotfrukter i någon minut. Tillsätt curry. Smula ner buljongtärning och häll på vatten och havregrädde. Låt koka ihop i 5 minuter och lägg ner torsk, cocktailtomater och purjolök. Låt sjuda några minuter och häll upp soppan i skålar. Strö på gräslök.'
  },
  {
    title: 'Lövbiff teriyaki med nudelsallad',
    servings: 2,
    image: `${IMG_BASE}/LÖVBIFF_TERIYAKI_MED_NUDELSALLAD.jpg`,
    categories: ['kött','lunch','middag'],
    ingredients: ['300 g lövbiff', '1/2 gul lök', '1 vitlöksklyfta', '1/2 dl teriyakisås', '1 msk ingefära', '1 tsk sesamolja', '1 msk sesamfrön', 'Salt', 'Peppar', '80 g glasnudlar', '1 morot', '1 salladslök', '100 g sockerärtor', '1/2 röd chili', '1 tsk sesamolja', '1/2 msk ketjap manis', '2 msk koriander', 'Chiliyoghurt: 1/2 dl yoghurt, 1 krm sriracha, 1/4 vitlök, salt, peppar'],
    instructions: [
      'Marinera strimlad lövbiff i vitlök, ingefära, teriyakisås och sesamolja. Strö över sesamfrön.',
      'Koka glasnudlar enligt anvisning och blanda med riven morot, strimlad salladslök, sockerärtor, finhackad chili och lite sesamolja samt ketjap manis.',
      'Stek den marinerade lövbiffen snabbt på hög värme.',
      'Servera med chiliyoghurt och toppa med koriander och salladslök.'
    ]
  },
  {
    title: 'Köttfärsbiffar med champinjonhattar',
    servings: 2,
    image: `${IMG_BASE}/KÖTTFÄRSB IFFAR_MED_CHAMPINJONHATTAR.JPG`,
    categories: ['kött','middag'],
    ingredients: ['1 vitlöksklyfta', '1/4 gul lök', '300 g nötfärs', '2 msk persilja', '1 krm örtagårdskrydda', 'Salt', 'Peppar', '4 champinjoner', '100 g ädelost', '1/2 dl pekannötter', '2 fikon', '1 tsk olivolja', '2 msk creme fraiche', '1 msk majonnäs', '1 tsk grön pesto', 'Salt', 'Peppar', '25 g rucola'],
    instructions: [
      'Skala och riv vitlök. Finhacka gul lök.',
      'Blanda nötfärs med vitlök, lök, persilja, örtagårdskrydda, salt och peppar. Forma biffar.',
      'Fyll champinjonhattar med ädelost och pekannötter. Lägg fikon ovanpå.',
      'Tillaga biffar och fyllda champinjoner i ugn 200°C ca 20 minuter.',
      'Rör ihop pestoröran: creme fraiche, majonnäs och grön pesto.',
      'Servera biffarna med rucola och pestoröran.'
    ]
  },
  {
    title: 'Snickerskaka',
    servings: 20,
    image: `${IMG_BASE}/SNICKERSKAKA.jpg`,
    categories: ['dessert'],
    ingredients: ['150 g smör', '1 dl agavesirap', '1/2 dl kakao', '2 krm vaniljpulver', '2 dl mandelmjöl', '1 msk fiberhusk', '3 ägg', '1 dl saltade jordnötter', 'Glasyr: 150 g mörk choklad, 2 dl saltade jordnötter, 1 dl jordnötssmör'],
    instructions: [
      'Sätt ugnen på 175°C.',
      'Blanda smält smör, agavesirap, kakao, vaniljpulver, mandelmjöl, fiberhusk och ägg till en smet.',
      'Häll smeten i en form (ca 20×25 cm) och grädda ca 20 minuter. Låt svalna.',
      'Täck kakan med jordnötssmör.',
      'Smält mörk choklad och blanda med saltade jordnötter. Bred över kakan.',
      'Kyl 3–4 timmar och skär i rutor.'
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
      const doc = await prisma.recipe.upsert({
        where: { slug },
        create: {
          title: r.title,
          slug,
          content: r.instructions,
          ingredients: r.ingredients,
          categories: r.categories || [],
          servings: r.servings || null,
          imageUrl: r.image || undefined,
          isPremium: true,
          isFree: false
        },
        update: {
          content: r.instructions,
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



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
  instructions: string;
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
    instructions: 'Häll upp vatten i ett glas och pressa ner citronjuice. Drick tillsammans med en kopp kaffe eller te.'
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
    instructions: 'Sätt ugnen på 175°C. Blanda alla ingredienser. Smöra och mjöla en brödform (1.5–2 liter). Fördela smeten, toppa med frön och grädda ca 50 min i nedre delen. Låt svalna på galler.'
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
    instructions: 'Bred smör på brödet. Lägg på ost och paprika. Servera med tomater.'
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
    instructions: 'Hacka nötter. Rosta mandelmjöl med fiberhonung, olja och kryddor 5 min på låg värme. Blanda i kokosflingor/skivor. Rosta nötter och pumpafrön separat och blanda i. Förvara i burk.'
  },
  {
    title: 'Yoghurt med kokosgranola',
    servings: 1,
    image: `${IMG_BASE}/YOGHURT MED_KOKOSGRANOLA.JPG`,
    categories: ['frukost'],
    ingredients: ['1 dl grekisk yoghurt, 6 %', '3/4 dl kokosgranola (egenbakat)', '3 jordgubbar'],
    instructions: 'Lägg yoghurt i skål, toppa med granola och skivade jordgubbar.'
  },
  {
    title: 'Mangosmoothie med spenat',
    servings: 2,
    image: `${IMG_BASE}/MANGOSMOOTHIE_MED_SPENAT.JPG`,
    categories: ['frukost'],
    ingredients: ['1 msk ingefära', '150 g fryst mango', '50 g färsk spenat', '2 dl vatten', '1/2 lime', '1 dl mandelmjölk'],
    instructions: 'Mixa ingefära, mango, spenat och vatten. Pressa lime, tillsätt mandelmjölk, mixa kort igen.'
  },
  {
    title: 'Tomatsoppa med kanel och ingefära',
    servings: 3,
    image: `${IMG_BASE}/TOMATSOPPA_MED_KANEL_OCH_INGEFÄRA.png`,
    categories: ['vego','lunch','middag'],
    ingredients: [
      '1 gul lök', '1 vitlöksklyfta', '1 tsk olivolja', '1 tsk ingefära', '1 tsk malen kanel', '400 ml krossade tomater',
      '5 dl vatten', '1 grönsaksbuljongtärning', 'Salt', 'Svartpeppar', '1 krm chiliflakes', '100 g halloumi', '10 mandlar', '1 tsk olivolja', '2 msk persilja'
    ],
    instructions: 'Fräs lök, vitlök, ingefära och kanel i olja. Tillsätt tomater, vatten, buljong. Koka och mixa. Stek halloumi och mandlar. Toppa soppan med persilja.'
  },
  {
    title: 'Ratatouille med quinoa och raita',
    servings: 2,
    image: `${IMG_BASE}/RATATOUILLE_MED_QUINOA_OCH_RAITA.JPG`,
    categories: ['vego','lunch','middag'],
    ingredients: [
      '1 morot', '1 palsternacka', '1/2 gul paprika', '1/2 röd paprika', '1/2 gul lök', '1/2 röd chili', '1 vitlöksklyfta', '1 tsk olivolja', '200 ml krossade tomater', '2 msk persilja', '1/2 grönsaksbuljongtärning', 'Kryddor: paprikapulver, spiskummin, örtagård', 'Salt', 'Svartpeppar', 'Lite vatten', '1/2 dl persilja', '2 dl kokt vit quinoa', '2 msk rostade solrosfrön'
    ],
    instructions: 'Koka quinoa. Stek rotfrukter, lök och chili, tillsätt paprika, tomater, buljong och kryddor. Låt puttra. Rör i persilja. Raita: yoghurt + finhackad morot och gurka + spiskummin. Servera med quinoa, raita och solrosfrön.'
  },
  {
    title: 'Kycklingbiffar med mangosalsa',
    servings: 2,
    image: `${IMG_BASE}/KYCKLINGBIFFAR_MED_MANGOSALSA.JPG`,
    categories: ['kyckling','lunch','middag'],
    ingredients: ['300 g kycklingfärs', '1/2 vitlöksklyfta', '1/4 rödlök', 'Salt och peppar', '1 tsk olivolja', '1/2 mango', '5 cm gurka', '1/4 rödlök', '1 chili', '6 cocktailtomater', '2 msk koriander', '1/4 vitlöksklyfta', '1 tsk ingefära', '1 tsk sesamolja', '1/2 lime', 'Salt och peppar'],
    instructions: 'Blanda färs med vitlök, rödlök, salt och peppar. Stek biffar i olja. Mangosalsa: tärna mango och grönsaker, blanda med vitlök, ingefära, sesamolja och lime. Servera biffar med salsan.'
  },
  {
    title: 'Kycklinggryta med garam masala',
    servings: 4,
    image: `${IMG_BASE}/KYCKLINGGRYTA_MED_GARAM_MASALA.JPG`,
    categories: ['kyckling','middag'],
    ingredients: ['2 tsk olivolja', '1 kg kycklingklubbor', '1 gul lök', '1 vitlöksklyfta', 'Salt och peppar', '1/4 blomkål', '2 tomater', '33 g garam masala', '400 ml kokosmjölk', '2 msk persilja', 'Tillbehör: fefferoni, grekisk yoghurt, mango chutney, persilja'],
    instructions: 'Bryn kycklingen med lök och vitlök, krydda. Lägg i gryta, tillsätt garam masala och kokosmjölk. Sjuda ca 40 min. Lägg i blomkål och tomater, låt koka kort. Strö persilja och servera med tillbehör.'
  },
  {
    title: 'Laxsallad med ägg',
    servings: 1,
    image: `${IMG_BASE}/LAXSALLAD_MED_ÄGG.JPG`,
    categories: ['fisk','lunch'],
    ingredients: ['2 kokta ägg', '1/2 msk majonnäs', 'Salt och peppar', '3 dl ruccola', '100 g rökt lax', '100 g broccoli', '1/4 citron', '2 cocktailtomater', '1 tsk gräslök'],
    instructions: 'Blanda hackat ägg med majonnäs, salt och peppar. Lägg upp ruccola, laxrosetter, citronmarinerad broccoli och cocktailtomater. Toppa med ägg och gräslök.'
  },
  {
    title: 'Stekt lax med citronmarinerad broccoli',
    servings: 2,
    image: `${IMG_BASE}/STEKT_LAX_MED_CITRONMARINERAD_BROCCOLI.JPG`,
    categories: ['fisk','middag'],
    ingredients: ['300 g laxfilé', 'Salt och peppar', '1 tsk olivolja', '1/2 broccolistånd', '1/2 citron', '1 tsk olivolja', 'Tillbehör: 2 citronskivor, 2 msk gräslök, 2 msk romsås'],
    instructions: 'Marinera broccoli i citron, olja, salt och peppar. Stek lax ca 8 min. Servera med broccoli, romsås och gräslök, dekorera med citronskivor.'
  },
  {
    title: 'Torskgryta med rotfrukter och curry',
    servings: 2,
    image: `${IMG_BASE}/TORSKGRYTA_MED_ROTFRUKTER_OCH_CURRY.JPG`,
    categories: ['fisk','lunch','middag'],
    ingredients: ['300 g torskrygg', 'Salt och peppar', '1 vitlöksklyfta', '1/2 fänkål', '1 morot', '1/2 palsternacka', '10 cm purjolök', '1/2 msk olivolja', '1 tsk malen curry', '1/2 fiskbuljongtärning', '3 dl vatten', '1/2 dl havregrädde', '8 cocktailtomater', '2 msk gräslök'],
    instructions: 'Fräs vitlök, fänkål och rotfrukter i olja med curry. Tillsätt buljong, vatten, grädde. Lägg i torsk, tomater och purjo, sjud tills fisken är klar. Toppa med gräslök.'
  },
  {
    title: 'Lövbiff teriyaki med nudelsallad',
    servings: 2,
    image: `${IMG_BASE}/LÖVBIFF_TERIYAKI_MED_NUDELSALLAD.jpg`,
    categories: ['kött','lunch','middag'],
    ingredients: ['300 g lövbiff', '1/2 gul lök', '1 vitlöksklyfta', '1/2 dl teriyakisås', '1 msk ingefära', '1 tsk sesamolja', '1 msk sesamfrön', 'Salt', 'Peppar', '80 g glasnudlar', '1 morot', '1 salladslök', '100 g sockerärtor', '1/2 röd chili', '1 tsk sesamolja', '1/2 msk ketjap manis', '2 msk koriander', 'Chiliyoghurt: 1/2 dl yoghurt, 1 krm sriracha, 1/4 vitlök, salt, peppar'],
    instructions: 'Marinera strimlad lövbiff i vitlök, ingefära, teriyaki, sesamolja och frön. Koka nudlar, blanda med grönsaker och smaksätt. Stek lövbiffen snabbt. Servera med chiliyoghurt, koriander och salladslök.'
  },
  {
    title: 'Köttfärsbiffar med champinjonhattar',
    servings: 2,
    image: `${IMG_BASE}/KÖTTFÄRSB IFFAR_MED_CHAMPINJONHATTAR.JPG`,
    categories: ['kött','middag'],
    ingredients: ['1 vitlöksklyfta', '1/4 gul lök', '300 g nötfärs', '2 msk persilja', '1 krm örtagårdskrydda', 'Salt', 'Peppar', '4 champinjoner', '100 g ädelost', '1/2 dl pekannötter', '2 fikon', '1 tsk olivolja', '2 msk creme fraiche', '1 msk majonnäs', '1 tsk grön pesto', 'Salt', 'Peppar', '25 g rucola'],
    instructions: 'Blanda färs med lök, vitlök, persilja, kryddor och forma biffar. Fyll champinjoner med ädelost och pekannötter, lägg fikon på. Ugn 200°C ca 20 min tillsammans med biffar. Rör ihop pestoröra (creme fraiche + majonnäs + pesto). Servera med rucola och pestoröra.'
  },
  {
    title: 'Snickerskaka',
    servings: 20,
    image: `${IMG_BASE}/SNICKERSKAKA.jpg`,
    categories: ['dessert'],
    ingredients: ['150 g smör', '1 dl agavesirap', '1/2 dl kakao', '2 krm vaniljpulver', '2 dl mandelmjöl', '1 msk fiberhusk', '3 ägg', '1 dl saltade jordnötter', 'Glasyr: 150 g mörk choklad, 2 dl saltade jordnötter, 1 dl jordnötssmör'],
    instructions: 'Sätt ugnen på 175°C. Blanda smält smör, agave, kakao, vanilj, mandelmjöl, fiberhusk och ägg. Grädda i 20×25 cm form ca 20 min. Låt svalna. Täck med jordnötssmör och choklad+nötter smälta över vattenbad. Kyl 3–4 h och skär i rutor.'
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
        lunch: { name: 'Lövbiff teriyaki med nudelsallad (rester)' },
        dinner: { name: 'Ratatouille med quinoa och raita', recipeLink: getLink('Ratatouille med quinoa och raita') }
      },
      'Torsdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: getLink('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Kycklingbiffar med mangosalsa (rester)' },
        dinner: { name: 'Tomatsoppa med kanel och ingefära', recipeLink: getLink('Tomatsoppa med kanel och ingefära') }
      },
      'Fredag': {
        breakfast: { name: 'Mangosmoothie med spenat', recipeLink: getLink('Mangosmoothie med spenat') },
        lunch: { name: 'Ratatouille med quinoa och raita (rester)' },
        dinner: { name: 'Kycklinggryta med garam masala', recipeLink: getLink('Kycklinggryta med garam masala') }
      },
      'Lördag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: getLink('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Kycklinggryta med garam masala (rester)' },
        dinner: { name: 'Köttfärsbiffar med champinjonhattar', recipeLink: getLink('Köttfärsbiffar med champinjonhattar') },
        dessert: { name: 'Snickerskaka', recipeLink: getLink('Snickerskaka') }
      },
      'Söndag': {
        breakfast: { name: 'Mangosmoothie med spenat (rester)' },
        lunch: { name: 'Köttfärsbiffar med champinjonhattar (rester)' },
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



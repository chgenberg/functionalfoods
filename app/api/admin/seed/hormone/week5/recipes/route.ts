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

const IMG_BASE = '/Hormonell_balans/Bilder_v5';

const RECIPES: RecipeSeed[] = [
  {
    title: 'Havregrynsgröt med banan',
    servings: 1,
    image: `${IMG_BASE}/HAVREGRYNSGRÖT_MED_BANAN.JPG`,
    categories: ['frukost'],
    ingredients: [
      '1 dl havregryn',
      '2 dl vatten',
      '1 krm salt',
      '1/2 banan',
      '1 msk pumpafrön',
      '1 dl mjölk'
    ],
    instructions: [
      'Lägg havregryn i en kastrull och tillsätt vatten och salt.',
      'Låt koka i cirka 2 minuter.',
      'Skiva bananen och blanda ner i gröten tillsammans med pumpafrön.',
      'Servera gröten i en skål med mjölk.'
    ]
  },
  {
    title: 'Äggröra med lax',
    servings: 1,
    image: `${IMG_BASE}/ÄGGRÖRA_MED_LAX.JPG`,
    categories: ['frukost'],
    ingredients: [
      '2 ägg',
      '1 msk grädde',
      'Salt och svartpeppar',
      '1 tsk smör',
      '50 g skivad rökt lax',
      '2 msk gräslök',
      '1 citronklyfta'
    ],
    instructions: [
      'Vispa ihop ägg, grädde, salt och peppar i en skål.',
      'Hetta upp en stekpanna med smör och häll i äggsmeten.',
      'Rör om i cirka 30 sekunder tills krämig och lägg upp på tallrik.',
      'Servera med rökt lax och toppa med hackad gräslök och citronklyfta.'
    ]
  },
  {
    title: 'Yoghurt med kokosgranola och bär',
    servings: 1,
    image: `${IMG_BASE}/YOGHURT_MED_KOKOSGRANOLA_OCH_BÄR.JPG`,
    categories: ['frukost'],
    ingredients: [
      '1 dl frysta bär',
      '1 dl grekisk yoghurt',
      '3/4 dl kokosgranola (egenbakat)'
    ],
    instructions: [
      'Tina bären över natten.',
      'Lägg yoghurt i en skål och toppa med kokosgranola och bär.'
    ]
  },
  {
    title: 'Ost och skinkmacka',
    servings: 1,
    image: `${IMG_BASE}/OST_OCH_SKINKMACKA.JPG`,
    categories: ['frukost'],
    ingredients: [
      '1 skiva kavring med frön (egenbakat)',
      '1 tsk smör',
      '1 skiva ost',
      '1 skiva skinka',
      '1/4 paprika'
    ],
    instructions: [
      'Skär paprika i ringar.',
      'Bred smör på brödet och lägg på ost, skinka och paprika.'
    ]
  },
  {
    title: 'Rostad fänkål och rödbeta med getost',
    servings: 2,
    image: `${IMG_BASE}/ROSTAD_FÄNKÅL_OCH_RÖDBETA_MED_GETOST.JPG`,
    categories: ['vego','lunch','middag'],
    ingredients: [
      '3 rödbetor',
      '1 tsk flytande honung',
      'Salt och svartpeppar',
      '1 krm örtagårdskrydda',
      '1 msk olivolja',
      '1 fänkål',
      '1 rödlök',
      '100 g getost',
      '1/2 dl pumpafrön',
      '1/2 tsk flytande honung',
      '1 nypa salt',
      '1 dl granatäppelkärnor',
      '2 persiljekvistar'
    ],
    instructions: [
      'Sätt ugnen på 200°C. Skala och tärna rödbetor och lägg i en skål.',
      'Tillsätt honung, salt, peppar, örtagårdskrydda och olivolja. Blanda och lägg på plåt.',
      'Skär fänkål i klyftor och dela rödlök i halvor. Lägg på plåten med rödbetorna.',
      'Ugnsbaka i 15 minuter. Höj värmen till 225°C.',
      'Skiva getost i två skivor och lägg på lökhalvorna.',
      'Blanda pumpafrön med lite honung och salt och fördela över getosten.',
      'Ugnsbaka ytterligare 2–3 minuter.',
      'Ta ut plåten och dekorera med granatäppelkärnor och persiljekvistar.'
    ]
  },
  {
    title: 'Panerad kyckling med waldorfsallad',
    servings: 2,
    image: `${IMG_BASE}/PANERAD_KYCKLING_MED_WALDORFSALLAD.JPG`,
    categories: ['kyckling','middag'],
    ingredients: [
      '300 g kycklingfiléer',
      '2 tsk röd pesto',
      '30 g fetaost',
      'Salt och svartpeppar',
      '1 krm örtagårdskrydda',
      '1 ägg',
      '3/4 dl glutenfritt ströbröd (Crumbs)',
      '100 g rättika',
      '1 morot',
      '1/4 röd lök',
      '1 stjälk selleri',
      '1 msk majonnäs',
      '3 msk gräddfil',
      '1 msk röd pesto',
      '2 msk persilja',
      '6 cocktailtomater',
      '2 persiljekvistar'
    ],
    instructions: [
      'Sätt ugnen på 200°C. Dela kycklingfiléerna till fyra tunna filéer.',
      'Krydda med salt, peppar och örtagårdskrydda. Bred på röd pesto och smulad fetaost på två filéer, lägg de andra som lock.',
      'Vispa upp ägg. Vänd de fyllda filéerna i ägg och sedan i ströbröd.',
      'Lägg i ugnsform och gratinera ca 15 minuter.',
      'Strimla rättika, morot och röd lök. Skiva selleri. Hacka persilja.',
      'Blanda grönsakerna med majonnäs, gräddfil och röd pesto. Salta och peppra.',
      'Servera kycklingen med waldorfsallad. Dekorera med cocktailtomater och persilja.'
    ]
  },
  {
    title: 'Kycklingburgare med citronkräm',
    servings: 1,
    image: `${IMG_BASE}/KYCKLINGBURGARE_MED_CITRONKRÄM.JPG`,
    categories: ['kyckling','middag'],
    ingredients: [
      '125 g kycklingfärs',
      '1 citronklyfta (zest + juice)',
      'Salt och svartpeppar',
      '1 tsk dill',
      '75 g sparris',
      '75 g sockerärtor',
      '1,5 tsk olivolja',
      '1 msk dill',
      '3 rädisor',
      '2 msk grekisk yoghurt',
      '1 citronklyfta',
      '1 msk dill',
      '1 citronklyfta (servering)',
      '1 dillkvist (dekoration)'
    ],
    instructions: [
      'Blanda kycklingfärs med citronzest, salt, peppar och hackad dill. Forma en biff.',
      'Hetta upp 1/2 tsk olivolja och stek sparris och sockerärtor i ett par minuter. Salta, peppra och strö över dill.',
      'Stek burgaren i resterande olivolja, ett par minuter per sida.',
      'Lägg burgaren på grönsaksbädden.',
      'Riv citronzest och blanda med yoghurt. Salta och peppra. Hacka dill och rör ner. Toppa burgaren med citronkrämen.',
      'Strimla rädisor och lägg över. Dekorera med citronklyfta och dillkvist.'
    ]
  },
  {
    title: 'Kesotorsk med mango chutney',
    servings: 3,
    image: `${IMG_BASE}/KESOTORSK_MED_MANGO_CHUTNEY.JPG`,
    categories: ['fisk','middag'],
    ingredients: [
      '250 g broccolibuketter',
      '250 g blomkålsbuketter',
      '1 rödlök',
      '2 tomater',
      '1 tsk olivolja',
      'Salt och svartpeppar',
      '600 g torskryggfilé',
      'Salt och svartpeppar',
      '1,5 dl keso',
      '3 msk mango chutney',
      '3 msk persilja',
      '2 persiljekvistar (dekoration)'
    ],
    instructions: [
      'Sätt ugnen på 175°C. Skär broccoli och blomkål i mindre buketter.',
      'Strimla rödlök och skär tomater i klyftor. Lägg allt i en ugnsform, ringla olivolja och salta/peppra.',
      'Salta och peppra torsken och lägg ovanpå grönsakerna.',
      'Blanda keso med mango chutney och hackad persilja. Smaka av med salt och peppar och bre över fisken.',
      'Ugnsbaka i ca 20 minuter. Dekorera med persiljekvistar vid servering.'
    ]
  },
  {
    title: 'Laxwok teriyaki',
    servings: 2,
    image: `${IMG_BASE}/LAXWOK_TERIYAKI.JPG`,
    categories: ['fisk','middag'],
    ingredients: [
      '300 g laxfilé',
      '2 morötter',
      '1/2 rödlök',
      '1/4 fänkål',
      '100 g sockerärtor',
      '10 färska brysselkål',
      '1/2 vitlöksklyfta',
      '1 cm ingefära',
      '1 tsk olivolja',
      '120 g teriyaki woksås (Blue Dragon)',
      'Salt och svartpeppar',
      '1 msk gräslök'
    ],
    instructions: [
      'Skär lax i tärningar. Skär morot i stavar, hacka lök, strimla fänkål och dela sockerärtorna. Klyfta brysselkål.',
      'Riv vitlök och ingefära. Hetta upp olja och lägg i alla ingredienser samtidigt.',
      'Tillsätt teriyakisås och woka i några minuter. Salta och peppra.',
      'Klipp gräslök och strö över vid servering.'
    ]
  },
  {
    title: 'Biff med blomkålsmos',
    servings: 2,
    image: `${IMG_BASE}/BIFF_MED_BLOMKÅLSMOS.JPG`,
    categories: ['kött','middag'],
    ingredients: [
      '400 g blomkål',
      '1/2 tsk olivolja',
      '1/2 krm spiskummin',
      'Salt och svartpeppar',
      '1/2 dl creme fraiche',
      '1/4 citron',
      '300 g nötfärs',
      '1/4 rödlök',
      '1/2 vitlöksklyfta',
      '1 msk persilja',
      '1 tsk olivolja',
      '25 g bacon',
      '1/2 bifftomat',
      '1 msk färsk rosmarin'
    ],
    instructions: [
      'Skär ut små buketter av blomkål för garnityr. Stek dem i 1/2 tsk olivolja med spiskummin, salt och peppar. Låt rinna av.',
      'Koka resterande blomkål i lättsaltat vatten ca 10 minuter. Häll av och mixa med creme fraiche, citronzest och saft. Smaka av med salt och peppar.',
      'Blanda nötfärs med finhackad rödlök, riven vitlök, hackad persilja, salt och peppar. Forma två biffar och stek i olivolja.',
      'Stek bacon tärnat till knaprigt. Skiva bifftomat.',
      'Servera biff med blomkålsmos, toppa med de små stekta buketterna och bacon. Dekorera med rosmarin.'
    ]
  },
  {
    title: 'Minihamburgare med gorgonzola',
    servings: 2,
    image: `${IMG_BASE}/MINIHAMBURGARE_MED_GORGONZOLA.JPG`,
    categories: ['kött','middag'],
    ingredients: [
      '300 g nötfärs',
      '1/2 vitlöksklyfta',
      'Salt och svartpeppar',
      '1 tsk olivolja',
      '1 squash',
      '2 msk sweet chili',
      '1/2 krm örtagårdskrydda',
      '2 msk mandelspån',
      '50 g gorgonzola',
      '1/4 rödlök',
      '10 cocktailtomater',
      '2 persiljekvistar (dekoration)'
    ],
    instructions: [
      'Sätt ugnen på 200°C. Blanda nötfärs med riven vitlök, salt och peppar och forma 8 små hamburgare.',
      'Bryn minihamburgarna i olivolja ett par minuter per sida.',
      'Skär squash i tunna längder och lägg på en plåt. Placera två minihamburgare på varje squashskiva.',
      'Ringla över sweet chilisås och strö på örtagårdskrydda. Lägg en klick gorgonzola på varje burgare och strö över mandelspån.',
      'Dela tomater och strimla rödlök och lägg på plåten. Ugnsbaka ca 10 minuter.',
      'Dekorera med persiljekvistar vid servering.'
    ]
  },
  {
    title: 'Äpple med jordnötskräm',
    servings: 1,
    image: `${IMG_BASE}/ÄPPLE_MED_JORDNÖTSKRÄM.JPG`,
    categories: ['dessert','snack'],
    ingredients: [
      '1 äpple',
      '1 msk jordnötssmör',
      '2 msk kokosgrädde',
      '1/2 tsk agavesirap',
      '1 msk jordnötter'
    ],
    instructions: [
      'Skär äpplet i skivor.',
      'Blanda jordnötssmör med kokosgrädde och agavesirap till en kräm.',
      'Lägg äppelskivorna på en tallrik och toppa med jordnötskrämen.',
      'Hacka jordnötter och strö över.'
    ]
  }
];

export async function POST(req: NextRequest) {
  const admin = await requireAdminAuth(req);
  if ((admin as any)?.status === 401) return admin as any;

  try {
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

    return NextResponse.json({ ok: true, created });
  } catch (error) {
    console.error('Seed hormone week5 recipes error:', error);
    return NextResponse.json({ error: 'Failed to seed week 5 recipes' }, { status: 500 });
  }
}



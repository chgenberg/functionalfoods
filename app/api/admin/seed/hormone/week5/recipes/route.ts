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
    image: `${IMG_BASE}/HAVREGRYNSGROT_MED_BANAN.JPG`,
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
      'Lägg havregryn i en kastrull.',
      'Tillsätt vatten och salt.',
      'Låt koka i 2 minuter.',
      'Skiva banan och blanda ner i gröten tillsammans med pumpafrön.',
      'Servera gröten i en skål med mjölk.'
    ]
  },
  {
    title: 'Äggröra med lax',
    servings: 1,
    image: `${IMG_BASE}/AGGRÖRA_MED_LAX.JPG`,
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
      'Hetta upp en stekpanna med smör och häll ner äggsmeten.',
      'Rör om med en trägaffel i cirka 30 sekunder och lägg upp äggröran på en tallrik och servera med rökt lax.',
      'Hacka gräslök.',
      'Toppa med gräslök och citronklyfta.'
    ]
  },
  {
    title: 'Yoghurt med kokosgranola och bär',
    servings: 1,
    image: `${IMG_BASE}/YOGHURT_MED_KOKOSGRANOLA_OCH_BAR.JPG`,
    categories: ['frukost'],
    ingredients: [
      '1 dl frysta bär',
      '1 dl grekisk yoghurt',
      '3/4 dl kokosgranola (egenbakat)'
    ],
    instructions: [
      'Tina bären över natten.',
      'Lägg yoghurt i en skål och lägg på kokosgranola och bär.'
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
      'Bred smör på mackan och lägg på ost, skinka och paprika.'
    ]
  },
  {
    title: 'Rostad fänkål och rödbeta med getost',
    servings: 2,
    image: `${IMG_BASE}/ROSTAD_FANKÅL_OCH_RODBETA_MED_GETOST.JPG`,
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
      'Sätt ugnen på 200 grader.',
      'Skala och skär rödbetor i tärningar.',
      'Lägg i en skål.',
      'Tillsätt honung, salt, peppar, örtagårdskrydda samt olivolja.',
      'Blanda om.',
      'Lägg på en plåt.',
      'Skär fänkål i klyftor.',
      'Skala och skär lök på mitten i två delar.',
      'Lägg fänkål och lök tillsammans med rödbetorna på plåten.',
      'Ugnsbaka i 15 minuter.',
      'Ta ut plåten.',
      'Höj värmen till 225 grader.',
      'Skiva getost i två skivor.',
      'Placera getost på lökhalvorna.',
      'Blanda ihop pumpafrön, flytande honung och salt i en skål och fördela blandningen på vardera getostskiva.',
      'Ugnsbaka ytterligare i 2-3 minuter.',
      'Tag ut plåten och dekorera med granatäppelkärnor och persiljekvistar.'
    ]
  },
  {
    title: 'Panerad kyckling med waldorfsallad',
    servings: 2,
    image: `${IMG_BASE}/PANERAD_KYCKLING_MED_WALDORFSALLAD.JPG`,
    categories: ['kyckling','middag'],
    ingredients: ['300 g kycklingfiléer','2 tsk röd pesto','30 g fetaost','Salt och svartpeppar','1 krm örtagårdskrydda','1 ägg','3/4 dl Crumbs glutenfritt ströbröd','100 g rättika','1 morot','1/4 röd lök','1 stjälk selleri','1 msk majonnäs','3 msk gräddfil','1 msk röd pesto','2 msk persilja','6 cocktailtomater','2 persiljekvistar'],
    instructions: [
      'Sätt ugnen på 200 grader.',
      'Lägg kycklingfiléerna på en skärbräda och dela dem till fyra tunna fileer.',
      'Krydda med salt, peppar och örtagårdskrydda.',
      'Bred på röd pesto samt fetaost på två av filéerna.',
      'Lägg de två andra filéerna som lock på de fyllda filéerna.',
      'Vispa upp ett ägg i en skål.',
      'Vänd filéerna i ägget och därefter i en skål med ströbröd.',
      'Lägg de panerade kycklingfiléerna i en ugnsfast form.',
      'Gratinera i ugn i 15 minuter.',
      'Skala och strimla rättika och morot fint.',
      'Skala och strimla en rödlök.',
      'Skär selleri tunt.',
      'Hacka persilja.',
      'Blanda alltsammans i en skål.',
      'Tillsätt majonnäs, gräddfil och röd pesto.',
      'Salta och peppra.',
      'Lägg upp kycklingen på en tallrik tillsammans med waldorfsallad.',
      'Dekorera med cocktailtomater och en persiljekvist.'
    ]
  },
  {
    title: 'Kycklingburgare med citronkräm',
    servings: 1,
    image: `${IMG_BASE}/KYCKLINGBURGARE_MED_CITRONKRAM.JPG`,
    categories: ['kyckling','middag'],
    ingredients: ['125 g kycklingfärs','1 citronklyfta','Salt och svartpeppar','1 tsk dill','75 g sparris','75 g sockerärtor','1,5 tsk olivolja','1 msk dill','3 st rädisor','2 msk grekisk yoghurt','1 citronklyfta','1 msk dill','1 citronklyfta','1 dillkvist'],
    instructions: [
      'Lägg kycklingfärs i en skål.',
      'Riv citronzest och tillsätt.',
      'Krydda med salt och svartpeppar.',
      'Hacka dill och blanda ner.',
      'Forma till en biff.',
      'Hetta upp en stekpanna med en halv tesked olivolja.',
      'Stek sparris och sockerärtor i ett par minuter.',
      'Salta och peppra.',
      'Lägg upp på ett fat och strö över dill.',
      'Hetta upp en stekpanna med resterande olivoljan och bryn kycklingburgaren ett par minuter på varje sida.',
      'Lägg burgaren på bädden av sparris och sockerärtor.',
      'Gör såsen genom att riva citronzest och blanda med yoghurt.',
      'Salta och peppra.',
      'Hacka dill och blanda ner i såsen.',
      'Lägg citronkräm på kycklingburgaren.',
      'Strimla rädisor och lägg över.',
      'Dekorera med en citronklyfta och en dillkvist.'
    ]
  },
  {
    title: 'Kesotorsk med mango chutney',
    servings: 3,
    image: `${IMG_BASE}/KESOTORSK_MED_MANGO_CHUTNEY.JPG`,
    categories: ['fisk','middag'],
    ingredients: ['250 g broccolibuketter','250 g blomkålsbuketter','1 rödlök','2 tomater','1 tsk olivolja','Salt och svartpeppar','600 g torskryggfilé','1,5 dl keso','3 msk mango chutney','3 msk persilja','2 persiljekvistar'],
    instructions: [
      'Sätt ugnen på 175 grader.',
      'Skär broccoli och blomkål i mindre buketter.',
      'Skala och skär rödlök i strimlor.',
      'Skär tomat i klyftor.',
      'Lägg i en ugnsfast form.',
      'Tillsätt olivolja salt och peppar.',
      'Salta och peppra torskryggfilé.',
      'Placera torsken överst i ugnsformen med grönsakerna.',
      'Blanda keso i en skål tillsammans med mango chutney.',
      'Hacka persilja och blanda ner tillsammans med salt och peppar.',
      'Lägg över fisken.',
      'Ugnsbaka i 20 minuter.',
      'Lägg upp på en tallrik och dekorera med persiljekvistar.'
    ]
  },
  {
    title: 'Laxwok teriyaki',
    servings: 2,
    image: `${IMG_BASE}/LAXWOK_TERIYAKI.JPG`,
    categories: ['fisk','middag'],
    ingredients: ['300 g laxfilé','2 morötter','1/2 rödlök','1/4 fänkål','100 g sockerärtor','10 färsk brysselkål','1/2 vitlöksklyfta','1 cm ingefära','1 tsk olivolja','120 g Blue dragon teriyaki woksås','Salt och svartpeppar','1 msk gräslök'],
    instructions: [
      'Skär lax i tärningar.',
      'Skala och skär morot i stavar.',
      'Skala och hacka lök.',
      'Skär fänkål i strimlor.',
      'Dela sockerärtorna.',
      'Skär brysselkål i klyftor.',
      'Skala och riv vitlök och ingefära.',
      'Hetta upp en stekpanna med olivolja och lägg i alla ingredienser på samma gång.',
      'Tillsätt teriyaki wok sås och woka några minuter.',
      'Salta och peppra.',
      'Klipp gräslök och strö över laxwoken.'
    ]
  },
  {
    title: 'Biff med blomkålsmos',
    servings: 2,
    image: `${IMG_BASE}/BIFF_MED_BLOMKALSMOS.JPG`,
    categories: ['kött','middag'],
    ingredients: ['400 g blomkål','1/2 tsk olivolja','1/2 krm spiskummin','Salt och svartpeppar','1/2 dl creme fraiche','1/4 citron','300 g nötfärs','1/4 rödlök','1/2 vitlöksklyfta','1 msk persilja','1 tsk olivolja','25 g bacon','1/2 bifftomat','1 msk färsk rosmarin'],
    instructions: [
      'Skär ut några små mini blomkålsbuketter till dekoration.',
      'Stek minibuketterna i en halv tesked olivolja ett par minuter.',
      'Tillsätt spiskummin, salt och svartpeppar.',
      'Låt rinna av på hushållspapper.',
      'Skär resten av blomkålen grovt.',
      'Lägg i kastrull och koka i lättsaltat vatten i 10 minuter.',
      'Häll av vattnet och mixa blomkålen med crème fraiche, riv ner citronzest och pressa ned citronjuice.',
      'Salta och peppra.',
      'Lägg tillbaka i kastrullen och håll varmt.',
      'Lägg nötfärs i en bunke. Skala och finhacka rödlök och riv vitlök.',
      'Hacka persilja och blanda ner lök, vitlök, persilja, salt och svartpeppar i färsen.',
      'Forma till två biffar.',
      'Hetta upp en stekpanna med olivolja.',
      'Stek biffarna ett par minuter på varje sida.',
      'Skär bacon i små tärningar.',
      'Hetta upp en stekpanna.',
      'Stek bacon knaprigt ett par minuter.',
      'Skär tomat i skivor och lägg upp på tallrikar.',
      'Lägg upp blomkålsmoset och biffen.',
      'Toppa med de små stekta blomkålsbuketterna och bacon.',
      'Dekorera med rosmarin.'
    ]
  },
  {
    title: 'Minihamburgare med gorgonzola',
    servings: 2,
    image: `${IMG_BASE}/MINIHAMBURGARE_MED_GORGONZOLA.JPG`,
    categories: ['kött','middag'],
    ingredients: ['300 g nötfärs','1/2 vitlöksklyfta','Salt och svartpeppar','1 tsk olivolja','1 squash','2 msk sweet chili','0,5 krm örtagårdskrydda','2 msk mandelspån','50 g gorgonzola','1/4 rödlök','10 cocktailtomater','2 persiljekvistar'],
    instructions: [
      'Sätt ugnen på 200 grader.',
      'Lägg nötfärs i en skål.',
      'Skala och riv vitlök och blanda ner i färsen tillsammans med salt och peppar.',
      'Forma till 8 små hamburgare.',
      'Hetta upp en stekpanna med olivolja.',
      'Bryn minihamburgarna ett par minuter på varje sida.',
      'Skär squash på längden i tunna skivor.',
      'Lägg squashskivorna på en plåt.',
      'Lägg två minihamburgare på varje skiva squash.',
      'Häll på sweet chilisås och strö på örtagårdskrydda.',
      'Lägg en klick gorgonzola på varje burgare.',
      'Strö över mandelspån.',
      'Dela tomaterna.',
      'Skala och strimla rödlök.',
      'Lägg tomat och lök på plåten.',
      'Ugnsbaka i 10 minuter.',
      'Dekorera med persiljekvistar.'
    ]
  },
  {
    title: 'Äpple med jordnötskräm',
    servings: 1,
    image: `${IMG_BASE}/APPLE_MED_JORDNOTSKRAM.JPG`,
    categories: ['dessert','snack'],
    ingredients: ['1 äpple','1 msk jordnötssmör','2 msk kokosgrädde','1/2 tsk agavesirap','1 msk jordnötter'],
    instructions: [
      'Skär äpplet i skivor.',
      'Blanda jordnötssmör med kokosgrädde i en skål.',
      'Tillsätt agavesirap.',
      'Lägg äppelskivorna på en tallrik.',
      'Placera jordnötskrämen ovanpå.',
      'Hacka jordnötterna och strö över.'
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



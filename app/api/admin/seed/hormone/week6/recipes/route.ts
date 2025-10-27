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

const IMG_BASE = '/Hormonell_balans/Bilder_v6';

const RECIPES: RecipeSeed[] = [
  {
    title: 'Yoghurt med blåbär och kokosgranola',
    servings: 1,
    image: `${IMG_BASE}/YOGHURT_MED_BLÅBÄR_OCH_KOKOSGRANOLA.JPG`,
    categories: ['frukost'],
    ingredients: ['1 dl grekisk yoghurt', '1 dl blåbär', '3/4 dl kokosgranola'],
    instructions: [
      'Lägg yoghurt och blåbär i en skål och lägg på kokosgranola.'
    ]
  },
  {
    title: 'Keso med persika och jordgubbar',
    servings: 1,
    image: `${IMG_BASE}/KESO_MED_PERSIKA_OCH_JORDGUBBAR.JPG`,
    categories: ['frukost'],
    ingredients: ['1 dl keso', '1/2 persika', '2 jordgubbar'],
    instructions: [
      'Häll upp yoghurt i en skål.',
      'Skiva hälften av persikan och tärna den andra halvan.',
      'Skiva jordgubbar.',
      'Toppa yoghurten med persika och jordgubbar.'
    ]
  },
  {
    title: 'Äggröra med bär',
    servings: 1,
    image: `${IMG_BASE}/ÄGGRÖRA_MED_BÄR.JPG`,
    categories: ['frukost'],
    ingredients: ['2 ägg', '1 msk grädde', 'Salt och svartpeppar', '1 tsk smör', '2 msk blåbär', '2 jordgubbar'],
    instructions: [
      'Dela jordgubbar i mitten.',
      'Vispa ihop ägg, grädde, salt och svartpeppar.',
      'Hetta upp en stekpanna med smör och häll ner äggröran.',
      'Rör om i cirka 30 sekunder och lägg upp på ett fat.',
      'Servera med färska bär.'
    ]
  },
  {
    title: 'Blåbärssmoothie',
    servings: 2,
    image: `${IMG_BASE}/BLÅBÄRSSMOOTHIE.JPG`,
    categories: ['frukost'],
    ingredients: ['1/2 banan', '200 g fryst mango', '2 dl frysta blåbär', '2 dl mandelmjölk'],
    instructions: [
      'Lägg alla ingredienser i en blender och mixa till en jämn smoothie.',
      'Späd med vatten om det behövs.',
      'Häll upp på glas.'
    ]
  },
  {
    title: 'Tofugryta med jordnötter och blomkålsris',
    servings: 2,
    image: `${IMG_BASE}/TOFUGRYTA_MED_JORDNÖTTER_OCH_BLOMKÅLSRIS.JPG`,
    categories: ['vego','middag'],
    ingredients: ['250 g tofu','1 vitlöksklyfta','1 dl jordnötter','1 tsk olivolja','1.5 tsk currypasta','200 ml kokosmjölk','1 msk koriander','1 limeklyfta','Salt och svartpeppar','250 g blomkål','1 limeklyfta','1 morot','2 msk jordnötter','0,5 msk koriander','1/4 salladslök','2 limeklyftor'],
    instructions: [
      'Skär tofu i tärningar.',
      'Skala och riv vitlök.',
      'Hacka jordnötter grovt.',
      'Hetta upp en stekpanna med olivolja.',
      'Stek tofu tillsammans med vitlök och jordnötter.',
      'Tillsätt currypasta och kokosmjölk och låt koka i några minuter.',
      'Hacka koriander och tillsätt i grytan.',
      'Pressa ned limejuice.',
      'Salta och peppra.',
      'Riv blomkål grovt på ett rivjärn.',
      'Lägg i en skål.',
      'Pressa i limejuice.',
      'Salta och peppra.',
      'Skala och strimla morot.',
      'Lägg upp blomkålsriset på tallrikar.',
      'Häll tofugrytan bredvid och toppa med jordnötter.',
      'Lägg på koriander och limeklyftor.',
      'Skär salladslök i strimlor och placera på toppen.'
    ]
  },
  {
    title: 'Tacosoppa',
    servings: 2,
    image: `${IMG_BASE}/TACOSOPPA.JPG`,
    categories: ['vego','middag'],
    ingredients: [
      '100 g blomkål',
      '1,5 paprika',
      '1 vitlöksklyfta',
      '1 cm ingefära',
      '1/2 gul lök',
      '1 krm färsk chili',
      '1 dl torkade röda linser',
      '1 påse tacokrydda',
      '7 dl vatten',
      '2 msk gräddfil',
      '2 persiljekvistar'
    ],
    instructions: [
      'Skär blomkål i mindre bitar.',
      'Skär paprikorna i tärningar.',
      'Skala och riv vitlök och ingefära.',
      'Skala och hacka lök.',
      'Skär chili i tunna skivor.',
      'Lägg alla ingredienser i en kastrull.',
      'Tillsätt linser och tacokrydda.',
      'Häll på vatten och låt koka i 10 minuter.',
      'Servera i djupa skålar med en klick gräddfil.',
      'Dekorera med persilja.'
    ]
  },
  {
    title: 'Rödbetsquinoa med chevrelax',
    servings: 2,
    image: `${IMG_BASE}/RÖDBETSQUINOA_MED_CHEVRELAX.JPG`,
    categories: ['fisk','middag'],
    ingredients: [
      '300 g laxfilé',
      'Salt och svartpeppar',
      '1 krm örtagårdskrydda',
      '50 g chévreost',
      '1 tsk flytande honung',
      '5 valnötter',
      '1 dl vit quinoa',
      '1/2 citron',
      '1 tsk olivolja',
      '2 msk rödlök',
      '2 msk färsk rosmarin',
      '2 kokta rödbetor',
      '20 g rucolasallad',
      '2 fikon'
    ],
    instructions: [
      'Sätt ugnen på 200 grader.',
      'Lägg laxfiléer på en ugnsplåt och skär ett snitt i varje filé.',
      'Strö på salt, peppar och örtagårdskrydda.',
      'Skiva getosten och lägg ner i snittet.',
      'Ringla honung över och lägg på valnötter.',
      'Sätt in i ugnen i 20 minuter.',
      'Finhacka rödlök och rosmarin.',
      'Koka quinoan i lättsaltat vatten i 13 minuter.',
      'Skölj och lägg i en skål.',
      'Pressa ner citronjuice och blanda i olivolja, rosmarin, rödlök, salt och peppar.',
      'Skär rödbetor i tärningar och blanda ner i quinoasalladen.',
      'Skär fikon i klyftor.',
      'Servera laxen med quinoasallad, rucolasallad och fikon.'
    ]
  },
  {
    title: 'Tonfisksallad med tomat',
    servings: 1,
    image: `${IMG_BASE}/TONFISKSALLAD_MED_TOMAT.JPG`,
    categories: ['fisk','lunch'],
    ingredients: ['1 bifftomat','125 g tonfisk i vatten','1,5 soltorkade tomater','1/2 selleristjälk','2 msk rödlök','1/2 tsk olivolja','1,5 msk kapris','1 msk persilja','Salt och svartpeppar','1 persiljekvist','1 citronklyfta'],
    instructions: [
      'Skär tomater i tunna skivor.',
      'Lägg på ett fat.',
      'Lägg tonfisk i en skål.',
      'Skär soltorkad tomat och selleri i små bitar.',
      'Skala och finhacka löken.',
      'Hacka persilja.',
      'Blanda ner allt med tonfisken och tillsätt olivolja, kapris och persilja.',
      'Salta och peppra.',
      'Lägg tonfiskröran på de skivade tomaterna.',
      'Dekorera med en citronklyfta och en persiljekvist.'
    ]
  },
  {
    title: 'Skinkpaj med broccoli och cheddar',
    servings: 6,
    image: `${IMG_BASE}/SKINKPAJ_MED_BROCCOLI_OCH_CHEDDAR.JPG`,
    categories: ['middag'],
    ingredients: [
      '3 dl mandelmjöl',
      '1/2 dl skalade sesamfrön',
      '1 msk fiberhusk',
      '1 tsk salt',
      '25 g smör',
      '1 ägg',
      '1/2 broccoli',
      '200 g rökt skinka',
      '1/2 paprika',
      '10 cm purjolök',
      '3 ägg',
      '2 dl havregrädde',
      '1 dl mjölk',
      'Salt och svartpeppar',
      '1/2 tsk örtagårdskrydda',
      '50 g cheddarost',
      '2 dl riven ost',
      '100 g rucola'
    ],
    instructions: [
      'Sätt ugnen på 150 grader.',
      'Blanda ner mandelmjöl, sesamfrön, fiberhusk och salt i en matberedare.',
      'Mixa och tillsätt smör och ägg.',
      'Blanda ihop till en smidig deg.',
      'Plasta in och låt vila i kylen i 30 minuter.',
      'Kavla ut degen på ett mjölat bakbord.',
      'Lägg bakplåtspapper i en pajform, 22 cm i diameter, med avtagbar kant.',
      'Lägg ner pajdegen och fäst vid kanterna.',
      'Pricka med en gaffel och förgrädda i 10 minuter.',
      'Ta ut pajskalet och höj temperaturen till 200 grader.',
      'Skär broccoli i buketter.',
      'Strimla skinka, paprika och purjolök.',
      'Lägg hälften av fyllningen i pajskalet.',
      'Lägg på cheddarost.',
      'Fyll på med resten av fyllningen.',
      'Blanda ägg, grädde, mjölk, salt, peppar och örtagårdskrydda i en skål.',
      'Häll äggstanningen i pajskalet.',
      'Strö på riven ost och ugnsbaka ytterligare i 30 minuter.',
      'Låt svalna något och servera med rucolasallad.'
    ]
  },
  {
    title: 'Korvstroganoff med svartkål',
    servings: 2,
    image: `${IMG_BASE}/KORVSTROGANOFF_MED_SVARTKÅL.JPG`,
    categories: ['middag'],
    ingredients: [
      '300 g falukorv med hög kötthalt',
      '1/2 msk smör',
      '1/2 gul lök',
      '1/4 vitlöksklyfta',
      '100 g svartkål',
      '1/2 msk smör',
      '1 msk chilisås',
      '1 msk sötstark senap',
      '1,5 dl havregrädde',
      'Salt och svartpeppar',
      '1/2 msk basilika'
    ],
    instructions: [
      'Skär falukorv i stavar.',
      'Skala och hacka gul lök fint.',
      'Skala och riv vitlök.',
      'Skär svartkålen grovt.',
      'Hetta upp en stekpanna med smör och stek korv, lök och vitlök i några minuter.',
      'Tillsätt chilisås, senap och grädde.',
      'Salta och peppra.',
      'Låt koka ihop.',
      'Blanda ner svartkålen och låt allt bli varmt.',
      'Lägg upp på tallrikar och dekorera med basilika.'
    ]
  },
  {
    title: 'Persisk köttgryta med råris',
    servings: 2,
    image: `${IMG_BASE}/PERSISK_KÖTTGRYTA_MED_RÅRIS.JPG`,
    categories: ['kött','middag'],
    ingredients: [
      '1/2 gul lök',
      '1 vitlöksklyfta',
      '1/2 röd chili',
      '300 g högrev',
      '1/2 msk olivolja',
      '1 msk ingefära',
      'Salt och svartpeppar',
      '1/2 tsk malen kardemumma',
      '1 tsk curry',
      '1/2 krm malen kryddpeppar',
      '1/2 krm malen nejlika',
      '1 krm paprikapulver',
      '200 g krossade tomater',
      '2 dl vatten',
      '1 msk ketjap manis',
      '3 torkade dadlar',
      '1 kanelstång',
      '2 msk pistagenötter',
      '1/2 dl granatäppelkärnor',
      '3 msk grekisk yoghurt',
      '4 fefferoni',
      '4 dl kokt råris'
    ],
    instructions: [
      'Skala och skiva löken, finhacka vitlök och chili.',
      'Finriv ingefäran.',
      'Skär köttet i grytbitar.',
      'Hetta upp en stekpanna med olivolja och stek kött, lök, vitlök, chili och ingefära.',
      'Krydda med salt, peppar, malen kardemumma, curry, kryddpeppar, nejlika och paprikapulver.',
      'Lägg över allt i en stor järngryta.',
      'Tillsätt tomater, vatten, ketjap manis, hela dadlar och kanelstång.',
      'Koka grytan i 1,5 timme.',
      'Servera grytan med pistagenötter, granatäppelkärnor, yoghurt, fefferoni och kokt råris.'
    ]
  },
  {
    title: 'Kladdkaka med grädde och hallon',
    servings: 10,
    image: `${IMG_BASE}/KLADDKAKA_MED_GRÄDDE_OCH_HALLON.JPG`,
    categories: ['dessert'],
    ingredients: ['150 g smör','200 g mörk choklad','4 ägg','1 dl sötströ','0,5 krm vaniljpulver','1,5 dl mandelmjöl','1 tsk bakpulver','0,5 dl grädde','10 hallon'],
    instructions: [
      'Sätt ugnen på 175 grader.',
      'Smält smör och choklad i en kastrull.',
      'Vispa ägg och sötströ fluffigt.',
      'Rör ner choklad- och smörblandningen och tillsätt vaniljpulver, mandelmjöl och bakpulver.',
      'Vispa ihop och häll smeten i en bakplåtsklädd pajform med avtagbar kant.',
      'Grädda i 8 minuter i ugnen.',
      'Låt svalna.',
      'Vispa grädde och dekorera varje bit med en klick grädde och ett hallon.'
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
    console.error('Seed hormone week6 recipes error:', error);
    return NextResponse.json({ error: 'Failed to seed week 6 recipes' }, { status: 500 });
  }
}



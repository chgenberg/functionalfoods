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
      'Lägg yoghurt i en skål.',
      'Toppa med blåbär och kokosgranola.'
    ]
  },
  {
    title: 'Keso med persika och jordgubbar',
    servings: 1,
    image: `${IMG_BASE}/KESO_MED_PERSIKA_OCH_JORDGUBBAR.JPG`,
    categories: ['frukost'],
    ingredients: ['1 dl keso', '1/2 persika', '2 jordgubbar'],
    instructions: [
      'Lägg keso i en skål.',
      'Skiva halva persikan och tärna den andra halvan.',
      'Skiva jordgubbar och toppa keson med persika och jordgubbar.'
    ]
  },
  {
    title: 'Äggröra med bär',
    servings: 1,
    image: `${IMG_BASE}/ÄGGRÖRA_MED_BÄR.JPG`,
    categories: ['frukost'],
    ingredients: ['2 ägg', '1 msk grädde', 'Salt och svartpeppar', '1 tsk smör', '2 msk blåbär', '2 jordgubbar'],
    instructions: [
      'Dela jordgubbarna.',
      'Vispa ihop ägg, grädde, salt och peppar.',
      'Hetta upp en stekpanna med smör och häll i äggsmeten.',
      'Rör i ca 30 sekunder tills krämig. Servera med färska bär.'
    ]
  },
  {
    title: 'Blåbärssmoothie',
    servings: 2,
    image: `${IMG_BASE}/BLÅBÄRSSMOOTHIE.JPG`,
    categories: ['frukost'],
    ingredients: ['1/2 banan', '200 g fryst mango', '2 dl frysta blåbär', '2 dl mandelmjölk'],
    instructions: [
      'Lägg alla ingredienser i en blender.',
      'Mixa slätt. Späd med vatten vid behov och häll upp i glas.'
    ]
  },
  {
    title: 'Tofugryta med jordnötter och blomkålsris',
    servings: 2,
    image: `${IMG_BASE}/TOFUGRYTA_MED_JORDNÖTTER_OCH_BLOMKÅLSRIS.JPG`,
    categories: ['vego','middag'],
    ingredients: [
      '250 g tofu',
      '1 vitlöksklyfta',
      '1 dl jordnötter',
      '1 tsk olivolja',
      '1,5 tsk currypasta',
      '200 ml kokosmjölk',
      '1 msk koriander',
      '1 limeklyfta',
      'Salt och svartpeppar',
      '250 g blomkål',
      '1 limeklyfta',
      'Salt och svartpeppar',
      '1 morot',
      '2 msk jordnötter (topping)',
      '1/2 msk koriander (topping)',
      '1/4 salladslök',
      '2 limeklyftor (servering)'
    ],
    instructions: [
      'Skär tofu i tärningar. Riv vitlök. Hacka jordnötter grovt.',
      'Hetta upp olivolja och stek tofu med vitlök och jordnötter.',
      'Tillsätt currypasta och kokosmjölk. Låt sjuda några minuter.',
      'Hacka koriander och vänd ner. Pressa limejuice. Smaka av med salt och peppar.',
      'Riv blomkål grovt till blomkålsris. Pressa lime, salta och peppra.',
      'Strimla morot. Servera blomkålsris med tofugrytan, toppa med jordnötter, koriander och salladslök. Servera med limeklyftor.'
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
      'Skär blomkål i mindre bitar och paprika i tärningar. Riv vitlök och ingefära, och hacka lök och chili.',
      'Lägg allt i en kastrull med linser och tacokrydda. Häll på vatten och koka ca 10 minuter.',
      'Servera i skålar med en klick gräddfil och persilja.'
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
      'Sätt ugnen på 200°C. Lägg laxen på plåt, skär ett snitt i varje filé och krydda med salt, peppar och örtagårdskrydda.',
      'Lägg skivor av chèvre i snittet, ringla honung och lägg på valnötter. Baka i ca 20 minuter.',
      'Koka quinoan 13 minuter i lättsaltat vatten. Skölj och lägg i skål.',
      'Pressa citron och blanda med olivolja, rosmarin och finhackad rödlök. Smaka av med salt och peppar.',
      'Tärna rödbetor och vänd ner i quinoan. Servera lax med quinoasallad, rucola och fikon.'
    ]
  },
  {
    title: 'Tonfisksallad med tomat',
    servings: 1,
    image: `${IMG_BASE}/TONFISKSALLAD_MED_TOMAT.JPG`,
    categories: ['fisk','lunch'],
    ingredients: [
      '1 bifftomat',
      '125 g tonfisk i vatten',
      '1,5 soltorkade tomater',
      '1/2 selleristjälk',
      '2 msk rödlök',
      '1/2 tsk olivolja',
      '1,5 msk kapris',
      '1 msk persilja',
      'Salt och svartpeppar',
      '1 persiljekvist (dekoration)',
      '1 citronklyfta (servering)'
    ],
    instructions: [
      'Skiva bifftomat tunt och lägg på ett fat.',
      'Blanda tonfisk med finhackade soltorkade tomater, selleri och rödlök.',
      'Tillsätt olivolja, kapris och hackad persilja. Smaka av med salt och peppar.',
      'Lägg röran på de skivade tomaterna och dekorera med citronklyfta och persilja.'
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
      'Sätt ugnen på 150°C. Mixa mandelmjöl, sesamfrön, fiberhusk och salt. Tillsätt smör och ägg och blanda till en deg.',
      'Låt vila i kylen 30 minuter. Kavla ut och klä en pajform (22 cm) med bakplåtspapper. Förgrädda 10 minuter.',
      'Höj ugnen till 200°C. Skär broccoli i buketter. Strimla skinka, paprika och purjolök.',
      'Lägg hälften av fyllningen i pajskalet, lägg på cheddar, fyll på med resten.',
      'Vispa ihop ägg, havregrädde, mjölk, salt, peppar och örtagårdskrydda. Häll i pajskalet.',
      'Strö över riven ost och grädda ca 30 minuter. Servera med rucola.'
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
      'Skär korven i stavar. Finhacka lök och riv vitlök. Skär svartkål grovt.',
      'Stek korv, lök och vitlök i smör några minuter.',
      'Tillsätt chilisås, senap och grädde. Salta och peppra och låt koka ihop.',
      'Vänd ner svartkålen och låt bli varmt. Toppa med basilika.'
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
      'Skiva lök, finhacka vitlök och chili. Riv ingefära. Skär köttet i grytbitar.',
      'Bryn kött, lök, vitlök, chili och ingefära i olivolja. Krydda med salt, peppar och kryddorna.',
      'Lägg över i gryta. Tillsätt tomater, vatten, ketjap manis, dadlar och kanelstång. Sjud ca 1,5 timme.',
      'Servera med pistagenötter, granatäppelkärnor, yoghurt, fefferoni och kokt råris.'
    ]
  },
  {
    title: 'Kladdkaka med grädde och hallon',
    servings: 10,
    image: `${IMG_BASE}/KLADDKAKA_MED_GRÄDDE_OCH_HALLON.JPG`,
    categories: ['dessert'],
    ingredients: [
      '150 g smör',
      '200 g mörk choklad',
      '4 ägg',
      '1 dl sötströ',
      '1/2 krm vaniljpulver',
      '1,5 dl mandelmjöl',
      '1 tsk bakpulver',
      '1/2 dl grädde',
      '10 hallon'
    ],
    instructions: [
      'Sätt ugnen på 175°C. Smält smör och choklad försiktigt.',
      'Vispa ägg och sötströ fluffigt. Vänd ner chokladsmöret, vaniljpulver, mandelmjöl och bakpulver.',
      'Häll i form med avtagbar kant klädd med bakplåtspapper. Grädda ca 8 minuter.',
      'Låt svalna. Vispa grädde och dekorera varje bit med en klick grädde och ett hallon.'
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



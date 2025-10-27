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

const IMG_BASE = '/Hormonell_balans/Bilder_v3';

const RECIPES: RecipeSeed[] = [
  {
    title: 'Bananpannkaka med frukt och bär',
    servings: 1,
    image: `${IMG_BASE}/BANANPANNKAKA_MED_FRUKT_OCH_BÄR.JPG`,
    categories: ['frukost'],
    ingredients: ['1/2 banan','1 ägg','1/2 krm vaniljpulver','1 tsk smör','2 msk grekisk yoghurt','1/2 dl blåbär','1 msk granatäppelkärnor','1/2 banan'],
    instructions: [
      'Mosa banan i en skål.',
      'Knäck ner ägg och tillsätt vaniljpulver.',
      'Vispa till en slät smet.',
      'Hetta upp en stekpanna med smör.',
      'Stek pannkakan i 2-3 minuter på varje sida.',
      'Skiva banan. Lägg upp på en tallrik och dekorera med yoghurt, blåbär, granatäppelkärnor och banan.'
    ]
  },
  {
    title: 'Omelett med skinka',
    servings: 1,
    image: `${IMG_BASE}/OMELETT_MED_SKINKA.JPG`,
    categories: ['frukost'],
    ingredients: ['2 ägg','Salt och svartpeppar','1 tsk smör','25 g rökt skinka','1 msk gräslök'],
    instructions: [
      'Vispa ihop äggen i en skål.',
      'Krydda med salt och peppar.',
      'Hetta upp en stekpanna med smör och stek omeletten i någon minut på medelstark värme.',
      'Hacka gräslök.',
      'Lägg på en skiva skinka på omeletten och toppa med gräslök.'
    ]
  },
  {
    title: 'Ost och skinkmacka med gurka',
    servings: 1,
    image: `${IMG_BASE}/OST_OCH_SKINKMACKA_MED_GURKA.JPG`,
    categories: ['frukost'],
    ingredients: ['1 skiva kavring med frön (egenbakat)','1 tsk smör','1 salladsblad','1 skiva ost','1 skiva skinka','3 skivor gurka'],
    instructions: [
      'Bred smör på mackan och lägg på sallad, ost, skinka och gurka.'
    ]
  },
  {
    title: 'Falafel med grönsaker',
    servings: 2,
    image: `${IMG_BASE}/FALAFEL_MED_GRÖNSAKER.JPG`,
    categories: ['vego','lunch','middag'],
    ingredients: ['115 g konserverade kikärtor','1/2 gul lök','1/2 vitlöksklyfta','1/2 tsk malen spiskummin','1 krm salt','2 msk persilja','1 krm sambal oelek','1 msk majsstärkelse','1 tsk olivolja','2 morötter','1/2 paprika','1/2 rödlök','10 cm gurka','10 cocktailtomater','50 g spenat','1/2 dl grekisk yoghurt','1/2 msk sweet chili sås','1/2 vitlögsklyfta'],
    instructions: [
      'Gör dressingen genom att riva vitlök och blanda ihop alla ingredienser i en skål.',
      'Skölj kikärtorna och låt rinna av i ett durkslag.',
      'Skala och hacka lök.',
      'Skala och riv vitlök.',
      'Mixa kikärtor, lök och vitlök i en mixer eller med en stavmixer.',
      'Tillsätt spiskummin, salt, persilja, sambal oelek och majsstärkelse.',
      'Forma smeten till bullar.',
      'Hetta upp en stekpanna med olja och stek i cirka 5 minuter.',
      'Skala och skär morötter i strimlor.',
      'Skär paprika i strimlor.',
      'Skala och skär lök i strimlor.',
      'Skär gurkan i bitar.',
      'Dela cocktailtomaterna.',
      'Lägg spenat i botten på tallrikar.',
      'Fördela grönsakerna ovanpå spenaten.',
      'Toppa med falafel och dressing.',
      'Dekorera med en persiljekvist.'
    ]
  },
  {
    title: 'Kyckling med grön curry',
    servings: 2,
    image: `${IMG_BASE}/KYCKLING_MED_GRÖN_CURRY.JPG`,
    categories: ['kyckling','middag'],
    ingredients: ['300 g kycklinglårfilé','1/2 vitlöksklyfta','1/2 msk ingefära','1 tsk ketjap manis','Salt och svartpeppar','1/2 vitlögsklyfta','1/2 msk ingefära','1 morot','1 salladslök','200 ml kokosmjölk','20 g green curry kryddmix','1 tsk smör','100 g sockerärtor','1/2 dl cashewnötter','1/2 dl salladslök','1 msk färsk koriander'],
    instructions: [
      'Skär kycklinglårfilé i mindre bitar.',
      'Lägg i en skål.',
      'Skala och riv vitlök och ingefära och blanda ner i skålen tillsammans med ketjap manis, salt och peppar.',
      'Låt kycklingen marinera i 15 minuter.',
      'Skala och riv vitlök och ingefära.',
      'Skala och skär morot i skivor.',
      'Häll kokosmjölk i en kastrull.',
      'Tillsätt green curry, vitlök och ingefära och låt koka upp.',
      'Hetta upp en stekpanna med smör.',
      'Stek kycklinglårfilé hastigt.',
      'Lägg över kycklingen i kastrullen med kokosmjölk.',
      'Låt koka i 5 minuter.',
      'Tillsätt morötter efter några minuter.',
      'Strimla sockerärtor och salladslök och lägg ner i grytan.',
      'Koka ytterligare i en minut.',
      'Hacka koriander och strimla salladslök.',
      'Lägg upp på en tallrik och dekorera med färsk koriander, salladslök och cashewnötter.'
    ]
  },
  {
    title: 'Scampi med mangosallad',
    servings: 2,
    image: `${IMG_BASE}/SCAMPI_MED_MANGOSALLAD.JPG`,
    categories: ['fisk','middag'],
    ingredients: ['250 g fryst scampi','1/2 mango','1/4 paprika','1/2 salladslök','2 msk mango chutney','1/2 dl grekisk yoghurt','Salt och svartpeppar','2 msk koriander','2 hjärtsalladshuvuden','1 tsk olivolja','1/2 vitlögsklyfta','1/2 röd chili','2 msk salladslök','2 msk röd paprika','1/2 mango','2 limeklyftor'],
    instructions: [
      'Tina scampi.',
      'Skala och skär mango i tärningar.',
      'Finhacka paprika och strimla salladslök.',
      'Hacka koriander.',
      'Lägg i en skål och blanda ner mango chutney och grekisk yoghurt.',
      'Salta och peppra.',
      'Lägg upp hjärtsalladsblad på ett fat.',
      'Fördela mangoröran över.',
      'Skala och riv vitlök och skär chili i tunna skivor.',
      'Hetta upp en stekpanna med olja och fräs scampi, vitlök och chili några minuter.',
      'Strimla salladslök.',
      'Finhacka paprika och skär mango i skivor.',
      'Fördela scampi på salladen och strö på salladslök och paprika.',
      'Dekorera med skivad mango och limeklyftor.'
    ]
  },
  {
    title: 'Torskgratäng med champinjoner',
    servings: 4,
    image: `${IMG_BASE}/TORSKGRATÄNG_MED_CHAMPINJONER.JPG`,
    categories: ['fisk','middag'],
    ingredients: ['300 g champinjoner','250 g cocktailtomater','2 tomater','10 cm squash','3/4 rödlök','1 vitlöksklyfta','1 msk olivolja','Salt och svartpeppar','1 tsk örtagårdskrydda','700 g torskrygg','2 msk sweet chilisås','1/2 dl jalapeños','1 dl riven ost','4 persiljekvistar'],
    instructions: [
      'Sätt ugnen på 175 grader.',
      'Lägg hela champinjoner och cocktailtomater i en ugnsfast form.',
      'Skär tomater i klyftor och skiva squash.',
      'Skala och skiva lök och riv vitlök.',
      'Blanda ner i formen tillsammans med olivolja, salt, peppar och örtagårdskrydda.',
      'Strö på salt, peppar och örtagårdskrydda på torsken.',
      'Lägg torsken på grönsakerna och häll över sweet chilisås.',
      'Strö på riven ost och toppa med skivade jalapeños.',
      'Ugnsbaka i 15 minuter.',
      'Dekorera med en persiljekvist.'
    ]
  },
  {
    title: 'Italiensk pizza med skinka',
    servings: 2,
    image: `${IMG_BASE}/ITALIENSK_PIZZA_MED_SKINKA.JPG`,
    categories: ['pizza','middag'],
    ingredients: ['2 ägg','1 msk fiberhusk','1 tsk bakpulver','125 g riven ost','4 msk tomatsås färdig','125 g mozzarella','3 champinjoner','1 krm torkad oregano','75 g lufttorkad skinka','1/4 rödlök','4 cocktailtomater','1 msk färsk basilika'],
    instructions: [
      'Sätt ugnen på 200 grader.',
      'Blanda alla ingredienser till degen och låt svälla i 5 minuter.',
      'Lägg ett bakplåtspapper på en plåt och klicka ut en eller två pizzor av degen.',
      'Platta till och förgrädda i cirka 8 minuter.',
      'Ta ut pizzan och bred på ett jämnt lager tomatsås.',
      'Skär mozzarella i skivor och fördela ost över.',
      'Skiva champinjoner och lägg över och strö på oregano.',
      'Grädda i ugnen tills osten blivit gyllenbrun, cirka 7-8 minuter.',
      'Skala och skär rödlök i strimlor.',
      'Dela tomaterna.',
      'Fördela lök, tomat och lufttorkad skinka på pizzan/pizzorna.',
      'Dekorera med basilikablad.'
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

    // Do not modify meal plan here; this route only seeds recipes for week 3
    return NextResponse.json({ ok: true, created });
  } catch (error) {
    console.error('Seed hormone week3 recipes error:', error);
    return NextResponse.json({ error: 'Failed to seed week 3 recipes' }, { status: 500 });
  }
}



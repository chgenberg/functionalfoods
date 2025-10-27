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

const IMG_BASE = '/Hormonell_balans/Bilder_v4';

const RECIPES: RecipeSeed[] = [
  {
    title: 'Havregrynsgröt med bär och kokos',
    servings: 1,
    image: `${IMG_BASE}/HAVREGRYNSGRÖT_MED_BÄR_OCH_KOKOS.JPG`,
    categories: ['frukost'],
    ingredients: ['1 dl havregryn','2 dl vatten','1/2 krm salt','1 dl frysta bär','2 msk kokosflingor','1 dl mjölk'],
    instructions: [
      'Lägg havregryn i en kastrull.',
      'Tillsätt vatten och salt.',
      'Lägg i de frysta bären.',
      'Låt koka i 2 minuter.',
      'Servera gröten i en skål med riven kokos och mjölk.'
    ]
  },
  {
    title: 'Ägghack med skinka och äpple',
    servings: 1,
    image: `${IMG_BASE}/ÄGGHACK_MED_SKINKA_OCH_ÄPPLE.JPG`,
    categories: ['frukost'],
    ingredients: ['2 kokta ägg','30 g skinka','1 msk majonnäs','Salt och svartpeppar','1/2 äpple','10 g rucolasallad'],
    instructions: [
      'Hacka äggen och strimla skinkan.',
      'Lägg i en skål och blanda ner majonnäs, salt och peppar.',
      'Skiva äpplet i tunna skivor.',
      'Servera ägghacket med rucolasallad och skivat äpple.'
    ]
  },
  {
    title: 'Yoghurt med kokosgranola, frukt och bär',
    servings: 1,
    image: `${IMG_BASE}/YOGHURT_MED_KOKOSGRANOLA_FRUKT_OCH_BÄR.JPG`,
    categories: ['frukost'],
    ingredients: ['1 dl grekisk yoghurt','3/4 dl kokosgranola (egenbakat)','1/2 dl blåbär','1/2 clementin','1/2 dl mango','1/2 kiwi','1/4 banan'],
    instructions: [
      'Lägg yoghurt i en skål och lägg på kokosgranola.',
      'Skiva frukt och lägg över tillsammans med bär.'
    ]
  },
  {
    title: 'Stekt ägg med majonnäs',
    servings: 1,
    image: `${IMG_BASE}/STEKT_ÄGG_MED_MAJONÄS.JPG`,
    categories: ['frukost'],
    ingredients: ['1 tsk smör','2 ägg','Salt och svartpeppar','1/2 msk majonnäs','2 cocktailtomater','1 tsk gräslök'],
    instructions: [
      'Lägg smör i stekpannan och knäck i äggen.',
      'Strö på salt och peppar.',
      'Lägg upp äggen på en tallrik och servera med majonnäs.',
      'Dela tomaterna och hacka gräslök.',
      'Lägg tomater över äggen och toppa med gräslök.'
    ]
  },
  {
    title: 'Bondsoppa med vita bönor',
    servings: 4,
    image: `${IMG_BASE}/BONDSOPPA_MED_VITA_BÖNOR.JPG`,
    categories: ['soppa','lunch','middag'],
    ingredients: ['400 g konserverade vita bönor','1/2 rödlök','2 morötter','1 grönsaksbuljong','6 dl vatten','1 paprika','1 selleristjälk','1 tsk olivolja','1 krm torkad oregano','Salt och svartpeppar','2 lagerblad','1 tsk srirachasås','10 cocktailtomater','1 msk färsk oregano'],
    instructions: [
      'Låt bönorna rinna av i ett durkslag.',
      'Skala och hacka rödlök.',
      'Skala och skiva morötter.',
      'Skär paprika i mindre bitar.',
      'Skär sellerin i skivor.',
      'Häll olivolja i en kastrull och stek lök, morot, paprika och selleri i någon minut.',
      'Strö på salt, peppar och oregano.',
      'Smula ner buljongtärning och tillsätt vatten och lagerblad.',
      'Tillsätt sriracha sås och låt koka i 10 minuter.',
      'Dela tomaterna och lägg ner i kastrullen tillsammans med vita bönor.',
      'Koka ytterligare i 5 minuter och servera soppan i skålar.',
      'Strö på färsk oregano.'
    ]
  },
  {
    title: 'Kycklinggryta med mango och linser',
    servings: 2,
    image: `${IMG_BASE}/KYCKLINGGRYTA_MED_MANGO_OCH_LINSER.JPG`,
    categories: ['kyckling','middag'],
    ingredients: ['300 g kycklingfilé','1 msk sweet chilisås','2 tsk sambal oelek','1 tsk olivolja','Salt och svartpeppar','2 dl vatten','1/2 kycklingbuljongtärning','1 dl röda torkade linser','1/2 dl havregrädde','1/2 mango','1/2 paprika','10 cm purjolök','2 msk mynta','2 msk jalapeno'],
    instructions: [
      'Skär kycklingen i mindre bitar.',
      'Lägg i en skål.',
      'Tillsätt sweet chilisås, sambal oelek, salt och peppar.',
      'Hetta upp en stekpanna med olivolja.',
      'Bryn kyckling i ett par minuter.',
      'Häll på vatten och havregrädde.',
      'Smula ner buljongtärning.',
      'Tillsätt linser.',
      'Låt koka ihop i 5 minuter.',
      'Skala och skär mango i tärningar.',
      'Skär paprika i strimlor.',
      'Lägg mango och paprika i grytan.',
      'Låt koka ytterligare i 3 minuter.',
      'Strimla purjolök och hacka mynta och lägg över grytan.',
      'Servera med skivade jalapenos.'
    ]
  },
  {
    title: 'Asiatisk tonfisksallad',
    servings: 2,
    image: `${IMG_BASE}/ASIATISK_TONFISKSALLAD.JPG`,
    categories: ['fisk','lunch','middag'],
    ingredients: ['4 dl isbergssallad','1 morot','50 g sockerärtor','1/2 paprika','10 cm purjolök','1 salladslök','2 msk koriander','150 g konserverad tonfisk','2 tsk sesamolja','1 tsk sweet chili','1 tsk soja','1 tsk sesamfrön','1/4 lime','1 tsk röd chili','1 tsk sesamfrön','2 msk koriander','2 limeklyftor'],
    instructions: [
      'Skär isbergssallad grovt.',
      'Skala och skär morot i stavar.',
      'Skär sockerärtor och paprika i stavar.',
      'Skär purjolök och salladslök i skivor.',
      'Hacka koriander.',
      'Fördela på tallrikar.',
      'Lägg på tonfisken.',
      'Hacka chili och riv limezest.',
      'Blanda ihop sesamolja, sweet chilisås, soja, sesamfrön, limezest och chili och pressa ned limejuice.',
      'Häll dressingen över salladen.',
      'Hacka koriander.',
      'Dekorera salladen med koriander, sesamfrön och limeklyftor.'
    ]
  },
  {
    title: 'Lax med quinoasallad',
    servings: 2,
    image: `${IMG_BASE}/LAX_MED_QUINOASALLAD.JPG`,
    categories: ['fisk','middag'],
    ingredients: ['1,5 dl vit quinoa','1/4 rödlök','10 cocktailtomater','2 msk persilja','1 tsk olivolja','1/4 citron','Salt och svartpeppar','300 g laxfilé','1 tsk rapsolja','50 g inlagd kapris','1 msk rapsolja','2 citronklyftor','2 persiljekvistar','2 msk bearnaisesås (Erik Lallerstedt)'],
    instructions: [
      'Koka quinoa i 13 minuter i lättsaltat vatten.',
      'Häll av vattnet i ett durkslag.',
      'Lägg quinoa i en skål.',
      'Skala och hacka lök.',
      'Skär cocktailtomater i klyftor.',
      'Hacka persiljan.',
      'Blanda ner lök, tomater och persilja i skålen med quinoa.',
      'Häll på olivolja och pressa citronjuice över.',
      'Strö på salt och peppar. Skär laxen i två bitar.',
      'Strö på salt och peppar.',
      'Hetta upp en stekpanna med lite av oljan.',
      'Stek laxen ett par minuter på varje sida.',
      'Lyft upp laxen och häll på en matsked rapsolja.',
      'Lägg i kapris och fritera i 3-4 minuter.',
      'Låt kapris rinna av.',
      'Servera laxen med quinoasallad och bearnaisesås.',
      'Dekorera med citronklyftor och persiljekvistar.',
      'Toppa med friterad kapris.'
    ]
  },
  {
    title: 'Köttfärsbiffar med sötpotatis',
    servings: 2,
    image: `${IMG_BASE}/KÖTTFÄRSBIFFAR_MED_SÖTPOTATIS.JPG`,
    categories: ['kött','middag'],
    ingredients: ['300 g nötfärs','1 vitlöksklyfta','1/4 röd lök','2 msk persilja','1 tsk sambal oelek','Salt och svartpeppar','300 g sötpotatis','1/2 röd lök','2 tsk olivolja','2 msk creme fraiche','1 msk majonnäs','1 tsk sötstark senap','1/2 tsk dijon senap','25 g rucola','2 msk riven parmesan'],
    instructions: [
      'Sätt ugnen på 200 grader.',
      'Lägg färsen i en bunke.',
      'Skala och riv vitlök.',
      'Skala och finhacka lök.',
      'Hacka persilja.',
      'Blanda ner i färsen tillsammans med sambal oelek, salt och peppar.',
      'Forma färsen till biffar.',
      'Skala och skär sötpotatis i stavar.',
      'Skala och skär rödlök grovt.',
      'Häll olivolja på en plåt.',
      'Fördela sötpotatis och rödlök på plåten.',
      'Salta och peppra.',
      'Lägg biffarna på samma plåt och grädda i ugn i 20 minuter.',
      'Blanda ihop alla ingredienser till senapssåen i en skål.',
      'Lägg rucola på ett fat.',
      'Placera biffarna ovanpå tillsammans med sötpotatis.',
      'Servera med riven parmesan och senapssåsen.'
    ]
  },
  {
    title: 'Wokad lövbiff med nudlar',
    servings: 2,
    image: `${IMG_BASE}/WOKAD_LÖVBIFF_MED_NUDLAR.JPG`,
    categories: ['kött','middag'],
    ingredients: ['100 g vermicelli nudlar','300 g lövbiff','1/2 gul lök','1/2 chili','1 vitlöksklyfta','2 tsk olivolja','Salt och svartpeppar','1 msk ingefära','120 g blue dragon teriyaki wok sås','1 tsk sesamolja','150 g haricot verts','1/2 broccolistånd','2 msk koriander','1 morot','2 korianderkvistar'],
    instructions: [
      'Koka nudlarna enligt förpackningen.',
      'Häll av vattnet.',
      'Strimla lövbiff.',
      'Skala och hacka gul lök.',
      'Skiva chili tunt.',
      'Skala och riv vitlök och färsk ingefära.',
      'Hetta upp en stekpanna med olivolja.',
      'Stek lövbiff med lök, vitlök, chili och ingefära i några minuter.',
      'Salta och peppra.',
      'Tillsätt teriyakisås och sesamolja.',
      'Blanda ner nudlarna.',
      'Skär broccolistammen i skivor och skär broccolin i mindre buketter.',
      'Blanda ner i stekpannan tillsammans med haricot verts.',
      'Hacka koriander och tillsätt.',
      'Låt allt bli varmt och fördela i skålar.',
      'Strimla morot.',
      'Servera woken med strimlad morot och dekorera med korianderkvistar.'
    ]
  },
  {
    title: 'Mandarin med kanelkräm',
    servings: 1,
    image: `${IMG_BASE}/MANDARIN_MED_KANELKRÄM.JPG`,
    categories: ['dessert'],
    ingredients: ['1,5 mandarin','1 msk kokosgrädde','1 krm agavesirap','1/2 krm malen kanel','1 msk mandelspån'],
    instructions: [
      'Skala och skär mandarin på mitten.',
      'Lägg upp på ett fat.',
      'Blanda kokosgrädde och agavesirap i en skål.',
      'Tillsätt kanel.',
      'Rör runt.',
      'Lägg kanelkrämen på mandarinerna.',
      'Torrosta mandelspån snabbt i en stekpanna.',
      'Dekorera med rostade mandelspån.'
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
    console.error('Seed hormone week4 recipes error:', error);
    return NextResponse.json({ error: 'Failed to seed week 4 recipes' }, { status: 500 });
  }
}



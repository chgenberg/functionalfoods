import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/database';
import { requireAdminAuth } from '@/app/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[åä]/g, 'a')
    .replace(/[ö]/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type Seed = {
  title: string;
  servings?: number;
  image?: string | null;
  ingredients: string[];
  instructions: string | string[];
  categories?: string[];
};

const IMG = '/Hormonell_balans/Bilder_v2';

const RECIPES: Seed[] = [
  {
    title: 'Citronvatten och svart kaffe/te',
    servings: 1,
    image: `${IMG}/kaffe_vatten.PNG`,
    categories: ['frukost'],
    ingredients: ['3 dl vatten', '1 msk citronjuice', '1 kopp kaffe/te'],
    instructions: [
      'Häll upp vatten i ett glas.',
      'Pressa ner citronjuice och rör om.',
      'Drick vattnet tillsammans med en kopp kaffe eller te.'
    ]
  },
  {
    title: 'Yoghurt med kokosgranola och mango',
    servings: 1,
    image: `${IMG}/YOGHURT_MED_KOKOSGRANOLA_OCH_MANGO.JPG`,
    categories: ['frukost'],
    ingredients: ['100 g frysta mangotärningar','1 dl grekisk yoghurt, 6 %','3/4 dl kokosgranola (egenbakat)'],
    instructions: [
      'Tina mangon.',
      'Lägg yoghurt i en skål och lägg på kokosgranola och mango.'
    ]
  },
  {
    title: 'Bärsmoothie',
    servings: 2,
    image: `${IMG}/BÄRSMOOTHIE.JPG`,
    categories: ['frukost'],
    ingredients: ['2 dl frysta blåbär','2 dl frysta hallon','150 g fryst mango','2 dl mandelmjölk'],
    instructions: [
      'Lägg blåbär, hallon och mango i en blender.',
      'Häll på mandelmjölk och mixa till en jämn smoothie.',
      'Häll upp i glas och förvara rester i kylen.'
    ]
  },
  {
    title: 'Äggröra med tomatsallad',
    servings: 1,
    image: `${IMG}/ÄGGRÖRA_MED_TOMATSALLAD.JPG`,
    categories: ['frukost'],
    ingredients: ['1 tomat','1/5 rödlök','1/2 tsk olivolja','1 tsk basilika','2 ägg','1 msk mjölk','Salt och svartpeppar','1 tsk smör'],
    instructions: [
      'Skär tomaten i bitar och lägg i en skål.',
      'Skala och finhacka rödlök, hacka basilikan och blanda ner med olivolja, salt och peppar.',
      'Vispa ihop ägg och mjölk i en skål.',
      'Krydda med salt och peppar.',
      'Hetta upp en stekpanna med smör och stek äggröran i 20 sekunder på medelhög värme.',
      'Lägg äggröran på en tallrik och servera med tomatsallad.',
      'Dekorera med en basilikakvist.'
    ]
  },
  {
    title: 'Kokt ägg med kaviar',
    servings: 1,
    image: `${IMG}/KOKT_ÄGG_MED_KAVIAR.JPG`,
    categories: ['frukost'],
    ingredients: ['2 ägg','1 msk kaviar'],
    instructions: [
      'Koka äggen och servera med kaviar.'
    ]
  },
  {
    title: 'Spenatbiffar med tomatsallad',
    servings: 2,
    image: `${IMG}/SPENATBIFFAR_MED_TOMATSALLAD.JPG`,
    categories: ['vego','lunch','middag'],
    ingredients: ['100 g bladspenat','1 schalottenlök','1/2 vitlöksklyfta','1 dl keso','40 g fetaost','1 ägg','1/2 dl mandelmjöl','1 tsk fiberhusk','Salt och svartpeppar','1 krm örtagårdskrydda','1 tsk olivolja','2 tomater','1/4 rödlök','2 msk basilika','1 tsk olivolja','1 tsk vinäger','1/2 dl grekisk yoghurt','1/5 vitlöksklyfta','1 krm srirachasås'],
    instructions: [
      'Riv vitlök och blanda ihop ingredienserna till chiliyoghurten och smaka av med salt och peppar.',
      'Hacka spenaten fint och lägg i en bunke.',
      'Skala och finhacka schalottenlök och riv vitlök och lägg ner i bunken tillsammans med spenat.',
      'Tillsätt keso, fetaost och ägg.',
      'Blanda i mandelmjöl, fiberhusk och kryddor.',
      'Forma till fyra biffar.',
      'Hetta upp en stekpanna med olja och stek ett par minuter på varje sida.',
      'Skär tomater i tärningar och lägg i en skål.',
      'Skala och finhacka rödlök och lägg i skålen med tomater.',
      'Finhacka basilika och tillsätt tillsammans med olivolja och vinäger.',
      'Salta och peppra.',
      'Placera spenatbiffarna på en bädd av tomatsallad.',
      'Lägg på chiliyoghurt och dekorera med basilikakvist.'
    ]
  },
  {
    title: 'Kyckling med blomkålsmos',
    servings: 2,
    image: `${IMG}/KYCKLING_MED_BLOMKÅLSMOS.JPG`,
    categories: ['kyckling','middag'],
    ingredients: ['1 tsk olivolja','300 g kycklinglårfilé','Salt och svartpeppar','1/2 blomkålshuvud','2 msk grädde','1/2 dl mjölk','1 dl edamamebönor','25 g bacontärningar','1 salladslök','1 msk gräslök'],
    instructions: [
      'Hetta upp en stekpanna med olivolja.',
      'Bryn kycklingen i ett par minuter.',
      'Salta och peppra.',
      'Skär blomkålen i bitar och koka i lättsaltat vatten i 20 minuter.',
      'Häll av vattnet och mixa blomkålen i en matberedare eller med en stavmixer tillsammans med grädsen och mjölken.',
      'Salta och peppra.',
      'Hetta upp en stekpanna och stek bacontärningar tillsammans med edamamebönor i några minuter.',
      'Strimla salladslök tunt och blanda ner.',
      'Lägg upp blomkålsmos på en tallrik tillsammans med kycklinglårfilé.',
      'Servera med bacon och edamamebönor.',
      'Hacka gräslök och strö över.'
    ]
  },
  {
    title: 'Kycklingklubbor med kikärtssallad',
    servings: 2,
    image: `${IMG}/KYCKLINGKLUBBOR_MED_KIKÄRTSSALLAD.JPG`,
    categories: ['kyckling','middag'],
    ingredients: ['550 g kycklingklubbor','1/2 msk ketjap manis','1 tsk olivolja','1 vitlöksklyfta','Salt och svartpeppar','1 krm örtagårdskrydda','1 krm paprika','1 krm malen curry','200 g konserverade kikärtor','1 tsk olivolja','1/2 tsk örtagårdskrydda','Salt och svartpeppar','1/2 vitlöksklyfta','2 msk persilja','4 soltorkade tomater i olja','1/4 rödlök','1/4 röd paprika','1/4 gul paprika','6 cocktailtomater','3/4 dl grekisk yoghurt','1 krm sriracha sås','1 msk mango chutney','1/4 vitlöksklyfta'],
    instructions: [
      'Sätt ugnen på 200 grader.',
      'Lägg kycklingklubborna i en bunke.',
      'Tillsätt ketjap manis och olivolja.',
      'Skala och riv vitlök och blanda ner.',
      'Salta och peppra.',
      'Tillsätt de övriga kryddorna och låt kycklingen marinera i 10 minuter.',
      'Lägg kycklingen på en ugnsplåt och ugnsbaka i 40 minuter.',
      'Häll av vätskan från kikärtorna.',
      'Lägg kikärtorna i en skål.',
      'Tillsätt olivolja och örtagårdskrydda.',
      'Salta och peppra.',
      'Skala och riv vitlök.',
      'Hacka persilja.',
      'Skär soltorkad tomat i tärningar.',
      'Skala och finhacka röd lök.',
      'Skär paprika i tärningar.',
      'Dela cocktailtomaterna.',
      'Blanda ner allt i skålen med kikärtor.',
      'Lägg grekisk yoghurt i en skål.',
      'Tillsätt srirachasås och mango chutney.',
      'Skala och riv vitlök och blanda ner.',
      'Salta och peppra.',
      'Lägg upp kycklingklubborna på ett fat.',
      'Servera med kikärtsallad och mangochutneysåsen.'
    ]
  },
  {
    title: 'Lax med saffranssås och quinoasallad',
    servings: 2,
    image: `${IMG}/LAX_MED_SAFFRANSSÅS_OCH_QUINOASALLAD.JPG`,
    categories: ['fisk','middag'],
    ingredients: ['300 g laxfilé','Salt och vitpeppar','1,5 dl vit quinoa','1/4 rödlök','1 morot','1 dl frysta ärtor','1 tsk olivolja','1/4 citron','2 msk persilja','1/4 gul lök','1/4 vitlöksklyfta','1 tsk smör','0,25 g malen saffran','1 dl havregrädde','2 färska fikon','2 citronskivor'],
    instructions: [
      'Sätt ugnen på 200 grader.',
      'Dela laxfilén i 2 bitar och lägg på en bakplåtsklädd ugnsplåt.',
      'Strö på salt och peppar.',
      'Sätt in i ugnen i 20 minuter.',
      'Koka quinoa i 13 minuter i lättsaltat vatten.',
      'Häll av vattnet och skölj quinoan.',
      'Lägg i en skål.',
      'Skala och tärna moroten, finhacka rödlök och persiljan.',
      'Blanda ner i quinoan tillsammans med olivolja, citronjuice, salt och peppar.',
      'Gör saffranssåsen genom att skala och finhacka lök fint och riva vitlöken.',
      'Hetta upp en kastrull med smör och bryn lök och vitlök någon minut.',
      'Strö på saffran och häll på havregrädde.',
      'Låt koka upp och smaka av med salt och peppar.',
      'Servera laxen med quinoasalladen och saffranssåsen.',
      'Skär fikon i klyftor och servera till.',
      'Dekorera med citronskivor.'
    ]
  },
  {
    title: 'Köttfärssås med glutenfri pasta',
    servings: 2,
    image: `${IMG}/KÖTTFÄRSÅS_MED_GLUTENFRI_PASTA.JPG`,
    categories: ['kött','lunch','middag'],
    ingredients: ['1 tsk olivolja','Salt och svartpeppar','300 g nötfärs','1/2 gul lök','1 vitlöksklyfta','1 morot','1 stjälkselleri','200 ml konserverade krossade tomater','1/2 msk stark chilisås','1 krm torkade örter','Lite färsk basilika','150 g glutenfri spirelli'],
    instructions: [
      'Skala moroten och skär i tärningar.',
      'Skär selleri i små tärningar.',
      'Finhacka lök och vitlök.',
      'Hetta upp en stekpanna med olivolja.',
      'Stek nötfärsen i några minuter.',
      'Strö på salt och peppar.',
      'Tillsätt lök, vitlök, morötter och selleri och stek i ytterligare några minuter.',
      'Rör ner krossade tomater, chilisås och örtkrydda.',
      'Låt köttfärssåsen koka ihop i cirka 20 minuter.',
      'Medan köttfärssåsen kokar ihop kokar du pastan.',
      'Servera köttfärssåsen med glutenfri spirelli.',
      'Dekorera med basilika.'
    ]
  },
  {
    title: 'Mortadella med päron',
    servings: 1,
    image: `${IMG}/MORTADELLA_MED_PÄRON.JPG`,
    categories: ['kallrätt','middag','lunch'],
    ingredients: ['2 skivor mortadella','2 skivor lufttorkad skinka','1/2 päron','50 g getost','25 g ruccolasallad','1 persiljekvist'],
    instructions: [
      'Lägg upp mortadella och lufttorkad skinka på en tallrik.',
      'Skär päron i tärningar och klyftor.',
      'Lägg på en skiva chévreost och ruccolasallad.',
      'Dekorera med en persiljekvist.'
    ]
  },
  {
    title: 'Köttfärsbiff med champinjonsås',
    servings: 2,
    image: `${IMG}/KÖTTFÄRSBIFF_MED_CHAMPINJONSÅS.JPG`,
    categories: ['kött','middag'],
    ingredients: ['250 g nötfärs','1/2 gul lök','1/2 vitlöksklyfta','Salt och svartpeppar','2 msk persilja','1 tsk smör','1/2 dl vatten','50 g ruccolasallad','1/2 dl inlagda rödbetor','4 skivor inlagd gurka','150 g champinjoner','1/2 gul lök','1 tsk smör','1 1/4 dl havregrädde','1 tsk ketjap manis','2 msk persilja','1/4 vitkål','1 morot','1/4 röd paprika','100 g sockerärtor','2 msk persilja','2 tsk olivolja','1 tsk sötstark senap','1 tsk vitvinsvinäger','2 krm örtagårdskrydda'],
    instructions: [
      'Gör vitkålssalladen genom att strimla alla grönsaker och hacka persilja.',
      'Lägg i en skål.',
      'Blanda ihop olivolja, senap, vinäger och örtagårdskrydda i en liten skål, häll över salladen och blanda om.',
      'Lägg färsen i en bunke.',
      'Skala och finhacka gul lök och riv vitlök.',
      'Hacka persilja.',
      'Blanda ned lök, vitlök och persilja i färsen och salta och peppra.',
      'Forma till två biffar.',
      'Hetta upp en stekpanna med smör och bryn biffarna i cirka 10 minuter.',
      'Slå på vatten och låt koka in.',
      'Skiva champinjoner.',
      'Skala och finhacka lök och persilja.',
      'Hetta upp en kastrull med smör.',
      'Bryn svamp och lök i någon minut.',
      'Tillsätt grädde, ketjap manis och persilja.',
      'Låt koka ihop i några minuter.',
      'Smaka av med salt och peppar.',
      'Servera biffarna med champinjonsås, vitkålssallad, ruccolasallad, inlagda rödbetor och gurka.'
    ]
  },
  {
    title: 'Glutenfri banankaka',
    servings: 15,
    image: `${IMG}/GLUTENFRI_BANANKAKA.JPG`,
    categories: ['dessert'],
    ingredients: ['150 g smör','2 dl kokossocker','3 ägg','4 dl mandelmjöl','2 dl kokosmjöl','2 tsk bakpulver','1/2 tsk malen kardemumma','1 tsk vaniljpulver','4 bananer','100 g valnötter','50 g mörk choklad','1 tsk olja','2 msk glutenfritt ströbröd','10 valnötter'],
    instructions: [
      'Sätt ugnen på 175 grader.',
      'Vispa smör och kokossocker med en elvisp, tillsätt ett ägg i taget och vispa fluffigt.',
      'Blanda ner mandelmjöl, kokosmjöl, bakpulver, kardemumma och vaniljpulver.',
      'Mosa bananerna lätt och vänd ner i smeten tillsammans med valnötter.',
      'Hacka chokladen grovt och blanda ner.',
      'Häll olja i en brödform och strö på ströbröd.',
      'Häll ner smeten och dekorera med valnötter.',
      'Grädda i ugnen i 60 minuter.',
      'Låt kakan svalna och sätt in i kylen.',
      'Skär i bitar.',
      'Håller en vecka i kylen eller frys in i bitar och ta upp vid behov.'
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
        ? r.instructions.map((s: string, i: number) => `${i + 1}. ${s}`).join(' ')
        : (r.instructions as string);
      const doc = await prisma.recipe.upsert({
        where: { slug },
        create: {
          title: r.title,
          slug,
          servings: r.servings || null,
          imageUrl: r.image || undefined,
          ingredients: r.ingredients,
          content: instructionsString,
          categories: r.categories || [],
          isPremium: true,
          isFree: false
        },
        update: {
          servings: r.servings || null,
          imageUrl: r.image || undefined,
          ingredients: r.ingredients,
          content: instructionsString,
          categories: r.categories || []
        }
      });
      created.push({ id: doc.id, slug });
    }

    // Update meal plan links
    const course = 'hormone';
    const weekNumber = 2;
    const link = (title: string) => `/kunskapsbank/recept/${slugify(title)}`;
    const days = {
      'Måndag': {
        breakfast: { name: 'Yoghurt med kokosgranola och mango', recipeLink: link('Yoghurt med kokosgranola och mango') },
        lunch: { name: 'Stekt lax med citronmarinerad broccoli (rester)', recipeLink: link('Stekt lax med citronmarinerad broccoli') },
        dinner: { name: 'Köttfärssås med glutenfri pasta', recipeLink: link('Köttfärssås med glutenfri pasta') }
      },
      'Tisdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Torskgryta med rotfrukter och curry (rester från frysen)', recipeLink: link('Torskgryta med rotfrukter och curry') },
        dinner: { name: 'Spenatbiffar med tomatsallad', recipeLink: link('Spenatbiffar med tomatsallad') }
      },
      'Onsdag': {
        breakfast: { name: 'Kokt ägg med kaviar', recipeLink: link('Kokt ägg med kaviar') },
        lunch: { name: 'Köttfärssås med glutenfri pasta (rester)', recipeLink: link('Köttfärssås med glutenfri pasta') },
        dinner: { name: 'Kycklingklubbor med kikärtssallad', recipeLink: link('Kycklingklubbor med kikärtssallad') }
      },
      'Torsdag': {
        breakfast: { name: 'Citronvatten och svart kaffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Spenatbiffar med tomatsallad (rester)', recipeLink: link('Spenatbiffar med tomatsallad') },
        dinner: { name: 'Mortadella med päron', recipeLink: link('Mortadella med päron') }
      },
      'Fredag': {
        breakfast: { name: 'Äggröra med tomatsallad', recipeLink: link('Äggröra med tomatsallad') },
        lunch: { name: 'Kycklingklubbor med kikärtssallad (rester)', recipeLink: link('Kycklingklubbor med kikärtssallad') },
        dinner: { name: 'Köttfärsbiff med champinjonsås', recipeLink: link('Köttfärsbiff med champinjonsås') }
      },
      'Lördag': {
        breakfast: { name: 'Citronvatten med svart kafffe/te', recipeLink: link('Citronvatten och svart kaffe/te') },
        lunch: { name: 'Köttfärsbiff med champinjonsås (rester)', recipeLink: link('Köttfärsbiff med champinjonsås') },
        dinner: { name: 'Lax med saffranssås och quinoasallad', recipeLink: link('Lax med saffranssås och quinoasallad') }
      },
      'Söndag': {
        breakfast: { name: 'Bärsmoothie', recipeLink: link('Bärsmoothie') },
        lunch: { name: 'Lax med saffranssås och quinoasallad (rester)', recipeLink: link('Lax med saffranssås och quinoasallad') },
        dinner: { name: 'Kyckling med blomkålsmos', recipeLink: link('Kyckling med blomkålsmos') },
        dessert: { name: 'Banankaka', recipeLink: link('Glutenfri banankaka') }
      }
    } as any;

    await (prisma as any).mealPlanWeek?.upsert({
      where: { course_weekNumber: { course, weekNumber } },
      create: { course, weekNumber, title: 'Vecka 2', days },
      update: { days }
    });

    return NextResponse.json({ ok: true, created });
  } catch (error) {
    console.error('Seed hormone week2 recipes error:', error);
    return NextResponse.json({ error: 'Failed to seed week 2 recipes' }, { status: 500 });
  }
}



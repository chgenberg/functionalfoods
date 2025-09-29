// Update Basic week 1 recipes with precise ingredients, instructions, servings and nutrition
// Source: user's provided manual content (no mock data)

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper to build nutrition object
function perServing({ energy, protein, carbohydrates, fat, fiber }) {
  return { perServing: { energy, protein, carbohydrates, fat, fiber } };
}

// Manual data per recipe (slug keyed)
const RECIPES = [
  {
    slug: 'yoghurt-ketomusli',
    servings: 1,
    ingredients: [
      '1 dl grekisk yoghurt',
      '0,75 dl ketomüsli'
    ],
    instructions: [
      'Lägg yoghurt i en skål.',
      'Lägg på ketomüsli.'
    ],
    nutrition: perServing({ energy: 321, protein: 10, carbohydrates: 7, fat: 10, fiber: 0 })
  },
  {
    slug: 'tonfisksallad-med-apple',
    servings: 1,
    ingredients: [
      '0,25 st rödlök',
      '0,5 st paprika',
      '0,5 st äpple',
      '125 g tonfisk i vatten',
      '2 st ägg',
      '1 st hjärtsallad',
      '1,5 msk gröna oliver',
      '1 st citronklyfta (dekoration)',
      '1 kvist färsk persilja (dekoration)'
    ],
    instructions: [
      'Koka ägg och låt svalna.',
      'Skala och strimla rödlök.',
      'Skär paprika i mindre bitar.',
      'Kärna ur och skiva äpple.',
      'Skiva oliver.',
      'Låt tonfisk rinna av.',
      'Skala och skär ägg i mindre bitar.',
      'Placera ut salladsblad på ett fat och lägg på alla ingredienser.',
      'Garnera med oliver, persilja och citronklyfta.'
    ],
    nutrition: perServing({ energy: 418, protein: 49, carbohydrates: 18, fat: 49, fiber: 4 })
  },
  {
    slug: 'squashspagetti-med-kottfarssas',
    servings: 2,
    ingredients: [
      '1 tsk olivolja',
      'salt och svartpeppar',
      '300 g nötfärs',
      '0,5 st gul lök',
      '1 klyfta vitlök',
      '1 st morot',
      '1 st selleristjälk',
      '200 g krossade tomater',
      '0,5 msk stark chilisås',
      '1 krm torkade örter',
      '1 st squash',
      '1 kvist färsk basilika'
    ],
    instructions: [
      'Skala moroten och skär i tärningar. Skär selleri i små tärningar.',
      'Hetta upp olivolja och stek färsen. Krydda med salt och peppar.',
      'Tillsätt lök, vitlök, morot och selleri och stek vidare.',
      'Rör ner krossade tomater, chilisås och örtkryddor. Låt koka ca 20 minuter.',
      'Svarva squash till spagetti eller hyvla till tagliatelle.',
      'Servera squash med köttfärssås och dekorera med basilika.'
    ],
    nutrition: perServing({ energy: 345, protein: 34, carbohydrates: 18, fat: 34, fiber: 7 })
  },
  {
    slug: 'ketomusli',
    servings: 15,
    ingredients: [
      '1 dl paranötter',
      '1 dl valnötter',
      '1 dl hasselnötter',
      '1 dl mandel',
      '1 dl pekannötter',
      '4 dl mandelmjöl',
      '1 msk fiberhonung Nicks',
      '1 msk rapsolja',
      '1 msk kanel',
      '1 tsk kardemumma',
      '1 krm salt',
      '2 dl kokosflingor',
      '2 dl kokosskivor'
    ],
    instructions: [
      'Hacka alla nötter grovt.',
      'Rosta mandelmjöl med fiberhonung, olja, kanel, kardemumma och salt i 5 minuter under omrörning.',
      'Blanda ner kokosflingor och kokosskivor.',
      'Rosta nötterna torrt, blanda med mandelmjölsblandningen och häll upp i burk.'
    ],
    nutrition: perServing({ energy: 309, protein: 6, carbohydrates: 4, fat: 6, fiber: 2 })
  },
  {
    slug: 'stekt-agg-lax',
    servings: 1,
    ingredients: [
      '1 tsk smör',
      '2 st ägg',
      'salt och svartpeppar',
      '50 g kallrökt lax',
      '1 msk färsk persilja',
      '1 st citronklyfta'
    ],
    instructions: [
      'Stek äggen i smör, krydda.',
      'Servera med lax, persilja och citron.'
    ],
    nutrition: perServing({ energy: 317, protein: 26, carbohydrates: 2, fat: 26, fiber: 0 })
  },
  {
    slug: 'het-ratatouille',
    servings: 2,
    ingredients: [
      '0,5 st rödlök',
      '0,25 st squash',
      '0,5 st paprika',
      '1 st morot',
      '200 g blomkål',
      '0,5 msk olivolja',
      '1 klyfta vitlök',
      '200 g krossade tomater',
      '0,5 krm chiliflakes',
      '1 tsk flytande honung',
      '1 tsk torkade örter',
      'salt och svartpeppar',
      '3 dl rucola'
    ],
    instructions: [
      'Skär grönsaker i bitar och riv vitlök.',
      'Fräs grönsaker och vitlök i olivolja.',
      'Tillsätt krossade tomater, chiliflakes och honung. Krydda och låt puttra 10 minuter.',
      'Servera med rucola.'
    ],
    nutrition: perServing({ energy: 162, protein: 4, carbohydrates: 23, fat: 4, fiber: 9 })
  },
  {
    slug: 'gron-smoothie',
    servings: 1,
    ingredients: [
      '25 g bladspenat',
      '1 st selleristjälk',
      '0,5 st gurka',
      '1 st apelsin',
      '1 msk färsk ingefära',
      '1 st lime',
      '1,5 dl vatten'
    ],
    instructions: [
      'Mixa alla ingredienser till en jämn smoothie. Späd med vatten till önskad konsistens.'
    ],
    nutrition: perServing({ energy: 186, protein: 5, carbohydrates: 34, fat: 5, fiber: 5 })
  },
  {
    slug: 'poke-bowl-kyckling',
    servings: 1,
    ingredients: [
      '250 g kycklingfilé',
      '0,5 klyfta vitlök',
      '1 tsk färsk ingefära',
      '0,5 msk ketjap manis',
      'salt och svartpeppar',
      '1 tsk olivolja',
      '0,5 dl vatten',
      '0,25 st blomkålshuvud',
      '2 msk färsk koriander',
      '0,5 st lime',
      '4 dl isbergssallad',
      '50 g sockerärtor',
      '0,25 st färsk mango',
      '0,5 st morot',
      '1 dl sojabönor',
      '0,5 tsk sesamfrön',
      'Yoghurtcreme: 4 msk grekisk yoghurt, 1 tsk soja, 0,25 tsk sriracha, salt och peppar'
    ],
    instructions: [
      'Marinera kycklingen med vitlök, ingefära och ketjap manis.',
      'Gör blomkålsris och blanda med koriander, lime, salt och peppar.',
      'Stek kycklingen, låt ångkoka klar. Skiva.',
      'Lägg sallad i skålar, toppa med blomkålsris, grönsaker och kyckling. Toppa med sesam och yoghurtcreme.'
    ],
    nutrition: perServing({ energy: 722, protein: 75, carbohydrates: 51, fat: 75, fiber: 6 })
  },
  {
    slug: 'kottfarsbiffar-stekt-blomkal',
    servings: 2,
    ingredients: [
      '250 g blomkål',
      '2 tsk olivolja',
      '0,25 st gul lök',
      '1 klyfta vitlök',
      '250 g nötfärs',
      '1 tsk ketjap manis',
      'salt och svartpeppar',
      '1 krm örtagårdskrydda',
      '2 tsk smör',
      '0,75 dl vatten',
      '4 st cocktailtomater',
      '2 kvistar färsk persilja',
      'Pestosås: 3 msk grekisk yoghurt, 1 tsk röd pesto'
    ],
    instructions: [
      'Blanda yoghurt och röd pesto till sås.',
      'Skär blomkålen i skivor och stek i olivolja.',
      'Blanda färs med lök, vitlök och ketjap manis. Krydda och forma biffar.',
      'Stek biffar i smör, ångkoka klara med vatten. Servera med blomkål, tomat och pestosås.'
    ],
    nutrition: perServing({ energy: 355, protein: 29, carbohydrates: 11, fat: 29, fiber: 3 })
  },
  {
    slug: 'omelett-tomat',
    servings: 1,
    ingredients: [
      '2 st ägg',
      'salt och svartpeppar',
      '1 tsk olivolja',
      '1 st tomat',
      '1 msk färsk persilja'
    ],
    instructions: [
      'Vispa ägg med salt och peppar. Stek omeletten i olivolja.',
      'Toppa med tomat och persilja.'
    ],
    nutrition: perServing({ energy: 242, protein: 15, carbohydrates: 4, fat: 15, fiber: 2 })
  },
  {
    slug: 'havrefrallor-med-morotter-och-aprikoser',
    servings: 8,
    ingredients: [
      '4 dl havregryn',
      '4 st torkade aprikoser',
      '1 st morot',
      '3 dl keso',
      '4 st ägg',
      '1 dl solroskärnor',
      '1 dl pumpafrön',
      '1 dl hampafrön',
      '1 dl sesamfrön',
      '1,5 tsk bakpulver',
      '1 krm salt',
      'Topping: 0,5 dl hampafrön'
    ],
    instructions: [
      'Sätt ugnen på 200°C.',
      'Riv morot och hacka aprikoser. Blanda alla ingredienser, forma bullar, toppa med hampafrön.',
      'Grädda ca 20 minuter.'
    ],
    nutrition: perServing({ energy: 355, protein: 20, carbohydrates: 17, fat: 20, fiber: 4 })
  },
  {
    slug: 'havrefralla-med-morotter-och-torkade-aprikoser',
    servings: 1,
    ingredients: [
      '1 st havrefralla med morötter och aprikoser',
      'valfritt pålägg'
    ],
    instructions: [
      'Dela frallan och servera med valfritt pålägg.'
    ],
    nutrition: perServing({ energy: 355, protein: 20, carbohydrates: 17, fat: 20, fiber: 4 })
  },
  {
    slug: 'kycklinggryta-med-bakad-spetskal',
    servings: 4,
    ingredients: [
      '1 st spetskålshuvud',
      '1 msk olivolja',
      'salt och svartpeppar',
      '0,5 st gul lök',
      '0,5 st rödlök',
      '2 klyftor vitlök',
      '1 st paprika',
      '2 st tomat',
      '800 g kycklinglårfilé',
      '250 g kabanoss',
      '0,5 msk olivolja',
      '1 krm örtagårdskrydda',
      '1 st hönsbuljongtärning',
      '0,5 dl ajvar relish',
      '1 dl oliver',
      '2 msk färsk timjan',
      '4 dl vatten',
      'Tillbehör: 1 dl rostad lök, 1 dl grekisk yoghurt, 2 msk färsk timjan'
    ],
    instructions: [
      'Rosta spetskål i ugn 200°C i 15–20 min.',
      'Fräs kyckling, korv, lök och vitlök i olja. Krydda.',
      'Tillsätt tomater, buljong, ajvar, oliver, timjan och vatten. Koka ca 30 min.',
      'Servera med spetskål. Toppa med rostad lök och yoghurt.'
    ],
    nutrition: perServing({ energy: 571, protein: 53, carbohydrates: 16, fat: 53, fiber: 7 })
  },
  {
    slug: 'smoothie-smoothiebowl',
    servings: 2,
    ingredients: [
      '100 g fryst mango',
      '100 g fryst ananas',
      '1 st banan',
      '1 dl mandelmjölk',
      'Topping: 0,5 st färsk mango, 1 st passionsfrukt, 2 msk kokosskivor, 2 msk pistagenötter'
    ],
    instructions: [
      'Mixa frukt med mandelmjölk till krämig konsistens. Toppa enligt lista.'
    ],
    nutrition: perServing({ energy: 242, protein: 4, carbohydrates: 35, fat: 4, fiber: 3 })
  },
  {
    slug: 'laxburgare-med-kramig-gronsaksrora',
    servings: 2,
    ingredients: [
      '250 g laxfilé',
      '1 st salladslök',
      '1 msk färsk ingefära',
      '1 klyfta vitlök',
      'salt och svartpeppar',
      '0,5 st lime',
      '2 msk sesamfrön',
      '0,5 msk olivolja',
      '1 msk furikakekrydda',
      'Krämig röra: 200 g frysta sojabönor, 100 g sockerärtor, 1 salladslök, 100 g kräftstjärtar, 0,5 dl gräddfil, 2 msk majonnäs, 0,5 msk curry, salt & peppar',
      'Topping: 15 g bladspenat, 0,5 dl granatäppelkärnor, 0,5 st salladslök, 0,5 st lime'
    ],
    instructions: [
      'Mixa lax med salladslök, ingefära och vitlök. Krydda och pressa lime. Forma biffar och doppa i sesam.',
      'Stek 4–5 min per sida. Gör den krämiga röran och servera med topping.'
    ],
    nutrition: perServing({ energy: 851, protein: 49, carbohydrates: 34, fat: 49, fiber: 1 })
  },
  {
    slug: 'mangoglass',
    servings: 2,
    ingredients: [
      '250 g fryst mango',
      '1 dl grekisk yoghurt',
      '0,5 tsk flytande honung'
    ],
    instructions: [
      'Mixa ihop till en slät glass och servera i två glas.'
    ],
    nutrition: perServing({ energy: 147, protein: 3, carbohydrates: 23, fat: 3, fiber: 3 })
  },
  {
    slug: 'ugnsbakad-tomat-med-kottfars',
    servings: 2,
    ingredients: [
      '4 st bifftomater',
      '0,5 st gul lök',
      '1 klyfta vitlök',
      '0,5 st paprika',
      '2 tsk olivolja',
      '250 g nötfärs',
      'salt och svartpeppar',
      '0,5 tsk örtagårdskrydda',
      '1 msk röd pesto',
      '4 msk grädde',
      '2 msk färsk persilja',
      '25 g fetaost',
      '4 dl rucola'
    ],
    instructions: [
      'Sätt ugnen på 200°C. Skär av topparna och gröp ur tomaterna.',
      'Fräs lök, vitlök, paprika och nötfärs. Krydda och rör i pesto, grädde och persilja.',
      'Fyll tomaterna, toppa med fetaost och gratinera 15 minuter. Servera med rucola.'
    ],
    nutrition: perServing({ energy: 514, protein: 29, carbohydrates: 14, fat: 29, fiber: 6 })
  }
];

async function run() {
  let updated = 0, missing = [];
  for (const r of RECIPES) {
    try {
      await prisma.recipe.update({
        where: { slug: r.slug },
        data: {
          servings: r.servings,
          ingredients: r.ingredients,
          instructions: r.instructions.join('\n'),
          nutrition: r.nutrition
        }
      });
      updated++;
    } catch (e) {
      missing.push(r.slug);
      console.error('Missing recipe or failed to update:', r.slug, e.message);
    }
  }
  console.log(`Updated week 1 recipes: ${updated}. Missing: ${missing.length}`);
  if (missing.length) console.log('Missing slugs:', missing);
}

run().finally(async () => {
  await prisma.$disconnect();
});



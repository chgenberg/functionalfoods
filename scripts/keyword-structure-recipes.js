#!/usr/bin/env node
/**
 * Semi-automatic structuring of recipe ingredients & instructions using keyword configs.
 * Usage:
 *   SLUG=falafel-med-gronsaker node scripts/keyword-structure-recipes.js
 */

const BASE_URL = process.env.FF_BASE_URL || 'https://www.functionalfoods.se';
const FETCH = globalThis.fetch;

const CONFIG = {
  'falafel-med-gronsaker': {
    groups: [
      {
        title: 'Falafel',
        keywords: [
          'kikärtor',
          'gul lök',
          'vitlök',
          'spiskummin',
          'salt',
          'persilja',
          'sambal',
          'majsstärkelse',
          'olivolja'
        ]
      },
      {
        title: 'Grönsaker',
        keywords: [
          'morötter',
          'paprika',
          'rödlök',
          'gurka',
          'cocktailtomater',
          'spenat'
        ]
      },
      {
        title: 'Dressing',
        keywords: ['yoghurt', 'sweet chili', 'dressing']
      }
    ]
  },
  'hogrevsburgare-med-mango': {
    groups: [
      {
        title: 'Burgare',
        keywords: ['burgare', 'högrev', 'olivolja', 'salt', 'peppar']
      },
      {
        title: 'Sallad & topping',
        keywords: ['spenat', 'mango', 'rödlök', 'cocktailtomater', 'mynta', 'fetaost', 'myntablad']
      }
    ]
  },
  'kladdkaka-med-gradde-och-hallon': {
    groups: [
      {
        title: 'Smet',
        keywords: ['smör', 'choklad', 'ägg', 'sötströ', 'vanilj', 'mandelmjöl', 'bakpulver']
      },
      {
        title: 'Servering',
        keywords: ['grädde', 'hallon']
      }
    ]
  },
  'persisk-kottgryta-med-raris': {
    groups: [
      {
        title: 'Gryta',
        keywords: [
          'lök',
          'vitlök',
          'chili',
          'högrev',
          'olivolja',
          'ingefära',
          'kardemumma',
          'curry',
          'kryddpeppar',
          'nejlika',
          'paprikapulver',
          'tomater',
          'vatten',
          'ketjap',
          'dadlar',
          'kanel'
        ]
      },
      {
        title: 'Servering',
        keywords: ['pistagenöt', 'granatäppel', 'yoghurt', 'fefferoni', 'råris']
      }
    ]
  },
  'korvstroganoff-med-svartkal': {
    groups: [
      {
        title: 'Stroganoff',
        keywords: ['falukorv', 'smör', 'lök', 'vitlök', 'svartkål']
      },
      {
        title: 'Sås & kryddor',
        keywords: ['chilisås', 'senap', 'havregrädde', 'salt', 'peppar', 'basilika']
      }
    ]
  },
  'skinkpaj-med-broccoli-och-cheddar': {
    groups: [
      {
        title: 'Pajdeg',
        keywords: ['mandelmjöl', 'sesamfrön', 'fiberhusk', 'salt', 'smör', 'deg']
      },
      {
        title: 'Fyllning',
        keywords: ['broccoli', 'skinka', 'paprika', 'purjolök', 'rucola']
      },
      {
        title: 'Äggstanning & ost',
        keywords: ['ägg', 'grädde', 'mjölk', 'örtagård', 'cheddar', 'riven ost', 'peppar']
      }
    ]
  },
  'tonfisksallad-med-tomat': {
    groups: [
      {
        title: 'Tomatbas',
        keywords: ['bifftomat']
      },
      {
        title: 'Tonfiskröra',
        keywords: ['tonfisk', 'soltorkade', 'selleri', 'rödlök', 'olivolja', 'kapris', 'persilja', 'salt', 'peppar']
      },
      {
        title: 'Servering',
        keywords: ['citronklyfta', 'persiljekvist']
      }
    ]
  },
  'tacosoppa': {
    groups: [
      {
        title: 'Soppa',
        keywords: [
          'blomkål',
          'paprika',
          'vitlök',
          'ingefära',
          'lök',
          'chili',
          'linser',
          'tacokrydda',
          'vatten'
        ]
      },
      {
        title: 'Servering',
        keywords: ['gräddfil', 'persilja']
      }
    ]
  },
  'tofugryta-med-jordnotter-och-blomkalsris': {
    groups: [
      {
        title: 'Tofugryta',
        keywords: [
          'tofu',
          'vitlök',
          'jordnötter',
          'olivolja',
          'currypasta',
          'kokosmjölk',
          'koriander',
          'lime',
          'salt',
          'peppar'
        ]
      },
      {
        title: 'Blomkålsris & topping',
        keywords: ['blomkål', 'morot', 'salladslök']
      }
    ]
  },
  'aggrora-med-bar': {
    groups: [
      {
        title: 'Äggröra',
        keywords: ['ägg', 'grädde', 'smör', 'salt', 'peppar']
      },
      {
        title: 'Bär',
        keywords: ['blåbär', 'jordgubbar', 'bär']
      }
    ]
  },
  'keso-med-persika-och-jordgubbar': {
    groups: [
      {
        title: 'Keso',
        keywords: ['keso']
      },
      {
        title: 'Frukt & bär',
        keywords: ['persika', 'jordgubbar']
      }
    ]
  },
  'yoghurt-med-blabar-och-kokosgranola': {
    groups: [
      {
        title: 'Yoghurt',
        keywords: ['yoghurt']
      },
      {
        title: 'Topping',
        keywords: ['blåbär', 'kokosgranola', 'granola']
      }
    ]
  },
  'minihamburgare-med-gorgonzola': {
    groups: [
      {
        title: 'Hamburgare',
        keywords: ['nötfärs', 'vitlök', 'sweet chili', 'örtagård', 'mandel', 'gorgonzola', 'olivolja', 'salt', 'peppar']
      },
      {
        title: 'Grönsaker',
        keywords: ['squash', 'rödlök', 'tomater', 'persilja']
      }
    ]
  },
  'biff-med-blomkalsmos': {
    groups: [
      {
        title: 'Blomkålsmos',
        keywords: ['blomkål', 'crème', 'creme', 'citron', 'spiskummin']
      },
      {
        title: 'Biff & topping',
        keywords: ['nötfärs', 'rödlök', 'vitlök', 'persilja', 'bacon', 'tomat', 'rosmarin', 'olivolja']
      }
    ]
  },
  'laxwok-teriyaki': {
    groups: [
      {
        title: 'Wok',
        keywords: ['lax', 'morötter', 'rödlök', 'fänkål', 'sockerärtor', 'brysselkål', 'vitlök', 'ingefära', 'teriyaki', 'gräslök']
      }
    ]
  },
  'kesotorsk-med-mango-chutney': {
    groups: [
      {
        title: 'Grönsaker',
        keywords: ['broccoli', 'blomkål', 'rödlök', 'tomat', 'olivolja']
      },
      {
        title: 'Fisk & topping',
        keywords: ['torsk', 'keso', 'mango chutney', 'persilja', 'persiljekvist']
      }
    ]
  },
  'panerad-kyckling-med-waldorfsallad': {
    groups: [
      {
        title: 'Panerad kyckling',
        keywords: ['kyckling', 'pesto', 'fetaost', 'ägg', 'ströbröd', 'örtagård', 'salt', 'peppar']
      },
      {
        title: 'Waldorfsallad',
        keywords: ['rättika', 'morot', 'röd lök', 'selleri', 'majonnäs', 'gräddfil', 'persilja', 'cocktailtomater']
      }
    ]
  },
  'yoghurt-med-kokosgranola-och-bar': {
    groups: [
      { title: 'Yoghurt', keywords: ['yoghurt'] },
      { title: 'Topping', keywords: ['bär', 'granola', 'kokos'] }
    ]
  },
  'havregrynsgrot-med-banan': {
    groups: [
      { title: 'Gröt', keywords: ['havregryn', 'vatten', 'salt', 'mjölk'] },
      { title: 'Topping', keywords: ['banan', 'pumpafrön'] }
    ]
  },
  'lax-med-quinoasallad': {
    groups: [
      {
        title: 'Quinoasallad',
        keywords: ['quinoa', 'rödlök', 'cocktailtomater', 'persilja', 'olivolja', 'citron']
      },
      {
        title: 'Lax & topping',
        keywords: ['lax', 'rapsolja', 'kapris', 'bearnaise', 'persiljekvist']
      }
    ]
  },
  'bondsoppa-med-vita-bonor': {
    groups: [
      {
        title: 'Soppa',
        keywords: [
          'bönor',
          'lök',
          'morötter',
          'buljong',
          'vatten',
          'paprika',
          'selleri',
          'olivolja',
          'oregano',
          'lagerblad',
          'sriracha',
          'tomater'
        ]
      },
      {
        title: 'Topping',
        keywords: ['färsk oregano']
      }
    ]
  },
  'rodbetsquinoa-med-chevrelax': {
    groups: [
      {
        title: 'Lax',
        keywords: ['lax', 'örtagård', 'chèvre', 'chevre', 'honung', 'valnöt', 'salt', 'peppar']
      },
      {
        title: 'Quinoasallad',
        keywords: ['quinoa', 'citron', 'olivolja', 'rödlök', 'rosmarin', 'rödbetor', 'rucola', 'fikon']
      }
    ]
  },
  'ost-och-skinkmacka': {
    groups: [
      {
        title: 'Macka',
        keywords: ['kavring', 'smör', 'ost', 'skinka']
      },
      {
        title: 'Topping',
        keywords: ['paprika']
      }
    ]
  },
  'yoghurt-med-kokosgranola-frukt-och-bar': {
    groups: [
      { title: 'Yoghurt', keywords: ['yoghurt'] },
      { title: 'Frukt & bär', keywords: ['granola', 'blåbär', 'clementin', 'mango', 'kiwi', 'banan'] }
    ]
  },
  'agghack-med-skinka-och-apple': {
    groups: [
      {
        title: 'Ägghack',
        keywords: ['ägg', 'skinka', 'majonnäs', 'salt', 'peppar']
      },
      {
        title: 'Servering',
        keywords: ['äpple', 'rucola']
      }
    ]
  },
  'havregrynsgrot-med-bar-och-kokos': {
    groups: [
      {
        title: 'Gröt',
        keywords: ['havregryn', 'vatten', 'salt', 'mjölk']
      },
      {
        title: 'Topping',
        keywords: ['bär', 'kokos']
      }
    ]
  },
  'ost-och-skinkmacka-med-gurka': {
    groups: [
      { title: 'Macka', keywords: ['kavring', 'smör', 'salladsblad', 'ost', 'skinka'] },
      { title: 'Topping', keywords: ['gurka'] }
    ]
  },
  'omelett-med-skinka': {
    groups: [
      { title: 'Omelett', keywords: ['ägg', 'smör', 'salt', 'peppar'] },
      { title: 'Topping', keywords: ['skinka', 'gräslök'] }
    ]
  },
  'bananpannkaka-med-frukt-och-bar': {
    groups: [
      { title: 'Pannkaka', keywords: ['banan', 'ägg', 'vaniljpulver', 'smör'] },
      { title: 'Topping', keywords: ['yoghurt', 'blåbär', 'granatäppel', 'banan'] }
    ]
  },
  'glutenfri-banankaka': {
    groups: [
      {
        title: 'Smet',
        keywords: [
          'smör',
          'kokossocker',
          'ägg',
          'mandelmjöl',
          'kokosmjöl',
          'bakpulver',
          'kardemumma',
          'vanilj',
          'bananer',
          '100 g valnötter',
          'choklad',
          'olja',
          'ströbröd'
        ]
      },
      { title: 'Topping', keywords: ['10 valnötter'] }
    ]
  },
  'kottfarsbiff-med-champinjonsas': {
    groups: [
      { title: 'Biff', keywords: ['nötfärs', 'lök', 'vitlök', 'persilja', 'smör', 'vatten', 'salt', 'peppar'] },
      { title: 'Champinjonsås', keywords: ['champinjoner', 'havregrädde', 'ketjap', 'smör'] },
      { title: 'Sallad & tillbehör', keywords: ['ruccola', 'rödbetor', 'gurka', 'vitkål', 'morot', 'paprika', 'sockerärtor', 'olivolja', 'senap', 'vinäger', 'örtagård'] }
    ]
  },
  'stekt-agg-med-majonnas': {
    groups: [
      { title: 'Ägg', keywords: ['smör', 'ägg', 'salt', 'peppar'] },
      { title: 'Servering', keywords: ['majonnäs', 'tomater', 'gräslök'] }
    ]
  },
  'mortadella-med-paron': {
    groups: [
      { title: 'Chark', keywords: ['mortadella', 'skinka'] },
      { title: 'Tillbehör', keywords: ['päron', 'getost', 'ruccola', 'persilja'] }
    ]
  },
  'kottfarssas-med-glutenfri-pasta': {
    groups: [
      { title: 'Köttfärssås', keywords: ['olivolja', 'nötfärs', 'lök', 'vitlök', 'morot', 'selleri', 'tomater', 'chilisås', 'örter', 'basilika', 'salt', 'peppar'] },
      { title: 'Pasta', keywords: ['glutenfri', 'spirelli'] }
    ]
  },
  'lax-med-saffranssas-och-quinoasallad': {
    groups: [
      { title: 'Lax', keywords: ['lax', 'salt', 'vitpeppar'] },
      { title: 'Quinoasallad', keywords: ['quinoa', 'rödlök', 'morot', 'ärtor', 'olivolja', 'citron', 'persilja'] },
      { title: 'Saffranssås', keywords: ['gul lök', 'vitlök', 'saffran', 'havregrädde', 'smör'] },
      { title: 'Servering', keywords: ['fikon', 'citronskivor'] }
    ]
  },
  'kycklingklubbor-med-kikartssallad': {
    groups: [
      { title: 'Kyckling', keywords: ['kycklingklubbor', 'ketjap', 'vitlök', 'örtagård', 'paprika', 'curry'] },
      { title: 'Kikärtssallad', keywords: ['kikärtor', 'olivolja', 'persilja', 'soltorkade', 'rödlök', 'paprika', 'cocktailtomater'] },
      { title: 'Sås', keywords: ['yoghurt', 'sriracha', 'mango chutney', 'vitlök'] }
    ]
  },
  'kyckling-med-blomkalsmos': {
    groups: [
      { title: 'Kyckling', keywords: ['kyckling', 'olivolja', 'salt', 'peppar'] },
      {
        title: 'Blomkålsmos',
        keywords: ['blomkål', 'grädde', 'mjölk']
      },
      { title: 'Topping', keywords: ['edamame', 'bacon', 'salladslök', 'gräslök'] }
    ]
  },
  'spenatbiffar-med-tomatsallad': {
    groups: [
      { title: 'Spenatbiffar', keywords: ['spenat', 'lök', 'vitlök', 'keso', 'fetaost', 'ägg', 'mandelmjöl', 'fiberhusk', 'örtagård', 'salt', 'peppar'] },
      { title: 'Tomatsallad', keywords: ['tomater', 'rödlök', 'basilika', 'vinäger'] },
      { title: 'Chiliyoghurt', keywords: ['yoghurt', 'vitlök', 'sriracha'] }
    ]
  },
  'kokt-agg-med-kaviar': {
    groups: [
      { title: 'Ägg', keywords: ['ägg', 'salt', 'peppar'] },
      { title: 'Servering', keywords: ['kaviar'] }
    ]
  },
  'aggrora-med-tomatsallad': {
    groups: [
      { title: 'Tomatsallad', keywords: ['tomat', 'rödlök', 'basilika', 'olivolja', 'peppar'] },
      { title: 'Äggröra', keywords: ['ägg', 'mjölk', 'smör', 'salt'] }
    ]
  },
  'barsmoothie': {
    groups: [
      { title: 'Smoothie', keywords: ['blåbär', 'hallon', 'mango', 'mandelmjölk'] }
    ]
  },
  'yoghurt-med-kokosgranola-och-mango': {
    groups: [
      { title: 'Yoghurt', keywords: ['yoghurt'] },
      { title: 'Topping', keywords: ['mango', 'granola', 'kokos'] }
    ]
  },
  'snickerskaka': {
    groups: [
      {
        title: 'Botten',
        keywords: ['smör', 'agavesirap', 'kakao', 'vanilj', 'mandelmjöl', 'fiberhusk', 'ägg', '1 dl saltade jordnötter']
      },
      {
        title: 'Topping',
        keywords: ['mörk choklad', '2 dl saltade jordnötter', 'jordnötssmör']
      }
    ]
  },
  'kottfarsbiffar-med-champinjonhattar': {
    groups: [
      { title: 'Biffar', keywords: ['vitlök', 'lök', 'nötfärs', 'persilja', 'örtagård', 'salt', 'peppar'] },
      { title: 'Fyllda champinjoner', keywords: ['champinjoner', 'ädelost', 'pekannöt', 'fikon'] },
      { title: 'Pestoröra', keywords: ['creme fraiche', 'majonnäs', 'pesto'] },
      { title: 'Servering', keywords: ['rucola'] }
    ]
  },
  'lovbiff-teriyaki-med-nudelsallad': {
    groups: [
      { title: 'Lövbiff', keywords: ['lövbiff', 'teriyak', 'ingefära', 'sesamolja', 'sesamfrön'] },
      {
        title: 'Nudelsallad',
        keywords: ['nudlar', 'morot', 'salladslök', 'sockerärtor', 'chili', 'ketjap', 'koriander', 'salt', 'peppar']
      },
      { title: 'Chiliyoghurt', keywords: ['yoghurt', 'sriracha', 'vitlök'] }
    ]
  },
  'torskgryta-med-rotfrukter-och-curry': {
    groups: [
      { title: 'Torsk', keywords: ['torsk', 'salt', 'peppar'] },
      {
        title: 'Gryta',
        keywords: ['vitlök', 'fänkål', 'morot', 'palsternacka', 'purjolök', 'olivolja', 'curry', 'buljong', 'vatten', 'havregrädde', 'tomater']
      },
      { title: 'Topping', keywords: ['gräslök'] }
    ]
  },
  'stekt-lax-med-citronmarinerad-broccoli': {
    groups: [
      { title: 'Lax', keywords: ['lax', 'salt', 'peppar'] },
      { title: 'Citronbroccoli', keywords: ['broccoli', 'citron', 'olivolja'] }
    ]
  },
  'laxsallad-med-agg': {
    groups: [
      { title: 'Sallad', keywords: ['lax', 'ägg', 'spenat', 'citron', 'olivolja'] }
    ]
  },
  'kycklinggryta-med-garam-masala': {
    groups: [
      {
        title: 'Gryta',
        keywords: ['kyckling', 'sötpotatis', 'paprika', 'lök', 'vitlök', 'spenat', 'kokosmjölk', 'garam', 'salt', 'peppar', 'olja']
      },
      { title: 'Servering', keywords: ['lime'] }
    ]
  },
  'kycklingbiffar-med-mangosalsa': {
    groups: [
      { title: 'Biffar', keywords: ['kycklingfärs', 'ägg', 'vitlök', 'lök', 'olja', 'salt', 'peppar'] },
      { title: 'Salsa', keywords: ['mango', 'rödlök', 'lime'] },
      { title: 'Tillbehör', keywords: ['spenat'] }
    ]
  },
  'ratatouille-med-quinoa-och-raita': {
    groups: [
      { title: 'Ratatouille', keywords: ['quinoa', 'morot', 'palsternacka', 'lök', 'chili', 'paprika', 'tomater', 'kryddor', 'persilja'] },
      { title: 'Raita', keywords: ['yoghurt', 'morot', 'gurka', 'spiskummin'] },
      { title: 'Servering', keywords: ['solrosfrön'] }
    ]
  },
  'tomatsoppa-med-kanel-och-ingefara': {
    groups: [
      { title: 'Soppa', keywords: ['tomater', 'lök', 'vitlök', 'ingefära', 'kanel', 'paprika', 'buljong'] },
      { title: 'Servering', keywords: ['spenat'] }
    ]
  },
  'yoghurt-med-kokosgranola': {
    groups: [
      { title: 'Yoghurt', keywords: ['yoghurt'] },
      { title: 'Topping', keywords: ['kokosgranola'] }
    ]
  },
  'kokosgranola': {
    groups: [
      { title: 'Granola', keywords: ['havregryn', 'kokoschips', 'kokosflingor', 'solrosfrön', 'pumpafrön', 'mandlar', 'olja', 'sirap', 'salt'] }
    ]
  },
  'ostmacka-med-paprika': {
    groups: [
      { title: 'Macka', keywords: ['bröd', 'smör', 'ost'] },
      { title: 'Topping', keywords: ['paprika'] }
    ]
  },
  'citronvatten-och-svart-kaffe-te': {
    groups: [
      { title: 'Dryck', keywords: ['citronvatten', 'kaffe', 'te'] }
    ]
  },
  'aggrora-med-lax': {
    groups: [
      { title: 'Äggröra', keywords: ['ägg', 'grädde', 'smör', 'salt', 'peppar'] },
      { title: 'Topping', keywords: ['rökt lax'] }
    ]
  },
  'blabarssmoothie': {
    groups: [
      { title: 'Smoothie', keywords: ['blåbär', 'banan', 'mandelmjölk'] }
    ]
  },
  'mangosmoothie-med-spenat': {
    groups: [
      { title: 'Smoothie', keywords: ['mango', 'spenat', 'banan', 'mandelmjölk'] }
    ]
  },
  'agghack-med-skinka-och-sallad': {
    groups: [
      { title: 'Ägghack', keywords: ['ägg', 'majonnäs', 'salt', 'peppar'] },
      { title: 'Topping', keywords: ['skinka', 'sallad', 'tomat', 'gräslök'] }
    ]
  },
  'havregrynsgrot-med-ananas': {
    groups: [
      { title: 'Gröt', keywords: ['havregryn', 'vatten', 'salt'] },
      { title: 'Topping', keywords: ['kokosskivor', 'ananas', 'havremjölk'] }
    ]
  },
  'bananplattar-med-keso-och-hallon': {
    groups: [
      { title: 'Plättar', keywords: ['banan', 'ägg', 'smör', 'vaniljpulver'] },
      { title: 'Servering', keywords: ['keso', 'hallon'] }
    ]
  },
  'spenat-och-gronkal-med-agg': {
    groups: [
      { title: 'Spenatmix', keywords: ['spenat', 'grönkål', 'schalottenlök', 'vitlök', 'champinjoner', 'smör'] },
      { title: 'Topping', keywords: ['ägg', 'ost'] }
    ]
  },
  'kottfarsfylld-squash': {
    groups: [
      { title: 'Fyllning', keywords: ['squash', 'vitlök', 'rödlök', 'paprika', 'färs', 'olivolja', 'krydda', 'persilja', 'fetaost'] },
      { title: 'Topping', keywords: ['pistagenötter', 'granatäppel', 'persilja'] }
    ]
  },
  'glutenfri-kladdkaka-med-lakrits-och-hallon': {
    groups: [
      { title: 'Smet', keywords: ['smör', 'choklad', 'ägg', 'sukrin', 'mandelmjöl', 'bakpulver'] },
      { title: 'Topping', keywords: ['lakrits', 'hallon'] }
    ]
  },
  'papayabatar': {
    groups: [
      { title: 'Frukt', keywords: ['papaya', 'hallon', 'blåbär', 'mango', 'choklad', 'kokos'] }
    ]
  },
  'havregrynsgrot-med-apple-och-kanel': {
    groups: [
      { title: 'Gröt', keywords: ['havregryn', 'vatten', 'salt'] },
      { title: 'Topping', keywords: ['äpple', 'kanel', 'solrosfrön', 'mandelmjölk'] }
    ]
  },
  'havregrynsgrot-med-valnotter-och-bar': {
    groups: [
      { title: 'Gröt', keywords: ['havregryn', 'vatten', 'salt'] },
      { title: 'Topping', keywords: ['valnötter', 'blåbär', 'granatäppel', 'mandelmjölk'] }
    ]
  },
  'sotpotatisgryta-med-bonor': {
    groups: [
      { title: 'Gryta', keywords: ['vitlök', 'lök', 'sötpotatis', 'paprika', 'champinjoner', 'squash', 'olivolja', 'kryddor', 'buljong', 'tomater', 'sriracha', 'vatten', 'bönor', 'persilja'] },
      { title: 'Servering', keywords: ['yoghurt'] }
    ]
  },
  'spenatsoppa-med-halloumi-och-solrosfron': {
    groups: [
      { title: 'Soppa', keywords: ['lök', 'vitlök', 'spenat', 'buljong', 'vatten', 'havregrädde', 'salt', 'peppar'] },
      { title: 'Topping', keywords: ['halloumi', 'böngroddar', 'olivolja'] }
    ]
  },
  'vasterbottenpizza-med-skaldjur': {
    groups: [
      { title: 'Botten', keywords: ['ägg', 'fiberhusk', 'bakpulver', 'västerbottenost'] },
      { title: 'Fyllning', keywords: ['arrabiata', 'mozzarella', 'rödlök', 'oregano', 'salt', 'peppar', 'sockerärtor', 'räkor', 'kräftstjärtar', 'dill'] },
      { title: 'Tillbehör', keywords: ['citronklyftor', 'sriracha'] }
    ]
  },
  'apple-med-jordnotskram': {
    groups: [
      { title: 'Äpple', keywords: ['äpple'] },
      { title: 'Jordnötskräm', keywords: ['jordnötssmör', 'kokosgrädde', 'agavesirap', 'jordnötter'] }
    ]
  },
  'indisk-wok-med-sjograsnudlar-och-kyckling': {
    groups: [
      { title: 'Färsbullar', keywords: ['kycklingfärs', 'purjolök', 'vitlök', 'ingefära', 'ketjap', 'sriracha', 'koriander', 'salt', 'peppar'] },
      { title: 'Wok', keywords: ['lök', 'vitlök', 'paprika', 'olivolja', 'korma', 'vatten', 'tomater'] },
      { title: 'Topping', keywords: ['purjolök', 'cashewnötter', 'thaibasilika'] }
    ]
  },
  'lammfarsbiffar-med-grekisk-sallad': {
    groups: [
      { title: 'Biffar', keywords: ['lammfärs', 'rödlök', 'vitlök', 'krydda', 'fetaost', 'soltorkade'] },
      { title: 'Grekisk sallad', keywords: ['paprika', 'tomat', 'gurka', 'oliver', 'olivolja', 'balsamvinäger', 'salladskrydda', 'persilja', 'fetaost', 'pumpakärnor'] },
      { title: 'Tzatziki', keywords: ['yoghurt', 'gurka', 'vitlök', 'olivolja', 'krydda'] }
    ]
  },
  'indisk-wok-med-sjoograsnudlar-och-kyckling': {
    groups: [
      { title: 'Kycklingbullar', keywords: ['kycklingfärs', 'purjolök', 'vitlök', 'ingefära', 'ketjap', 'sriracha', 'koriander', 'salt', 'peppar'] },
      { title: 'Korma-gryta', keywords: ['lök', 'vitlök', 'paprika', 'olivolja', 'korma', 'vatten', 'cocktailtomater'] },
      { title: 'Topping', keywords: ['koriander', 'cashewnötter'] }
    ]
  },
  'keso-med-hallon-och-valnotter': {
    groups: [
      { title: 'Skål', keywords: ['keso', 'hallon', 'valnötter'] }
    ]
  },
  'kycklingfars-med-roda-linser': {
    groups: [
      { title: 'Gryta', keywords: ['rödlök', 'vitlök', 'paprika', 'olivolja', 'linser', 'kycklingfärs', 'krydda', 'buljong', 'vatten', 'persilja'] }
    ]
  },
  'rakost-med-tonfiskrora': {
    groups: [
      { title: 'Tonfiskröra', keywords: ['yoghurt', 'majonäs', 'sweet chili', 'tonfisk', 'rödlök', 'salt', 'peppar'] },
      { title: 'Sallad', keywords: ['sallad', 'morötter', 'selleri', 'broccoli', 'citron', 'paprika', 'sockerärtor', 'cocktailtomater'] }
    ]
  },
  'kycklinggryta-med-rotfrukter-och-plommon': {
    groups: [
      { title: 'Gryta', keywords: ['lök', 'vitlök', 'sötpotatis', 'palsternacka', 'kyckling', 'olivolja', 'krydda', 'vatten', 'buljong', 'lagerblad', 'plommon', 'tomater', 'örter'] }
    ]
  },
  'torskgratang-med-champinjoner': {
    groups: [
      { title: 'Grönsaker', keywords: ['champinjoner', 'champ', 'cocktailtomater', 'tomater', 'squash', 'rödlök', 'vitlök', 'olivolja'] },
      { title: 'Fisk', keywords: ['torskrygg'] },
      { title: 'Topping', keywords: ['sweet chili', 'jalape', 'riven ost', 'persiljekvist'] }
    ]
  },
  'fruktsallad-med-chokladkram': {
    groups: [
      { title: 'Fruktsallad', keywords: ['jordgubb', 'mango', 'kiwi'] },
      { title: 'Chokladkräm', keywords: ['mörk choklad', 'kokosgrädde'] },
      { title: 'Topping', keywords: ['vit choklad'] }
    ]
  },
  'scampi-med-mangosallad': {
    groups: [
      { title: 'Mangoröra', keywords: ['mango', 'paprika', 'salladslök', 'mango chutney', 'grekisk yoghurt', 'koriander'] },
      { title: 'Salladsbas', keywords: ['hjärtsallad'] },
      { title: 'Scampi', keywords: ['scampi', 'olivolja', 'vitlök', 'chili'] },
      { title: 'Topping', keywords: ['lime'] }
    ]
  },
  'kyckling-med-gron-curry': {
    groups: [
      { title: 'Marinad', keywords: ['kycklinglårfilé', 'ketjap', 'vitlök', 'ingefära', 'salt', 'svartpeppar'] },
      { title: 'Gryta', keywords: ['kokosmjölk', 'green curry', 'morot', 'sockerärtor', 'salladslök', 'smör'] },
      { title: 'Topping', keywords: ['cashewnötter', 'koriander'] }
    ]
  },
  'italiensk-pizza-med-skinka': {
    groups: [
      { title: 'Botten', keywords: ['ägg', 'fiberhusk', 'bakpulver', 'riven ost'] },
      { title: 'Topping', keywords: ['tomatsås', 'mozzarella', 'champinjoner', 'oregano', 'skinka', 'rödlök', 'cocktailtomater', 'basilika'] }
    ]
  }
};

function cleanSteps(parts) {
  return parts
    .map((step) =>
      step
        .replace(/^[\d\)\.\s-]+/, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean);
}

function buildInstructionSteps(detail) {
  const raw = Array.isArray(detail.instructions)
    ? detail.instructions.join('\n')
    : typeof detail.instructions === 'string'
    ? detail.instructions
    : detail.content || '';
  if (!raw?.trim()) return [];
  const byLine = cleanSteps(raw.split(/\r?\n+/));
  if (byLine.length > 1) return byLine;
  const byNumber = cleanSteps(raw.split(/(?=\d+[\.\)]\s*)/));
  if (byNumber.length > 1) return byNumber;
  const bySentence = cleanSteps(raw.split(/(?<=[.!?])\s+(?=[A-ZÅÄÖ])/));
  if (bySentence.length > 1) return bySentence;
  return cleanSteps([raw]);
}

function assignGroups(ingredients, config) {
  if (!config?.groups) {
    return [
      {
        title: 'Ingredienser',
        items: ingredients
      }
    ];
  }
  const groupBuckets = config.groups.map((group) => ({
    title: group.title,
    keywords: group.keywords ?? [],
    items: []
  }));

  const defaultGroup = { title: 'Övrigt', keywords: [], items: [] };

  ingredients.forEach((ingredient) => {
    const lower = ingredient.toLowerCase();
    const match = groupBuckets.find((group) =>
      group.keywords.some((keyword) => lower.includes(keyword))
    );
    if (match) {
      match.items.push(ingredient);
    } else {
      defaultGroup.items.push(ingredient);
    }
  });

  const result = groupBuckets
    .filter((group) => group.items.length > 0)
    .map((group) => ({ title: group.title, items: group.items }));
  if (defaultGroup.items.length > 0) {
    result.push({ title: defaultGroup.title, items: defaultGroup.items });
  }
  return result.length > 0 ? result : null;
}

async function fetchJson(url) {
  const res = await FETCH(url);
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${url}`);
  }
  return res.json();
}

async function updateRecipe(slug) {
  const config = CONFIG[slug];
  if (!config) {
    throw new Error(`No keyword configuration found for slug "${slug}"`);
  }

  const detail = await fetchJson(`${BASE_URL}/api/recipes/${slug}`);
  const groupedIngredients = assignGroups(detail.ingredients || [], config);
  if (!groupedIngredients) {
    throw new Error(`Unable to assign ingredient groups for ${slug}`);
  }

  const instructionSteps = buildInstructionSteps(detail);
  if (!instructionSteps.length) {
    throw new Error(`Unable to derive instruction steps for ${slug}`);
  }

  const payload = {
    title: detail.title,
    excerpt: detail.excerpt,
    content: detail.content,
    imageUrl: detail.imageUrl,
    imageAlt: detail.imageAlt,
    categories: detail.categories,
    ingredients: detail.ingredients,
    instructions: instructionSteps.join('\n'),
    difficulty: detail.difficulty,
    prepTime: detail.prepTime,
    cookTime: detail.cookTime,
    totalTime: detail.totalTime,
    servings: detail.servings,
    nutrition: detail.nutrition,
    tips: detail.tips,
    tags: detail.tags,
    status: detail.status,
    isPremium: detail.isPremium,
    isFree: detail.isFree,
    imageMobileUrl: detail.imageMobileUrl,
    ingredientsStructured: { groups: groupedIngredients },
    instructionsStructured: { steps: instructionSteps }
  };

  const res = await FETCH(`${BASE_URL}/api/recipes/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Update failed ${res.status}: ${text}`);
  }
  console.log(
    `✅ ${slug}: ${groupedIngredients.length} ingredient groups, ${instructionSteps.length} steps`
  );
}

async function main() {
  const slug = process.env.SLUG;
  if (!slug) {
    throw new Error('Please set SLUG env var to the recipe slug you want to process.');
  }
  await updateRecipe(slug);
}

main().catch((err) => {
  console.error('keyword-structure failed:', err);
  process.exitCode = 1;
});



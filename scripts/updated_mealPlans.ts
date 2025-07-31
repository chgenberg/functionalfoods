export interface MealItem {
  name: string;
  recipeLink?: string;
  note?: string;
}

export interface DayMeals {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack?: MealItem;
  dessert?: MealItem;
}

export interface WeekMealPlan {
  title: string;
  days: Record<string, DayMeals>;
}

// Functional Basics meal plans (updated from DOCX documents)
export const mealPlans: Record<string, WeekMealPlan> = {
  "week1": {
    "title": "Vecka 1: Introduktion till Functional Foods",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketom-sli"
        },
        "lunch": {
          "name": "Tonfisksallad med äpple",
          "recipeLink": "/kunskapsbank/recept/tonfisksallad-med-apple"
        },
        "dinner": {
          "name": "Squashspagetti med köttfärssås",
          "recipeLink": "/kunskapsbank/recept/fixed-recept-squashspagetti-med-kottfarssas"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Het ratatouille",
          "recipeLink": "/kunskapsbank/recept/fixed-recept-het-ratatouille"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Grön juice",
          "recipeLink": "/kunskapsbank/recept/flow-recept-gron-juice"
        },
        "lunch": {
          "name": "Pokébowl med kyckling",
          "recipeLink": ""
        },
        "dinner": {
          "name": "Köttfärsbiffar med stekt blomkål",
          "recipeLink": "/kunskapsbank/recept/fixed-recept-kottfarsbiffar-med-stekt-blomkal"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Het ratatouille",
          "recipeLink": "/kunskapsbank/recept/fixed-recept-het-ratatouille"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg",
          "recipeLink": "/kunskapsbank/recept/havrefrallor-med-morotter-och-aprikoser"
        },
        "lunch": {
          "name": "Köttfärsbiffar med stekt blomkål",
          "recipeLink": "/kunskapsbank/recept/fixed-recept-kottfarsbiffar-med-stekt-blomkal"
        },
        "dinner": {
          "name": "Kycklinggryta med bakad spetskål",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/w-1752508498584"
        },
        "lunch": {
          "name": "Kycklinggryta med bakad spetskål",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal"
        },
        "dinner": {
          "name": "Laxburgare med krämig grönsaksröra",
          "recipeLink": "/kunskapsbank/recept/laxburgare-med-kramig-gronsaksrora"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Ugnsbakad tomat med köttfärs",
          "recipeLink": "/kunskapsbank/recept/forbattrad-extraktion-ugnsbakad-tomat-med-kottfars"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      }
    }
  },
  "week2": {
    "title": "Vecka 2: Bygg starkare vanor",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketom-sli"
        },
        "lunch": {
          "name": "Nudelsoppa med grönsaker",
          "recipeLink": "/kunskapsbank/recept/nudelsoppa-med-gronsaker"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Omelett med champinjoner",
          "recipeLink": "/kunskapsbank/recept/omelett-med-champinjoner"
        },
        "lunch": {
          "name": "Torskrygg med ägghack och sparris",
          "recipeLink": "/kunskapsbank/recept/forbattrad-extraktion-torskrygg-med-agghack-och-sparris"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Morotsjuice",
          "recipeLink": ""
        },
        "lunch": {
          "name": "Torskrygg med ägghack och sparris",
          "recipeLink": "/kunskapsbank/recept/forbattrad-extraktion-torskrygg-med-agghack-och-sparris"
        },
        "dinner": {
          "name": "Turkiska lammfärsspett med raita och sallad",
          "recipeLink": "/kunskapsbank/recept/turkiska-lammfarsspett-med-raita-och-sallad"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Morotsjuice",
          "recipeLink": ""
        },
        "lunch": {
          "name": "Turkiska lammfärsspett med raita och sallad",
          "recipeLink": "/kunskapsbank/recept/turkiska-lammfarsspett-med-raita-och-sallad"
        },
        "dinner": {
          "name": "Kycklingröra med örter och tomat",
          "recipeLink": "/kunskapsbank/recept/kycklingrora-med-orter-och-tomat"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg",
          "recipeLink": "/kunskapsbank/recept/havrefrallor-med-morotter-och-aprikoser"
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål",
          "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Blåbärs smoothiebowl",
          "recipeLink": ""
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål",
          "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter"
        },
        "dinner": {
          "name": "Asiatiska köttbullar med nudelsallad",
          "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Asiatiska köttbullar med nudelsallad",
          "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad"
        },
        "lunch": {
          "name": "Päronsallad med chévreost",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      }
    }
  },
  "week3": {
    "title": "Vecka 3: Att välja rätt kolhydrater",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketom-sli"
        },
        "lunch": {
          "name": "Päronsallad med chévreost",
          "recipeLink": ""
        },
        "dinner": {
          "name": "Kycklingfylld aubergine",
          "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med rökt lax",
          "recipeLink": ""
        },
        "lunch": {
          "name": "Rökt lax med blomkålssallad och citronyoghurt",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Rödbetsjuice",
          "recipeLink": ""
        },
        "lunch": {
          "name": "Vegetarisk currygryta med panéer",
          "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-pan-er"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Rödbetsjuice",
          "recipeLink": ""
        },
        "lunch": {
          "name": "Vegetarisk currygryta med panéer",
          "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-pan-er"
        },
        "dinner": {
          "name": "Kycklinggryta med bakad spetskål",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg",
          "recipeLink": "/kunskapsbank/recept/havrefrallor-med-morotter-och-aprikoser"
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål",
          "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter"
        },
        "dinner": {
          "name": "Högrevsburgare med hummus",
          "recipeLink": ""
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad",
          "recipeLink": "/kunskapsbank/recept/keso-med-granola-och-fruktsallad"
        },
        "lunch": {
          "name": "Högrevsburgare med hummus",
          "recipeLink": ""
        },
        "dinner": {
          "name": "Mandel och citronpaj",
          "recipeLink": "/kunskapsbank/recept/forbattrad-extraktion-mandel-och-citronpaj"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Lax med waldorfsallad",
          "recipeLink": "/kunskapsbank/recept/w-1752509279611"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      }
    }
  },
  "week4": {
    "title": "Vecka 4: Functional Foods Topplista",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Lax med waldorfsallad",
          "recipeLink": "/kunskapsbank/recept/w-1752509279611"
        },
        "lunch": {
          "name": "Grekiska köttbullar i tomatsås med rostad sötpotatis",
          "recipeLink": "/kunskapsbank/recept/forbattrad-extraktion-grekiska-kottbullar-i-tomatsas"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Ägghack med kalkon",
          "recipeLink": "/kunskapsbank/recept/agghack-med-kalkon"
        },
        "lunch": {
          "name": "Kycklinggryta med röda linser",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Laxsallad med vindruvor",
          "recipeLink": "/kunskapsbank/recept/laxsallad-med-vindruvor"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Laxsallad med vindruvor",
          "recipeLink": "/kunskapsbank/recept/laxsallad-med-vindruvor"
        },
        "lunch": {
          "name": "Asiatiska köttbullar med nudelsallad",
          "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Bananplättar med mango och granatäpple",
          "recipeLink": "/kunskapsbank/recept/bananplattar-med-mango-och-granatapple"
        },
        "lunch": {
          "name": "Vegetarisk currygryta med panéer",
          "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-pan-er"
        },
        "dinner": {
          "name": "Grillade köttspett med grekisk sallad och morotstzatziki",
          "recipeLink": "/kunskapsbank/recept/grekisk-sallad"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med hallon och granatäpple",
          "recipeLink": "/kunskapsbank/recept/keso-med-hallon-och-granatapple"
        },
        "lunch": {
          "name": "Grillade köttspett med grekisk sallad och morotstzatziki",
          "recipeLink": "/kunskapsbank/recept/grekisk-sallad"
        },
        "dinner": {
          "name": "Ugnsbakad kyckling med quinoasallad och chilimajjo",
          "recipeLink": ""
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Havregrynsgröt med torkad frukt och äpple",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-torkad-frukt-och-apple"
        },
        "lunch": {
          "name": "Torsk från mellanöstern",
          "recipeLink": "/kunskapsbank/recept/torsk-fran-mellanostern"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      }
    }
  },
  "week5": {
    "title": "Vecka 5: Maximal energi och vitalitet",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketom-sli"
        },
        "lunch": {
          "name": "Japansk kycklingfärswok med groddar (320 kcal",
          "recipeLink": "/kunskapsbank/recept/forbattrad-extraktion-japansk-kycklingfarswok-med-groddar"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med paprika",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-paprika"
        },
        "lunch": {
          "name": "Grekisk sallad med fetaost",
          "recipeLink": "/kunskapsbank/recept/grekisk-sallad"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Chiafrögröt",
          "recipeLink": "/kunskapsbank/recept/chiafrogrot"
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål",
          "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter"
        },
        "dinner": {
          "name": "Köttfärslimpa med ajvar och rostad sötpotatis",
          "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-ajvar-och-rostad-sotpotatis"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Bananplättar med jordgubbar och kokos",
          "recipeLink": "/kunskapsbank/recept/forbattrad-extraktion-bananplattar-med-jordgubbar-och-kokos"
        },
        "lunch": {
          "name": "Köttfärslimpa med ajvar, fetaost och rostad sötpotatis",
          "recipeLink": ""
        },
        "dinner": {
          "name": "Vegetarisk currygryta med panéer",
          "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-pan-er"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Skaldjursgryta med torsk i gul curry",
          "recipeLink": "/kunskapsbank/recept/forbattrad-extraktion-skaldjursgryta-med-torsk-i-gul-curry"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Mangosmoothie med spenat",
          "recipeLink": "/kunskapsbank/recept/forbattrad-extraktion-mangosmoothie-med-spenat"
        },
        "lunch": {
          "name": "Skaldjursgryta med torsk i gul curry",
          "recipeLink": "/kunskapsbank/recept/forbattrad-extraktion-skaldjursgryta-med-torsk-i-gul-curry"
        },
        "dinner": {
          "name": "Kycklingjärpar med linssallad",
          "recipeLink": "/kunskapsbank/recept/final-extraktion-kycklingjarpar-med-linssallad"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Kycklingjärpar med linssallad",
          "recipeLink": "/kunskapsbank/recept/final-extraktion-kycklingjarpar-med-linssallad"
        },
        "lunch": {
          "name": "Laxfilé med ratatouille",
          "recipeLink": "/kunskapsbank/recept/laxfil-med-ratatouille"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      }
    }
  },
  "week6": {
    "title": "Vecka 6: Integration och framtiden",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg",
          "recipeLink": "/kunskapsbank/recept/havrefrallor-med-morotter-och-aprikoser"
        },
        "lunch": {
          "name": "Grönsakswok med kyckling",
          "recipeLink": "/kunskapsbank/recept/w-1752509311269"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Kokt ägg med majonnäs",
          "recipeLink": "/kunskapsbank/recept/kokt-agg-med-majonnas"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Mango med keso och nötter",
          "recipeLink": "/kunskapsbank/recept/mango-med-keso-och-notter"
        },
        "lunch": {
          "name": "Indisk laxgryta med röda linser",
          "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-med-roda-linser"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Äggröra med granatäpple och kiwi",
          "recipeLink": "/kunskapsbank/recept/w-1752509305366"
        },
        "lunch": {
          "name": "Indisk laxgryta med röda linser",
          "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-med-roda-linser"
        },
        "dinner": {
          "name": "Quinoasallad med stekt halloumi",
          "recipeLink": "/kunskapsbank/recept/quinoasallad-med-stekt-halloumi"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Torsk teriyaki med grönsaker",
          "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Torsk teriyaki med grönsaker",
          "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker"
        },
        "lunch": {
          "name": "Lammgryta med plommon och bulgur",
          "recipeLink": "/kunskapsbank/recept/lammgryta-med-plommon-och-bulgur"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Lammgryta plommon och bulgur",
          "recipeLink": ""
        },
        "lunch": {
          "name": "Kycklinggryta med bakad spetskål",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      }
    }
  }
};

// Functional Flow meal plans (updated from DOCX documents)
export const flowMealPlans: Record<string, WeekMealPlan> = {
  "week1": {
    "title": "Vecka 1: Avancerad grund i Functional Foods",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Färskostmacka med tomat",
          "recipeLink": "/kunskapsbank/recept/flow-recept-farskostmacka-med-tomat"
        },
        "lunch": {
          "name": "Linssoppa från medelhavet",
          "recipeLink": "/kunskapsbank/recept/linssoppa-fran-medelhavet"
        },
        "dinner": {
          "name": "Kycklingburgare med papayasallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-kycklingburgare-med-papayasallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med asiatisk avokadosallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-aggrora-med-asiatisk-avokadosallad"
        },
        "lunch": {
          "name": "Kycklingburgare med papayasallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-kycklingburgare-med-papayasallad"
        },
        "dinner": {
          "name": "Köttfärsbiffar med tomatsallad",
          "recipeLink": ""
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Köttfärsbiffar med tomatsallad",
          "recipeLink": ""
        },
        "lunch": {
          "name": "Laxgratäng med scampi och broccoli",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Keso med bovetegranola",
          "recipeLink": "/kunskapsbank/recept/flow-recept-keso-med-bovetegranola"
        },
        "lunch": {
          "name": "Laxgratäng med scampi och broccoli",
          "recipeLink": ""
        },
        "dinner": {
          "name": "Kycklinggryta från medelhavet",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Fänkålssallad med grapefrukt och burrata",
          "recipeLink": "/kunskapsbank/recept/fankalssallad-med-grapefrukt-och-burrata"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Ugnsomelett med bär",
          "recipeLink": "/kunskapsbank/recept/omelett-med-bar"
        },
        "lunch": {
          "name": "Entrecote med haricot verts och bearnaisesås",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "",
          "recipeLink": ""
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      }
    }
  },
  "week2": {
    "title": "Vecka 2: Bygg avancerade vanor",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "",
          "recipeLink": ""
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Ägghack i salladsblad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-agghack-i-salladsblad"
        },
        "lunch": {
          "name": "Lax med rödbetssallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-lax-med-rodbetssallad"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Overnight oats med morot",
          "recipeLink": ""
        },
        "lunch": {
          "name": "Kycklingpizza",
          "recipeLink": "/kunskapsbank/recept/flow-recept-kycklingpizza"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola och frukt",
          "recipeLink": "/kunskapsbank/recept/flow-recept-yoghurt-med-bovetegranola-och-frukt"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Stekt ägg med champinjoner",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-stekt-agg-med-champinjoner"
        },
        "lunch": {
          "name": "Fisktaco med mangosalsa och sesamsås",
          "recipeLink": "/kunskapsbank/recept/flow-recept-fisktaco-med-mangosalsa-och-sesamsas"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Smoothiebowl med mango och pistagenötter",
          "recipeLink": "/kunskapsbank/recept/flow-recept-smoothiebowl-med-mango-och-pistagenotter"
        },
        "lunch": {
          "name": "Fisktaco med mangosalsa och sesamsås",
          "recipeLink": "/kunskapsbank/recept/flow-recept-fisktaco-med-mangosalsa-och-sesamsas"
        },
        "dinner": {
          "name": "Zucchinikaka med kardemumma",
          "recipeLink": "/kunskapsbank/recept/flow-recept-zucchinikaka-med-kardemumma"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Grön juice",
          "recipeLink": "/kunskapsbank/recept/flow-recept-gron-juice"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      }
    }
  },
  "week3": {
    "title": "Vecka 3: Flexibilitet & Fasta",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Grön juice",
          "recipeLink": "/kunskapsbank/recept/flow-recept-gron-juice"
        },
        "lunch": {
          "name": "Färgstark fetaostsallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-fargstark-fetaostsallad"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Bananmuffin",
          "recipeLink": "/kunskapsbank/recept/flow-recept-bananmuffin"
        },
        "lunch": {
          "name": "Nötfärstimbaler med chévreost och soltorkad tomat",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Laxsallad med fetaost",
          "recipeLink": "/kunskapsbank/recept/flow-recept-laxsallad-med-fetaost"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Keso med bovetegranola och frukt",
          "recipeLink": "/kunskapsbank/recept/flow-recept-keso-med-bovetegranola-och-frukt"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Chiapudding med jordgubbar och hallon",
          "recipeLink": "/kunskapsbank/recept/flow-recept-chiapudding-med-jordgubbar-och-hallon"
        },
        "lunch": {
          "name": "Torsk med guacamole och sötpotatis",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-torsk-med-guacamole-och-sotpotatis"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Biff med nudelsallad och jordnötssås",
          "recipeLink": "/kunskapsbank/recept/flow-recept-biff-med-nudelsallad-och-jordnotssas"
        },
        "lunch": {
          "name": "Chokladbar med majskakor",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Omelettrulle",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-omelettrulle"
        },
        "lunch": {
          "name": "Morotssoppa med ingefära och rostade kikärtor",
          "recipeLink": "/kunskapsbank/recept/flow-recept-morotssoppa-med-ingefara-och-rostade-kikartor"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      }
    }
  },
  "week4": {
    "title": "Vecka 4: Maximal näringsabsorption",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Morotssoppa med ingefära och rostade kikärtor",
          "recipeLink": "/kunskapsbank/recept/flow-recept-morotssoppa-med-ingefara-och-rostade-kikartor"
        },
        "lunch": {
          "name": "Grönsakswok med kycklingfärs",
          "recipeLink": "/kunskapsbank/recept/flow-recept-gronsakswok-med-kycklingfars"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola",
          "recipeLink": "/kunskapsbank/recept/flow-recept-yoghurt-med-bovetegranola"
        },
        "lunch": {
          "name": "Grönsakswok med kycklingfärs",
          "recipeLink": "/kunskapsbank/recept/flow-recept-gronsakswok-med-kycklingfars"
        },
        "dinner": {
          "name": "Ugnsbakad blomkål med ratatouille",
          "recipeLink": "/kunskapsbank/recept/flow-recept-ugnsbakad-blomkal-med-ratatouille"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Lövbiffsrullader med brie, pesto och rödbetor",
          "recipeLink": ""
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Äggröra med fetaost och spenat",
          "recipeLink": "/kunskapsbank/recept/flow-recept-aggrora-med-fetaost-och-spenat"
        },
        "lunch": {
          "name": "Torsk med saffranssås",
          "recipeLink": "/kunskapsbank/recept/flow-recept-torsk-med-saffranssas"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Bananmuffin",
          "recipeLink": "/kunskapsbank/recept/flow-recept-bananmuffin"
        },
        "lunch": {
          "name": "Kycklingrullader med gorgonzola",
          "recipeLink": "/kunskapsbank/recept/flow-recept-kycklingrullader-med-gorgonzola"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Omelett med keso och bär",
          "recipeLink": "/kunskapsbank/recept/flow-recept-omelett-med-keso-och-bar"
        },
        "lunch": {
          "name": "Valnötslax med fetaostcrème",
          "recipeLink": ""
        },
        "dinner": {
          "name": "Stekta äpplen med vit chokladkräm",
          "recipeLink": "/kunskapsbank/recept/flow-recept-stekta-applen-med-vit-chokladkram"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Valnötslax med fetaostcrème",
          "recipeLink": ""
        },
        "lunch": {
          "name": "Zucchiniplättar med yoghurtsås",
          "recipeLink": "/kunskapsbank/recept/flow-recept-zucchiniplattar-med-yoghurtsas"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      }
    }
  },
  "week5": {
    "title": "Vecka 5: Avancerad optimering",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Zucchiniplättar med yoghurtsås",
          "recipeLink": "/kunskapsbank/recept/flow-recept-zucchiniplattar-med-yoghurtsas"
        },
        "lunch": {
          "name": "Köttfärslimpa med tomat",
          "recipeLink": "/kunskapsbank/recept/flow-recept-kottfarslimpa-med-tomat"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Linssoppa från medelhavet",
          "recipeLink": "/kunskapsbank/recept/linssoppa-fran-medelhavet"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Yoghurt med mango och apelsin",
          "recipeLink": "/kunskapsbank/recept/flow-recept-yoghurt-med-mango-och-apelsin"
        },
        "lunch": {
          "name": "Pestotorsk med capresesallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-pestotorsk-med-capresesallad"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Stekt ägg med parmaskinka",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-stekt-agg-med-parmaskinka"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Bananmuffin",
          "recipeLink": "/kunskapsbank/recept/flow-recept-bananmuffin"
        },
        "lunch": {
          "name": "Nötgryta med rotfrukter",
          "recipeLink": "/kunskapsbank/recept/flow-recept-notgryta-med-rotfrukter"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Äggröra med champinjoner",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-aggrora-med-champinjoner"
        },
        "lunch": {
          "name": "Gino",
          "recipeLink": "/kunskapsbank/recept/flow-recept-gino"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Grönkålspaj med champinjoner",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-gronkalspaj-med-champinjoner"
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      }
    }
  },
  "week6": {
    "title": "Vecka 6: Mastery och framtiden",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "",
          "recipeLink": ""
        },
        "lunch": {
          "name": "",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Kokta ägg med kaviar",
          "recipeLink": ""
        },
        "lunch": {
          "name": "Stekt torsk med bearnaisesås och haricot verts",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-stekt-torsk-med-bearnaisesas-och-haricot-verts"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola och bär",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-yoghurt-med-bovetegranola-och-bar"
        },
        "lunch": {
          "name": "Stekt torsk med bearnaisesås och haricot verts",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-stekt-torsk-med-bearnaisesas-och-haricot-verts"
        },
        "dinner": {
          "name": "Kycklingfärsbiffar med vitlöksost",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-kycklingfarsbiffar-med-vitloksost"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Varm chiagröt med äpple",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-varm-chiagrot-med-apple"
        },
        "lunch": {
          "name": "Varma grönsaker med halloumi",
          "recipeLink": "/kunskapsbank/recept/flow-recept-varma-gronsaker-med-halloumi"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Ägghack med kallrökt lax",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-agghack-med-kallrokt-lax"
        },
        "lunch": {
          "name": "Varma grönsaker med halloumi",
          "recipeLink": "/kunskapsbank/recept/flow-recept-varma-gronsaker-med-halloumi"
        },
        "dinner": {
          "name": "Lax med quinoasallad och grapefrukt",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-lax-med-quinoasallad-och-grapefrukt"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Lax med quinoasallad och grapefrukt",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-lax-med-quinoasallad-och-grapefrukt"
        },
        "lunch": {
          "name": "Hamburgare med grekisk sallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-hamburgare-med-grekisk-sallad"
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Hamburgare med grekisk sallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-hamburgare-med-grekisk-sallad"
        },
        "lunch": {
          "name": "Asiatisk köttfärswok med grönkål",
          "recipeLink": ""
        },
        "dinner": {
          "name": "",
          "recipeLink": ""
        }
      }
    }
  }
};

// Helper function to get meal plan for a specific day in a week
export function getMealPlan(weekNumber: number, dayInWeek: number): DayMeals | null {
  const weekPlan = mealPlans[`week${weekNumber}`];
  if (!weekPlan) return null;
  
  const weekDays = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
  const dayName = weekDays[dayInWeek - 1];
  
  return weekPlan.days[dayName] || null;
}

// Helper function to get week data for Functional Basics
export function getWeekData(weekNumber: number): WeekMealPlan | null {
  const weekKey = `week${weekNumber}` as keyof typeof mealPlans;
  return mealPlans[weekKey] || null;
}

// Helper function to get week data for Functional Flow
export function getFlowWeekData(weekNumber: number): WeekMealPlan | null {
  const weekKey = `week${weekNumber}` as keyof typeof flowMealPlans;
  return flowMealPlans[weekKey] || null;
}
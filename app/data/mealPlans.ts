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

// Functional Basics meal plans (synced from DOCX documents)
export const mealPlans: Record<string, WeekMealPlan> = {
  "week1": {
    "title": "Vecka 1: Synkroniserad från DOCX",
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
          "recipeLink": "/kunskapsbank/recept/squashspagetti-med-kottfarssas"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Stekt ägg med lax",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-med-lax"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Squashspagetti med köttfärssås (Rester)"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Grön juice",
          "recipeLink": "/kunskapsbank/recept/gron-juice"
        },
        "lunch": {
          "name": "Pokébowl med kyckling",
          "recipeLink": "/kunskapsbank/recept/pokebowl-med-kyckling"
        },
        "dinner": {
          "name": "Köttfärsbiffar med stekt blomkål",
          "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-stekt-blomkal"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Omelett med tomat",
          "recipeLink": "/kunskapsbank/recept/omelett-med-tomat"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Het ratatouille",
          "recipeLink": "/kunskapsbank/recept/het-ratatouille"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg",
          "recipeLink": "/kunskapsbank/recept/1-havrefrallor-med-morotter-och-aprikoser-valfritt-palagg"
        },
        "lunch": {
          "name": "Köttfärsbiffar med stekt blomkål",
          "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-stekt-blomkal"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "16:8"
        },
        "lunch": {
          "name": "Tropisk smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/tropisk-smoothiebowl"
        },
        "dinner": {
          "name": "Kycklinggryta med bakad spetskål",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal-1"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl (Rester)"
        },
        "lunch": {
          "name": "Laxburgare med krämig grönsaksröra (Rester)"
        },
        "dinner": {
          "name": "Ugnsbakad tomat med köttfärs",
          "recipeLink": "/kunskapsbank/recept/ugnsbakad-tomat-med-kottfars"
        }
      }
    }
  },
  "week2": {
    "title": "Vecka 2: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketom-sli"
        },
        "lunch": {
          "name": "Ugnsbakad tomat med köttfärs (Rester)"
        },
        "dinner": {
          "name": "Nudelsoppa med grönsaker",
          "recipeLink": "/kunskapsbank/recept/nudelsoppa-med-gronsaker"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Omelett med champinjoner",
          "recipeLink": "/kunskapsbank/recept/omelett-med-champinjoner"
        },
        "lunch": {
          "name": "Nudelsoppa med grönsaker (Rester)"
        },
        "dinner": {
          "name": "Torskrygg med ägghack och sparris",
          "recipeLink": "/kunskapsbank/recept/torskrygg-med-agghack-och-sparris"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Morotsjuice",
          "recipeLink": "/kunskapsbank/recept/morotsjuice"
        },
        "lunch": {
          "name": "Torskrygg med ägghack och sparris",
          "recipeLink": "/kunskapsbank/recept/torskrygg-med-agghack-och-sparris"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Morotsjuice",
          "recipeLink": "/kunskapsbank/recept/morotsjuice"
        },
        "lunch": {
          "name": "Turkiska lammfärsspett med raita och sallad",
          "recipeLink": "/kunskapsbank/recept/turkiska-lammfarsspett-med-raita-och-sallad"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg",
          "recipeLink": "/kunskapsbank/recept/1-havrefrallor-med-morotter-och-aprikoser-valfritt-palagg"
        },
        "lunch": {
          "name": "Kycklingröra med örter och tomat (Rester)"
        },
        "dinner": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål",
          "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter-och-brysselkal"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Blåbärs smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/blabars-smoothiebowl"
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål",
          "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter-och-brysselkal"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Blåbärs smoothiebowl (Rester)"
        },
        "lunch": {
          "name": "Asiatiska köttbullar med nudelsallad",
          "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad"
        },
        "dinner": {
          "name": "(Rester)"
        }
      }
    }
  },
  "week3": {
    "title": "Vecka 3: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketom-sli"
        },
        "lunch": {
          "name": "Päronsallad med chévreost",
          "recipeLink": "/kunskapsbank/recept/paronsallad-med-chevreost"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med rökt lax",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-rokt-lax"
        },
        "lunch": {
          "name": "Kycklingfylld aubergine (Rester)"
        },
        "dinner": {
          "name": "Rökt lax med blomkålssallad och citronyoghurt",
          "recipeLink": "/kunskapsbank/recept/rokt-lax-med-blomkalsallad-och-citronyoghurt"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Rödbetsjuice",
          "recipeLink": "/kunskapsbank/recept/rodbetsjuice"
        },
        "lunch": {
          "name": "Rökt lax med blomkålssallad och citronyoghurt (Rester)"
        },
        "dinner": {
          "name": "Vegetarisk currygryta med panéer",
          "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-pan-er"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Rödbetsjuice",
          "recipeLink": "/kunskapsbank/recept/rodbetsjuice"
        },
        "lunch": {
          "name": "(Rester)"
        },
        "dinner": {
          "name": "Vegetarisk currygryta med panéer",
          "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-pan-er"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg",
          "recipeLink": "/kunskapsbank/recept/1-havrefrallor-med-morotter-och-aprikoser-valfritt-palagg"
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål",
          "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter-och-brysselkal"
        },
        "dinner": {
          "name": "(Rester) från frysen"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad",
          "recipeLink": "/kunskapsbank/recept/keso-med-granola-och-fruktsallad"
        },
        "lunch": {
          "name": "Högrevsburgare med hummus",
          "recipeLink": "/kunskapsbank/recept/hogrevsburgare-med-hummus"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Omelett med hallon",
          "recipeLink": "/kunskapsbank/recept/omelett-med-hallon"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Ugnsbakad kyckling med tzatziki och sallad",
          "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad"
        }
      }
    }
  },
  "week4": {
    "title": "Vecka 4: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Omelett med bär",
          "recipeLink": "/kunskapsbank/recept/omelett-med-bar"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Lax med waldorfsallad",
          "recipeLink": "/kunskapsbank/recept/lax-med-waldorfsallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Ägghack med kalkon",
          "recipeLink": "/kunskapsbank/recept/agghack-med-kalkon"
        },
        "lunch": {
          "name": "Grekiska köttbullar i tomatsås med rostad sötpotatis (Rester)"
        },
        "dinner": {
          "name": "Kycklinggryta med röda linser",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser-1"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Fruktsmoothie",
          "recipeLink": "/kunskapsbank/recept/fruktsmoothie"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Kycklinggryta med röda linser (Rester)"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Fruktsmoothie",
          "recipeLink": "/kunskapsbank/recept/fruktsmoothie"
        },
        "lunch": {
          "name": "(Rester)"
        },
        "dinner": {
          "name": "Laxsallad med vindruvor",
          "recipeLink": "/kunskapsbank/recept/laxsallad-med-vindruvor"
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
          "name": "(Rester) från frysen"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med hallon och granatäpple",
          "recipeLink": "/kunskapsbank/recept/keso-med-hallon-och-granatapple"
        },
        "lunch": {
          "name": "Grillade köttspett med grekisk sallad och morotstzatziki",
          "recipeLink": "/kunskapsbank/recept/grillade-kottspett-med-grekisk-sallad-och-morotstzatziki"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Havregrynsgröt med torkad frukt och äpple",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-torkad-frukt-och-apple"
        },
        "lunch": {
          "name": "Ugnsbakad kyckling med tzatziki och sallad",
          "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad"
        },
        "dinner": {
          "name": "(Rester)"
        }
      }
    }
  },
  "week5": {
    "title": "Vecka 5: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketom-sli"
        },
        "lunch": {
          "name": "Torsk från mellanöstern (Rester)"
        },
        "dinner": {
          "name": "Japansk kycklingfärswok med groddar (320 kcal"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med paprika",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-paprika-1"
        },
        "lunch": {
          "name": "Japansk kycklingfärswok med groddar (320 kcal (Rester)"
        },
        "dinner": {
          "name": "Grekisk sallad med fetaost",
          "recipeLink": "/kunskapsbank/recept/grekisk-sallad-med-fetaost"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Chiafrögröt",
          "recipeLink": "/kunskapsbank/recept/chiafrogrot"
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål",
          "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter-och-brysselkal"
        },
        "dinner": {
          "name": "(Rester) från fysen"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Bananplättar med jordgubbar och kokos",
          "recipeLink": "/kunskapsbank/recept/bananplattar-med-jordgubbar-och-kokos"
        },
        "lunch": {
          "name": "Köttfärslimpa med ajvar, fetaost och rostad sötpotatis",
          "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-ajvar-fetaost-och-rostad-sotpotatis"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Bananplättar med jordgubbar och kokos (Rester)"
        },
        "lunch": {
          "name": "Kycklinggryta med röda linser (Rester) från frysen"
        },
        "dinner": {
          "name": "Skaldjursgryta med torsk i gul curry",
          "recipeLink": "/kunskapsbank/recept/skaldjursgryta-med-torsk-i-gul-curry"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Mangosmoothie med spenat",
          "recipeLink": "/kunskapsbank/recept/mangosmoothie-med-spenat"
        },
        "lunch": {
          "name": "Skaldjursgryta med torsk i gul curry",
          "recipeLink": "/kunskapsbank/recept/skaldjursgryta-med-torsk-i-gul-curry"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Mangosmoothie med spenat (Rester)"
        },
        "lunch": {
          "name": "Kycklingjärpar med linssallad",
          "recipeLink": "/kunskapsbank/recept/kycklingjarpar-med-linssallad"
        },
        "dinner": {
          "name": "(Rester)"
        }
      }
    }
  },
  "week6": {
    "title": "Vecka 6: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg",
          "recipeLink": "/kunskapsbank/recept/1-havrefrallor-med-morotter-och-aprikoser-valfritt-palagg"
        },
        "lunch": {
          "name": "Laxfilé med ratatouille (Rester)"
        },
        "dinner": {
          "name": "Grönsakswok med kyckling",
          "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kyckling"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Kokt ägg med majonnäs",
          "recipeLink": "/kunskapsbank/recept/kokt-agg-med-majonnas"
        },
        "lunch": {
          "name": "Grönsakswok med kyckling (Rester)"
        },
        "dinner": {
          "name": "Köttfärspytt med italienska smaker",
          "recipeLink": "/kunskapsbank/recept/kottfarspytt-med-italienska-smaker"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Mango med keso och nötter",
          "recipeLink": "/kunskapsbank/recept/mango-med-keso-och-notter"
        },
        "lunch": {
          "name": "Köttfärspytt med italienska smaker",
          "recipeLink": "/kunskapsbank/recept/kottfarspytt-med-italienska-smaker"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Äggröra med granatäpple och kiwi",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-granatapple-och-kiwi"
        },
        "lunch": {
          "name": "Indisk laxgryta med röda linser",
          "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-med-roda-linser-1"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Havregrynsgröt med apelsin och kokos",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-apelsin-och-kokos"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Quinoasallad med stekt halloumi (Rester)"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Hallon- och blåbärssmoothie",
          "recipeLink": "/kunskapsbank/recept/hallon-och-blabarssmoothie"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Torsk teriyaki med grönsaker",
          "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Hallon- och blåbärssmoothie",
          "recipeLink": "/kunskapsbank/recept/hallon-och-blabarssmoothie"
        },
        "lunch": {
          "name": "(Rester)"
        },
        "dinner": {
          "name": "Lammgryta plommon och bulgur",
          "recipeLink": "/kunskapsbank/recept/lammgryta-plommon-och-bulgur"
        }
      }
    }
  }
};

// Functional Flow meal plans (synced from Flow DOCX documents)
export const flowMealPlans: Record<string, WeekMealPlan> = {
  "week1": {
    "title": "Vecka 1: Flow synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Färskostmacka med tomat",
          "recipeLink": "/kunskapsbank/recept/farskostmacka-med-tomat"
        },
        "lunch": {
          "name": "Linssoppa från medelhavet",
          "recipeLink": "/kunskapsbank/recept/linssoppa-fran-medelhavet-1"
        },
        "dinner": {
          "name": "Kycklingburgare med papayasallad",
          "recipeLink": "/kunskapsbank/recept/kycklingburgare-med-papayasallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med asiatisk avokadosallad",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-asiatisk-avokadosallad"
        },
        "lunch": {
          "name": "Kycklingburgare med papayasallad",
          "recipeLink": "/kunskapsbank/recept/kycklingburgare-med-papayasallad"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Choklad- och kokoschiapudding",
          "recipeLink": "/kunskapsbank/recept/choklad-och-kokoschiapudding"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Köttfärsbiffar med tomatsallad",
          "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-tomatsallad"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Keso med bovetegranola",
          "recipeLink": "/kunskapsbank/recept/keso-med-bovetegranola"
        },
        "lunch": {
          "name": "Laxgratäng med scampi och broccoli",
          "recipeLink": "/kunskapsbank/recept/laxgratang-med-scampi-och-broccoli"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Omelett med ost och spenat",
          "recipeLink": "/kunskapsbank/recept/omelett-med-ost-och-spenat-1"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Kycklinggryta från medelhavet (Rester)"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Ugnsomelett med bär",
          "recipeLink": "/kunskapsbank/recept/ugnsomelett-med-bar"
        },
        "lunch": {
          "name": "Fänkålssallad med grapefrukt och burrata (Rester)"
        },
        "dinner": {
          "name": "Entrecote med haricot verts och bearnaisesås",
          "recipeLink": "/kunskapsbank/recept/entrecote-med-haricots-verts-och-bearnaisesas"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Ugnsomelett med bär",
          "recipeLink": "/kunskapsbank/recept/ugnsomelett-med-bar"
        },
        "lunch": {
          "name": "(Rester)"
        },
        "dinner": {
          "name": "Entrecote med haricot verts och bearnaisesås (Rester)"
        }
      }
    }
  },
  "week2": {
    "title": "Vecka 2: Flow synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Macka med ost",
          "recipeLink": "/kunskapsbank/recept/macka-med-ost"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Grönsakswok med tonfisk och ägg",
          "recipeLink": "/kunskapsbank/recept/gronsakswok-med-tonfisk-och-agg"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Ägghack i salladsblad",
          "recipeLink": "/kunskapsbank/recept/agghack-i-salladsblad"
        },
        "lunch": {
          "name": "Lövbiffsgryta med champinjoner och grönsaksspagetti",
          "recipeLink": "/kunskapsbank/recept/lovbiffsgryta-med-champinjoner-och-gronsaksspagetti"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Overnight oats med morot",
          "recipeLink": "/kunskapsbank/recept/overnightoats-med-morot"
        },
        "lunch": {
          "name": "Lax med rödbetssallad (Rester)"
        },
        "dinner": {
          "name": "Kycklingpizza",
          "recipeLink": "/kunskapsbank/recept/kycklingpizza"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola och frukt",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola-och-frukt"
        },
        "lunch": {
          "name": "Kycklingpizza (Rester)"
        },
        "dinner": {
          "name": "Spenatsoppa med rostade pumpafrön",
          "recipeLink": "/kunskapsbank/recept/spenatsoppa-med-rostade-pumpafron"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Stekt ägg med champinjoner",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-med-champinjoner"
        },
        "lunch": {
          "name": "Spenatsoppa rostade pumpafrön (Rester)"
        },
        "dinner": {
          "name": "Fisktaco med mangosalsa och sesamsås",
          "recipeLink": "/kunskapsbank/recept/fisktaco-med-mangosalsa-och-sesamsas"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Smoothiebowl med mango och pistagenötter",
          "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-mango-och-pistagenotter"
        },
        "lunch": {
          "name": "Fisktaco med mangosalsa och sesamsås",
          "recipeLink": "/kunskapsbank/recept/fisktaco-med-mangosalsa-och-sesamsas"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Grön juice",
          "recipeLink": "/kunskapsbank/recept/gron-juice"
        },
        "lunch": {
          "name": "Ajvarspett med grekisk sallad och tzatziki",
          "recipeLink": "/kunskapsbank/recept/ajvarspett-med-grekisk-sallad-och-tzatziki"
        },
        "dinner": {
          "name": "(Rester)"
        }
      }
    }
  },
  "week3": {
    "title": "Vecka 3: Flow synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Grön juice",
          "recipeLink": "/kunskapsbank/recept/gron-juice"
        },
        "lunch": {
          "name": "(Rester)"
        },
        "dinner": {
          "name": "Kycklinggryta från medelhavet (Rester) från frysen"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Bananmuffin",
          "recipeLink": "/kunskapsbank/recept/bananmuffin"
        },
        "lunch": {
          "name": "Färgstark fetaostsallad (Rester)"
        },
        "dinner": {
          "name": "Nötfärstimbaler med chévreost och soltorkad tomat",
          "recipeLink": "/kunskapsbank/recept/notfarstimbaler-med-chevreost-och-soltorkad-tomat"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Kokt ägg med kaviar",
          "recipeLink": "/kunskapsbank/recept/kokt-agg-med-kaviar"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Nötfärstimbaler med chévreost och soltorkad tomat (Rester)"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Keso med bovetegranola och frukt",
          "recipeLink": "/kunskapsbank/recept/keso-med-bovetegranola-och-frukt"
        },
        "lunch": {
          "name": "Laxsallad med fetaost (Rester)"
        },
        "dinner": {
          "name": "Spenatsoppa rostade pumpafrön (Rester) från frysen"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Chiapudding med jordgubbar och hallon",
          "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbar-och-hallon"
        },
        "lunch": {
          "name": "Kycklingpizza (Rester) från frysen"
        },
        "dinner": {
          "name": "Torsk med guacamole och sötpotatis",
          "recipeLink": "/kunskapsbank/recept/torsk-med-guacamole-och-sotpotatis"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Chiapudding med jordgubbar och hallon (Rester)"
        },
        "lunch": {
          "name": "Torsk med guacamole och sötpotatis (Rester)"
        },
        "dinner": {
          "name": "Biff med nudelsallad och jordnötssås",
          "recipeLink": "/kunskapsbank/recept/biff-med-nudelsallad-och-jordnotssas"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Omelettrulle",
          "recipeLink": "/kunskapsbank/recept/omelettrulle"
        },
        "lunch": {
          "name": "Biff med nudelsallad och jordnötssås (Rester)"
        },
        "dinner": {
          "name": "Morotssoppa med ingefära och rostade kikärtor",
          "recipeLink": "/kunskapsbank/recept/morotssoppa-med-ingefara-och-rostade-kikartor"
        }
      }
    }
  },
  "week4": {
    "title": "Vecka 4: Flow synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Omelettrulle (Rester)"
        },
        "lunch": {
          "name": "Morotssoppa med ingefära och rostade kikärtor",
          "recipeLink": "/kunskapsbank/recept/morotssoppa-med-ingefara-och-rostade-kikartor"
        },
        "dinner": {
          "name": "Rester"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola"
        },
        "lunch": {
          "name": "Grönsakswok med kycklingfärs",
          "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kycklingfars"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Färskostmacka med ost och paprika",
          "recipeLink": "/kunskapsbank/recept/farskostmacka-med-ost-och-paprika"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Ugnsbakad blomkål med ratatouille (Rester)"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Äggröra med fetaost och spenat",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-fetaost-och-spenat"
        },
        "lunch": {
          "name": "Lövbiffsrullader med brie, pesto och rödbetor (Rester)"
        },
        "dinner": {
          "name": "Torsk med saffranssås",
          "recipeLink": "/kunskapsbank/recept/torsk-med-saffranssas"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Bananmuffin",
          "recipeLink": "/kunskapsbank/recept/bananmuffin"
        },
        "lunch": {
          "name": "från frysen"
        },
        "dinner": {
          "name": "Torsk med saffranssås (Rester)"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Omelett med keso och bär",
          "recipeLink": "/kunskapsbank/recept/omelett-med-keso-och-bar"
        },
        "lunch": {
          "name": "Kycklingrullader med gorgonzola (Rester)"
        },
        "dinner": {
          "name": "Valnötslax med fetaostcrème",
          "recipeLink": "/kunskapsbank/recept/valnotslax-med-fetaostcreme"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Blåbärssmoothie",
          "recipeLink": "/kunskapsbank/recept/blabarssmoothie"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Valnötslax med fetaostcrème",
          "recipeLink": "/kunskapsbank/recept/valnotslax-med-fetaostcreme"
        }
      }
    }
  },
  "week5": {
    "title": "Vecka 5: Flow synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Blåbärssmoothie",
          "recipeLink": "/kunskapsbank/recept/blabarssmoothie"
        },
        "lunch": {
          "name": "(Rester)"
        },
        "dinner": {
          "name": "Zucchiniplättar med yoghurtsås",
          "recipeLink": "/kunskapsbank/recept/zucchiniplattar-med-yoghurtsas"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Färskostmacka med ost och paprika",
          "recipeLink": "/kunskapsbank/recept/farskostmacka-med-ost-och-paprika"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Köttfärslimpa med tomat (Rester)"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Yoghurt med mango och apelsin",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-mango-och-apelsin"
        },
        "lunch": {
          "name": "Ugnsbakad blomkål med ratatouille (Rester) från frysen"
        },
        "dinner": {
          "name": "Pestotorsk med capresesallad",
          "recipeLink": "/kunskapsbank/recept/pestotorsk-med-capresesallad"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Stekt ägg med parmaskinka",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-med-parmaskinka"
        },
        "lunch": {
          "name": "Pestotorsk med capresesallad (Rester)"
        },
        "dinner": {
          "name": "Kyckling med blomkålsris och dillyoghurt",
          "recipeLink": "/kunskapsbank/recept/kyckling-med-blomkalsris-och-dillyoghurt"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Bananmuffin",
          "recipeLink": "/kunskapsbank/recept/bananmuffin"
        },
        "lunch": {
          "name": "från frysen"
        },
        "dinner": {
          "name": "Kyckling med blomkålsris och dillyoghurt",
          "recipeLink": "/kunskapsbank/recept/kyckling-med-blomkalsris-och-dillyoghurt"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Äggröra med champinjoner",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-champinjoner"
        },
        "lunch": {
          "name": "Nötgryta med rotfrukter (Rester)"
        },
        "dinner": {
          "name": "Quinoasallad med scampi och mango",
          "recipeLink": "/kunskapsbank/recept/quinoasallad-med-scampi-och-mango"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Bananpannkaka",
          "recipeLink": "/kunskapsbank/recept/bananpannkaka"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Quinoasallad med scampi och mango",
          "recipeLink": "/kunskapsbank/recept/quinoasallad-med-scampi-och-mango"
        }
      }
    }
  },
  "week6": {
    "title": "Vecka 6: Flow synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Bananpannkaka",
          "recipeLink": "/kunskapsbank/recept/bananpannkaka"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Kokta ägg med kaviar",
          "recipeLink": "/kunskapsbank/recept/kokt-agg-med-kaviar"
        },
        "lunch": {
          "name": "Nötgryta med rotfrukter (Rester) från frysen"
        },
        "dinner": {
          "name": "Stekt torsk med bearnaisesås och haricot verts",
          "recipeLink": "/kunskapsbank/recept/stekt-torsk-med-bearnaisesas-och-haricot-verts"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola och bär",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola-och-bar"
        },
        "lunch": {
          "name": "Stekt torsk med bearnaisesås och haricot verts",
          "recipeLink": "/kunskapsbank/recept/stekt-torsk-med-bearnaisesas-och-haricot-verts"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Varm chiagröt med äpple",
          "recipeLink": "/kunskapsbank/recept/varm-chiagrot-med-apple"
        },
        "lunch": {
          "name": "Kycklingfärsbiffar med vitlöksost (Rester)"
        },
        "dinner": {
          "name": "Varma grönsaker med halloumi",
          "recipeLink": "/kunskapsbank/recept/varma-gronsaker-med-halloumi"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Ägghack med kallrökt lax",
          "recipeLink": "/kunskapsbank/recept/agghack-med-kallrokt-lax"
        },
        "lunch": {
          "name": "Varma grönsaker med halloumi",
          "recipeLink": "/kunskapsbank/recept/varma-gronsaker-med-halloumi"
        },
        "dinner": {
          "name": "(Rester)"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Smoothiebowl med blåbär och granola",
          "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-blabar-och-granola"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Lax med quinoasallad och grapefrukt",
          "recipeLink": "/kunskapsbank/recept/lax-med-quinoasallad-och-grapefrukt"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Smoothiebowl med blåbär och granola",
          "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-blabar-och-granola"
        },
        "lunch": {
          "name": ""
        },
        "dinner": {
          "name": "Hamburgare med grekisk sallad",
          "recipeLink": "/kunskapsbank/recept/hamburgare-med-grekisk-sallad"
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
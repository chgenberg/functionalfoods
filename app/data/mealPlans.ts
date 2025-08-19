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
          "name": "Yoghurt med ketomüsli (378 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketomusli"
        },
        "lunch": {
          "name": "Tonfisksallad med äpple (443 kcal)",
          "recipeLink": "/kunskapsbank/recept/tonfisksallad-med-apple"
        },
        "dinner": {
          "name": "Squashspagetti med köttfärssås (337 kcal)",
          "recipeLink": "/kunskapsbank/recept/squashspagetti-med-kottfarssas"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Stekt ägg med lax (286 kcal)",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-med-lax"
        },
        "lunch": {
          "name": "Squashspagetti med köttfärssås (337 kcal) rester"
        },
        "dinner": {
          "name": "Het ratatouille (157 kcal)",
          "recipeLink": "/kunskapsbank/recept/het-ratatouille"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Grön juice (133 kcal)",
          "recipeLink": "/kunskapsbank/recept/gron-juice"
        },
        "lunch": {
          "name": "Pokébowl med kyckling (350 kcal)",
          "recipeLink": "/kunskapsbank/recept/pokebowl-med-kyckling"
        },
        "dinner": {
          "name": "Köttfärsbiffar med stekt blomkål (355 kcal)",
          "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-stekt-blomkal"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Omelett med tomat (240 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-med-tomat"
        },
        "lunch": {
          "name": "Het ratatouille (157 kcal) rester"
        },
        "dinner": {
          "name": "Pokébowl med kyckling (350 kcal) rester"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg (354 kcal)",
          "recipeLink": "/kunskapsbank/recept/1-havrefrallor-med-morotter-och-aprikoser-valfritt-palagg"
        },
        "lunch": {
          "name": "Köttfärsbiffar med stekt blomkål (355 kcal)rester"
        },
        "dinner": {
          "name": "Kycklinggryta med bakad spetskål (650 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl (461 kcal)",
          "recipeLink": "/kunskapsbank/recept/tropisk-smoothiebowl"
        },
        "lunch": {
          "name": "Kycklinggryta med bakad spetskål (650 kcal)rester"
        },
        "dinner": {
          "name": "Laxburgare med krämig grönsaksröra (700 kcal) Mangoglass (123 kcal)",
          "recipeLink": "/kunskapsbank/recept/laxburgare-med-kramig-gronsaksrora-mangoglass"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl (461 kcal) rester"
        },
        "lunch": {
          "name": "Laxburgare med krämig grönsaksröra (700 kcal) rester"
        },
        "dinner": {
          "name": "Ugnsbakad tomat med köttfärs (507 kcal)",
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
          "name": "Yoghurt med ketomüsli (378 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketomusli"
        },
        "lunch": {
          "name": "Ugnsbakad tomat med köttfärs (507 kcal) rester"
        },
        "dinner": {
          "name": "Nudelsoppa med grönsaker (360 kcal)",
          "recipeLink": "/kunskapsbank/recept/nudelsoppa-med-gronsaker"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Omelett med champinjoner (269 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-med-champinjoner"
        },
        "lunch": {
          "name": "Nudelsoppa med grönsaker (360 kcal) rester"
        },
        "dinner": {
          "name": "Torskrygg med ägghack och sparris (345 kcal)",
          "recipeLink": "/kunskapsbank/recept/torskrygg-med-agghack-och-sparris"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Morotsjuice (310 kcal)",
          "recipeLink": "/kunskapsbank/recept/morotsjuice"
        },
        "lunch": {
          "name": "Torskrygg med ägghack och sparris (345 kcal)rester"
        },
        "dinner": {
          "name": "Turkiska lammfärsspett med raita och sallad (666 kcal)",
          "recipeLink": "/kunskapsbank/recept/turkiska-lammfarsspett-med-raita-och-sallad"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Morotsjuice (310 kcal)",
          "recipeLink": "/kunskapsbank/recept/morotsjuice"
        },
        "lunch": {
          "name": "Turkiska lammfärsspett med raita och sallad (666 kcal)rester"
        },
        "dinner": {
          "name": "Kycklingröra med örter och tomat (375 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingrora-med-orter-och-tomat"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg (354 kcal)",
          "recipeLink": "/kunskapsbank/recept/1-havrefrallor-med-morotter-och-aprikoser-valfritt-palagg"
        },
        "lunch": {
          "name": "Kycklingröra med örter och tomat (375 kcal) rester"
        },
        "dinner": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål (546 kcal)",
          "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter-och-brysselkal"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Blåbärs smoothiebowl (546 kcal)",
          "recipeLink": "/kunskapsbank/recept/blabars-smoothiebowl"
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål (546 kcal)rester"
        },
        "dinner": {
          "name": "Asiatiska köttbullar med nudelsallad (422 kcal)Mango och jordgubbar med vit chokladcréme (220 kcal)",
          "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad-mango-och-jordgubbar-med-vit-chokladcreme"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Blåbärs smoothiebowl (546 kcal) rester"
        },
        "lunch": {
          "name": "Asiatiska köttbullar med nudelsallad (422 kcal)rester"
        },
        "dinner": {
          "name": "Päronsallad med chévreost (470 kcal)",
          "recipeLink": "/kunskapsbank/recept/paronsallad-med-chevreost"
        }
      }
    }
  },
  "week3": {
    "title": "Vecka 3: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli (378 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketomusli"
        },
        "lunch": {
          "name": "Päronsallad med chévreost (470 kcal)rester"
        },
        "dinner": {
          "name": "Kycklingfylld aubergine (573 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med rökt lax (316 kcal)",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-rokt-lax"
        },
        "lunch": {
          "name": "Kycklingfylld aubergine (573 kcal) rester"
        },
        "dinner": {
          "name": "Rökt lax med blomkålssallad och citronyoghurt (302 kcal)",
          "recipeLink": "/kunskapsbank/recept/rokt-lax-med-blomkalssallad-och-citronyoghurt"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Rödbetsjuice (250 kcal)",
          "recipeLink": "/kunskapsbank/recept/rodbetsjuice"
        },
        "lunch": {
          "name": "Rökt lax med blomkålssallad och citronyoghurt (302 kcal) rester"
        },
        "dinner": {
          "name": "Vegetarisk currygryta med panéer (360 kcal)",
          "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Rödbetsjuice (250 kcal)rester"
        },
        "lunch": {
          "name": "Vegetarisk currygryta med panéer (360 kcal)rester"
        },
        "dinner": {
          "name": "Kycklinggryta med bakad spetskål (650 kcal)rester från fysen"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg (354 kcal)",
          "recipeLink": "/kunskapsbank/recept/1-havrefrallor-med-morotter-och-aprikoser-valfritt-palagg"
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål (546 kcal)rester från frysen"
        },
        "dinner": {
          "name": "Högrevsburgare med hummus (635 kcal)",
          "recipeLink": "/kunskapsbank/recept/hogrevsburgare-med-hummus"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad (190 kcal)",
          "recipeLink": "/kunskapsbank/recept/keso-med-granola-och-fruktsallad"
        },
        "lunch": {
          "name": "Högrevsburgare med hummus (635 kcal)rester"
        },
        "dinner": {
          "name": "Ugnsbakad kyckling med tzatziki och sallad (330 kcal)Mandel och citronpaj (425 kcal)",
          "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad-mandel-och-citronpaj"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Omelett med hallon (250 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-med-hallon"
        },
        "lunch": {
          "name": "Ugnsbakad kyckling med tzatziki och sallad (330 kcal) rester"
        },
        "dinner": {
          "name": "Lax med waldorfsallad (555 kcal)",
          "recipeLink": "/kunskapsbank/recept/lax-med-waldorfsallad"
        }
      }
    }
  },
  "week4": {
    "title": "Vecka 4: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Omelett med bär (223 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-med-bar"
        },
        "lunch": {
          "name": "Lax med waldorfsallad (555 kcal)rester"
        },
        "dinner": {
          "name": "Grekiska köttbullar i tomatsås med rostad sötpotatis (447 kcal)",
          "recipeLink": "/kunskapsbank/recept/grekiska-kottbullar-i-tomatsas-med-rostad-sotpotatis"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Ägghack med kalkon (268 kcal)",
          "recipeLink": "/kunskapsbank/recept/agghack-med-kalkon"
        },
        "lunch": {
          "name": "Grekiska köttbullar i tomatsås med rostad sötpotatis (447 kcal) rester"
        },
        "dinner": {
          "name": "Kycklinggryta med röda linser (296 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Fruktsmoothie (182 kcal)",
          "recipeLink": "/kunskapsbank/recept/fruktsmoothie"
        },
        "lunch": {
          "name": "Kycklinggryta med röda linser (296 kcal) rester"
        },
        "dinner": {
          "name": "Laxsallad med vindruvor (575 kcal)",
          "recipeLink": "/kunskapsbank/recept/laxsallad-med-vindruvor"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Fruktsmoothie (182 kcal) rester"
        },
        "lunch": {
          "name": "Laxsallad med vindruvor (575 kcal)rester"
        },
        "dinner": {
          "name": "Asiatiska köttbullar med nudelsallad (422 kcal)rester från fysen"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Bananplättar med mango och granatäpple (250 kcal)",
          "recipeLink": "/kunskapsbank/recept/bananplattar-med-mango-och-granatapple"
        },
        "lunch": {
          "name": "Vegetarisk currygryta med panéer (360 kcal)rester från frysen"
        },
        "dinner": {
          "name": "Grillade köttspett med grekisk sallad och morotstzatziki (482 kcal)",
          "recipeLink": "/kunskapsbank/recept/grillade-kottspett-med-grekisk-sallad-och-morotstzatziki"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med hallon och granatäpple (105 kcal)",
          "recipeLink": "/kunskapsbank/recept/keso-med-hallon-och-granatapple"
        },
        "lunch": {
          "name": "Grillade köttspett med grekisk sallad och morotstzatziki (482 kcal)rester"
        },
        "dinner": {
          "name": "Ugnsbakad kyckling med quinoasallad och chilimajjo (750 kcal)Hallon och kiwi med vit chokladcréme (219 kcal)",
          "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-quinoasallad-och-chilimajjo-hallon-och-kiwi-med-vit-chokladcreme"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Havregrynsgröt med torkad frukt och äpple (282 kcal)",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-torkad-frukt-och-apple"
        },
        "lunch": {
          "name": "Ugnsbakad kyckling med tzatziki och sallad (750 kcal) rester"
        },
        "dinner": {
          "name": "Torsk från mellanöstern (455 kcal)",
          "recipeLink": "/kunskapsbank/recept/torsk-fran-mellanostern"
        }
      }
    }
  },
  "week5": {
    "title": "Vecka 5: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli (378 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketomusli"
        },
        "lunch": {
          "name": "Torsk från mellanöstern (455 kcal) rester"
        },
        "dinner": {
          "name": "Japansk kycklingfärswok med groddar (320 kcal",
          "recipeLink": "/kunskapsbank/recept/japansk-kycklingfarswok-med-groddar-320-kcal"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med paprika (250 kcal)",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-paprika"
        },
        "lunch": {
          "name": "Japansk kycklingfärswok med groddar (320 kcal rester"
        },
        "dinner": {
          "name": "Grekisk sallad med fetaost (529 kcal)",
          "recipeLink": "/kunskapsbank/recept/grekisk-sallad-med-fetaost"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Chiafrögröt (269 kcal)",
          "recipeLink": "/kunskapsbank/recept/chiafrogrot"
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål (546 kcal)rester från fysen"
        },
        "dinner": {
          "name": "Köttfärslimpa med ajvar och rostad sötpotatis (677 kcal)",
          "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-ajvar-och-rostad-sotpotatis"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Bananplättar med jordgubbar och kokos (250 kcal)",
          "recipeLink": "/kunskapsbank/recept/bananplattar-med-jordgubbar-och-kokos"
        },
        "lunch": {
          "name": "Köttfärslimpa med ajvar, fetaost och rostad sötpotatis (677 kcal)rester"
        },
        "dinner": {
          "name": "Vegetarisk currygryta med panéer (360 kcal)rester från frysen"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Bananplättar med jordgubbar och kokos (250 kcal) rester"
        },
        "lunch": {
          "name": "Kycklinggryta med röda linser (296 kcal) rester från frysen"
        },
        "dinner": {
          "name": "Skaldjursgryta med torsk i gul curry (491 kcal)",
          "recipeLink": "/kunskapsbank/recept/skaldjursgryta-med-torsk-i-gul-curry"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Mangosmoothie med spenat (119 kcal)",
          "recipeLink": "/kunskapsbank/recept/mangosmoothie-med-spenat"
        },
        "lunch": {
          "name": "Skaldjursgryta med torsk i gul curry (491 kcal)rester"
        },
        "dinner": {
          "name": "Kycklingjärpar med linssallad (402 kcal)Mandelkaka med frukt (385 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingjarpar-med-linssallad-mandelkaka-med-frukt"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Mangosmoothie med spenat (119 kcal) rester"
        },
        "lunch": {
          "name": "Kycklingjärpar med linssallad (402 kcal)rester"
        },
        "dinner": {
          "name": "Laxfilé med ratatouille (370 kcal)",
          "recipeLink": "/kunskapsbank/recept/laxfile-med-ratatouille"
        }
      }
    }
  },
  "week6": {
    "title": "Vecka 6: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg (354 kcal)",
          "recipeLink": "/kunskapsbank/recept/1-havrefrallor-med-morotter-och-aprikoser-valfritt-palagg"
        },
        "lunch": {
          "name": "Laxfilé med ratatouille (370 kcal) rester"
        },
        "dinner": {
          "name": "Grönsakswok med kyckling (310 kcal)",
          "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kyckling"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Kokt ägg med majonnäs (233 kcal)",
          "recipeLink": "/kunskapsbank/recept/kokt-agg-med-majonnas"
        },
        "lunch": {
          "name": "Grönsakswok med kyckling (310 kcal) rester"
        },
        "dinner": {
          "name": "Köttfärspytt med italienska smaker (340 kcal)",
          "recipeLink": "/kunskapsbank/recept/kottfarspytt-med-italienska-smaker"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Mango med keso och nötter (202 kcal)",
          "recipeLink": "/kunskapsbank/recept/mango-med-keso-och-notter"
        },
        "lunch": {
          "name": "Köttfärspytt med italienska smaker (340 kcal) rester"
        },
        "dinner": {
          "name": "Indisk laxgryta med röda linser (382 kcal)",
          "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-med-roda-linser"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Äggröra med granatäpple och kiwi (230 kcal)",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-granatapple-och-kiwi"
        },
        "lunch": {
          "name": "Indisk laxgryta med röda linser (382 kcal)rester"
        },
        "dinner": {
          "name": "Quinoasallad med stekt halloumi (580 kcal)",
          "recipeLink": "/kunskapsbank/recept/quinoasallad-med-stekt-halloumi"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Havregrynsgröt med apelsin och kokos (239 kcal)",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-apelsin-och-kokos"
        },
        "lunch": {
          "name": "Quinoasallad med stekt halloumi (580 kcal) rester"
        },
        "dinner": {
          "name": "Torsk teriyaki med grönsaker (267 kcal)",
          "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Hallon- och blåbärssmoothie (160 kcal)",
          "recipeLink": "/kunskapsbank/recept/hallon-och-blabarssmoothie"
        },
        "lunch": {
          "name": "Torsk teriyaki med grönsaker (267 kcal)rester"
        },
        "dinner": {
          "name": "Lammgryta med plommon och bulgur (610 kcal)Tropisk fruktsallad(225 kcal)",
          "recipeLink": "/kunskapsbank/recept/lammgryta-med-plommon-och-bulgur-tropisk-fruktsallad"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Hallon- och blåbärssmoothie (160 kcal) rester"
        },
        "lunch": {
          "name": "Lammgryta plommon och bulgur (610 kcal)rester"
        },
        "dinner": {
          "name": "Kycklinggryta med bakad spetskål (650 kcal)rester från frysen"
        }
      }
    }
  }
,
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

// Helper function to get meal for a specific day (legacy function for backwards compatibility)
export function getMealForDay(dayNumber: number): DayMeals | null {
  // This is a simplified version - assumes current week 1 for backwards compatibility
  return getMealPlan(1, dayNumber);
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
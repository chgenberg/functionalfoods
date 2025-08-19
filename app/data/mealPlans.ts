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
    "title": "Vecka 1: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Färskostmacka med tomat (185 kcal)",
          "recipeLink": "/kunskapsbank/recept/farskostmacka-med-tomat"
        },
        "lunch": {
          "name": "Linssoppa från medelhavet (375 kcal)",
          "recipeLink": "/kunskapsbank/recept/linssoppa-fran-medelhavet"
        },
        "dinner": {
          "name": "Kycklingburgare med papayasallad (406 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingburgare-med-papayasallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med asiatisk avokadosallad (438 kcal)",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-asiatisk-avokadosallad"
        },
        "lunch": {
          "name": "Kycklingburgare med papayasallad (406 kcal)rester"
        },
        "dinner": {
          "name": "Köttfärsbiffar med tomatsallad (588 kcal)",
          "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-tomatsallad"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Choklad- och kokoschiapudding (261 kcal)",
          "recipeLink": "/kunskapsbank/recept/choklad-och-kokoschiapudding"
        },
        "lunch": {
          "name": "Köttfärsbiffar med tomatsallad (588 kcal)rester"
        },
        "dinner": {
          "name": "Laxgratäng med scampi och broccoli (634 kcal)",
          "recipeLink": "/kunskapsbank/recept/laxgratang-med-scampi-och-broccoli"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Keso med bovetegranola (302 kcal)",
          "recipeLink": "/kunskapsbank/recept/keso-med-bovetegranola"
        },
        "lunch": {
          "name": "Laxgratäng med scampi och broccoli (634 kcal)rester"
        },
        "dinner": {
          "name": "Kycklinggryta från medelhavet (368 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Omelett med ost och spenat (282 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-med-ost-och-spenat"
        },
        "lunch": {
          "name": "Kycklinggryta från medelhavet (368 kcal) rester"
        },
        "dinner": {
          "name": "Fänkålssallad med grapefrukt och burrata (470 kcal)",
          "recipeLink": "/kunskapsbank/recept/fankalssallad-med-grapefrukt-och-burrata"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Ugnsomelett med bär (395 kcal)",
          "recipeLink": "/kunskapsbank/recept/ugnsomelett-med-bar"
        },
        "lunch": {
          "name": "Fänkålssallad med grapefrukt och burrata (470 kcal) rester"
        },
        "dinner": {
          "name": "Entrecote med haricot verts och bearnaisesås (371 kcal)Citronkaka med äpple och kardemumma (265 kcal)",
          "recipeLink": "/kunskapsbank/recept/entrecote-med-haricot-verts-och-bearnaisesas-citronkaka-med-apple-och-kardemumma"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Ugnsomelett med bär(395 kcal) rester"
        },
        "lunch": {
          "name": "Entrecote med haricot verts och bearnaisesås (371 kcal) rester"
        },
        "dinner": {
          "name": "Grönsakswok med tonfisk och ägg (300 kcal)",
          "recipeLink": "/kunskapsbank/recept/gronsakswok-med-tonfisk-och-agg"
        }
      }
    }
  },
  "week2": {
    "title": "Vecka 2: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Macka med ost(354 kcal)",
          "recipeLink": "/kunskapsbank/recept/macka-med-ost"
        },
        "lunch": {
          "name": "Grönsakswok med tonfisk och ägg (300 kcal) rester"
        },
        "dinner": {
          "name": "Lövbiffsgryta med champinjoner och grönsaksspagetti (440 kcal)",
          "recipeLink": "/kunskapsbank/recept/lovbiffsgryta-med-champinjoner-och-gronsaksspagetti"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Ägghack i salladsblad (315 kcal)",
          "recipeLink": "/kunskapsbank/recept/agghack-i-salladsblad"
        },
        "lunch": {
          "name": "Lövbiffsgryta med champinjoner och grönsaksspagetti (440 kcal) rester"
        },
        "dinner": {
          "name": "Lax med rödbetssallad (490 kcal)",
          "recipeLink": "/kunskapsbank/recept/lax-med-rodbetssallad"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Overnight oats med morot (423 kcal)",
          "recipeLink": "/kunskapsbank/recept/overnight-oats-med-morot"
        },
        "lunch": {
          "name": "Lax med rödbetssallad (490 kcal) rester"
        },
        "dinner": {
          "name": "Kycklingpizza (467 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingpizza"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola och frukt (340 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola-och-frukt"
        },
        "lunch": {
          "name": "Kycklingpizza (467 kcal) rester"
        },
        "dinner": {
          "name": "Spenatsoppa med rostade pumpafrön (308 kcal)",
          "recipeLink": "/kunskapsbank/recept/spenatsoppa-med-rostade-pumpafron"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Stekt ägg med champinjoner (264 kcal)",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-med-champinjoner"
        },
        "lunch": {
          "name": "Spenatsoppa rostade pumpafrön (308 kcal) rester"
        },
        "dinner": {
          "name": "Fisktaco med mangosalsa och sesamsås (656 kcal)",
          "recipeLink": "/kunskapsbank/recept/fisktaco-med-mangosalsa-och-sesamsas"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Smoothiebowl med mango och pistagenötter (440 kcal)",
          "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-mango-och-pistagenotter"
        },
        "lunch": {
          "name": "Fisktaco med mangosalsa och sesamsås (656 kcal)rester"
        },
        "dinner": {
          "name": "Ajvarspett med grekisk sallad och tzatziki (550 kcal)Zucchinikaka med kardemumma (264 kcal)",
          "recipeLink": "/kunskapsbank/recept/ajvarspett-med-grekisk-sallad-och-tzatziki-zucchinikaka-med-kardemumma"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Grön juice (130 kcal)",
          "recipeLink": "/kunskapsbank/recept/gron-juice"
        },
        "lunch": {
          "name": "Ajvarspett med grekisk sallad och tzatziki (550 kcal) rester"
        },
        "dinner": {
          "name": "Kycklinggryta från medelhavet (368 kcal) rester från frysen"
        }
      }
    }
  },
  "week3": {
    "title": "Vecka 3: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Grön juice (130 kcal) rester"
        },
        "lunch": {
          "name": "Kycklinggryta från medelhavet (448 kcal) rester från frysen"
        },
        "dinner": {
          "name": "Färgstark fetaostsallad (410 kcal)",
          "recipeLink": "/kunskapsbank/recept/fargstark-fetaostsallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Bananmuffin (169 kcal)",
          "recipeLink": "/kunskapsbank/recept/bananmuffin"
        },
        "lunch": {
          "name": "Färgstark fetaostsallad (410 kcal) rester"
        },
        "dinner": {
          "name": "Nötfärstimbaler med chévreost och soltorkad tomat (534 kcal)",
          "recipeLink": "/kunskapsbank/recept/notfarstimbaler-med-chevreost-och-soltorkad-tomat"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Kokt ägg med kaviar(231 kcal)",
          "recipeLink": "/kunskapsbank/recept/kokt-agg-med-kaviar"
        },
        "lunch": {
          "name": "Nötfärstimbaler med chévreost och soltorkad tomat (534 kcal) rester"
        },
        "dinner": {
          "name": "Laxsallad med fetaost (486 kcal)",
          "recipeLink": "/kunskapsbank/recept/laxsallad-med-fetaost"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Keso med bovetegranola och frukt (330 kcal)",
          "recipeLink": "/kunskapsbank/recept/keso-med-bovetegranola-och-frukt"
        },
        "lunch": {
          "name": "Laxsallad med fetaost (486 kcal) rester"
        },
        "dinner": {
          "name": "Spenatsoppa rostade pumpafrön (308 kcal) rester från frysen"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Chiapudding med jordgubbar och hallon (249 kcal)",
          "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbar-och-hallon"
        },
        "lunch": {
          "name": "Kycklingpizza (467 kcal) rester från frysen"
        },
        "dinner": {
          "name": "Torsk med guacamole och sötpotatis (518 kcal)",
          "recipeLink": "/kunskapsbank/recept/torsk-med-guacamole-och-sotpotatis"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Chiapudding med jordgubbar och hallon (249 kcal) rester"
        },
        "lunch": {
          "name": "Torsk med guacamole och sötpotatis (518 kcal) rester"
        },
        "dinner": {
          "name": "Biff med nudelsallad och jordnötssås (670 kcal)Chokladbar med majskakor (162 kcal)",
          "recipeLink": "/kunskapsbank/recept/biff-med-nudelsallad-och-jordnotssas-chokladbar-med-majskakor"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Omelettrulle (200 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelettrulle"
        },
        "lunch": {
          "name": "Biff med nudelsallad och jordnötssås (670 kcal) rester"
        },
        "dinner": {
          "name": "Morotssoppa med ingefära och rostade kikärtor (365 kcal)",
          "recipeLink": "/kunskapsbank/recept/morotssoppa-med-ingefara-och-rostade-kikartor"
        }
      }
    }
  },
  "week4": {
    "title": "Vecka 4: Synkroniserad från DOCX",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Omelettrulle (200 kcal) rester"
        },
        "lunch": {
          "name": "Morotssoppa med ingefära och rostade kikärtor (365 kcal)Rester"
        },
        "dinner": {
          "name": "Grönsakswok med kycklingfärs (328 kcal)",
          "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kycklingfars"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola (279 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola"
        },
        "lunch": {
          "name": "Grönsakswok med kycklingfärs (328 kcal)rester"
        },
        "dinner": {
          "name": "Ugnsbakad blomkål med ratatouille (332 kcal)",
          "recipeLink": "/kunskapsbank/recept/ugnsbakad-blomkal-med-ratatouille"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Färskostmacka med ost och paprika(354 kcal)",
          "recipeLink": "/kunskapsbank/recept/farskostmacka-med-ost-och-paprika"
        },
        "lunch": {
          "name": "Ugnsbakad blomkål med ratatouille (332 kcal) rester"
        },
        "dinner": {
          "name": "Lövbiffsrullader med brie, pesto och rödbetor (655 kcal)",
          "recipeLink": "/kunskapsbank/recept/lovbiffsrullader-med-brie-pesto-och-rodbetor"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Äggröra med fetaost och spenat (317 kcal)",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-fetaost-och-spenat"
        },
        "lunch": {
          "name": "Lövbiffsrullader med brie, pesto och rödbetor (655 kcal) rester"
        },
        "dinner": {
          "name": "Torsk med saffranssås (436 kcal)",
          "recipeLink": "/kunskapsbank/recept/torsk-med-saffranssas"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Bananmuffin (169 kcal)från frysen",
          "recipeLink": "/kunskapsbank/recept/bananmuffin-fran-frysen"
        },
        "lunch": {
          "name": "Torsk med saffranssås (436 kcal) rester"
        },
        "dinner": {
          "name": "Kycklingrullader med gorgonzola (401 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingrullader-med-gorgonzola"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Omelett med keso och bär (307 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-med-keso-och-bar"
        },
        "lunch": {
          "name": "Kycklingrullader med gorgonzola (401 kcal) rester"
        },
        "dinner": {
          "name": "Valnötslax med fetaostcrème (548 kcal) Stekta äpplen med vit chokladkräm (300 kcal)",
          "recipeLink": "/kunskapsbank/recept/valnotslax-med-fetaostcreme-stekta-applen-med-vit-chokladkram"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Blåbärssmoothie (160 kcal)",
          "recipeLink": "/kunskapsbank/recept/blabarssmoothie"
        },
        "lunch": {
          "name": "Valnötslax med fetaostcrème (548 kcal)rester"
        },
        "dinner": {
          "name": "Zucchiniplättar med yoghurtsås (341 kcal)",
          "recipeLink": "/kunskapsbank/recept/zucchiniplattar-med-yoghurtsas"
        }
      }
    }
  }
,
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
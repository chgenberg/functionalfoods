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
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli (378 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-ketomusli"
        },
        "lunch": {
          "name": "Tonfisksallad med äpple (443 kcal)",
          "recipeLink": "/kunskapsbank/recept/tonfisksallad-apple-sallad"
        },
        "dinner": {
          "name": "Squashspagetti med köttfärssås (337 kcal)",
          "recipeLink": "/kunskapsbank/recept/squashspagetti-kottfarssas"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Stekt ägg med lax (286 kcal)",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-lax"
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
          "recipeLink": "/kunskapsbank/recept/gron-juice-juice"
        },
        "lunch": {
          "name": "Pokébowl med kyckling (350 kcal)",
          "recipeLink": "/kunskapsbank/recept/poke-bowl-kyckling"
        },
        "dinner": {
          "name": "Köttfärsbiffar med stekt blomkål (355 kcal)",
          "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-stekt-blomkal"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Omelett med tomat (240 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-tomat"
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
          "recipeLink": "/kunskapsbank/recept/havrefrallor-morotter-aprikoser"
        },
        "lunch": {
          "name": "Köttfärsbiffar med stekt blomkål (355 kcal)rester"
        },
        "dinner": {
          "name": "Kycklinggryta med bakad spetskål (650 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-roda-linser"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl (461 kcal)",
          "recipeLink": "/kunskapsbank/recept/smoothie-smoothiebowl"
        },
        "lunch": {
          "name": "Kycklinggryta med bakad spetskål (650 kcal)rester"
        },
        "dinner": {
          "name": "Laxburgare med krämig grönsaksröra (700 kcal) Mangoglass (123 kcal)",
          "recipeLink": "/kunskapsbank/recept/kramig-gronsaksrora"
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
          "recipeLink": "/kunskapsbank/recept/ugnsbakad-tomat-kottfars"
        }
      }
    },
    "title": "Vecka 1: Synkroniserad från DOCX"
  },
  "week2": {
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli (378 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-ketomusli"
        },
        "lunch": {
          "name": "Ugnsbakad tomat med köttfärs (507 kcal) rester"
        },
        "dinner": {
          "name": "Nudelsoppa med grönsaker (360 kcal)",
          "recipeLink": "/kunskapsbank/recept/nudelsoppa-gronsaker-soppa"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Omelett med champinjoner (269 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-champinjoner"
        },
        "lunch": {
          "name": "Nudelsoppa med grönsaker (360 kcal) rester"
        },
        "dinner": {
          "name": "Torskrygg med ägghack och sparris (345 kcal)",
          "recipeLink": "/kunskapsbank/recept/torskrygg-agghack-sparris"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Morotsjuice (310 kcal)",
          "recipeLink": "/kunskapsbank/recept/morotsjuice-juice"
        },
        "lunch": {
          "name": "Torskrygg med ägghack och sparris (345 kcal)rester"
        },
        "dinner": {
          "name": "Turkiska lammfärsspett med raita och sallad (666 kcal)",
          "recipeLink": "/kunskapsbank/recept/turkiska-lammfarsspett-raita"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Morotsjuice (310 kcal)",
          "recipeLink": "/kunskapsbank/recept/morotsjuice-juice"
        },
        "lunch": {
          "name": "Turkiska lammfärsspett med raita och sallad (666 kcal)rester"
        },
        "dinner": {
          "name": "Kycklingröra med örter och tomat (375 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingrora-orter-tomat"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg (354 kcal)",
          "recipeLink": "/kunskapsbank/recept/havrefrallor-morotter-aprikoser"
        },
        "lunch": {
          "name": "Kycklingröra med örter och tomat (375 kcal) rester"
        },
        "dinner": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål (546 kcal)",
          "recipeLink": "/kunskapsbank/recept/lax-fetaost-rostade"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Blåbärs smoothiebowl (546 kcal)"
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål (546 kcal)rester"
        },
        "dinner": {
          "name": "Asiatiska köttbullar med nudelsallad (422 kcal)Mango och jordgubbar med vit chokladcréme (220 kcal)",
          "recipeLink": "/kunskapsbank/recept/jordgubbar-mango-vit"
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
          "recipeLink": "/kunskapsbank/recept/paronsallad-chevreost-sallad"
        }
      }
    },
    "title": "Vecka 2: Synkroniserad från DOCX"
  },
  "week3": {
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli (378 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-ketomusli"
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
          "recipeLink": "/kunskapsbank/recept/aggrora-lax"
        },
        "lunch": {
          "name": "Kycklingfylld aubergine (573 kcal) rester"
        },
        "dinner": {
          "name": "Rökt lax med blomkålssallad och citronyoghurt (302 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-lax-blomkalsallad"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Rödbetsjuice (250 kcal)",
          "recipeLink": "/kunskapsbank/recept/rodbetsjuice-juice"
        },
        "lunch": {
          "name": "Rökt lax med blomkålssallad och citronyoghurt (302 kcal) rester"
        },
        "dinner": {
          "name": "Vegetarisk currygryta med panéer (360 kcal)",
          "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-paneer-2"
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
          "recipeLink": "/kunskapsbank/recept/havrefrallor-morotter-aprikoser"
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter och brysselkål (546 kcal)rester från frysen"
        },
        "dinner": {
          "name": "Högrevsburgare med hummus (635 kcal)",
          "recipeLink": "/kunskapsbank/recept/hamburgare-hummus"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad (190 kcal)",
          "recipeLink": "/kunskapsbank/recept/keso-granola-fruktsallad"
        },
        "lunch": {
          "name": "Högrevsburgare med hummus (635 kcal)rester"
        },
        "dinner": {
          "name": "Ugnsbakad kyckling med tzatziki och sallad (330 kcal)Mandel och citronpaj (425 kcal)",
          "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-tzatziki"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Omelett med hallon (250 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-hallon"
        },
        "lunch": {
          "name": "Ugnsbakad kyckling med tzatziki och sallad (330 kcal) rester"
        },
        "dinner": {
          "name": "Lax med waldorfsallad (555 kcal)",
          "recipeLink": "/kunskapsbank/recept/lax-waldorfsallad-sallad"
        }
      }
    },
    "title": "Vecka 3: Synkroniserad från DOCX"
  },
  "week4": {
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Omelett med bär (223 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-bar"
        },
        "lunch": {
          "name": "Lax med waldorfsallad (555 kcal)rester"
        },
        "dinner": {
          "name": "Grekiska köttbullar i tomatsås med rostad sötpotatis (447 kcal)",
          "recipeLink": "/kunskapsbank/recept/grekiska-kottbullar-tomatsas"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Ägghack med kalkon (268 kcal)",
          "recipeLink": "/kunskapsbank/recept/agghack-kalkon"
        },
        "lunch": {
          "name": "Grekiska köttbullar i tomatsås med rostad sötpotatis (447 kcal) rester"
        },
        "dinner": {
          "name": "Kycklinggryta med röda linser (296 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-roda-linser"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Fruktsmoothie (182 kcal)",
          "recipeLink": "/kunskapsbank/recept/smoothie-2"
        },
        "lunch": {
          "name": "Kycklinggryta med röda linser (296 kcal) rester"
        },
        "dinner": {
          "name": "Laxsallad med vindruvor (575 kcal)",
          "recipeLink": "/kunskapsbank/recept/laxsallad-vindruvor-sallad"
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
          "recipeLink": "/kunskapsbank/recept/bananplattar-mango-granatapple"
        },
        "lunch": {
          "name": "Vegetarisk currygryta med panéer (360 kcal)rester från frysen"
        },
        "dinner": {
          "name": "Grillade köttspett med grekisk sallad och morotstzatziki (482 kcal)",
          "recipeLink": "/kunskapsbank/recept/grekisk-sallad-sallad"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med hallon och granatäpple (105 kcal)",
          "recipeLink": "/kunskapsbank/recept/keso-hallon-granatapple"
        },
        "lunch": {
          "name": "Grillade köttspett med grekisk sallad och morotstzatziki (482 kcal)rester"
        },
        "dinner": {
          "name": "Ugnsbakad kyckling med quinoasallad och chilimajjo (750 kcal)Hallon och kiwi med vit chokladcréme (219 kcal)",
          "recipeLink": "/kunskapsbank/recept/hallon-kiwi-vit"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Havregrynsgröt med torkad frukt och äpple (282 kcal)",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-torkad-frukt"
        },
        "lunch": {
          "name": "Ugnsbakad kyckling med tzatziki och sallad (750 kcal) rester"
        },
        "dinner": {
          "name": "Torsk från mellanöstern (455 kcal)",
          "recipeLink": "/kunskapsbank/recept/torsk-mellanostern"
        }
      }
    },
    "title": "Vecka 4: Synkroniserad från DOCX"
  },
  "week5": {
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med ketomüsli (378 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-ketomusli"
        },
        "lunch": {
          "name": "Torsk från mellanöstern (455 kcal) rester"
        },
        "dinner": {
          "name": "Japansk kycklingfärswok med groddar (320 kcal",
          "recipeLink": "/kunskapsbank/recept/japansk-kycklingfarswok-groddar"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med paprika (250 kcal)",
          "recipeLink": "/kunskapsbank/recept/aggrora-paprika"
        },
        "lunch": {
          "name": "Japansk kycklingfärswok med groddar (320 kcal rester"
        },
        "dinner": {
          "name": "Grekisk sallad med fetaost (529 kcal)",
          "recipeLink": "/kunskapsbank/recept/grekisk-sallad-sallad"
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
          "recipeLink": "/kunskapsbank/recept/kottfarslimpa-ajvar-rostad"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Bananplättar med jordgubbar och kokos (250 kcal)",
          "recipeLink": "/kunskapsbank/recept/bananplattar-jordgubbar-kokos"
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
          "recipeLink": "/kunskapsbank/recept/skaldjursgryta-torsk-gul"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Mangosmoothie med spenat (119 kcal)",
          "recipeLink": "/kunskapsbank/recept/smoothie-spenat"
        },
        "lunch": {
          "name": "Skaldjursgryta med torsk i gul curry (491 kcal)rester"
        },
        "dinner": {
          "name": "Kycklingjärpar med linssallad (402 kcal)Mandelkaka med frukt (385 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingjarpar-linssallad-sallad"
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
          "recipeLink": "/kunskapsbank/recept/laxfile-ratatouille"
        }
      }
    },
    "title": "Vecka 5: Synkroniserad från DOCX"
  },
  "week6": {
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg (354 kcal)",
          "recipeLink": "/kunskapsbank/recept/havrefrallor-morotter-aprikoser"
        },
        "lunch": {
          "name": "Laxfilé med ratatouille (370 kcal) rester"
        },
        "dinner": {
          "name": "Grönsakswok med kyckling (310 kcal)",
          "recipeLink": "/kunskapsbank/recept/gronsakswok-kyckling"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Kokt ägg med majonnäs (233 kcal)",
          "recipeLink": "/kunskapsbank/recept/kokt-agg-majonnas"
        },
        "lunch": {
          "name": "Grönsakswok med kyckling (310 kcal) rester"
        },
        "dinner": {
          "name": "Köttfärspytt med italienska smaker (340 kcal)",
          "recipeLink": "/kunskapsbank/recept/kottfarspytt-italienska-smaker"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Mango med keso och nötter (202 kcal)",
          "recipeLink": "/kunskapsbank/recept/mango-keso-notter"
        },
        "lunch": {
          "name": "Köttfärspytt med italienska smaker (340 kcal) rester"
        },
        "dinner": {
          "name": "Indisk laxgryta med röda linser (382 kcal)",
          "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-roda"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Äggröra med granatäpple och kiwi (230 kcal)",
          "recipeLink": "/kunskapsbank/recept/aggrora-granatapple-kiwi"
        },
        "lunch": {
          "name": "Indisk laxgryta med röda linser (382 kcal)rester"
        },
        "dinner": {
          "name": "Quinoasallad med stekt halloumi (580 kcal)",
          "recipeLink": "/kunskapsbank/recept/quinoasallad-stekt-halloumi"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Havregrynsgröt med apelsin och kokos (239 kcal)",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-apelsin-kokos"
        },
        "lunch": {
          "name": "Quinoasallad med stekt halloumi (580 kcal) rester"
        },
        "dinner": {
          "name": "Torsk teriyaki med grönsaker (267 kcal)",
          "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-gronsaker"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Hallon- och blåbärssmoothie (160 kcal)",
          "recipeLink": "/kunskapsbank/recept/smoothie-blabarssmoothie"
        },
        "lunch": {
          "name": "Torsk teriyaki med grönsaker (267 kcal)rester"
        },
        "dinner": {
          "name": "Lammgryta med plommon och bulgur (610 kcal)Tropisk fruktsallad(225 kcal)",
          "recipeLink": "/kunskapsbank/recept/lammgryta-plommon-bulgur"
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
    },
    "title": "Vecka 6: Synkroniserad från DOCX"
  }
};

// Functional Flow meal plans
export const flowMealPlans: Record<string, WeekMealPlan> = {
  "week1": {
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Färskostmacka med tomat (185 kcal)",
          "recipeLink": "/kunskapsbank/recept/farskostmacka-tomat"
        },
        "lunch": {
          "name": "Linssoppa från medelhavet (375 kcal)",
          "recipeLink": "/kunskapsbank/recept/linssoppa-medelhavet-soppa"
        },
        "dinner": {
          "name": "Kycklingburgare med papayasallad (406 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingburgare-papayasallad-sallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med asiatisk avokadosallad (438 kcal)",
          "recipeLink": "/kunskapsbank/recept/aggrora-asiatisk-avokadosallad"
        },
        "lunch": {
          "name": "Kycklingburgare med papayasallad (406 kcal)rester"
        },
        "dinner": {
          "name": "Köttfärsbiffar med tomatsallad (588 kcal)",
          "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-stekt-blomkal"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Choklad- och kokoschiapudding (261 kcal)",
          "recipeLink": "/kunskapsbank/recept/choklad-kokoschiapudding"
        },
        "lunch": {
          "name": "Köttfärsbiffar med tomatsallad (588 kcal)rester"
        },
        "dinner": {
          "name": "Laxgratäng med scampi och broccoli (634 kcal)",
          "recipeLink": "/kunskapsbank/recept/laxgratang-broccoli-scampi"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Keso med bovetegranola (302 kcal)",
          "recipeLink": "/kunskapsbank/recept/keso-bovetegranola-granola"
        },
        "lunch": {
          "name": "Laxgratäng med scampi och broccoli (634 kcal)rester"
        },
        "dinner": {
          "name": "Kycklinggryta från medelhavet (368 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-medelhavet-gryta"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Omelett med ost och spenat (282 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-ost-spenat"
        },
        "lunch": {
          "name": "Kycklinggryta från medelhavet (368 kcal) rester"
        },
        "dinner": {
          "name": "Fänkålssallad med grapefrukt och burrata (470 kcal)",
          "recipeLink": "/kunskapsbank/recept/fankalssallad-grapefrukt-burrata"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Ugnsomelett med bär (395 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-bar"
        },
        "lunch": {
          "name": "Fänkålssallad med grapefrukt och burrata (470 kcal) rester"
        },
        "dinner": {
          "name": "Entrecote med haricot verts och bearnaisesås (371 kcal)Citronkaka med äpple och kardemumma (265 kcal)",
          "recipeLink": "/kunskapsbank/recept/stek-torsk-bearnaisesas"
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
          "recipeLink": "/kunskapsbank/recept/gronsakswok-tonfisk-agg"
        }
      }
    },
    "title": "Vecka 1: Synkroniserad från DOCX"
  },
  "week2": {
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Macka med ost(354 kcal)",
          "recipeLink": "/kunskapsbank/recept/macka-ost"
        },
        "lunch": {
          "name": "Grönsakswok med tonfisk och ägg (300 kcal) rester"
        },
        "dinner": {
          "name": "Lövbiffsgryta med champinjoner och grönsaksspagetti (440 kcal)",
          "recipeLink": "/kunskapsbank/recept/lovbiffsgryta-champinjoner-gronsaksspagetti"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Ägghack i salladsblad (315 kcal)",
          "recipeLink": "/kunskapsbank/recept/agghack-salladsblad-sallad"
        },
        "lunch": {
          "name": "Lövbiffsgryta med champinjoner och grönsaksspagetti (440 kcal) rester"
        },
        "dinner": {
          "name": "Lax med rödbetssallad (490 kcal)",
          "recipeLink": "/kunskapsbank/recept/lax-rodbetssallad-sallad"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Overnight oats med morot (423 kcal)",
          "recipeLink": "/kunskapsbank/recept/overnightoats-morot"
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
          "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-frukt"
        },
        "lunch": {
          "name": "Kycklingpizza (467 kcal) rester"
        },
        "dinner": {
          "name": "Spenatsoppa med rostade pumpafrön (308 kcal)",
          "recipeLink": "/kunskapsbank/recept/spenatsoppa-rostade-pumpafron"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Stekt ägg med champinjoner (264 kcal)",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-champinjoner"
        },
        "lunch": {
          "name": "Spenatsoppa rostade pumpafrön (308 kcal) rester"
        },
        "dinner": {
          "name": "Fisktaco med mangosalsa och sesamsås (656 kcal)",
          "recipeLink": "/kunskapsbank/recept/fisktaco-mangosalsa-sesamsas"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Smoothiebowl med mango och pistagenötter (440 kcal)",
          "recipeLink": "/kunskapsbank/recept/smoothiebowl-mango-pistagenotter"
        },
        "lunch": {
          "name": "Fisktaco med mangosalsa och sesamsås (656 kcal)rester"
        },
        "dinner": {
          "name": "Ajvarspett med grekisk sallad och tzatziki (550 kcal)Zucchinikaka med kardemumma (264 kcal)",
          "recipeLink": "/kunskapsbank/recept/grekisk-sallad-sallad"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Grön juice (130 kcal)",
          "recipeLink": "/kunskapsbank/recept/gron-juice-juice"
        },
        "lunch": {
          "name": "Ajvarspett med grekisk sallad och tzatziki (550 kcal) rester"
        },
        "dinner": {
          "name": "Kycklinggryta från medelhavet (368 kcal) rester från frysen"
        }
      }
    },
    "title": "Vecka 2: Synkroniserad från DOCX"
  },
  "week3": {
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
          "recipeLink": "/kunskapsbank/recept/fargstark-fetaostsallad-sallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Bananmuffin (169 kcal)",
          "recipeLink": "/kunskapsbank/recept/bananmuffin-mandel-kanel"
        },
        "lunch": {
          "name": "Färgstark fetaostsallad (410 kcal) rester"
        },
        "dinner": {
          "name": "Nötfärstimbaler med chévreost och soltorkad tomat (534 kcal)",
          "recipeLink": "/kunskapsbank/recept/notfarstimbaler-chevreost-soltorkad"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Kokt ägg med kaviar(231 kcal)",
          "recipeLink": "/kunskapsbank/recept/kokt-agg-kaviar"
        },
        "lunch": {
          "name": "Nötfärstimbaler med chévreost och soltorkad tomat (534 kcal) rester"
        },
        "dinner": {
          "name": "Laxsallad med fetaost (486 kcal)",
          "recipeLink": "/kunskapsbank/recept/laxsallad-fetaost-sallad"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Keso med bovetegranola och frukt (330 kcal)",
          "recipeLink": "/kunskapsbank/recept/keso-bovetegranola-frukt"
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
          "recipeLink": "/kunskapsbank/recept/chiapudding-jordgubbar-hallon"
        },
        "lunch": {
          "name": "Kycklingpizza (467 kcal) rester från frysen"
        },
        "dinner": {
          "name": "Torsk med guacamole och sötpotatis (518 kcal)",
          "recipeLink": "/kunskapsbank/recept/torsk-guacamole-sotpotatis"
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
          "recipeLink": "/kunskapsbank/recept/biff-nudelsallad-jordnotssas"
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
          "recipeLink": "/kunskapsbank/recept/morotssoppa-ingefara-rostade"
        }
      }
    },
    "title": "Vecka 3: Synkroniserad från DOCX"
  },
  "week4": {
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
          "recipeLink": "/kunskapsbank/recept/gronsakswok-kycklingfars"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola (279 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-granola"
        },
        "lunch": {
          "name": "Grönsakswok med kycklingfärs (328 kcal)rester"
        },
        "dinner": {
          "name": "Ugnsbakad blomkål med ratatouille (332 kcal)",
          "recipeLink": "/kunskapsbank/recept/ugnsbakad-blomkal-ratatouille"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Färskostmacka med ost och paprika(354 kcal)",
          "recipeLink": "/kunskapsbank/recept/macka-ost"
        },
        "lunch": {
          "name": "Ugnsbakad blomkål med ratatouille (332 kcal) rester"
        },
        "dinner": {
          "name": "Lövbiffsrullader med brie, pesto och rödbetor (655 kcal)",
          "recipeLink": "/kunskapsbank/recept/lovbiffsrullader-brie-pesto"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Äggröra med fetaost och spenat (317 kcal)",
          "recipeLink": "/kunskapsbank/recept/aggrora-fetaost-spenat"
        },
        "lunch": {
          "name": "Lövbiffsrullader med brie, pesto och rödbetor (655 kcal) rester"
        },
        "dinner": {
          "name": "Torsk med saffranssås (436 kcal)",
          "recipeLink": "/kunskapsbank/recept/torsk-saffranssas"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Bananmuffin (169 kcal)från frysen"
        },
        "lunch": {
          "name": "Torsk med saffranssås (436 kcal) rester"
        },
        "dinner": {
          "name": "Kycklingrullader med gorgonzola (401 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingrullader-gorgonzola"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Omelett med keso och bär (307 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-keso-bar"
        },
        "lunch": {
          "name": "Kycklingrullader med gorgonzola (401 kcal) rester"
        },
        "dinner": {
          "name": "Valnötslax med fetaostcrème (548 kcal) Stekta äpplen med vit chokladkräm (300 kcal)",
          "recipeLink": "/kunskapsbank/recept/stekta-applen-vit"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Blåbärssmoothie (160 kcal)",
          "recipeLink": "/kunskapsbank/recept/smoothie"
        },
        "lunch": {
          "name": "Valnötslax med fetaostcrème (548 kcal)rester"
        },
        "dinner": {
          "name": "Zucchiniplättar med yoghurtsås (341 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-yoghurtsas"
        }
      }
    },
    "title": "Vecka 4: Synkroniserad från DOCX"
  },
  "week5": {
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Blåbärssmoothie (160 kcal) rester"
        },
        "lunch": {
          "name": "Zucchiniplättar med yoghurtsås (341 kcal)rester"
        },
        "dinner": {
          "name": "Köttfärslimpa med tomat (445 kcal)",
          "recipeLink": "/kunskapsbank/recept/omelett-tomat"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Färskostmacka med ost och paprika(354 kcal)",
          "recipeLink": "/kunskapsbank/recept/macka-ost"
        },
        "lunch": {
          "name": "Köttfärslimpa med tomat (445 kcal) rester"
        },
        "dinner": {
          "name": "Linssoppa från medelhavet (375 kcal)rester från frysen"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Yoghurt med mango och apelsin (220 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-frukt"
        },
        "lunch": {
          "name": "Ugnsbakad blomkål med ratatouille (332 kcal) rester från frysen"
        },
        "dinner": {
          "name": "Pestotorsk med capresesallad (605 kcal)"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Stekt ägg med parmaskinka (271 kcal)",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-champinjoner"
        },
        "lunch": {
          "name": "Pestotorsk med capresesallad (605 kcal) rester"
        },
        "dinner": {
          "name": "Kyckling med blomkålsris och dillyoghurt (352 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine-portioner1"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Bananmuffin (169 kcal)från frysen"
        },
        "lunch": {
          "name": "Kyckling med blomkålsris och dillyoghurt (352 kcal) rester"
        },
        "dinner": {
          "name": "Nötgryta med rotfrukter (494 kcal)",
          "recipeLink": "/kunskapsbank/recept/lax-fetaost-rostade"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Äggröra med champinjoner (291 kcal)",
          "recipeLink": "/kunskapsbank/recept/aggrora-lax"
        },
        "lunch": {
          "name": "Nötgryta med rotfrukter (494 kcal) rester"
        },
        "dinner": {
          "name": "Quinoasallad med scampi och mango (586 kcal)Gino (325 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine-portioner1"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Bananpannkaka (200 kcal)"
        },
        "lunch": {
          "name": "Quinoasallad med scampi och mango (586 kcal)rester"
        },
        "dinner": {
          "name": "Grönkålspaj med champinjoner (430 kcal)",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-champinjoner"
        }
      }
    },
    "title": "Vecka 5: Synkroniserad från DOCX"
  },
  "week6": {
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Bananpannkaka (200 kcal)rester"
        },
        "lunch": {
          "name": "Grönkålspaj med champinjoner (430 kcal) rester"
        },
        "dinner": {
          "name": "Köttfärslimpa med tomat (445 kcal) rester från frysen"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Kokta ägg med kaviar (289 kcal)",
          "recipeLink": "/kunskapsbank/recept/kokta-agg-kaviar"
        },
        "lunch": {
          "name": "Nötgryta med rotfrukter (494 kcal) rester från frysen"
        },
        "dinner": {
          "name": "Stekt torsk med bearnaisesås och haricot verts (278 kcal)",
          "recipeLink": "/kunskapsbank/recept/stek-torsk-bearnaisesas"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola och bär (299 kcal)",
          "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-bar"
        },
        "lunch": {
          "name": "Stekt torsk med bearnaisesås och haricot verts (278 kcal)rester"
        },
        "dinner": {
          "name": "Kycklingfärsbiffar med vitlöksost (426 kcal)",
          "recipeLink": "/kunskapsbank/recept/kycklingfarsbiffar-vitloksost"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Varm chiagröt med äpple (274 kcal)",
          "recipeLink": "/kunskapsbank/recept/varm-chiagrot-apple"
        },
        "lunch": {
          "name": "Kycklingfärsbiffar med vitlöksost (426 kcal) rester"
        },
        "dinner": {
          "name": "Varma grönsaker med halloumi (382 kcal)",
          "recipeLink": "/kunskapsbank/recept/varma-gronsaker-halloumi"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Ägghack med kallrökt lax (300 kcal)",
          "recipeLink": "/kunskapsbank/recept/aggrora-lax"
        },
        "lunch": {
          "name": "Varma grönsaker med halloumi (382 kcal)rester"
        },
        "dinner": {
          "name": "Lax med quinoasallad och grapefrukt (590 kcal)",
          "recipeLink": "/kunskapsbank/recept/lax-quinoasallad-grapefrukt"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Smoothiebowl med blåbär och granola (305 kcal)",
          "recipeLink": "/kunskapsbank/recept/smoothiebowl-blabar-granola"
        },
        "lunch": {
          "name": "Lax med quinoasallad och grapefrukt (590 kcal)rester"
        },
        "dinner": {
          "name": "Hamburgare med grekisk sallad (560 kcal)Mandelkaka med choklad och hallon (385 kcal)",
          "recipeLink": "/kunskapsbank/recept/grekisk-sallad-sallad"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Smoothiebowl med blåbär och granola(305 kcal)",
          "recipeLink": "/kunskapsbank/recept/smoothiebowl-blabar-granola"
        },
        "lunch": {
          "name": "Hamburgare med grekisk sallad (560 kcal)rester"
        },
        "dinner": {
          "name": "Asiatisk köttfärswok med grönkål (280 kcal)",
          "recipeLink": "/kunskapsbank/recept/asiatisk-kycklingfars-gronkal"
        }
      }
    },
    "title": "Vecka 6: Synkroniserad från DOCX"
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

// Helper function to get meal for a specific day (1-42)
export function getMealForDay(dayNumber: number): DayMeals | null {
  const weekNumber = Math.ceil(dayNumber / 7);
  const dayInWeek = ((dayNumber - 1) % 7) + 1;
  return getMealPlan(weekNumber, dayInWeek);
}
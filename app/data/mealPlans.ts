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
export const mealPlans: Record<string, WeekMealPlan> = { "week1": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-ketomusli" }, "lunch": { "name": "Tonfisksallad med äpple", "recipeLink": "/kunskapsbank/recept/tonfisksallad-apple-sallad" }, "dinner": { "name": "Squashspagetti med köttfärssås", "recipeLink": "/kunskapsbank/recept/squashspagetti-kottfarssas" }
      }, "Tisdag": { "breakfast": { "name": "Stekt ägg med lax", "recipeLink": "/kunskapsbank/recept/stekt-agg-lax" }, "lunch": { "name": "Squashspagetti med köttfärssås rester", "recipeLink": "/kunskapsbank/recept/squashspagetti-kottfarssas" }, "dinner": { "name": "Het ratatouille", "recipeLink": "/kunskapsbank/recept/het-ratatouille" }
      }, "Onsdag": { "breakfast": { "name": "Grön juice", "recipeLink": "/kunskapsbank/recept/gron-juice-juice" }, "lunch": { "name": "Pokébowl med kyckling", "recipeLink": "/kunskapsbank/recept/poke-bowl-kyckling" }, "dinner": { "name": "Köttfärsbiffar med stekt blomkål", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-stekt-blomkal" }
      }, "Torsdag": { "breakfast": { "name": "Omelett med tomat", "recipeLink": "/kunskapsbank/recept/omelett-tomat" }, "lunch": { "name": "Het ratatouille rester", "recipeLink": "/kunskapsbank/recept/het-ratatouille" }, "dinner": { "name": "Pokébowl med kyckling rester", "recipeLink": "/kunskapsbank/recept/poke-bowl-kyckling" }
      }, "Fredag": { "breakfast": { "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg", "recipeLink": "/kunskapsbank/recept/havrefrallor-morotter-aprikoser" }, "lunch": { "name": "Köttfärsbiffar med stekt blomkålrester", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-stekt-blomkal" }, "dinner": { "name": "Kycklinggryta med bakad spetskål", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser" }
      }, "Lördag": { "breakfast": { "name": "Tropisk smoothiebowl", "recipeLink": "/kunskapsbank/recept/smoothie-smoothiebowl" }, "lunch": { "name": "Kycklinggryta med bakad spetskålrester", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser" }, "dinner": { "name": "Laxburgare med krämig grönsaksröra Mangoglass", "recipeLink": "/kunskapsbank/recept/laxburgare-med-kramig-gronsaksrora" }
      }, "Söndag": { "breakfast": { "name": "Tropisk smoothiebowl rester", "recipeLink": "/kunskapsbank/recept/smoothie-smoothiebowl" }, "lunch": { "name": "Laxburgare med krämig grönsaksröra rester", "recipeLink": "/kunskapsbank/recept/laxburgare-med-kramig-gronsaksrora" }, "dinner": { "name": "Ugnsbakad tomat med köttfärs", "recipeLink": "/kunskapsbank/recept/ugnsbakad-tomat-med-kottfars" }
      }
    }, "title": "Vecka 1: Synkroniserad från DOCX" }, "week2": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-ketomusli" }, "lunch": { "name": "Ugnsbakad tomat med köttfärs rester", "recipeLink": "/kunskapsbank/recept/ugnsbakad-tomat-med-kottfars" }, "dinner": { "name": "Nudelsoppa med grönsaker", "recipeLink": "/kunskapsbank/recept/nudelsoppa-med-gronsaker-2" }
      }, "Tisdag": { "breakfast": { "name": "Omelett med champinjoner", "recipeLink": "/kunskapsbank/recept/omelett-champinjoner" }, "lunch": { "name": "Nudelsoppa med grönsaker rester", "recipeLink": "/kunskapsbank/recept/nudelsoppa-med-gronsaker-2" }, "dinner": { "name": "Torskrygg med ägghack och sparris", "recipeLink": "/kunskapsbank/recept/torskrygg-med-agghack-och-sparris" }
      }, "Onsdag": { "breakfast": { "name": "Morotsjuice", "recipeLink": "/kunskapsbank/recept/morotsjuice-juice" }, "lunch": { "name": "Torskrygg med ägghack och sparrisrester", "recipeLink": "/kunskapsbank/recept/torskrygg-med-agghack-och-sparris" }, "dinner": { "name": "Turkiska lammfärsspett med raita och sallad", "recipeLink": "/kunskapsbank/recept/turkiska-lammfarsspett-med-raita-och-sallad" }
      }, "Torsdag": { "breakfast": { "name": "Morotsjuice", "recipeLink": "/kunskapsbank/recept/morotsjuice-juice" }, "lunch": { "name": "Turkiska lammfärsspett med raita och salladrester", "recipeLink": "/kunskapsbank/recept/turkiska-lammfarsspett-med-raita-och-sallad" }, "dinner": { "name": "Kycklingröra med örter och tomat", "recipeLink": "/kunskapsbank/recept/kycklingrora-med-orter-och-tomat" }
      }, "Fredag": { "breakfast": { "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg", "recipeLink": "/kunskapsbank/recept/havrefrallor-morotter-aprikoser" }, "lunch": { "name": "Kycklingröra med örter och tomat rester", "recipeLink": "/kunskapsbank/recept/kycklingrora-med-orter-och-tomat" }, "dinner": { "name": "Lax med fetaost och rostade rotfrukter och brysselkål", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }
      }, "Lördag": { "breakfast": { "name": "Blåbärs smoothiebowl" }, "lunch": { "name": "Lax med fetaost och rostade rotfrukter och brysselkålrester", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }, "dinner": { "name": "Asiatiska köttbullar med nudelsalladMango och jordgubbar med vit chokladcréme", "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad" }
      }, "Söndag": { "breakfast": { "name": "Blåbärs smoothiebowl rester" }, "lunch": { "name": "Asiatiska köttbullar med nudelsalladrester", "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad" }, "dinner": { "name": "Päronsallad med chévreost", "recipeLink": "/kunskapsbank/recept/paronsallad-med-chevreost" }
      }
    }, "title": "Vecka 2: Synkroniserad från DOCX" }, "week3": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-ketomusli" }, "lunch": { "name": "Päronsallad med chévreostrester", "recipeLink": "/kunskapsbank/recept/paronsallad-med-chevreost" }, "dinner": { "name": "Kycklingfylld aubergine", "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine" }
      }, "Tisdag": { "breakfast": { "name": "Äggröra med rökt lax", "recipeLink": "/kunskapsbank/recept/aggrora-lax-2" }, "lunch": { "name": "Kycklingfylld aubergine rester", "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine" }, "dinner": { "name": "Rökt lax med blomkålssallad och citronyoghurt", "recipeLink": "/kunskapsbank/recept/rokt-lax-med-blomkalsallad-och-citronyoghurt" }
      }, "Onsdag": { "breakfast": { "name": "Rödbetsjuice", "recipeLink": "/kunskapsbank/recept/rodbetsjuice-juice" }, "lunch": { "name": "Rökt lax med blomkålssallad och citronyoghurt rester", "recipeLink": "/kunskapsbank/recept/rokt-lax-med-blomkalsallad-och-citronyoghurt" }, "dinner": { "name": "Vegetarisk currygryta med panéer", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }
      }, "Torsdag": { "breakfast": { "name": "Rödbetsjuicerester", "recipeLink": "/kunskapsbank/recept/rodbetsjuice-juice" }, "lunch": { "name": "Vegetarisk currygryta med panéerrester", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }, "dinner": { "name": "Kycklinggryta med bakad spetskålrester från fysen" }
      }, "Fredag": { "breakfast": { "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg", "recipeLink": "/kunskapsbank/recept/havrefrallor-morotter-aprikoser" }, "lunch": { "name": "Lax med fetaost och rostade rotfrukter och brysselkålrester från frysen", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }, "dinner": { "name": "Högrevsburgare med hummus", "recipeLink": "/kunskapsbank/recept/hamburgare-med-hummus" }
      }, "Lördag": { "breakfast": { "name": "Keso med granola och fruktsallad", "recipeLink": "/kunskapsbank/recept/keso-granola-fruktsallad" }, "lunch": { "name": "Högrevsburgare med hummusrester", "recipeLink": "/kunskapsbank/recept/hamburgare-med-hummus" }, "dinner": { "name": "Ugnsbakad kyckling med tzatziki och salladMandel och citronpaj", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad" }
      }, "Söndag": { "breakfast": { "name": "Omelett med hallon", "recipeLink": "/kunskapsbank/recept/omelett-hallon" }, "lunch": { "name": "Ugnsbakad kyckling med tzatziki och sallad rester", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad" }, "dinner": { "name": "Lax med waldorfsallad", "recipeLink": "/kunskapsbank/recept/lax-med-waldorfsallad" }
      }
    }, "title": "Vecka 3: Synkroniserad från DOCX" }, "week4": { "days": { "Måndag": { "breakfast": { "name": "Omelett med bär", "recipeLink": "/kunskapsbank/recept/omelett-bar" }, "lunch": { "name": "Lax med waldorfsalladrester", "recipeLink": "/kunskapsbank/recept/lax-med-waldorfsallad" }, "dinner": { "name": "Grekiska köttbullar i tomatsås med rostad sötpotatis", "recipeLink": "/kunskapsbank/recept/grekiska-kottbullar-i-tomatsas" }
      }, "Tisdag": { "breakfast": { "name": "Ägghack med kalkon", "recipeLink": "/kunskapsbank/recept/agghack-kalkon" }, "lunch": { "name": "Grekiska köttbullar i tomatsås med rostad sötpotatis rester", "recipeLink": "/kunskapsbank/recept/grekiska-kottbullar-i-tomatsas" }, "dinner": { "name": "Kycklinggryta med röda linser", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser" }
      }, "Onsdag": { "breakfast": { "name": "Fruktsmoothie", "recipeLink": "/kunskapsbank/recept/smoothie-2" }, "lunch": { "name": "Kycklinggryta med röda linser rester", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser" }, "dinner": { "name": "Laxsallad med vindruvor", "recipeLink": "/kunskapsbank/recept/laxsallad-med-vindruvor" }
      }, "Torsdag": { "breakfast": { "name": "Fruktsmoothie rester", "recipeLink": "/kunskapsbank/recept/smoothie-2" }, "lunch": { "name": "Laxsallad med vindruvorrester", "recipeLink": "/kunskapsbank/recept/laxsallad-med-vindruvor" }, "dinner": { "name": "Asiatiska köttbullar med nudelsalladrester från fysen" }
      }, "Fredag": { "breakfast": { "name": "Bananplättar med mango och granatäpple", "recipeLink": "/kunskapsbank/recept/bananplattar-med-mango-och-granatapple" }, "lunch": { "name": "Vegetarisk currygryta med panéerrester från frysen", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }, "dinner": { "name": "Grillade köttspett med grekisk sallad och morotstzatziki", "recipeLink": "/kunskapsbank/recept/grekisk-sallad" }
      }, "Lördag": { "breakfast": { "name": "Keso med hallon och granatäpple", "recipeLink": "/kunskapsbank/recept/keso-hallon-granatapple" }, "lunch": { "name": "Grillade köttspett med grekisk sallad och morotstzatzikirester", "recipeLink": "/kunskapsbank/recept/grekisk-sallad" }, "dinner": { "name": "Ugnsbakad kyckling med quinoasallad och chilimajjoHallon och kiwi med vit chokladcréme", "recipeLink": "/kunskapsbank/recept/hallon-och-kiwi-med-vit-chokladcreme" }
      }, "Söndag": { "breakfast": { "name": "Havregrynsgröt med torkad frukt och äpple", "recipeLink": "/kunskapsbank/recept/havregrynsgrot-torkad-frukt" }, "lunch": { "name": "Ugnsbakad kyckling med tzatziki och sallad rester" }, "dinner": { "name": "Torsk från mellanöstern", "recipeLink": "/kunskapsbank/recept/torsk-fran-mellanostern" }
      }
    }, "title": "Vecka 4: Synkroniserad från DOCX" }, "week5": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-ketomusli" }, "lunch": { "name": "Torsk från mellanöstern rester", "recipeLink": "/kunskapsbank/recept/torsk-fran-mellanostern" }, "dinner": { "name": "Japansk kycklingfärswok med groddar (320 kcal", "recipeLink": "/kunskapsbank/recept/japansk-kycklingfarswok-med-groddar" }
      }, "Tisdag": { "breakfast": { "name": "Äggröra med paprika", "recipeLink": "/kunskapsbank/recept/aggrora-paprika" }, "lunch": { "name": "Japansk kycklingfärswok med groddar (320 kcal rester", "recipeLink": "/kunskapsbank/recept/japansk-kycklingfarswok-med-groddar" }, "dinner": { "name": "Grekisk sallad med fetaost", "recipeLink": "/kunskapsbank/recept/grekisk-sallad" }
      }, "Onsdag": { "breakfast": { "name": "Chiafrögröt", "recipeLink": "/kunskapsbank/recept/chiafrogrot" }, "lunch": { "name": "Lax med fetaost och rostade rotfrukter och brysselkålrester från fysen" }, "dinner": { "name": "Köttfärslimpa med ajvar och rostad sötpotatis", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-ajvar-och-rostad-sotpotatis" }
      }, "Torsdag": { "breakfast": { "name": "Bananplättar med jordgubbar och kokos", "recipeLink": "/kunskapsbank/recept/bananplattar-jordgubbar-kokos" }, "lunch": { "name": "Köttfärslimpa med ajvar, fetaost och rostad sötpotatisrester" }, "dinner": { "name": "Vegetarisk currygryta med panéerrester från frysen" }
      }, "Fredag": { "breakfast": { "name": "Bananplättar med jordgubbar och kokos rester", "recipeLink": "/kunskapsbank/recept/bananplattar-jordgubbar-kokos" }, "lunch": { "name": "Kycklinggryta med röda linser rester från frysen", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser" }, "dinner": { "name": "Skaldjursgryta med torsk i gul curry", "recipeLink": "/kunskapsbank/recept/skaldjursgryta-med-torsk-i-gul-curry" }
      }, "Lördag": { "breakfast": { "name": "Mangosmoothie med spenat", "recipeLink": "/kunskapsbank/recept/smoothie-spenat" }, "lunch": { "name": "Skaldjursgryta med torsk i gul curryrester", "recipeLink": "/kunskapsbank/recept/skaldjursgryta-med-torsk-i-gul-curry" }, "dinner": { "name": "Kycklingjärpar med linssalladMandelkaka med frukt", "recipeLink": "/kunskapsbank/recept/kycklingjarpar-med-linssallad" }
      }, "Söndag": { "breakfast": { "name": "Mangosmoothie med spenat rester", "recipeLink": "/kunskapsbank/recept/smoothie-spenat" }, "lunch": { "name": "Kycklingjärpar med linssalladrester", "recipeLink": "/kunskapsbank/recept/kycklingjarpar-med-linssallad" }, "dinner": { "name": "Laxfilé med ratatouille", "recipeLink": "/kunskapsbank/recept/laxfile-med-ratatouille" }
      }
    }, "title": "Vecka 5: Synkroniserad från DOCX" }, "week6": { "days": { "Måndag": { "breakfast": { "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg", "recipeLink": "/kunskapsbank/recept/havrefrallor-morotter-aprikoser" }, "lunch": { "name": "Laxfilé med ratatouille rester", "recipeLink": "/kunskapsbank/recept/laxfile-med-ratatouille" }, "dinner": { "name": "Grönsakswok med kyckling", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kyckling" }
      }, "Tisdag": { "breakfast": { "name": "Kokt ägg med majonnäs", "recipeLink": "/kunskapsbank/recept/kokt-agg-majonnas" }, "lunch": { "name": "Grönsakswok med kyckling rester", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kyckling" }, "dinner": { "name": "Köttfärspytt med italienska smaker", "recipeLink": "/kunskapsbank/recept/kottfarspytt-med-italienska-smaker" }
      }, "Onsdag": { "breakfast": { "name": "Mango med keso och nötter", "recipeLink": "/kunskapsbank/recept/mango-keso-notter" }, "lunch": { "name": "Köttfärspytt med italienska smaker rester", "recipeLink": "/kunskapsbank/recept/kottfarspytt-med-italienska-smaker" }, "dinner": { "name": "Indisk laxgryta med röda linser", "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-med-roda-linser" }
      }, "Torsdag": { "breakfast": { "name": "Äggröra med granatäpple och kiwi", "recipeLink": "/kunskapsbank/recept/aggrora-granatapple-kiwi" }, "lunch": { "name": "Indisk laxgryta med röda linserrester", "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-med-roda-linser" }, "dinner": { "name": "Quinoasallad med stekt halloumi", "recipeLink": "/kunskapsbank/recept/quinoasallad-med-stekt-halloumi" }
      }, "Fredag": { "breakfast": { "name": "Havregrynsgröt med apelsin och kokos", "recipeLink": "/kunskapsbank/recept/havregrynsgrot-apelsin-kokos" }, "lunch": { "name": "Quinoasallad med stekt halloumi rester", "recipeLink": "/kunskapsbank/recept/quinoasallad-med-stekt-halloumi" }, "dinner": { "name": "Torsk teriyaki med grönsaker", "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker" }
      }, "Lördag": { "breakfast": { "name": "Hallon- och blåbärssmoothie", "recipeLink": "/kunskapsbank/recept/smoothie-blabarssmoothie" }, "lunch": { "name": "Torsk teriyaki med grönsakerrester", "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker" }, "dinner": { "name": "Lammgryta med plommon och bulgurTropisk fruktsallad", "recipeLink": "/kunskapsbank/recept/lammgryta-med-plommon-och-bulgur" }
      }, "Söndag": { "breakfast": { "name": "Hallon- och blåbärssmoothie rester", "recipeLink": "/kunskapsbank/recept/smoothie-blabarssmoothie" }, "lunch": { "name": "Lammgryta plommon och bulgurrester" }, "dinner": { "name": "Kycklinggryta med bakad spetskålrester från frysen", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser" }
      }
    }, "title": "Vecka 6: Synkroniserad från DOCX" }
};

// Functional Flow meal plans
export const flowMealPlans: Record<string, WeekMealPlan> = { "week1": { "days": { "Måndag": { "breakfast": { "name": "Färskostmacka med tomat", "recipeLink": "/kunskapsbank/recept/farskostmacka-med-tomat" }, "lunch": { "name": "Linssoppa från medelhavet", "recipeLink": "/kunskapsbank/recept/linssoppa-medelhavet-soppa" }, "dinner": { "name": "Kycklingburgare med papayasallad", "recipeLink": "/kunskapsbank/recept/kycklingburgare-papayasallad-sallad" }
      }, "Tisdag": { "breakfast": { "name": "Äggröra med asiatisk avokadosallad", "recipeLink": "/kunskapsbank/recept/aggrora-asiatisk-avokadosallad" }, "lunch": { "name": "Kycklingburgare med papayasalladrester", "recipeLink": "/kunskapsbank/recept/kycklingburgare-papayasallad-sallad" }, "dinner": { "name": "Köttfärsbiffar med tomatsallad", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-stekt-blomkal" }
      }, "Onsdag": { "breakfast": { "name": "Choklad- och kokoschiapudding", "recipeLink": "/kunskapsbank/recept/choklad-kokoschiapudding" }, "lunch": { "name": "Köttfärsbiffar med tomatsalladrester", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-stekt-blomkal" }, "dinner": { "name": "Laxgratäng med scampi och broccoli", "recipeLink": "/kunskapsbank/recept/laxgratang-med-broccoli-och-scampi" }
      }, "Torsdag": { "breakfast": { "name": "Keso med bovetegranola", "recipeLink": "/kunskapsbank/recept/keso-bovetegranola-granola" }, "lunch": { "name": "Laxgratäng med scampi och broccolirester", "recipeLink": "/kunskapsbank/recept/laxgratang-med-broccoli-och-scampi" }, "dinner": { "name": "Kycklinggryta från medelhavet", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }
      }, "Fredag": { "breakfast": { "name": "Omelett med ost och spenat", "recipeLink": "/kunskapsbank/recept/omelett-ost-spenat" }, "lunch": { "name": "Kycklinggryta från medelhavet rester", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }, "dinner": { "name": "Fänkålssallad med grapefrukt och burrata", "recipeLink": "/kunskapsbank/recept/fankalssallad-med-grapefrukt-och-burrata" }
      }, "Lördag": { "breakfast": { "name": "Ugnsomelett med bär", "recipeLink": "/kunskapsbank/recept/omelett-bar" }, "lunch": { "name": "Fänkålssallad med grapefrukt och burrata rester", "recipeLink": "/kunskapsbank/recept/fankalssallad-med-grapefrukt-och-burrata" }, "dinner": { "name": "Entrecote med haricot verts och bearnaisesåsCitronkaka med äpple och kardemumma", "recipeLink": "/kunskapsbank/recept/stek-torsk-med-bearnaisesas-och-haricot-verts" }
      }, "Söndag": { "breakfast": { "name": "Ugnsomelett med bär rester", "recipeLink": "/kunskapsbank/recept/omelett-bar" }, "lunch": { "name": "Entrecote med haricot verts och bearnaisesås rester", "recipeLink": "/kunskapsbank/recept/stek-torsk-med-bearnaisesas-och-haricot-verts" }, "dinner": { "name": "Grönsakswok med tonfisk och ägg", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-tonfisk-och-agg" }
      }
    }, "title": "Vecka 1: Synkroniserad från DOCX" }, "week2": { "days": { "Måndag": { "breakfast": { "name": "Macka med ost", "recipeLink": "/kunskapsbank/recept/macka-ost" }, "lunch": { "name": "Grönsakswok med tonfisk och ägg rester", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-tonfisk-och-agg" }, "dinner": { "name": "Lövbiffsgryta med champinjoner och grönsaksspagetti", "recipeLink": "/kunskapsbank/recept/lovbiffsgryta-med-champinjoner-och-gronsaksspagetti" }
      }, "Tisdag": { "breakfast": { "name": "Ägghack i salladsblad", "recipeLink": "/kunskapsbank/recept/agghack-salladsblad-sallad" }, "lunch": { "name": "Lövbiffsgryta med champinjoner och grönsaksspagetti rester", "recipeLink": "/kunskapsbank/recept/lovbiffsgryta-med-champinjoner-och-gronsaksspagetti" }, "dinner": { "name": "Lax med rödbetssallad", "recipeLink": "/kunskapsbank/recept/lax-med-rodbetssallad" }
      }, "Onsdag": { "breakfast": { "name": "Overnight oats med morot", "recipeLink": "/kunskapsbank/recept/overnightoats-morot" }, "lunch": { "name": "Lax med rödbetssallad rester", "recipeLink": "/kunskapsbank/recept/lax-med-rodbetssallad" }, "dinner": { "name": "Kycklingpizza", "recipeLink": "/kunskapsbank/recept/kycklingpizza" }
      }, "Torsdag": { "breakfast": { "name": "Yoghurt med bovetegranola och frukt", "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-frukt" }, "lunch": { "name": "Kycklingpizza rester", "recipeLink": "/kunskapsbank/recept/kycklingpizza" }, "dinner": { "name": "Spenatsoppa med rostade pumpafrön", "recipeLink": "/kunskapsbank/recept/spenatsoppa-med-rostade-pumpafron" }
      }, "Fredag": { "breakfast": { "name": "Stekt ägg med champinjoner", "recipeLink": "/kunskapsbank/recept/stekt-agg-champinjoner" }, "lunch": { "name": "Spenatsoppa rostade pumpafrön rester" }, "dinner": { "name": "Fisktaco med mangosalsa och sesamsås", "recipeLink": "/kunskapsbank/recept/fisktaco-med-mangosalsa-och-sesamsas" }
      }, "Lördag": { "breakfast": { "name": "Smoothiebowl med mango och pistagenötter", "recipeLink": "/kunskapsbank/recept/smoothiebowl-mango-pistagenotter" }, "lunch": { "name": "Fisktaco med mangosalsa och sesamsåsrester", "recipeLink": "/kunskapsbank/recept/fisktaco-med-mangosalsa-och-sesamsas" }, "dinner": { "name": "Ajvarspett med grekisk sallad och tzatzikiZucchinikaka med kardemumma", "recipeLink": "/kunskapsbank/recept/grekisk-sallad" }
      }, "Söndag": { "breakfast": { "name": "Grön juice", "recipeLink": "/kunskapsbank/recept/gron-juice-juice" }, "lunch": { "name": "Ajvarspett med grekisk sallad och tzatziki rester", "recipeLink": "/kunskapsbank/recept/grekisk-sallad" }, "dinner": { "name": "Kycklinggryta från medelhavet rester från frysen", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }
      }
    }, "title": "Vecka 2: Synkroniserad från DOCX" }, "week3": { "days": { "Måndag": { "breakfast": { "name": "Grön juice rester", "recipeLink": "/kunskapsbank/recept/gron-juice-juice" }, "lunch": { "name": "Kycklinggryta från medelhavet rester från frysen" }, "dinner": { "name": "Färgstark fetaostsallad", "recipeLink": "/kunskapsbank/recept/fargstark-fetaostsallad" }
      }, "Tisdag": { "breakfast": { "name": "Bananmuffin", "recipeLink": "/kunskapsbank/recept/bananmuffins-med-mandel-och-kanel" }, "lunch": { "name": "Färgstark fetaostsallad rester", "recipeLink": "/kunskapsbank/recept/fargstark-fetaostsallad" }, "dinner": { "name": "Nötfärstimbaler med chévreost och soltorkad tomat", "recipeLink": "/kunskapsbank/recept/notfarstimbaler-med-chevreost-och-soltorkad-tomat" }
      }, "Onsdag": { "breakfast": { "name": "Kokt ägg med kaviar", "recipeLink": "/kunskapsbank/recept/kokt-agg-kaviar" }, "lunch": { "name": "Nötfärstimbaler med chévreost och soltorkad tomat rester", "recipeLink": "/kunskapsbank/recept/notfarstimbaler-med-chevreost-och-soltorkad-tomat" }, "dinner": { "name": "Laxsallad med fetaost", "recipeLink": "/kunskapsbank/recept/laxsallad-med-fetaost" }
      }, "Torsdag": { "breakfast": { "name": "Keso med bovetegranola och frukt", "recipeLink": "/kunskapsbank/recept/keso-bovetegranola-frukt" }, "lunch": { "name": "Laxsallad med fetaost rester", "recipeLink": "/kunskapsbank/recept/laxsallad-med-fetaost" }, "dinner": { "name": "Spenatsoppa rostade pumpafrön rester från frysen" }
      }, "Fredag": { "breakfast": { "name": "Chiapudding med jordgubbar och hallon", "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbar-och-hallon" }, "lunch": { "name": "Kycklingpizza rester från frysen", "recipeLink": "/kunskapsbank/recept/kycklingpizza" }, "dinner": { "name": "Torsk med guacamole och sötpotatis", "recipeLink": "/kunskapsbank/recept/torsk-med-guacamole-och-sotpotatis" }
      }, "Lördag": { "breakfast": { "name": "Chiapudding med jordgubbar och hallon rester", "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbar-och-hallon" }, "lunch": { "name": "Torsk med guacamole och sötpotatis rester", "recipeLink": "/kunskapsbank/recept/torsk-med-guacamole-och-sotpotatis" }, "dinner": { "name": "Biff med nudelsallad och jordnötssåsChokladbar med majskakor", "recipeLink": "/kunskapsbank/recept/biff-med-nudelsallad-och-jordnotssas" }
      }, "Söndag": { "breakfast": { "name": "Omelettrulle", "recipeLink": "/kunskapsbank/recept/omelettrulle" }, "lunch": { "name": "Biff med nudelsallad och jordnötssås rester", "recipeLink": "/kunskapsbank/recept/biff-med-nudelsallad-och-jordnotssas" }, "dinner": { "name": "Morotssoppa med ingefära och rostade kikärtor", "recipeLink": "/kunskapsbank/recept/morotssoppa-med-ingefara-och-rostade-kikartor" }
      }
    }, "title": "Vecka 3: Synkroniserad från DOCX" }, "week4": { "days": { "Måndag": { "breakfast": { "name": "Omelettrulle rester", "recipeLink": "/kunskapsbank/recept/omelettrulle" }, "lunch": { "name": "Morotssoppa med ingefära och rostade kikärtorRester" }, "dinner": { "name": "Grönsakswok med kycklingfärs", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kycklingfars" }
      }, "Tisdag": { "breakfast": { "name": "Yoghurt med bovetegranola", "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-granola" }, "lunch": { "name": "Grönsakswok med kycklingfärsrester", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kycklingfars" }, "dinner": { "name": "Ugnsbakad blomkål med ratatouille", "recipeLink": "/kunskapsbank/recept/ugnsbakad-blomkal-med-ratatouille" }
      }, "Onsdag": { "breakfast": { "name": "Färskostmacka med ost och paprika", "recipeLink": "/kunskapsbank/recept/macka-ost" }, "lunch": { "name": "Ugnsbakad blomkål med ratatouille rester", "recipeLink": "/kunskapsbank/recept/ugnsbakad-blomkal-med-ratatouille" }, "dinner": { "name": "Lövbiffsrullader med brie, pesto och rödbetor", "recipeLink": "/kunskapsbank/recept/lovbiffsrullader-med-brie-pesto-och-rodbetor" }
      }, "Torsdag": { "breakfast": { "name": "Äggröra med fetaost och spenat", "recipeLink": "/kunskapsbank/recept/aggrora-fetaost-spenat" }, "lunch": { "name": "Lövbiffsrullader med brie, pesto och rödbetor rester", "recipeLink": "/kunskapsbank/recept/lovbiffsrullader-med-brie-pesto-och-rodbetor" }, "dinner": { "name": "Torsk med saffranssås", "recipeLink": "/kunskapsbank/recept/torsk-med-saffranssas" }
      }, "Fredag": { "breakfast": { "name": "Bananmuffinfrån frysen" }, "lunch": { "name": "Torsk med saffranssås rester", "recipeLink": "/kunskapsbank/recept/torsk-med-saffranssas" }, "dinner": { "name": "Kycklingrullader med gorgonzola", "recipeLink": "/kunskapsbank/recept/kycklingrullader-med-gorgonzola" }
      }, "Lördag": { "breakfast": { "name": "Omelett med keso och bär", "recipeLink": "/kunskapsbank/recept/omelett-keso-bar" }, "lunch": { "name": "Kycklingrullader med gorgonzola rester", "recipeLink": "/kunskapsbank/recept/kycklingrullader-med-gorgonzola" }, "dinner": { "name": "Valnötslax med fetaostcrème Stekta äpplen med vit chokladkräm", "recipeLink": "/kunskapsbank/recept/stekta-applen-med-vit-chokladkram" }
      }, "Söndag": { "breakfast": { "name": "Blåbärssmoothie", "recipeLink": "/kunskapsbank/recept/gron-smoothie" }, "lunch": { "name": "Valnötslax med fetaostcrèmerester", "recipeLink": "/kunskapsbank/recept/stekta-applen-med-vit-chokladkram" }, "dinner": { "name": "Zucchiniplättar med yoghurtsås", "recipeLink": "/kunskapsbank/recept/zucchiniplattar-med-yoghurtsas" }
      }
    }, "title": "Vecka 4: Synkroniserad från DOCX" }, "week5": { "days": { "Måndag": { "breakfast": { "name": "Blåbärssmoothie rester", "recipeLink": "/kunskapsbank/recept/smoothie-blabarssmoothie" }, "lunch": { "name": "Zucchiniplättar med yoghurtsåsrester", "recipeLink": "/kunskapsbank/recept/zucchiniplattar-med-yoghurtsas" }, "dinner": { "name": "Köttfärslimpa med tomat", "recipeLink": "/kunskapsbank/recept/omelett-tomat" }
      }, "Tisdag": { "breakfast": { "name": "Färskostmacka med ost och paprika", "recipeLink": "/kunskapsbank/recept/macka-ost" }, "lunch": { "name": "Köttfärslimpa med tomat rester", "recipeLink": "/kunskapsbank/recept/omelett-tomat" }, "dinner": { "name": "Linssoppa från medelhavetrester från frysen", "recipeLink": "/kunskapsbank/recept/linssoppa-medelhavet-soppa" }
      }, "Onsdag": { "breakfast": { "name": "Yoghurt med mango och apelsin", "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-frukt" }, "lunch": { "name": "Ugnsbakad blomkål med ratatouille rester från frysen", "recipeLink": "/kunskapsbank/recept/ugnsbakad-blomkal-med-ratatouille" }, "dinner": { "name": "Pestotorsk med capresesallad" }
      }, "Torsdag": { "breakfast": { "name": "Stekt ägg med parmaskinka", "recipeLink": "/kunskapsbank/recept/stekt-agg-champinjoner" }, "lunch": { "name": "Pestotorsk med capresesallad rester" }, "dinner": { "name": "Kyckling med blomkålsris och dillyoghurt", "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine" }
      }, "Fredag": { "breakfast": { "name": "Bananmuffinfrån frysen" }, "lunch": { "name": "Kyckling med blomkålsris och dillyoghurt rester", "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine" }, "dinner": { "name": "Nötgryta med rotfrukter", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }
      }, "Lördag": { "breakfast": { "name": "Äggröra med champinjoner", "recipeLink": "/kunskapsbank/recept/aggrora-lax-2" }, "lunch": { "name": "Nötgryta med rotfrukter rester", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }, "dinner": { "name": "Quinoasallad med scampi och mangoGino", "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine" }
      }, "Söndag": { "breakfast": { "name": "Bananpannkaka" }, "lunch": { "name": "Quinoasallad med scampi och mangorester", "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine" }, "dinner": { "name": "Grönkålspaj med champinjoner", "recipeLink": "/kunskapsbank/recept/stekt-agg-champinjoner" }
      }
    }, "title": "Vecka 5: Synkroniserad från DOCX" }, "week6": { "days": { "Måndag": { "breakfast": { "name": "Bananpannkakarester" }, "lunch": { "name": "Grönkålspaj med champinjoner rester", "recipeLink": "/kunskapsbank/recept/stekt-agg-champinjoner" }, "dinner": { "name": "Köttfärslimpa med tomat rester från frysen", "recipeLink": "/kunskapsbank/recept/omelett-tomat" }
      }, "Tisdag": { "breakfast": { "name": "Kokta ägg med kaviar", "recipeLink": "/kunskapsbank/recept/kokt-agg-kaviar" }, "lunch": { "name": "Nötgryta med rotfrukter rester från frysen", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }, "dinner": { "name": "Stekt torsk med bearnaisesås och haricot verts", "recipeLink": "/kunskapsbank/recept/stek-torsk-med-bearnaisesas-och-haricot-verts" }
      }, "Onsdag": { "breakfast": { "name": "Yoghurt med bovetegranola och bär", "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-bar" }, "lunch": { "name": "Stekt torsk med bearnaisesås och haricot vertsrester", "recipeLink": "/kunskapsbank/recept/stek-torsk-med-bearnaisesas-och-haricot-verts" }, "dinner": { "name": "Kycklingfärsbiffar med vitlöksost", "recipeLink": "/kunskapsbank/recept/kycklingfarsbiffar-med-vitloksost" }
      }, "Torsdag": { "breakfast": { "name": "Varm chiagröt med äpple", "recipeLink": "/kunskapsbank/recept/varm-chiagrot-apple" }, "lunch": { "name": "Kycklingfärsbiffar med vitlöksost rester", "recipeLink": "/kunskapsbank/recept/kycklingfarsbiffar-med-vitloksost" }, "dinner": { "name": "Varma grönsaker med halloumi", "recipeLink": "/kunskapsbank/recept/varma-gronsaker-med-halloumi" }
      }, "Fredag": { "breakfast": { "name": "Ägghack med kallrökt lax", "recipeLink": "/kunskapsbank/recept/aggrora-lax-2" }, "lunch": { "name": "Varma grönsaker med halloumirester", "recipeLink": "/kunskapsbank/recept/varma-gronsaker-med-halloumi" }, "dinner": { "name": "Lax med quinoasallad och grapefrukt", "recipeLink": "/kunskapsbank/recept/lax-med-quinoasallad-och-grapefrukt" }
      }, "Lördag": { "breakfast": { "name": "Smoothiebowl med blåbär och granola", "recipeLink": "/kunskapsbank/recept/smoothiebowl-blabar-granola" }, "lunch": { "name": "Lax med quinoasallad och grapefruktrester", "recipeLink": "/kunskapsbank/recept/lax-med-quinoasallad-och-grapefrukt" }, "dinner": { "name": "Hamburgare med grekisk salladMandelkaka med choklad och hallon", "recipeLink": "/kunskapsbank/recept/grekisk-sallad" }
      }, "Söndag": { "breakfast": { "name": "Smoothiebowl med blåbär och granola", "recipeLink": "/kunskapsbank/recept/smoothiebowl-blabar-granola" }, "lunch": { "name": "Hamburgare med grekisk salladrester", "recipeLink": "/kunskapsbank/recept/grekisk-sallad" }, "dinner": { "name": "Asiatisk köttfärswok med grönkål", "recipeLink": "/kunskapsbank/recept/asiatisk-kycklingfars-med-gronkal" }
      }
    }, "title": "Vecka 6: Synkroniserad från DOCX" }
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

// Functional Energy meal plans
export const energyMealPlans: Record<string, WeekMealPlan> = {
  "week1": {
    "days": {
      "Måndag": {
        "breakfast": { "name": "Grön smoothie med avokado och hampaprotein", "recipeLink": "/kunskapsbank/recept/gron-smoothie-med-avokado-och-hampaprotein" },
        "lunch": { "name": "Fröknäcke med hummus och ägg", "recipeLink": "/kunskapsbank/recept/frokpacke-med-hummus-och-agg" },
        "dinner": { "name": "Ugnsbakad lax med grönkål och tahinidressing", "recipeLink": "/kunskapsbank/recept/ugnsbakad-lax-med-gronkal-och-tahinidressing" }
      },
      "Tisdag": {
        "breakfast": { "name": "Kokosgröt med kanelstekta äpplen", "recipeLink": "/kunskapsbank/recept/kokosgrot-med-kanelstekta-applen" },
        "lunch": { "name": "Ugnsbakad lax med grönkål rester", "recipeLink": "/kunskapsbank/recept/ugnsbakad-lax-med-gronkal-och-tahinidressing" },
        "dinner": { "name": "Kycklinggryta med blomkålsris", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-blomkalsris" }
      },
      "Onsdag": {
        "breakfast": { "name": "Äggmuffins med spenat och fetaost", "recipeLink": "/kunskapsbank/recept/aggmuffins-med-spenat-och-fetaost" },
        "lunch": { "name": "Kycklinggryta med blomkålsris rester", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-blomkalsris" },
        "dinner": { "name": "Linsgryta med kokos och ingefära", "recipeLink": "/kunskapsbank/recept/linsgryta-med-kokos-och-ingefara" }
      },
      "Torsdag": {
        "breakfast": { "name": "Chiafrötpudding med bär och mandlar", "recipeLink": "/kunskapsbank/recept/chiafrotpudding-med-bar-och-mandlar" },
        "lunch": { "name": "Linsgryta med kokos och ingefära rester", "recipeLink": "/kunskapsbank/recept/linsgryta-med-kokos-och-ingefara" },
        "dinner": { "name": "Laxburgare med avokadokräm", "recipeLink": "/kunskapsbank/recept/laxburgare-med-avokadokram" }
      },
      "Fredag": {
        "breakfast": { "name": "Havregrynsgröt med nötter och frön", "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-notter-och-fron" },
        "lunch": { "name": "Laxburgare med avokadokräm rester", "recipeLink": "/kunskapsbank/recept/laxburgare-med-avokadokram" },
        "dinner": { "name": "Vegetarisk wok med tofu och sesamfrön", "recipeLink": "/kunskapsbank/recept/vegetarisk-wok-med-tofu-och-sesamfron" }
      },
      "Lördag": {
        "breakfast": { "name": "Proteinpannkakor med bär", "recipeLink": "/kunskapsbank/recept/proteinpannkakor-med-bar" },
        "lunch": { "name": "Vegetarisk wok med tofu rester", "recipeLink": "/kunskapsbank/recept/vegetarisk-wok-med-tofu-och-sesamfron" },
        "dinner": { "name": "Köttfärsbiffar med rostad rotselleri", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-rostad-rotselleri" }
      },
      "Söndag": {
        "breakfast": { "name": "Yoghurt med hemgjord granola", "recipeLink": "/kunskapsbank/recept/yoghurt-med-hemgjord-granola" },
        "lunch": { "name": "Köttfärsbiffar med rostad rotselleri rester", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-rostad-rotselleri" },
        "dinner": { "name": "Kycklingsallad med valnötter och äpple", "recipeLink": "/kunskapsbank/recept/kycklingsallad-med-valnotter-och-apple" }
      }
    },
    "title": "Vecka 1: Introduktion till stabil energi"
  },
  "week2": {
    "days": {
      "Måndag": {
        "breakfast": { "name": "Overnight oats med kanel och kardemumma", "recipeLink": "/kunskapsbank/recept/overnight-oats-med-kanel-och-kardemumma" },
        "lunch": { "name": "Kycklingsallad med valnötter rester", "recipeLink": "/kunskapsbank/recept/kycklingsallad-med-valnotter-och-apple" },
        "dinner": { "name": "Torskgryta med tomater och oliver", "recipeLink": "/kunskapsbank/recept/torskgryta-med-tomater-och-oliver" }
      },
      "Tisdag": {
        "breakfast": { "name": "Äggröra med avokado och tomat", "recipeLink": "/kunskapsbank/recept/aggrora-med-avokado-och-tomat" },
        "lunch": { "name": "Torskgryta med tomater rester", "recipeLink": "/kunskapsbank/recept/torskgryta-med-tomater-och-oliver" },
        "dinner": { "name": "Bönburgare med sweet potato fries", "recipeLink": "/kunskapsbank/recept/bonburgare-med-sweet-potato-fries" }
      },
      "Onsdag": {
        "breakfast": { "name": "Smoothie med spenat och mango", "recipeLink": "/kunskapsbank/recept/smoothie-med-spenat-och-mango" },
        "lunch": { "name": "Bönburgare rester", "recipeLink": "/kunskapsbank/recept/bonburgare-med-sweet-potato-fries" },
        "dinner": { "name": "Kycklingcurry med blomkålsris", "recipeLink": "/kunskapsbank/recept/kycklingcurry-med-blomkalsris" }
      },
      "Torsdag": {
        "breakfast": { "name": "Gröt med linfrön och blåbär", "recipeLink": "/kunskapsbank/recept/grot-med-linfron-och-blabar" },
        "lunch": { "name": "Kycklingcurry rester", "recipeLink": "/kunskapsbank/recept/kycklingcurry-med-blomkalsris" },
        "dinner": { "name": "Lax med quinoasallad", "recipeLink": "/kunskapsbank/recept/lax-med-quinoasallad" }
      },
      "Fredag": {
        "breakfast": { "name": "Fruktsallad med nötter och tahini", "recipeLink": "/kunskapsbank/recept/fruktsallad-med-notter-och-tahini" },
        "lunch": { "name": "Lax med quinoasallad rester", "recipeLink": "/kunskapsbank/recept/lax-med-quinoasallad" },
        "dinner": { "name": "Vegetarisk lasagne med linser", "recipeLink": "/kunskapsbank/recept/vegetarisk-lasagne-med-linser" }
      },
      "Lördag": {
        "breakfast": { "name": "Äggmacka med hummus", "recipeLink": "/kunskapsbank/recept/aggmacka-med-hummus" },
        "lunch": { "name": "Vegetarisk lasagne rester", "recipeLink": "/kunskapsbank/recept/vegetarisk-lasagne-med-linser" },
        "dinner": { "name": "Köttgryta med rotfrukter", "recipeLink": "/kunskapsbank/recept/kottgryta-med-rotfrukter" }
      },
      "Söndag": {
        "breakfast": { "name": "Pannkakor med bär och grekisk yoghurt", "recipeLink": "/kunskapsbank/recept/pannkakor-med-bar-och-grekisk-yoghurt" },
        "lunch": { "name": "Köttgryta med rotfrukter rester", "recipeLink": "/kunskapsbank/recept/kottgryta-med-rotfrukter" },
        "dinner": { "name": "Fiskgratäng med dill och citron", "recipeLink": "/kunskapsbank/recept/fiskgratang-med-dill-och-citron" }
      }
    },
    "title": "Vecka 2: Blodsocker & energi"
  },
  "week3": {
    "days": {
      "Måndag": {
        "breakfast": { "name": "Chiapudding med kokos och lime", "recipeLink": "/kunskapsbank/recept/chiapudding-med-kokos-och-lime" },
        "lunch": { "name": "Fiskgratäng rester", "recipeLink": "/kunskapsbank/recept/fiskgratang-med-dill-och-citron" },
        "dinner": { "name": "Kycklingspett med tzatziki", "recipeLink": "/kunskapsbank/recept/kycklingspett-med-tzatziki" }
      },
      "Tisdag": {
        "breakfast": { "name": "Havregrynsgröt med äpple och kanel", "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-apple-och-kanel" },
        "lunch": { "name": "Kycklingspett rester", "recipeLink": "/kunskapsbank/recept/kycklingspett-med-tzatziki" },
        "dinner": { "name": "Linssoppa med ingefära", "recipeLink": "/kunskapsbank/recept/linssoppa-med-ingefara" }
      },
      "Onsdag": {
        "breakfast": { "name": "Smoothiebowl med granola", "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-granola" },
        "lunch": { "name": "Linssoppa rester", "recipeLink": "/kunskapsbank/recept/linssoppa-med-ingefara" },
        "dinner": { "name": "Lax med broccoli och sesamfrön", "recipeLink": "/kunskapsbank/recept/lax-med-broccoli-och-sesamfron" }
      },
      "Torsdag": {
        "breakfast": { "name": "Äggröra med fetaost och spenat", "recipeLink": "/kunskapsbank/recept/aggrora-med-fetaost-och-spenat" },
        "lunch": { "name": "Lax med broccoli rester", "recipeLink": "/kunskapsbank/recept/lax-med-broccoli-och-sesamfron" },
        "dinner": { "name": "Köttfärssås med zucchinispagetti", "recipeLink": "/kunskapsbank/recept/kottfarssas-med-zucchinispagetti" }
      },
      "Fredag": {
        "breakfast": { "name": "Yoghurt med nötter och honung", "recipeLink": "/kunskapsbank/recept/yoghurt-med-notter-och-honung" },
        "lunch": { "name": "Köttfärssås rester", "recipeLink": "/kunskapsbank/recept/kottfarssas-med-zucchinispagetti" },
        "dinner": { "name": "Vegetarisk curry med kikärter", "recipeLink": "/kunskapsbank/recept/vegetarisk-curry-med-kikarter" }
      },
      "Lördag": {
        "breakfast": { "name": "Proteinomelett med grönsaker", "recipeLink": "/kunskapsbank/recept/proteinomelett-med-gronsaker" },
        "lunch": { "name": "Vegetarisk curry rester", "recipeLink": "/kunskapsbank/recept/vegetarisk-curry-med-kikarter" },
        "dinner": { "name": "Fläskfilé med rostade rotfrukter", "recipeLink": "/kunskapsbank/recept/flaskfile-med-rostade-rotfrukter" }
      },
      "Söndag": {
        "breakfast": { "name": "Fruktsmoothie med protein", "recipeLink": "/kunskapsbank/recept/fruktsmoothie-med-protein" },
        "lunch": { "name": "Fläskfilé rester", "recipeLink": "/kunskapsbank/recept/flaskfile-med-rostade-rotfrukter" },
        "dinner": { "name": "Sallad med getost och valnötter", "recipeLink": "/kunskapsbank/recept/sallad-med-getost-och-valnotter" }
      }
    },
    "title": "Vecka 3: Måltidsplanering för energi"
  },
  "week4": {
    "days": {
      "Måndag": {
        "breakfast": { "name": "Overnight oats med bär", "recipeLink": "/kunskapsbank/recept/overnight-oats-med-bar" },
        "lunch": { "name": "Sallad med getost rester", "recipeLink": "/kunskapsbank/recept/sallad-med-getost-och-valnotter" },
        "dinner": { "name": "Torsk med tomat och basilika", "recipeLink": "/kunskapsbank/recept/torsk-med-tomat-och-basilika" }
      },
      "Tisdag": {
        "breakfast": { "name": "Ägg och avokado på fullkornsbröd", "recipeLink": "/kunskapsbank/recept/agg-och-avokado-pa-fullkornsbrod" },
        "lunch": { "name": "Torsk med tomat rester", "recipeLink": "/kunskapsbank/recept/torsk-med-tomat-och-basilika" },
        "dinner": { "name": "Kycklingwok med cashewnötter", "recipeLink": "/kunskapsbank/recept/kycklingwok-med-cashewnotter" }
      },
      "Onsdag": {
        "breakfast": { "name": "Grön smoothie med spirulina", "recipeLink": "/kunskapsbank/recept/gron-smoothie-med-spirulina" },
        "lunch": { "name": "Kycklingwok rester", "recipeLink": "/kunskapsbank/recept/kycklingwok-med-cashewnotter" },
        "dinner": { "name": "Böngryta med grönsaker", "recipeLink": "/kunskapsbank/recept/bongryta-med-gronsaker" }
      },
      "Torsdag": {
        "breakfast": { "name": "Havregrynsgröt med nötsmör", "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-notsmor" },
        "lunch": { "name": "Böngryta rester", "recipeLink": "/kunskapsbank/recept/bongryta-med-gronsaker" },
        "dinner": { "name": "Lax med sparris och hollandaise", "recipeLink": "/kunskapsbank/recept/lax-med-sparris-och-hollandaise" }
      },
      "Fredag": {
        "breakfast": { "name": "Proteinshake med banan", "recipeLink": "/kunskapsbank/recept/proteinshake-med-banan" },
        "lunch": { "name": "Lax med sparris rester", "recipeLink": "/kunskapsbank/recept/lax-med-sparris-och-hollandaise" },
        "dinner": { "name": "Pizza med blomkålsbotten", "recipeLink": "/kunskapsbank/recept/pizza-med-blomkalsbotten" }
      },
      "Lördag": {
        "breakfast": { "name": "Äggmuffins med bacon", "recipeLink": "/kunskapsbank/recept/aggmuffins-med-bacon" },
        "lunch": { "name": "Pizza rester", "recipeLink": "/kunskapsbank/recept/pizza-med-blomkalsbotten" },
        "dinner": { "name": "Köttgryta med svamp", "recipeLink": "/kunskapsbank/recept/kottgryta-med-svamp" }
      },
      "Söndag": {
        "breakfast": { "name": "Pannkakor med kvarg", "recipeLink": "/kunskapsbank/recept/pannkakor-med-kvarg" },
        "lunch": { "name": "Köttgryta rester", "recipeLink": "/kunskapsbank/recept/kottgryta-med-svamp" },
        "dinner": { "name": "Kycklingsallad med curry", "recipeLink": "/kunskapsbank/recept/kycklingsallad-med-curry" }
      }
    },
    "title": "Vecka 4: Smarta kolhydrater"
  },
  "week5": {
    "days": {
      "Måndag": {
        "breakfast": { "name": "Chiapudding med mango", "recipeLink": "/kunskapsbank/recept/chiapudding-med-mango" },
        "lunch": { "name": "Kycklingsallad rester", "recipeLink": "/kunskapsbank/recept/kycklingsallad-med-curry" },
        "dinner": { "name": "Laxpasta med spenat", "recipeLink": "/kunskapsbank/recept/laxpasta-med-spenat" }
      },
      "Tisdag": {
        "breakfast": { "name": "Äggröra med tomat och basilika", "recipeLink": "/kunskapsbank/recept/aggrora-med-tomat-och-basilika" },
        "lunch": { "name": "Laxpasta rester", "recipeLink": "/kunskapsbank/recept/laxpasta-med-spenat" },
        "dinner": { "name": "Falafel med hummus", "recipeLink": "/kunskapsbank/recept/falafel-med-hummus" }
      },
      "Onsdag": {
        "breakfast": { "name": "Smoothiebowl med açai", "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-acai" },
        "lunch": { "name": "Falafel rester", "recipeLink": "/kunskapsbank/recept/falafel-med-hummus" },
        "dinner": { "name": "Kycklinggryta med curry och kokos", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-curry-och-kokos" }
      },
      "Torsdag": {
        "breakfast": { "name": "Overnight oats med choklad", "recipeLink": "/kunskapsbank/recept/overnight-oats-med-choklad" },
        "lunch": { "name": "Kycklinggryta rester", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-curry-och-kokos" },
        "dinner": { "name": "Vegetarisk pad thai", "recipeLink": "/kunskapsbank/recept/vegetarisk-pad-thai" }
      },
      "Fredag": {
        "breakfast": { "name": "Ägg Benedict med lax", "recipeLink": "/kunskapsbank/recept/agg-benedict-med-lax" },
        "lunch": { "name": "Pad thai rester", "recipeLink": "/kunskapsbank/recept/vegetarisk-pad-thai" },
        "dinner": { "name": "Köttbullar med blomkålsmos", "recipeLink": "/kunskapsbank/recept/kottbullar-med-blomkalsmos" }
      },
      "Lördag": {
        "breakfast": { "name": "Proteinvåfflor med bär", "recipeLink": "/kunskapsbank/recept/proteinvafflor-med-bar" },
        "lunch": { "name": "Köttbullar rester", "recipeLink": "/kunskapsbank/recept/kottbullar-med-blomkalsmos" },
        "dinner": { "name": "Skaldjursgryta med saffran", "recipeLink": "/kunskapsbank/recept/skaldjursgryta-med-saffran" }
      },
      "Söndag": {
        "breakfast": { "name": "Fruktsallad med yoghurt och granola", "recipeLink": "/kunskapsbank/recept/fruktsallad-med-yoghurt-och-granola" },
        "lunch": { "name": "Skaldjursgryta rester", "recipeLink": "/kunskapsbank/recept/skaldjursgryta-med-saffran" },
        "dinner": { "name": "Vegetarisk moussaka", "recipeLink": "/kunskapsbank/recept/vegetarisk-moussaka" }
      }
    },
    "title": "Vecka 5: Energistabila vanor"
  },
  "week6": {
    "days": {
      "Måndag": {
        "breakfast": { "name": "Gröt med nötter och frön", "recipeLink": "/kunskapsbank/recept/grot-med-notter-och-fron" },
        "lunch": { "name": "Vegetarisk moussaka rester", "recipeLink": "/kunskapsbank/recept/vegetarisk-moussaka" },
        "dinner": { "name": "Lax med quinoa och grönsaker", "recipeLink": "/kunskapsbank/recept/lax-med-quinoa-och-gronsaker" }
      },
      "Tisdag": {
        "breakfast": { "name": "Smoothie med proteinpulver", "recipeLink": "/kunskapsbank/recept/smoothie-med-proteinpulver" },
        "lunch": { "name": "Lax med quinoa rester", "recipeLink": "/kunskapsbank/recept/lax-med-quinoa-och-gronsaker" },
        "dinner": { "name": "Kyckling tikka masala", "recipeLink": "/kunskapsbank/recept/kyckling-tikka-masala" }
      },
      "Onsdag": {
        "breakfast": { "name": "Äggmacka med avokado", "recipeLink": "/kunskapsbank/recept/aggmacka-med-avokado" },
        "lunch": { "name": "Tikka masala rester", "recipeLink": "/kunskapsbank/recept/kyckling-tikka-masala" },
        "dinner": { "name": "Vegetarisk chili", "recipeLink": "/kunskapsbank/recept/vegetarisk-chili" }
      },
      "Torsdag": {
        "breakfast": { "name": "Overnight oats med nötsmör", "recipeLink": "/kunskapsbank/recept/overnight-oats-med-notsmor" },
        "lunch": { "name": "Vegetarisk chili rester", "recipeLink": "/kunskapsbank/recept/vegetarisk-chili" },
        "dinner": { "name": "Torsk med tomat och oliver", "recipeLink": "/kunskapsbank/recept/torsk-med-tomat-och-oliver" }
      },
      "Fredag": {
        "breakfast": { "name": "Proteinpannkakor med sylt", "recipeLink": "/kunskapsbank/recept/proteinpannkakor-med-sylt" },
        "lunch": { "name": "Torsk rester", "recipeLink": "/kunskapsbank/recept/torsk-med-tomat-och-oliver" },
        "dinner": { "name": "Köttfärspaj med sallad", "recipeLink": "/kunskapsbank/recept/kottfarspaj-med-sallad" }
      },
      "Lördag": {
        "breakfast": { "name": "Shakshuka med fetaost", "recipeLink": "/kunskapsbank/recept/shakshuka-med-fetaost" },
        "lunch": { "name": "Köttfärspaj rester", "recipeLink": "/kunskapsbank/recept/kottfarspaj-med-sallad" },
        "dinner": { "name": "Grillad kyckling med rostad potatis", "recipeLink": "/kunskapsbank/recept/grillad-kyckling-med-rostad-potatis" }
      },
      "Söndag": {
        "breakfast": { "name": "Brunch med ägg och bacon", "recipeLink": "/kunskapsbank/recept/brunch-med-agg-och-bacon" },
        "lunch": { "name": "Grillad kyckling rester", "recipeLink": "/kunskapsbank/recept/grillad-kyckling-med-rostad-potatis" },
        "dinner": { "name": "Sushi bowl med lax och avokado", "recipeLink": "/kunskapsbank/recept/sushi-bowl-med-lax-och-avokado" }
      }
    },
    "title": "Vecka 6: Långsiktig hållbarhet"
  }
};

// Helper function to get week data for Functional Energy
export function getEnergyWeekData(weekNumber: number): WeekMealPlan | null {
  const weekKey = `week${weekNumber}` as keyof typeof energyMealPlans;
  return energyMealPlans[weekKey] || null;
}

// Helper function to get meal for a specific day (1-42)
export function getMealForDay(dayNumber: number): DayMeals | null {
  const weekNumber = Math.ceil(dayNumber / 7);
  const dayInWeek = ((dayNumber - 1) % 7) + 1;
  return getMealPlan(weekNumber, dayInWeek);
}
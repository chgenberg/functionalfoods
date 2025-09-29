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
export const mealPlans: Record<string, WeekMealPlan> = { "week1": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-ketomusli" }, "lunch": { "name": "Tonfisksallad med äpple", "recipeLink": "/kunskapsbank/recept/tonfisksallad-med-apple" }, "dinner": { "name": "Squashspagetti med köttfärssås", "recipeLink": "/kunskapsbank/recept/squashspagetti-med-kottfarssas" }, "snack": { "name": "Ketomüsli", "recipeLink": "/kunskapsbank/recept/ketomusli" }
      }, "Tisdag": { "breakfast": { "name": "Stekt ägg med lax", "recipeLink": "/kunskapsbank/recept/stekt-agg-lax" }, "lunch": { "name": "Squashspagetti med köttfärssås rester", "recipeLink": "/kunskapsbank/recept/squashspagetti-med-kottfarssas" }, "dinner": { "name": "Het ratatouille", "recipeLink": "/kunskapsbank/recept/het-ratatouille" }
      }, "Onsdag": { "breakfast": { "name": "Grön juice", "recipeLink": "/kunskapsbank/recept/gron-juice-juice" }, "lunch": { "name": "Pokébowl med kyckling", "recipeLink": "/kunskapsbank/recept/poke-bowl-kyckling" }, "dinner": { "name": "Köttfärsbiffar med stekt blomkål", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-stekt-blomkal" }
      }, "Torsdag": { "breakfast": { "name": "Omelett med tomat", "recipeLink": "/kunskapsbank/recept/omelett-tomat" }, "lunch": { "name": "Het ratatouille rester", "recipeLink": "/kunskapsbank/recept/laxfile-med-ratatouille" }, "dinner": { "name": "Pokébowl med kyckling rester", "recipeLink": "/kunskapsbank/recept/poke-bowl-kyckling" }
      }, "Fredag": { "breakfast": { "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg", "recipeLink": "/kunskapsbank/recept/havrefrallor-morotter-aprikoser" }, "lunch": { "name": "Köttfärsbiffar med stekt blomkål rester", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-stekt-blomkal" }, "dinner": { "name": "Kycklinggryta med bakad spetskål", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }
      }, "Lördag": { "breakfast": { "name": "Tropisk smoothiebowl", "recipeLink": "/kunskapsbank/recept/smoothie-smoothiebowl" }, "lunch": { "name": "Kycklinggryta med bakad spetskål rester", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }, "dinner": { "name": "Laxburgare med krämig grönsaksröra", "recipeLink": "/kunskapsbank/recept/hamburgare-med-grekisk-sallad" }, "dessert": { "name": "Mangoglass", "recipeLink": "/kunskapsbank/recept/mangoglass" }
      }, "Söndag": { "breakfast": { "name": "Tropisk smoothiebowl rester", "recipeLink": "/kunskapsbank/recept/smoothie-smoothiebowl" }, "lunch": { "name": "Laxburgare med krämig grönsaksröra rester", "recipeLink": "/kunskapsbank/recept/hamburgare-med-grekisk-sallad" }, "dinner": { "name": "Ugnsbakad tomat med köttfärs", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-stekt-blomkal" }
      }
    }, "title": "Vecka 1: Synkroniserad från DOCX" }, "week2": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-ketomusli" }, "lunch": { "name": "Ugnsbakad tomat med köttfärs rester", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-stekt-blomkal" }, "dinner": { "name": "Nudelsoppa med grönsaker", "recipeLink": "/kunskapsbank/recept/nudelsoppa-med-gronsaker-2" }
      }, "Tisdag": { "breakfast": { "name": "Omelett med champinjoner", "recipeLink": "/kunskapsbank/recept/omelett-champinjoner" }, "lunch": { "name": "Nudelsoppa med grönsaker rester", "recipeLink": "/kunskapsbank/recept/nudelsoppa-med-gronsaker-2" }, "dinner": { "name": "Torskrygg med ägghack och sparris", "recipeLink": "/kunskapsbank/recept/torskrygg-med-agghack-och-sparris" }
      }, "Onsdag": { "breakfast": { "name": "Morotsjuice", "recipeLink": "/kunskapsbank/recept/morotsjuice-juice" }, "lunch": { "name": "Torskrygg med ägghack och sparris rester", "recipeLink": "/kunskapsbank/recept/torskrygg-med-agghack-och-sparris" }, "dinner": { "name": "Turkiska lammfärsspett med raita och sallad", "recipeLink": "/kunskapsbank/recept/turkiska-lammfarsspett-med-raita-och-sallad" }
      }, "Torsdag": { "breakfast": { "name": "Morotsjuice", "recipeLink": "/kunskapsbank/recept/morotsjuice-juice" }, "lunch": { "name": "Turkiska lammfärsspett med raita och sallad rester", "recipeLink": "/kunskapsbank/recept/turkiska-lammfarsspett-med-raita-och-sallad" }, "dinner": { "name": "Kycklingröra med örter och tomat", "recipeLink": "/kunskapsbank/recept/kycklingrora-med-orter-och-tomat" }
      }, "Fredag": { "breakfast": { "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg", "recipeLink": "/kunskapsbank/recept/havrefrallor-morotter-aprikoser" }, "lunch": { "name": "Kycklingröra med örter och tomat rester", "recipeLink": "/kunskapsbank/recept/kycklingrora-med-orter-och-tomat" }, "dinner": { "name": "Lax med fetaost och rostade rotfrukter och brysselkål", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }
      }, "Lördag": { "breakfast": { "name": "Blåbärs smoothiebowl", "recipeLink": "/kunskapsbank/recept/jordgubbar-mango-vit" }, "lunch": { "name": "Lax med fetaost och rostade rotfrukter och brysselkål rester", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }, "dinner": { "name": "Asiatiska köttbullar med nudelsallad", "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad" }
      }, "Söndag": { "breakfast": { "name": "Blåbärs smoothiebowl rester", "recipeLink": "/kunskapsbank/recept/jordgubbar-mango-vit" }, "lunch": { "name": "Asiatiska köttbullar med nudelsallad rester", "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad" }, "dinner": { "name": "Päronsallad med chévreost", "recipeLink": "/kunskapsbank/recept/paronsallad-med-chevreost" }
      }
    }, "title": "Vecka 2: Synkroniserad från DOCX" }, "week3": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-ketomusli" }, "lunch": { "name": "Päronsallad med chévreost rester", "recipeLink": "/kunskapsbank/recept/paronsallad-med-chevreost" }, "dinner": { "name": "Kycklingfylld aubergine", "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine" }
      }, "Tisdag": { "breakfast": { "name": "Äggröra med rökt lax", "recipeLink": "/kunskapsbank/recept/aggrora-lax-2" }, "lunch": { "name": "Kycklingfylld aubergine rester", "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine" }, "dinner": { "name": "Rökt lax med blomkålssallad och citronyoghurt", "recipeLink": "/kunskapsbank/recept/rokt-lax-med-blomkalsallad-och-citronyoghurt" }
      }, "Onsdag": { "breakfast": { "name": "Rödbetsjuice", "recipeLink": "/kunskapsbank/recept/rodbetsjuice-juice" }, "lunch": { "name": "Rökt lax med blomkålssallad och citronyoghurt rester", "recipeLink": "/kunskapsbank/recept/rokt-lax-med-blomkalsallad-och-citronyoghurt" }, "dinner": { "name": "Vegetarisk currygryta med panéer", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }
      }, "Torsdag": { "breakfast": { "name": "Rödbetsjuice rester", "recipeLink": "/kunskapsbank/recept/rodbetsjuice-juice" }, "lunch": { "name": "Vegetarisk currygryta med panéer rester", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }, "dinner": { "name": "Kycklinggryta med bakad spetskål rester från fysen", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }
      }, "Fredag": { "breakfast": { "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg", "recipeLink": "/kunskapsbank/recept/havrefrallor-morotter-aprikoser" }, "lunch": { "name": "Lax med fetaost och rostade rotfrukter och brysselkål rester från frysen", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }, "dinner": { "name": "Högrevsburgare med hummus", "recipeLink": "/kunskapsbank/recept/hamburgare-med-grekisk-sallad" }
      }, "Lördag": { "breakfast": { "name": "Keso med granola och fruktsallad", "recipeLink": "/kunskapsbank/recept/keso-granola-fruktsallad" }, "lunch": { "name": "Högrevsburgare med hummus rester", "recipeLink": "/kunskapsbank/recept/hamburgare-med-grekisk-sallad" }, "dinner": { "name": "Ugnsbakad kyckling med tzatziki och salladMandel och citronpaj", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad-2" }
      }, "Söndag": { "breakfast": { "name": "Omelett med hallon", "recipeLink": "/kunskapsbank/recept/omelett-hallon" }, "lunch": { "name": "Ugnsbakad kyckling med tzatziki och sallad rester", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad-2" }, "dinner": { "name": "Lax med waldorfsallad", "recipeLink": "/kunskapsbank/recept/lax-med-waldorfsallad" }
      }
    }, "title": "Vecka 3: Synkroniserad från DOCX" }, "week4": { "days": { "Måndag": { "breakfast": { "name": "Omelett med bär", "recipeLink": "/kunskapsbank/recept/omelett-bar" }, "lunch": { "name": "Lax med waldorfsallad rester", "recipeLink": "/kunskapsbank/recept/lax-med-waldorfsallad" }, "dinner": { "name": "Grekiska köttbullar i tomatsås med rostad sötpotatis", "recipeLink": "/kunskapsbank/recept/grekiska-kottbullar-i-tomatsas" }
      }, "Tisdag": { "breakfast": { "name": "Ägghack med kalkon", "recipeLink": "/kunskapsbank/recept/agghack-kalkon" }, "lunch": { "name": "Grekiska köttbullar i tomatsås med rostad sötpotatis rester", "recipeLink": "/kunskapsbank/recept/grekiska-kottbullar-i-tomatsas" }, "dinner": { "name": "Kycklinggryta med röda linser", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }
      }, "Onsdag": { "breakfast": { "name": "Fruktsmoothie", "recipeLink": "/kunskapsbank/recept/smoothie-2" }, "lunch": { "name": "Kycklinggryta med röda linser rester", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }, "dinner": { "name": "Laxsallad med vindruvor", "recipeLink": "/kunskapsbank/recept/laxsallad-med-vindruvor" }
      }, "Torsdag": { "breakfast": { "name": "Fruktsmoothie rester", "recipeLink": "/kunskapsbank/recept/smoothie-2" }, "lunch": { "name": "Laxsallad med vindruvor rester", "recipeLink": "/kunskapsbank/recept/laxsallad-med-vindruvor" }, "dinner": { "name": "Asiatiska köttbullar med nudelsallad rester från fysen", "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad" }
      }, "Fredag": { "breakfast": { "name": "Bananplättar med mango och granatäpple", "recipeLink": "/kunskapsbank/recept/bananplattar-med-mango-och-granatapple" }, "lunch": { "name": "Vegetarisk currygryta med panéer rester från frysen", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }, "dinner": { "name": "Grillade köttspett med grekisk sallad och morotstzatziki", "recipeLink": "/kunskapsbank/recept/grillspett-med-grekisk-sallad-och-morotstzatziki" }
      }, "Lördag": { "breakfast": { "name": "Keso med hallon och granatäpple", "recipeLink": "/kunskapsbank/recept/keso-hallon-granatapple" }, "lunch": { "name": "Grillade köttspett med grekisk sallad och morotstzatziki rester", "recipeLink": "/kunskapsbank/recept/grillspett-med-grekisk-sallad-och-morotstzatziki" }, "dinner": { "name": "Hallon och kiwi med vit chokladcréme", "recipeLink": "/kunskapsbank/recept/hallon-och-kiwi-med-vit-chokladcreme" }
      }, "Söndag": { "breakfast": { "name": "Havregrynsgröt med torkad frukt och äpple", "recipeLink": "/kunskapsbank/recept/havregrynsgrot-torkad-frukt" }, "lunch": { "name": "Ugnsbakad kyckling med tzatziki och sallad rester", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad-2" }, "dinner": { "name": "Torsk från mellanöstern", "recipeLink": "/kunskapsbank/recept/torsk-fran-mellanostern" }
      }
    }, "title": "Vecka 4: Synkroniserad från DOCX" }, "week5": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-ketomusli" }, "lunch": { "name": "Torsk från mellanöstern rester", "recipeLink": "/kunskapsbank/recept/torsk-fran-mellanostern" }, "dinner": { "name": "Japansk kycklingfärswok med groddar (320 kcal", "recipeLink": "/kunskapsbank/recept/asiatisk-kycklingfars-med-gronkal" }
      }, "Tisdag": { "breakfast": { "name": "Äggröra med paprika", "recipeLink": "/kunskapsbank/recept/aggrora-paprika" }, "lunch": { "name": "Japansk kycklingfärswok med groddar (320 kcal rester", "recipeLink": "/kunskapsbank/recept/asiatisk-kycklingfars-med-gronkal" }, "dinner": { "name": "Grekisk sallad med fetaost", "recipeLink": "/kunskapsbank/recept/laxsallad-med-fetaost" }
      }, "Onsdag": { "breakfast": { "name": "Chiafrögröt", "recipeLink": "/kunskapsbank/recept/tropisk-chiafrogrot" }, "lunch": { "name": "Lax med fetaost och rostade rotfrukter och brysselkål rester från fysen", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }, "dinner": { "name": "Köttfärslimpa med ajvar och rostad sötpotatis", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-ajvar-och-rostad-sotpotatis" }
      }, "Torsdag": { "breakfast": { "name": "Bananplättar med jordgubbar och kokos", "recipeLink": "/kunskapsbank/recept/bananplattar-jordgubbar-kokos" }, "lunch": { "name": "Köttfärslimpa med ajvar, fetaost och rostad sötpotatis rester", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-ajvar-och-rostad-sotpotatis" }, "dinner": { "name": "Vegetarisk currygryta med panéer rester från frysen", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }
      }, "Fredag": { "breakfast": { "name": "Bananplättar med jordgubbar och kokos rester", "recipeLink": "/kunskapsbank/recept/bananplattar-jordgubbar-kokos" }, "lunch": { "name": "Kycklinggryta med röda linser rester från frysen", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }, "dinner": { "name": "Skaldjursgryta med torsk i gul curry", "recipeLink": "/kunskapsbank/recept/skaldjursgryta-med-torsk-i-gul-curry" }
      }, "Lördag": { "breakfast": { "name": "Mangosmoothie med spenat", "recipeLink": "/kunskapsbank/recept/smoothie-spenat" }, "lunch": { "name": "Skaldjursgryta med torsk i gul curry rester", "recipeLink": "/kunskapsbank/recept/skaldjursgryta-med-torsk-i-gul-curry" }, "dinner": { "name": "Mandelkaka med frukt", "recipeLink": "/kunskapsbank/recept/mandelkaka-med-med-choklad" }
      }, "Söndag": { "breakfast": { "name": "Mangosmoothie med spenat rester", "recipeLink": "/kunskapsbank/recept/smoothie-spenat" }, "lunch": { "name": "Kycklingjärpar med linssallad rester", "recipeLink": "/kunskapsbank/recept/kycklingjarpar-med-linssallad" }, "dinner": { "name": "Laxfilé med ratatouille", "recipeLink": "/kunskapsbank/recept/laxfile-med-ratatouille" }
      }
    }, "title": "Vecka 5: Synkroniserad från DOCX" }, "week6": { "days": { "Måndag": { "breakfast": { "name": "1 havrefrallor med morötter och aprikoser + valfritt pålägg", "recipeLink": "/kunskapsbank/recept/havrefrallor-morotter-aprikoser" }, "lunch": { "name": "Laxfilé med ratatouille rester", "recipeLink": "/kunskapsbank/recept/laxfile-med-ratatouille" }, "dinner": { "name": "Grönsakswok med kyckling", "recipeLink": "/kunskapsbank/recept/poke-bowl-kyckling" }
      }, "Tisdag": { "breakfast": { "name": "Kokt ägg med majonnäs", "recipeLink": "/kunskapsbank/recept/kokt-agg-majonnas" }, "lunch": { "name": "Grönsakswok med kyckling rester", "recipeLink": "/kunskapsbank/recept/poke-bowl-kyckling" }, "dinner": { "name": "Köttfärspytt med italienska smaker", "recipeLink": "/kunskapsbank/recept/kottfarspytt-med-italienska-smaker" }
      }, "Onsdag": { "breakfast": { "name": "Mango med keso och nötter", "recipeLink": "/kunskapsbank/recept/mango-keso-notter" }, "lunch": { "name": "Köttfärspytt med italienska smaker rester", "recipeLink": "/kunskapsbank/recept/kottfarspytt-med-italienska-smaker" }, "dinner": { "name": "Indisk laxgryta med röda linser", "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-med-roda-linser" }
      }, "Torsdag": { "breakfast": { "name": "Äggröra med granatäpple och kiwi", "recipeLink": "/kunskapsbank/recept/aggrora-granatapple-kiwi" }, "lunch": { "name": "Indisk laxgryta med röda linser rester", "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-med-roda-linser" }, "dinner": { "name": "Quinoasallad med stekt halloumi", "recipeLink": "/kunskapsbank/recept/quinoasallad-med-halloumi" }
      }, "Fredag": { "breakfast": { "name": "Havregrynsgröt med apelsin och kokos", "recipeLink": "/kunskapsbank/recept/havregrynsgrot-apelsin-kokos" }, "lunch": { "name": "Quinoasallad med stekt halloumi rester", "recipeLink": "/kunskapsbank/recept/quinoasallad-med-halloumi" }, "dinner": { "name": "Torsk teriyaki med grönsaker", "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker" }
      }, "Lördag": { "breakfast": { "name": "Hallon- och blåbärssmoothie", "recipeLink": "/kunskapsbank/recept/smoothie-blabarssmoothie" }, "lunch": { "name": "Torsk teriyaki med grönsaker rester", "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker" }, "dinner": { "name": "Tropisk fruktsallad", "recipeLink": "/kunskapsbank/recept/tropisk-fruktsallad" }
      }, "Söndag": { "breakfast": { "name": "Hallon- och blåbärssmoothie rester", "recipeLink": "/kunskapsbank/recept/smoothie-blabarssmoothie" }, "lunch": { "name": "Lammgryta plommon och bulgur rester", "recipeLink": "/kunskapsbank/recept/lammgryta-med-plommon-och-bulgur" }, "dinner": { "name": "Kycklinggryta med bakad spetskål rester från frysen", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }
      }
    }, "title": "Vecka 6: Synkroniserad från DOCX" }
};

// Functional Gut Health/Flow meal plans
export const flowMealPlans: Record<string, WeekMealPlan> = { "week1": { "days": { "Måndag": { "breakfast": { "name": "Färskostmacka med tomat", "recipeLink": "/kunskapsbank/recept/farskostmacka-med-tomat" }, "lunch": { "name": "Linssoppa från medelhavet", "recipeLink": "/kunskapsbank/recept/linssoppa-medelhavet-soppa" }, "dinner": { "name": "Kycklingburgare med papayasallad", "recipeLink": "/kunskapsbank/recept/kycklingburgare-papayasallad-sallad" }, "snack": { "name": "Morot- och kesolimpa", "recipeLink": "/kunskapsbank/recept/morot-och-kesolimpa" }
      }, "Tisdag": { "breakfast": { "name": "Äggröra med asiatisk avokadosallad", "recipeLink": "/kunskapsbank/recept/aggrora-asiatisk-avokadosallad" }, "lunch": { "name": "Kycklingburgare med papayasallad rester", "recipeLink": "/kunskapsbank/recept/kycklingburgare-papayasallad-sallad" }, "dinner": { "name": "Köttfärsbiffar med tomatsallad", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-mozzarella-och-tomatsallad" }
      }, "Onsdag": { "breakfast": { "name": "Choklad- och kokoschiapudding", "recipeLink": "/kunskapsbank/recept/choklad-kokoschiapudding" }, "lunch": { "name": "Köttfärsbiffar med tomatsallad rester", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-mozzarella-och-tomatsallad" }, "dinner": { "name": "Laxgratäng med scampi och broccoli", "recipeLink": "/kunskapsbank/recept/laxgratang-med-broccoli-och-scampi" }, "snack": { "name": "Bovetegranola", "recipeLink": "/kunskapsbank/recept/bovetegranola" }
      }, "Torsdag": { "breakfast": { "name": "Keso med bovetegranola", "recipeLink": "/kunskapsbank/recept/keso-bovetegranola-granola" }, "lunch": { "name": "Laxgratäng med scampi och broccoli rester", "recipeLink": "/kunskapsbank/recept/laxgratang-med-broccoli-och-scampi" }, "dinner": { "name": "Kycklinggryta från medelhavet", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }
      }, "Fredag": { "breakfast": { "name": "Omelett med ost och spenat", "recipeLink": "/kunskapsbank/recept/omelett-ost-spenat" }, "lunch": { "name": "Kycklinggryta från medelhavet rester", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }, "dinner": { "name": "Fänkålssallad med grapefrukt och burrata", "recipeLink": "/kunskapsbank/recept/fankalssallad-med-grapefrukt-och-burrata" }
      }, "Lördag": { "breakfast": { "name": "Ugnsomelett med bär", "recipeLink": "/kunskapsbank/recept/omelett-bar" }, "lunch": { "name": "Fänkålssallad med grapefrukt och burrata rester", "recipeLink": "/kunskapsbank/recept/fankalssallad-med-grapefrukt-och-burrata" }, "dinner": { "name": "Entrecote med haricots verts och bearnaisesås", "recipeLink": "/kunskapsbank/recept/entrecote-med-haricots-verts-och-bearnaisesas" }, "dessert": { "name": "Citronkaka med äpple och kardemumma", "recipeLink": "/kunskapsbank/recept/citronkaka-med-apple-och-kardemumma" }
      }, "Söndag": { "breakfast": { "name": "Ugnsomelett med bär rester", "recipeLink": "/kunskapsbank/recept/omelett-bar" }, "lunch": { "name": "Entrecote med haricot verts och bearnaisesås rester", "recipeLink": "/kunskapsbank/recept/entrecote-med-haricots-verts-och-bearnaisesas" }, "dinner": { "name": "Grönsakswok med tonfisk och ägg", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-tonfisk-och-agg" }
      }
    }, "title": "Vecka 1: Synkroniserad från DOCX" }, "week2": { "days": { "Måndag": { "breakfast": { "name": "Macka med ost", "recipeLink": "/kunskapsbank/recept/macka-ost" }, "lunch": { "name": "Grönsakswok med tonfisk och ägg rester", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-tonfisk-och-agg" }, "dinner": { "name": "Lövbiffsgryta med champinjoner och grönsaksspagetti", "recipeLink": "/kunskapsbank/recept/lovbiffsgryta-med-champinjoner-och-gronsaksspagetti" }
      }, "Tisdag": { "breakfast": { "name": "Ägghack i salladsblad", "recipeLink": "/kunskapsbank/recept/agghack-salladsblad-sallad" }, "lunch": { "name": "Lövbiffsgryta med champinjoner och grönsaksspagetti rester", "recipeLink": "/kunskapsbank/recept/lovbiffsgryta-med-champinjoner-och-gronsaksspagetti" }, "dinner": { "name": "Lax med rödbetssallad", "recipeLink": "/kunskapsbank/recept/lax-med-rodbetssallad" }
      }, "Onsdag": { "breakfast": { "name": "Overnight oats med morot", "recipeLink": "/kunskapsbank/recept/overnightoats-morot" }, "lunch": { "name": "Lax med rödbetssallad rester", "recipeLink": "/kunskapsbank/recept/lax-med-rodbetssallad" }, "dinner": { "name": "Kycklingpizza", "recipeLink": "/kunskapsbank/recept/kycklingpizza" }
      }, "Torsdag": { "breakfast": { "name": "Yoghurt med bovetegranola och frukt", "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-frukt" }, "lunch": { "name": "Kycklingpizza rester", "recipeLink": "/kunskapsbank/recept/kycklingpizza" }, "dinner": { "name": "Spenatsoppa med rostade pumpafrön", "recipeLink": "/kunskapsbank/recept/spenatsoppa-med-rostade-pumpafron" }
      }, "Fredag": { "breakfast": { "name": "Stekt ägg med champinjoner", "recipeLink": "/kunskapsbank/recept/stekt-agg-champinjoner" }, "lunch": { "name": "Spenatsoppa rostade pumpafrön rester", "recipeLink": "/kunskapsbank/recept/spenatsoppa-med-rostade-pumpafron" }, "dinner": { "name": "Fisktaco med mangosalsa och sesamsås", "recipeLink": "/kunskapsbank/recept/fisktaco-med-mangosalsa-och-sesamsas" }
      }, "Lördag": { "breakfast": { "name": "Smoothiebowl med mango och pistagenötter", "recipeLink": "/kunskapsbank/recept/smoothiebowl-mango-pistagenotter" }, "lunch": { "name": "Fisktaco med mangosalsa och sesamsås rester", "recipeLink": "/kunskapsbank/recept/fisktaco-med-mangosalsa-och-sesamsas" }, "dinner": { "name": "Ajvarspett med grekisk sallad och tzatziki", "recipeLink": "/kunskapsbank/recept/grillspett-med-grekisk-sallad-och-morotstzatziki" }
      }, "Söndag": { "breakfast": { "name": "Grön juice", "recipeLink": "/kunskapsbank/recept/gron-juice-juice" }, "lunch": { "name": "Ajvarspett med grekisk sallad och tzatziki rester", "recipeLink": "/kunskapsbank/recept/grillspett-med-grekisk-sallad-och-morotstzatziki" }, "dinner": { "name": "Kycklinggryta från medelhavet rester från frysen", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }
      }
    }, "title": "Vecka 2: Synkroniserad från DOCX" }, "week3": { "days": { "Måndag": { "breakfast": { "name": "Grön juice rester", "recipeLink": "/kunskapsbank/recept/gron-juice-juice" }, "lunch": { "name": "Kycklinggryta från medelhavet rester från frysen", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }, "dinner": { "name": "Färgstark fetaostsallad", "recipeLink": "/kunskapsbank/recept/laxsallad-med-fetaost" }
      }, "Tisdag": { "breakfast": { "name": "Bananmuffin", "recipeLink": "/kunskapsbank/recept/lax-fetaost-rostade" }, "lunch": { "name": "Färgstark fetaostsallad rester", "recipeLink": "/kunskapsbank/recept/laxsallad-med-fetaost" }, "dinner": { "name": "Nötfärstimbaler med chévreost och soltorkad tomat", "recipeLink": "/kunskapsbank/recept/notfarstimbaler-med-chevreost-och-soltorkad-tomat" }
      }, "Onsdag": { "breakfast": { "name": "Kokt ägg med kaviar", "recipeLink": "/kunskapsbank/recept/kokt-agg-kaviar" }, "lunch": { "name": "Nötfärstimbaler med chévreost och soltorkad tomat rester", "recipeLink": "/kunskapsbank/recept/notfarstimbaler-med-chevreost-och-soltorkad-tomat" }, "dinner": { "name": "Laxsallad med fetaost", "recipeLink": "/kunskapsbank/recept/laxsallad-med-fetaost" }
      }, "Torsdag": { "breakfast": { "name": "Keso med bovetegranola och frukt", "recipeLink": "/kunskapsbank/recept/keso-bovetegranola-frukt" }, "lunch": { "name": "Laxsallad med fetaost rester", "recipeLink": "/kunskapsbank/recept/laxsallad-med-fetaost" }, "dinner": { "name": "Spenatsoppa rostade pumpafrön rester från frysen", "recipeLink": "/kunskapsbank/recept/spenatsoppa-med-rostade-pumpafron" }
      }, "Fredag": { "breakfast": { "name": "Chiapudding med jordgubbar och hallon", "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbar-och-hallon" }, "lunch": { "name": "Kycklingpizza rester från frysen", "recipeLink": "/kunskapsbank/recept/kycklingpizza" }, "dinner": { "name": "Torsk med guacamole och sötpotatis", "recipeLink": "/kunskapsbank/recept/torsk-med-guacamole-och-sotpotatis" }
      }, "Lördag": { "breakfast": { "name": "Chiapudding med jordgubbar och hallon rester", "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbar-och-hallon" }, "lunch": { "name": "Torsk med guacamole och sötpotatis rester", "recipeLink": "/kunskapsbank/recept/torsk-med-guacamole-och-sotpotatis" }, "dinner": { "name": "Chokladbar med majskakor", "recipeLink": "/kunskapsbank/recept/mandelkaka-med-med-choklad" }
      }, "Söndag": { "breakfast": { "name": "Omelettrulle", "recipeLink": "/kunskapsbank/recept/omelettrulle" }, "lunch": { "name": "Biff med nudelsallad och jordnötssås rester", "recipeLink": "/kunskapsbank/recept/biff-med-nudelsallad-och-jordnotssas" }, "dinner": { "name": "Morotssoppa med ingefära och rostade kikärtor", "recipeLink": "/kunskapsbank/recept/morotssoppa-med-ingefara-och-rostade-kikartor" }
      }
    }, "title": "Vecka 3: Synkroniserad från DOCX" }, "week4": { "days": { "Måndag": { "breakfast": { "name": "Omelettrulle rester", "recipeLink": "/kunskapsbank/recept/omelettrulle" }, "lunch": { "name": "Morotssoppa med ingefära och rostade kikärtor Rester", "recipeLink": "/kunskapsbank/recept/morotssoppa-med-ingefara-och-rostade-kikartor" }, "dinner": { "name": "Grönsakswok med kycklingfärs", "recipeLink": "/kunskapsbank/recept/asiatisk-kycklingfars-med-gronkal" }
      }, "Tisdag": { "breakfast": { "name": "Yoghurt med bovetegranola", "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-granola" }, "lunch": { "name": "Grönsakswok med kycklingfärs rester", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-tonfisk-och-agg" }, "dinner": { "name": "Ugnsbakad blomkål med ratatouille", "recipeLink": "/kunskapsbank/recept/ugnsbakad-blomkal-med-ratatouille" }
      }, "Onsdag": { "breakfast": { "name": "Färskostmacka med ost och paprika", "recipeLink": "/kunskapsbank/recept/macka-ost" }, "lunch": { "name": "Ugnsbakad blomkål med ratatouille rester", "recipeLink": "/kunskapsbank/recept/ugnsbakad-blomkal-med-ratatouille" }, "dinner": { "name": "Lövbiffsrullader med brie, pesto och rödbetor", "recipeLink": "/kunskapsbank/recept/lovbiffsrullader-med-brie-pesto-och-rodbetor" }
      }, "Torsdag": { "breakfast": { "name": "Äggröra med fetaost och spenat", "recipeLink": "/kunskapsbank/recept/aggrora-fetaost-spenat" }, "lunch": { "name": "Lövbiffsrullader med brie, pesto och rödbetor rester", "recipeLink": "/kunskapsbank/recept/lovbiffsrullader-med-brie-pesto-och-rodbetor" }, "dinner": { "name": "Torsk med saffranssås", "recipeLink": "/kunskapsbank/recept/torsk-med-saffranssas" }
      }, "Fredag": { "breakfast": { "name": "Bananmuffinfrån frysen", "recipeLink": "/kunskapsbank/recept/lax-fetaost-rostade" }, "lunch": { "name": "Torsk med saffranssås rester", "recipeLink": "/kunskapsbank/recept/torsk-med-saffranssas" }, "dinner": { "name": "Kycklingrullader med gorgonzola", "recipeLink": "/kunskapsbank/recept/kycklingrullader-med-gorgonzola" }
      }, "Lördag": { "breakfast": { "name": "Omelett med keso och bär", "recipeLink": "/kunskapsbank/recept/omelett-keso-bar" }, "lunch": { "name": "Kycklingrullader med gorgonzola rester", "recipeLink": "/kunskapsbank/recept/kycklingrullader-med-gorgonzola" }, "dinner": { "name": "Stekta äpplen med vit chokladkräm", "recipeLink": "/kunskapsbank/recept/blodapelsin-med-vit-chokladkram" }
      }, "Söndag": { "breakfast": { "name": "Blåbärssmoothie", "recipeLink": "/kunskapsbank/recept/blabarssmoothie" }, "lunch": { "name": "Valnötslax med fetaostcrème rester", "recipeLink": "/kunskapsbank/recept/valnotslax-med-fetaostcreme" }, "dinner": { "name": "Zucchiniplättar med yoghurtsås", "recipeLink": "/kunskapsbank/recept/zucchiniplattar-med-yoghurtsas" }
      }
    }, "title": "Vecka 4: Synkroniserad från DOCX" }, "week5": { "days": { "Måndag": { "breakfast": { "name": "Blåbärssmoothie rester", "recipeLink": "/kunskapsbank/recept/jordgubbar-mango-vit" }, "lunch": { "name": "Zucchiniplättar med yoghurtsås rester", "recipeLink": "/kunskapsbank/recept/zucchiniplattar-med-yoghurtsas" }, "dinner": { "name": "Köttfärslimpa med tomat", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-tomat" }
      }, "Tisdag": { "breakfast": { "name": "Färskostmacka med ost och paprika", "recipeLink": "/kunskapsbank/recept/macka-ost" }, "lunch": { "name": "Köttfärslimpa med tomat rester", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-tomat" }, "dinner": { "name": "Linssoppa från medelhavet rester från frysen", "recipeLink": "/kunskapsbank/recept/linssoppa-medelhavet-soppa" }
      }, "Onsdag": { "breakfast": { "name": "Yoghurt med mango och apelsin", "recipeLink": "/kunskapsbank/recept/yoghurt-med-apelsin-och-bovetegranola" }, "lunch": { "name": "Ugnsbakad blomkål med ratatouille rester från frysen", "recipeLink": "/kunskapsbank/recept/ugnsbakad-blomkal-med-ratatouille" }, "dinner": { "name": "Pestotorsk med capresesallad", "recipeLink": "/kunskapsbank/recept/pestotorsk-med-capresesallad" }
      }, "Torsdag": { "breakfast": { "name": "Stekt ägg med parmaskinka", "recipeLink": "/kunskapsbank/recept/stekt-agg-med-tomat" }, "lunch": { "name": "Pestotorsk med capresesallad rester", "recipeLink": "/kunskapsbank/recept/pestotorsk-med-capresesallad" }, "dinner": { "name": "Kyckling med blomkålsris och dillyoghurt", "recipeLink": "/kunskapsbank/recept/kyckling-med-stekt-blomkalsris-och-dillyoghurt" }
              }, "Fredag": { "breakfast": { "name": "Bananmuffinfrån frysen", "recipeLink": "/kunskapsbank/recept/lax-fetaost-rostade" }, "lunch": { "name": "Kyckling med blomkålsris och dillyoghurt rester", "recipeLink": "/kunskapsbank/recept/kyckling-med-stekt-blomkalsris-och-dillyoghurt" }, "dinner": { "name": "Nötgryta med rotfrukter", "recipeLink": "/kunskapsbank/recept/notgryta-med-rotfrukter" }
      }, "Lördag": { "breakfast": { "name": "Äggröra med champinjoner", "recipeLink": "/kunskapsbank/recept/aggrora-lax" }, "lunch": { "name": "Nötgryta med rotfrukter rester", "recipeLink": "/kunskapsbank/recept/notgryta-med-rotfrukter" }, "dinner": { "name": "Quinoasallad med scampi och mango", "recipeLink": "/kunskapsbank/recept/quinoasallad-med-scampi-och-mango" }, "dessert": { "name": "Gino", "recipeLink": "/kunskapsbank/recept/gino" }
              }, "Söndag": { "breakfast": { "name": "Bananpannkaka", "recipeLink": "/kunskapsbank/recept/stekt-agg-champinjoner-2" }, "lunch": { "name": "Quinoasallad med scampi och mango rester", "recipeLink": "/kunskapsbank/recept/quinoasallad-med-scampi-och-mango" }, "dinner": { "name": "Grönkålspaj med champinjoner", "recipeLink": "/kunskapsbank/recept/gronkalspaj-med-champinjoner" }
      }
    }, "title": "Vecka 5: Synkroniserad från DOCX" }, "week6": { "days": { "Måndag": { "breakfast": { "name": "Bananpannkaka rester", "recipeLink": "/kunskapsbank/recept/stekt-agg-champinjoner-2" }, "lunch": { "name": "Grönkålspaj med champinjoner rester", "recipeLink": "/kunskapsbank/recept/gronkalspaj-med-champinjoner" }, "dinner": { "name": "Köttfärslimpa med tomat rester från frysen", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-tomat" }
      }, "Tisdag": { "breakfast": { "name": "Kokta ägg med kaviar", "recipeLink": "/kunskapsbank/recept/kokt-agg-kaviar" }, "lunch": { "name": "Nötgryta med rotfrukter rester från frysen", "recipeLink": "/kunskapsbank/recept/notgryta-med-rotfrukter" }, "dinner": { "name": "Stekt torsk med bearnaisesås och haricot verts", "recipeLink": "/kunskapsbank/recept/stek-torsk-med-bearnaisesas-och-haricot-verts" }
      }, "Onsdag": { "breakfast": { "name": "Yoghurt med bovetegranola och bär", "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-bar" }, "lunch": { "name": "Stekt torsk med bearnaisesås och haricot verts rester", "recipeLink": "/kunskapsbank/recept/stek-torsk-med-bearnaisesas-och-haricot-verts" }, "dinner": { "name": "Kycklingfärsbiffar med vitlöksost", "recipeLink": "/kunskapsbank/recept/kycklingfarstimbaler-med-farskost-och-sweet-chili" }
      }, "Torsdag": { "breakfast": { "name": "Varm chiagröt med äpple", "recipeLink": "/kunskapsbank/recept/varm-chiagrot-apple" }, "lunch": { "name": "Kycklingfärsbiffar med vitlöksost rester", "recipeLink": "/kunskapsbank/recept/kycklingfarstimbaler-med-farskost-och-sweet-chili" }, "dinner": { "name": "Varma grönsaker med halloumi", "recipeLink": "/kunskapsbank/recept/tomatsoppa-med-halloumi" }
      }, "Fredag": { "breakfast": { "name": "Ägghack med kallrökt lax", "recipeLink": "/kunskapsbank/recept/aggrora-lax-2" }, "lunch": { "name": "Varma grönsaker med halloumi rester", "recipeLink": "/kunskapsbank/recept/tomatsoppa-med-halloumi" }, "dinner": { "name": "Lax med quinoasallad och grapefrukt", "recipeLink": "/kunskapsbank/recept/lax-med-quinoasallad-och-grapefrukt" }
      }, "Lördag": { "breakfast": { "name": "Smoothiebowl med blåbär och granola", "recipeLink": "/kunskapsbank/recept/smoothiebowl-blabar-granola" }, "lunch": { "name": "Lax med quinoasallad och grapefrukt rester", "recipeLink": "/kunskapsbank/recept/lax-med-quinoasallad-och-grapefrukt" }, "dinner": { "name": "Hamburgare med grekisk sallad", "recipeLink": "/kunskapsbank/recept/hamburgare-med-grekisk-sallad" }, "dessert": { "name": "Mandelkaka med med choklad", "recipeLink": "/kunskapsbank/recept/mandelkaka-med-med-choklad" }
      }, "Söndag": { "breakfast": { "name": "Smoothiebowl med blåbär och granola", "recipeLink": "/kunskapsbank/recept/smoothiebowl-blabar-granola" }, "lunch": { "name": "Hamburgare med grekisk sallad rester", "recipeLink": "/kunskapsbank/recept/hamburgare-med-grekisk-sallad" }, "dinner": { "name": "Asiatisk köttfärswok med grönkål", "recipeLink": "/kunskapsbank/recept/asiatisk-kycklingfars-med-gronkal" }
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

// Helper function to get week data for Functional Gut Health/Flow
export function getFlowWeekData(weekNumber: number): WeekMealPlan | null {
  const weekKey = `week${weekNumber}` as keyof typeof flowMealPlans;
  return flowMealPlans[weekKey] || null;
}

// Functional Insulin balance/Energy meal plans
export const energyMealPlans: Record<string, WeekMealPlan> = {
  "week1": {
    "title": "Vecka 1: Typ 2-diabetes kostschema",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med apelsin- och bovetegranola",
          "recipeLink": "/kunskapsbank/recept/yoghurt-bovetegranola-granola"
        },
        "snack": {
          "name": "Egenbakat: Bovetegranola med apelsin och kardemumma",
          "recipeLink": "/kunskapsbank/recept/bovetegranola-med-apelsin-och-kardemumma"
        },
        "lunch": {
          "name": "Omelett med paprika och champinjoner",
          "recipeLink": "/kunskapsbank/recept/omelett-med-paprika-och-champinjoner"
        },
        "dinner": {
          "name": "Kycklingburgare med mangosalsa och wasabi",
          "recipeLink": "/kunskapsbank/recept/kycklingburgare-med-mangosalsa-och-wasabi"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Stekt ägg med tomat",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-med-tomat"
        },
        "lunch": {
          "name": "Kycklingburgare med mangosalsa och wasabi rester",
          "recipeLink": "/kunskapsbank/recept/kycklingburgare-med-mangosalsa-och-wasabi"
        },
        "dinner": {
          "name": "Tonfiskröra med rödbetor",
          "recipeLink": "/kunskapsbank/recept/tonfiskrora-med-rodbetor"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Slät havregrynsgröt med vaniljprotein",
          "recipeLink": "/kunskapsbank/recept/slat-havregrynsgrot-med-vaniljprotein"
        },
        "lunch": {
          "name": "Tonfiskröra med rödbetor rester",
          "recipeLink": "/kunskapsbank/recept/tonfiskrora-med-rodbetor"
        },
        "dinner": {
          "name": "Köttfärswrap med röd curry och äpple",
          "recipeLink": "/kunskapsbank/recept/kottfarswrap-med-rod-curry-och-apple"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Keso med melon och ananas",
          "recipeLink": "/kunskapsbank/recept/keso-med-melon-och-ananas"
        },
        "lunch": {
          "name": "Köttfärswrap med röd curry och äpple rester",
          "recipeLink": "/kunskapsbank/recept/kottfarswrap-med-rod-curry-och-apple"
        },
        "dinner": {
          "name": "Apelsinkyckling med blomkålsris",
          "recipeLink": "/kunskapsbank/recept/apelsinkyckling-med-blomkalsris"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Bananpannkakor med pistagenötter och bär",
          "recipeLink": "/kunskapsbank/recept/bananpannkakor-med-pistagenotter-och-bar"
        },
        "lunch": {
          "name": "Apelsinkyckling med blomkålsris rester",
          "recipeLink": "/kunskapsbank/recept/apelsinkyckling-med-blomkalsris"
        },
        "dinner": {
          "name": "Fisk och skaldjursgryta från medelhavet",
          "recipeLink": "/kunskapsbank/recept/fisk-och-skaldjursgryta-fran-medelhavet"
        },
        "snack": {
          "name": "Egenbakat: Kesofrallor med äpple och pumpafrön",
          "recipeLink": "/kunskapsbank/recept/kesofrallor-med-apple-och-pumpafron"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Kesofralla med skinka och tomat",
          "recipeLink": "/kunskapsbank/recept/kesofralla-med-skinka-och-tomat"
        },
        "lunch": {
          "name": "Fisk och skaldjursgryta från medelhavet rester",
          "recipeLink": "/kunskapsbank/recept/fisk-och-skaldjursgryta-fran-medelhavet"
        },
        "dinner": {
          "name": "Biff med sötpotatis",
          "recipeLink": "/kunskapsbank/recept/biff-med-sotpotatis"
        },
        "dessert": {
          "name": "Mandelkaka med choklad",
          "recipeLink": "/kunskapsbank/recept/mandelkaka-med-med-choklad"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Champinjonomelett",
          "recipeLink": "/kunskapsbank/recept/omelett-champinjoner"
        },
        "lunch": {
          "name": "Biff med sötpotatis rester",
          "recipeLink": "/kunskapsbank/recept/biff-med-sotpotatis"
        },
        "dinner": {
          "name": "Quinoasallad med halloumi",
          "recipeLink": "/kunskapsbank/recept/quinoasallad-med-halloumi"
        }
      }
    }
  },
  "week2": {
    "title": "Vecka 2: Typ 2-diabetes kostschema",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med bär och bovetegranola",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-bar-och-bovetegranola"
        },
        "lunch": {
          "name": "Quinoasallad med halloumi rester",
          "recipeLink": "/kunskapsbank/recept/quinoasallad-med-halloumi"
        },
        "dinner": {
          "name": "Kycklingwok med teriyakisås och cashewnötter",
          "recipeLink": "/kunskapsbank/recept/kycklingwok-med-teriyakisas-och-cashewnotter"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Rökt lax med ägghack",
          "recipeLink": "/kunskapsbank/recept/aggrora-lax-2"
        },
        "lunch": {
          "name": "Kycklingwok med teriyakisås och cashewnötter rester",
          "recipeLink": "/kunskapsbank/recept/kycklingwok-med-teriyakisas-och-cashewnotter"
        },
        "dinner": {
          "name": "Panerad torsk med blomkålsris",
          "recipeLink": "/kunskapsbank/recept/panerad-torsk-med-blomkalsris"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Smoothiebowl med spirulina och havre",
          "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-spirulina-och-havre"
        },
        "lunch": {
          "name": "Panerad torsk med blomkålsris rester",
          "recipeLink": "/kunskapsbank/recept/panerad-torsk-med-blomkalsris"
        },
        "dinner": {
          "name": "Varm tacosallad",
          "recipeLink": "/kunskapsbank/recept/varm-tacosallad"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Kesotortilla med tomat, pesto och kalkon",
          "recipeLink": "/kunskapsbank/recept/kesotortilla-med-tomat-pesto-och-kalkon"
        },
        "lunch": {
          "name": "Varm tacosallad rester",
          "recipeLink": "/kunskapsbank/recept/varm-tacosallad"
        },
        "dinner": {
          "name": "Tofugryta med blomkålsris",
          "recipeLink": "/kunskapsbank/recept/tofugryta-med-blomkalsris"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Kesotortilla med tomat, pesto och kalkon rester",
          "recipeLink": "/kunskapsbank/recept/kesotortilla-med-tomat-pesto-och-kalkon"
        },
        "lunch": {
          "name": "Tofugryta med blomkålsris rester",
          "recipeLink": "/kunskapsbank/recept/tofugryta-med-blomkalsris"
        },
        "dinner": {
          "name": "Lövbiffsrullader med cheddar och coleslaw",
          "recipeLink": "/kunskapsbank/recept/lovbiffsrullader-med-cheddar-och-coleslaw"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Kesofralla med färskost och gurka",
          "recipeLink": "/kunskapsbank/recept/kesofralla-med-farskost-och-gurka"
        },
        "lunch": {
          "name": "Lövbiffsrullader med cheddar och coleslaw rester",
          "recipeLink": "/kunskapsbank/recept/lovbiffsrullader-med-cheddar-och-coleslaw"
        },
        "dinner": {
          "name": "Italiensk kycklinggratäng med mozzarella",
          "recipeLink": "/kunskapsbank/recept/italiensk-kycklinggratang-med-mozzarella"
        },
        "dessert": {
          "name": "Pistagekakor",
          "recipeLink": "/kunskapsbank/recept/pistagekakor"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Tropisk smoothie med kokosmjölk",
          "recipeLink": "/kunskapsbank/recept/tropisk-smoothie-med-kokosmjolk"
        },
        "lunch": {
          "name": "Italiensk kycklinggratäng med mozzarella rester",
          "recipeLink": "/kunskapsbank/recept/italiensk-kycklinggratang-med-mozzarella"
        },
        "dinner": {
          "name": "Lax- och broccolipaj",
          "recipeLink": "/kunskapsbank/recept/lax-och-broccolipaj"
        }
      }
    }
  },
  "week3": {
    "title": "Vecka 3: Typ 2-diabetes kostschema",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Tropisk smoothie med kokosmjölk rester",
          "recipeLink": "/kunskapsbank/recept/tropisk-smoothie-med-kokosmjolk"
        },
        "lunch": {
          "name": "Lax- och broccolipaj rester",
          "recipeLink": "/kunskapsbank/recept/lax-och-broccolipaj"
        },
        "dinner": {
          "name": "Linssallad med fetaost och pekannötter",
          "recipeLink": "/kunskapsbank/recept/linssallad-med-fetaost-och-pekannotter"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med kalkon och granatäpple",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-kalkon-och-granatapple"
        },
        "lunch": {
          "name": "Linssallad med fetaost och pekannötter rester",
          "recipeLink": "/kunskapsbank/recept/linssallad-med-fetaost-och-pekannotter"
        },
        "dinner": {
          "name": "Kalkonbolognese med morotspasta",
          "recipeLink": "/kunskapsbank/recept/kalkonbolognese-med-morotspasta"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Bananpannkaka med keso, blåbär och mango",
          "recipeLink": "/kunskapsbank/recept/bananpannkaka-med-keso-blabar-och-mango"
        },
        "lunch": {
          "name": "Kalkonbolognese med morotspasta rester",
          "recipeLink": "/kunskapsbank/recept/kalkonbolognese-med-morotspasta"
        },
        "dinner": {
          "name": "Lövbiffsrullad med ugnsrostade rödbetor",
          "recipeLink": "/kunskapsbank/recept/lovbiffsrullad-med-ugnsrostade-rodbetor"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola och aprikos",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola-och-aprikos"
        },
        "lunch": {
          "name": "Lövbiffsrullad med ugnsrostade rödbetor rester",
          "recipeLink": "/kunskapsbank/recept/lovbiffsrullad-med-ugnsrostade-rodbetor"
        },
        "dinner": {
          "name": "Minestronesoppa",
          "recipeLink": "/kunskapsbank/recept/minestronesoppa"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Kesofralla med ost och paprika",
          "recipeLink": "/kunskapsbank/recept/kesofralla-med-ost-och-paprika"
        },
        "lunch": {
          "name": "Minestronesoppa rester",
          "recipeLink": "/kunskapsbank/recept/minestronesoppa"
        },
        "dinner": {
          "name": "Hamburgare med fetaostkräm och rostad sötpotatis",
          "recipeLink": "/kunskapsbank/recept/hamburgare-med-fetaostkram-och-rostad-sotpotatis"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Ugnsbakad gröt",
          "recipeLink": "/kunskapsbank/recept/ugnsbakad-grot"
        },
        "lunch": {
          "name": "Hamburgare med fetaostkräm och rostad sötpotatis rester",
          "recipeLink": "/kunskapsbank/recept/hamburgare-med-fetaostkram-och-rostad-sotpotatis"
        },
        "dinner": {
          "name": "Halstrad tonfisk med grönsaker och sesamdressing",
          "recipeLink": "/kunskapsbank/recept/halstrad-tonfisk-med-gronsaker-och-sesamdressing"
        },
        "dessert": {
          "name": "Blodapelsin med vit chokladkräm",
          "recipeLink": "/kunskapsbank/recept/blodapelsin-med-vit-chokladkram"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Ugnsbakad gröt rester",
          "recipeLink": "/kunskapsbank/recept/ugnsbakad-grot"
        },
        "lunch": {
          "name": "Halstrad tonfisk med grönsaker och sesamdressing rester",
          "recipeLink": "/kunskapsbank/recept/halstrad-tonfisk-med-gronsaker-och-sesamdressing"
        },
        "dinner": {
          "name": "Tacokyckling med blomkålssallad",
          "recipeLink": "/kunskapsbank/recept/tacokyckling-med-blomkalssallad"
        }
      }
    }
  },
  "week4": {
    "title": "Vecka 4: Typ 2-diabetes kostschema",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Proteingröt med äpple",
          "recipeLink": "/kunskapsbank/recept/proteingrot-med-apple"
        },
        "lunch": {
          "name": "Tacokyckling med blomkålssallad rester",
          "recipeLink": "/kunskapsbank/recept/tacokyckling-med-blomkalssallad"
        },
        "dinner": {
          "name": "Vegetarisk paprikapasta med citron",
          "recipeLink": "/kunskapsbank/recept/vegetarisk-paprikapasta-med-citron"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Stekt ägg med kalkon och senapsmajonäs",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-med-kalkon-och-senapsmajonnas"
        },
        "lunch": {
          "name": "Vegetarisk paprikapasta med citron rester",
          "recipeLink": "/kunskapsbank/recept/vegetarisk-paprikapasta-med-citron"
        },
        "dinner": {
          "name": "Tonfisksallad med rödbetsröra",
          "recipeLink": "/kunskapsbank/recept/tonfisksallad-med-rodbetsrora"
        },
        "snack": {
          "name": "Egenbakat: Jordgubbssylt",
          "recipeLink": "/kunskapsbank/recept/jordgubbssylt"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola och sylt",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola-och-sylt"
        },
        "lunch": {
          "name": "Tonfisksallad med rödbetsröra rester",
          "recipeLink": "/kunskapsbank/recept/tonfisksallad-med-rodbetsrora"
        },
        "dinner": {
          "name": "Kycklingfärstimbaler med färskost och sweet chili",
          "recipeLink": "/kunskapsbank/recept/kycklingfarstimbaler-med-farskost-och-sweet-chili"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Blåbärssmoothie",
          "recipeLink": "/kunskapsbank/recept/blabarssmoothie"
        },
        "lunch": {
          "name": "Kycklingfärstimbaler med färskost och sweet chili rester",
          "recipeLink": "/kunskapsbank/recept/kycklingfarstimbaler-med-farskost-och-sweet-chili"
        },
        "dinner": {
          "name": "Lövbiff med stekta grönsaker och pestoyoghurt",
          "recipeLink": "/kunskapsbank/recept/lovbiff-med-stekta-gronsaker-och-pestoyoghurt"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Blåbärssmoothie rester",
          "recipeLink": "/kunskapsbank/recept/blabarssmoothie"
        },
        "lunch": {
          "name": "Lövbiff med stekta grönsaker och pestoyoghurt rester",
          "recipeLink": "/kunskapsbank/recept/lovbiff-med-stekta-gronsaker-och-pestoyoghurt"
        },
        "dinner": {
          "name": "Laxgratäng med blomkålsmos",
          "recipeLink": "/kunskapsbank/recept/laxgratang-med-blomkalsmos"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Äggröra med sockerärtor",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-sockerartor"
        },
        "lunch": {
          "name": "Laxgratäng med blomkålsmos rester",
          "recipeLink": "/kunskapsbank/recept/laxgratang-med-blomkalsmos"
        },
        "dinner": {
          "name": "Entrecote med sparris och ärtpesto",
          "recipeLink": "/kunskapsbank/recept/entrecote-med-sparris-och-artpesto"
        },
        "dessert": {
          "name": "Morotskaka med havregryn och chiafrön",
          "recipeLink": "/kunskapsbank/recept/morotskaka-med-havregryn-och-chiafron"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Havrevåffla med jordgubbssylt och vaniljkeso",
          "recipeLink": "/kunskapsbank/recept/havrevaffla-med-jordgubbssylt-och-vaniljkeso"
        },
        "lunch": {
          "name": "Entrecote med sparris och ärtpesto rester",
          "recipeLink": "/kunskapsbank/recept/entrecote-med-sparris-och-artpesto"
        },
        "dinner": {
          "name": "Fisk och skaldjursgryta från medelhavet",
          "recipeLink": "/kunskapsbank/recept/fisk-och-skaldjursgryta-fran-medelhavet"
        }
      }
    }
  },
  "week5": {
    "title": "Vecka 5: Typ 2-diabetes kostschema",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Kokta ägg med kaviar",
          "recipeLink": "/kunskapsbank/recept/kokta-agg-med-kaviar"
        },
        "lunch": {
          "name": "Lax- och broccolipaj rester",
          "recipeLink": "/kunskapsbank/recept/lax-och-broccolipaj"
        },
        "dinner": {
          "name": "Mexikansk nötfärsfräs",
          "recipeLink": "/kunskapsbank/recept/mexikanskt-notfarsfras"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Kokos- och jordgubbssmoothie med bovetegranola",
          "recipeLink": "/kunskapsbank/recept/kokos-och-jordgubbssmoothie-med-bovetegranola"
        },
        "lunch": {
          "name": "Mexikansk nötfärsfräs rester",
          "recipeLink": "/kunskapsbank/recept/mexikanskt-notfarsfras"
        },
        "dinner": {
          "name": "Oneplate ugnsbakad kyckling och rödbetor",
          "recipeLink": "/kunskapsbank/recept/oneplate-ugnsbakad-kyckling-och-rodbetor"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Vallmogröt med apelsinfileer",
          "recipeLink": "/kunskapsbank/recept/vallmogrot-med-apelsinfileer"
        },
        "lunch": {
          "name": "Oneplate ugnsbakad kyckling och rödbetor rester",
          "recipeLink": "/kunskapsbank/recept/oneplate-ugnsbakad-kyckling-och-rodbetor"
        },
        "dinner": {
          "name": "Riswrap med philadelphiaost och lax",
          "recipeLink": "/kunskapsbank/recept/riswrap-med-philadelphiaost-och-lax"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Äggröra med avokado och granatäpple",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-avokado-och-granatapple"
        },
        "lunch": {
          "name": "Riswrap med philadelphiaost och lax rester",
          "recipeLink": "/kunskapsbank/recept/riswrap-med-philadelphiaost-och-lax"
        },
        "dinner": {
          "name": "Poke Bowl med pankopanerad tofu",
          "recipeLink": "/kunskapsbank/recept/poke-bowl-med-pankopanerad-tofu"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Chiapudding med jordgubbssylt och pistagenötter",
          "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbssylt-och-pistagenotter"
        },
        "lunch": {
          "name": "Poke Bowl med pankopanerad tofu rester",
          "recipeLink": "/kunskapsbank/recept/poke-bowl-med-pankopanerad-tofu"
        },
        "dinner": {
          "name": "Fläskkarre med fylld sötpotatis och citronsås",
          "recipeLink": "/kunskapsbank/recept/flaskkarre-med-fylld-sotpotatis-och-citronsas"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Ugnsomelett med keso och bär",
          "recipeLink": "/kunskapsbank/recept/ugnsomelett-med-keso-och-bar"
        },
        "lunch": {
          "name": "Fläskkarre med fylld sötpotatis och citronsås rester",
          "recipeLink": "/kunskapsbank/recept/flaskkarre-med-fylld-sotpotatis-och-citronsas"
        },
        "dinner": {
          "name": "Kycklingbullar med soltorkade tomater",
          "recipeLink": "/kunskapsbank/recept/kycklingbullar-med-soltorkade-tomater"
        },
        "dessert": {
          "name": "Citronkakor med chiafrön",
          "recipeLink": "/kunskapsbank/recept/citronkakor-med-chiafron"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Ugnsomelett med keso och bär rester",
          "recipeLink": "/kunskapsbank/recept/ugnsomelett-med-keso-och-bar"
        },
        "lunch": {
          "name": "Kycklingbullar med soltorkade tomater rester",
          "recipeLink": "/kunskapsbank/recept/kycklingbullar-med-soltorkade-tomater"
        },
        "dinner": {
          "name": "Grönsakspannkaka med asiatisk sås",
          "recipeLink": "/kunskapsbank/recept/gronsakspannkaka-med-asiatisk-sas"
        }
      }
    }
  },
  "week6": {
    "title": "Vecka 6: Typ 2-diabetes kostschema",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Saffransgröt med bär och granatäpple",
          "recipeLink": "/kunskapsbank/recept/saffransgrot-med-bar-och-granatapple"
        },
        "lunch": {
          "name": "Tacokyckling med blomkålssallad rester",
          "recipeLink": "/kunskapsbank/recept/tacokyckling-med-blomkalssallad"
        },
        "dinner": {
          "name": "Laxbiffar med mango och wasabi",
          "recipeLink": "/kunskapsbank/recept/laxbiffar-med-mango-och-wasabi"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Omelettrulle",
          "recipeLink": "/kunskapsbank/recept/omelettrulle"
        },
        "lunch": {
          "name": "Laxbiffar med mango och wasabi rester",
          "recipeLink": "/kunskapsbank/recept/laxbiffar-med-mango-och-wasabi"
        },
        "dinner": {
          "name": "Köftekyckling med grönsaker och granatäpple",
          "recipeLink": "/kunskapsbank/recept/koftekyckling-med-gronsaker-och-granatapple"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Omelettrulle rester",
          "recipeLink": "/kunskapsbank/recept/omelettrulle"
        },
        "lunch": {
          "name": "Köftekyckling med grönsaker och granatäpple rester",
          "recipeLink": "/kunskapsbank/recept/koftekyckling-med-gronsaker-och-granatapple"
        },
        "dinner": {
          "name": "Ramensoppa med tofu",
          "recipeLink": "/kunskapsbank/recept/ramensoppa-med-tofu"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Chiapudding med med apelsin och mynta",
          "recipeLink": "/kunskapsbank/recept/chiapudding-med-med-apelsin-och-mynta"
        },
        "lunch": {
          "name": "Ramensoppa med tofu rester",
          "recipeLink": "/kunskapsbank/recept/ramensoppa-med-tofu"
        },
        "dinner": {
          "name": "Paprikastekt torsk med linssallad och citronyoghurt",
          "recipeLink": "/kunskapsbank/recept/paprikastekt-torsk-med-linssallad-och-citronyoghurt"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Kesofralla med skinka och tomat",
          "recipeLink": "/kunskapsbank/recept/kesofralla-med-skinka-och-tomat"
        },
        "lunch": {
          "name": "Paprikastekt torsk med linssallad och citronyoghurt rester",
          "recipeLink": "/kunskapsbank/recept/paprikastekt-torsk-med-linssallad-och-citronyoghurt"
        },
        "dinner": {
          "name": "Enchiladas med nötfärs och majs",
          "recipeLink": "/kunskapsbank/recept/enchiladas-med-notfars-och-majs"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Ugnsbakade ägg med spenat",
          "recipeLink": "/kunskapsbank/recept/ugnsbakade-agg-med-spenat"
        },
        "lunch": {
          "name": "Enchiladas med nötfärs och majs rester",
          "recipeLink": "/kunskapsbank/recept/enchiladas-med-notfars-och-majs"
        },
        "dinner": {
          "name": "Stekt kyckling med asiatisk tomatsallad",
          "recipeLink": "/kunskapsbank/recept/stekt-kyckling-med-asiatisk-tomatsallad"
        },
        "dessert": {
          "name": "Chokladmuffins",
          "recipeLink": "/kunskapsbank/recept/chokladmuffins"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Ugnsbakade ägg med spenat rester",
          "recipeLink": "/kunskapsbank/recept/ugnsbakade-agg-med-spenat"
        },
        "lunch": {
          "name": "Stekt kyckling med asiatisk tomatsallad rester",
          "recipeLink": "/kunskapsbank/recept/stekt-kyckling-med-asiatisk-tomatsallad"
        },
        "dinner": {
          "name": "Chevresallad med blodapelsin",
          "recipeLink": "/kunskapsbank/recept/chevresallad-med-blodapelsin"
        }
      }
    }
  }
}

// Helper function to get week data for Functional Insulin balance/Energy
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
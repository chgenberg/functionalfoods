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
export const mealPlans: Record<string, WeekMealPlan> = { "week1": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketomusli" }, "lunch": { "name": "Tonfisksallad med äpple", "recipeLink": "/kunskapsbank/recept/tonfisksallad-med-apple" }, "dinner": { "name": "Squashspagetti med köttfärssås", "recipeLink": "/kunskapsbank/recept/squashspagetti-med-kottfarssas" }, "snack": { "name": "Ketomüsli", "recipeLink": "/kunskapsbank/recept/ketomusli" } }, "Tisdag": { "breakfast": { "name": "Stekt ägg med lax", "recipeLink": "/kunskapsbank/recept/stekt-agg-med-lax" }, "lunch": { "name": "Squashspagetti med köttfärssås (rester)", "recipeLink": "/kunskapsbank/recept/squashspagetti-med-kottfarssas" }, "dinner": { "name": "Het ratatouille", "recipeLink": "/kunskapsbank/recept/het-ratatouille" } }, "Onsdag": { "breakfast": { "name": "Grön smoothie", "recipeLink": "/kunskapsbank/recept/gron-smoothie" }, "lunch": { "name": "Pokebowl med kyckling", "recipeLink": "/kunskapsbank/recept/poke-bowl-kyckling" }, "dinner": { "name": "Köttfärsbiffar med stekt blomkål", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-stekt-blomkal" } }, "Torsdag": { "breakfast": { "name": "Omelett med tomat", "recipeLink": "/kunskapsbank/recept/omelett-med-tomat" }, "lunch": { "name": "Het ratatouille (rester)", "recipeLink": "/kunskapsbank/recept/het-ratatouille" }, "dinner": { "name": "Pokebowl med kyckling (rester)", "recipeLink": "/kunskapsbank/recept/poke-bowl-kyckling" }, "snack": { "name": "Havrefrallor med morötter och aprikoser", "recipeLink": "/kunskapsbank/recept/havrefralla-med-morotter-och-torkade-aprikoser" } }, "Fredag": { "breakfast": { "name": "Havrefralla med morötter och torkade aprikoser", "recipeLink": "/kunskapsbank/recept/havrefralla-med-morotter-och-torkade-aprikoser" }, "lunch": { "name": "Köttfärsbiffar med stekt blomkål (rester)", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-stekt-blomkal" }, "dinner": { "name": "Kycklinggryta med bakad spetskål", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal" } }, "Lördag": { "breakfast": { "name": "Tropisk Smoothiebowl", "recipeLink": "/kunskapsbank/recept/smoothie-smoothiebowl" }, "lunch": { "name": "Kycklinggryta med bakad spetskål (rester)", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal" }, "dinner": { "name": "Laxburgare med krämig grönsaksröra", "recipeLink": "/kunskapsbank/recept/laxburgare-med-kramig-gronsaksrora" }, "dessert": { "name": "Mangoglass", "recipeLink": "/kunskapsbank/recept/mangoglass" } }, "Söndag": { "breakfast": { "name": "Tropisk Smoothiebowl (rester)", "recipeLink": "/kunskapsbank/recept/smoothie-smoothiebowl" }, "lunch": { "name": "Laxburgare med krämig grönsaksröra (rester)", "recipeLink": "/kunskapsbank/recept/laxburgare-med-kramig-gronsaksrora" }, "dinner": { "name": "Ugnsbakad tomat med köttfärs (rester)", "recipeLink": "/kunskapsbank/recept/ugnsbakad-tomat-med-kottfars" } } }, "title": "Vecka 1" }, "week2": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketomusli" }, "lunch": { "name": "Ugnsbakad tomat med köttfärs", "recipeLink": "/kunskapsbank/recept/ugnsbakad-tomat-med-kottfars" }, "dinner": { "name": "Nudelsoppa med grönsaker", "recipeLink": "/kunskapsbank/recept/nudelsoppa-med-gronsaker" }
      }, "Tisdag": { "breakfast": { "name": "Omelett med champinjoner", "recipeLink": "/kunskapsbank/recept/omelett-champinjoner" }, "lunch": { "name": "Nudelsoppa med grönsaker", "recipeLink": "/kunskapsbank/recept/nudelsoppa-med-gronsaker" }, "dinner": { "name": "Torskrygg med ägghack och sparris", "recipeLink": "/kunskapsbank/recept/torskrygg-med-agghack-och-sparris" }
      }, "Onsdag": { "breakfast": { "name": "Morotsjuice", "recipeLink": "/kunskapsbank/recept/morotsjuice-juice" }, "lunch": { "name": "Torskrygg med ägghack och sparris", "recipeLink": "/kunskapsbank/recept/torskrygg-med-agghack-och-sparris" }, "dinner": { "name": "Turkiska lammfärsspett med raita och sallad", "recipeLink": "/kunskapsbank/recept/turkiska-lammfarsspett-med-raita-och-sallad" }
      }, "Torsdag": { "breakfast": { "name": "Morotsjuice", "recipeLink": "/kunskapsbank/recept/morotsjuice-juice" }, "lunch": { "name": "Turkiska lammfärsspett med raita och sallad", "recipeLink": "/kunskapsbank/recept/turkiska-lammfarsspett-med-raita-och-sallad" }, "dinner": { "name": "Kycklingröra med örter och tomat", "recipeLink": "/kunskapsbank/recept/kycklingrora-med-orter-och-tomat" }
      }, "Fredag": { "breakfast": { "name": "Havrefralla med morötter och torkade aprikoser", "recipeLink": "/kunskapsbank/recept/havrefralla-med-morotter-och-torkade-aprikoser" }, "lunch": { "name": "Kycklingröra med örter och tomat", "recipeLink": "/kunskapsbank/recept/kycklingrora-med-orter-och-tomat" }, "dinner": { "name": "Lax med fetaost och rostade rotfrukter", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }
      }, "Lördag": { "breakfast": { "name": "Bärsmoothiebowl", "recipeLink": "/kunskapsbank/recept/barsmoothiebowl" }, "lunch": { "name": "Lax med fetaost och rostade rotfrukter", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }, "dinner": { "name": "Asiatiska köttbullar med nudelsallad", "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad" }, "dessert": { "name": "Jordgubbar och mango med vit chokladkräm", "recipeLink": "/kunskapsbank/recept/jordgubbar-och-mango-med-vit-chokladkram" }
      }, "Söndag": { "breakfast": { "name": "Bärsmoothiebowl", "recipeLink": "/kunskapsbank/recept/barsmoothiebowl" }, "lunch": { "name": "Asiatiska köttbullar med nudelsallad", "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad" }, "dinner": { "name": "Päronsallad med chevréost", "recipeLink": "/kunskapsbank/recept/paronsallad-med-chevreost" }
      }
    }, "title": "Vecka 2" }, "week3": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketomusli" }, "lunch": { "name": "Päronsallad med chevréost", "recipeLink": "/kunskapsbank/recept/paronsallad-med-chevreost" }, "dinner": { "name": "Kycklingfylld aubergine", "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine" }
      }, "Tisdag": { "breakfast": { "name": "Äggröra med lax", "recipeLink": "/kunskapsbank/recept/aggrora-med-lax" }, "lunch": { "name": "Kycklingfylld aubergine", "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine" }, "dinner": { "name": "Rökt lax med blomkålsallad och citronyoghurt", "recipeLink": "/kunskapsbank/recept/rokt-lax-med-blomkalssallad-och-citronyoghurt" }
      }, "Onsdag": { "breakfast": { "name": "Rödbetsjuice", "recipeLink": "/kunskapsbank/recept/rodbetsjuice" }, "lunch": { "name": "Rökt lax med blomkålsallad och citronyoghurt", "recipeLink": "/kunskapsbank/recept/rokt-lax-med-blomkalssallad-och-citronyoghurt" }, "dinner": { "name": "Vegetarisk currygryta med panéer", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }
      }, "Torsdag": { "breakfast": { "name": "Rödbetsjuice", "recipeLink": "/kunskapsbank/recept/rodbetsjuice" }, "lunch": { "name": "Vegetarisk currygryta med panéer", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }, "dinner": { "name": "Kycklinggryta med bakad spetskål", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal" }
      }, "Fredag": { "breakfast": { "name": "Havrefralla med morötter och torkade aprikoser", "recipeLink": "/kunskapsbank/recept/havrefralla-med-morotter-och-torkade-aprikoser" }, "lunch": { "name": "Lax med fetaost och rostade rotfrukter", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }, "dinner": { "name": "Hamburgare med hummus", "recipeLink": "/kunskapsbank/recept/hamburgare-med-hummus" }
      }, "Lördag": { "breakfast": { "name": "Keso med granola och fruktsallad", "recipeLink": "/kunskapsbank/recept/keso-med-granola-och-fruktsallad" }, "lunch": { "name": "Hamburgare med hummus", "recipeLink": "/kunskapsbank/recept/hamburgare-med-hummus" }, "dinner": { "name": "Ugnsbakad kyckling med tzatziki och sallad", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad-2" }, "dessert": { "name": "Mandel och citronpaj", "recipeLink": "/kunskapsbank/recept/mandel-och-citronpaj" }
      }, "Söndag": { "breakfast": { "name": "Omelett med hallon", "recipeLink": "/kunskapsbank/recept/omelett-hallon" }, "lunch": { "name": "Ugnsbakad kyckling med tzatziki och sallad", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad-2" }, "dinner": { "name": "Lax med waldorfsallad", "recipeLink": "/kunskapsbank/recept/lax-med-waldorfsallad" }
      }
    }, "title": "Vecka 2" }, "week3": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketomusli" }, "lunch": { "name": "Päronsallad med chevréost", "recipeLink": "/kunskapsbank/recept/paronsallad-med-chevreost" }, "dinner": { "name": "Kycklingfylld aubergine", "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine" }
      }, "Tisdag": { "breakfast": { "name": "Äggröra med lax", "recipeLink": "/kunskapsbank/recept/aggrora-med-lax" }, "lunch": { "name": "Kycklingfylld aubergine", "recipeLink": "/kunskapsbank/recept/kycklingfylld-aubergine" }, "dinner": { "name": "Rökt lax med blomkålsallad och citronyoghurt", "recipeLink": "/kunskapsbank/recept/rokt-lax-med-blomkalssallad-och-citronyoghurt" }
      }, "Onsdag": { "breakfast": { "name": "Rödbetsjuice", "recipeLink": "/kunskapsbank/recept/rodbetsjuice" }, "lunch": { "name": "Rökt lax med blomkålsallad och citronyoghurt", "recipeLink": "/kunskapsbank/recept/rokt-lax-med-blomkalssallad-och-citronyoghurt" }, "dinner": { "name": "Vegetarisk currygryta med panéer", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }
      }, "Torsdag": { "breakfast": { "name": "Rödbetsjuice", "recipeLink": "/kunskapsbank/recept/rodbetsjuice" }, "lunch": { "name": "Vegetarisk currygryta med panéer", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }, "dinner": { "name": "Kycklinggryta med bakad spetskål", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal" }
      }, "Fredag": { "breakfast": { "name": "Havrefralla med morötter och torkade aprikoser", "recipeLink": "/kunskapsbank/recept/havrefralla-med-morotter-och-torkade-aprikoser" }, "lunch": { "name": "Lax med fetaost och rostade rotfrukter", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }, "dinner": { "name": "Hamburgare med hummus", "recipeLink": "/kunskapsbank/recept/hamburgare-med-hummus" }
      }, "Lördag": { "breakfast": { "name": "Keso med granola och fruktsallad", "recipeLink": "/kunskapsbank/recept/keso-med-granola-och-fruktsallad" }, "lunch": { "name": "Hamburgare med hummus", "recipeLink": "/kunskapsbank/recept/hamburgare-med-hummus" }, "dinner": { "name": "Ugnsbakad kyckling med tzatziki och sallad", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad-2" }, "dessert": { "name": "Mandel och citronpaj", "recipeLink": "/kunskapsbank/recept/mandel-och-citronpaj" }
      }, "Söndag": { "breakfast": { "name": "Omelett med hallon", "recipeLink": "/kunskapsbank/recept/omelett-hallon" }, "lunch": { "name": "Ugnsbakad kyckling med tzatziki och sallad", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad-2" }, "dinner": { "name": "Lax med waldorfsallad", "recipeLink": "/kunskapsbank/recept/lax-med-waldorfsallad" }
      }
    }, "title": "Vecka 3" }, "week4": { "days": { "Måndag": { "breakfast": { "name": "Omelett med bär", "recipeLink": "/kunskapsbank/recept/omelett-bar" }, "lunch": { "name": "Lax med waldorfsallad", "recipeLink": "/kunskapsbank/recept/lax-med-waldorfsallad" }, "dinner": { "name": "Grekiska köttbullar i tomatsås", "recipeLink": "/kunskapsbank/recept/grekiska-kottbullar-i-tomatsas-auto-2" }
      }, "Tisdag": { "breakfast": { "name": "Ägghack med kalkon", "recipeLink": "/kunskapsbank/recept/agghack-med-kalkon" }, "lunch": { "name": "Grekiska köttbullar i tomatsås", "recipeLink": "/kunskapsbank/recept/grekiska-kottbullar-i-tomatsas-auto-2" }, "dinner": { "name": "Kycklinggryta med röda linser", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser" }
      }, "Onsdag": { "breakfast": { "name": "Fruktsmoothie", "recipeLink": "/kunskapsbank/recept/fruktsmoothie" }, "lunch": { "name": "Kycklinggryta med röda linser", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-roda-linser" }, "dinner": { "name": "Laxsallad med vindruvor", "recipeLink": "/kunskapsbank/recept/laxsallad-med-vindruvor" }
      }, "Torsdag": { "breakfast": { "name": "Fruktsmoothie", "recipeLink": "/kunskapsbank/recept/fruktsmoothie" }, "lunch": { "name": "Laxsallad med vindruvor", "recipeLink": "/kunskapsbank/recept/laxsallad-med-vindruvor" }, "dinner": { "name": "Asiatiska köttbullar med nudelsallad", "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad" }
      }, "Fredag": { "breakfast": { "name": "Bananplättar med mango och granatäpple", "recipeLink": "/kunskapsbank/recept/bananplattar-med-mango-och-granatapple" }, "lunch": { "name": "Vegetarisk currygryta med panéer", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }, "dinner": { "name": "Grillspett med grekisk sallad och morotstzatziki", "recipeLink": "/kunskapsbank/recept/ajvarspett-med-grekisk-sallad-och-tzatziki" }
      }, "Lördag": { "breakfast": { "name": "Keso med hallon och granatäpple", "recipeLink": "/kunskapsbank/recept/keso-med-hallon-och-granatapple" }, "lunch": { "name": "Grillspett med grekisk sallad och morotstzatziki", "recipeLink": "/kunskapsbank/recept/ajvarspett-med-grekisk-sallad-och-tzatziki" }, "dinner": { "name": "Ugnsbakad kyckling med quinoasallad och chilimajonäs", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-quinoasallad-och-chilimajonas" }, "dessert": { "name": "Hallon och kiwi med vit chokladcréme", "recipeLink": "/kunskapsbank/recept/hallon-och-kiwi-med-vit-chokladcreme" }
      }, "Söndag": { "breakfast": { "name": "Havregrynsgröt med torkad frukt och äpple", "recipeLink": "/kunskapsbank/recept/havregrynsgrot-torkad-frukt" }, "lunch": { "name": "Ugnsbakad kyckling med quinoasallad och chilimajonäs", "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-quinoasallad-och-chilimajonas" }, "dinner": { "name": "Torsk från mellanöstern", "recipeLink": "/kunskapsbank/recept/torsk-fran-mellanostern" }
      }
    }, "title": "Vecka 4" }, "week5": { "days": { "Måndag": { "breakfast": { "name": "Yoghurt med ketomüsli", "recipeLink": "/kunskapsbank/recept/yoghurt-med-ketomusli" }, "lunch": { "name": "Torsk från mellanöstern", "recipeLink": "/kunskapsbank/recept/torsk-fran-mellanostern" }, "dinner": { "name": "Japansk kycklingfärswok med groddar", "recipeLink": "/kunskapsbank/recept/japansk-kycklingfarswok-med-groddar" }
      }, "Tisdag": { "breakfast": { "name": "Äggröra med paprika", "recipeLink": "/kunskapsbank/recept/aggrora-med-paprika" }, "lunch": { "name": "Japansk kycklingfärswok med groddar", "recipeLink": "/kunskapsbank/recept/japansk-kycklingfarswok-med-groddar" }, "dinner": { "name": "Grekisk sallad", "recipeLink": "/kunskapsbank/recept/grekisk-sallad" }
      }, "Onsdag": { "breakfast": { "name": "Chiafrögröt", "recipeLink": "/kunskapsbank/recept/chiafrogrot" }, "lunch": { "name": "Lax med fetaost och rostade rotfrukter", "recipeLink": "/kunskapsbank/recept/lax-med-fetaost-och-rostade-rotfrukter" }, "dinner": { "name": "Köttfärslimpa med ajvar och rostad sötpotatis", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-ajvar-och-rostad-sotpotatis" }
      }, "Torsdag": { "breakfast": { "name": "Bananplättar med jordgubbar och kokos", "recipeLink": "/kunskapsbank/recept/bananplattar-jordgubbar-kokos" }, "lunch": { "name": "Köttfärslimpa med ajvar och rostad sötpotatis", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-ajvar-och-rostad-sotpotatis" }, "dinner": { "name": "Vegetarisk currygryta med panéer", "recipeLink": "/kunskapsbank/recept/vegetarisk-currygryta-med-paneer" }
      }, "Fredag": { "breakfast": { "name": "Mangosmoothie med spenat", "recipeLink": "/kunskapsbank/recept/mangosmoothie-med-spenat" }, "lunch": { "name": "Skaldjursgryta med torsk i gul curry", "recipeLink": "/kunskapsbank/recept/skaldjursgryta-med-torsk-i-gul-curry" }, "dinner": { "name": "Kycklingjärpar med linssallad", "recipeLink": "/kunskapsbank/recept/kycklingjarpar-med-linssallad" }, "dessert": { "name": "Mandelkaka med frukt", "recipeLink": "/kunskapsbank/recept/mandelkaka-med-frukt" }
      }, "Lördag": { "breakfast": { "name": "Mangosmoothie med spenat", "recipeLink": "/kunskapsbank/recept/mangosmoothie-med-spenat" }, "lunch": { "name": "Kycklingjärpar med linssallad", "recipeLink": "/kunskapsbank/recept/kycklingjarpar-med-linssallad" }, "dinner": { "name": "Laxfilé med ratatouille", "recipeLink": "/kunskapsbank/recept/laxfile-med-ratatouille" }
      }, "Söndag": { "breakfast": { "name": "Mangosmoothie med spenat", "recipeLink": "/kunskapsbank/recept/mangosmoothie-med-spenat" }, "lunch": { "name": "Kycklingjärpar med linssallad", "recipeLink": "/kunskapsbank/recept/kycklingjarpar-med-linssallad" }, "dinner": { "name": "Laxfilé med ratatouille", "recipeLink": "/kunskapsbank/recept/laxfile-med-ratatouille" }
      }
    }, "title": "Vecka 5" }, "week6": { "days": { "Måndag": { "breakfast": { "name": "Havrefralla med morötter och torkade aprikoser", "recipeLink": "/kunskapsbank/recept/havrefralla-med-morotter-och-torkade-aprikoser" }, "lunch": { "name": "Laxfilé med ratatouille", "recipeLink": "/kunskapsbank/recept/laxfile-med-ratatouille" }, "dinner": { "name": "Grönsakswok med kyckling", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kyckling" }
      }, "Tisdag": { "breakfast": { "name": "Kokt ägg med majonnäs", "recipeLink": "/kunskapsbank/recept/kokt-agg-med-majonnas" }, "lunch": { "name": "Grönsakswok med kyckling", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kyckling" }, "dinner": { "name": "Köttfärspytt med italienska smaker", "recipeLink": "/kunskapsbank/recept/kottfarspytt-med-italienska-smaker" }
      }, "Onsdag": { "breakfast": { "name": "Mango med keso och nötter", "recipeLink": "/kunskapsbank/recept/mango-med-keso-och-notter" }, "lunch": { "name": "Köttfärspytt med italienska smaker", "recipeLink": "/kunskapsbank/recept/kottfarspytt-med-italienska-smaker" }, "dinner": { "name": "Indisk laxgryta med röda linser", "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-med-roda-linser" }
      }, "Torsdag": { "breakfast": { "name": "Äggröra med granatäpple och kiwi", "recipeLink": "/kunskapsbank/recept/aggrora-med-granatapple-och-kiwi" }, "lunch": { "name": "Indisk laxgryta med röda linser", "recipeLink": "/kunskapsbank/recept/indisk-laxgryta-med-roda-linser" }, "dinner": { "name": "Quinoasallad med stekt halloumi", "recipeLink": "/kunskapsbank/recept/quinoasallad-med-stekt-halloumi" }
      }, "Fredag": { "breakfast": { "name": "Havregrynsgröt med apelsin och kokos", "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-apelsin-och-kokos" }, "lunch": { "name": "Quinoasallad med stekt halloumi", "recipeLink": "/kunskapsbank/recept/quinoasallad-med-stekt-halloumi" }, "dinner": { "name": "Torsk teriyaki med grönsaker", "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker" }
      }, "Lördag": { "breakfast": { "name": "Hallon- och blåbärssmoothie", "recipeLink": "/kunskapsbank/recept/smoothie-blabarssmoothie" }, "lunch": { "name": "Torsk teriyaki med grönsaker", "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker" }, "dinner": { "name": "Lammgryta med plommon och bulgur", "recipeLink": "/kunskapsbank/recept/lammgryta-med-plommon-och-bulgur" }
      }, "Söndag": { "breakfast": { "name": "Hallon- och blåbärssmoothie", "recipeLink": "/kunskapsbank/recept/smoothie-blabarssmoothie" }, "lunch": { "name": "Lammgryta med plommon och bulgur", "recipeLink": "/kunskapsbank/recept/lammgryta-med-plommon-och-bulgur" }, "dinner": { "name": "Kycklinggryta med bakad spetskål", "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal" }
      }
    }, "title": "Vecka 6" }
};

// Functional Gut Health/Flow meal plans
export const flowMealPlans: Record<string, WeekMealPlan> = { "week1": { "days": { "Måndag": { "breakfast": { "name": "Färskostmacka med tomat", "recipeLink": "/kunskapsbank/recept/farskostmacka-med-tomat" }, "lunch": { "name": "Linssoppa från medelhavet", "recipeLink": "/kunskapsbank/recept/linssoppa-fran-medelhavet" }, "dinner": { "name": "Kycklingburgare med papayasallad", "recipeLink": "/kunskapsbank/recept/kycklingburgare-med-papayasallad" }, "snack": { "name": "Morot- och kesolimpa", "recipeLink": "/kunskapsbank/recept/morot-och-kesolimpa" }
      }, "Tisdag": { "breakfast": { "name": "Äggröra med asiatisk avokadosallad", "recipeLink": "/kunskapsbank/recept/aggrora-med-asiatisk-avokadosallad" }, "lunch": { "name": "Kycklingburgare med papayasallad", "recipeLink": "/kunskapsbank/recept/kycklingburgare-med-papayasallad" }, "dinner": { "name": "Köttfärsbiffar med mozzarella och tomatsallad", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-mozzarella-och-tomatsallad" }
      }, "Onsdag": { "breakfast": { "name": "Choklad- och kokoschiapudding", "recipeLink": "/kunskapsbank/recept/choklad-och-kokoschiapudding" }, "lunch": { "name": "Köttfärsbiffar med mozzarella och tomatsallad", "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-mozzarella-och-tomatsallad" }, "dinner": { "name": "Laxgratäng med broccoli och scampi", "recipeLink": "/kunskapsbank/recept/laxgratang-med-broccoli-och-scampi" }, "snack": { "name": "Bovetegranola", "recipeLink": "/kunskapsbank/recept/bovetegranola" }
      }, "Torsdag": { "breakfast": { "name": "Keso med bovetegranola", "recipeLink": "/kunskapsbank/recept/keso-med-bovetegranola" }, "lunch": { "name": "Laxgratäng med broccoli och scampi", "recipeLink": "/kunskapsbank/recept/laxgratang-med-broccoli-och-scampi" }, "dinner": { "name": "Kycklinggryta från medelhavet", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }
      }, "Fredag": { "breakfast": { "name": "Omelett med ost och spenat", "recipeLink": "/kunskapsbank/recept/omelett-med-ost-och-spenat" }, "lunch": { "name": "Kycklinggryta från medelhavet", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }, "dinner": { "name": "Fänkålssallad med grapefrukt och burrata", "recipeLink": "/kunskapsbank/recept/fankalssallad-med-grapefrukt-och-burrata" }
      }, "Lördag": { "breakfast": { "name": "Ugnsomelett med keso och bär", "recipeLink": "/kunskapsbank/recept/ugnsomelett-med-keso-och-bar" }, "lunch": { "name": "Fänkålssallad med grapefrukt och burrata", "recipeLink": "/kunskapsbank/recept/fankalssallad-med-grapefrukt-och-burrata" }, "dinner": { "name": "Entrecote med haricots verts och bearnaisesås", "recipeLink": "/kunskapsbank/recept/entrecote-med-haricots-verts-och-bearnaisesas" }, "dessert": { "name": "Citronkaka med äpple och kardemumma", "recipeLink": "/kunskapsbank/recept/citronkaka-med-apple-och-kardemumma" }
      }, "Söndag": { "breakfast": { "name": "Ugnsomelett med keso och bär", "recipeLink": "/kunskapsbank/recept/ugnsomelett-med-keso-och-bar" }, "lunch": { "name": "Entrecote med haricots verts och bearnaisesås", "recipeLink": "/kunskapsbank/recept/entrecote-med-haricots-verts-och-bearnaisesas" }, "dinner": { "name": "Grönsakswok med tonfisk och ägg", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-tonfisk-och-agg" }
      }
    }, "title": "Vecka 1" }, "week2": { "days": { "Måndag": { "breakfast": { "name": "Macka med ost", "recipeLink": "/kunskapsbank/recept/macka-med-ost" }, "lunch": { "name": "Grönsakswok med tonfisk och ägg", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-tonfisk-och-agg" }, "dinner": { "name": "Lövbiffsgryta med champinjoner och grönsaksspagetti", "recipeLink": "/kunskapsbank/recept/lovbiffsgryta-med-champinjoner-och-gronsaksspagetti" }
      }, "Tisdag": { "breakfast": { "name": "Ägghack i salladsblad", "recipeLink": "/kunskapsbank/recept/agghack-i-salladsblad" }, "lunch": { "name": "Lövbiffsgryta med champinjoner och grönsaksspagetti", "recipeLink": "/kunskapsbank/recept/lovbiffsgryta-med-champinjoner-och-gronsaksspagetti" }, "dinner": { "name": "Lax med rödbetssallad", "recipeLink": "/kunskapsbank/recept/lax-med-rodbetssallad" }
      }, "Onsdag": { "breakfast": { "name": "Overnightoats med morot", "recipeLink": "/kunskapsbank/recept/overnightoats-med-morot" }, "lunch": { "name": "Lax med rödbetssallad", "recipeLink": "/kunskapsbank/recept/lax-med-rodbetssallad" }, "dinner": { "name": "Kycklingpizza", "recipeLink": "/kunskapsbank/recept/kycklingpizza" }
      }, "Torsdag": { "breakfast": { "name": "Yoghurt med bovetegranola och frukt", "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola-och-frukt" }, "lunch": { "name": "Kycklingpizza", "recipeLink": "/kunskapsbank/recept/kycklingpizza" }, "dinner": { "name": "Spenatsoppa med rostade pumpafrön", "recipeLink": "/kunskapsbank/recept/spenatsoppa-med-rostade-pumpafron" }
      }, "Fredag": { "breakfast": { "name": "Stekt ägg med champinjoner", "recipeLink": "/kunskapsbank/recept/stekt-agg-med-champinjoner" }, "lunch": { "name": "Spenatsoppa med rostade pumpafrön", "recipeLink": "/kunskapsbank/recept/spenatsoppa-med-rostade-pumpafron" }, "dinner": { "name": "Fisktaco med mangosalsa och sesamsås", "recipeLink": "/kunskapsbank/recept/fisktaco-med-mangosalsa-och-sesamsas" }
      }, "Lördag": { "breakfast": { "name": "Smoothiebowl med mango och pistagenötter", "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-mango-och-pistagenotter" }, "lunch": { "name": "Fisktaco med mangosalsa och sesamsås", "recipeLink": "/kunskapsbank/recept/fisktaco-med-mangosalsa-och-sesamsas" }, "dinner": { "name": "Ajvarspett med grekisk sallad och tzatziki", "recipeLink": "/kunskapsbank/recept/ajvarspett-med-grekisk-sallad-och-tzatziki" }, "dessert": { "name": "Zucchinikaka med kardemumma", "recipeLink": "/kunskapsbank/recept/zucchinikaka-med-kardemumma" }
      }, "Söndag": { "breakfast": { "name": "Grön juice", "recipeLink": "/kunskapsbank/recept/gron-juice" }, "lunch": { "name": "Ajvarspett med grekisk sallad och tzatziki", "recipeLink": "/kunskapsbank/recept/ajvarspett-med-grekisk-sallad-och-tzatziki" }, "dinner": { "name": "Kycklinggryta från medelhavet", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }
      }
    }, "title": "Vecka 2" }, "week3": { "days": { "Måndag": { "breakfast": { "name": "Grön juice", "recipeLink": "/kunskapsbank/recept/gron-juice" }, "lunch": { "name": "Kycklinggryta från medelhavet", "recipeLink": "/kunskapsbank/recept/kycklinggryta-fran-medelhavet" }, "dinner": { "name": "Färgstark fetaostsallad", "recipeLink": "/kunskapsbank/recept/fargstark-fetaostsallad" }, "snack": { "name": "Bananmuffins med mandel och kanel", "recipeLink": "/kunskapsbank/recept/bananmuffin" }
      }, "Tisdag": { "breakfast": { "name": "Bananmuffin", "recipeLink": "/kunskapsbank/recept/bananmuffin" }, "lunch": { "name": "Färgstark fetaostsallad", "recipeLink": "/kunskapsbank/recept/fargstark-fetaostsallad" }, "dinner": { "name": "Nötfärstimbaler med chèvreost och soltorkad tomat", "recipeLink": "/kunskapsbank/recept/notfarstimbaler-med-chevreost-och-soltorkad-tomat" }
      }, "Onsdag": { "breakfast": { "name": "Kokta ägg med kaviar", "recipeLink": "/kunskapsbank/recept/kokta-agg-med-kaviar" }, "lunch": { "name": "Nötfärstimbaler med chèvreost och soltorkad tomat", "recipeLink": "/kunskapsbank/recept/notfarstimbaler-med-chevreost-och-soltorkad-tomat" }, "dinner": { "name": "Laxsallad med fetaost", "recipeLink": "/kunskapsbank/recept/laxsallad-med-fetaost" }
      }, "Torsdag": { "breakfast": { "name": "Keso med bovetegranola och frukt", "recipeLink": "/kunskapsbank/recept/keso-med-bovetegranola-och-frukt" }, "lunch": { "name": "Laxsallad med fetaost", "recipeLink": "/kunskapsbank/recept/laxsallad-med-fetaost" }, "dinner": { "name": "Spenatsoppa med rostade pumpafrön", "recipeLink": "/kunskapsbank/recept/spenatsoppa-med-rostade-pumpafron" }
      }, "Fredag": { "breakfast": { "name": "Chiapudding med jordgubbar och hallon", "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbar-och-hallon" }, "lunch": { "name": "Kycklingpizza", "recipeLink": "/kunskapsbank/recept/kycklingpizza" }, "dinner": { "name": "Torsk med guacamole och sötpotatis", "recipeLink": "/kunskapsbank/recept/torsk-med-guacamole-och-sotpotatis" }
      }, "Lördag": { "breakfast": { "name": "Chiapudding med jordgubbar och hallon", "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbar-och-hallon" }, "lunch": { "name": "Torsk med guacamole och sötpotatis", "recipeLink": "/kunskapsbank/recept/torsk-med-guacamole-och-sotpotatis" }, "dinner": { "name": "Biff med nudelsallad och jordnötssås", "recipeLink": "/kunskapsbank/recept/biff-med-nudelsallad-och-jordnotssas" }, "dessert": { "name": "Chokladbars med majskakor", "recipeLink": "/kunskapsbank/recept/chokladbars-med-majskakor" }
      }, "Söndag": { "breakfast": { "name": "Omelettrulle", "recipeLink": "/kunskapsbank/recept/omelettrulle" }, "lunch": { "name": "Biff med nudelsallad och jordnötssås", "recipeLink": "/kunskapsbank/recept/biff-med-nudelsallad-och-jordnotssas" }, "dinner": { "name": "Morotssoppa med ingefära och rostade kikärtor", "recipeLink": "/kunskapsbank/recept/morotssoppa-med-ingefara-och-rostade-kikartor" }
      }
    }, "title": "Vecka 3" }, "week4": { "days": { "Måndag": { "breakfast": { "name": "Omelettrulle", "recipeLink": "/kunskapsbank/recept/omelettrulle" }, "lunch": { "name": "Morotssoppa med ingefära och rostade kikärtor", "recipeLink": "/kunskapsbank/recept/morotssoppa-med-ingefara-och-rostade-kikartor" }, "dinner": { "name": "Grönsakswok med kycklingfärs", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kycklingfars" }
      }, "Tisdag": { "breakfast": { "name": "Yoghurt med bovetegranola", "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola" }, "lunch": { "name": "Grönsakswok med kycklingfärs", "recipeLink": "/kunskapsbank/recept/gronsakswok-med-kycklingfars" }, "dinner": { "name": "Ugnsbakad blomkål med ratatouille", "recipeLink": "/kunskapsbank/recept/ugnsbakad-blomkal-med-ratatouille" }
      }, "Onsdag": { "breakfast": { "name": "Macka med ost", "recipeLink": "/kunskapsbank/recept/macka-med-ost" }, "lunch": { "name": "Ugnsbakad blomkål med ratatouille", "recipeLink": "/kunskapsbank/recept/ugnsbakad-blomkal-med-ratatouille" }, "dinner": { "name": "Lövbiffsrullader med brie, pesto och rödbetor", "recipeLink": "/kunskapsbank/recept/lovbiffsrullader-med-brie-pesto-och-rodbetor" }
      }, "Torsdag": { "breakfast": { "name": "Äggröra med fetaost och spenat", "recipeLink": "/kunskapsbank/recept/aggrora-med-fetaost-och-spenat" }, "lunch": { "name": "Lövbiffsrullader med brie, pesto och rödbetor", "recipeLink": "/kunskapsbank/recept/lovbiffsrullader-med-brie-pesto-och-rodbetor" }, "dinner": { "name": "Torsk med saffranssås", "recipeLink": "/kunskapsbank/recept/torsk-med-saffranssas" }
      }, "Fredag": { "breakfast": { "name": "Bananmuffin", "recipeLink": "/kunskapsbank/recept/bananmuffin" }, "lunch": { "name": "Torsk med saffranssås", "recipeLink": "/kunskapsbank/recept/torsk-med-saffranssas" }, "dinner": { "name": "Kycklingrullader med gorgonzola", "recipeLink": "/kunskapsbank/recept/kycklingrullader-med-gorgonzola" }
      }, "Lördag": { "breakfast": { "name": "Omelett med keso och bär", "recipeLink": "/kunskapsbank/recept/omelett-med-keso-och-bar" }, "lunch": { "name": "Kycklingrullader med gorgonzola", "recipeLink": "/kunskapsbank/recept/kycklingrullader-med-gorgonzola" }, "dinner": { "name": "Valnötslax med fetaostcreme", "recipeLink": "/kunskapsbank/recept/valnotslax-med-fetaostcreme" }, "dessert": { "name": "Stekta äpplen med vit chokladkräm", "recipeLink": "/kunskapsbank/recept/stekta-applen-med-vit-chokladkram" }
      }, "Söndag": { "breakfast": { "name": "Blåbärssmoothie", "recipeLink": "/kunskapsbank/recept/blabarssmoothie" }, "lunch": { "name": "Valnötslax med fetaostcreme", "recipeLink": "/kunskapsbank/recept/valnotslax-med-fetaostcreme" }, "dinner": { "name": "Zucchiniplättar med yoghurtsås", "recipeLink": "/kunskapsbank/recept/zucchiniplattar-med-yoghurtsas" }
      }
    }, "title": "Vecka 4" }, "week5": { "days": { "Måndag": { "breakfast": { "name": "Blåbärssmoothie", "recipeLink": "/kunskapsbank/recept/blabarssmoothie" }, "lunch": { "name": "Zucchiniplättar med yoghurtsås", "recipeLink": "/kunskapsbank/recept/zucchiniplattar-med-yoghurtsas" }, "dinner": { "name": "Köttfärslimpa med tomat", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-tomat" }
      }, "Tisdag": { "breakfast": { "name": "Macka med ost", "recipeLink": "/kunskapsbank/recept/macka-med-ost" }, "lunch": { "name": "Köttfärslimpa med tomat", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-tomat" }, "dinner": { "name": "Linssoppa från medelhavet", "recipeLink": "/kunskapsbank/recept/linssoppa-fran-medelhavet" }
      }, "Onsdag": { "breakfast": { "name": "Yoghurt med mango och apelsin", "recipeLink": "/kunskapsbank/recept/yoghurt-med-mango-och-apelsin" }, "lunch": { "name": "Ugnsbakad blomkål med ratatouille", "recipeLink": "/kunskapsbank/recept/ugnsbakad-blomkal-med-ratatouille" }, "dinner": { "name": "Pestotorsk med capresesallad", "recipeLink": "/kunskapsbank/recept/pestotorsk-med-capresesallad" }
      }, "Torsdag": { "breakfast": { "name": "Stekt ägg med parmaskinka", "recipeLink": "/kunskapsbank/recept/stekt-agg-med-parmaskinka" }, "lunch": { "name": "Pestotorsk med capresesallad", "recipeLink": "/kunskapsbank/recept/pestotorsk-med-capresesallad" }, "dinner": { "name": "Kyckling med stekt blomkålsris och dillyoghurt", "recipeLink": "/kunskapsbank/recept/kyckling-med-stekt-blomkalsris-och-dillyoghurt" }
      }, "Fredag": { "breakfast": { "name": "Bananmuffin", "recipeLink": "/kunskapsbank/recept/bananmuffin" }, "lunch": { "name": "Kyckling med stekt blomkålsris och dillyoghurt", "recipeLink": "/kunskapsbank/recept/kyckling-med-stekt-blomkalsris-och-dillyoghurt" }, "dinner": { "name": "Nötgryta med rotfrukter", "recipeLink": "/kunskapsbank/recept/notgryta-med-rotfrukter" }
      }, "Lördag": { "breakfast": { "name": "Äggröra med champinjoner", "recipeLink": "/kunskapsbank/recept/aggrora-med-champinjoner" }, "lunch": { "name": "Nötgryta med rotfrukter", "recipeLink": "/kunskapsbank/recept/notgryta-med-rotfrukter" }, "dinner": { "name": "Quinoasallad med scampi och mango", "recipeLink": "/kunskapsbank/recept/quinoasallad-med-scampi-och-mango" }, "dessert": { "name": "Gino", "recipeLink": "/kunskapsbank/recept/gino" }
      }, "Söndag": { "breakfast": { "name": "Bananpannkaka", "recipeLink": "/kunskapsbank/recept/bananpannkaka" }, "lunch": { "name": "Quinoasallad med scampi och mango", "recipeLink": "/kunskapsbank/recept/quinoasallad-med-scampi-och-mango" }, "dinner": { "name": "Grönkålspaj med champinjoner", "recipeLink": "/kunskapsbank/recept/gronkalspaj-med-champinjoner" }
      }
    }, "title": "Vecka 5" }, "week6": { "days": { "Måndag": { "breakfast": { "name": "Bananpannkaka", "recipeLink": "/kunskapsbank/recept/bananpannkaka" }, "lunch": { "name": "Grönkålspaj med champinjoner", "recipeLink": "/kunskapsbank/recept/gronkalspaj-med-champinjoner" }, "dinner": { "name": "Köttfärslimpa med tomat", "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-tomat" }
      }, "Tisdag": { "breakfast": { "name": "Kokta ägg med kaviar", "recipeLink": "/kunskapsbank/recept/kokta-agg-med-kaviar" }, "lunch": { "name": "Nötgryta med rotfrukter", "recipeLink": "/kunskapsbank/recept/notgryta-med-rotfrukter" }, "dinner": { "name": "Stek torsk med bearnaisesås och haricot verts", "recipeLink": "/kunskapsbank/recept/stek-torsk-med-bearnaisesas-och-haricot-verts" }
      }, "Onsdag": { "breakfast": { "name": "Yoghurt med bovetegranola och bär", "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola-och-bar" }, "lunch": { "name": "Stek torsk med bearnaisesås och haricot verts", "recipeLink": "/kunskapsbank/recept/stek-torsk-med-bearnaisesas-och-haricot-verts" }, "dinner": { "name": "Kycklingfärsbiffar med vitlöksost", "recipeLink": "/kunskapsbank/recept/kycklingfarsbiffar-med-vitloksost" }
      }, "Torsdag": { "breakfast": { "name": "Varm chiagröt med äpple", "recipeLink": "/kunskapsbank/recept/varm-chiagrot-med-apple" }, "lunch": { "name": "Kycklingfärsbiffar med vitlöksost", "recipeLink": "/kunskapsbank/recept/kycklingfarsbiffar-med-vitloksost" }, "dinner": { "name": "Varma grönsaker med halloumi", "recipeLink": "/kunskapsbank/recept/varma-gronsaker-med-halloumi" }
      }, "Fredag": { "breakfast": { "name": "Ägghack med kallrökt lax", "recipeLink": "/kunskapsbank/recept/agghack-med-kallrokt-lax" }, "lunch": { "name": "Varma grönsaker med halloumi", "recipeLink": "/kunskapsbank/recept/varma-gronsaker-med-halloumi" }, "dinner": { "name": "Lax med quinoasallad och grapefrukt", "recipeLink": "/kunskapsbank/recept/lax-med-quinoasallad-och-grapefrukt" }
      }, "Lördag": { "breakfast": { "name": "Smoothiebowl med blåbär och granola", "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-blabar-och-granola" }, "lunch": { "name": "Lax med quinoasallad och grapefrukt", "recipeLink": "/kunskapsbank/recept/lax-med-quinoasallad-och-grapefrukt" }, "dinner": { "name": "Hamburgare med grekisk sallad", "recipeLink": "/kunskapsbank/recept/hamburgare-med-grekisk-sallad" }, "dessert": { "name": "Mandelkaka med choklad", "recipeLink": "/kunskapsbank/recept/mandelkaka-med-med-choklad" }
      }, "Söndag": { "breakfast": { "name": "Smoothiebowl med blåbär och granola", "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-blabar-och-granola" }, "lunch": { "name": "Hamburgare med grekisk sallad", "recipeLink": "/kunskapsbank/recept/hamburgare-med-grekisk-sallad" }, "dinner": { "name": "Asiatisk kycklingfärs med grönkål", "recipeLink": "/kunskapsbank/recept/asiatisk-kycklingfars-med-gronkal" }
      }
    }, "title": "Vecka 6" }
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
    "title": "Vecka 1",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med apelsin- och bovetegranola",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-apelsin-och-bovetegranola"
        },
        "lunch": {
          "name": "Omelett med paprika och champinjoner",
          "recipeLink": "/kunskapsbank/recept/omelett-med-paprika-och-champinjoner"
        },
        "dinner": {
          "name": "Kycklingburgare med mangosalsa och wasabi",
          "recipeLink": "/kunskapsbank/recept/kycklingburgare-med-mangosalsa-och-wasabi"
        },
        "snack": {
          "name": "Bovetegranola med apelsin och kardemumma",
          "recipeLink": "/kunskapsbank/recept/bovetegranola-med-apelsin-och-kardemumma"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Stekt ägg med tomat",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-med-tomat"
        },
        "lunch": {
          "name": "Kycklingburgare med mangosalsa och wasabi",
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
          "name": "Tonfiskröra med rödbetor",
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
          "name": "Köttfärswrap med röd curry och äpple",
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
          "name": "Apelsinkyckling med blomkålsris",
          "recipeLink": "/kunskapsbank/recept/apelsinkyckling-med-blomkalsris"
        },
        "dinner": {
          "name": "Fisk och skaldjursgryta från medelhavet",
          "recipeLink": "/kunskapsbank/recept/fisk-och-skaldjursgryta-fran-medelhavet"
        },
        "snack": {
          "name": "Kesofrallor med äpple och pumpafrön",
          "recipeLink": "/kunskapsbank/recept/kesofrallor-med-apple-och-pumpafron"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Kesofralla med skinka och tomat",
          "recipeLink": "/kunskapsbank/recept/kesofralla-med-skinka-och-tomat"
        },
        "lunch": {
          "name": "Fisk och skaldjursgryta från medelhavet",
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
          "name": "Biff med sötpotatis",
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
          "name": "Frukost: Jordgubbssylt",
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
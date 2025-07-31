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

// Functional Basics meal plans (existing)
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
          "recipeLink": "/kunskapsbank/recept/squashspagetti-med-kottfarssas"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Stekt ägg med lax",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-med-lax"
        },
        "lunch": {
          "name": "Squashspagetti med köttfärssås (Rester)"
        },
        "dinner": {
          "name": "Het ratatouille",
          "recipeLink": "/kunskapsbank/recept/het-ratatouille"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Grön smoothie",
          "recipeLink": "/kunskapsbank/recept/gron-smoothie"
        },
        "lunch": {
          "name": "Poké bowl med kyckling",
          "recipeLink": "/kunskapsbank/recept/pok-bowl-med-kyckling"
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
          "name": "Het ratatouille (Rester)"
        },
        "dinner": {
          "name": "Poké bowl med kyckling (Rester)"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Havrefrallor med morötter och aprikoser",
          "recipeLink": "/kunskapsbank/recept/havrefrallor-med-morotter-och-aprikoser"
        },
        "lunch": {
          "name": "Köttfärsbiffar med stekt blomkål (Rester)"
        },
        "dinner": {
          "name": "Kycklinggryta med bakad spetskål",
          "recipeLink": "/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/tropisk-smoothiebowl"
        },
        "lunch": {
          "name": "Kycklinggryta med bakad spetskål (Rester)"
        },
        "dinner": {
          "name": "Laxburgare med krämig grönsaksröra",
          "recipeLink": "/kunskapsbank/recept/laxburgare-med-kramig-gronsaksrora"
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
    "title": "Vecka 2: Antiinflammatoriska livsmedel",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad",
          "recipeLink": "/kunskapsbank/recept/keso-med-granola-och-fruktsallad"
        },
        "lunch": {
          "name": "Ugnsbakad tomat med köttfärs (Rester)"
        },
        "dinner": {
          "name": "Lax med waldorfsallad",
          "recipeLink": "/kunskapsbank/recept/lax-med-waldorfsallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Morotsjuice",
          "recipeLink": "/kunskapsbank/recept/morotsjuice"
        },
        "lunch": {
          "name": "Lax med waldorfsallad (Rester)"
        },
        "dinner": {
          "name": "Asiatiska köttbullar med nudelsallad",
          "recipeLink": "/kunskapsbank/recept/asiatiska-kottbullar-med-nudelsallad"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Hallon- och blåbärssmoothie",
          "recipeLink": "/kunskapsbank/recept/hallon-och-blabarssmoothie"
        },
        "lunch": {
          "name": "Asiatiska köttbullar med nudelsallad (Rester)"
        },
        "dinner": {
          "name": "Torsk teriyaki med grönsaker",
          "recipeLink": "/kunskapsbank/recept/torsk-teriyaki-med-gronsaker"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Morotsjuice",
          "recipeLink": "/kunskapsbank/recept/morotsjuice"
        },
        "lunch": {
          "name": "Torsk teriyaki med grönsaker (Rester)"
        },
        "dinner": {
          "name": "Kyckling i curry med kokosmjölk",
          "recipeLink": "/kunskapsbank/recept/kyckling-i-curry-med-kokosmjolk"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Blåbärs smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-blabar-och-granola"
        },
        "lunch": {
          "name": "Kyckling i curry med kokosmjölk (Rester)"
        },
        "dinner": {
          "name": "Havrefrallor med morötter och aprikoser",
          "recipeLink": "/kunskapsbank/recept/havrefrallor-med-morotter-och-aprikoser"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Bärmoothiebowl",
          "recipeLink": "/kunskapsbank/recept/barmoothiebowl"
        },
        "lunch": {
          "name": "Havrefrallor med morötter och aprikoser (Rester)"
        },
        "dinner": {
          "name": "Japansk kycklingfärswok med groddar",
          "recipeLink": "/kunskapsbank/recept/japansk-kycklingfarswok-med-groddar-1"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Päronmüsli med mandlar",
          "recipeLink": "/kunskapsbank/recept/paronmusli-med-mandlar"
        },
        "lunch": {
          "name": "Japansk kycklingfärswok med groddar (Rester)"
        },
        "dinner": {
          "name": "Pärons allad med chèvreost",
          "recipeLink": "/kunskapsbank/recept/paronsallad-med-chevreost"
        }
      }
    }
  },
  "week3": {
    "title": "Vecka 3: Flexibilitet & Fasta",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Rödbetsjuice",
          "recipeLink": "/kunskapsbank/recept/rodbetsjuice"
        },
        "lunch": {
          "name": "Pärons allad med chèvreost (Rester)"
        },
        "dinner": {
          "name": "Äggröra med rökt lax",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-lax"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Rödbetsjuice",
          "recipeLink": "/kunskapsbank/recept/rodbetsjuice"
        },
        "lunch": {
          "name": "Äggröra med rökt lax (Rester)"
        },
        "dinner": {
          "name": "Högrevsburgare med hummus",
          "recipeLink": "/kunskapsbank/recept/hogrevsburgare-med-hummus"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Bärmoothiebowl",
          "recipeLink": "/kunskapsbank/recept/barmoothiebowl"
        },
        "lunch": {
          "name": "Hamburgare med hummus (Rester)"
        },
        "dinner": {
          "name": "Kött i mustig tomatsås",
          "recipeLink": "/kunskapsbank/recept/kott-i-mustig-tomatsas"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Havregrynsgröt med valnötter och bär",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-torkad-frukt-och-apple"
        },
        "lunch": {
          "name": "Kött i mustig tomatsås (Rester)"
        },
        "dinner": {
          "name": "Högrevsburgare med hummus",
          "recipeLink": "/kunskapsbank/recept/hogrevsburgare-med-hummus"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad",
          "recipeLink": "/kunskapsbank/recept/keso-med-granola-och-fruktsallad"
        },
        "lunch": {
          "name": "Hamburgare med hummus (Rester)"
        },
        "dinner": {
          "name": "Nudelsoppa med grönsaker",
          "recipeLink": "/kunskapsbank/recept/nudelsoppa-med-gronsaker"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/tropisk-smoothiebowl"
        },
        "lunch": {
          "name": "Nudelsoppa med grönsaker (Rester)"
        },
        "dinner": {
          "name": "Linssoppa med curry och spiskummin",
          "recipeLink": "/kunskapsbank/recept/linssoppa-med-curry-och-spiskummin"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Havregrynsgröt med valnötter och bär",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-torkad-frukt-och-apple"
        },
        "lunch": {
          "name": "Linssoppa med curry och spiskummin (Rester)"
        },
        "dinner": {
          "name": "Nötgryta med sötpotatis",
          "recipeLink": "/kunskapsbank/recept/notgryta-med-sotpotatis"
        }
      }
    }
  },
  "week4": {
    "title": "Vecka 4: Hormoner & metabolism",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/tropisk-smoothiebowl"
        },
        "lunch": {
          "name": "Nötgryta med sötpotatis (Rester)"
        },
        "dinner": {
          "name": "Ugnsbakad kyckling med tzatziki och sallad",
          "recipeLink": "/kunskapsbank/recept/ugnsbakad-kyckling-med-tzatziki-och-sallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Bärmoothiebowl",
          "recipeLink": "/kunskapsbank/recept/barmoothiebowl"
        },
        "lunch": {
          "name": "Ugnsbakad kyckling med tzatziki och sallad (Rester)"
        },
        "dinner": {
          "name": "Äggröra med paprika",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-paprika"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Havregrynsgröt med valnötter och bär",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-torkad-frukt-och-apple"
        },
        "lunch": {
          "name": "Äggröra med paprika (Rester)"
        },
        "dinner": {
          "name": "Glasnudelsallad med grönsaker",
          "recipeLink": "/kunskapsbank/recept/glasnudelsallad-med-gronsaker"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad",
          "recipeLink": "/kunskapsbank/recept/keso-med-granola-och-fruktsallad"
        },
        "lunch": {
          "name": "Glasnudelsallad med grönsaker (Rester)"
        },
        "dinner": {
          "name": "Köttfärslimpa med ajvar och rostad sötpotatis",
          "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-ajvar-och-rostad-sotpotatis"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/tropisk-smoothiebowl"
        },
        "lunch": {
          "name": "Köttfärslimpa med ajvar och rostad sötpotatis (Rester)"
        },
        "dinner": {
          "name": "Halloumiburgare med rödbetor",
          "recipeLink": "/kunskapsbank/recept/halloumiburgare-med-rodbetor"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Köttfärslimpa med ajvar och rostad sötpotatis",
          "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-ajvar-och-rostad-sotpotatis"
        },
        "lunch": {
          "name": "Köttfärslimpa med ajvar och rostad sötpotatis (Rester)"
        },
        "dinner": {
          "name": "Halloumiburgare med rödbetor (Rester)"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Bärmoothiebowl",
          "recipeLink": "/kunskapsbank/recept/barmoothiebowl"
        },
        "lunch": {
          "name": "Halloumiburgare med rödbetor"
        },
        "dinner": {
          "name": "Wokad lövbiff med nudlar",
          "recipeLink": "/kunskapsbank/recept/wokad-lovbiff-med-nudlar"
        }
      }
    }
  },
  "week5": {
    "title": "Vecka 5: Integrering & Balans",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Havregrynsgröt med valnötter och bär",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-torkad-frukt-och-apple"
        },
        "lunch": {
          "name": "Wokad lövbiff med nudlar (Rester)"
        },
        "dinner": {
          "name": "Äggröra med granatäpple och kiwi",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-granatapple-och-kiwi"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad",
          "recipeLink": "/kunskapsbank/recept/keso-med-granola-och-fruktsallad"
        },
        "lunch": {
          "name": "Äggröra med granatäpple och kiwi (Rester)"
        },
        "dinner": {
          "name": "Lammgryta med plommon och bulgur",
          "recipeLink": "/kunskapsbank/recept/lammgryta-med-plommon-och-bulgur"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/tropisk-smoothiebowl"
        },
        "lunch": {
          "name": "Lammgryta med plommon och bulgur (Rester)"
        },
        "dinner": {
          "name": "Rotfruktssoppa",
          "recipeLink": "/kunskapsbank/recept/rotfruktssoppa"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Bärmoothiebowl",
          "recipeLink": "/kunskapsbank/recept/barmoothiebowl"
        },
        "lunch": {
          "name": "Rotfruktssoppa (Rester)"
        },
        "dinner": {
          "name": "Lammgryta med plommon och bulgur (Rester)"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Havregrynsgröt med valnötter och bär",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-torkad-frukt-och-apple"
        },
        "lunch": {
          "name": "Lammgryta med plommon och bulgur (Rester)"
        },
        "dinner": {
          "name": "Köttfärssås med konjaksnudlar",
          "recipeLink": "/kunskapsbank/recept/kottfarssas-med-konjaksnudlar"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad",
          "recipeLink": "/kunskapsbank/recept/keso-med-granola-och-fruktsallad"
        },
        "lunch": {
          "name": "Köttfärssås med konjaksnudlar (Rester)"
        },
        "dinner": {
          "name": "Äggröra med asiatisk avokadosallad",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-asiatisk-avokadosallad"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/tropisk-smoothiebowl"
        },
        "lunch": {
          "name": "Äggröra med asiatisk avokadosallad (Rester)"
        },
        "dinner": {
          "name": "Asiatisk tonfisksallad",
          "recipeLink": "/kunskapsbank/recept/asiatisk-tonfisksallad"
        }
      }
    }
  },
  "week6": {
    "title": "Vecka 6: Framtid & Hållbarhet",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Havregrynsgröt med valnötter och bär",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-torkad-frukt-och-apple"
        },
        "lunch": {
          "name": "Asiatisk tonfisksallad (Rester)"
        },
        "dinner": {
          "name": "Kycklingburgare med papayasallad",
          "recipeLink": "/kunskapsbank/recept/kycklingburgare-med-papayasallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad",
          "recipeLink": "/kunskapsbank/recept/keso-med-granola-och-fruktsallad"
        },
        "lunch": {
          "name": "Kycklingburgare med papayasallad (Rester)"
        },
        "dinner": {
          "name": "Squashspagetti med grönsakssås",
          "recipeLink": "/kunskapsbank/recept/squashspagetti-med-gronsakssos"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/tropisk-smoothiebowl"
        },
        "lunch": {
          "name": "Squashspagetti med grönsakssås (Rester)"
        },
        "dinner": {
          "name": "Morot- och kesolimpa",
          "recipeLink": "/kunskapsbank/recept/morot-och-kesolimpa"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Bärmoothiebowl",
          "recipeLink": "/kunskapsbank/recept/barmoothiebowl"
        },
        "lunch": {
          "name": "Morot- och kesolimpa (Rester)"
        },
        "dinner": {
          "name": "Grillade köttspett med grekisk sallad",
          "recipeLink": "/kunskapsbank/recept/grillade-kottspett-med-grekisk-sallad"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Havregrynsgröt med valnötter och bär",
          "recipeLink": "/kunskapsbank/recept/havregrynsgrot-med-torkad-frukt-och-apple"
        },
        "lunch": {
          "name": "Grillade köttspett med grekisk sallad (Rester)"
        },
        "dinner": {
          "name": "Laxburgare med krämig grönsaksröra",
          "recipeLink": "/kunskapsbank/recept/laxburgare-med-kramig-gronsaksrora"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad",
          "recipeLink": "/kunskapsbank/recept/keso-med-granola-och-fruktsallad"
        },
        "lunch": {
          "name": "Laxburgare med krämig grönsaksröra (Rester)"
        },
        "dinner": {
          "name": "Morotssoppa med ingefära och rostade kikärtor",
          "recipeLink": "/kunskapsbank/recept/morotssoppa-med-ingefara-och-rostade-kikartor"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/tropisk-smoothiebowl"
        },
        "lunch": {
          "name": "Morotssoppa med ingefära och rostade kikärtor (Rester)"
        },
        "dinner": {
          "name": "Lammgryta med plommon och bulgur",
          "recipeLink": "/kunskapsbank/recept/lammgryta-med-plommon-och-bulgur"
        }
      }
    }
  }
};

// Functional Flow meal plans
export const flowMealPlans: Record<string, WeekMealPlan> = {
  "week1": {
    "title": "Vecka 1: Introduktion till Flow",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Omelett med keso och bär",
          "recipeLink": "/kunskapsbank/recept/omelett-med-keso-och-bar"
        },
        "lunch": {
          "name": "Kött och hemmagjord hummus",
          "recipeLink": "/kunskapsbank/recept/kott-och-hemmagjord-hummus"
        },
        "dinner": {
          "name": "Köttfärsbiffar med tomatsallad",
          "recipeLink": "/kunskapsbank/recept/kottfarsbiffar-med-tomatsallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Äggröra med fetaost och spenat",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-fetaost-och-spenat"
        },
        "lunch": {
          "name": "Köttfärsbiffar med tomatsallad (Rester)"
        },
        "dinner": {
          "name": "Entrecote med haricot verts och bearnaisesås",
          "recipeLink": "/kunskapsbank/recept/entrecote-med-haricots-verts-och-bearnaisesas"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Stekt ägg med champinjoner",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-champinjoner"
        },
        "lunch": {
          "name": "Entrecote med haricot verts och bearnaisesås (Rester)"
        },
        "dinner": {
          "name": "Lax med rödbetssallad",
          "recipeLink": "/kunskapsbank/recept/lax-med-rodbetssallad"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola-och-frukt"
        },
        "lunch": {
          "name": "Lax med rödbetssallad (Rester)"
        },
        "dinner": {
          "name": "Torrfisk med sötpotatis och spenat",
          "recipeLink": "/kunskapsbank/recept/torrfisk-med-sotpotatis-och-spenat"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Overnight oats med morot",
          "recipeLink": "/kunskapsbank/recept/morotssoppa-med-ingefara-och-rostade-kikartor"
        },
        "lunch": {
          "name": "Torrfisk med sötpotatis och spenat (Rester)"
        },
        "dinner": {
          "name": "Kycklingburgare med papayasallad",
          "recipeLink": "/kunskapsbank/recept/kycklingburgare-med-papayasallad"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Overnight oats med morot (Rester)"
        },
        "lunch": {
          "name": "Kycklingburgare med papayasallad (Rester)"
        },
        "dinner": {
          "name": "Torsk med saffranssås",
          "recipeLink": "/kunskapsbank/recept/torsk-med-saffranssos"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Keso med bovetegranola och frukt",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola-och-frukt"
        },
        "lunch": {
          "name": "Torsk med saffranssås (Rester)"
        },
        "dinner": {
          "name": "Bananpannkaka",
          "recipeLink": "/kunskapsbank/recept/bananpannkaka"
        }
      }
    }
  },
  "week2": {
    "title": "Vecka 2: Fördjupning i Flow",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Chiapudding med jordgubbar och hallon",
          "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbar-och-hallon"
        },
        "lunch": {
          "name": "Bananpannkaka (Rester)"
        },
        "dinner": {
          "name": "Äggröra med asiatisk avokadosallad",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-asiatisk-avokadosallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Blåbärssmoothie",
          "recipeLink": "/kunskapsbank/recept/blabarssmoothie"
        },
        "lunch": {
          "name": "Äggröra med asiatisk avokadosallad (Rester)"
        },
        "dinner": {
          "name": "Nötfärstimbaler med chévreost och soltorkad tomat",
          "recipeLink": "/kunskapsbank/recept/notfarstimbaler-med-chevreost-och-soltorkad-tomat"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Äggröra med champinjoner",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-champinjoner"
        },
        "lunch": {
          "name": "Nötfärstimbaler med chévreost och soltorkad tomat (Rester)"
        },
        "dinner": {
          "name": "Chokladbar med majskakor",
          "recipeLink": "/kunskapsbank/recept/chokladbars-med-majskakor"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Varm chiagröt med äpple",
          "recipeLink": "/kunskapsbank/recept/varm-chiagrot-med-apple"
        },
        "lunch": {
          "name": "Chokladbar med majskakor (Rester)"
        },
        "dinner": {
          "name": "Rökt lax med blomkålsallad och citronyoghurt",
          "recipeLink": "/kunskapsbank/recept/rokt-lax-med-blomkalsallad-och-citronyoghurt"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Smoothiebowl med blåbär och granola",
          "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-blabar-och-granola"
        },
        "lunch": {
          "name": "Rökt lax med blomkålsallad och citronyoghurt (Rester)"
        },
        "dinner": {
          "name": "Choklad- och kokoschiapudding",
          "recipeLink": "/kunskapsbank/recept/choklad-och-kokoschiapudding"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Bovetegranola",
          "recipeLink": "/kunskapsbank/recept/bovetegranola"
        },
        "lunch": {
          "name": "Choklad- och kokoschiapudding (Rester)"
        },
        "dinner": {
          "name": "Morotssoppa med ingefära och rostade kikärtor",
          "recipeLink": "/kunskapsbank/recept/morotssoppa-med-ingefara-och-rostade-kikartor"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Bovetegranola (Rester)"
        },
        "lunch": {
          "name": "Morotssoppa med ingefära och rostade kikärtor (Rester)"
        },
        "dinner": {
          "name": "Äggröra med fetaost och spenat",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-fetaost-och-spenat"
        }
      }
    }
  },
  "week3": {
    "title": "Vecka 3: Optimering av Flow",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Bananmuffin",
          "recipeLink": "/kunskapsbank/recept/bananmuffin"
        },
        "lunch": {
          "name": "Äggröra med fetaost och spenat (Rester)"
        },
        "dinner": {
          "name": "Torrfisk med sötpotatis",
          "recipeLink": "/kunskapsbank/recept/torrfisk-med-sotpotatis"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Omelett med avokado",
          "recipeLink": "/kunskapsbank/recept/omelett-med-avokado"
        },
        "lunch": {
          "name": "Torrfisk med sötpotatis (Rester)"
        },
        "dinner": {
          "name": "Lövbiffsrullader med brie, pesto och rödbetor",
          "recipeLink": "/kunskapsbank/recept/lovbiffsrullader-med-brie-presto-och-rodbetor"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Äggröra med fetaost och spenat",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-fetaost-och-spenat"
        },
        "lunch": {
          "name": "Lövbiffsrullader med brie, pesto och rödbetor (Rester)"
        },
        "dinner": {
          "name": "Valnötslax med fetaostcrème",
          "recipeLink": "/kunskapsbank/recept/valnotslax-med-fetaostcreme"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Stekt ägg med avokado",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-med-avokado"
        },
        "lunch": {
          "name": "Valnötslax med fetaostcrème (Rester)"
        },
        "dinner": {
          "name": "Köttfärslimpa med tomat",
          "recipeLink": "/kunskapsbank/recept/kottfarslimpa-med-tomat"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Choklad- och kokoschiapudding",
          "recipeLink": "/kunskapsbank/recept/choklad-och-kokoschiapudding"
        },
        "lunch": {
          "name": "Köttfärslimpa med tomat (Rester)"
        },
        "dinner": {
          "name": "Valnötslax med fetaostcrème",
          "recipeLink": "/kunskapsbank/recept/valnotslax-med-fetaostcreme"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Choklad- och kokoschiapudding (Rester)"
        },
        "lunch": {
          "name": "Valnötslax med fetaostcrème (Rester)"
        },
        "dinner": {
          "name": "Köttfärslimpa med tomat (Rester)"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Bananmuffin",
          "recipeLink": "/kunskapsbank/recept/bananmuffin"
        },
        "lunch": {
          "name": "Köttfärslimpa med tomat"
        },
        "dinner": {
          "name": "Torrfisk med sötpotatis",
          "recipeLink": "/kunskapsbank/recept/torrfisk-med-sotpotatis"
        }
      }
    }
  },
  "week4": {
    "title": "Vecka 4: Avancerad Flow",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Stekt ägg med avokado",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-med-avokado"
        },
        "lunch": {
          "name": "Torrfisk med sötpotatis (Rester)"
        },
        "dinner": {
          "name": "Äggröra med fetaost och spenat",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-fetaost-och-spenat"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Omelett med avokado",
          "recipeLink": "/kunskapsbank/recept/omelett-med-avokado"
        },
        "lunch": {
          "name": "Äggröra med fetaost och spenat (Rester)"
        },
        "dinner": {
          "name": "Torsk med saffranssås",
          "recipeLink": "/kunskapsbank/recept/torsk-med-saffranssos"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Chiapudding med jordgubbar och hallon",
          "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbar-och-hallon"
        },
        "lunch": {
          "name": "Torsk med saffranssås (Rester)"
        },
        "dinner": {
          "name": "Äggröra med champinjoner",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-champinjoner"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Varm chiagröt med äpple",
          "recipeLink": "/kunskapsbank/recept/varm-chiagrot-med-apple"
        },
        "lunch": {
          "name": "Äggröra med champinjoner (Rester)"
        },
        "dinner": {
          "name": "Äggröra med fetaost och spenat",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-fetaost-och-spenat"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Blåbärssmoothie",
          "recipeLink": "/kunskapsbank/recept/blabarssmoothie"
        },
        "lunch": {
          "name": "Äggröra med fetaost och spenat (Rester)"
        },
        "dinner": {
          "name": "Lax med rödbetssallad",
          "recipeLink": "/kunskapsbank/recept/lax-med-rodbetssallad"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Smoothiebowl med blåbär och granola",
          "recipeLink": "/kunskapsbank/recept/smoothiebowl-med-blabar-och-granola"
        },
        "lunch": {
          "name": "Lax med rödbetssallad (Rester)"
        },
        "dinner": {
          "name": "Omelett med keso och bär",
          "recipeLink": "/kunskapsbank/recept/omelett-med-keso-och-bar"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Omelett med keso och bär (Rester)"
        },
        "lunch": {
          "name": "Omelett med keso och bär"
        },
        "dinner": {
          "name": "Chiapudding med jordgubbar och hallon",
          "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbar-och-hallon"
        }
      }
    }
  },
  "week5": {
    "title": "Vecka 5: Mästerskap i Flow",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Stekt ägg med champinjoner",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-champinjoner"
        },
        "lunch": {
          "name": "Chiapudding med jordgubbar och hallon (Rester)"
        },
        "dinner": {
          "name": "Äggröra med asiatisk avokadosallad",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-asiatisk-avokadosallad"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola-och-frukt"
        },
        "lunch": {
          "name": "Äggröra med asiatisk avokadosallad (Rester)"
        },
        "dinner": {
          "name": "Torrfisk med sötpotatis och spenat",
          "recipeLink": "/kunskapsbank/recept/torrfisk-med-sotpotatis-och-spenat"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Keso med bovetegranola och frukt",
          "recipeLink": "/kunskapsbank/recept/yoghurt-med-bovetegranola-och-frukt"
        },
        "lunch": {
          "name": "Torrfisk med sötpotatis och spenat (Rester)"
        },
        "dinner": {
          "name": "Kycklingburgare med papayasallad",
          "recipeLink": "/kunskapsbank/recept/kycklingburgare-med-papayasallad"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Overnight oats med morot",
          "recipeLink": "/kunskapsbank/recept/morotssoppa-med-ingefara-och-rostade-kikartor"
        },
        "lunch": {
          "name": "Kycklingburgare med papayasallad (Rester)"
        },
        "dinner": {
          "name": "Äggröra med fetaost och spenat",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-fetaost-och-spenat"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Overnight oats med morot (Rester)"
        },
        "lunch": {
          "name": "Äggröra med fetaost och spenat (Rester)"
        },
        "dinner": {
          "name": "Torsk med saffranssås",
          "recipeLink": "/kunskapsbank/recept/torsk-med-saffranssos"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Blåbärssmoothie",
          "recipeLink": "/kunskapsbank/recept/blabarssmoothie"
        },
        "lunch": {
          "name": "Torsk med saffranssås (Rester)"
        },
        "dinner": {
          "name": "Bananpannkaka",
          "recipeLink": "/kunskapsbank/recept/bananpannkaka"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Bovetegranola",
          "recipeLink": "/kunskapsbank/recept/bovetegranola"
        },
        "lunch": {
          "name": "Bananpannkaka (Rester)"
        },
        "dinner": {
          "name": "Stekt ägg med champinjoner",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-champinjoner"
        }
      }
    }
  },
  "week6": {
    "title": "Vecka 6: Fullständig Flow",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Kokta ägg med kaviar",
          "recipeLink": "/kunskapsbank/recept/kokt-agg-med-kaviar"
        },
        "lunch": {
          "name": "Stekt ägg med champinjoner (Rester)"
        },
        "dinner": {
          "name": "Äggröra med champinjoner",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-champinjoner"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Kokta ägg med kaviar (Rester)"
        },
        "lunch": {
          "name": "Äggröra med champinjoner (Rester)"
        },
        "dinner": {
          "name": "Hamburgare med grekisk sallad",
          "recipeLink": "/kunskapsbank/recept/hamburgare-med-grekisk-sallad"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Äggröra med asiatisk avokadosallad",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-asiatisk-avokadosallad"
        },
        "lunch": {
          "name": "Hamburgare med grekisk sallad (Rester)"
        },
        "dinner": {
          "name": "Asiatisk köttfärswok med grönkål",
          "recipeLink": "/kunskapsbank/recept/asiatisk-kottfarswok-med-gronkal"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Äggröra med asiatisk avokadosallad (Rester)"
        },
        "lunch": {
          "name": "Asiatisk köttfärswok med grönkål (Rester)"
        },
        "dinner": {
          "name": "Äggröra med fetaost och spenat",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-fetaost-och-spenat"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Stekt ägg med avokado",
          "recipeLink": "/kunskapsbank/recept/stekt-agg-med-avokado"
        },
        "lunch": {
          "name": "Äggröra med fetaost och spenat (Rester)"
        },
        "dinner": {
          "name": "Äggröra med champinjoner",
          "recipeLink": "/kunskapsbank/recept/aggrora-med-champinjoner"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Omelett med avokado",
          "recipeLink": "/kunskapsbank/recept/omelett-med-avokado"
        },
        "lunch": {
          "name": "Äggröra med champinjoner (Rester)"
        },
        "dinner": {
          "name": "Lax med rödbetssallad",
          "recipeLink": "/kunskapsbank/recept/lax-med-rodbetssallad"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Chiapudding med jordgubbar och hallon",
          "recipeLink": "/kunskapsbank/recept/chiapudding-med-jordgubbar-och-hallon"
        },
        "lunch": {
          "name": "Lax med rödbetssallad (Rester)"
        },
        "dinner": {
          "name": "Omelett med keso och bär",
          "recipeLink": "/kunskapsbank/recept/omelett-med-keso-och-bar"
        }
      }
    }
  }
};

export function getMealForDay(dayOfCourse: number): DayMeals | null {
  const weekNumber = Math.ceil(dayOfCourse / 7);
  const dayInWeek = ((dayOfCourse - 1) % 7) + 1;
  
  const weekKey = `week${weekNumber}` as keyof typeof mealPlans;
  const weekPlan = mealPlans[weekKey];
  
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
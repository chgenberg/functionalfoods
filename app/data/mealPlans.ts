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
          "recipeLink": "/kunskapsbank/recept/-1752508497614"
        },
        "lunch": {
          "name": "Tonfisksallad med äpple",
          "recipeLink": "/kunskapsbank/recept/-1752508506986"
        },
        "dinner": {
          "name": "Squashspagetti med köttfärssås",
          "recipeLink": "/kunskapsbank/recept/fixed-recept-squashspagetti-med-kottfarssas"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Tropisk smoothiebowl",
          "recipeLink": "/kunskapsbank/recept/w-1752508498584"
        },
        "lunch": {
          "name": "Kycklinggryta med bakad spetskål (Rester)"
        },
        "dinner": {
          "name": "Laxburgare med krämig grönsaksröra",
          "recipeLink": "/kunskapsbank/recept/-1752508506135"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Stekt ägg med lax",
          "recipeLink": "/kunskapsbank/recept/-1752508501352"
        },
        "lunch": {
          "name": "Laxburgare med krämig grönsaksröra (Rester)"
        },
        "dinner": {
          "name": "Poké bowl med kyckling",
          "recipeLink": "/kunskapsbank/recept/w-1752508505312"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Havrefrallor med morötter och aprikoser",
          "recipeLink": "/kunskapsbank/recept/-1752508500528"
        },
        "lunch": {
          "name": "Poké bowl med kyckling (Rester)"
        },
        "dinner": {
          "name": "Tonfisksallad med äpple",
          "recipeLink": "/kunskapsbank/recept/-1752508506986"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Omelett med tomat",
          "recipeLink": "/kunskapsbank/recept/-1752508502133"
        },
        "lunch": {
          "name": "Tonfisksallad med äpple (Rester)"
        },
        "dinner": {
          "name": "Squashspagetti med köttfärssås",
          "recipeLink": "/kunskapsbank/recept/fixed-recept-squashspagetti-med-kottfarssas"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Bärmoothiebowl",
          "recipeLink": "/kunskapsbank/recept/w-1752508499726"
        },
        "lunch": {
          "name": "Squashspagetti med köttfärssås (Rester)"
        },
        "dinner": {
          "name": "Ugnsbakad tomat med köttfärs",
          "recipeLink": "/kunskapsbank/recept/forbattrad-extraktion-ugnsbakad-tomat-med-kottfars"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Grön smoothie",
          "recipeLink": "/kunskapsbank/recept/-1752508502906"
        },
        "lunch": {
          "name": "Ugnsbakad tomat med köttfärs (Rester)"
        },
        "dinner": {
          "name": "Kycklinggryta med bakad spetskål",
          "recipeLink": "/kunskapsbank/recept/-1752508504510"
        }
      }
    }
  },
  "week2": {
    "title": "Vecka 2: Att välja rätt proteiner",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Omelett med champinjoner",
          "recipeLink": "/kunskapsbank/recept/-1752509263159"
        },
        "lunch": {
          "name": "Torskrygg med ägghack och sparris",
          "recipeLink": "/kunskapsbank/recept/-1752509267249"
        },
        "dinner": {
          "name": "Asiatiska köttbullar med nudelsallad",
          "recipeLink": "/kunskapsbank/recept/-1752509269070"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Keso med hallon och valnötter",
          "recipeLink": "/kunskapsbank/recept/-1752509261824"
        },
        "lunch": {
          "name": "Asiatiska köttbullar med nudelsallad (Rester)"
        },
        "dinner": {
          "name": "Lax med fetaost och rostade rotfrukter",
          "recipeLink": "/kunskapsbank/recept/-1752509266465"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Nudelsoppa med grönsaker",
          "recipeLink": "/kunskapsbank/recept/-1752509264006"
        },
        "lunch": {
          "name": "Lax med fetaost och rostade rotfrukter (Rester)"
        },
        "dinner": {
          "name": "Päronsallad med chevréost",
          "recipeLink": "/kunskapsbank/recept/-1752509264853"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Jordgubbar och mango med vit chokladkräm",
          "recipeLink": "/kunskapsbank/recept/-1752509269953"
        },
        "lunch": {
          "name": "Päronsallad med chevréost (Rester)"
        },
        "dinner": {
          "name": "Kycklingröra med örter och tomat",
          "recipeLink": "/kunskapsbank/recept/-1752509265643"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Torskrygg med ägghack och sparris (Rester)",
          "recipeLink": "/kunskapsbank/recept/-1752509267249"
        },
        "lunch": {
          "name": "Kycklingröra med örter och tomat (Rester)"
        },
        "dinner": {
          "name": "Turkiska lammfärsspett med raita",
          "recipeLink": "/kunskapsbank/recept/-1752509268108"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Omelett med champinjoner (Rester)",
          "recipeLink": "/kunskapsbank/recept/-1752509263159"
        },
        "lunch": {
          "name": "Turkiska lammfärsspett med raita (Rester)"
        },
        "dinner": {
          "name": "Asiatiska köttbullar med nudelsallad",
          "recipeLink": "/kunskapsbank/recept/-1752509269070"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Keso med hallon och valnötter (Rester)",
          "recipeLink": "/kunskapsbank/recept/-1752509261824"
        },
        "lunch": {
          "name": "Asiatiska köttbullar med nudelsallad (Rester)"
        },
        "dinner": {
          "name": "Lax med fetaost och rostade rotfrukter",
          "recipeLink": "/kunskapsbank/recept/-1752509266465"
        }
      }
    }
  },
  "week3": {
    "title": "Vecka 3: Att välja rätt kolhydrater",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad",
          "recipeLink": "/kunskapsbank/recept/-1752509274403"
        },
        "lunch": {
          "name": "Rökt lax med blomkålsallad och citronyoghurt",
          "recipeLink": "/kunskapsbank/recept/-1752509278806"
        },
        "dinner": {
          "name": "Hamburgare med hummus",
          "recipeLink": "/kunskapsbank/recept/-1752509280409"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Omelett med hallon",
          "recipeLink": "/kunskapsbank/recept/-1752509275285"
        },
        "lunch": {
          "name": "Hamburgare med hummus (Rester)"
        },
        "dinner": {
          "name": "Vegetarisk currygryta med panéer",
          "recipeLink": "/kunskapsbank/recept/-1752509276070"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Lax med waldorfsallad",
          "recipeLink": "/kunskapsbank/recept/w-1752509279611"
        },
        "lunch": {
          "name": "Vegetarisk currygryta med panéer (Rester)"
        },
        "dinner": {
          "name": "Ugnsbakad kyckling med tzatziki och sallad",
          "recipeLink": "/kunskapsbank/recept/-1752509277209"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Kycklingfylld aubergine",
          "recipeLink": "/kunskapsbank/recept/-1752509278025"
        },
        "lunch": {
          "name": "Ugnsbakad kyckling med tzatziki och sallad (Rester)"
        },
        "dinner": {
          "name": "Mandel och citronpaj",
          "recipeLink": "/kunskapsbank/recept/-1752509281210"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Rökt lax med blomkålsallad och citronyoghurt (Rester)",
          "recipeLink": "/kunskapsbank/recept/-1752509278806"
        },
        "lunch": {
          "name": "Mandel och citronpaj (Rester)"
        },
        "dinner": {
          "name": "Kycklingfylld aubergine",
          "recipeLink": "/kunskapsbank/recept/-1752509278025"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med granola och fruktsallad (Rester)",
          "recipeLink": "/kunskapsbank/recept/-1752509274403"
        },
        "lunch": {
          "name": "Kycklingfylld aubergine (Rester)"
        },
        "dinner": {
          "name": "Lax med waldorfsallad",
          "recipeLink": "/kunskapsbank/recept/w-1752509279611"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Omelett med hallon (Rester)",
          "recipeLink": "/kunskapsbank/recept/-1752509275285"
        },
        "lunch": {
          "name": "Lax med waldorfsallad (Rester)"
        },
        "dinner": {
          "name": "Hamburgare med hummus",
          "recipeLink": "/kunskapsbank/recept/-1752509280409"
        }
      }
    }
  },
  "week4": {
    "title": "Vecka 4: Functional Foods Topplista",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Keso med hallon och granatäpple",
          "recipeLink": "/kunskapsbank/recept/-1752509283605"
        },
        "lunch": {
          "name": "Fruktsmoothie",
          "recipeLink": "/kunskapsbank/recept/-1752509285284"
        },
        "dinner": {
          "name": "Omelett med bär",
          "recipeLink": "/kunskapsbank/recept/-1752509286120"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Havregrynsgröt med torkad frukt och äpple",
          "recipeLink": "/kunskapsbank/recept/-1752509287956"
        },
        "lunch": {
          "name": "Omelett med bär (Rester)"
        },
        "dinner": {
          "name": "Bananplättar med mango och granatäpple",
          "recipeLink": "/kunskapsbank/recept/-1752509286894"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Ägghack med kalkon",
          "recipeLink": "/kunskapsbank/recept/-1752509288722"
        },
        "lunch": {
          "name": "Bananplättar med mango och granatäpple (Rester)"
        },
        "dinner": {
          "name": "Kycklinggryta med röda linser",
          "recipeLink": "/kunskapsbank/recept/-1752509289538"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Ugnsbakad kyckling med quinoasallad och chilimajonäs",
          "recipeLink": "/kunskapsbank/recept/-1752509290441"
        },
        "lunch": {
          "name": "Kycklinggryta med röda linser (Rester)"
        },
        "dinner": {
          "name": "Laxsallad med vindruvor",
          "recipeLink": "/kunskapsbank/recept/-1752509291285"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Torsk från mellanöstern",
          "recipeLink": "/kunskapsbank/recept/-1752509292109"
        },
        "lunch": {
          "name": "Laxsallad med vindruvor (Rester)"
        },
        "dinner": {
          "name": "Grillspett med grekisk sallad och morotstzaziki",
          "recipeLink": "/kunskapsbank/recept/-1752509292913"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med hallon och granatäpple (Rester)",
          "recipeLink": "/kunskapsbank/recept/-1752509283605"
        },
        "lunch": {
          "name": "Grillspett med grekisk sallad och morotstzaziki (Rester)"
        },
        "dinner": {
          "name": "Fruktsmoothie",
          "recipeLink": "/kunskapsbank/recept/-1752509285284"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Havregrynsgröt med torkad frukt och äpple (Rester)",
          "recipeLink": "/kunskapsbank/recept/-1752509287956"
        },
        "lunch": {
          "name": "Fruktsmoothie (Rester)"
        },
        "dinner": {
          "name": "Ugnsbakad kyckling med quinoasallad och chilimajonäs",
          "recipeLink": "/kunskapsbank/recept/-1752509290441"
        }
      }
    }
  },
  "week5": {
    "title": "Vecka 5: Fördelarna med Functional Foods",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Bananplättar med jordgubbar och kokos",
          "recipeLink": "/kunskapsbank/recept/-1752509295444"
        },
        "lunch": {
          "name": "Chiafrögröt",
          "recipeLink": "/kunskapsbank/recept/-1752509296707"
        },
        "dinner": {
          "name": "Äggröra med paprika",
          "recipeLink": "/kunskapsbank/recept/-1752509297485"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Mangosmoothie med spenat",
          "recipeLink": "/kunskapsbank/recept/-1752509298293"
        },
        "lunch": {
          "name": "Äggröra med paprika (Rester)"
        },
        "dinner": {
          "name": "Grekisk sallad",
          "recipeLink": "/kunskapsbank/recept/-1752509299090"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Japansk kycklingfärswok med groddar",
          "recipeLink": "/kunskapsbank/recept/w-1752509299887"
        },
        "lunch": {
          "name": "Grekisk sallad (Rester)"
        },
        "dinner": {
          "name": "Kycklingjärpar med linssallad",
          "recipeLink": "/kunskapsbank/recept/-1752509300678"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Skaldjursgryta med torsk i gul curry",
          "recipeLink": "/kunskapsbank/recept/-1752509301456"
        },
        "lunch": {
          "name": "Kycklingjärpar med linssallad (Rester)"
        },
        "dinner": {
          "name": "Laxfilé med ratatouille",
          "recipeLink": "/kunskapsbank/recept/-1752509302270"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Köttfärslimpa med ajvar och rostad sötpotatis",
          "recipeLink": "/kunskapsbank/recept/-1752509303086"
        },
        "lunch": {
          "name": "Laxfilé med ratatouille (Rester)"
        },
        "dinner": {
          "name": "Bananplättar med jordgubbar och kokos",
          "recipeLink": "/kunskapsbank/recept/-1752509295444"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Chiafrögröt (Rester)",
          "recipeLink": "/kunskapsbank/recept/-1752509296707"
        },
        "lunch": {
          "name": "Bananplättar med jordgubbar och kokos (Rester)"
        },
        "dinner": {
          "name": "Mangosmoothie med spenat",
          "recipeLink": "/kunskapsbank/recept/-1752509298293"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Japansk kycklingfärswok med groddar (Rester)",
          "recipeLink": "/kunskapsbank/recept/w-1752509299887"
        },
        "lunch": {
          "name": "Mangosmoothie med spenat (Rester)"
        },
        "dinner": {
          "name": "Skaldjursgryta med torsk i gul curry",
          "recipeLink": "/kunskapsbank/recept/-1752509301456"
        }
      }
    }
  },
  "week6": {
    "title": "Vecka 6: Att komma igång",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Äggröra med granatäpple och kiwi",
          "recipeLink": "/kunskapsbank/recept/w-1752509305366"
        },
        "lunch": {
          "name": "Kokt ägg med majonnäs",
          "recipeLink": "/kunskapsbank/recept/-1752509306739"
        },
        "dinner": {
          "name": "Havregrynsgröt med apelsin och kokos",
          "recipeLink": "/kunskapsbank/recept/-1752509307923"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Mango med keso och nötter",
          "recipeLink": "/kunskapsbank/recept/-1752509308718"
        },
        "lunch": {
          "name": "Havregrynsgröt med apelsin och kokos (Rester)"
        },
        "dinner": {
          "name": "Hallon- och blåbärssmoothie",
          "recipeLink": "/kunskapsbank/recept/-1752509309677"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Quinoasallad med stekt halloumi",
          "recipeLink": "/kunskapsbank/recept/-1752509310464"
        },
        "lunch": {
          "name": "Hallon- och blåbärssmoothie (Rester)"
        },
        "dinner": {
          "name": "Grönsakswok med kyckling",
          "recipeLink": "/kunskapsbank/recept/w-1752509311269"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Indisk laxgryta med röda linser",
          "recipeLink": "/kunskapsbank/recept/-1752509312546"
        },
        "lunch": {
          "name": "Grönsakswok med kyckling (Rester)"
        },
        "dinner": {
          "name": "Torsk teriyaki med grönsaker",
          "recipeLink": "/kunskapsbank/recept/-1752509313368"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Lammgryta med plommon och bulgur",
          "recipeLink": "/kunskapsbank/recept/-1752509314211"
        },
        "lunch": {
          "name": "Torsk teriyaki med grönsaker (Rester)"
        },
        "dinner": {
          "name": "Köttfärspytt med italienska smaker",
          "recipeLink": "/kunskapsbank/recept/-1752509315071"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Äggröra med granatäpple och kiwi (Rester)",
          "recipeLink": "/kunskapsbank/recept/w-1752509305366"
        },
        "lunch": {
          "name": "Köttfärspytt med italienska smaker (Rester)"
        },
        "dinner": {
          "name": "Mango med keso och nötter",
          "recipeLink": "/kunskapsbank/recept/-1752509308718"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Quinoasallad med stekt halloumi (Rester)",
          "recipeLink": "/kunskapsbank/recept/-1752509310464"
        },
        "lunch": {
          "name": "Mango med keso och nötter (Rester)"
        },
        "dinner": {
          "name": "Indisk laxgryta med röda linser",
          "recipeLink": "/kunskapsbank/recept/-1752509312546"
        }
      }
    }
  }
};

// Functional Flow meal plans (new)
export const flowMealPlans: Record<string, WeekMealPlan> = {
  "week1": {
    "title": "Vecka 1: Avancerad grund i Functional Foods",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola",
          "recipeLink": "/kunskapsbank/recept/flow-recept-yoghurt-med-bovetegranola"
        },
        "lunch": {
          "name": "Fänkålssallad med grapefrukt och burrata",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-fankalssallad-med-grapefrukt-och-burrata"
        },
        "dinner": {
          "name": "Kycklinggryta från medelhavet",
          "recipeLink": "/kunskapsbank/recept/-1752509226351"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Choklad- och kokoschiapudding",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-choklad-och-kokoschiapudding"
        },
        "lunch": {
          "name": "Kycklinggryta från medelhavet (Rester)"
        },
        "dinner": {
          "name": "Laxgratäng med broccoli och scampi",
          "recipeLink": "/kunskapsbank/recept/-1752509228064"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Färskostmacka med tomat",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-farskostmacka-med-tomat"
        },
        "lunch": {
          "name": "Laxgratäng med broccoli och scampi (Rester)"
        },
        "dinner": {
          "name": "Grönsakswok med tonfisk och ägg",
          "recipeLink": "/kunskapsbank/recept/w-1752509227229"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Bovetegranola",
          "recipeLink": "/kunskapsbank/recept/-1752509214440"
        },
        "lunch": {
          "name": "Grönsakswok med tonfisk och ägg (Rester)"
        },
        "dinner": {
          "name": "Kycklingburgare med papayasallad",
          "recipeLink": "/kunskapsbank/recept/-1752509225243"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Ugnsomelett med keso och bär",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-ugnsomelett-med-keso-och-bar"
        },
        "lunch": {
          "name": "Kycklingburgare med papayasallad (Rester)"
        },
        "dinner": {
          "name": "Linssoppa från medelhavet",
          "recipeLink": "/kunskapsbank/recept/-1752509223227"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Keso med bovetegranola",
          "recipeLink": "/kunskapsbank/recept/-1752509215736"
        },
        "lunch": {
          "name": "Linssoppa från medelhavet (Rester)"
        },
        "dinner": {
          "name": "Omelett med ost och spenat",
          "recipeLink": "/kunskapsbank/recept/-1752509221814"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Morot- och kesolimpa",
          "recipeLink": "/kunskapsbank/recept/-1752509218512"
        },
        "lunch": {
          "name": "Omelett med ost och spenat (Rester)"
        },
        "dinner": {
          "name": "Äggröra med asiatisk avokadosallad",
          "recipeLink": "/kunskapsbank/recept/-1752509216662"
        }
      }
    }
  },
  "week2": {
    "title": "Vecka 2: Proteinoptimering och synergier",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Bananmuffins med mandel och kanel",
          "recipeLink": "/kunskapsbank/recept/flow-recept-bananmuffins-med-mandel-och-kanel"
        },
        "lunch": {
          "name": "Laxsallad med fetaost",
          "recipeLink": "/kunskapsbank/recept/flow-recept-laxsallad-med-fetaost"
        },
        "dinner": {
          "name": "Entrecote med haricots verts och bearnaisesås",
          "recipeLink": "/kunskapsbank/recept/flow-recept-entrecote-med-haricots-verts-och-bearnaisesas"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Chiapudding med jordgubbar och hallon",
          "recipeLink": "/kunskapsbank/recept/flow-recept-chiapudding-med-jordgubbar-och-hallon"
        },
        "lunch": {
          "name": "Entrecote med haricots verts (Rester)"
        },
        "dinner": {
          "name": "Fisktaco med mangosalsa och sesamsås",
          "recipeLink": "/kunskapsbank/recept/flow-recept-fisktaco-med-mangosalsa-och-sesamsas"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Smoothiebowl med mango och pistagenötter",
          "recipeLink": "/kunskapsbank/recept/flow-recept-smoothiebowl-med-mango-och-pistagenotter"
        },
        "lunch": {
          "name": "Fisktaco med mangosalsa (Rester)"
        },
        "dinner": {
          "name": "Kycklingrullader med gorgonzola",
          "recipeLink": "/kunskapsbank/recept/flow-recept-kycklingrullader-med-gorgonzola"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Kokt ägg med kaviar",
          "recipeLink": "/kunskapsbank/recept/flow-recept-kokt-agg-med-kaviar"
        },
        "lunch": {
          "name": "Kycklingrullader med gorgonzola (Rester)"
        },
        "dinner": {
          "name": "Lax med rödbetssallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-lax-med-rodbetssallad"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Yoghurt med mango och apelsin",
          "recipeLink": "/kunskapsbank/recept/flow-recept-yoghurt-med-mango-och-apelsin"
        },
        "lunch": {
          "name": "Lax med rödbetssallad (Rester)"
        },
        "dinner": {
          "name": "Hamburgare med grekisk sallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-hamburgare-med-grekisk-sallad"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Bananmuffins med mandel och kanel (Rester)",
          "recipeLink": "/kunskapsbank/recept/flow-recept-bananmuffins-med-mandel-och-kanel"
        },
        "lunch": {
          "name": "Hamburgare med grekisk sallad (Rester)"
        },
        "dinner": {
          "name": "Keso med bovetegranola och frukt",
          "recipeLink": "/kunskapsbank/recept/flow-recept-keso-med-bovetegranola-och-frukt"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Grön juice",
          "recipeLink": "/kunskapsbank/recept/flow-recept-gron-juice"
        },
        "lunch": {
          "name": "Keso med bovetegranola och frukt (Rester)"
        },
        "dinner": {
          "name": "Quinoasallad med scampi och mango",
          "recipeLink": "/kunskapsbank/recept/flow-recept-quinoasallad-med-scampi-och-mango"
        }
      }
    }
  },
  "week3": {
    "title": "Vecka 3: Kolhydratperiodisering och metabolism",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Overnightoats med morot",
          "recipeLink": "/kunskapsbank/recept/flow-recept-overnightoats-med-morot"
        },
        "lunch": {
          "name": "Pestotorsk med capresesallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-pestotorsk-med-capresesallad"
        },
        "dinner": {
          "name": "Nötgryta med rotfrukter",
          "recipeLink": "/kunskapsbank/recept/flow-recept-notgryta-med-rotfrukter"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Citronkaka med äpple och kardemumma",
          "recipeLink": "/kunskapsbank/recept/flow-recept-citronkaka-med-apple-och-kardemumma"
        },
        "lunch": {
          "name": "Nötgryta med rotfrukter (Rester)"
        },
        "dinner": {
          "name": "Köttfärsbiffar med mozzarella och tomatsallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-kottfarsbiffar-med-mozzarella-och-tomatsallad"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Mandelkaka med choklad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-mandelkaka-med-choklad"
        },
        "lunch": {
          "name": "Köttfärsbiffar med mozzarella (Rester)"
        },
        "dinner": {
          "name": "Kyckling med stekt blomkålsris och dillyoghurt",
          "recipeLink": "/kunskapsbank/recept/flow-recept-kyckling-med-stekt-blomkalsris-och-dillyoghurt"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Zucchinikaka med kardemumma",
          "recipeLink": "/kunskapsbank/recept/flow-recept-zucchinikaka-med-kardemumma"
        },
        "lunch": {
          "name": "Kyckling med stekt blomkålsris (Rester)"
        },
        "dinner": {
          "name": "Morotssoppa med ingefära och rostade kikärtor",
          "recipeLink": "/kunskapsbank/recept/flow-recept-morotssoppa-med-ingefara-och-rostade-kikartor"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Stekta äpplen med vit chokladkräm",
          "recipeLink": "/kunskapsbank/recept/flow-recept-stekta-applen-med-vit-chokladkram"
        },
        "lunch": {
          "name": "Morotssoppa med ingefära (Rester)"
        },
        "dinner": {
          "name": "Torsk med saffranssås",
          "recipeLink": "/kunskapsbank/recept/flow-recept-torsk-med-saffranssas"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Chokladbars med majskakor",
          "recipeLink": "/kunskapsbank/recept/flow-recept-chokladbars-med-majskakor"
        },
        "lunch": {
          "name": "Torsk med saffranssås (Rester)"
        },
        "dinner": {
          "name": "Ugnsbakad blomkål med ratatouille",
          "recipeLink": "/kunskapsbank/recept/flow-recept-ugnsbakad-blomkal-med-ratatouille"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Overnightoats med morot (Rester)",
          "recipeLink": "/kunskapsbank/recept/flow-recept-overnightoats-med-morot"
        },
        "lunch": {
          "name": "Ugnsbakad blomkål med ratatouille (Rester)"
        },
        "dinner": {
          "name": "Spenatsoppa med rostade pumpafrön",
          "recipeLink": "/kunskapsbank/recept/flow-recept-spenatsoppa-med-rostade-pumpafron"
        }
      }
    }
  },
  "week4": {
    "title": "Vecka 4: Maximal näringsabsorption",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Omelett med keso och bär",
          "recipeLink": "/kunskapsbank/recept/flow-recept-omelett-med-keso-och-bar"
        },
        "lunch": {
          "name": "Färgstark fetaostsallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-fargstark-fetaostsallad"
        },
        "dinner": {
          "name": "Lövbiffsgryta med champinjoner och grönsaksspagetti",
          "recipeLink": "/kunskapsbank/recept/flow-recept-lovbiffsgryta-med-champinjoner-och-gronsaksspagetti"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Bananmuffin",
          "recipeLink": "/kunskapsbank/recept/flow-recept-bananmuffin"
        },
        "lunch": {
          "name": "Lövbiffsgryta med champinjoner (Rester)"
        },
        "dinner": {
          "name": "Asiatisk kycklingfärswok med grönkål",
          "recipeLink": "/kunskapsbank/recept/flow-recept-asiatisk-kycklingfarswok-med-gronkal"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Zucchiniplättar med yoghurtsås",
          "recipeLink": "/kunskapsbank/recept/flow-recept-zucchiniplattar-med-yoghurtsas"
        },
        "lunch": {
          "name": "Asiatisk kycklingfärswok (Rester)"
        },
        "dinner": {
          "name": "Lövbiffsrullader med brie, presto och rödbetor",
          "recipeLink": "/kunskapsbank/recept/flow-recept-lovbiffsrullader-med-brie-presto-och-rodbetor"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Macka med ost",
          "recipeLink": "/kunskapsbank/recept/flow-recept-macka-med-ost"
        },
        "lunch": {
          "name": "Lövbiffsrullader med brie (Rester)"
        },
        "dinner": {
          "name": "Grönsakswok med kycklingfärs",
          "recipeLink": "/kunskapsbank/recept/flow-recept-gronsakswok-med-kycklingfars"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Omelett med ost och spenat",
          "recipeLink": "/kunskapsbank/recept/flow-recept-omelett-med-ost-och-spenat"
        },
        "lunch": {
          "name": "Grönsakswok med kycklingfärs (Rester)"
        },
        "dinner": {
          "name": "Kycklingpizza",
          "recipeLink": "/kunskapsbank/recept/flow-recept-kycklingpizza"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Äggröra med fetaost och spenat",
          "recipeLink": "/kunskapsbank/recept/flow-recept-aggrora-med-fetaost-och-spenat"
        },
        "lunch": {
          "name": "Kycklingpizza (Rester)"
        },
        "dinner": {
          "name": "Varma grönsaker med halloumi",
          "recipeLink": "/kunskapsbank/recept/flow-recept-varma-gronsaker-med-halloumi"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Ägghack i salladsblad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-agghack-i-salladsblad"
        },
        "lunch": {
          "name": "Varma grönsaker med halloumi (Rester)"
        },
        "dinner": {
          "name": "Köttfärslimpa med tomat",
          "recipeLink": "/kunskapsbank/recept/flow-recept-kottfarslimpa-med-tomat"
        }
      }
    }
  },
  "week5": {
    "title": "Vecka 5: Avancerade Flow-tekniker",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola och bär",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-yoghurt-med-bovetegranola-och-bar"
        },
        "lunch": {
          "name": "Fänkålssallad med grapefrukt och burrata",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-fankalssallad-med-grapefrukt-och-burrata"
        },
        "dinner": {
          "name": "Lax med quinoasallad och grapefrukt",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-lax-med-quinoasallad-och-grapefrukt"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Varm chiagröt med äpple",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-varm-chiagrot-med-apple"
        },
        "lunch": {
          "name": "Lax med quinoasallad (Rester)"
        },
        "dinner": {
          "name": "Stekt torsk med bearnaisesås och haricot verts",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-stekt-torsk-med-bearnaisesas-och-haricot-verts"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Bananpannkaka",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-bananpannkaka"
        },
        "lunch": {
          "name": "Stekt torsk med bearnaisesås (Rester)"
        },
        "dinner": {
          "name": "Kycklingfärsbiffar med vitlöksost",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-kycklingfarsbiffar-med-vitloksost"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Smoothiebowl med blåbär och granola",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-smoothiebowl-med-blabar-och-granola"
        },
        "lunch": {
          "name": "Kycklingfärsbiffar med vitlöksost (Rester)"
        },
        "dinner": {
          "name": "Torsk med guacamole och sötpotatis",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-torsk-med-guacamole-och-sotpotatis"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Stekt ägg med parmaskinka",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-stekt-agg-med-parmaskinka"
        },
        "lunch": {
          "name": "Torsk med guacamole (Rester)"
        },
        "dinner": {
          "name": "Nötfärstimbaler med chevreost och soltorkad tomat",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-notfarstimbaler-med-chevreost-och-soltorkad-tomat"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Ugnsomelett med keso och bär",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-ugnsomelett-med-keso-och-bar"
        },
        "lunch": {
          "name": "Nötfärstimbaler med chevreost (Rester)"
        },
        "dinner": {
          "name": "Valnötslax med fetaostcreme",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-valnotslax-med-fetaostcreme"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Blåbärssmoothie",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-blabarssmoothie"
        },
        "lunch": {
          "name": "Valnötslax med fetaostcreme (Rester)"
        },
        "dinner": {
          "name": "Grönkålspaj med champinjoner",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-gronkalspaj-med-champinjoner"
        }
      }
    }
  },
  "week6": {
    "title": "Vecka 6: Mästerskap och framtidsplanering",
    "days": {
      "Måndag": {
        "breakfast": {
          "name": "Äggröra med champinjoner",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-aggrora-med-champinjoner"
        },
        "lunch": {
          "name": "Ägghack med kallrökt lax",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-agghack-med-kallrokt-lax"
        },
        "dinner": {
          "name": "Biff med nudelsallad och jordnötssås",
          "recipeLink": "/kunskapsbank/recept/flow-recept-biff-med-nudelsallad-och-jordnotssas"
        }
      },
      "Tisdag": {
        "breakfast": {
          "name": "Stekt ägg med champinjoner",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-stekt-agg-med-champinjoner"
        },
        "lunch": {
          "name": "Biff med nudelsallad (Rester)"
        },
        "dinner": {
          "name": "Ajvarspett med grekisk sallad och tzatziki",
          "recipeLink": "/kunskapsbank/recept/flow-recept-ajvarspett-med-grekisk-sallad-och-tzatziki"
        }
      },
      "Onsdag": {
        "breakfast": {
          "name": "Omelettrulle",
          "recipeLink": "/kunskapsbank/recept/improved-flow-recept-omelettrulle"
        },
        "lunch": {
          "name": "Ajvarspett med grekisk sallad (Rester)"
        },
        "dinner": {
          "name": "Gino",
          "recipeLink": "/kunskapsbank/recept/flow-recept-gino"
        }
      },
      "Torsdag": {
        "breakfast": {
          "name": "Yoghurt med bovetegranola och frukt",
          "recipeLink": "/kunskapsbank/recept/flow-recept-yoghurt-med-bovetegranola-och-frukt"
        },
        "lunch": {
          "name": "Gino (Rester)"
        },
        "dinner": {
          "name": "Äggröra med asiatisk avokadosallad",
          "recipeLink": "/kunskapsbank/recept/flow-recept-aggrora-med-asiatisk-avokadosallad"
        }
      },
      "Fredag": {
        "breakfast": {
          "name": "Keso med bovetegranola",
          "recipeLink": "/kunskapsbank/recept/flow-recept-keso-med-bovetegranola"
        },
        "lunch": {
          "name": "Äggröra med asiatisk avokadosallad (Rester)"
        },
        "dinner": {
          "name": "Bovetegranola",
          "recipeLink": "/kunskapsbank/recept/flow-recept-bovetegranola"
        }
      },
      "Lördag": {
        "breakfast": {
          "name": "Choklad- och kokoschiapudding",
          "recipeLink": "/kunskapsbank/recept/flow-recept-choklad-och-kokoschiapudding"
        },
        "lunch": {
          "name": "Bovetegranola (Rester)"
        },
        "dinner": {
          "name": "Yoghurt med mango och apelsin",
          "recipeLink": "/kunskapsbank/recept/flow-recept-yoghurt-med-mango-och-apelsin"
        }
      },
      "Söndag": {
        "breakfast": {
          "name": "Färskostmacka med tomat",
          "recipeLink": "/kunskapsbank/recept/flow-recept-farskostmacka-med-tomat"
        },
        "lunch": {
          "name": "Yoghurt med mango och apelsin (Rester)"
        },
        "dinner": {
          "name": "Linssoppa från medelhavet",
          "recipeLink": "/kunskapsbank/recept/flow-recept-linssoppa-fran-medelhavet"
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
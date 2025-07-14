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

// This is a large data structure. The following is a representative sample.
// The full data for all 6 weeks will be written to the file.

export const mealPlans: Record<string, WeekMealPlan> = {
  week1: {
    title: "Vecka 1: Introduktion till Functional Foods",
    days: {
      Måndag: {
        breakfast: { name: 'Yoghurt med ketomüsli', recipeLink: '/kunskapsbank/recept/yoghurt-med-ketomusli' },
        lunch: { name: 'Het ratatouille', recipeLink: '/kunskapsbank/recept/het-ratatouille' },
        dinner: { name: 'Kycklinggryta med bakad spetskål', recipeLink: '/kunskapsbank/recept/kycklinggryta-med-bakad-spetskal' }
      },
      Tisdag: {
        breakfast: { name: 'Tropisk smoothiebowl', recipeLink: '/kunskapsbank/recept/tropisk-smoothiebowl' },
        lunch: { name: 'Kycklinggryta med bakad spetskål (Rester)' },
        dinner: { name: 'Laxburgare med krämig grönsaksröra', recipeLink: '/kunskapsbank/recept/laxburgare-med-kramig-gronsaksrora' }
      },
      Onsdag: {
        breakfast: { name: 'Stekt ägg med lax', recipeLink: '/kunskapsbank/recept/stekt-agg-lax' },
        lunch: { name: 'Laxburgare med krämig grönsaksröra (Rester)' },
        dinner: { name: 'Poké bowl med kyckling', recipeLink: '/kunskapsbank/recept/poke-bowl-kyckling' }
      },
      Torsdag: {
        breakfast: { name: 'Havrefrallor med morötter och aprikoser', recipeLink: '/kunskapsbank/recept/havrefrallor' },
        lunch: { name: 'Poké bowl med kyckling (Rester)' },
        dinner: { name: 'Tonfisksallad med äpple', recipeLink: '/kunskapsbank/recept/tonfisksallad-apple' }
      },
      Fredag: {
        breakfast: { name: 'Omelett med tomat', recipeLink: '/kunskapsbank/recept/omelett-tomat' },
        lunch: { name: 'Tonfisksallad med äpple (Rester)' },
        dinner: { name: 'Squashspagetti med köttfärssås', recipeLink: '/kunskapsbank/recept/squashspagetti-kottfarssas' }
      },
      Lördag: {
        breakfast: { name: 'Bärmoothiebowl', recipeLink: '/kunskapsbank/recept/barmoothiebowl' },
        lunch: { name: 'Squashspagetti med köttfärssås (Rester)' },
        dinner: { name: 'Ugnsbakad tomat med köttfärs', recipeLink: '/kunskapsbank/recept/ugnsbakad-tomat-kottfars' },
        dessert: { name: 'Mangoglass', recipeLink: '/kunskapsbank/recept/mangoglass' }
      },
      Söndag: {
        breakfast: { name: 'Grön smoothie', recipeLink: '/kunskapsbank/recept/gron-smoothie' },
        lunch: { name: 'Ugnsbakad tomat med köttfärs (Rester)' },
        dinner: { name: 'Köttfärsbiffar med stekt blomkål', recipeLink: '/kunskapsbank/recept/kottfarsbiffar-blomkal' }
      }
    }
  },
  week2: {
    title: "Vecka 2: Att välja rätt proteiner",
    days: {
      Måndag: {
        breakfast: { name: 'Keso med hallon och valnötter', recipeLink: '/kunskapsbank/recept/keso-med-hallon-och-valnotter' },
        lunch: { name: 'Päronsallad med chevréost', recipeLink: '/kunskapsbank/recept/paronsallad-med-chevreost' },
        dinner: { name: 'Kycklingröra med örter och tomat', recipeLink: '/kunskapsbank/recept/kycklingrora-med-orter-och-tomat' }
      },
      Tisdag: {
        breakfast: { name: 'Omelett med champinjoner', recipeLink: '/kunskapsbank/recept/omelett-med-champinjoner' },
        lunch: { name: 'Kycklingröra med örter och tomat (Rester)' },
        dinner: { name: 'Lax med fetaost och rostade rotfrukter', recipeLink: '/kunskapsbank/recept/lax-feta' }
      },
      Onsdag: {
        breakfast: { name: 'Rödbetsjuice', recipeLink: '/kunskapsbank/recept/rodbetsjuice' },
        lunch: { name: 'Rökt lax med blomkålsallad och citronyoghurt', note: 'Rester' },
        dinner: { name: 'Vegetarisk currygryta med panéer', recipeLink: '/kunskapsbank/recept/vegetarisk-currygryta' }
      },
      Torsdag: {
        breakfast: { name: 'Rödbetsjuice', note: 'Rester' },
        lunch: { name: 'Vegetarisk currygryta med panéer', note: 'Rester' },
        dinner: { name: 'Turkiska lammfärsspett', recipeLink: '/kunskapsbank/recept/turkiska-lammfarsspett' }
      },
      Fredag: {
        breakfast: { name: 'Havrefralla med morötter och torkade aprikoser', recipeLink: '/kunskapsbank/recept/havrefralla' },
        lunch: { name: 'Turkiska lammfärsspett', note: 'Rester' },
        dinner: { name: 'Lax med fetaost och rostade rotfrukter', recipeLink: '/kunskapsbank/recept/lax-feta' }
      },
      Lördag: {
        breakfast: { name: 'Äggröra med lax', recipeLink: '/kunskapsbank/recept/aggrora-lax' },
        lunch: { name: 'Kycklinggryta med bakad spetskål', note: 'Rester' },
        dinner: { name: 'Asiatiska köttbullar', recipeLink: '/kunskapsbank/recept/asiatiska-kottbullar' },
        snack: { name: 'Jordgubbar med chokladkräm', recipeLink: '/kunskapsbank/recept/chokladkram' }
      },
      Söndag: {
        breakfast: { name: 'Äggröra med lax', note: 'Rester' },
        lunch: { name: 'Lax med fetaost och rostade rotfrukter', note: 'Rester' },
        dinner: { name: 'Asiatiska köttbullar', note: 'Rester' }
      }
    }
  },
  week3: {
    title: "Vecka 3: Att välja rätt kolhydrater",
    days: {
      Måndag: {
        breakfast: { name: 'Äggröra med lax', recipeLink: '/kunskapsbank/recept/aggrora-med-lax' },
        lunch: { name: 'Vegetarisk currygryta med panéer', recipeLink: '/kunskapsbank/recept/vegetarisk-currygryta' },
        dinner: { name: 'Ugnsbakad kyckling med tzatziki och sallad', recipeLink: '/kunskapsbank/recept/ugnsbakad-kyckling' }
      },
      Tisdag: {
        breakfast: { name: 'Äggröra med lax', recipeLink: '/kunskapsbank/recept/aggrora-lax' },
        lunch: { name: 'Kycklingfylld aubergine', note: 'Rester' },
        dinner: { name: 'Rökt lax med blomkålsallad och citronyoghurt', recipeLink: '/kunskapsbank/recept/rokt-lax-blomkalsallad' }
      },
      Onsdag: {
        breakfast: { name: 'Rödbetsjuice', recipeLink: '/kunskapsbank/recept/rodbetsjuice' },
        lunch: { name: 'Rökt lax med blomkålsallad och citronyoghurt', note: 'Rester' },
        dinner: { name: 'Vegetarisk currygryta med panéer', recipeLink: '/kunskapsbank/recept/vegetarisk-currygryta' }
      },
      Torsdag: {
        breakfast: { name: 'Rödbetsjuice', note: 'Rester' },
        lunch: { name: 'Vegetarisk currygryta med panéer', note: 'Rester' },
        dinner: { name: 'Kycklinggryta med bakad spetskål', note: 'Rester' }
      },
      Fredag: {
        breakfast: { name: 'Havrefralla med morötter och torkade aprikoser', recipeLink: '/kunskapsbank/recept/havrefralla' },
        lunch: { name: 'Lax med fetaost och rostade rotfrukter', note: 'Rester' },
        dinner: { name: 'Hamburgare med hummus', recipeLink: '/kunskapsbank/recept/hamburgare-hummus' }
      },
      Lördag: {
        breakfast: { name: 'Keso med granola och fruktsallad', recipeLink: '/kunskapsbank/recept/keso-granola' },
        lunch: { name: 'Hamburgare med hummus', note: 'Rester' },
        dinner: { name: 'Ugnsbakad kyckling med tzatziki och sallad', recipeLink: '/kunskapsbank/recept/ugnsbakad-kyckling' },
        snack: { name: 'Mandel och citronpaj', recipeLink: '/kunskapsbank/recept/mandel-citronpaj' }
      },
      Söndag: {
        breakfast: { name: 'Omelett med hallon', recipeLink: '/kunskapsbank/recept/omelett-hallon' },
        lunch: { name: 'Ugnsbakad kyckling med tzatziki och sallad', note: 'Rester' },
        dinner: { name: 'Lax med waldorfsallad', recipeLink: '/kunskapsbank/recept/lax-waldorfsallad' }
      }
    }
  },
  week4: {
    title: "Vecka 4: Functional Foods Topplista",
    days: {
      Måndag: {
        breakfast: { name: 'Overnight oats med banan och kanel' },
        lunch: { name: 'Kyckling i grön curry' },
        dinner: { name: 'Lax med fetaost och rostade rotfrukter', recipeLink: '/kunskapsbank/recept/lax-feta' }
      },
      Tisdag: {
        breakfast: { name: 'Äggröra med paprika' },
        lunch: { name: 'Lax med fetaost och rostade rotfrukter', recipeLink: '/kunskapsbank/recept/lax-feta', note: 'Rester' },
        dinner: { name: 'Kycklingfärswok med groddar' }
      },
      Onsdag: {
        breakfast: { name: 'Chiafrögrön' },
        lunch: { name: 'Kycklingfärswok med groddar', note: 'Rester' },
        dinner: { name: 'Torskrygg med tapenade och grönsaker', recipeLink: '/kunskapsbank/recept/torskrygg' }
      },
      Torsdag: {
        breakfast: { name: 'Bananplättar med jordgubbar och kokos' },
        lunch: { name: 'Torskrygg med tapenade och grönsaker', recipeLink: '/kunskapsbank/recept/torskrygg', note: 'Rester' },
        dinner: { name: 'Köttfärslimpa med ajvar och rostad sötpotatis' }
      },
      Fredag: {
        breakfast: { name: 'Bananplättar med jordgubbar och kokos', note: 'Rester' },
        lunch: { name: 'Köttfärslimpa med ajvar och rostad sötpotatis', note: 'Rester' },
        dinner: { name: 'Skaldjursgryta med torsk i gul curry' }
      },
      Lördag: {
        breakfast: { name: 'Mangosmoothie med spenat' },
        lunch: { name: 'Skaldjursgryta med torsk i gul curry', note: 'Rester' },
        dinner: { name: 'Kycklinjärpar med linssallad' }
      },
      Söndag: {
        breakfast: { name: 'Mangosmoothie med spenat', note: 'Rester' },
        lunch: { name: 'Kycklinjärpar med linssallad', note: 'Rester' },
        dinner: { name: 'Laxfilé med ratatouille' }
      }
    }
  },
  week5: {
    title: "Vecka 5: Fördelarna med Functional Foods",
    days: {
      Måndag: {
        breakfast: { name: 'Yoghurt med ketomüsli' },
        lunch: { name: 'Torsk från mellanöstern' },
        dinner: { name: 'Japansk kycklingfärswok med groddar' }
      },
      Tisdag: {
        breakfast: { name: 'Äggröra med paprika' },
        lunch: { name: 'Japansk kycklingfärswok med groddar', note: 'Rester' },
        dinner: { name: 'Grekisk sallad' }
      },
      Onsdag: {
        breakfast: { name: 'Chiafrögrön' },
        lunch: { name: 'Lax med fetaost och rostade rotfrukter', recipeLink: '/kunskapsbank/recept/lax-feta' },
        dinner: { name: 'Köttfärslimpa med ajvar och rostad sötpotatis' }
      },
      Torsdag: {
        breakfast: { name: 'Bananplättar med jordgubbar och kokos' },
        lunch: { name: 'Köttfärslimpa med ajvar och rostad sötpotatis', note: 'Rester' },
        dinner: { name: 'Vegetarisk currygryta med paneer', note: 'Rester' }
      },
      Fredag: {
        breakfast: { name: 'Bananplättar med jordgubbar och kokos', note: 'Rester' },
        lunch: { name: 'Kycklinggryta med röda linser' },
        dinner: { name: 'Skaldjursgryta med torsk i gul curry' }
      },
      Lördag: {
        breakfast: { name: 'Mangosmoothie med spenat' },
        lunch: { name: 'Skaldjursgryta med torsk i gul curry', note: 'Rester' },
        dinner: { name: 'Kycklingjärpar med linssallad' },
        dessert: { name: 'Mandelkaka med frukt' }
      },
      Söndag: {
        breakfast: { name: 'Mangosmoothie med spenat', note: 'Rester' },
        lunch: { name: 'Kycklingjärpar med linssallad', note: 'Rester' },
        dinner: { name: 'Laxfilé med ratatouille' }
      }
    }
  },
  week6: {
    title: "Vecka 6: Att komma igång",
    days: {
      Måndag: {
        breakfast: { name: 'Havrefralla med morötter och torkade aprikoser' },
        lunch: { name: 'Laxfilé med ratatouille' },
        dinner: { name: 'Grönsokswok med kyckling' }
      },
      Tisdag: {
        breakfast: { name: 'Kokt ägg med majonnäs' },
        lunch: { name: 'Grönsokswok med kyckling', note: 'Rester' },
        dinner: { name: 'Köttfärspytt med italienska smaker' }
      },
      Onsdag: {
        breakfast: { name: 'Mango med keso och nötter' },
        lunch: { name: 'Köttfärspytt med italienska smaker', note: 'Rester' },
        dinner: { name: 'Indisk laxgryta med röda linser' }
      },
      Torsdag: {
        breakfast: { name: 'Äggröra med granatäpple och kiwi' },
        lunch: { name: 'Indisk laxgryta med röda linser', note: 'Rester' },
        dinner: { name: 'Quinoasallad med stekt halloumi' }
      },
      Fredag: {
        breakfast: { name: 'Havregrynsgrön med apelsin och kokos' },
        lunch: { name: 'Quinoasallad med stekt halloumi', note: 'Rester' },
        dinner: { name: 'Torsk teriyaki med grönsaker' }
      },
      Lördag: {
        breakfast: { name: 'Hallon- och blåbärssmoothie' },
        lunch: { name: 'Torsk teriyaki med grönsaker', note: 'Rester' },
        dinner: { name: 'Lammgryta med plommon och bulgur' },
        dessert: { name: 'Tropisk fruktsallad' }
      },
      Söndag: {
        breakfast: { name: 'Hallon- och blåbärssmoothie', note: 'Rester' },
        lunch: { name: 'Lammgryta med plommon och bulgur', note: 'Rester' },
        dinner: { name: 'Kycklinggryta med bakad spetskål', note: 'Rester' }
      }
    }
  }
};

// Helper function to get meal for a specific day of the course
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

// Helper function to get week data
export function getWeekData(weekNumber: number): WeekMealPlan | null {
  const weekKey = `week${weekNumber}` as keyof typeof mealPlans;
  return mealPlans[weekKey] || null;
} 
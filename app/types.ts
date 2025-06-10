// app/types.ts

// Grundläggande typer för näringsanalys
export interface NutrientInfo {
    status: 'deficient' | 'low' | 'normal';
    description: string;
    amount?: number;
    unit?: string;
    rdi?: number;
  }
  
  // Användarsvar och interaktion
  export interface UserResponse {
    bodyPart: string;
    description: string;
    previousAnswers: string[];
  }
  
  export interface Answer {
    question: string;
    answer: string;
    type: 'symptom' | 'lifestyle' | 'medical';
    value: string;
  }
  
  // Frågeformat
  export interface Question {
    id: string;
    question: string;
    type: 'text' | 'scale' | 'multiple-choice';
    options?: string[];
  }
  
  // Rapportformat
  export interface Report {
    riskProfile: Record<string, 'low' | 'medium' | 'high'>;
    redFlags: string[];
    scenarios: string[];
    timeline: string[];
    checklist: ChecklistItem[];
    mealPlan: string[];
    micronutrients: Record<string, NutrientInfo>;
    symptomTracker: SymptomTrackerItem[];
    aiChatIntro: string;
    faq: FAQItem[];
    references: Reference[];
    costBenefit: CostBenefit;
    localExperts: Expert[];
    reminder: ReminderInfo;
    pdfLink: string;
  }
  
  // Hjälptyper för rapporten
  export interface ChecklistItem {
    label: string;
    done: boolean;
  }
  
  export interface SymptomTrackerItem {
    symptom: string;
    severity: number;
    frequency: string;
    notes?: string;
  }
  
  export interface FAQItem {
    question: string;
    answer: string;
    category: string;
  }
  
  export interface Reference {
    title: string;
    authors: string[];
    year: number;
    url?: string;
  }
  
  export interface CostBenefit {
    estimatedCost: number;
    currency: string;
    benefits: string[];
    timeline: string;
  }
  
  export interface Expert {
    name: string;
    specialty: string;
    location: string;
    contact?: string;
  }
  
  export interface ReminderInfo {
    frequency: 'daily' | 'weekly' | 'monthly';
    type: string;
    description: string;
  }
  
  // API Response typer
  export interface APIResponse {
    questions?: Question[];
    report?: Report;
    error?: string;
    metadata?: {
      hasNutrientQuestions: boolean;
      symptomCount: number;
    };
  }

export interface AnalysisResult {
  summary: string;
  recommendations: string[];
  functionalFoods: string[];
  lifestyleChanges: string[];
}

export const bodyPartQuestions: Record<string, Question[]> = {
  head: [
    {
      id: "head-1",
      question: "När började dina huvudsmärtor och hur ofta kommer de?",
      type: "text"
    },
    {
      id: "head-2",
      question: "Hur stark är smärtan på en skala 0-10?",
      type: "scale"
    },
    {
      id: "head-3",
      question: "Vilken del av huvudet gör mest ont?",
      type: "multiple-choice",
      options: ["Panna", "Bakhuvud", "Ena sidan", "Hela huvudet"]
    },
    {
      id: "head-4",
      question: "Föregås huvudvärken av synstörningar, illamående eller ljud-/ljuskänslighet?",
      type: "text"
    },
    {
      id: "head-5",
      question: "Utlöses attackerna av stress, sömnbrist, starkt ljus eller vissa livsmedel?",
      type: "text"
    },
    {
      id: "head-6",
      question: "Hur många timmar sover du en vanlig natt?",
      type: "text"
    },
    {
      id: "head-7",
      question: "Hur mycket koffein, alkohol eller socker dricker/äter du per dag?",
      type: "text"
    },
    {
      id: "head-8",
      question: "Har du testat magnesium, ingefära, omega-3 eller andra funktionella livsmedel mot huvudvärk?",
      type: "text"
    },
    {
      id: "head-9",
      question: "Vilka läkemedel eller receptfria preparat tar du vid behov?",
      type: "text"
    },
    {
      id: "head-10",
      question: "Har du plötsligt fått den värsta huvudvärken i ditt liv eller andra nytillkomna neurologiska symtom?",
      type: "text"
    }
  ],
  chest: [
    {
      id: "chest-1",
      question: "Var i bröstet känns obehaget – mitt på, åt vänster, höger eller diffust?",
      type: "multiple-choice",
      options: ["Mitt på", "Vänster sida", "Höger sida", "Diffust"]
    },
    {
      id: "chest-2",
      question: "Är smärtan skarp, tryckande eller brännande?",
      type: "multiple-choice",
      options: ["Skarp", "Tryckande", "Brännande", "Annat"]
    },
    {
      id: "chest-3",
      question: "Kommer den vid ansträngning, vila eller efter måltid?",
      type: "multiple-choice",
      options: ["Vid ansträngning", "Vid vila", "Efter måltid", "Annat"]
    },
    {
      id: "chest-4",
      question: "Blir det värre när du tar djupa andetag eller rör överkroppen?",
      type: "text"
    },
    {
      id: "chest-5",
      question: "Upplever du andfåddhet, hjärtklappning eller yrsel samtidigt?",
      type: "text"
    },
    {
      id: "chest-6",
      question: "Röker du eller använder nikotinprodukter?",
      type: "text"
    },
    {
      id: "chest-7",
      question: "Hur ofta tränar du kondition respektive styrka per vecka?",
      type: "text"
    },
    {
      id: "chest-8",
      question: "Äter du regelbundet fet fisk, nötter, fullkorn och gröna blad?",
      type: "text"
    },
    {
      id: "chest-9",
      question: "Har du kända hjärt-/lungsjukdomar i familjen?",
      type: "text"
    },
    {
      id: "chest-10",
      question: "Har du haft plötslig, intensiv bröstsmärta som inte släpper inom 15 min?",
      type: "text"
    }
  ],
  stomache: [
    {
      id: "stomach-1",
      question: "När på dagen får du oftast magsymtom?",
      type: "text"
    },
    {
      id: "stomach-2",
      question: "Är det smärta, kramper, uppblåsthet eller halsbränna som dominerar?",
      type: "multiple-choice",
      options: ["Smärta", "Kramper", "Uppblåsthet", "Halsbränna"]
    },
    {
      id: "stomach-3",
      question: "Hur ofta har du avföring och hur ser den ut?",
      type: "multiple-choice",
      options: ["Lös", "Hård", "Blandad", "Normal"]
    },
    {
      id: "stomach-4",
      question: "Får du mer besvär efter vissa livsmedel – mjölk, gluten, stark mat, alkohol?",
      type: "text"
    },
    {
      id: "stomach-5",
      question: "Hur mycket fibrer, fermenterade produkter och vatten får du i dig dagligen?",
      type: "text"
    },
    {
      id: "stomach-6",
      question: "Känner du dig stressad eller orolig i vardagen?",
      type: "text"
    },
    {
      id: "stomach-7",
      question: "Tar du regelbundet NSAID, antibiotika eller andra läkemedel?",
      type: "text"
    },
    {
      id: "stomach-8",
      question: "Har du provat probiotika, ingefära, mynta eller andra funktionella livsmedel?",
      type: "text"
    },
    {
      id: "stomach-9",
      question: "Har du haft ofrivillig viktförändring eller blod i avföringen?",
      type: "text"
    },
    {
      id: "stomach-10",
      question: "Vaknar du på natten av magsmärtor eller har feber samtidigt?",
      type: "text"
    }
  ],
  genitals: [
    {
      id: "genitals-1",
      question: "Vad är ditt huvudsakliga problem – smärta, klåda, utslag, urinbesvär?",
      type: "multiple-choice",
      options: ["Smärta", "Klåda", "Utslag", "Urinbesvär"]
    },
    {
      id: "genitals-2",
      question: "När började symtomen och hur har de utvecklats?",
      type: "text"
    },
    {
      id: "genitals-3",
      question: "Kopplas besvären till menscykel, sexuell aktivitet eller träning?",
      type: "text"
    },
    {
      id: "genitals-4",
      question: "Har du sveda eller blod vid urinering?",
      type: "text"
    },
    {
      id: "genitals-5",
      question: "Hur ofta dricker du vatten/örttéer per dag?",
      type: "text"
    },
    {
      id: "genitals-6",
      question: "Använder du snäva kläder eller syntetiska underkläder vid träning?",
      type: "text"
    },
    {
      id: "genitals-7",
      question: "Har du bytt tvättmedel, intimprodukter eller preventivmedel nyligen?",
      type: "text"
    },
    {
      id: "genitals-8",
      question: "Intar du tranbär, probiotika eller D-mannos regelbundet?",
      type: "text"
    },
    {
      id: "genitals-9",
      question: "Har du eller partnern testats för könssjukdomar senaste året?",
      type: "text"
    },
    {
      id: "genitals-10",
      question: "Har du haft plötslig, kraftig smärta, hög feber eller synlig blödning?",
      type: "text"
    }
  ],
  "right-arm": [
    {
      id: "right-arm-1",
      question: "Var i höger arm sitter smärtan – axel, armbåge, handled eller hela armen?",
      type: "multiple-choice",
      options: ["Axel", "Armbåge", "Handled", "Hela armen"]
    },
    {
      id: "right-arm-2",
      question: "Uppstod den efter träning, arbete vid dator eller skada?",
      type: "text"
    },
    {
      id: "right-arm-3",
      question: "Blir det värre av lyft, grepp eller vila?",
      type: "text"
    },
    {
      id: "right-arm-4",
      question: "Har du domningar, stickningar eller svaghet?",
      type: "text"
    },
    {
      id: "right-arm-5",
      question: "Hur många timmar om dagen sitter du vid tangentbord/mus?",
      type: "text"
    },
    {
      id: "right-arm-6",
      question: "Hur ofta gör du rörlighets- eller styrkeövningar för överkroppen?",
      type: "text"
    },
    {
      id: "right-arm-7",
      question: "Tillför du omega-3, kollagen eller gurkmeja i kosten?",
      type: "text"
    },
    {
      id: "right-arm-8",
      question: "Använder du stöd/ortos eller ergonomisk hjälpmedel?",
      type: "text"
    },
    {
      id: "right-arm-9",
      question: "Har du haft feber, svullnad eller rodnad i området?",
      type: "text"
    },
    {
      id: "right-arm-10",
      question: "Har smärtan blivit plötsligt värre eller spridit sig till bröst/käke?",
      type: "text"
    }
  ],
  "left-arm": [
    {
      id: "left-arm-1",
      question: "Var i vänster arm känns det – axel, armbåge, handled?",
      type: "multiple-choice",
      options: ["Axel", "Armbåge", "Handled", "Hela armen"]
    },
    {
      id: "left-arm-2",
      question: "När började besvären och i vilket sammanhang?",
      type: "text"
    },
    {
      id: "left-arm-3",
      question: "Ändras smärtan vid belastning eller vila?",
      type: "text"
    },
    {
      id: "left-arm-4",
      question: "Känner du stickningar, domningar eller svaghet?",
      type: "text"
    },
    {
      id: "left-arm-5",
      question: "Hur ser din arbets-/träningsställning ut till vardags?",
      type: "text"
    },
    {
      id: "left-arm-6",
      question: "Gör du regelbundet rörlighets-/styrkeövningar för armar och skuldror?",
      type: "text"
    },
    {
      id: "left-arm-7",
      question: "Får du i dig anti-inflammatoriska livsmedel (färgglada grönsaker, omega-3)?",
      type: "text"
    },
    {
      id: "left-arm-8",
      question: "Har du testat värme/kyla eller massage med effekt?",
      type: "text"
    },
    {
      id: "left-arm-9",
      question: "Uppstår smärtan samtidigt som tryck i bröstet eller andfåddhet?",
      type: "text"
    },
    {
      id: "left-arm-10",
      question: "Finns feber, rodnad eller snabb svullnad som kan tyda på infektion?",
      type: "text"
    }
  ],
  "right-leg": [
    {
      id: "right-leg-1",
      question: "Vilken del av benet gör ont – höft, knä, vrist eller hela längden?",
      type: "multiple-choice",
      options: ["Höft", "Knä", "Vrist", "Hela längden"]
    },
    {
      id: "right-leg-2",
      question: "Är smärtan skarp, molande eller brännande?",
      type: "multiple-choice",
      options: ["Skarp", "Molande", "Brännande", "Annat"]
    },
    {
      id: "right-leg-3",
      question: "Utlöses den av gång, löpning, stillasittande eller nattsömn?",
      type: "text"
    },
    {
      id: "right-leg-4",
      question: "Har du noterat svullnad, rodnad eller värmekänsla?",
      type: "text"
    },
    {
      id: "right-leg-5",
      question: "Hur många steg/aktiva minuter får du per dag?",
      type: "text"
    },
    {
      id: "right-leg-6",
      question: "Använder du dämpade skor eller inlägg?",
      type: "text"
    },
    {
      id: "right-leg-7",
      question: "Får du i dig tillräckligt med protein, D-vitamin och kalcium?",
      type: "text"
    },
    {
      id: "right-leg-8",
      question: "Har du testat kollagenpulver, gurkmeja eller anti-inflammatorisk kost?",
      type: "text"
    },
    {
      id: "right-leg-9",
      question: "Känner du domningar, stickningar eller plötslig muskelsvaghet?",
      type: "text"
    },
    {
      id: "right-leg-10",
      question: "Har du haft trauma eller oförklarlig kraftig smärta som försämras snabbt?",
      type: "text"
    }
  ],
  "left-leg": [
    {
      id: "left-leg-1",
      question: "Var på vänster ben sitter besväret – höft, knä, fotled?",
      type: "multiple-choice",
      options: ["Höft", "Knä", "Fotled", "Hela benet"]
    },
    {
      id: "left-leg-2",
      question: "När och hur började smärtan?",
      type: "text"
    },
    {
      id: "left-leg-3",
      question: "Förvärras det av belastning eller vila?",
      type: "text"
    },
    {
      id: "left-leg-4",
      question: "Finns svullnad, rodnad eller ökad värme lokalt?",
      type: "text"
    },
    {
      id: "left-leg-5",
      question: "Hur ser ditt dagliga rörelsemönster ut (sitt-/stå-tid)?",
      type: "text"
    },
    {
      id: "left-leg-6",
      question: "Vilken typ av skor använder du mest?",
      type: "text"
    },
    {
      id: "left-leg-7",
      question: "Intar du polyfenolrika bär, omega-3 eller gurkmeja regelbundet?",
      type: "text"
    },
    {
      id: "left-leg-8",
      question: "Har fysioterapi, stretching eller foam-rolling hjälpt?",
      type: "text"
    },
    {
      id: "left-leg-9",
      question: "Har du domningar, kall extremitet eller pulslös fot?",
      type: "text"
    },
    {
      id: "left-leg-10",
      question: "Har du ramlat eller haft plötslig, kraftig smärta som hindrar belastning?",
      type: "text"
    }
  ]
};
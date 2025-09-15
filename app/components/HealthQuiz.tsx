"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Check, Clock, Activity, Target, Moon, Heart, AlertCircle, Coffee, Brain, Zap, MapPin, Loader2 } from 'lucide-react';
import Image from 'next/image';
import QuizResultScreen from './QuizResultScreen';
import { useLanguage, useT } from '@/app/lib/i18n/LanguageProvider';

interface QuizOption {
  label: string;
  description: string;
  value: string;
  icon: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  icon: string;
  options: QuizOption[];
  allowMultiple?: boolean;
}

const QUIZ_SV: QuizQuestion[] = [
  {
    id: 1,
    question: "Hur skulle du beskriva din nuvarande energinivå?",
    subtitle: "Vi vill förstå hur du känner dig under en typisk dag",
    icon: "⚡",
    options: [
      {
        label: "Hög energi genom hela dagen",
        description: "Jag känner mig pigg och alert från morgon till kväll",
        value: "high_energy",
        icon: "🚀"
      },
      {
        label: "Bra energi men trötthet på eftermiddagen",
        description: "Jag börjar bra men får ofta en energidipp runt lunch",
        value: "afternoon_dip",
        icon: "📈"
      },
      {
        label: "Varierande energi under dagen",
        description: "Vissa dagar är bra, andra känns tunga",
        value: "variable_energy",
        icon: "🎢"
      },
      {
        label: "Låg energi och konstant trötthet",
        description: "Jag känner mig trött och utmattad det mesta av tiden",
        value: "low_energy",
        icon: "😴"
      }
    ]
  },
  {
    id: 2,
    question: "Hur ser din typiska sömn ut?",
    subtitle: "Sömnkvalitet påverkar allt från energi till immunförsvar",
    icon: "🌙",
    options: [
      {
        label: "Utmärkt sömn (7-9 timmar, vaknar utvilad)",
        description: "Jag somnar lätt och vaknar pigg på morgonen",
        value: "excellent_sleep",
        icon: "✨"
      },
      {
        label: "Bra sömn men vaknar ibland under natten",
        description: "Generellt bra men inte alltid djup sömn",
        value: "good_sleep",
        icon: "🌟"
      },
      {
        label: "Svårt att somna eller vaknar ofta",
        description: "Det tar tid att somna eller jag vaknar flera gånger",
        value: "disrupted_sleep",
        icon: "🌀"
      },
      {
        label: "Dålig sömn (för lite eller dålig kvalitet)",
        description: "Jag sover för kort eller vaknar inte utvilad",
        value: "poor_sleep",
        icon: "😵"
      }
    ]
  },
  {
    id: 3,
    question: "Hur hanterar du stress i vardagen?",
    subtitle: "Stress påverkar både fysisk och mental hälsa betydligt",
    icon: "🧠",
    options: [
      {
        label: "Hanterar stress mycket bra",
        description: "Jag har bra strategier och känner mig sällan överväldigad",
        value: "low_stress",
        icon: "🧘"
      },
      {
        label: "Måttlig stress, klarar det mesta",
        description: "Ibland stressig men hittar balans",
        value: "moderate_stress",
        icon: "⚖️"
      },
      {
        label: "Ofta stressad och överväldigad",
        description: "Känner press från jobb, familj eller andra åtaganden",
        value: "high_stress",
        icon: "😰"
      },
      {
        label: "Konstant stress och ångest",
        description: "Jag känner mig nästan alltid stressad eller orolig",
        value: "chronic_stress",
        icon: "🌪️"
      }
    ]
  },
  {
    id: 4,
    question: "Hur ofta tränar du per vecka?",
    subtitle: "Motion är grundläggande för hälsa och välmående",
    icon: "🏃‍♀️",
    options: [
      {
        label: "5+ gånger per vecka",
        description: "Jag tränar regelbundet och motion är en viktig del av min vardag",
        value: "very_active",
        icon: "💪"
      },
      {
        label: "3-4 gånger per vecka",
        description: "Jag tränar regelbundet men inte varje dag",
        value: "active",
        icon: "🏋️"
      },
      {
        label: "1-2 gånger per vecka",
        description: "Jag tränar ibland men skulle vilja göra det mer",
        value: "somewhat_active",
        icon: "🚶"
      },
      {
        label: "Sällan eller aldrig",
        description: "Jag får för lite motion i min vardag",
        value: "sedentary",
        icon: "🛋️"
      }
    ]
  },
  {
    id: 5,
    question: "Hur ser dina matvanor ut?",
    subtitle: "Kosten är grunden för all hälsa och energi",
    icon: "🥗",
    options: [
      {
        label: "Mycket hälsosam och balanserad kost",
        description: "Jag äter varierat med mycket grönsaker, protein och fullkorn",
        value: "excellent_diet",
        icon: "🌱"
      },
      {
        label: "Ganska hälsosam men kan förbättras",
        description: "Jag försöker äta hälsosamt men lyckas inte alltid",
        value: "good_diet",
        icon: "🥙"
      },
      {
        label: "Blandat - vissa måltider hälsosamma",
        description: "Vissa dagar bra, andra mer snabbmat och socker",
        value: "mixed_diet",
        icon: "🍕"
      },
      {
        label: "Ohälsosam kost med mycket processad mat",
        description: "Jag äter ofta snabbmat, socker och processade produkter",
        value: "poor_diet",
        icon: "🍟"
      }
    ]
  },
  {
    id: 6,
    question: "Hur är din mage och matsmältning?",
    subtitle: "Tarmhälsan är central för immunförsvar och välmående",
    icon: "🦠",
    options: [
      {
        label: "Utmärkt - inga problem",
        description: "Min mage mår bra och jag har regelbunden matsmältning",
        value: "excellent_digestion",
        icon: "✅"
      },
      {
        label: "Mest bra med tillfälliga problem",
        description: "Ibland uppblåst eller obekväm efter vissa måltider",
        value: "occasional_issues",
        icon: "🤔"
      },
      {
        label: "Regelbundna magproblem",
        description: "Ofta uppblåst, gaser eller oregelbunden matsmältning",
        value: "frequent_issues",
        icon: "😣"
      },
      {
        label: "Konstanta besvär",
        description: "Dagliga problem med magen, smärta eller discomfort",
        value: "chronic_issues",
        icon: "😖"
      }
    ]
  },
  {
    id: 7,
    question: "Hur ofta blir du sjuk (förkylning, influensa)?",
    subtitle: "Immunförsvaret speglar din allmänna hälsostatus",
    icon: "🛡️",
    options: [
      {
        label: "Sällan eller aldrig sjuk",
        description: "Jag har stark immunitet och blir knappt sjuk",
        value: "strong_immunity",
        icon: "💪"
      },
      {
        label: "1-2 gånger per år",
        description: "Normalt immunförsvar, blir sjuk ibland",
        value: "normal_immunity",
        icon: "🌡️"
      },
      {
        label: "3-4 gånger per år",
        description: "Blir sjuk ganska ofta, särskilt under vintermånaderna",
        value: "frequent_illness",
        icon: "🤧"
      },
      {
        label: "Mycket ofta sjuk",
        description: "Jag verkar fånga upp allt som går omkring",
        value: "weak_immunity",
        icon: "🤒"
      }
    ]
  },
  {
    id: 8,
    question: "Hur är ditt fokus och koncentration?",
    subtitle: "Mental klarhet är viktig för produktivitet och livskvalitet",
    icon: "🎯",
    options: [
      {
        label: "Utmärkt fokus och mental klarhet",
        description: "Jag kan koncentrera mig lätt och tänka klart hela dagen",
        value: "excellent_focus",
        icon: "🔍"
      },
      {
        label: "Bra fokus men trötthet påverkar",
        description: "Generellt bra men svårare när jag är trött",
        value: "good_focus",
        icon: "👁️"
      },
      {
        label: "Svårt att koncentrera sig",
        description: "Jag distraheras lätt och har svårt att fokusera länge",
        value: "poor_focus",
        icon: "🌀"
      },
      {
        label: "Ständig hjärndimma och förvirring",
        description: "Jag känner mig ofta förvirrad och har svårt att tänka klart",
        value: "brain_fog",
        icon: "☁️"
      }
    ]
  },
  {
    id: 9,
    question: "Vilken är din största hälsoutmaning just nu?",
    subtitle: "Vi vill förstå vad som oroar dig mest med din hälsa",
    icon: "⚠️",
    options: [
      {
        label: "Vikthantering",
        description: "Jag vill gå ner eller upp i vikt på ett hälsosamt sätt",
        value: "weight_management",
        icon: "⚖️"
      },
      {
        label: "Energi och trötthet",
        description: "Jag känner mig ofta trött och vill ha mer energi",
        value: "energy_fatigue",
        icon: "🔋"
      },
      {
        label: "Stress och återhämtning",
        description: "Jag behöver bättre stresshantering och vila",
        value: "stress_recovery",
        icon: "🧘"
      },
      {
        label: "Allmän hälsa och prevention",
        description: "Jag vill optimera min hälsa och förebygga sjukdom",
        value: "general_health",
        icon: "🌟"
      }
    ]
  },
  {
    id: 10,
    question: "Vad är ditt huvudsakliga mål med functional food?",
    subtitle: "Slutligen, vad hoppas du uppnå genom förbättrad näring?",
    icon: "🎯",
    options: [
      {
        label: "Mer energi och vitalitet",
        description: "Jag vill känna mig piggare och mer livlig",
        value: "energy_vitality",
        icon: "⚡"
      },
      {
        label: "Bättre immunförsvar",
        description: "Jag vill stärka min motståndskraft mot sjukdomar",
        value: "immunity_boost",
        icon: "🛡️"
      },
      {
        label: "Förbättrad matsmältning",
        description: "Jag vill ha en hälsosammare mage och tarm",
        value: "digestive_health",
        icon: "🦠"
      },
      {
        label: "Mental klarhet och fokus",
        description: "Jag vill tänka klarare och vara mer fokuserad",
        value: "mental_clarity",
        icon: "🧠"
      }
    ]
  },
  {
    id: 10,
    question: "Vilka hälsomål är viktigast för dig?",
    subtitle: "Välj de områden du vill förbättra mest (du kan välja flera)",
    icon: "🎯",
    allowMultiple: true,
    options: [
      {
        label: "Mer energi och mindre trötthet",
        description: "Jag vill känna mig piggare och mer alert",
        value: "energy",
        icon: "⚡"
      },
      {
        label: "Bättre hjärn- och minnesfunktion",
        description: "Förbättra fokus, minne och kognitiva förmågor",
        value: "brain_health",
        icon: "🧠"
      },
      {
        label: "Starkare immunförsvar",
        description: "Bli mindre sjuk och återhämta mig snabbare",
        value: "immune",
        icon: "🛡️"
      },
      {
        label: "Bättre tarm- och maghälsa",
        description: "Förbättra matsmältning och tarmflora",
        value: "gut_health",
        icon: "🦠"
      },
      {
        label: "Anti-aging och longevity",
        description: "Åldras långsammare och må bra längre",
        value: "anti_aging",
        icon: "🌿"
      },
      {
        label: "Bättre hud, hår och naglar",
        description: "Förbättra utseende och hudkvalitet",
        value: "beauty",
        icon: "✨"
      }
    ]
  },
  {
    id: 11,
    question: "Har du några kända näringsbrister?",
    subtitle: "Baserat på blodprover eller symtom du känner igen",
    icon: "🔬",
    options: [
      {
        label: "Vitamin D-brist",
        description: "Låga D-vitamin nivåer eller lite sol",
        value: "vitamin_d",
        icon: "☀️"
      },
      {
        label: "Omega-3 brist",
        description: "Äter sällan fet fisk eller omega-3 källor",
        value: "omega_3",
        icon: "🐟"
      },
      {
        label: "B12-brist",
        description: "Särskilt vanligt för veganer/vegetarianer",
        value: "b12",
        icon: "🥗"
      },
      {
        label: "Järnbrist",
        description: "Känner mig trött, har bleka naglar",
        value: "iron",
        icon: "🩸"
      },
      {
        label: "Magnesiumbrist",
        description: "Muskelkramper, sömnproblem, stress",
        value: "magnesium",
        icon: "💪"
      },
      {
        label: "Inga kända brister",
        description: "Jag har inga kända näringsbrister",
        value: "none",
        icon: "✅"
      }
    ]
  },
  {
    id: 12,
    question: "Tar du några mediciner regelbundet?",
    subtitle: "För att säkerställa att våra rekommendationer är säkra för dig",
    icon: "💊",
    allowMultiple: true,
    options: [
      {
        label: "Blodförtunnande medicin",
        description: "Warfarin, Apixaban, Rivaroxaban eller liknande",
        value: "blood_thinners",
        icon: "🩸"
      },
      {
        label: "Blodtrycksmedicin",
        description: "ACE-hämmare, betablockerare eller liknande",
        value: "blood_pressure",
        icon: "❤️"
      },
      {
        label: "Antidepressiva",
        description: "SSRI, SNRI eller andra antidepressiva",
        value: "antidepressants",
        icon: "🧠"
      },
      {
        label: "Diabetesmedicin",
        description: "Metformin, insulin eller andra diabetesmediciner",
        value: "diabetes",
        icon: "🍯"
      },
      {
        label: "Sköldkörtelmedicin",
        description: "Levaxin eller andra sköldkörtelhormon",
        value: "thyroid",
        icon: "🦋"
      },
      {
        label: "Inga mediciner",
        description: "Jag tar inga receptbelagda mediciner",
        value: "none",
        icon: "✅"
      }
    ]
  }
];

const QUIZ_EN: QuizQuestion[] = [
  { id: 1, question: "How would you describe your current energy level?", subtitle: "We want to understand how you feel on a typical day", icon: "⚡", options: [
    { label: "High energy throughout the day", description: "I feel alert from morning to evening", value: "high_energy", icon: "🚀" },
    { label: "Good energy but afternoon dip", description: "I start well but often dip around lunch", value: "afternoon_dip", icon: "📈" },
    { label: "Variable energy during the day", description: "Some days are great, others feel heavy", value: "variable_energy", icon: "🎢" },
    { label: "Low energy and constant fatigue", description: "I feel tired most of the time", value: "low_energy", icon: "😴" }
  ]},
  { id: 2, question: "What does your typical sleep look like?", subtitle: "Sleep quality affects everything from energy to immunity", icon: "🌙", options: [
    { label: "Excellent sleep (7‑9h, wake up refreshed)", description: "I fall asleep easily and wake up refreshed", value: "excellent_sleep", icon: "✨" },
    { label: "Good sleep but sometimes wake up", description: "Generally good but not always deep", value: "good_sleep", icon: "🌟" },
    { label: "Hard to fall asleep / wake often", description: "It takes time to fall asleep or I wake up several times", value: "disrupted_sleep", icon: "🌀" },
    { label: "Poor sleep (too little or poor quality)", description: "I sleep too little or wake not refreshed", value: "poor_sleep", icon: "😵" }
  ]},
  // keep it short: reuse SV texts beyond first two if needed
  ...QUIZ_SV.slice(3)
];

const QUIZ_ES: QuizQuestion[] = [
  ...QUIZ_EN
] as QuizQuestion[];
const QUIZ_DE: QuizQuestion[] = [
  ...QUIZ_EN
] as QuizQuestion[];
const QUIZ_FR: QuizQuestion[] = [
  ...QUIZ_EN
] as QuizQuestion[];

interface HealthQuizProps {
  onComplete?: (answers: Record<number, string | string[]>, context?: any) => void;
  onClose?: () => void;
}

const HealthQuiz: React.FC<HealthQuizProps> = ({ onComplete, onClose }) => {
  const { locale } = useLanguage();
  const t = useT();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'intro' | 'location' | 'quiz' | 'result'>('quiz');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [formError, setFormError] = useState('');
  const [locationConsent, setLocationConsent] = useState<boolean | null>(null);
  const [locationContext, setLocationContext] = useState<any>(null);
  const [loadingContext, setLoadingContext] = useState(false);
  const quizQuestions: QuizQuestion[] = locale === 'en' ? QUIZ_EN : locale === 'es' ? QUIZ_ES : locale === 'de' ? QUIZ_DE : locale === 'fr' ? QUIZ_FR : QUIZ_SV;
  const STORAGE_KEY = `health_test_state_v3_${locale}`;
  // Restore autosaved state
  useEffect(() => {
    // Clean up old versions
    try {
      localStorage.removeItem(`health_test_state_v1_${locale}`);
      localStorage.removeItem(`health_test_state_v2_${locale}`);
      localStorage.removeItem(`quiz_state_v1_${locale}`);
    } catch {}
    
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { step: 'welcome'|'intro'|'location'|'quiz'|'result'; q: number; a: Record<number,string>; locationConsent?: boolean; locationContext?: any };
      if (saved && typeof saved.q === 'number' && saved.a) {
        setCurrentStep((saved.step as any) || 'quiz');
        setCurrentQuestion(saved.q);
        setAnswers(saved.a);
        if (saved.locationConsent !== undefined) setLocationConsent(saved.locationConsent);
        if (saved.locationContext) setLocationContext(saved.locationContext);
      }
      // restore identity if available
      const idRaw = localStorage.getItem('health_test_identity_v2');
      if (idRaw) {
        const id = JSON.parse(idRaw) as { firstName?: string; email?: string; consent?: boolean };
        setFirstName(id.firstName || '');
        setEmail(id.email || '');
        setConsent(!!id.consent);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STORAGE_KEY]);
  // Persist state
  useEffect(() => {
    try {
      const payload = JSON.stringify({ step: currentStep, q: currentQuestion, a: answers, locationConsent, locationContext });
      localStorage.setItem(STORAGE_KEY, payload);
    } catch {}
  }, [currentStep, currentQuestion, answers, locationConsent, locationContext, STORAGE_KEY]);

  const validateEmail = (val: string) => /[^@\s]+@[^@\s]+\.[^@\s]+/.test(val);
  const startQuiz = () => {
    // Identity is optional. Only validate email if provided.
    const trimmedFirstName = firstName.trim();
    const trimmedEmail = email.trim();
    const hasEmail = trimmedEmail.length > 0;

    if (hasEmail && !validateEmail(trimmedEmail)) {
      setFormError('Ange en giltig e‑postadress eller lämna fältet tomt.');
      return;
    }

    setFormError('');

    // Store identity only if something meaningful provided
    try {
      if (trimmedFirstName || hasEmail) {
        localStorage.setItem('health_test_identity_v2', JSON.stringify({ firstName: trimmedFirstName, email: hasEmail ? trimmedEmail : '', consent: !!consent }));
      }
    } catch {}

    setCurrentStep('intro');
  };

  const handleLocationConsent = async (consent: boolean) => {
    setLocationConsent(consent);
    if (consent) {
      setLoadingContext(true);
      try {
        // Get location
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 min cache
          });
        });
        
        // Fetch context
        const response = await fetch('/api/healthquiz/context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            radiusMeters: 2000
          })
        });
        
        // Also fetch enhanced context with safety and research data
        const enhancedResponse = await fetch('/api/healthquiz/enhanced-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            medications: Array.isArray(answers[11]) ? answers[11].filter(m => m !== 'none') : [],
            healthGoals: Array.isArray(answers[9]) ? answers[9] : []
          })
        });
        
        if (response.ok) {
          const context = await response.json();
          const enhancedContext = enhancedResponse.ok ? await enhancedResponse.json() : null;
          
          setLocationContext({
            ...context,
            enhanced: enhancedContext
          });
        }
      } catch (error) {
        console.error('Location/context error:', error);
        // Continue without context
      } finally {
        setLoadingContext(false);
      }
    }
    setCurrentStep('quiz');
  };

  const handleAnswer = (answer: string) => {
    const isMultiSelect = !!quizQuestions[currentQuestion]?.allowMultiple;
    
    let newAnswers;
    if (isMultiSelect) {
      const currentAnswers = Array.isArray(answers[currentQuestion]) ? answers[currentQuestion] as string[] : [];
      const updatedAnswers = currentAnswers.includes(answer)
        ? currentAnswers.filter(a => a !== answer)
        : [...currentAnswers, answer];
      
      newAnswers = {
        ...answers,
        [currentQuestion]: updatedAnswers
      };
      setAnswers(newAnswers);
      return; // Don't auto-advance for multi-select
    } else {
      newAnswers = {
        ...answers,
        [currentQuestion]: answer
      };
      setAnswers(newAnswers);
    }

    setIsAnimating(true);
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setCurrentStep('result');
        onComplete?.(newAnswers, locationContext);
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleMultiSelectNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentStep('result');
      onComplete?.(answers, locationContext);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  };
  const skipQuestion = () => {
    if (quizQuestions[currentQuestion]?.allowMultiple) {
      // For multi-select, skipping means record empty array and advance
      setAnswers({ ...answers, [currentQuestion]: [] });
      handleMultiSelectNext();
    } else {
      handleAnswer('skipped');
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const resetQuiz = () => {
    setCurrentStep('welcome');
    setCurrentQuestion(0);
    setAnswers({});
    setLocationConsent(null);
    setLocationContext(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const question = quizQuestions[currentQuestion];

  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-20 left-20 w-96 h-96 bg-accent/20 rounded-full filter blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto relative z-10"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left side - Content */}
              <div className="p-12 md:p-16 order-2 lg:order-1 flex flex-col justify-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-12"
                >
                  <h1 className="text-4xl md:text-6xl font-light mb-6 text-gray-800 leading-tight">
                    Ditt personliga
                    <span className="text-primary font-bold block">HÄLSOTEST</span>
                  </h1>
                  <p className="text-xl text-gray-600 mb-8">
                    2 minuter till bättre hälsa
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="space-y-6 mb-12"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">🎯</div>
                    <span className="text-lg text-gray-700">Personliga råd</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">🧬</div>
                    <span className="text-lg text-gray-700">Vetenskaplig grund</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">⚡</div>
                    <span className="text-lg text-gray-700">Snabbt resultat</span>
                  </div>
                </motion.div>

                <div className="space-y-6">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    type="button"
                    onClick={() => { console.log('Start health test clicked (click)'); startQuiz(); }}
                    onMouseDown={() => { console.log('Start health test clicked (mousedown)'); startQuiz(); }}
                    onTouchStart={() => { console.log('Start health test clicked (touchstart)'); startQuiz(); }}
                    className="w-full bg-primary text-white px-8 py-6 rounded-full font-bold text-xl hover:bg-secondary transition-all duration-300 inline-flex items-center justify-center gap-3 relative z-10 pointer-events-auto shadow-xl"
                  >
                    <span>Starta hälsotestet</span>
                    <ChevronRight className="w-6 h-6" />
                  </motion.button>
                  
                  <div className="space-y-4">
                    <input 
                      value={firstName} 
                      onChange={e=>setFirstName(e.target.value)} 
                      placeholder="Namn (frivilligt)" 
                      className="w-full px-6 py-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:border-primary transition-colors" 
                    />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e=>setEmail(e.target.value)} 
                      placeholder="E-post (frivilligt)" 
                      className="w-full px-6 py-4 border border-gray-200 rounded-xl text-lg focus:outline-none focus:border-primary transition-colors" 
                    />
                  </div>
                  
                  {formError && <div className="text-sm text-red-600 mt-2">{formError}</div>}
                  
                  <p className="text-gray-500 text-center text-sm">Kostnadsfritt • Inga mejl krävs</p>
                </div>
              </div>

              {/* Right side - Ulrika's image */}
              <div className="relative p-8 md:p-12 order-1 lg:order-2 bg-background">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="relative"
                >
                  {/* Organic shape frame */}
                  <div 
                    className="absolute inset-0 bg-primary shadow-2xl"
                    style={{
                      clipPath: "polygon(30% 0%, 70% 0%, 100% 20%, 100% 70%, 80% 100%, 20% 100%, 0% 80%, 0% 30%)",
                      transform: "scale(1.05)"
                    }}
                  />
                  
                  {/* Image container with organic shape */}
                  <div 
                    className="relative overflow-hidden"
                    style={{
                      clipPath: "polygon(30% 0%, 70% 0%, 100% 20%, 100% 70%, 80% 100%, 20% 100%, 0% 80%, 0% 30%)"
                    }}
                  >
                    <Image 
                      src="/Ulrika_portratt/Ulrika3.jpg" 
                      alt="Ulrika Davidsson"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                      priority
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-green-600/20 to-transparent" />
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-4 cursor-default"
                  >
                    <p className="text-sm font-semibold text-gray-800">Ulrika Davidsson</p>
                    <p className="text-xs text-gray-600">"Bästa kursen jag har gått - Lisa J"</p>
                  </motion.div>


                  
                  {/* Additional floating decorative elements */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="absolute top-1/2 -right-8 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full filter blur-xl"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    className="absolute -bottom-8 left-1/3 w-20 h-20 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full filter blur-xl"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'intro') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{firstName ? `Hej ${firstName}!` : t('quiz.hello','Hej!')}</h2>
          <p className="text-gray-700 mb-6">{t('quiz.intro','Vad roligt att du vill göra vårt hälso‑quiz. Nu sätter vi igång!')}</p>
                          <button onClick={()=>setCurrentStep('location')} className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-secondary transition">{t('healthtest.startNow','Starta nu')}</button>
        </div>
      </div>
    );
  }

  if (currentStep === 'location') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F9F6F0]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="px-8 py-12 md:px-16">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-[#93C560]/20 rounded-full mb-6">
                <MapPin className="w-10 h-10 text-[#014421]" />
              </div>
              <h2 className="text-3xl font-bold text-[#014421] mb-4">
                {t('healthtest.locationTitle', 'Anpassa för din plats')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('healthtest.locationText', 'Vi kan ge dig bättre träningsråd om vi vet var du befinner dig. Vi använder platsen för att hitta väder, luftkvalitet och träningsplatser nära dig.')}
              </p>
              
              {loadingContext ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-[#014421]" />
                  <span className="ml-3 text-gray-600">{t('healthtest.fetchingData', 'Hämtar lokal information...')}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => handleLocationConsent(true)}
                    className="w-full bg-[#014421] text-white py-4 px-6 rounded-xl font-medium hover:bg-[#025830] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    <MapPin className="w-5 h-5" />
                    {t('healthtest.allowLocation', 'Tillåt platsåtkomst')}
                  </button>
                  
                  <button
                    onClick={() => handleLocationConsent(false)}
                    className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all"
                  >
                    {t('healthtest.skipLocation', 'Hoppa över')}
                  </button>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-6">
                {t('healthtest.locationPrivacy', 'Din plats sparas endast under testet och raderas efteråt.')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'quiz') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full h-full flex flex-col bg-white/80 backdrop-blur-xl lg:max-w-7xl lg:h-auto lg:max-h-[98vh] lg:rounded-3xl lg:shadow-2xl lg:my-2 lg:border lg:border-white/50 relative"
        >
          {/* Header - Smaller and more compact */}
          <div className="p-3 sm:p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm lg:rounded-t-3xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm text-gray-600 font-medium">
                {t('quiz.progress','Fråga')} {currentQuestion + 1} {t('quiz.of','av')} {quizQuestions.length}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                                      className="bg-primary h-full rounded-full shadow-sm"
              />
            </div>
          </div>

          {/* Question Content - Optimized for mobile */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col p-3 sm:p-4 lg:p-6 overflow-hidden"
            >
              {/* Question Header - More compact */}
              <div className="text-center mb-4 sm:mb-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="text-3xl sm:text-4xl mb-2 sm:mb-3"
                >
                  {question.icon}
                </motion.div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-1 px-2">
                  {question.question}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 px-2">
                  {question.subtitle}
                </p>
              </div>

              {/* Options Grid - Responsive layout without scrolling */}
              <div className="flex-1 flex items-center justify-center" role="radiogroup" aria-label={t('quiz.question','Fråga')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-4xl">
                  {question.options.map((option: QuizOption, index: number) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option.value)}
                      className={`relative p-2.5 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left group overflow-hidden ${
                        (() => {
                          const isMultiSelect = !!quizQuestions[currentQuestion]?.allowMultiple;
                          const isSelected = isMultiSelect 
                            ? Array.isArray(answers[currentQuestion]) && (answers[currentQuestion] as string[]).includes(option.value)
                            : answers[currentQuestion] === option.value;
                          return isSelected
                            ? 'border-primary bg-background shadow-lg transform scale-[1.02]'
                            : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-primary hover:shadow-md';
                        })()
                      }`}
                      role={quizQuestions[currentQuestion]?.allowMultiple ? "checkbox" : "radio"}
                      aria-checked={(() => {
                        const isMultiSelect = !!quizQuestions[currentQuestion]?.allowMultiple;
                        return isMultiSelect 
                          ? Array.isArray(answers[currentQuestion]) && (answers[currentQuestion] as string[]).includes(option.value)
                          : answers[currentQuestion] === option.value;
                      })()}
                      aria-label={option.label}
                    >
                      {/* Hover gradient effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-green-50/0 via-green-100/0 to-green-200/0 group-hover:from-green-50/40 group-hover:via-green-100/40 group-hover:to-green-200/40 transition-all duration-300 ${
                        answers[currentQuestion] === option.value ? 'opacity-0' : ''
                      }`} />
                      
                      {/* Selected indicator */}
                      {(() => {
                        const isMultiSelect = !!quizQuestions[currentQuestion]?.allowMultiple;
                        const isSelected = isMultiSelect 
                          ? Array.isArray(answers[currentQuestion]) && (answers[currentQuestion] as string[]).includes(option.value)
                          : answers[currentQuestion] === option.value;
                        return isSelected && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg"
                          >
                            <Check className="w-3.5 h-3.5 text-white" />
                          </motion.div>
                        );
                      })()}
                      
                      <div className="flex items-start space-x-2.5 relative z-10">
                        <motion.div 
                          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                          className="text-lg sm:text-2xl flex-shrink-0"
                        >
                          {option.icon}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm sm:text-base leading-tight transition-colors ${
                            answers[currentQuestion] === option.value ? 'text-secondary' : 'text-gray-800'
                          }`}>
                            {option.label}
                          </div>
                          <div className={`text-xs leading-relaxed hidden sm:block mt-0.5 transition-colors ${
                            answers[currentQuestion] === option.value ? 'text-secondary' : 'text-gray-600'
                          }`}>
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Multi-select next button */}
              {quizQuestions[currentQuestion]?.allowMultiple && (
                <div className="mt-6">
                  <button
                    onClick={handleMultiSelectNext}
                    disabled={!Array.isArray(answers[currentQuestion]) || (answers[currentQuestion] as string[]).length === 0}
                    className="w-full bg-[#014421] text-white py-4 px-6 rounded-xl font-medium hover:bg-[#025830] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {t('healthtest.continue', 'Fortsätt')} 
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                      {Array.isArray(answers[currentQuestion]) ? (answers[currentQuestion] as string[]).length : 0} valda
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {t('healthtest.multiSelectHint', 'Du kan välja flera alternativ som passar dig')}
                  </p>
                </div>
              )}

              {/* Navigation - Compact and fixed at bottom */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                {currentQuestion > 0 ? (
                  <motion.button
                    whileHover={{ x: -3 }}
                    onClick={goToPrevious}
                    className="flex items-center space-x-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                    >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>{t('quiz.back','Tillbaka')}</span>
                  </motion.button>
                ) : (
                  <div />
                )}
                <div className="text-xs sm:text-sm text-gray-500 text-center">
                  {currentQuestion === quizQuestions.length - 1 ? t('quiz.last','Sista frågan!') : t('quiz.choose','Välj ett alternativ')}
                </div>
                <button onClick={skipQuestion} className="text-xs sm:text-sm text-primary hover:text-secondary font-medium">{t('quiz.skip','Hoppa över')}</button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // Result state
  return (
    <QuizResultScreen 
      quizData={answers}
      contextData={locationContext}
      onRestart={resetQuiz}
    />
  );
};

export default HealthQuiz; 
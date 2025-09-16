"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertCircle, Brain, Check, ChevronLeft, ChevronRight, Clock, Coffee, Fish, Heart, Leaf, Loader2, MapPin, Microscope, Moon, Rocket, Salad, Shield, Sparkles, Sprout, Star, Sun, Target, X, Zap, TrendingUp, Waves, Frown, User, Flame, Apple, Dumbbell, RotateCcw, CheckCircle, Scale, Wind, Dumbbell as WeightIcon, Sofa, Eye, Cloud, BarChart3, Thermometer, HelpCircle, Smile, Meh, Frown as SadFrown, AlertTriangle, Pizza, Sandwich } from "lucide-react";;
import Image from 'next/image';
import QuizResultScreen from './QuizResultScreen';
import { useLanguage, useT } from '@/app/lib/i18n/LanguageProvider';

// Icon mapping for quiz emojis
const iconMap: Record<string, any> = {
  "⚡": Zap,
  "🚀": Rocket,
  "📈": TrendingUp,
  "🎢": Waves,
  "😴": Moon,
  "🌙": Moon,
  "✨": Sparkles,
  "🌟": Star,
  "🌀": RotateCcw,
  "😵": Frown,
  "🧠": Brain,
  "🧘": User,
  "😰": AlertCircle,
  "🏃‍♀️": Activity,
  "🏃": Activity,
  "💪": Dumbbell,
  "🥗": Salad,
  "🎯": Target,
  "🔥": Flame,
  "🍎": Apple,
  "✅": CheckCircle,
  "❌": X,
  "🎊": Sparkles,
  "🥑": Apple,
  "🥕": Apple,
  "🌱": Sprout,
  "💚": Heart,
  "❤️": Heart,
  "🍃": Leaf,
  "🌿": Leaf,
  "🧬": Microscope,
  "🔬": Microscope,
  "🌞": Sun,
  "☀️": Sun,
  "💤": Moon,
  "⚖️": Scale,
  "🌪️": Wind,
  "🏋️": WeightIcon,
  "🛋️": Sofa,
  "🛡️": Shield,
  "🌡️": Thermometer,
  "👁️": Eye,
  "☁️": Cloud,
  "⚠️": AlertCircle,
  "📊": BarChart3,
  "🤔": HelpCircle,
  "😊": Smile,
  "😣": Meh,
  "😖": SadFrown,
  "🥙": Sandwich,
  "🍕": Pizza
};

// Component to render icon instead of emoji
const QuizIcon: React.FC<{ emoji: string; className?: string }> = ({ emoji, className = "w-5 h-5" }) => {
  const IconComponent = iconMap[emoji];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  // Log missing emojis to help debug
  console.warn(`Missing icon mapping for emoji: "${emoji}"`);
  return <AlertCircle className={className} />; // Fallback to alert icon instead of emoji
};

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
        label: "Bättre hormonell balans",
        description: "Balansera hormoner för bättre välmående",
        value: "hormonal_balance",
        icon: "⚖️"
      },
      {
        label: "Stabilisera mitt blodsocker",
        description: "Få mer stabil energi och mindre socker-dips",
        value: "blood_sugar",
        icon: "📊"
      }
    ]
  },
  {
    id: 11,
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
        label: "Medicin för mage och tarm",
        description: "Protonpumpshämmare, antacida eller liknande",
        value: "stomach_intestinal",
        icon: "🫄"
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
      if (!raw) {
        // No saved state, start fresh at quiz
        setCurrentStep('quiz');
        return;
      }
      const saved = JSON.parse(raw) as { step: 'welcome'|'intro'|'location'|'quiz'|'result'; q: number; a: Record<number,string>; locationConsent?: boolean; locationContext?: any };
      if (saved && typeof saved.q === 'number' && saved.a) {
        // Always start directly at quiz, ignore saved step
        setCurrentStep('quiz');
        setCurrentQuestion(saved.q);
        setAnswers(saved.a);
        if (saved.locationConsent !== undefined) setLocationConsent(saved.locationConsent);
        if (saved.locationContext) setLocationContext(saved.locationContext);
      } else {
        // Invalid saved state, start fresh at quiz
        setCurrentStep('quiz');
      }
      // restore identity if available
      const idRaw = localStorage.getItem('health_test_identity_v2');
      if (idRaw) {
        const id = JSON.parse(idRaw) as { firstName?: string; email?: string; consent?: boolean };
        setFirstName(id.firstName || '');
        setEmail(id.email || '');
        setConsent(!!id.consent);
      }
    } catch {
      // Error reading localStorage, start fresh at quiz
      setCurrentStep('quiz');
    }
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

    setCurrentStep('quiz');
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

  // Skip welcome and intro steps - go directly to quiz

  // Skip location step too - go directly to quiz

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
                  className="mb-2 sm:mb-3 text-primary"
                >
                  <QuizIcon emoji={question.icon} className="w-8 h-8 sm:w-10 sm:h-10" />
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
                          className="flex-shrink-0 text-primary"
                        >
                          <QuizIcon emoji={option.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
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
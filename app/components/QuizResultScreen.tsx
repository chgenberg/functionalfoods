"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GiFruitBowl, GiMeal, GiMeat, GiGrainBundle, GiMilkCarton, GiWheat, GiCoffeeCup, GiChocolateBar, GiSaltShaker } from 'react-icons/gi';
import { Activity, AlertCircle, BookOpen, Brain, CheckCircle, ChevronRight, Clock, Coffee, Flower, Heart, Lightbulb, Loader2, Mail, MapPin, Microscope, Moon, RefreshCw, Rocket, Salad, Shield, ShoppingCart, Sprout, Star, Sun, Target, TrendingUp, Wind, Zap } from "lucide-react";;
import Link from 'next/link';
import { useT, useLanguage } from '@/app/lib/i18n/LanguageProvider';
import LoadingAnalysis from './LoadingAnalysis';
import RadarChart from './RadarChart';
import FunctionalFoodsOverview from './FunctionalFoodsOverview';

interface QuizResultData {
  profile: string;
  recommendations: Array<{
    title: string;
    description: string;
    howToUse: string;
  }>;
  lifestyleAdvice: string[];
  nextSteps: string[];
  scientificReferences: string[];
  warningSignals: string[];
  successMetrics: string[];
  courseRecommendation: string;
  priorityAreas?: Array<{
    area: string;
    description: string;
    suggestions: string[];
  }>;
  functionalFoods?: Array<{
    name: string;
    benefits: string[];
    timing: string;
    dosage: string;
  }>;
}

interface HealthScores {
  energi: number;
  sömn: number;
  stress: number;
  kost: number;
  motion: number;
}

interface QuizResultScreenProps {
  quizData: Record<number, string | string[]> | {
    symptoms: Array<{ symptom: string; severity: number }>;
    recommendations: Array<{
      nutrient: string;
      description: string;
      foods: string[];
      supplements: string;
    }>;
    quickWins: Array<{
      icon: string;
      title: string;
      description: string;
      emoji: string;
    }>;
  };
  contextData?: any;
  onRestart: () => void;
}

const QuizResultScreen: React.FC<QuizResultScreenProps> = ({ quizData, contextData, onRestart }) => {
  const t = useT();
  const { locale } = useLanguage();
  const [recommendations, setRecommendations] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('course');
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [showOverview, setShowOverview] = useState(true);
  const [healthScores, setHealthScores] = useState<HealthScores>({
    energi: 7,
    sömn: 6,
    stress: 6,
    kost: 7,
    motion: 5
  });

  const [aiReport, setAiReport] = useState<any>(null);
  const [loadingAiReport, setLoadingAiReport] = useState(false);

  // Checklist (autosave) per domän – must be declared before any early returns
  const checklistKey = 'quiz_checklist_v1';
  const [checklist, setChecklist] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem(checklistKey) || '{}'); } catch { return {}; }
  });
  useEffect(()=>{
    try { localStorage.setItem(checklistKey, JSON.stringify(checklist)); } catch {}
  }, [checklist]);
  const toggleCheck = (id: string) => setChecklist(prev => ({ ...prev, [id]: !prev[id] }));

  // Type guard to check if quizData is quiz answers or result data
  const isQuizAnswers = (data: any): data is Record<number, string> => {
    return typeof data === 'object' && !('symptoms' in data);
  };

  const calculateHealthScores = (data: Record<number, string>): HealthScores => {
    const scores: HealthScores = {
      energi: 7,
      sömn: 6,
      stress: 6,
      kost: 7,
      motion: 5
    };

    // Map quiz answers to scores
    if (data[0] === 'high_energy') scores.energi = 8;
    else if (data[0] === 'low_energy') scores.energi = 3;
    else if (data[0] === 'afternoon_dip') scores.energi = 5;

    if (data[1] === 'excellent_sleep') scores.sömn = 9;
    else if (data[1] === 'poor_sleep') scores.sömn = 3;
    else if (data[1] === 'good_sleep') scores.sömn = 7;

    if (data[2] === 'low_stress') scores.stress = 8;
    else if (data[2] === 'chronic_stress') scores.stress = 3;
    else if (data[2] === 'moderate_stress') scores.stress = 5;

    if (data[3] === 'very_active') scores.motion = 8;
    else if (data[3] === 'sedentary') scores.motion = 3;
    else if (data[3] === 'active') scores.motion = 6;

    if (data[4] === 'excellent_diet') scores.kost = 8;
    else if (data[4] === 'poor_diet') scores.kost = 3;
    else if (data[4] === 'good_diet') scores.kost = 6;

    return scores;
  };

  const calculateTotalScore = (): number => {
    const total = Object.values(healthScores).reduce((sum, score) => sum + score, 0);
    return Math.round((total / 50) * 100);
  };

  // Very lightweight translation shim for product strings
  const translateToSwedish = (text: string): string => {
    if (!text) return text;
    const map: Record<string, string> = {
      'omega-3': 'omega‑3',
      'fish oil': 'fiskolja',
      'chia seeds': 'chiafrön',
      'flaxseed': 'linfrö',
      'walnuts': 'valnötter',
      'almonds': 'mandlar',
      'b-vitamins': 'B‑vitaminer',
      'collagen': 'kollagen',
      'probiotic': 'probiotika',
      'prebiotic': 'prebiotika',
      'green tea': 'grönt te',
      'dark chocolate': 'mörk choklad'
    };
    let out = text;
    Object.entries(map).forEach(([en, sv]) => {
      const re = new RegExp(en, 'gi');
      out = out.replace(re, sv);
    });
    return out;
  };

  // Generate personalized Functional Flow recommendation based on user's answers
  const generatePersonalizedCourseRecommendation = (answers: Record<number, string | string[]>): string => {
    const healthGoals = Array.isArray(answers[10]) ? (answers[10] as string[]) : [answers[10]].filter(Boolean);
    const energyLevel = answers[1];
    const sleepQuality = answers[2];
    const stressLevel = answers[3];
    
    let recommendation = "Baserat på dina svar rekommenderar vi starkt vår <strong>Functional Flow</strong> kurs. ";
    
    // Personalize based on specific answers
    if (energyLevel === 'low_energy' || energyLevel === 'afternoon_dip') {
      recommendation += "Din energisituation visar att du skulle ha stor nytta av att lära dig om energigivande functional foods och hur du kan optimera din kost för stabil energi genom dagen. ";
    }
    
    if (sleepQuality === 'poor_sleep' || sleepQuality === 'disrupted_sleep') {
      recommendation += "Med dina sömnutmaningar kommer kursen att lära dig vilka functional foods som kan förbättra sömnkvaliteten naturligt. ";
    }
    
    if (stressLevel === 'high_stress' || stressLevel === 'moderate_stress') {
      recommendation += "För att hantera stress kommer du att lära dig om adaptogener och andra stressreducerande functional foods. ";
    }
    
    // Add specific benefits based on health goals
    if (healthGoals.includes('energy')) {
      recommendation += "Kursen innehåller specifika moduler om energioptimering genom kost. ";
    }
    
    if (healthGoals.includes('gut_health')) {
      recommendation += "Du kommer att få djup kunskap om probiotika, prebiotika och tarmhälsa. ";
    }
    
    if (healthGoals.includes('immune')) {
      recommendation += "Kursen täcker immunstärkande functional foods och hur du bygger upp ditt naturliga försvar. ";
    }
    
    if (healthGoals.includes('hormonal_balance')) {
      recommendation += "Vi går igenom functional foods som stödjer hormonell balans och endokrin hälsa. ";
    }
    
    if (healthGoals.includes('blood_sugar')) {
      recommendation += "Du kommer att lära dig om blodsocker-stabiliserande functional foods och måltidstiming. ";
    }
    
    if (healthGoals.includes('anti_aging')) {
      recommendation += "Kursen inkluderar omfattande information om anti-aging functional foods och longevity. ";
    }
    
    recommendation += "\n\n<strong>Functional Flow</strong> är vår mest omfattande kurs som ger dig verktyg för att transformera din hälsa genom vetenskap-baserad nutrition och functional foods. Du får tillgång till personliga måltidsplaner, veckovisa inköpslistor, community-support och direktkontakt med våra experter.";
    
    return recommendation;
  };


  useEffect(() => {
    const fetchRecommendations = async () => {
      // Show loading for at least 8 seconds for better UX, not too long
      const minLoadingTime = 8000;
      const startTime = Date.now();

      // Define fallback data
      const fallbackData = {
        profile: "Baserat på dina svar verkar du ha en aktiv livsstil med goda vanor. Det finns dock några områden där vi kan optimera din hälsa ytterligare genom rätt functional foods.",
        recommendations: [
          {
            title: "Magnesium för bättre återhämtning",
            description: "Magnesium hjälper med muskelåterhämtning och sömnkvalitet",
            howToUse: "Ta 200-400mg magnesiumcitrat 1 timme före sänggåendet"
          },
          {
            title: "Omega-3 för hjärnhälsa",
            description: "Omega-3 fettsyror stödjer kognitiv funktion och minskar inflammation",
            howToUse: "Ät fet fisk 2-3 gånger per vecka eller ta fiskolja 1000mg dagligen"
          },
          {
            title: "Probiotika för maghälsa",
            description: "Probiotika stödjer en hälsosam tarmflora och immunförsvar",
            howToUse: "Ta en högkvalitativ probiotika med minst 10 miljarder CFU dagligen"
          }
        ],
        lifestyleAdvice: [
          "Drick 2-3 liter vatten dagligen för optimal hydration",
          "Inkludera 30 minuters rörelse i din dagliga rutin",
          "Prioritera 7-9 timmars sömn varje natt",
          "Ät en färgglad kost med mycket grönsaker och frukt"
        ],
        nextSteps: [
          "Börja med att implementera en functional food i taget",
          "Håll en hälsodagbok för att spåra förändringar",
          "Konsultera en läkare innan du börjar med nya kosttillskott",
          "Överväg att gå vår Functional Basics kurs för djupare kunskap"
        ],
        scientificReferences: [
          "Studier visar att magnesium kan förbättra sömnkvalitet med 23%",
          "Omega-3 forskning indikerar förbättrad kognitiv funktion inom 4-6 veckor",
          "Probiotika studier visar stärkt immunförsvar och bättre tarmhälsa"
        ],
        warningSignals: [
          "Kontakta läkare om du upplever ihållande trötthet trots förbättringar",
          "Sök medicinsk hjälp vid allergiska reaktioner mot kosttillskott",
          "Konsultera vårdpersonal innan du ändrar medicineringar"
        ],
        successMetrics: [
          "Mät energinivåer dagligen på skala 1-10",
          "Spåra sömnkvalitet och tid till insomnande",
          "Notera förändringar i humör och välbefinnande",
          "Bedöm matsmältning och allmän hälsa veckovis"
        ],
        courseRecommendation: generatePersonalizedCourseRecommendation(quizData as Record<number, string | string[]>)
      };

      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/quiz-results?v=${Date.now()}`, {
          method: 'POST',
          headers,
          cache: 'no-store',
          body: JSON.stringify({ answers: quizData }),
        });

        if (!response.ok) {
          console.warn(`Quiz results API failed: ${response.status}, using fallback data`);
          setRecommendations(fallbackData);
        } else {
          try {
            const data = await response.json();
            setRecommendations(data.results || fallbackData);
          } catch (parseError) {
            console.error('Error parsing quiz results:', parseError);
            setRecommendations(fallbackData);
          }
        }
        
        // Calculate health scores only if we have quiz answers
        if (isQuizAnswers(quizData)) {
          const calculatedScores = calculateHealthScores(quizData);
          setHealthScores(calculatedScores);
        }
        
        // Wait for minimum loading time
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        setTimeout(() => {
          setLoading(false);
        }, remainingTime);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setError('Kunde inte hämta rekommendationer. Försök igen senare.');
        setLoading(false);
      }
    };

    fetchRecommendations();
    
  }, [quizData, contextData]);

  if (loading) {
    const answeredCount = isQuizAnswers(quizData) ? Object.keys(quizData).length : 10;
    const adaptiveMs = answeredCount < 5 ? 20000 : answeredCount < 8 ? 30000 : 45000;
    return <LoadingAnalysis totalMs={adaptiveMs} />;
  }

  if (error) {
    return (
      <div className="w-full bg-gradient-to-br from-red-50 to-orange-50 py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto text-center"
        >
          <div className="mb-4 text-red-500 flex justify-center">
            <AlertCircle className="w-16 h-16" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Något gick fel</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onRestart}
                            className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-secondary transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Försök igen
          </button>
        </motion.div>
      </div>
    );
  }

  const totalScore = calculateTotalScore();
  
  const getScoreMessage = (score: number) => {
    if (score >= 80) return { text: "Utmärkt! Du är på rätt väg!", icon: Star, color: "text-primary" };
    if (score >= 60) return { text: "Bra! Det finns potential för förbättring", icon: Zap, color: "text-blue-600" };
    if (score >= 40) return { text: "Okej start! Låt oss förbättra din hälsa", icon: Sprout, color: "text-yellow-600" };
    return { text: "Tid för förändring! Vi hjälper dig", icon: Rocket, color: "text-orange-600" };
  };

  const scoreMessage = getScoreMessage(totalScore);

  const tabs = [
    { id: 'course', label: 'Kursrekommendation', icon: BookOpen },
    ...(contextData ? [{ id: 'context', label: 'Din plats', icon: MapPin }] : []),
    ...(contextData?.enhanced?.safety?.warnings?.length > 0 ? [{ id: 'safety', label: 'Säkerhet', icon: Shield }] : []),
    { id: 'recommendations', label: 'Functional Foods', icon: Salad },
    { id: 'lifestyle', label: 'Livsstil', icon: Activity },
    { id: 'nextsteps', label: 'Handlingsplan', icon: Star },
    { id: 'metrics', label: 'Mätning', icon: TrendingUp }
  ];
  const orderedTabIds = tabs.map(t => t.id);
  const currentTabIndex = orderedTabIds.indexOf(activeTab);
  const goNextTab = () => {
    if (currentTabIndex < orderedTabIds.length - 1) setActiveTab(orderedTabIds[currentTabIndex + 1]);
    else setActiveTab('course');
  };

  const healthAreas = [
    { key: 'energi', label: 'Energi', icon: Zap, color: '#fbbf24' },
    { key: 'sömn', label: 'Sömn', icon: Moon, color: '#a855f7' },
    { key: 'stress', label: 'Stress', icon: Heart, color: '#f472b6' },
    { key: 'kost', label: 'Kost', icon: Target, color: '#22c55e' },
    { key: 'motion', label: 'Motion', icon: Activity, color: '#3b82f6' }
  ];

  const domainTips: Record<string, string[]> = {
    energi: [
      t('quiz.tip.energy.1','Proteinrik frukost (25–35g) före kl 10'),
      t('quiz.tip.energy.2','Grön te eller matcha kl 10–12 istället för kaffe nr 2'),
      t('quiz.tip.energy.3','15 min dagsljus före kl 11 för cirkadian energi')
    ],
    sömn: [
      t('quiz.tip.sleep.1','Nedvarvning 60 min: skärmfri tid + varm dusch'),
      t('quiz.tip.sleep.2','Magnesiumcitrat 200–400 mg 60 min före säng'),
      t('quiz.tip.sleep.3','Svalt, mörkt sovrum (16–19°C), konsekvent tid')
    ],
    stress: [
      t('quiz.tip.stress.1','2×/dag 4‑7‑8‑andning i 2 min'),
      t('quiz.tip.stress.2','Adaptogener: reishi kväll, ashwagandha 300 mg'),
      t('quiz.tip.stress.3','2×10 min promenad utan telefon')
    ],
    kost: [
      t('quiz.tip.diet.1','"Halva tallriken grönt" varje lunch/middag'),
      t('quiz.tip.diet.2','Byt raffinerade kolhydrater mot fullkorn/baljväxter'),
      t('quiz.tip.diet.3','Fermenterat 1–2 ggr/dag (kefir/kimchi)')
    ],
    motion: [
      t('quiz.tip.exercise.1','3×/v helkropp styrka (30–40 min)'),
      t('quiz.tip.exercise.2','Daglig NEAT: 8–10k steg'),
      t('quiz.tip.exercise.3','Rörlighet 5 min efter uppvärmning')
    ]
  };

  const copyPlan = async () => {
    const lines: string[] = [];
    lines.push(`${t('quiz.result.title','Din Hälsoanalys')} (${totalScore}/100)`);
    for (const area of healthAreas) {
      const s = (healthScores as any)[area.key] as number;
      lines.push(`\n${area.label}: ${s}/10`);
      for (const tip of domainTips[area.key]) lines.push(`- ${tip}`);
    }
    const text = lines.join('\n');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(textarea);
    }
  };

  // Show overview first
  if (showOverview) {
    return <FunctionalFoodsOverview onContinue={() => setShowOverview(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimalist Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-light text-gray-900">{t('quiz.result.title','Din Hälsoanalys')}</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">{t('quiz.result.subtitle','Personliga rekommendationer baserat på dina svar')}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestart}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs md:text-sm hidden sm:inline">{t('quiz.restart','Gör om test')}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="w-full px-4 py-4 md:py-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-6">
            {/* Main Content Area */}
            <div className="flex-1">
              {/* Content based on active tab */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >


                {activeTab === 'context' && contextData && (
                  <div className="space-y-6">
                    {/* Weather & Training Recommendation */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Sun className="w-5 h-5 text-yellow-500" />
                        Träningsrekommendation idag
                      </h3>
                      
                      {contextData.weather?.current && (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Temperatur:</span>
                              <span className="font-medium">{Math.round(contextData.weather.current.temperature_2m)}°C</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">UV-index:</span>
                              <span className={`font-medium ${contextData.weather.current.uv_index > 6 ? 'text-red-600' : 'text-green-600'}`}>
                                {contextData.weather.current.uv_index || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">Nederbörd:</span>
                              <span className="font-medium">{contextData.weather.current.precipitation || 0} mm</span>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-green-800 font-medium">
                              {contextData.weather.current.uv_index < 8 && contextData.weather.current.precipitation < 0.5
                                                                  ? 'Perfekt väder för utomhusträning!'
                                : contextData.weather.current.precipitation > 2
                                                                  ? 'Rekommenderar inomhusträning idag'
                                : 'Var försiktig med solen, träna i skuggan eller inomhus'}
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>

                    {/* Air Quality */}
                    {contextData.air?.hourly && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                      >
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Wind className="w-5 h-5 text-blue-500" />
                          Luftkvalitet
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {(() => {
                            const latest = Object.keys(contextData.air.hourly.time || {}).length - 1;
                            const pm25 = contextData.air.hourly.pm2_5?.[latest] || 0;
                            const pm10 = contextData.air.hourly.pm10?.[latest] || 0;
                            const no2 = contextData.air.hourly.nitrogen_dioxide?.[latest] || 0;
                            
                            return (
                              <>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <div className="text-xs text-gray-500 mb-1">PM2.5</div>
                                  <div className={`text-lg font-medium ${pm25 < 25 ? 'text-green-600' : pm25 < 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {Math.round(pm25)} μg/m³
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <div className="text-xs text-gray-500 mb-1">PM10</div>
                                  <div className={`text-lg font-medium ${pm10 < 50 ? 'text-green-600' : pm10 < 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {Math.round(pm10)} μg/m³
                                  </div>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                  <div className="text-xs text-gray-500 mb-1">NO2</div>
                                  <div className={`text-lg font-medium ${no2 < 40 ? 'text-green-600' : no2 < 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {Math.round(no2)} μg/m³
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                        
                        <div className="mt-4 text-sm text-gray-600">
                          {(() => {
                            const latest = Object.keys(contextData.air.hourly.time || {}).length - 1;
                            const pm25 = contextData.air.hourly.pm2_5?.[latest] || 0;
                            return pm25 < 25 
                              ? '<Heart className="w-5 h-5 inline" /> Utmärkt luftkvalitet - perfekt för träning utomhus!'
                              : pm25 < 50
                              ? '💛 Acceptabel luftkvalitet - undvik intensiv träning utomhus'
                              : '🔴 Dålig luftkvalitet - träna inomhus idag';
                          })()}
                        </div>
                      </motion.div>
                    )}

                    {/* Pollen */}
                    {contextData.pollen?.daily && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                      >
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <Flower className="w-5 h-5 text-pink-500" />
                          Pollennivåer
                        </h3>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {[
                            { name: 'Björk', key: 'birch_pollen' },
                            { name: 'Gräs', key: 'grass_pollen' },
                            { name: 'Gråbo', key: 'mugwort_pollen' },
                            { name: 'Ragweed', key: 'ragweed_pollen' }
                          ].map(pollen => {
                            const level = contextData.pollen.daily[pollen.key]?.[0] || 0;
                            return (
                              <div key={pollen.key} className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">{pollen.name}</div>
                                <div className={`text-lg font-medium ${level < 50 ? 'text-green-600' : level < 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {level}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <Lightbulb className="w-5 h-5 inline" /> Tips för allergiker: Ta antihistamin 30 min före träning och välj tidiga morgnar eller sena kvällar.
                        </div>
                      </motion.div>
                    )}

                    {/* Nearby Places */}
                    {contextData.places && contextData.places.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                      >
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-green-500" />
                          Träningsplatser nära dig
                        </h3>
                        
                        <div className="space-y-3">
                          {contextData.places.slice(0, 8).map((place: any, index: number) => (
                            <div key={place.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {place.name || `${place.type === 'park' ? 'Park' : place.type === 'fitness_centre' ? 'Gym' : 'Träningsplats'}`}
                                </div>
                                <div className="text-xs text-gray-500 capitalize">
                                  {place.type.replace(/_/g, ' ')}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                {place.distance ? `${Math.round(place.distance * 100) / 100} km` : ''}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}



                {activeTab === 'recommendations' && recommendations && (
                  <div className="space-y-4">
                    {recommendations.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-background-secondary rounded-xl flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-medium text-gray-900 mb-3">{rec.title}</h3>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                              {rec.description}
                            </p>
                            <details className="group">
                              <summary className="cursor-pointer text-primary hover:text-secondary font-medium text-sm flex items-center gap-2">
                                <span>Hur du använder det</span>
                                <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                              </summary>
                              <div className="mt-4 pl-6 border-l-2 border-green-100">
                                                              <p className="text-gray-600 text-sm leading-relaxed">
                                {rec.howToUse}
                              </p>
                              </div>
                            </details>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === 'lifestyle' && recommendations && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4 md:mb-6">{t('quiz.lifestyle','Livsstilsråd')}</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {recommendations.lifestyleAdvice.map((advice, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-l-4 border-gray-200 pl-6 py-2 hover:border-primary transition-colors"
                        >
                          <p className="text-gray-700">
                            {advice}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Domain checklists */}
                    <div className="mt-8 grid lg:grid-cols-2 gap-6">
                      {healthAreas.map((area) => (
                        <div key={area.key} className="bg-background-secondary rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3"><area.icon className="w-4 h-4 text-gray-600" /><h3 className="text-sm font-medium text-gray-900">{area.label}</h3></div>
                          <ul className="space-y-2">
                            {domainTips[area.key].map((tip, i)=>{
                              const id = `${area.key}-${i}`;
                              return (
                                <li key={id} className="flex items-start gap-2">
                                  <input type="checkbox" checked={!!checklist[id]} onChange={()=>toggleCheck(id)} className="mt-1 w-4 h-4 text-primary border-gray-300 rounded" />
                                  <span className="text-sm text-gray-700">{tip}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 text-right">
                      <button onClick={copyPlan} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-secondary">{t('quiz.copyPlan','Kopiera min plan')}</button>
                    </div>
                  </div>
                )}

                {activeTab === 'nextsteps' && recommendations && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-6 md:mb-8">{t('quiz.plan','Din handlingsplan')}</h2>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                      
                      {/* Timeline items */}
                      <div className="space-y-8">
                        {recommendations.nextSteps.map((step, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex gap-6"
                          >
                            <div className="flex-shrink-0 w-12 h-12 bg-white border-4 border-gray-200 rounded-full flex items-center justify-center z-10">
                              <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                            </div>
                            <div className="flex-1 pb-8">
                              <p className="text-gray-700">
                                {step}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-12 text-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.href = '/utbildning/functional-flow'}
                        className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors"
                      >
                        <span>{t('quiz.startFlow','Starta Functional Flow')}</span>
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                )}

                {activeTab === 'course' && recommendations && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4 md:mb-6">{t('quiz.course','Rekommenderad kurs för dig')}</h2>
                    
                    {/* Course presentation with image */}
                    <div className="mb-8">
                      <div className="relative overflow-hidden rounded-2xl mb-6">
                        <img 
                          src="/ulrika3.png" 
                          alt="Functional Flow Kurs"
                          className="w-full h-48 md:h-64 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                          <div className="p-6 text-white">
                            <h3 className="text-2xl font-bold mb-2">Functional Flow</h3>
                            <p className="text-white/90">Vår mest omfattande kurs för optimal hälsa</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="prose prose-gray max-w-none">
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: recommendations.courseRecommendation }} />
                      </div>
                    </div>
                    
                    {/* Single prominent CTA for Functional Flow */}
                    <div className="text-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = '/utbildning/functional-flow'}
                        className="bg-primary text-white px-8 py-4 rounded-xl font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-3 mx-auto text-lg"
                      >
                        <Star className="w-6 h-6" />
                        <span>Starta Functional Flow</span>
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                      
                      <p className="text-sm text-gray-500 mt-4">
                        Personliga måltidsplaner • Veckovisa inköpslistor • Expert-support
                      </p>
                    </div>
                  </div>
                )}



                {activeTab === 'metrics' && recommendations && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4 md:mb-6">{t('quiz.metrics','Följ dina framsteg')}</h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      {recommendations.successMetrics.map((metric, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex gap-4"
                        >
                          <div className="w-10 h-10 bg-background-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-5 h-5 text-primary" />
                          </div>
                          <p className="text-gray-700 text-sm">
                            {metric}
                          </p>
                        </motion.div>
                      ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-purple-50 rounded-xl p-6">
                        <h3 className="font-medium text-gray-900 mb-3">Digital spårning</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Hälsoappar för daglig loggning</li>
                          <li>• Automatisk datasynkning</li>
                          <li>• Visualisering av framsteg</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="font-medium text-gray-900 mb-3">Manuell loggning</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Dagbok för reflektion</li>
                          <li>• Veckovis utvärdering</li>
                          <li>• Månatlig översikt</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                </motion.div>
              </AnimatePresence>

              {/* Step footer navigation */}
              <div className="mt-6 flex justify-end">
                <button onClick={goNextTab} className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full font-medium hover:bg-secondary transition-colors">
                  {currentTabIndex < orderedTabIds.length - 1 ? t('quiz.next','Nästa') : t('quiz.toOverview','Till översikt')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Sidebar - Icon Navigation */}
            <div className="hidden lg:block w-20">
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
                  <div className="space-y-3">
                    {tabs.map((tab) => (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`group relative w-14 h-14 rounded-xl text-2xl transition-all flex items-center justify-center ${
                          activeTab === tab.id
                            ? 'bg-primary text-black shadow-lg'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        title={tab.label}
                      >
                        <tab.icon className="w-6 h-6" />
                        
                        {/* Tooltip on hover */}
                        <div className="absolute right-full mr-3 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                          {tab.label}
                          <div className="absolute top-1/2 right-0 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900"></div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
            <div className="flex justify-center gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-[60px] ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{tab.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultScreen; 
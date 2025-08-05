"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiStar, FiTrendingUp, FiHeart, FiZap, FiShield, FiCheckCircle, FiArrowRight, FiTarget, FiActivity, FiBookOpen, FiAlertTriangle, FiPhone, FiChevronRight } from 'react-icons/fi';
import LoadingAnalysis from './LoadingAnalysis';

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
}

interface HealthScores {
  energi: number;
  sömn: number;
  stress: number;
  kost: number;
  motion: number;
}

interface QuizResultScreenProps {
  quizData: Record<number, string> | {
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
  onRestart: () => void;
}

const QuizResultScreen: React.FC<QuizResultScreenProps> = ({ quizData, onRestart }) => {
  const [recommendations, setRecommendations] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [healthScores, setHealthScores] = useState<HealthScores>({
    energi: 7,
    sömn: 6,
    stress: 6,
    kost: 7,
    motion: 5
  });

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

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Show loading for at least 90 seconds for better UX
      const minLoadingTime = 90000;
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
        courseRecommendation: "Du kan förbättra din hälsa ytterligare genom att gå vår Functional Basics kurs. Denna kurs ger dig djupare förståelse för hur functional foods kan påverka din hälsa och hur du kan implementera dem i din vardag."
      };

      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/quiz-results', {
          method: 'POST',
          headers,
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
  }, [quizData]);

  if (loading) {
    return <LoadingAnalysis />;
  }

  if (error) {
    return (
      <div className="w-full bg-gradient-to-br from-red-50 to-orange-50 py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-auto text-center"
        >
          <div className="text-6xl mb-4">⚠️</div>
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
    if (score >= 80) return { text: "Utmärkt! Du är på rätt väg!", emoji: "🌟", color: "text-primary" };
    if (score >= 60) return { text: "Bra! Det finns potential för förbättring", emoji: "💪", color: "text-blue-600" };
    if (score >= 40) return { text: "Okej start! Låt oss förbättra din hälsa", emoji: "🌱", color: "text-yellow-600" };
    return { text: "Tid för förändring! Vi hjälper dig", emoji: "🚀", color: "text-orange-600" };
  };

  const scoreMessage = getScoreMessage(totalScore);

  const tabs = [
    { id: 'summary', label: 'Översikt', icon: '📊' },
    { id: 'course', label: 'Kursrekommendation', icon: '🎓' },
    { id: 'recommendations', label: 'Functional Foods', icon: '🥗' },
    { id: 'lifestyle', label: 'Livsstil', icon: '🏃‍♀️' },
    { id: 'nextsteps', label: 'Handlingsplan', icon: '⭐' },
    { id: 'science', label: 'Forskning', icon: '🔬' },
    { id: 'warnings', label: 'Varningar', icon: '⚠️' },
    { id: 'metrics', label: 'Mätning', icon: '📈' }
  ];

  const healthAreas = [
    { key: 'energi', label: 'Energi', icon: FiZap, color: '#fbbf24' },
    { key: 'sömn', label: 'Sömn', icon: FiShield, color: '#a855f7' },
    { key: 'stress', label: 'Stress', icon: FiHeart, color: '#f472b6' },
    { key: 'kost', label: 'Kost', icon: FiTarget, color: '#22c55e' },
    { key: 'motion', label: 'Motion', icon: FiActivity, color: '#3b82f6' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Minimalist Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-light text-gray-900">Din Hälsoanalys</h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">Personliga rekommendationer baserat på dina svar</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRestart}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span className="text-xs md:text-sm hidden sm:inline">Gör om test</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="w-full px-4 py-4 md:py-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Score Summary */}
          <div className="lg:hidden mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{scoreMessage.text}</h3>
                  <p className="text-sm text-gray-500">Total poäng: {totalScore}/100</p>
                </div>
                <div className="text-3xl">{scoreMessage.emoji}</div>
              </div>
            </motion.div>
          </div>

          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            
            {/* Left Sidebar - Score Overview - Hidden on mobile */}
            <div className="hidden lg:block lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="sticky top-8"
              >
                {/* Total Score Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      <svg className="w-32 h-32">
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          stroke="#f3f4f6"
                          strokeWidth="8"
                          fill="none"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="58"
                          stroke="#10b981"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={364}
                          strokeDashoffset={364 - (totalScore / 100) * 364}
                          initial={{ strokeDashoffset: 364 }}
                          animate={{ strokeDashoffset: 364 - (totalScore / 100) * 364 }}
                          transition={{ duration: 2, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div>
                          <motion.div 
                            className="text-4xl font-light text-gray-900"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring" }}
                          >
                            {totalScore}
                          </motion.div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider">poäng</div>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{scoreMessage.text}</h3>
                    <p className="text-sm text-gray-500 mt-1">Din övergripande hälsostatus</p>
                  </div>
                </div>

                {/* Health Areas */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Hälsoområden</h4>
                  <div className="space-y-4">
                    {healthAreas.map((area, index) => {
                      const score = healthScores[area.key as keyof HealthScores];
                      const percentage = (score / 10) * 100;
                      const Icon = area.icon;
                      
                      return (
                        <motion.div
                          key={area.key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700">{area.label}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{score}/10</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: area.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
              {/* Tab Navigation - Scrollable on Mobile */}
              <div className="mb-6">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 min-w-max pb-2">
                    {tabs.map((tab) => (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`group relative w-14 h-14 rounded-full text-2xl transition-all flex-shrink-0 ${
                          activeTab === tab.id
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-background-secondary hover:text-secondary border border-gray-200 hover:border-border shadow-sm hover:shadow-md'
                        }`}
                        title={tab.label}
                      >
                        <span className="flex items-center justify-center h-full">
                          {tab.icon}
                        </span>
                        
                        {/* Tooltip on hover - hidden on mobile */}
                        <div className="hidden md:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                          {tab.label}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  {activeTab === 'summary' && recommendations && (
                    <div className="space-y-6">
                      {/* Profile Card */}
                      <motion.div 
                        className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4 md:mb-6">Din hälsoprofil</h2>
                        <div 
                          className="prose prose-gray max-w-none text-sm md:text-base text-gray-600 leading-relaxed space-y-4"
                          dangerouslySetInnerHTML={{ __html: recommendations.profile.replace(/\. /g, '.<br/><br/>') }}
                        />
                      </motion.div>

                    {/* Quick Actions Grid */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { icon: FiActivity, title: "Daglig aktivitet", desc: "30 min rörelse", color: "from-blue-500 to-blue-600" },
                        { icon: FiHeart, title: "Hjärthälsa", desc: "Omega-3 dagligen", color: "from-red-500 to-red-600" },
                        { icon: FiZap, title: "Energinivåer", desc: "B-vitaminer", color: "from-yellow-500 to-yellow-600" }
                      ].map((action, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -4, transition: { duration: 0.2 } }}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer group"
                        >
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">{action.title}</h3>
                          <p className="text-xs text-gray-500">{action.desc}</p>
                        </motion.div>
                      ))}
                    </div>
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
                              <FiCheckCircle className="w-6 h-6 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-medium text-gray-900 mb-3">{rec.title}</h3>
                            <div 
                              className="text-gray-600 mb-4 leading-relaxed space-y-3"
                              dangerouslySetInnerHTML={{ __html: rec.description.replace(/\. /g, '.<br/><br/>') }}
                            />
                            <details className="group">
                              <summary className="cursor-pointer text-primary hover:text-secondary font-medium text-sm flex items-center gap-2">
                                <span>Hur du använder det</span>
                                <FiChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
                              </summary>
                              <div className="mt-4 pl-6 border-l-2 border-green-100">
                                <div 
                                  className="text-gray-600 text-sm leading-relaxed space-y-2"
                                  dangerouslySetInnerHTML={{ __html: rec.howToUse.replace(/\. /g, '.<br/><br/>') }}
                                />
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
                    <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4 md:mb-6">Livsstilsråd</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {recommendations.lifestyleAdvice.map((advice, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-l-4 border-gray-200 pl-6 py-2 hover:border-primary transition-colors"
                        >
                          <div 
                            className="text-gray-700 space-y-2"
                            dangerouslySetInnerHTML={{ __html: advice.replace(/\. /g, '.<br/><br/>') }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'nextsteps' && recommendations && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-6 md:mb-8">Din handlingsplan</h2>
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
                              <div 
                                className="text-gray-700 space-y-2"
                                dangerouslySetInnerHTML={{ __html: step.replace(/\. /g, '.<br/><br/>') }}
                              />
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
                        <span>Starta Functional Flow</span>
                        <FiArrowRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                )}

                {activeTab === 'course' && recommendations && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4 md:mb-6">Rekommenderad kurs för dig</h2>
                    <div 
                      className="prose prose-gray max-w-none text-gray-600 mb-8 space-y-4"
                      dangerouslySetInnerHTML={{ __html: recommendations.courseRecommendation.replace(/\. /g, '.<br/><br/>') }}
                    />
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = '/utbildning/functional-flow'}
                        className="bg-primary text-white px-6 py-4 rounded-xl font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                      >
                        <FiStar className="w-5 h-5" />
                        <span>Functional Flow</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = '/utbildning/functional-basics'}
                        className="bg-white text-gray-700 border-2 border-gray-200 px-6 py-4 rounded-xl font-medium hover:border-gray-300 transition-colors"
                      >
                        Functional Basics
                      </motion.button>
                    </div>
                  </div>
                )}

                {activeTab === 'science' && recommendations && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4 md:mb-6">Vetenskaplig grund</h2>
                    <div className="space-y-4">
                      {recommendations.scientificReferences.map((reference, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-4 p-4 bg-blue-50 rounded-xl"
                        >
                          <FiBookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div 
                            className="text-gray-700 text-sm space-y-2"
                            dangerouslySetInnerHTML={{ __html: reference.replace(/\. /g, '.<br/><br/>') }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'warnings' && recommendations && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                      <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4 md:mb-6">Viktigt att tänka på</h2>
                      <div className="space-y-4">
                        {recommendations.warningSignals.map((warning, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100"
                          >
                            <FiAlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div 
                              className="text-gray-700 space-y-2"
                              dangerouslySetInnerHTML={{ __html: warning.replace(/\. /g, '.<br/><br/>') }}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
                      <div className="flex items-center gap-3 mb-3">
                        <FiPhone className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-medium text-gray-900">Vid akuta besvär</h3>
                      </div>
                      <p className="text-gray-700">
                        Ring <strong>1177</strong> för vårdguiden eller <strong>112</strong> vid nödsituationer.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'metrics' && recommendations && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                    <h2 className="text-xl md:text-2xl font-light text-gray-900 mb-4 md:mb-6">Följ dina framsteg</h2>
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
                            <FiTrendingUp className="w-5 h-5 text-primary" />
                          </div>
                          <div 
                            className="text-gray-700 text-sm space-y-2"
                            dangerouslySetInnerHTML={{ __html: metric.replace(/\. /g, '.<br/><br/>') }}
                          />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultScreen; 
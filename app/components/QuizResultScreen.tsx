"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiStar, FiTrendingUp, FiHeart, FiZap, FiShield, FiCheckCircle, FiArrowRight, FiTarget, FiActivity } from 'react-icons/fi';
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

  // Type guard to check if quizData is result data
  const isResultData = (data: any): data is {
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
  } => {
    return typeof data === 'object' && 'symptoms' in data;
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
      // Show loading for at least 12 seconds for better UX
      const minLoadingTime = 12000;
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
        ]
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Något gick fel</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Försök igen
          </button>
        </motion.div>
      </div>
    );
  }

  const totalScore = calculateTotalScore();
  
  const getScoreMessage = (score: number) => {
    if (score >= 80) return { text: "Utmärkt! Du är på rätt väg!", emoji: "🌟", color: "text-green-600" };
    if (score >= 60) return { text: "Bra! Det finns potential för förbättring", emoji: "💪", color: "text-blue-600" };
    if (score >= 40) return { text: "Okej start! Låt oss förbättra din hälsa", emoji: "🌱", color: "text-yellow-600" };
    return { text: "Tid för förändring! Vi hjälper dig", emoji: "🚀", color: "text-orange-600" };
  };

  const scoreMessage = getScoreMessage(totalScore);

  const tabs = [
    { id: 'summary', label: 'Översikt', icon: '📊' },
    { id: 'recommendations', label: 'Functional Foods', icon: '🥗' },
    { id: 'lifestyle', label: 'Livsstil', icon: '🏃‍♀️' },
    { id: 'nextsteps', label: 'Nästa steg', icon: '⭐' }
  ];

  const healthAreas = [
    { key: 'energi', label: 'Energi', icon: FiZap, color: 'from-yellow-400 to-orange-500' },
    { key: 'sömn', label: 'Sömn', icon: FiShield, color: 'from-purple-400 to-purple-600' },
    { key: 'stress', label: 'Stress', icon: FiHeart, color: 'from-pink-400 to-red-500' },
    { key: 'kost', label: 'Kost', icon: FiTarget, color: 'from-green-400 to-green-600' },
    { key: 'motion', label: 'Motion', icon: FiActivity, color: 'from-blue-400 to-blue-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Din Personliga Hälsoanalys
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl opacity-90"
          >
            Baserat på dina svar har vi skapat en skräddarsydd plan för dig
          </motion.p>
        </div>
      </div>

      {/* Score Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 mb-8"
        >
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Total Score - Larger */}
            <div className="lg:col-span-1 text-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Din totala hälsopoäng</h2>
              <div className="relative inline-block">
                <svg className="w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#scoreGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(totalScore / 100) * 553} 553`}
                    transform="rotate(-90 96 96)"
                    className="transition-all duration-2000"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22c55e" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-5xl font-bold text-gray-800">{totalScore}</div>
                    <div className="text-lg text-gray-500">av 100</div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-4xl mb-2">{scoreMessage.emoji}</div>
                <p className={`text-lg font-medium ${scoreMessage.color}`}>{scoreMessage.text}</p>
              </div>
            </div>

            {/* Health Areas - Circular indicators */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6">Dina hälsoområden</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {healthAreas.map((area, index) => {
                  const Icon = area.icon;
                  const score = healthScores[area.key as keyof HealthScores];
                  const percentage = (score / 10) * 100;
                  
                  return (
                    <motion.div
                      key={area.key}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-center"
                    >
                      <div className="relative inline-block mb-3">
                        <svg className="w-20 h-20">
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            stroke="#e5e7eb"
                            strokeWidth="6"
                            fill="none"
                          />
                                                     <circle
                             cx="40"
                             cy="40"
                             r="36"
                             stroke="#22c55e"
                             strokeWidth="6"
                             fill="none"
                             strokeDasharray={`${(percentage / 100) * 226} 226`}
                             transform="rotate(-90 40 40)"
                             className="transition-all duration-1000"
                             strokeLinecap="round"
                           />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-gray-600" />
                        </div>
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1">{area.label}</h4>
                      <div className="text-2xl font-bold text-gray-800">{score}<span className="text-sm text-gray-500">/10</span></div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'summary' && recommendations && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Din hälsoprofil</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  {recommendations.profile}
                </p>
                
                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center cursor-pointer"
                  >
                    <div className="text-4xl mb-3">💧</div>
                    <h4 className="font-semibold text-gray-800 mb-2">Hydration</h4>
                    <p className="text-sm text-gray-600">Drick 2L vatten dagligen</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center cursor-pointer"
                  >
                    <div className="text-4xl mb-3">🥗</div>
                    <h4 className="font-semibold text-gray-800 mb-2">Nutrition</h4>
                    <p className="text-sm text-gray-600">Ät varierat och färgglatt</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center cursor-pointer"
                  >
                    <div className="text-4xl mb-3">😴</div>
                    <h4 className="font-semibold text-gray-800 mb-2">Vila</h4>
                    <p className="text-sm text-gray-600">7-9 timmars sömn</p>
                  </motion.div>
                </div>
              </div>
            )}

            {activeTab === 'recommendations' && recommendations && (
              <div className="space-y-6">
                {recommendations.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-8"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 rounded-full p-4 flex-shrink-0">
                        <FiCheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-3">{rec.title}</h3>
                        <p className="text-gray-700 mb-6 text-lg">{rec.description}</p>
                        <div className="bg-green-50 rounded-xl p-4">
                          <h4 className="font-medium text-green-800 mb-2">Så här använder du det:</h4>
                          <p className="text-green-700">{rec.howToUse}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'lifestyle' && recommendations && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Livsstilsråd för optimal hälsa</h2>
                <div className="space-y-6">
                  {recommendations.lifestyleAdvice.map((advice, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <FiHeart className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                      <p className="text-gray-700 text-lg">{advice}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'nextsteps' && recommendations && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Dina nästa steg</h2>
                <div className="space-y-6">
                  {recommendations.nextSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="bg-purple-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-semibold">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 text-lg">{step}</p>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <div className="mt-10 text-center">
                  <button 
                    onClick={() => window.location.href = '/dashboard/courses/functional-basics'}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-10 py-5 rounded-full font-semibold text-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-xl hover:shadow-2xl inline-flex items-center space-x-3 transform hover:scale-105"
                  >
                    <span>Kom igång med Functional Basics</span>
                    <FiArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Actions */}
        <div className="mt-12 pb-12 text-center">
          <button
            onClick={onRestart}
            className="text-gray-600 hover:text-gray-800 font-medium inline-flex items-center space-x-2 transition-colors text-lg"
          >
            <FiRefreshCw className="w-5 h-5" />
            <span>Gör om testet</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResultScreen; 
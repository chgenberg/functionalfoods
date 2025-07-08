"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiStar, FiTrendingUp, FiHeart, FiZap, FiShield } from 'react-icons/fi';
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
  quizData: Record<number, string>;
  onRestart: () => void;
}

const QuizResultScreen: React.FC<QuizResultScreenProps> = ({ quizData, onRestart }) => {
  const [recommendations, setRecommendations] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [healthScores, setHealthScores] = useState<HealthScores>({
    energi: 5,
    sömn: 5,
    stress: 5,
    kost: 5,
    motion: 5
  });

  const calculateHealthScores = (): HealthScores => {
    const scores: HealthScores = {
      energi: 5,
      sömn: 5,
      stress: 5,
      kost: 5,
      motion: 5
    };

    // Map quiz answers to scores
    if (quizData[0] === 'high_energy') scores.energi = 8;
    else if (quizData[0] === 'low_energy') scores.energi = 3;
    else if (quizData[0] === 'afternoon_dip') scores.energi = 5;

    if (quizData[1] === 'excellent_sleep') scores.sömn = 9;
    else if (quizData[1] === 'poor_sleep') scores.sömn = 3;
    else if (quizData[1] === 'good_sleep') scores.sömn = 7;

    if (quizData[2] === 'low_stress') scores.stress = 8;
    else if (quizData[2] === 'chronic_stress') scores.stress = 3;
    else if (quizData[2] === 'moderate_stress') scores.stress = 5;

    if (quizData[3] === 'very_active') scores.motion = 8;
    else if (quizData[3] === 'sedentary') scores.motion = 3;
    else if (quizData[3] === 'active') scores.motion = 6;

    if (quizData[4] === 'excellent_diet') scores.kost = 8;
    else if (quizData[4] === 'poor_diet') scores.kost = 3;
    else if (quizData[4] === 'good_diet') scores.kost = 6;

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
          throw new Error(`Failed to get recommendations: ${response.status}`);
        }

        const data = await response.json();
        setRecommendations(data.results);
        
        // Calculate health scores
        const calculatedScores = calculateHealthScores();
        setHealthScores(calculatedScores);
        
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
    if (score >= 80) return { text: "Utmärkt! Du är på rätt väg!", emoji: "🌟" };
    if (score >= 60) return { text: "Bra! Det finns potential för förbättring", emoji: "💪" };
    if (score >= 40) return { text: "Okej start! Låt oss förbättra din hälsa", emoji: "🌱" };
    return { text: "Tid för förändring! Vi hjälper dig", emoji: "🚀" };
  };

  const scoreMessage = getScoreMessage(totalScore);

  const tabs = [
    { id: 'summary', label: 'Sammanfattning', icon: '📊' },
    { id: 'recommendations', label: 'Rekommendationer', icon: '🍃' },
    { id: 'lifestyle', label: 'Livsstil', icon: '🏃‍♀️' },
    { id: 'nextsteps', label: 'Nästa steg', icon: '⭐' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Scrolling title container */}
          <div className="relative overflow-hidden mb-4">
            <motion.div
              className="flex whitespace-nowrap"
              animate={{
                x: [0, -1920]
              }}
              transition={{
                x: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }
              }}
            >
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 mr-8">
                DINA PERSONALISERADE REKOMMENDATIONER
              </h1>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 mr-8">
                DINA PERSONALISERADE REKOMMENDATIONER
              </h1>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 mr-8">
                DINA PERSONALISERADE REKOMMENDATIONER
              </h1>
            </motion.div>
            
            {/* Gradient fade edges */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-green-50 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-blue-50 to-transparent pointer-events-none" />
          </div>
          
          <div className="bg-white rounded-3xl shadow-xl p-6 inline-block">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{totalScore}</div>
                <div className="text-sm text-gray-500">/100</div>
              </div>
              <div className="text-left">
                <p className="text-lg font-medium text-gray-800">Din totala hälsopoäng</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-2xl">{scoreMessage.emoji}</span>
                  <span className="text-gray-600">{scoreMessage.text}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Wins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            Snabba vinster för din hälsa:
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-blue-50 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:shadow-lg"
            >
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl mb-2"
              >💧</motion.div>
              <div className="text-sm font-medium text-blue-800">Drick 2L vatten dagligen</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-green-50 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:shadow-lg"
            >
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                className="text-2xl mb-2"
              >🚶</motion.div>
              <div className="text-sm font-medium text-green-800">10 min promenad efter lunch</div>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-purple-50 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:shadow-lg"
            >
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="text-2xl mb-2"
              >😴</motion.div>
              <div className="text-sm font-medium text-purple-800">Sov före 22:30</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Tab Headers */}
          <div className="flex overflow-x-auto bg-gray-50 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white text-green-600 shadow-md'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'summary' && recommendations && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Din Hälsosammanfattning</h2>
                    <div className="prose prose-green max-w-none">
                      <p className="text-gray-700 text-lg leading-relaxed">{recommendations.profile}</p>
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Dina poäng per område:</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(healthScores).map(([key, score]) => {
                          const icons: Record<string, string> = {
                            energi: '⚡',
                            sömn: '😴',
                            stress: '🧘',
                            kost: '🥗',
                            motion: '🏃'
                          };
                          const labels: Record<string, string> = {
                            energi: 'Energi',
                            sömn: 'Sömn',
                            stress: 'Stress',
                            kost: 'Kost',
                            motion: 'Motion'
                          };
                          
                          return (
                            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl">{icons[key]}</span>
                                <span className="font-medium text-gray-700">{labels[key]}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-green-600">{score}</span>
                                <span className="text-gray-500">/10</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'recommendations' && recommendations && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Functional Food Rekommendationer</h2>
                    <div className="space-y-6">
                      {recommendations.recommendations.map((rec, index) => (
                        <div key={index} className="bg-green-50 rounded-2xl p-6 border border-green-100">
                          <h3 className="text-xl font-semibold text-green-800 mb-3">{rec.title}</h3>
                          <p className="text-gray-700 mb-4">{rec.description}</p>
                          <div className="bg-white rounded-xl p-4 border border-green-200">
                            <h4 className="font-medium text-green-700 mb-2">Hur du använder det:</h4>
                            <p className="text-gray-600">{rec.howToUse}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'lifestyle' && recommendations && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Livsstilsråd</h2>
                    <div className="space-y-4">
                      {recommendations.lifestyleAdvice.map((advice, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
                          <div className="bg-blue-200 rounded-full p-2 flex-shrink-0">
                            <FiHeart className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-gray-700">{advice}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'nextsteps' && recommendations && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Nästa steg</h2>
                    <div className="space-y-4">
                      {recommendations.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl">
                          <div className="bg-purple-200 rounded-full p-2 flex-shrink-0">
                            <span className="text-purple-600 font-bold">{index + 1}</span>
                          </div>
                          <p className="text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center my-8"
        >
          <blockquote className="text-xl italic text-gray-600 mb-2">
            "Let food be thy medicine and medicine be thy food"
          </blockquote>
          <cite className="text-gray-500">- Hippocrates</cite>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-medium hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
          >
            <FiRefreshCw className="w-5 h-5" />
            <span>Gör om testet</span>
          </button>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200"
        >
          <p className="text-sm text-yellow-800">
            <strong>Observera:</strong> Dessa rekommendationer är generella råd baserade på dina 
            quiz-svar och ersätter inte professionell medicinsk rådgivning. 
            Konsultera alltid läkare innan du gör större förändringar i din livsstil eller börjar med nya tillskott.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizResultScreen; 
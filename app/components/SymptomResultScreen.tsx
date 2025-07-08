"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiHeart, FiZap } from 'react-icons/fi';

interface SymptomResultScreenProps {
  resultData: {
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

const SymptomResultScreen: React.FC<SymptomResultScreenProps> = ({ resultData, onRestart }) => {
  const [activeTab, setActiveTab] = React.useState('summary');

  const tabs = [
    { id: 'summary', label: 'Sammanfattning', icon: '📊' },
    { id: 'recommendations', label: 'Rekommendationer', icon: '🍃' },
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
                DIN PERSONALISERADE SYMPTOMANALYS
              </h1>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 mr-8">
                DIN PERSONALISERADE SYMPTOMANALYS
              </h1>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 mr-8">
                DIN PERSONALISERADE SYMPTOMANALYS
              </h1>
            </motion.div>
            
            {/* Gradient fade edges */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-green-50 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-blue-50 to-transparent pointer-events-none" />
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
            {resultData.quickWins.map((win, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 text-center cursor-pointer transition-all duration-300 hover:shadow-lg"
              >
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  className="text-2xl mb-2"
                >
                  {win.emoji}
                </motion.div>
                <div className="text-sm font-medium text-gray-800">{win.title}</div>
                <div className="text-xs text-gray-600 mt-1">{win.description}</div>
              </motion.div>
            ))}
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
                {activeTab === 'summary' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Din Symptomanalys</h2>
                    
                    {/* Symptoms */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Identifierade symptom:</h3>
                      <div className="space-y-3">
                        {resultData.symptoms.map((symptom, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="font-medium text-gray-700">{symptom.symptom}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Intensitet:</span>
                              <span className="text-lg font-bold text-orange-600">{symptom.severity}/10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'recommendations' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Functional Food Rekommendationer</h2>
                    <div className="space-y-6">
                      {resultData.recommendations.map((rec, index) => (
                        <div key={index} className="bg-green-50 rounded-2xl p-6 border border-green-100">
                          <h3 className="text-xl font-semibold text-green-800 mb-3">{rec.nutrient}</h3>
                          <p className="text-gray-700 mb-4">{rec.description}</p>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-green-200">
                              <h4 className="font-medium text-green-700 mb-2">Rekommenderade livsmedel:</h4>
                              <ul className="text-gray-600 text-sm space-y-1">
                                {rec.foods.map((food, foodIndex) => (
                                  <li key={foodIndex}>• {food}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 border border-green-200">
                              <h4 className="font-medium text-green-700 mb-2">Kosttillskott:</h4>
                              <p className="text-gray-600 text-sm">{rec.supplements}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'nextsteps' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Nästa steg</h2>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl">
                        <div className="bg-purple-200 rounded-full p-2 flex-shrink-0">
                          <span className="text-purple-600 font-bold">1</span>
                        </div>
                        <p className="text-gray-700">Börja med att implementera en rekommendation i taget för bästa resultat</p>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl">
                        <div className="bg-purple-200 rounded-full p-2 flex-shrink-0">
                          <span className="text-purple-600 font-bold">2</span>
                        </div>
                        <p className="text-gray-700">Håll en hälsodagbok för att spåra förändringar i dina symptom</p>
                      </div>
                      
                      <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-xl">
                        <div className="bg-purple-200 rounded-full p-2 flex-shrink-0">
                          <span className="text-purple-600 font-bold">3</span>
                        </div>
                        <p className="text-gray-700">Konsultera en läkare om symptomen kvarstår eller förvärras</p>
                      </div>
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
            "Mat som medicin för kropp och själ"
          </blockquote>
          <cite className="text-gray-500">- Ulrika Davidsson</cite>
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
            <span>Gör ny analys</span>
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
            <strong>Observera:</strong> Denna analys är baserad på dina symptombeskrivningar och ersätter inte professionell medicinsk rådgivning. 
            Konsultera alltid läkare vid allvarliga eller ihållande symptom.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SymptomResultScreen; 
"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiShoppingCart, FiBook, FiHeart } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface SymptomResultScreenProps {
  analysisResult: {
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
  onBack: () => void;
}

const SymptomResultScreen: React.FC<SymptomResultScreenProps> = ({ analysisResult, onBack }) => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const router = useRouter();

  const tabs = [
    { id: 'recommendations', label: 'Rekommendationer', icon: '🎯' },
    { id: 'foods', label: 'Functional Foods', icon: '🥗' },
    { id: 'supplements', label: 'Kosttillskott', icon: '💊' },
    { id: 'lifestyle', label: 'Livsstil', icon: '🏃‍♀️' }
  ];

  const getSeverityColor = (severity: number) => {
    if (severity >= 7) return 'text-red-600';
    if (severity >= 4) return 'text-yellow-600';
    return 'text-primary';
  };

  const getSeverityBgColor = (severity: number) => {
    if (severity >= 7) return 'bg-red-100';
    if (severity >= 4) return 'bg-yellow-100';
    return 'bg-background-secondary';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={onBack}
            className="mb-6 text-white/80 hover:text-white inline-flex items-center space-x-2 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Tillbaka</span>
          </button>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Din Symptomanalys
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl opacity-90"
          >
            Personliga rekommendationer baserat på dina symptom
          </motion.p>
        </div>
      </div>

      {/* Symptoms Overview */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dina symptom</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {analysisResult.symptoms.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg ${getSeverityBgColor(item.severity)}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{item.symptom}</span>
                  <span className={`font-semibold ${getSeverityColor(item.severity)}`}>
                    {item.severity}/10
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.severity * 10}%` }}
                    transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                    className={`h-2 rounded-full ${
                      item.severity >= 7 ? 'bg-red-500' :
                      item.severity >= 4 ? 'bg-yellow-500' : 'bg-primary'
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-4xl mx-auto px-4">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm p-1 mb-6">
          <div className="flex flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
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
            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6">Snabba förbättringar</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysisResult.quickWins.map((win, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="text-3xl mb-3">{win.emoji}</div>
                        <h4 className="font-semibold text-gray-800 mb-2">{win.title}</h4>
                        <p className="text-gray-600 text-sm">{win.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {analysisResult.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm p-8"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                        <FiCheckCircle className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">{rec.nutrient}</h3>
                        <p className="text-gray-700 mb-4">{rec.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {activeTab === 'foods' && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Rekommenderade livsmedel</h2>
                <div className="space-y-6">
                  {analysisResult.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h3 className="text-lg font-semibold text-purple-600 mb-3">
                        {rec.nutrient}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {rec.foods.map((food, foodIndex) => (
                          <div
                            key={foodIndex}
                            className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg"
                          >
                            <span className="text-purple-600">•</span>
                            <span className="text-gray-700">{food}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'supplements' && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Kosttillskott</h2>
                <div className="space-y-6">
                  {analysisResult.recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-l-4 border-purple-500 pl-6"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{rec.nutrient}</h3>
                      <p className="text-gray-700">{rec.supplements}</p>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Observera:</strong> Konsultera alltid läkare innan du börjar med nya kosttillskott, 
                    särskilt om du har befintliga hälsotillstånd eller tar mediciner.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'lifestyle' && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Livsstilsförändringar</h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <FiHeart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Daglig rörelse</h3>
                      <p className="text-gray-700">
                        Inkludera minst 30 minuters fysisk aktivitet varje dag. 
                        Detta kan vara allt från en promenad till yoga eller styrketräning.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-background-secondary rounded-full p-3 flex-shrink-0">
                      <FiHeart className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Stresshantering</h3>
                      <p className="text-gray-700">
                        Praktisera mindfulness, meditation eller djupandning dagligen. 
                        Även korta pauser under dagen kan göra stor skillnad.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                      <FiHeart className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Sömnkvalitet</h3>
                      <p className="text-gray-700">
                        Sikta på 7-9 timmars sömn per natt. Skapa en avslappnande kvällsrutin 
                        och undvik skärmar minst en timme före sänggåendet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="mt-12 pb-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/dashboard/courses/functional-basics')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center space-x-2"
          >
            <FiBook className="w-5 h-5" />
            <span>Lär dig mer om Functional Foods</span>
          </button>
          
          <button
            onClick={() => router.push('/cart')}
            className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-purple-50 transition-all duration-300 inline-flex items-center justify-center space-x-2"
          >
            <FiShoppingCart className="w-5 h-5" />
            <span>Handla rekommenderade produkter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SymptomResultScreen; 
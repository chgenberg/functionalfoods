"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCw, FiStar, FiTrendingUp, FiHeart, FiZap, FiShield, FiCheckCircle } from 'react-icons/fi';
import { AnalysisResult } from "../types";

export default function DummyResultPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    // Hämta analysresultat från localStorage
    const storedResult = localStorage.getItem('analysisResult');
    
    if (storedResult) {
      try {
        const result = JSON.parse(storedResult) as AnalysisResult;
        setAnalysisData(result);
        // Rensa localStorage efter att vi hämtat datan
        localStorage.removeItem('analysisResult');
      } catch (error) {
        console.error('Error parsing analysis result:', error);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar din analys...</p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Ingen analysdata hittades.</p>
          <Link href="/" className="text-green-500 hover:text-green-600 underline">
            Gå tillbaka till startsidan
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: 'Sammanfattning', icon: '📊' },
    { id: 'recommendations', label: 'Rekommendationer', icon: '🍃' },
    { id: 'lifestyle', label: 'Livsstil', icon: '🏃‍♀️' },
    { id: 'courses', label: 'Kurser', icon: '⭐' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with scrolling text */}
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
                DIN PERSONLIGA HÄLSOANALYS
              </h1>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 mr-8">
                DIN PERSONLIGA HÄLSOANALYS
              </h1>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 mr-8">
                DIN PERSONLIGA HÄLSOANALYS
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
                {activeTab === 'summary' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Din Sammanfattning</h2>
                    <div className="prose prose-green max-w-none">
                      <p className="text-gray-700 text-lg leading-relaxed">{analysisData.summary}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'recommendations' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Personliga Rekommendationer</h2>
                    <div className="space-y-4">
                      {analysisData.recommendations.map((recommendation: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl">
                          <div className="bg-green-200 rounded-full p-2 flex-shrink-0">
                            <FiCheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <p className="text-gray-700">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">Rekommenderade Functional Foods</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {analysisData.functionalFoods.map((food: string, index: number) => (
                          <div key={index} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">🥗</span>
                              <p className="text-gray-700 font-medium">{food}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'lifestyle' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Livsstilsförändringar</h2>
                    <div className="space-y-4">
                      {analysisData.lifestyleChanges.map((change: string, index: number) => (
                        <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-xl">
                          <div className="bg-blue-200 rounded-full p-2 flex-shrink-0">
                            <FiHeart className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-gray-700">{change}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'courses' && (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Rekommenderade Kurser</h2>
                    <div className="space-y-6">
                      {/* Functional Basics */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Functional Basics</h3>
                            <p className="text-gray-600">
                              Perfekt för dig som vill lära dig grunderna i funktionell mat. En 6-veckorskurs som ger dig alla verktyg för att börja din hälsoresa.
                            </p>
                          </div>
                          <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                            Nybörjare
                          </span>
                        </div>
                        <div className="bg-purple-100 border border-purple-300 rounded-lg p-3 mb-4">
                          <p className="text-sm text-purple-800">
                            <span className="font-semibold">Specialpris:</span> 1.836 kr 
                            <span className="text-purple-600 ml-2">(ord. pris 2.295 kr)</span>
                          </p>
                        </div>
                        <Link 
                          href="/utbildning/functional-basics" 
                          className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                        >
                          Läs mer om kursen →
                        </Link>
                      </div>

                      {/* Functional Flow */}
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Functional Flow</h3>
                            <p className="text-gray-600">
                              För dig som vill gå djupare och skapa naturligt flöde i vardagen. Fokus på maghälsa, inflammation och avancerade strategier.
                            </p>
                          </div>
                          <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                            Avancerad
                          </span>
                        </div>
                        <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-4">
                          <p className="text-sm text-green-800">
                            <span className="font-semibold">Specialpris:</span> 1.836 kr 
                            <span className="text-green-600 ml-2">(ord. pris 2.295 kr)</span>
                          </p>
                        </div>
                        <Link 
                          href="/utbildning/functional-flow" 
                          className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                        >
                          Läs mer om kursen →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">
            Har du frågor om din analys eller våra kurser?
          </p>
          <Link 
            href="/kontakt" 
            className="inline-block bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-8 rounded-full transition-colors"
          >
            Kontakta oss
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 
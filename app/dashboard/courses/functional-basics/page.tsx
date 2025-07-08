'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiClock, FiTarget, FiCheckCircle, FiPlus, FiBook, FiDownload,
  FiTrendingUp, FiAward, FiStar, FiActivity, FiHeart, FiZap, FiEdit3, FiChevronDown, FiCheck, FiArrowRight
} from 'react-icons/fi';
import { useGoals } from '@/app/hooks/useGoals';
import Link from 'next/link';

// Fördefinierade mål för varje vecka
const PREDEFINED_GOALS: Record<number, Array<{
  title: string;
  description: string;
  category: 'weekly' | 'nutrition' | 'health' | 'exercise' | 'general';
  priority: 'high' | 'medium' | 'low';
  icon: string;
}>> = {
  1: [
    {
      title: "📚 Läs grundmaterialet om functional foods",
      description: "Gå igenom alla artiklar i vecka 1 och ta anteckningar",
      category: "weekly",
      priority: "high",
      icon: "📚"
    },
    {
      title: "🥗 Planera 3 functional foods-måltider",
      description: "Välj frukost, lunch och middag med functional foods",
      category: "nutrition",
      priority: "medium",
      icon: "🥗"
    },
    {
      title: "🎯 Definiera dina personliga hälsomål",
      description: "Skriv ned 3 konkreta mål du vill uppnå",
      category: "health",
      priority: "high",
      icon: "🎯"
    },
    {
      title: "💧 Drick 2 liter vatten dagligen",
      description: "Håll dig hydrerad hela veckan",
      category: "health",
      priority: "low",
      icon: "💧"
    }
  ],
  2: [
    {
      title: "🥩 Testa 3 olika proteinkällor",
      description: "Prova fisk, baljväxter och nötter denna vecka",
      category: "nutrition",
      priority: "high",
      icon: "🥩"
    },
    {
      title: "👨‍🍳 Laga recepten från vecka 2",
      description: "Gör minst 2 av veckans proteinrecept",
      category: "weekly",
      priority: "medium",
      icon: "👨‍🍳"
    },
    {
      title: "📊 Beräkna ditt dagliga proteinbehov",
      description: "Använd guiden för att räkna ut din optimala mängd",
      category: "nutrition",
      priority: "medium",
      icon: "📊"
    },
    {
      title: "🏃‍♀️ Kombinera protein med träning",
      description: "Ät protein inom 30 min efter träning",
      category: "exercise",
      priority: "low",
      icon: "🏃‍♀️"
    }
  ],
  3: [
    {
      title: "🌾 Byt vita till fullkornsprodukter",
      description: "Ersätt vitt bröd, pasta och ris med fullkorn",
      category: "nutrition",
      priority: "high",
      icon: "🌾"
    },
    {
      title: "🍎 Ät 5 portioner frukt & grönt dagligen",
      description: "Inkludera olika färger för maximal näring",
      category: "nutrition",
      priority: "medium",
      icon: "🍎"
    },
    {
      title: "📝 För matdagbok i 3 dagar",
      description: "Dokumentera allt du äter för att se mönster",
      category: "weekly",
      priority: "medium",
      icon: "📝"
    },
    {
      title: "🧘‍♀️ Reflektera över energinivåer",
      description: "Notera hur olika kolhydrater påverkar din energi",
      category: "health",
      priority: "low",
      icon: "🧘‍♀️"
    }
  ],
  4: [
    {
      title: "🛒 Handla 5 nya superfoods",
      description: "Köp quinoa, chiafrön, blåbär, grönkål och valnötter",
      category: "weekly",
      priority: "high",
      icon: "🛒"
    },
    {
      title: "🥘 Skapa din egen superfood-bowl",
      description: "Kombinera minst 5 functional foods i en måltid",
      category: "nutrition",
      priority: "medium",
      icon: "🥘"
    },
    {
      title: "📸 Dokumentera dina måltider",
      description: "Ta bilder på 3 kreativa functional foods-rätter",
      category: "general",
      priority: "low",
      icon: "📸"
    },
    {
      title: "🌟 Prova en ny functional food varje dag",
      description: "Utmana dig själv med nya smaker och texturer",
      category: "nutrition",
      priority: "medium",
      icon: "🌟"
    }
  ],
  5: [
    {
      title: "📈 Mät dina framsteg",
      description: "Dokumentera energi, sömn och allmänt välmående",
      category: "health",
      priority: "high",
      icon: "📈"
    },
    {
      title: "🗓️ Planera veckans alla måltider",
      description: "Förbered en komplett veckomeny med functional foods",
      category: "weekly",
      priority: "medium",
      icon: "🗓️"
    },
    {
      title: "👥 Dela en functional foods-måltid",
      description: "Bjud någon på middag och berätta om fördelarna",
      category: "general",
      priority: "low",
      icon: "👥"
    },
    {
      title: "💪 Identifiera 3 positiva förändringar",
      description: "Lista konkreta förbättringar du upplevt",
      category: "health",
      priority: "medium",
      icon: "💪"
    }
  ],
  6: [
    {
      title: "📋 Skapa din 30-dagarsplan",
      description: "Planera hur du fortsätter efter kursen",
      category: "weekly",
      priority: "high",
      icon: "📋"
    },
    {
      title: "🎉 Fira dina framgångar",
      description: "Belöna dig själv för genomförd kurs",
      category: "general",
      priority: "medium",
      icon: "🎉"
    },
    {
      title: "🎯 Sätt 3 långsiktiga hälsomål",
      description: "Definiera mål för kommande 3, 6 och 12 månader",
      category: "health",
      priority: "high",
      icon: "🎯"
    },
    {
      title: "📚 Skapa din egen receptsamling",
      description: "Samla dina 10 favoritrecept från kursen",
      category: "nutrition",
      priority: "medium",
      icon: "📚"
    }
  ]
};

export default function FunctionalBasicsPage() {
  const { goals, createGoal, updateGoal, loading } = useGoals();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newGoalWeek, setNewGoalWeek] = useState<number>(1);

  // Gruppera mål per vecka
  const goalsByWeek = goals.reduce((acc, goal) => {
    if (goal.weekNumber) {
      if (!acc[goal.weekNumber]) acc[goal.weekNumber] = [];
      acc[goal.weekNumber].push(goal);
    }
    return acc;
  }, {} as Record<number, typeof goals>);

  // Funktion för att aktivera fördefinierat mål
  const activatePredefinedGoal = async (weekNumber: number, predefinedGoal: {
    title: string;
    description: string;
    category: 'weekly' | 'nutrition' | 'health' | 'exercise' | 'general';
    priority: 'high' | 'medium' | 'low';
    icon?: string;
  }) => {
    try {
      await createGoal({
        title: predefinedGoal.title,
        description: predefinedGoal.description,
        category: predefinedGoal.category,
        priority: predefinedGoal.priority,
        weekNumber: weekNumber,
        courseId: 'functional-basics'
      });
    } catch (error) {
      console.error(`Error activating goal: ${error}`);
    }
  };

  // Funktion för att toggle mål som klart
  const toggleGoalCompletion = async (goalId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
    const progress = newStatus === 'completed' ? 100 : 0;
    
    try {
      await updateGoal(goalId, { 
        status: newStatus, 
        progress,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      });
    } catch (error) {
      console.error(`Error updating goal: ${error}`);
    }
  };

  const weeks = [
    { number: 1, title: "Introduktion till Functional Foods", status: "current" },
    { number: 2, title: "Att välja rätt proteiner", status: "upcoming" },
    { number: 3, title: "Att välja rätt kolhydrater", status: "upcoming" },
    { number: 4, title: "Functional Foods Topplista", status: "upcoming" },
    { number: 5, title: "Fördelarna med Functional Foods", status: "upcoming" },
    { number: 6, title: "Att komma igång", status: "upcoming" }
  ];

  return (
    <div className="space-y-8">
      {/* Intro Video Section */}
      <div className="relative bg-gradient-to-br from-green-900 via-teal-800 to-green-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12">
          <div className="flex flex-col justify-center space-y-6 z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                FUNCTIONAL BASICS
              </h1>
              <p className="text-xl text-green-100 mb-6">
                6 veckors hälsoprogram med Ulrika Davidsson
              </p>
              <div className="flex items-center space-x-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-5 h-5 text-green-100" />
                    <span className="text-white font-medium">5:32</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
                  <div className="flex items-center space-x-2">
                    <FiTarget className="w-5 h-5 text-green-100" />
                    <span className="text-white font-medium">0/6 veckor</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group cursor-pointer"
            onClick={() => {
              // Here you can add video player logic
              alert('Video kommer snart!');
            }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
              <img
                src="/ulrika3.png"
                alt="Ulrika Davidsson"
                className="w-full h-[300px] md:h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/90 backdrop-blur-sm rounded-full p-6 shadow-2xl transform transition-all duration-300 group-hover:bg-white"
                >
                  <FiPlay className="w-8 h-8 text-green-700 ml-1" />
                </motion.div>
              </div>
              
              {/* Video Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-white font-bold text-xl mb-2">
                  Introduktionsvideo
                </h3>
                <p className="text-green-100">
                  Välkommen till Functional Basics
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Link href="/dashboard/courses/functional-basics/goals" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 rounded-lg p-3 group-hover:bg-purple-200 transition-colors">
              <FiTarget className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">Målsättning</h3>
              <p className="text-gray-600 text-sm">Hantera dina mål</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/courses/functional-basics/material" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
              <FiBook className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">Kursmaterial</h3>
              <p className="text-gray-600 text-sm">Alla resurser</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/courses/functional-basics/downloads" className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 rounded-lg p-3 group-hover:bg-orange-200 transition-colors">
              <FiDownload className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">Nedladdningar</h3>
              <p className="text-gray-600 text-sm">PDF:er & guider</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Weekly Progress */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Veckans mål</h2>
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
          >
            <FiPlus className="w-4 h-4" />
            <span>Nytt mål</span>
          </button>
        </div>
        
        <div className="space-y-4">
          {weeks.map((week) => {
            const weekGoals = goalsByWeek[week.number] || [];
            const predefinedGoals = PREDEFINED_GOALS[week.number] || [];
            const completedGoals = weekGoals.filter(g => g.status === 'completed').length;
            const totalGoals = weekGoals.length;
            const isExpanded = expandedWeek === week.number;
            
            return (
              <motion.div
                key={week.number}
                className={`border-2 rounded-xl overflow-hidden transition-all ${
                  isExpanded ? 'border-orange-500 shadow-lg' : 'border-gray-200'
                }`}
                initial={false}
              >
                <div 
                  className={`p-6 cursor-pointer transition-colors ${
                    isExpanded ? 'bg-orange-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setExpandedWeek(isExpanded ? null : week.number)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`
                        w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white
                        ${week.number === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 
                          week.number === 2 ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                          week.number === 3 ? 'bg-gradient-to-r from-green-500 to-teal-600' :
                          week.number === 4 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                          week.number === 5 ? 'bg-gradient-to-r from-red-500 to-pink-600' :
                          'bg-gradient-to-r from-indigo-500 to-purple-600'}
                      `}>
                        {week.number}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{week.title}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-sm text-gray-600">
                            {totalGoals > 0 ? (
                              <span className="flex items-center space-x-1">
                                <FiCheckCircle className="w-4 h-4 text-green-500" />
                                <span>{completedGoals}/{totalGoals} mål klara</span>
                              </span>
                            ) : (
                              <span className="text-orange-600">Klicka för att se förslag på mål</span>
                            )}
                          </p>
                          {totalGoals > 0 && (
                            <div className="flex-1 max-w-xs">
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(completedGoals / totalGoals) * 100}%` }}
                                  className="h-full bg-gradient-to-r from-green-500 to-teal-600"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FiChevronDown className="w-5 h-5 text-gray-400" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 bg-gray-50"
                    >
                      <div className="p-6 space-y-4">
                        {/* Active goals */}
                        {weekGoals.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Aktiva mål</h4>
                            {weekGoals.map((goal) => (
                              <motion.div
                                key={goal.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className={`flex items-center justify-between p-4 rounded-lg border ${
                                  goal.status === 'completed' 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                } transition-all`}
                              >
                                <div className="flex items-center space-x-3 flex-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleGoalCompletion(goal.id, goal.status);
                                    }}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                      goal.status === 'completed'
                                        ? 'bg-green-600 border-green-600 text-white'
                                        : 'border-gray-300 hover:border-green-500'
                                    }`}
                                  >
                                    {goal.status === 'completed' && <FiCheck className="w-3 h-3" />}
                                  </button>
                                  <div className="flex-1">
                                    <h5 className={`font-medium ${
                                      goal.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                                    }`}>
                                      {goal.title}
                                    </h5>
                                    {goal.description && (
                                      <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {goal.priority === 'high' ? 'Hög' : goal.priority === 'medium' ? 'Medel' : 'Låg'}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        {/* Suggested goals */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">
                            {weekGoals.length > 0 ? 'Förslag på fler mål' : 'Förslag på mål för veckan'}
                          </h4>
                          {predefinedGoals.map((predefinedGoal, index) => {
                            const isAlreadyActive = weekGoals.some(g => g.title === predefinedGoal.title);
                            if (isAlreadyActive) return null;
                            
                            return (
                              <motion.div
                                key={index}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center justify-between p-4 rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-orange-400 transition-all group"
                              >
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className="text-2xl">{predefinedGoal.icon}</div>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-800 group-hover:text-gray-900">
                                      {predefinedGoal.title.replace(predefinedGoal.icon, '').trim()}
                                    </h5>
                                    <p className="text-sm text-gray-600 mt-1">{predefinedGoal.description}</p>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    activatePredefinedGoal(week.number, predefinedGoal);
                                  }}
                                  disabled={loading}
                                  className="ml-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                                >
                                  Lägg till
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <Link
                            href={`/dashboard/courses/functional-basics/week/${week.number}`}
                            className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
                          >
                            <span>Gå till vecka {week.number}</span>
                            <FiArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Skapa nytt mål</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await createGoal({
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  category: formData.get('category') as any,
                  priority: formData.get('priority') as any,
                  weekNumber: parseInt(formData.get('weekNumber') as string),
                  courseId: 'functional-basics'
                });
                setShowNewGoalModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Vad vill du uppnå?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beskrivning
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Beskriv ditt mål mer detaljerat..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vecka
                  </label>
                  <select
                    name="weekNumber"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6].map(week => (
                      <option key={week} value={week}>Vecka {week}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    name="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="weekly">Veckomål</option>
                    <option value="nutrition">Näring</option>
                    <option value="health">Hälsa</option>
                    <option value="exercise">Träning</option>
                    <option value="general">Allmänt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioritet
                </label>
                <select
                  name="priority"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="low">Låg</option>
                  <option value="medium">Medium</option>
                  <option value="high">Hög</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  Skapa mål
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 
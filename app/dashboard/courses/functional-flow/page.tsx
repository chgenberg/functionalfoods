'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiClock, FiTarget, FiCheckCircle, FiPlus, FiBook, FiDownload,
  FiTrendingUp, FiAward, FiStar, FiActivity, FiHeart, FiZap, FiEdit3, FiChevronDown, FiCheck, FiArrowRight, FiUsers
} from 'react-icons/fi';
import { useGoals } from '@/app/hooks/useGoals';
import Link from 'next/link';
import { GiMeal } from 'react-icons/gi';
import { FiShoppingCart, FiX } from 'react-icons/fi';

// Fördefinierade mål för varje vecka (5-10 mål per vecka)
const PREDEFINED_GOALS = {
  1: [
    { title: "🚀 Starta din Flow-resa", description: "Genomför introduktionsmodulerna och sätt dina långsiktiga mål", category: "weekly" as const, priority: "high" as const, icon: "🚀" },
    { title: "🔥 Optimera ditt näringsintag", description: "Analysera och förbättra dina nuvarande näringsvanor", category: "nutrition" as const, priority: "high" as const, icon: "🔥" },
    { title: "📊 Sporta dina makronutrienter", description: "Börja följa proteiner, kolhydrater och fetter dagligen", category: "nutrition" as const, priority: "medium" as const, icon: "📊" },
    { title: "💪 Integrera avancerade superfoods", description: "Lägg till 5 nya functional foods i din kost", category: "nutrition" as const, priority: "medium" as const, icon: "💪" },
    { title: "🎯 Personalisera din kostplan", description: "Anpassa recepten efter dina specifika hälsomål", category: "weekly" as const, priority: "high" as const, icon: "🎯" },
    { title: "🧬 Lär dig om bioaktiva föreningar", description: "Fördjupa dig i polyfenoleraämnena och dess effekter", category: "weekly" as const, priority: "medium" as const, icon: "🧬" },
    { title: "⚡ Optimera din energinivå", description: "Implementera strategier för stadig energi hela dagen", category: "health" as const, priority: "high" as const, icon: "⚡" }
  ],
  2: [
    { title: "🏋️ Avancerad proteinoptimering", description: "Lär dig om aminosyraprofiler och proteintiming", category: "nutrition" as const, priority: "high" as const, icon: "🏋️" },
    { title: "🌟 Implementera näringssynergier", description: "Kombinera näringämnen för maximal absorption", category: "nutrition" as const, priority: "medium" as const, icon: "🌟" },
    { title: "🔬 Experimentera med nya recept", description: "Testa 3 avancerade Flow-recept denna vecka", category: "weekly" as const, priority: "medium" as const, icon: "🔬" },
    { title: "📈 Optimera din träning", description: "Anpassa kosten för att stödja dina träningsresultat", category: "health" as const, priority: "medium" as const, icon: "📈" },
    { title: "🎨 Skapa egna superfood-kombinationer", description: "Utveckla personliga superfood-mixar", category: "nutrition" as const, priority: "low" as const, icon: "🎨" }
  ],
  3: [
    { title: "🌊 Mästra kolhydratperiodisering", description: "Lär dig när och hur du ska äta olika kolhydrater", category: "nutrition" as const, priority: "high" as const, icon: "🌊" },
    { title: "🔥 Optimera din metabolism", description: "Implementera strategier för förbättrad ämnesomsättning", category: "health" as const, priority: "high" as const, icon: "🔥" },
    { title: "🧘 Integrera mindful eating", description: "Praktisera medveten närvaro under måltider", category: "weekly" as const, priority: "medium" as const, icon: "🧘" },
    { title: "💎 Fördjupa dina Flow-kunskaper", description: "Studera avancerad näringsforskning", category: "weekly" as const, priority: "medium" as const, icon: "💎" },
    { title: "🎪 Experimentera med intermittent fasting", description: "Utforska olika fastescheman som stödjer dina mål", category: "health" as const, priority: "low" as const, icon: "🎪" }
  ],
  4: [
    { title: "🚀 Maximera näringsabsorption", description: "Lär dig tekniker för optimal näringsupptag", category: "nutrition" as const, priority: "high" as const, icon: "🚀" },
    { title: "🌟 Skapa din personliga superfood-lista", description: "Identifiera de mest kraftfulla livsmedlen för dig", category: "nutrition" as const, priority: "high" as const, icon: "🌟" },
    { title: "🔬 Avancerad måltidsplanering", description: "Utveckla sofistikerade måltidsstrategier", category: "weekly" as const, priority: "medium" as const, icon: "🔬" },
    { title: "💪 Optimera återhämtning", description: "Använd nutrition för förbättrad återhämtning", category: "health" as const, priority: "medium" as const, icon: "💪" }
  ],
  5: [
    { title: "🎯 Finslipa din Flow-strategi", description: "Anpassa och optimera din personliga approach", category: "weekly" as const, priority: "high" as const, icon: "🎯" },
    { title: "🌊 Mästra avancerade tekniker", description: "Implementera sofistikerade näringsstrategier", category: "nutrition" as const, priority: "high" as const, icon: "🌊" },
    { title: "📈 Tracka dina framsteg", description: "Utvärdera och dokumentera dina resultat", category: "health" as const, priority: "medium" as const, icon: "📈" },
    { title: "🔥 Fördjupa energioptimering", description: "Avancerade tekniker för energibalans", category: "health" as const, priority: "medium" as const, icon: "🔥" }
  ],
  6: [
    { title: "🏆 Skapa din långsiktiga plan", description: "Utveckla en hållbar strategi för framtiden", category: "weekly" as const, priority: "high" as const, icon: "🏆" },
    { title: "🌟 Bli en Flow-expert", description: "Integrera alla lärdomar till en helhet", category: "weekly" as const, priority: "high" as const, icon: "🌟" },
    { title: "📚 Dela dina erfarenheter", description: "Hjälp andra i Flow-communityn", category: "weekly" as const, priority: "medium" as const, icon: "📚" },
    { title: "🚀 Sätt nya utmaningar", description: "Definiera nästa steg i din hälsoresa", category: "health" as const, priority: "medium" as const, icon: "🚀" }
  ]
};

export default function FunctionalFlowPage() {
  const { goals, createGoal, updateGoal, loading } = useGoals();
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

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
        courseId: 'functional-flow'
      });
    } catch (error) {
      console.error('Error activating goal:', error);
    }
  };

  // Funktion för att toggle mål som klart
  const toggleGoalCompletion = async (goalId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
    const progress = newStatus === 'completed' ? 100 : 0;
    
    try {
      await updateGoal({ 
        id: goalId,
        status: newStatus, 
        progress,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
      });
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const weeks = [
    { number: 1, title: "Avancerad grund i Functional Foods", status: "current" },
    { number: 2, title: "Proteinoptimering och synergier", status: "upcoming" },
    { number: 3, title: "Kolhydratperiodisering och metabolism", status: "upcoming" },
    { number: 4, title: "Maximal näringsabsorption", status: "upcoming" },
    { number: 5, title: "Avancerade Flow-tekniker", status: "upcoming" },
    { number: 6, title: "Mästerskap och framtidsplanering", status: "upcoming" }
  ];

  return (
    <div className="space-y-4 md:space-y-8 pb-20 md:pb-8">
      {/* Intro Video Section - Mobile Optimized */}
      <div className="relative bg-gradient-to-br from-teal-900 via-cyan-800 to-teal-700 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 p-4 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="bg-white/20 rounded-full p-2 md:p-3">
                  <FiZap className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold text-white">Functional Flow</h1>
                  <p className="text-sm md:text-base text-teal-100">Avancerad näringslära för optimal hälsa</p>
                </div>
              </div>
              
              <p className="text-sm md:text-base text-teal-100 mb-4 md:mb-6 leading-relaxed">
                Ta din hälsa till nästa nivå med avancerade tekniker inom functional foods. 
                Lär dig optimera din nutrition för maximal energi, prestation och välmående.
              </p>
              
              <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
                <div className="flex items-center gap-1 md:gap-2 text-white/90">
                  <FiClock className="w-3 h-3 md:w-4 md:h-4" />
                  <span>6 veckor</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 text-white/90">
                  <FiUsers className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Avancerad nivå</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 text-white/90">
                  <FiTarget className="w-3 h-3 md:w-4 md:h-4" />
                  <span>78 premium recept</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowVideoModal(true)}
              className="flex items-center gap-2 md:gap-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-white font-medium transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
            >
              <FiPlay className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Se introduktion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions - Mobile First */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Link href="/dashboard/courses/functional-flow/kostschema" 
              className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-gray-100">
          <div className="flex flex-col items-center text-center gap-2 md:gap-3">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg md:rounded-xl p-2 md:p-3">
              <GiMeal className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Kostschema</h3>
              <p className="text-xs md:text-sm text-gray-600">Avancerade måltider</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/courses/functional-flow/inkopslista" 
              className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-gray-100">
          <div className="flex flex-col items-center text-center gap-2 md:gap-3">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg md:rounded-xl p-2 md:p-3">
              <FiShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Inköpslistor</h3>
              <p className="text-xs md:text-sm text-gray-600">Smarta listor</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/courses/functional-flow/goals" 
              className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-gray-100">
          <div className="flex flex-col items-center text-center gap-2 md:gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg md:rounded-xl p-2 md:p-3">
              <FiTarget className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Mål</h3>
              <p className="text-xs md:text-sm text-gray-600">Spåra framsteg</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/courses/functional-flow/material" 
              className="bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border border-gray-100">
          <div className="flex flex-col items-center text-center gap-2 md:gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-xl p-2 md:p-3">
              <FiBook className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Material</h3>
              <p className="text-xs md:text-sm text-gray-600">Avancerat innehåll</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Course Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-8 border border-gray-100"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Ditt Flow-program</h2>
            <p className="text-sm md:text-base text-gray-600">6 veckor av avancerad näringslära och optimization</p>
          </div>
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base font-medium">
            Vecka 1 av 6
          </div>
        </div>

        <div className="space-y-3 md:space-y-4">
          {weeks.map((week) => {
            const weekGoals = goalsByWeek[week.number] || [];
            const completedGoals = weekGoals.filter(goal => goal.status === 'completed').length;
            const totalGoals = weekGoals.length;
            const predefinedGoals = PREDEFINED_GOALS[week.number as keyof typeof PREDEFINED_GOALS] || [];
            const availableGoals = predefinedGoals.filter(predefined => 
              !weekGoals.some(existing => existing.title === predefined.title)
            );
            
            return (
              <motion.div
                key={week.number}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: week.number * 0.1 }}
                className={`border rounded-xl md:rounded-2xl p-4 md:p-6 transition-all duration-300 ${
                  week.status === 'current' 
                    ? 'border-teal-200 bg-teal-50' 
                    : week.status === 'completed'
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-teal-200 hover:bg-teal-50/30'
                }`}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedWeek(expandedWeek === week.number ? null : week.number)}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-base ${
                      week.status === 'current' 
                        ? 'bg-teal-500 text-white' 
                        : week.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {week.status === 'completed' ? <FiCheck className="w-4 h-4 md:w-5 md:h-5" /> : week.number}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-lg">{week.title}</h3>
                      <p className="text-xs md:text-sm text-gray-600">
                        {totalGoals > 0 ? `${completedGoals}/${totalGoals} mål klara` : 'Inga mål satta ännu'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-3">
                    {week.status === 'current' && (
                      <Link 
                        href={`/dashboard/courses/functional-flow/week/${week.number}`}
                        className="bg-teal-500 hover:bg-teal-600 text-white px-3 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
                      >
                        Fortsätt
                      </Link>
                    )}
                    <FiChevronDown className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform ${
                      expandedWeek === week.number ? 'rotate-180' : ''
                    }`} />
                  </div>
                </div>

                <AnimatePresence>
                  {expandedWeek === week.number && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200"
                    >
                      {/* Aktiva mål */}
                      {weekGoals.length > 0 && (
                        <div className="mb-4 md:mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Dina aktiva mål</h4>
                          <div className="space-y-2 md:space-y-3">
                            {weekGoals.map((goal) => (
                              <div
                                key={goal.id}
                                className={`flex items-start gap-3 p-3 md:p-4 rounded-lg transition-all ${
                                  goal.status === 'completed' 
                                    ? 'bg-green-100 border border-green-200' 
                                    : 'bg-white border border-gray-200 hover:border-teal-200'
                                }`}
                              >
                                <button
                                  onClick={() => toggleGoalCompletion(goal.id, goal.status)}
                                  className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    goal.status === 'completed'
                                      ? 'bg-green-500 border-green-500 text-white'
                                      : 'border-gray-300 hover:border-teal-500'
                                  }`}
                                >
                                  {goal.status === 'completed' && <FiCheck className="w-3 h-3 md:w-4 md:h-4" />}
                                </button>
                                <div className="flex-1">
                                  <h5 className={`font-medium text-sm md:text-base ${
                                    goal.status === 'completed' ? 'text-green-800 line-through' : 'text-gray-900'
                                  }`}>
                                    {goal.title}
                                  </h5>
                                  <p className={`text-xs md:text-sm ${
                                    goal.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                                  }`}>
                                    {goal.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fördefinierade mål */}
                      {availableGoals.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm md:text-base">Föreslagna mål för veckan</h4>
                          <div className="grid gap-2 md:gap-3">
                            {availableGoals.map((predefinedGoal, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-teal-200 hover:bg-teal-50/50 transition-all"
                              >
                                <div className="text-lg md:text-xl">{predefinedGoal.icon}</div>
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 text-sm md:text-base">{predefinedGoal.title}</h5>
                                  <p className="text-gray-600 text-xs md:text-sm">{predefinedGoal.description}</p>
                                </div>
                                <button
                                  onClick={() => activatePredefinedGoal(week.number, predefinedGoal)}
                                  disabled={loading}
                                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white p-1 md:p-2 rounded-lg transition-colors"
                                >
                                  <FiPlus className="w-3 h-3 md:w-4 md:h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg p-2 md:p-3">
              <FiTrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Framsteg</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">16%</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-lg p-2 md:p-3">
              <FiTarget className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Klara mål</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">
                {Object.values(goalsByWeek).flat().filter(goal => goal.status === 'completed').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-2 md:p-3">
              <FiActivity className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Aktiva dagar</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-2 md:p-3">
              <FiAward className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Nivå</p>
              <p className="text-lg md:text-xl font-bold text-gray-900">Expert</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-bold text-gray-900">Välkommen till Functional Flow</h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                </button>
              </div>
              
              <div className="aspect-video bg-gray-900 rounded-xl md:rounded-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <FiPlay className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm md:text-base opacity-75">Introduktionsvideo kommer snart</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
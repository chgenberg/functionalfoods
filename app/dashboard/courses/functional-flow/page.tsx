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
    { title: "🏆 Slutför ditt Flow-program", description: "Genomför slutbedömningen och reflektera över din resa", category: "weekly" as const, priority: "high" as const, icon: "🏆" },
    { title: "🚀 Planera nästa steg", description: "Skapa en långsiktig hälsoplan för framtiden", category: "weekly" as const, priority: "high" as const, icon: "🚀" },
    { title: "📊 Utvärdera dina resultat", description: "Analysera dina framsteg och dokumentera insikter", category: "health" as const, priority: "medium" as const, icon: "📊" },
    { title: "🌟 Dela din framgång", description: "Inspirera andra genom att dela din transformation", category: "weekly" as const, priority: "low" as const, icon: "🌟" }
  ]
};

export default function FunctionalFlowPage() {
  const [currentWeek, setCurrentWeek] = useState(4);
  const { goals, loading, createGoal, toggleGoalStatus } = useGoals();
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  // Group goals by week
  const goalsByWeek = goals.reduce((acc, goal) => {
    const week = goal.weekNumber || 1;
    if (!acc[week]) acc[week] = [];
    acc[week].push(goal);
    return acc;
  }, {} as Record<number, typeof goals>);

  const weeks = [
    { number: 1, title: 'Vecka 1: Flow Foundation', status: 'completed' },
    { number: 2, title: 'Vecka 2: Avancerad optimering', status: 'completed' },
    { number: 3, title: 'Vecka 3: Biohacking', status: 'completed' },
    { number: 4, title: 'Vecka 4: Personalisering', status: 'current' },
    { number: 5, title: 'Vecka 5: Masterclass', status: 'upcoming' },
    { number: 6, title: 'Vecka 6: Integration', status: 'upcoming' },
  ];

  const handleActivateGoal = async (predefinedGoal: any, weekNumber: number) => {
    await createGoal({
      title: predefinedGoal.title,
      description: predefinedGoal.description,
      category: predefinedGoal.category,
      priority: predefinedGoal.priority,
      weekNumber: weekNumber,
      courseId: 'functional-flow'
    });
  };

  const handleCompleteGoal = async (goalId: string) => {
    await toggleGoalStatus(goalId);
  };

  const activePredefinedGoals = Object.entries(PREDEFINED_GOALS).flatMap(([week, goals]) => 
    goals.map(goal => ({ ...goal, week: parseInt(week) }))
  );

  // Calculate overall progress
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const progress = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-8">
        {/* Welcome Section - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-xl md:rounded-2xl shadow-xl p-6 md:p-8 text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-bold">Välkommen till Functional Flow!</h1>
              <p className="text-base md:text-lg text-white/90">
                Du är nu på vecka {currentWeek} av ditt avancerade hälsoprogram
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/dashboard/courses/functional-flow/week/4"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <FiPlay className="w-5 h-5" />
                Fortsätt vecka {currentWeek}
              </Link>
              <Link 
                href="/dashboard/courses/functional-flow/kostschema"
                className="bg-white text-teal-700 hover:bg-white/90 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <GiMeal className="w-5 h-5" />
                Mitt kostschema
              </Link>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/80">Framsteg</span>
              <span className="font-medium">{completedGoals} av {totalGoals} mål klara</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-white to-yellow-300 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Link 
            href="/dashboard/courses/functional-flow/goals"
            className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiTarget className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm md:text-base">Mina mål</h3>
              <p className="text-xs text-gray-600">{goals.filter(g => g.status === 'active').length} aktiva</p>
            </div>
          </Link>

          <Link 
            href="/dashboard/courses/functional-flow/material"
            className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiBook className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm md:text-base">Kursmaterial</h3>
              <p className="text-xs text-gray-600">Flow-guider</p>
            </div>
          </Link>

          <Link 
            href="/dashboard/courses/functional-flow/community"
            className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiUsers className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm md:text-base">Community</h3>
              <p className="text-xs text-gray-600">Flow-gruppen</p>
            </div>
          </Link>

          <Link 
            href="/dashboard/courses/functional-flow/downloads"
            className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 group"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiDownload className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900 text-sm md:text-base">Nedladdningar</h3>
              <p className="text-xs text-gray-600">PDF & mer</p>
            </div>
          </Link>
        </div>

        {/* Shopping List Banner */}
        <Link 
          href="/dashboard/courses/functional-flow/inkopslista"
          className="block bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg md:rounded-xl p-4 md:p-6 shadow-md hover:shadow-lg transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 group-hover:scale-110 transition-transform">
                <FiShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-base md:text-lg">Veckans inköpslista</h3>
                <p className="text-white/80 text-sm">Optimerade ingredienser för Flow-vecka {currentWeek}</p>
              </div>
            </div>
            <FiArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-2 transition-transform" />
          </div>
        </Link>

        {/* Weekly Progress - Mobile Optimized */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Förbestämda mål per vecka</h2>
            <div className="text-xs md:text-sm text-gray-600">
              Avancerade mål för optimal Flow-progression
            </div>
          </div>
          
          <div className="space-y-3 md:space-y-4">
            {weeks.map((week) => {
              const weekGoals = goalsByWeek[week.number] || [];
              const predefinedGoals = PREDEFINED_GOALS[week.number as keyof typeof PREDEFINED_GOALS] || [];
              const completedGoals = weekGoals.filter(g => g.status === 'completed').length;
              const totalGoals = weekGoals.length;
              const isExpanded = expandedWeek === week.number;
              
              return (
                <motion.div
                  key={week.number}
                  className={`border-2 rounded-lg md:rounded-xl overflow-hidden transition-all ${
                    isExpanded ? 'border-teal-500 shadow-md md:shadow-lg' : 'border-gray-200'
                  }`}
                  initial={false}
                >
                  <div 
                    className={`p-4 md:p-6 cursor-pointer transition-colors ${
                      isExpanded ? 'bg-teal-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setExpandedWeek(isExpanded ? null : week.number)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 md:space-x-4 flex-1">
                        <div className={`
                          w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center font-bold text-white text-sm md:text-base
                          ${week.number === 1 ? 'bg-gradient-to-r from-teal-500 to-cyan-600' : 
                            week.number === 2 ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                            week.number === 3 ? 'bg-gradient-to-r from-purple-500 to-pink-600' :
                            week.number === 4 ? 'bg-gradient-to-r from-green-500 to-teal-600' :
                            week.number === 5 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                            'bg-gradient-to-r from-red-500 to-pink-600'}
                        `}>
                          {week.number}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base">{week.title}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                            <p className="text-xs md:text-sm text-gray-600">
                              {totalGoals > 0 ? (
                                <span className="flex items-center space-x-1">
                                  <FiCheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                                  <span>{completedGoals}/{totalGoals} mål klara</span>
                                </span>
                              ) : (
                                <span className="text-teal-600">Klicka för att se avancerade mål</span>
                              )}
                            </p>
                            {totalGoals > 0 && (
                              <div className="flex-1 max-w-full sm:max-w-xs">
                                <div className="w-full h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
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
                      
                      <div className="flex items-center gap-2 ml-2">
                        {week.status === 'current' && (
                          <Link 
                            href={`/dashboard/courses/functional-flow/week/${week.number}`}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-teal-500 hover:bg-teal-600 text-white px-3 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors"
                          >
                            Fortsätt
                          </Link>
                        )}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <FiChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
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
                        <div className="p-4 md:p-6 space-y-4">
                          {/* Active goals */}
                          {weekGoals.length > 0 && (
                            <div className="space-y-2 md:space-y-3">
                              <h4 className="font-medium text-gray-900 text-sm md:text-base">Dina aktiva mål:</h4>
                              {weekGoals.map((goal) => (
                                <div 
                                  key={goal.id}
                                  className={`flex items-start gap-3 p-3 md:p-4 rounded-lg ${
                                    goal.status === 'completed' ? 'bg-green-50' : 'bg-white'
                                  } border border-gray-200`}
                                >
                                  <button
                                    onClick={() => goal.status !== 'completed' && handleCompleteGoal(goal.id)}
                                    className={`mt-0.5 ${
                                      goal.status === 'completed' 
                                        ? 'text-green-500 cursor-default' 
                                        : 'text-gray-400 hover:text-green-500'
                                    }`}
                                    disabled={goal.status === 'completed'}
                                  >
                                    {goal.status === 'completed' ? (
                                      <FiCheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                                    ) : (
                                      <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-current rounded-full" />
                                    )}
                                  </button>
                                  <div className="flex-1">
                                    <p className={`font-medium text-sm md:text-base ${
                                      goal.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                                    }`}>
                                      {goal.title}
                                    </p>
                                    {goal.description && (
                                      <p className="text-xs md:text-sm text-gray-600 mt-1">{goal.description}</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Predefined goals suggestions */}
                          {predefinedGoals.length > 0 && (
                            <div className="space-y-2 md:space-y-3">
                              <h4 className="font-medium text-gray-900 text-sm md:text-base">
                                {weekGoals.length > 0 ? 'Fler förslag:' : 'Föreslagna Flow-mål:'}
                              </h4>
                              {predefinedGoals
                                .filter(pg => !weekGoals.some(g => g.title === pg.title))
                                .map((goal, index) => (
                                  <div 
                                    key={index}
                                    className="flex items-start gap-3 p-3 md:p-4 bg-white rounded-lg border border-gray-200 hover:border-teal-300 transition-colors"
                                  >
                                    <span className="text-xl md:text-2xl">{goal.icon}</span>
                                    <div className="flex-1">
                                      <p className="font-medium text-gray-900 text-sm md:text-base">{goal.title}</p>
                                      <p className="text-xs md:text-sm text-gray-600 mt-1">{goal.description}</p>
                                      <button
                                        onClick={() => handleActivateGoal(goal, week.number)}
                                        className="mt-2 text-xs md:text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                                      >
                                        <FiPlus className="w-3 h-3 md:w-4 md:h-4" />
                                        Aktivera detta mål
                                      </button>
                                    </div>
                                  </div>
                              ))}
                            </div>
                          )}

                          {/* Week navigation button */}
                          {(week.status === 'current' || week.status === 'completed') && (
                            <div className="pt-2 md:pt-4 border-t border-gray-200">
                              <Link
                                href={`/dashboard/courses/functional-flow/week/${week.number}`}
                                className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 md:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                Gå till vecka {week.number}
                                <FiArrowRight className="w-4 h-4" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Motivational section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-6 md:py-8"
        >
          <p className="text-gray-600 text-sm md:text-base">
            Du har gjort fantastiska framsteg! 🎉 Fortsätt med ditt Flow-program för att nå nya höjder.
          </p>
        </motion.div>
      </div>
    </div>
  );
} 
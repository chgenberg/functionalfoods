'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiClock, FiTarget, FiCheckCircle, FiPlus, FiBook, FiDownload,
  FiTrendingUp, FiAward, FiStar, FiActivity, FiHeart, FiZap, FiEdit3, FiChevronDown, FiCheck, FiArrowRight, FiUsers,
  FiShoppingCart, FiX, FiHelpCircle
} from 'react-icons/fi';
import { useGoals } from '@/app/hooks/useGoals';
import Link from 'next/link';
import OnboardingModal from '@/app/components/OnboardingModal';

// Fördefinierade mål för varje vecka (5-10 mål per vecka)
const PREDEFINED_GOALS = {
  1: [
    { title: "🚀 Starta din Flow-resa", description: "Genomför introduktionsmodulerna och sätt dina långsiktiga mål", category: "weekly" as const, priority: "high" as const, icon: "🚀" },
    { title: "🔥 Optimera ditt näringsintag", description: "Analysera och förbättra dina nuvarande näringsvanor", category: "nutrition" as const, priority: "high" as const, icon: "🔥" },
    { title: "📊 Spåra dina makronutrienter", description: "Börja följa proteiner, kolhydrater och fetter dagligen", category: "nutrition" as const, priority: "medium" as const, icon: "📊" },
    { title: "💪 Integrera avancerade superfoods", description: "Lägg till 5 nya functional foods i din kost", category: "nutrition" as const, priority: "medium" as const, icon: "💪" },
    { title: "🎯 Personalisera din kostplan", description: "Anpassa recepten efter dina specifika hälsomål", category: "weekly" as const, priority: "high" as const, icon: "🎯" },
    { title: "🧬 Lär dig om bioaktiva föreningar", description: "Fördjupa dig i polyfenolerämnena och dess effekter", category: "weekly" as const, priority: "medium" as const, icon: "🧬" },
    { title: "⚡ Optimera din energinivå", description: "Implementera strategier för stadig energi hela dagen", category: "health" as const, priority: "high" as const, icon: "⚡" }
  ],
  2: [
    { title: "🏋️ Avancerad proteinoptimering", description: "Lär dig om aminosyraprofiler och proteintiming", category: "nutrition" as const, priority: "high" as const, icon: "🏋️" },
    { title: "🌟 Implementera näringssynergier", description: "Kombinera näringsämnen för maximal absorption", category: "nutrition" as const, priority: "medium" as const, icon: "🌟" },
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
    { title: "🏆 Slutför Flow-programmet", description: "Genomför slututvärdering och reflektera över din resa", category: "weekly" as const, priority: "high" as const, icon: "🏆" },
    { title: "📚 Skapa din långsiktiga plan", description: "Utveckla en hållbar plan för fortsatt hälsooptimering", category: "weekly" as const, priority: "high" as const, icon: "📚" },
    { title: "🌟 Dela dina framsteg", description: "Inspirera andra genom att dela din transformation", category: "weekly" as const, priority: "medium" as const, icon: "🌟" },
    { title: "🎉 Fira dina framgångar", description: "Ta tid att uppskatta hur långt du kommit", category: "health" as const, priority: "medium" as const, icon: "🎉" }
  ]
};

export default function FunctionalFlowPage() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const { goals, loading, createGoal, updateGoal } = useGoals();
  const [showAllGoals, setShowAllGoals] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(()=>{
    const hasOnboarding = localStorage.getItem('onboarding_v1');
    if (!hasOnboarding) setShowOnboarding(true);
  }, []);

  // Group goals by week
  const goalsByWeek = goals.reduce((acc, goal) => {
    const week = goal.weekNumber || 1;
    if (!acc[week]) acc[week] = [];
    acc[week].push(goal);
    return acc;
  }, {} as Record<number, typeof goals>);

  // Funktion för att aktivera fördefinierade mål
  const activatePredefinedGoal = async (predefinedGoal: any, weekNumber: number) => {
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
    { number: 1, title: "Flow Foundation", status: "current", color: "#014421" },
    { number: 2, title: "Avancerad optimering", status: "upcoming", color: "#0D5C29" },
    { number: 3, title: "Biohacking", status: "upcoming", color: "#167531" },
    { number: 4, title: "Personalisering", status: "upcoming", color: "#1F8E39" },
    { number: 5, title: "Masterclass", status: "upcoming", color: "#28A741" },
    { number: 6, title: "Integration", status: "upcoming", color: "#31C049" }
  ];

  return (
    <div className="relative space-y-4 md:space-y-8 pb-20 md:pb-8">
      <div className="grid grid-cols-3 gap-2 sticky top-16 z-30">
        <Link href="/dashboard/courses/functional-flow/kostschema?view=week&week=1" className="text-center text-xs bg-white rounded-lg shadow px-3 py-2 hover:shadow-md">Veckans kostschema</Link>
        <Link href="/dashboard/courses/functional-flow/inkopslista?week=1" className="text-center text-xs bg-white rounded-lg shadow px-3 py-2 hover:shadow-md">Veckans inköpslista</Link>
        <Link href="/dashboard/courses/functional-flow/goals" className="text-center text-xs bg-white rounded-lg shadow px-3 py-2 hover:shadow-md">Veckans mål</Link>
      </div>
      {/* Intro Video Section - Mobile Optimized */}
      <div className="relative bg-gradient-to-br from-teal-900 via-cyan-800 to-teal-700 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 p-4 sm:p-6 md:p-12">
          <div className="flex flex-col justify-center space-y-4 md:space-y-6 z-10 order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
                FUNCTIONAL FLOW
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-teal-100 mb-4 md:mb-6">
                6 veckors avancerat hälsoprogram med Ulrika Davidsson
              </p>
              <div className="flex flex-wrap gap-3 md:gap-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl px-4 py-2 md:px-6 md:py-3">
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 md:w-5 md:h-5 text-teal-100" />
                    <span className="text-white font-medium text-sm md:text-base">5:32</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl px-4 py-2 md:px-6 md:py-3">
                  <div className="flex items-center space-x-2">
                    <FiTarget className="w-4 h-4 md:w-5 md:h-5 text-teal-100" />
                    <span className="text-white font-medium text-sm md:text-base">0/6 veckor</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group cursor-pointer order-1 md:order-2"
            onClick={() => setShowVideoModal(true)}
          >
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
              <img
                src="/flow.JPG"
                alt="Functional Flow"
                className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/90 backdrop-blur-sm rounded-full p-4 md:p-6 shadow-xl md:shadow-2xl transform transition-all duration-300 group-hover:bg-white"
                >
                  <FiPlay className="w-6 h-6 md:w-8 md:h-8 text-teal-700 ml-0.5 md:ml-1" />
                </motion.div>
              </div>
              
              {/* Video Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h3 className="text-lg md:text-xl text-white font-semibold">Välkommen till Functional Flow</h3>
                <p className="text-sm text-white/80 mt-1">Introduktion med Ulrika</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Week Navigation - Mobile Optimized */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800">Veckoöversikt</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {weeks.map((week) => (
            <Link
              key={week.number}
              href={`/dashboard/courses/functional-flow/kostschema?view=week&week=${week.number}`}
              className={`
                relative p-3 md:p-4 rounded-lg md:rounded-xl text-center transition-all duration-300
                ${week.status === 'current' 
                  ? 'text-white shadow-lg transform scale-105' 
                  : week.status === 'completed'
                  ? 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              style={week.status === 'current' ? { backgroundColor: week.color } : {}}
            >
              <div className="text-xs md:text-sm font-medium mb-1">Vecka {week.number}</div>
              <div className="text-xs font-normal line-clamp-2">{week.title}</div>
              {week.status === 'completed' && (
                <FiCheckCircle className="absolute top-2 right-2 w-4 h-4 text-teal-600" />
              )}
              {week.status === 'current' && (
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-orange-500 rounded-full animate-pulse"></div>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Goals Section - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Active Goals */}
        <div className="lg:col-span-2 bg-white rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Mina aktiva mål</h2>
            <button
              onClick={() => setShowAllGoals(!showAllGoals)}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 text-sm md:text-base"
            >
              <FiPlus className="w-4 h-4" />
              Lägg till mål
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {goals.filter(goal => goal.status !== 'completed').length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <div className="text-gray-400 mb-4">
                    <FiTarget className="w-12 h-12 md:w-16 md:h-16 mx-auto" />
                  </div>
                  <p className="text-gray-600 mb-4">Inga aktiva mål just nu</p>
                  <button
                    onClick={() => setShowAllGoals(true)}
                    className="text-teal-600 hover:text-teal-700 font-medium text-sm md:text-base"
                  >
                    Välj från fördefinierade mål →
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {goals.filter(goal => goal.status !== 'completed').map((goal) => (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <button
                          onClick={() => toggleGoalCompletion(goal.id, goal.status)}
                          className={`
                            mt-0.5 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 transition-all duration-300 flex-shrink-0
                            ${goal.status === 'completed' 
                              ? 'bg-teal-600 border-teal-600' 
                              : 'border-gray-300 hover:border-teal-600'
                            }
                          `}
                        >
                          {goal.status === 'completed' && (
                            <FiCheck className="w-3 h-3 md:w-4 md:h-4 text-white mx-auto" />
                          )}
                        </button>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm md:text-base">{goal.title}</h3>
                          <p className="text-xs md:text-sm text-gray-600 mt-1">{goal.description}</p>
                          <div className="flex items-center gap-3 md:gap-4 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                              goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {goal.priority === 'high' ? 'Hög' : goal.priority === 'medium' ? 'Medium' : 'Låg'} prio
                            </span>
                            <span className="text-xs text-gray-500">Vecka {goal.weekNumber}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          {/* Shopping List */}
          <Link 
            href="/dashboard/courses/functional-flow/inkopslista"
            className="block bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg md:text-xl mb-1">Veckans inköpslista</h3>
                <p className="text-sm md:text-base text-orange-100">Optimerade ingredienser för Flow-vecka {currentWeek}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FiShoppingCart className="w-6 h-6 md:w-8 md:h-8" />
              </div>
            </div>
          </Link>

          {/* Recipe Plan */}
          <Link 
            href="/dashboard/courses/functional-flow/kostschema?view=week&week=1"
            className="block bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg md:shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg md:text-xl mb-1">Mitt kostschema</h3>
                <p className="text-sm md:text-base text-purple-100">Flow-anpassade recept</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <FiBook className="w-6 h-6 md:w-8 md:h-8" />
              </div>
            </div>
          </Link>

          {/* Progress */}
          <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg md:shadow-xl">
            <h3 className="font-bold text-lg md:text-xl mb-3">Dina framsteg</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Avklarade mål</span>
                  <span>{goals.filter(g => g.status === 'completed').length}/{goals.length}</span>
                </div>
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-500"
                    style={{ width: `${goals.length > 0 ? (goals.filter(g => g.status === 'completed').length / goals.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm">Flow-nivå</span>
                <div className="flex items-center gap-1">
                  <FiStar className="w-4 h-4 fill-current" />
                  <FiStar className="w-4 h-4 fill-current" />
                  <FiStar className="w-4 h-4 fill-current" />
                  <FiStar className="w-4 h-4" />
                  <FiStar className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predefined Goals Modal */}
      <AnimatePresence>
        {showAllGoals && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAllGoals(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 md:p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800">Välj mål att aktivera</h2>
                  <button
                    onClick={() => setShowAllGoals(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                {Object.entries(PREDEFINED_GOALS).map(([weekNum, weekGoals]) => {
                  const weekNumber = parseInt(weekNum);
                  const weekGoalsActive = goalsByWeek[weekNumber] || [];
                  
                  return (
                    <div key={weekNum} className="mb-6 md:mb-8">
                      <button
                        onClick={() => setExpandedWeek(expandedWeek === weekNumber ? null : weekNumber)}
                        className="flex items-center justify-between w-full mb-3 md:mb-4 text-left"
                      >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                          Vecka {weekNum}: {weeks[weekNumber - 1]?.title}
                        </h3>
                        <FiChevronDown className={`w-5 h-5 transition-transform ${expandedWeek === weekNumber ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                        {(expandedWeek === null || expandedWeek === weekNumber) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-2 md:space-y-3"
                          >
                            {weekGoals.map((goal, index) => {
                              const isActive = weekGoalsActive.some(g => g.title === goal.title);
                              
                              return (
                                <div
                                  key={index}
                                  className={`
                                    p-3 md:p-4 rounded-lg border transition-all duration-300
                                    ${isActive 
                                      ? 'bg-teal-50 border-teal-300' 
                                      : 'bg-gray-50 border-gray-200 hover:border-teal-300 cursor-pointer'
                                    }
                                  `}
                                  onClick={() => !isActive && activatePredefinedGoal(goal, weekNumber)}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className="text-xl md:text-2xl">{goal.icon}</span>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-800 text-sm md:text-base">{goal.title}</h4>
                                      <p className="text-xs md:text-sm text-gray-600 mt-1">{goal.description}</p>
                                      <div className="flex items-center gap-3 mt-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                                          goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-gray-100 text-gray-700'
                                        }`}>
                                          {goal.priority === 'high' ? 'Hög' : goal.priority === 'medium' ? 'Medium' : 'Låg'} prioritet
                                        </span>
                                        {isActive && (
                                          <span className="text-xs text-teal-600 font-medium flex items-center gap-1">
                                            <FiCheck className="w-3 h-3" /> Aktiverat
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black rounded-xl overflow-hidden max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Functional Flow Introduction"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-4 bg-gray-900">
                <h3 className="text-white text-lg font-semibold">Välkommen till Functional Flow</h3>
                <p className="text-gray-400 text-sm mt-1">Introduktion med Ulrika Davidsson</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setShowGuide(true)}
        className="fixed right-4 bottom-24 sm:right-6 sm:bottom-6 z-40 bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all w-12 h-12 flex items-center justify-center"
        title="Visa hjälp"
        aria-label="Visa hjälp"
      >
        <FiHelpCircle className="w-5 h-5" />
      </button>
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('openChatBot'))}
        className="fixed right-4 bottom-40 sm:right-6 sm:bottom-24 z-40 bg-[#112A12] text-white rounded-full shadow-lg hover:shadow-xl transition-all w-12 h-12 flex items-center justify-center"
        title="Behöver du hjälp?"
        aria-label="Behöver du hjälp?"
      >
        ?
      </button>
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
    </div>
  );
} 
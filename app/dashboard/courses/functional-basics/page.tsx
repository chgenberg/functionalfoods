'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiClock, FiTarget, FiCheckCircle, FiPlus, FiBook, FiDownload,
  FiTrendingUp, FiAward, FiStar, FiActivity, FiHeart, FiZap, FiEdit3, FiChevronDown, FiCheck, FiArrowRight, FiUsers
} from 'react-icons/fi';
import { useGoals } from '@/app/hooks/useGoals';
import Link from 'next/link';

// Fördefinierade mål för varje vecka (5-10 mål per vecka)
const PREDEFINED_GOALS = {
  1: [
    { title: "📚 Läs grundmaterialet om Functional Foods", description: "Gå igenom alla artiklar i vecka 1 och ta anteckningar", category: "weekly" as const, priority: "high" as const, icon: "📚" },
    { title: "🍎 Identifiera 3 functional foods i ditt kök", description: "Hitta minst 3 livsmedel som räknas som functional foods", category: "nutrition" as const, priority: "medium" as const, icon: "🍎" },
    { title: "📝 Skriv ner dina nuvarande matvanor", description: "Dokumentera vad du äter under 3 dagar", category: "nutrition" as const, priority: "high" as const, icon: "📝" },
    { title: "🎯 Sätt dina personliga hälsomål", description: "Definiera 3 konkreta mål du vill uppnå med functional foods", category: "health" as const, priority: "high" as const, icon: "🎯" },
    { title: "💧 Drick 2 liter vatten dagligen", description: "Håll dig hydrerad hela veckan", category: "health" as const, priority: "medium" as const, icon: "💧" },
    { title: "🥗 Planera 3 functional foods-måltider", description: "Välj frukost, lunch och middag med functional foods", category: "nutrition" as const, priority: "medium" as const, icon: "🥗" },
    { title: "📖 Läs om antioxidanter", description: "Fördjupa dig i hur antioxidanter påverkar hälsan", category: "weekly" as const, priority: "low" as const, icon: "📖" }
  ],
  2: [
    { title: "🥩 Välj rätt proteinkällor", description: "Identifiera och köp in högkvalitativa proteiner", category: "nutrition" as const, priority: "high" as const, icon: "🥩" },
    { title: "🐟 Ät fisk minst 2 gånger", description: "Inkludera fisk rik på omega-3 i din kost", category: "nutrition" as const, priority: "high" as const, icon: "🐟" },
    { title: "🥜 Testa nya vegetabiliska proteiner", description: "Prova linser, quinoa eller andra växtproteiner", category: "nutrition" as const, priority: "medium" as const, icon: "🥜" },
    { title: "💪 Kombinera protein med träning", description: "Ät protein inom 30 min efter träning", category: "exercise" as const, priority: "medium" as const, icon: "💪" },
    { title: "📊 Beräkna ditt proteinbehov", description: "Använd formeln för att räkna ut ditt dagliga behov", category: "nutrition" as const, priority: "high" as const, icon: "📊" },
    { title: "🍳 Laga ägg på 3 olika sätt", description: "Variera hur du tillreder ägg under veckan", category: "nutrition" as const, priority: "low" as const, icon: "🍳" },
    { title: "📝 Dokumentera proteinintag", description: "Skriv ner proteinmängden i varje måltid", category: "nutrition" as const, priority: "medium" as const, icon: "📝" },
    { title: "🥛 Testa olika mjölkprodukter", description: "Prova grekisk yoghurt, kefir eller kvarg", category: "nutrition" as const, priority: "low" as const, icon: "🥛" }
  ],
  3: [
    { title: "🌾 Välj komplexa kolhydrater", description: "Byt ut vita kolhydrater mot fullkorn", category: "nutrition" as const, priority: "high" as const, icon: "🌾" },
    { title: "🍠 Inkludera rotfrukter", description: "Ät sötpotatis, morötter och andra rotfrukter", category: "nutrition" as const, priority: "medium" as const, icon: "🍠" },
    { title: "🕐 Tajma kolhydratintag", description: "Ät kolhydrater runt träning för bästa effekt", category: "nutrition" as const, priority: "medium" as const, icon: "🕐" },
    { title: "🥣 Testa olika havregryn", description: "Prova stålskurna havre, overnight oats", category: "nutrition" as const, priority: "low" as const, icon: "🥣" },
    { title: "📈 Mät blodsockernivåer", description: "Observera hur olika kolhydrater påverkar dig", category: "health" as const, priority: "high" as const, icon: "📈" },
    { title: "🍌 Ät frukt vid rätt tillfälle", description: "Konsumera frukt på morgonen eller runt träning", category: "nutrition" as const, priority: "medium" as const, icon: "🍌" },
    { title: "🥖 Undvik processade kolhydrater", description: "Säg nej till vitt bröd, sötsaker en hel vecka", category: "nutrition" as const, priority: "high" as const, icon: "🥖" },
    { title: "📚 Lär dig om glykemiskt index", description: "Förstå hur olika livsmedel påverkar blodsockret", category: "weekly" as const, priority: "medium" as const, icon: "📚" }
  ],
  4: [
    { title: "🏆 Implementera topplistan", description: "Använd minst 5 functional foods från topplistan", category: "nutrition" as const, priority: "high" as const, icon: "🏆" },
    { title: "🫐 Ät bär dagligen", description: "Inkludera blåbär, hallon eller andra bär varje dag", category: "nutrition" as const, priority: "high" as const, icon: "🫐" },
    { title: "🥑 Konsumera avokado", description: "Ät avokado minst 3 gånger under veckan", category: "nutrition" as const, priority: "medium" as const, icon: "🥑" },
    { title: "🍄 Testa svamp som superfood", description: "Prova shiitake, maitake eller andra hälsosvampar", category: "nutrition" as const, priority: "medium" as const, icon: "🍄" },
    { title: "🌿 Använd färska örter", description: "Krydda maten med basilika, oregano, rosmarin", category: "nutrition" as const, priority: "low" as const, icon: "🌿" },
    { title: "🥬 Ät gröna bladgrönsaker", description: "Inkludera spenat, grönkål eller ruccola dagligen", category: "nutrition" as const, priority: "high" as const, icon: "🥬" },
    { title: "🌰 Snacka nötter och frön", description: "Ät en handfull nötter eller frön varje dag", category: "nutrition" as const, priority: "medium" as const, icon: "🌰" },
    { title: "🍵 Drick grönt te", description: "Ersätt kaffe med grönt te minst en gång per dag", category: "health" as const, priority: "low" as const, icon: "🍵" },
    { title: "📋 Skapa din personliga topplista", description: "Välj dina 10 favorit functional foods", category: "weekly" as const, priority: "medium" as const, icon: "📋" }
  ],
  5: [
    { title: "💡 Förstå fördelarna djupare", description: "Läs om vetenskapen bakom functional foods", category: "weekly" as const, priority: "high" as const, icon: "💡" },
    { title: "🧬 Lär dig om probiotika", description: "Förstå hur tarmbakterier påverkar hälsan", category: "health" as const, priority: "high" as const, icon: "🧬" },
    { title: "🥛 Inkludera fermenterade produkter", description: "Ät kimchi, kefir, kombucha eller surkål", category: "nutrition" as const, priority: "medium" as const, icon: "🥛" },
    { title: "🔬 Studera antioxidanter", description: "Lär dig om olika typer och deras effekter", category: "weekly" as const, priority: "medium" as const, icon: "🔬" },
    { title: "❤️ Fokusera på hjärthälsa", description: "Välj livsmedel som stödjer kardiovaskulär hälsa", category: "health" as const, priority: "high" as const, icon: "❤️" },
    { title: "🧠 Optimera hjärnfunktion", description: "Ät livsmedel som förbättrar kognitiv funktion", category: "health" as const, priority: "medium" as const, icon: "🧠" },
    { title: "💤 Förbättra sömnkvalitet", description: "Använd functional foods för bättre sömn", category: "health" as const, priority: "medium" as const, icon: "💤" },
    { title: "📊 Mät dina framsteg", description: "Dokumentera förbättringar i energi och välmående", category: "weekly" as const, priority: "low" as const, icon: "📊" }
  ],
  6: [
    { title: "🚀 Skapa din långsiktiga plan", description: "Planera hur du ska fortsätta efter kursen", category: "weekly" as const, priority: "high" as const, icon: "🚀" },
    { title: "🛒 Optimera inköpslistan", description: "Skapa en smart handlingslista med functional foods", category: "nutrition" as const, priority: "high" as const, icon: "🛒" },
    { title: "👨‍🍳 Utveckla matlagningsrutiner", description: "Etablera hållbara matlagningsvanor", category: "nutrition" as const, priority: "medium" as const, icon: "👨‍🍳" },
    { title: "📅 Planera veckomenyer", description: "Skapa menyer för kommande veckor", category: "nutrition" as const, priority: "medium" as const, icon: "📅" },
    { title: "🎯 Sätt nya mål", description: "Definiera mål för nästa fas av din hälsoresa", category: "health" as const, priority: "high" as const, icon: "🎯" },
    { title: "👥 Dela med dig av erfarenheter", description: "Berätta för familj/vänner om dina lärdomar", category: "general" as const, priority: "low" as const, icon: "👥" },
    { title: "📈 Utvärdera resultaten", description: "Reflektera över förändringar i hälsa och välmående", category: "weekly" as const, priority: "high" as const, icon: "📈" },
    { title: "🔄 Skapa hållbara rutiner", description: "Etablera vanor som håller i längden", category: "general" as const, priority: "medium" as const, icon: "🔄" },
    { title: "🎉 Fira dina framsteg", description: "Erkänn och belöna din resa mot bättre hälsa", category: "general" as const, priority: "low" as const, icon: "🎉" },
    { title: "📚 Fortsätt lära", description: "Planera fortsatt utbildning inom functional foods", category: "weekly" as const, priority: "medium" as const, icon: "📚" }
  ]
};

export default function FunctionalBasicsPage() {
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
        courseId: 'functional-basics'
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
    { number: 1, title: "Introduktion till Functional Foods", status: "current" },
    { number: 2, title: "Att välja rätt proteiner", status: "upcoming" },
    { number: 3, title: "Att välja rätt kolhydrater", status: "upcoming" },
    { number: 4, title: "Functional Foods Topplista", status: "upcoming" },
    { number: 5, title: "Fördelarna med Functional Foods", status: "upcoming" },
    { number: 6, title: "Att komma igång", status: "upcoming" }
  ];

  return (
    <div className="space-y-4 md:space-y-8 pb-20 md:pb-8">
      {/* Intro Video Section - Mobile Optimized */}
              <div className="relative bg-primary rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 p-4 sm:p-6 md:p-12">
          <div className="flex flex-col justify-center space-y-4 md:space-y-6 z-10 order-2 md:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
                FUNCTIONAL BASICS
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-green-100 mb-4 md:mb-6">
                6 veckors hälsoprogram med Ulrika Davidsson
              </p>
              <div className="flex flex-wrap gap-3 md:gap-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl px-4 py-2 md:px-6 md:py-3">
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 md:w-5 md:h-5 text-green-100" />
                    <span className="text-white font-medium text-sm md:text-base">5:32</span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg md:rounded-xl px-4 py-2 md:px-6 md:py-3">
                  <div className="flex items-center space-x-2">
                    <FiTarget className="w-4 h-4 md:w-5 md:h-5 text-green-100" />
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
                src="/ulrika3.png"
                alt="Ulrika Davidsson"
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
                  <FiPlay className="w-6 h-6 md:w-8 md:h-8 text-secondary ml-0.5 md:ml-1" />
                </motion.div>
              </div>
              
              {/* Video Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h3 className="text-white font-bold text-base md:text-xl mb-1 md:mb-2">
                  Introduktionsvideo
                </h3>
                <p className="text-green-100 text-sm md:text-base">
                  Välkommen till Functional Basics
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
        <Link href="/dashboard/courses/functional-basics/goals" className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-4 md:p-6 hover:shadow-lg md:hover:shadow-xl transition-all group">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="bg-purple-100 rounded-lg p-2.5 md:p-3 group-hover:bg-purple-200 transition-colors">
              <FiTarget className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Målsättning</h3>
              <p className="text-gray-600 text-xs md:text-sm">Hantera dina mål</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/courses/functional-basics/material" className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-4 md:p-6 hover:shadow-lg md:hover:shadow-xl transition-all group">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="bg-blue-100 rounded-lg p-2.5 md:p-3 group-hover:bg-blue-200 transition-colors">
              <FiBook className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Kursmaterial</h3>
              <p className="text-gray-600 text-xs md:text-sm">Alla resurser</p>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/courses/functional-basics/downloads" className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-4 md:p-6 hover:shadow-lg md:hover:shadow-xl transition-all group sm:col-span-2 md:col-span-1">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="bg-orange-100 rounded-lg p-2.5 md:p-3 group-hover:bg-orange-200 transition-colors">
              <FiDownload className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Nedladdningar</h3>
              <p className="text-gray-600 text-xs md:text-sm">PDF:er & guider</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Weekly Progress - Mobile Optimized */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Förbestämda mål per vecka</h2>
          <div className="text-xs md:text-sm text-gray-600">
            Alla mål är fördefinierade för optimal progression
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
                  isExpanded ? 'border-orange-500 shadow-md md:shadow-lg' : 'border-gray-200'
                }`}
                initial={false}
              >
                <div 
                  className={`p-4 md:p-6 cursor-pointer transition-colors ${
                    isExpanded ? 'bg-orange-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setExpandedWeek(isExpanded ? null : week.number)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 md:space-x-4 flex-1">
                      <div className={`
                        w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center font-bold text-white text-sm md:text-base
                        ${week.number === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-600' : 
                          week.number === 2 ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                          week.number === 3 ? 'bg-primary' :
                          week.number === 4 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' :
                          week.number === 5 ? 'bg-gradient-to-r from-red-500 to-pink-600' :
                          'bg-gradient-to-r from-indigo-500 to-purple-600'}
                      `}>
                        {week.number}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">{week.title}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                          <p className="text-xs md:text-sm text-gray-600">
                            {totalGoals > 0 ? (
                              <span className="flex items-center space-x-1">
                                <FiCheckCircle className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                                <span>{completedGoals}/{totalGoals} mål klara</span>
                              </span>
                            ) : (
                              <span className="text-orange-600">Klicka för att se förslag på mål</span>
                            )}
                          </p>
                          {totalGoals > 0 && (
                            <div className="flex-1 max-w-full sm:max-w-xs">
                              <div className="w-full h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(completedGoals / totalGoals) * 100}%` }}
                                  className="h-full bg-primary"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center ml-2">
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
                            <h4 className="text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">Aktiva mål</h4>
                            {weekGoals.map((goal) => (
                              <motion.div
                                key={goal.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className={`flex items-start md:items-center justify-between p-3 md:p-4 rounded-lg border ${
                                  goal.status === 'completed' 
                                    ? 'bg-background border-green-200' 
                                    : 'bg-white border-gray-200 hover:border-gray-300'
                                } transition-all`}
                              >
                                <div className="flex items-start md:items-center space-x-2 md:space-x-3 flex-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleGoalCompletion(goal.id, goal.status);
                                    }}
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 md:mt-0 ${
                                      goal.status === 'completed'
                                        ? 'bg-primary border-primary text-white'
                                        : 'border-gray-300 hover:border-primary'
                                    }`}
                                  >
                                    {goal.status === 'completed' && <FiCheck className="w-3 h-3" />}
                                  </button>
                                  <div className="flex-1">
                                    <h5 className={`font-medium text-sm md:text-base ${
                                      goal.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                                    }`}>
                                      {goal.title}
                                    </h5>
                                    {goal.description && (
                                      <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">{goal.description}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center ml-2 md:ml-4">
                                  <span className={`text-xs px-2 py-0.5 md:py-1 rounded-full ${
                                    goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                                    goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-background-secondary text-secondary'
                                  }`}>
                                    {goal.priority === 'high' ? 'Hög' : goal.priority === 'medium' ? 'Medel' : 'Låg'}
                                  </span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        {/* Suggested goals */}
                        <div className="space-y-2 md:space-y-3">
                          <h4 className="text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">
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
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-orange-400 transition-all group gap-3"
                              >
                                <div className="flex items-start sm:items-center space-x-2 md:space-x-3 flex-1">
                                  <div className="text-xl md:text-2xl flex-shrink-0">{predefinedGoal.icon}</div>
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-800 group-hover:text-gray-900 text-sm md:text-base">
                                      {predefinedGoal.title.replace(predefinedGoal.icon, '').trim()}
                                    </h5>
                                    <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">{predefinedGoal.description}</p>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await activatePredefinedGoal(week.number, predefinedGoal);
                                    } catch (error) {
                                      console.error('Error adding goal:', error);
                                    }
                                  }}
                                  disabled={loading}
                                  className="w-full sm:w-auto bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-xs md:text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                                >
                                  Lägg till
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200">
                          <Link
                            href={`/dashboard/courses/functional-basics/week/${week.number}`}
                            className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium text-sm md:text-base"
                          >
                            <span>Gå till vecka {week.number}</span>
                            <FiArrowRight className="w-3 h-3 md:w-4 md:h-4" />
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

      {/* Video Modal - Enhanced Professional Design */}
      {showVideoModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowVideoModal(false)}
              className="absolute -top-4 -right-4 z-20 bg-white text-gray-900 rounded-full p-3 shadow-xl hover:shadow-2xl transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
            
            {/* Video Container */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              {/* Video Player Wrapper */}
              <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black">
                {/* Loading Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
                
                {/* Video Player */}
                <iframe
                  src="https://player.vimeo.com/video/1056709544?h=9265a3d6ae&autoplay=1&title=0&byline=0&portrait=0&color=10b981&quality=1080p"
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Functional Basics Introduktion"
                ></iframe>
              </div>
              
              {/* Enhanced Info Section */}
              <div className="p-6 bg-gradient-to-br from-white to-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Välkommen till Functional Basics
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      I denna introduktionsvideo guidar Ulrika Davidsson dig genom kursens upplägg och mål. 
                      Lär dig grunderna i functional foods och hur de kan förbättra din hälsa steg för steg.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-primary text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => setShowVideoModal(false)}
                    >
                      Stäng video
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 
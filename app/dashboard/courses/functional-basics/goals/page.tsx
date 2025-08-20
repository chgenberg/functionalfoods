'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTarget, FiCheckCircle, FiCalendar, FiTrendingUp,
  FiAward, FiStar, FiClock, FiFlag,
  FiFilter, FiArrowRight
} from 'react-icons/fi';
import { useGoals, Goal } from '@/app/hooks/useGoals';
import Link from 'next/link';

// Samma fördefinierade mål som i huvudsidan
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

type FilterType = 'all' | 'active' | 'completed' | 'overdue';
type CategoryFilter = 'all' | 'weekly' | 'health' | 'nutrition' | 'exercise' | 'general';

export default function GoalsPage() {
  const { goals, loading } = useGoals();
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Gruppera mål per vecka
  const goalsByWeek = goals.reduce((acc, goal) => {
    if (goal.weekNumber) {
      if (!acc[goal.weekNumber]) acc[goal.weekNumber] = [];
      acc[goal.weekNumber].push(goal);
    }
    return acc;
  }, {} as Record<number, typeof goals>);

  // Beräkna statistik
  const totalPredefinedGoals = Object.values(PREDEFINED_GOALS).flat().length;
  const totalActiveGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const completionRate = totalActiveGoals > 0 ? (completedGoals / totalActiveGoals) * 100 : 0;

  const weeks = [
    { number: 1, title: "Introduktion till Functional Foods", color: "#014421" },
    { number: 2, title: "Att välja rätt proteiner", color: "#0D5C29" },
    { number: 3, title: "Att välja rätt kolhydrater", color: "#167531" },
    { number: 4, title: "Functional Foods Topplista", color: "#1F8E39" },
    { number: 5, title: "Fördelarna med Functional Foods", color: "#28A741" },
    { number: 6, title: "Att komma igång", color: "#31C049" }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Målsättning</h1>
          <p className="text-gray-600 mt-1">
            Översikt av alla förbestämda mål för Functional Basics kursen
          </p>
        </div>
        
        <Link
          href="/dashboard/courses/functional-basics"
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
        >
          <FiArrowRight className="w-4 h-4" />
          <span>Tillbaka till kursen</span>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totalt antal mål</p>
              <p className="text-2xl font-bold text-gray-900">{totalPredefinedGoals}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <FiTarget className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktiva mål</p>
              <p className="text-2xl font-bold text-gray-900">{totalActiveGoals}</p>
            </div>
            <div className="bg-orange-100 rounded-lg p-3">
              <FiFlag className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Slutförda mål</p>
              <p className="text-2xl font-bold text-gray-900">{completedGoals}</p>
            </div>
            <div className="bg-background-secondary rounded-lg p-3">
              <FiCheckCircle className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Slutförandegrad</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(completionRate)}%</p>
            </div>
            <div className="bg-purple-100 rounded-lg p-3">
              <FiTrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Goals Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mål per vecka</h2>
        
        <div className="space-y-6">
          {weeks.map((week) => {
            const weekGoals = goalsByWeek[week.number] || [];
            const predefinedGoals = PREDEFINED_GOALS[week.number as keyof typeof PREDEFINED_GOALS] || [];
            const completedWeekGoals = weekGoals.filter(g => g.status === 'completed').length;
            const totalWeekGoals = weekGoals.length;
            const weekProgress = totalWeekGoals > 0 ? (completedWeekGoals / totalWeekGoals) * 100 : 0;
            
            return (
              <motion.div
                key={week.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: week.number * 0.1 }}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white" style={{ backgroundColor: week.color }}>
                        {week.number}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{week.title}</h3>
                        <p className="text-sm text-gray-600">
                          {predefinedGoals.length} förbestämda mål • {totalWeekGoals} aktiva • {completedWeekGoals} slutförda
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {totalWeekGoals > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${weekProgress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {Math.round(weekProgress)}%
                          </span>
                        </div>
                      )}
                      
                      <Link
                        href={`/dashboard/courses/functional-basics/week/${week.number}`}
                        className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center space-x-1"
                      >
                        <span>Gå till vecka</span>
                        <FiArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {predefinedGoals.map((goal, index) => {
                      const isActive = weekGoals.some(g => g.title === goal.title);
                      const activeGoal = weekGoals.find(g => g.title === goal.title);
                      const isCompleted = activeGoal?.status === 'completed';
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isCompleted 
                              ? 'bg-background border-border' 
                              : isActive 
                                ? 'bg-orange-50 border-orange-200' 
                                : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">{goal.icon}</div>
                            <div className="flex-1">
                              <h4 className={`font-medium text-sm ${
                                isCompleted ? 'text-secondary line-through' : 'text-gray-900'
                              }`}>
                                {goal.title.replace(goal.icon, '').trim()}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {goal.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-background-secondary text-secondary'
                                }`}>
                                  {goal.priority === 'high' ? 'Hög' : goal.priority === 'medium' ? 'Medel' : 'Låg'}
                                </span>
                                
                                {isCompleted && (
                                  <div className="flex items-center space-x-1">
                                    <FiCheckCircle className="w-4 h-4 text-primary" />
                                    <span className="text-xs text-primary">Klar</span>
                                  </div>
                                )}
                                
                                {isActive && !isCompleted && (
                                  <div className="flex items-center space-x-1">
                                    <FiClock className="w-4 h-4 text-orange-600" />
                                    <span className="text-xs text-orange-600">Aktiv</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Category Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mål per kategori</h2>
        
        <div className="grid md:grid-cols-5 gap-6">
          {[
            { category: 'weekly', label: 'Veckomål', icon: FiCalendar, color: 'blue' },
            { category: 'nutrition', label: 'Näring', icon: FiTarget, color: 'green' },
            { category: 'health', label: 'Hälsa', icon: FiStar, color: 'purple' },
            { category: 'exercise', label: 'Träning', icon: FiTrendingUp, color: 'orange' },
            { category: 'general', label: 'Allmänt', icon: FiFlag, color: 'gray' }
          ].map(({ category, label, icon: Icon, color }) => {
            const categoryGoals = Object.values(PREDEFINED_GOALS).flat().filter(g => g.category === category);
            const activeCategoryGoals = goals.filter(g => g.category === category);
            const completedCategoryGoals = activeCategoryGoals.filter(g => g.status === 'completed');
            
            return (
              <div key={category} className="text-center">
                <div className={`bg-${color}-100 rounded-lg p-4 mb-3`}>
                  <Icon className={`w-8 h-8 text-${color}-600 mx-auto`} />
                </div>
                <h3 className="font-semibold text-gray-900">{label}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {categoryGoals.length} totalt
                </p>
                <p className="text-xs text-gray-500">
                  {completedCategoryGoals.length} slutförda
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
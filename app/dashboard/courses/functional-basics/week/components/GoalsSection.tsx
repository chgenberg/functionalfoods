'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useGoals } from '@/app/hooks/useGoals';
import { Apple, Book, Check, CheckCircle, ChefHat, Cherry, Clock, Coffee, Droplets, FileText, Fish, Heart, Leaf, Lettuce, Lightbulb, Microscope, Milk, Moon, Nut, PartyPopper, Rocket, Salad, Target, TrendingUp, Trophy, Wheat, Zap } from "lucide-react";;

// Samma fördefinierade mål som på huvudsidan
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

interface GoalsSectionProps {
  weekNumber: number;
}

export function GoalsSection({ weekNumber }: GoalsSectionProps) {
  const { goals, createGoal, updateGoal, loading } = useGoals();

  // Gruppera mål per vecka
  const goalsByWeek = goals.reduce((acc, goal) => {
    if (goal.weekNumber) {
      if (!acc[goal.weekNumber]) acc[goal.weekNumber] = [];
      acc[goal.weekNumber].push(goal);
    }
    return acc;
  }, {} as Record<number, typeof goals>);

  // Hämta mål för denna vecka
  const weekGoals = goalsByWeek[weekNumber] || [];
  const predefinedGoals = PREDEFINED_GOALS[weekNumber as keyof typeof PREDEFINED_GOALS] || [];
  const completedGoals = weekGoals.filter(g => g.status === 'completed').length;
  const totalGoals = weekGoals.length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Funktion för att aktivera fördefinierat mål
  const activatePredefinedGoal = async (predefinedGoal: {
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

  if (loading && weekGoals.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 rounded-full p-3">
            <Target className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mål för vecka {weekNumber}</h2>
            <p className="text-gray-600 text-sm">Förbestämda mål för optimal progression</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {totalGoals > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{predefinedGoals.length}</div>
            <div className="text-xs sm:text-sm text-blue-600">Tillgängliga</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">{totalGoals}</div>
            <div className="text-xs sm:text-sm text-orange-600">Aktiva</div>
          </div>
          <div className="bg-background rounded-lg p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-primary">{completedGoals}</div>
            <div className="text-xs sm:text-sm text-primary">Klara</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 sm:p-4 text-center">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">{completionRate}%</div>
            <div className="text-xs sm:text-sm text-purple-600">Genomfört</div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-6">
        {/* Active goals */}
        {weekGoals.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Aktiva mål</h4>
            {weekGoals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border ${
                  goal.status === 'completed' 
                    ? 'bg-background border-border' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                } transition-all gap-3`}
              >
                <div className="flex items-start sm:items-center space-x-3 flex-1">
                  <button
                    onClick={() => toggleGoalCompletion(goal.id, goal.status)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 sm:mt-0 ${
                      goal.status === 'completed'
                        ? 'bg-primary border-primary text-white'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    {goal.status === 'completed' && <Check className="w-3 h-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h5 className={`font-medium text-sm sm:text-base break-words ${
                      goal.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {goal.title}
                    </h5>
                    {goal.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{goal.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-end sm:justify-start space-x-2 sm:ml-4">
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
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
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border-2 border-dashed border-gray-300 bg-white hover:border-orange-400 transition-all group gap-3"
              >
                <div className="flex items-start sm:items-center space-x-3 flex-1">
                  <div className="dashboard-emoji flex-shrink-0">{predefinedGoal.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-800 group-hover:text-gray-900 text-sm sm:text-base break-words">
                      {predefinedGoal.title.replace(predefinedGoal.icon, '').trim()}
                    </h5>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">{predefinedGoal.description}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => activatePredefinedGoal(predefinedGoal)}
                  disabled={loading}
                  className="sm:ml-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50 whitespace-nowrap self-end sm:self-auto"
                >
                  Lägg till
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {weekGoals.length === 0 && (
        <div className="text-center py-8">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
            <Target className="w-12 h-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Inga aktiva mål ännu</h3>
          <p className="text-gray-600 mb-4">Välj från föreslagna mål ovan för att komma igång</p>
        </div>
      )}

      {/* Progress Summary */}
      {totalGoals > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Veckans framsteg</h4>
              <p className="text-sm text-gray-600">
                {completedGoals} av {totalGoals} mål klara
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">{completionRate}%</div>
              <div className="text-sm text-gray-600">Genomfört</div>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              className="h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      )}
    </div>
  );
} 
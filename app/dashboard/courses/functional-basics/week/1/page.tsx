'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiCalendar, FiShoppingCart, FiBook, FiTarget,
  FiChevronRight, FiClock, FiUsers, FiCheckCircle, FiDownload,
  FiStar, FiHeart, FiAward, FiTrendingUp
} from 'react-icons/fi';
import { 
  GiFruitBowl, GiMeal, GiCookingPot, GiHealthNormal,
  GiWheat, GiMeat, GiWaterBottle
} from 'react-icons/gi';
import { FaLeaf } from 'react-icons/fa';
import Image from 'next/image';
// import { MealPlanSection, ShoppingListSection, RecipeHighlights } from './components';
import { CalendarView } from '../components/CalendarView';
import { GoalsSection } from '../components/GoalsSection';
import { getWeekData } from '@/app/data/mealPlans';

interface TabProps {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface MealItem {
  name: string;
  recipeLink?: string;
  isLocked?: boolean;
}

interface DayMeals {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack?: MealItem;
}

export default function Week1Page() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);

  const tabs: TabProps[] = [
    { id: 'overview', label: 'Översikt', icon: FiBook, color: 'from-blue-500 to-indigo-600' },
    { id: 'goals', label: 'Målsättning', icon: FiTarget, color: 'from-orange-500 to-red-600' },
    { id: 'mealplan', label: 'Kostschema', icon: FiCalendar, color: 'from-purple-500 to-pink-600' },
    { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart, color: 'from-green-500 to-teal-600' }
  ];

  // Get meal plan from centralized data
  const weekData = getWeekData(1);
  const mealPlan = weekData?.days || {};

  return (
    <div className="pb-20 md:pb-8">
      {/* Page Title - Mobile Optimized */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Vecka 1: Introduktion till Functional Foods</h1>
        <p className="text-gray-600 mt-1 md:mt-2 text-sm md:text-base">Lär dig grunderna och kom igång med din hälsoresa</p>
      </div>

      {/* Tab Navigation - Mobile Optimized */}
      <div className="mb-4 md:mb-8">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg p-1.5 md:p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative p-3 md:p-4 rounded-lg md:rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r text-white shadow-md md:shadow-lg transform scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                } ${activeTab === tab.id ? tab.color : ''}`}
              >
                <tab.icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-600'
                }`} />
                <span className={`text-xs md:text-sm font-medium ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-700'
                }`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pb-8 md:pb-16">
        <AnimatePresence mode="wait">
          {/* Overview Tab - Mobile Optimized */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 md:space-y-8"
            >
              {/* Welcome Message - Mobile Optimized */}
              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 text-white shadow-lg md:shadow-xl">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-4">Välkommen till Functional Basics!</h2>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4 md:mb-6">
                  Nu har du en spännande resa framför dig under dessa 6 veckor med näringsrika och hälsobringade recept 
                  och du kommer att få lära dig grunderna i Functional Foods. Du får praktiska kostscheman att följa, 
                  recept för alla måltider och inköpslistor för varje vecka.
                </p>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-4 md:mb-6">
                  Efter dessa 6 veckor har du dels lärt dig mycket om matlagning och hur du får in alla näringsämnen 
                  i din kost samt fördelarna som kommer: ökad näringsnivå, förbättrad matsmältning, bättre hjärthälsa, 
                  minskad inflammation i kroppen, ökade energinivåer och ett bättre immunförsvar.
                </p>
                <p className="text-sm sm:text-base md:text-lg italic">
                  Varmt välkommen till framtidens kost för en god hälsa och ett friskare liv!<br />
                  /Ulrika
                </p>
              </div>

              {/* Week 1 Introduction - Mobile Optimized */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
                  <div className="bg-orange-100 rounded-full p-2.5 md:p-3 mb-3 sm:mb-0 w-fit">
                    <FiCalendar className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Välkommen till vecka 1</h3>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3 md:mb-4">
                      För att skapa nya vanor är planering och förberedelse avgörande. Handla allt du behöver inför 
                      veckan och gör dig redo för kursen. Laga gärna några rätter i förväg och förvara dem i kylen 
                      eller frysen. Följ kostschemat under kursens gång och undvik småätande mellan måltiderna.
                    </p>
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3 md:mb-4">
                      Kom ihåg att dricka mycket vatten och njut av en kopp kaffe eller te. Fokusera på vila och 
                      god sömn under första veckan för att ge din kropp bästa möjliga förutsättningar.
                    </p>
                    <div className="bg-blue-50 rounded-lg md:rounded-xl p-3 md:p-4 mt-4 md:mt-6">
                      <p className="text-blue-800 font-medium text-sm md:text-base">
                        💡 Den här veckan vill jag att du tittar på kunskapsdokumenten "Dags att komma igång" 
                        och "Motivation och reflektion" – läs igenom dem för att ta dig an kursen på bästa sätt. 
                        Nu kör vi igång!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats - Mobile Optimized */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-4 md:p-6 text-center">
                  <GiMeal className="w-8 h-8 md:w-12 md:h-12 text-purple-600 mx-auto mb-2 md:mb-3" />
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900">21</h4>
                  <p className="text-gray-600 text-xs md:text-base">Recept</p>
                </div>
                <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-4 md:p-6 text-center">
                  <FiCalendar className="w-8 h-8 md:w-12 md:h-12 text-blue-600 mx-auto mb-2 md:mb-3" />
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900">7</h4>
                  <p className="text-gray-600 text-xs md:text-base">Dagar</p>
                </div>
                <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-4 md:p-6 text-center">
                  <GiFruitBowl className="w-8 h-8 md:w-12 md:h-12 text-primary mx-auto mb-2 md:mb-3" />
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900">10</h4>
                  <p className="text-gray-600 text-xs md:text-base">Kategorier</p>
                </div>
                <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg p-4 md:p-6 text-center">
                  <FiHeart className="w-8 h-8 md:w-12 md:h-12 text-red-600 mx-auto mb-2 md:mb-3" />
                  <h4 className="text-xl md:text-2xl font-bold text-gray-900">∞</h4>
                  <p className="text-gray-600 text-xs md:text-base">Hälsofördelar</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 md:space-y-8"
            >
              <GoalsSection weekNumber={1} />
            </motion.div>
          )}

          {/* Meal Plan Tab */}
          {activeTab === 'mealplan' && (
            <motion.div
              key="mealplan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 md:space-y-8"
            >
              {/* Calendar View */}
              <CalendarView mealPlan={mealPlan} weekNumber={1} />
              
              {/* Recipe Highlights */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Veckans mellanmål</h3>
                <p className="text-gray-600">Upptäck nya smaker och tekniker med veckans utvalda recept.</p>
              </div>
            </motion.div>
          )}

          {/* Shopping List Tab */}
          {activeTab === 'shopping' && (
            <motion.div
              key="shopping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 md:space-y-8"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Inköpslista</h3>
                <p className="text-gray-600">Planera dina inköp för vecka 1.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Week Button - Mobile Optimized */}
      <div className="pb-8 md:pb-16">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl md:rounded-2xl p-4 sm:p-6 md:p-8 text-white text-center">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 md:mb-4">Redo för nästa steg?</h3>
          <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6">
            När du känner dig redo, fortsätt till vecka 2 för att fördjupa din kunskap och bygga starkare vanor.
          </p>
          <Link
            href="/dashboard/courses/functional-basics/week/2"
            className="inline-flex items-center px-4 sm:px-5 md:px-6 py-2.5 md:py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base"
          >
            Fortsätt till vecka 2
            <FiChevronRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}

 
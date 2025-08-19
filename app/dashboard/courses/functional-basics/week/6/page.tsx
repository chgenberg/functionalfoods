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
import { CalendarView } from '../components/CalendarView';
import { GoalsSection } from '../components/GoalsSection';
import { getWeekData } from '@/app/data/mealPlans';
import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';

interface TabProps {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface MealItem {
  name: string;
  recipeLink?: string;
  note?: string;
}

interface DayMeals {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack?: MealItem;
}

export default function Week6Page() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs: TabProps[] = [
    { id: 'overview', label: 'Översikt', icon: FiBook, color: 'from-[#112A12] to-[#112A12]' },
    { id: 'goals', label: 'Målsättning', icon: FiTarget, color: 'from-[#da695c] to-[#da695c]' },
    { id: 'mealplan', label: 'Kostschema', icon: FiCalendar, color: 'from-[#112A12] to-[#112A12]' },
    { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart, color: 'from-[#da695c] to-[#da695c]' }
  ];

  // Hämta centraliserad måltidsdata för vecka 6
  const weekData = getWeekData(6);
  const mealPlan = weekData?.days || {};

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Course Navigation */}
      <CourseNavigation courseType="basics" currentWeek={6} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vecka 6: Att komma igång</h1>
          <p className="text-gray-600 mt-2">Skapa din egen hållbara Functional Foods-livsstil</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-4 md:mb-8">
          <div className="bg-[#F3EFE3] rounded-xl md:rounded-2xl shadow-md md:shadow-lg p-1.5 md:p-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative p-3 md:p-4 rounded-lg md:rounded-xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r text-white shadow-md md:shadow-lg transform scale-105'
                      : 'bg-white text-[#112A12] hover:bg-[#F3EFE3]'
                  } ${activeTab === tab.id ? tab.color : ''}`}
                >
                  <tab.icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                    activeTab === tab.id ? 'text-white' : 'text-[#112A12]'
                  }`} />
                  <span className={`text-xs md:text-sm font-medium ${
                    activeTab === tab.id ? 'text-white' : 'text-[#112A12]'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="pb-16">
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Welcome Message */}
                <div className="bg-primary rounded-3xl p-8 text-white shadow-xl">
                  <h2 className="text-3xl font-bold mb-4">Grattis - du är i mål! 🎉</h2>
                  <p className="text-lg leading-relaxed mb-6">
                    Under dessa 6 veckor har du byggt en solid grund inom Functional Foods. 
                    Nu är det dags att ta det du lärt dig och skapa din egen hållbara livsstil. 
                    Du har alla verktyg du behöver för att fortsätta din hälsoresa.
                  </p>
                  <p className="text-lg leading-relaxed">
                    Denna sista vecka handlar om att planera framåt, skapa egna rutiner och 
                    förstå hur du kan anpassa Functional Foods-principerna till ditt liv.
                  </p>
                </div>

                {/* Week Progress */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 rounded-full p-3">
                      <FiTrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Veckans fokus</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-background rounded-xl p-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Egen planering</h4>
                          <p className="text-gray-700 mb-3">
                            Lär dig skapa egna veckoscheman, planera inköp och välja recept 
                            som passar din livsstil och smakpreferenser.
                          </p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start space-x-2">
                              <FiCheckCircle className="text-purple-600 mt-0.5 flex-shrink-0" />
                              <span>Skapa egna menyer</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <FiCheckCircle className="text-purple-600 mt-0.5 flex-shrink-0" />
                              <span>Anpassa till familjen</span>
                            </li>
                          </ul>
                        </div>
                        <div className="bg-background rounded-xl p-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Hållbara vanor</h4>
                          <p className="text-gray-700 mb-3">
                            Fokusera på att bygga vanor som håller över tid. Flexibilitet 
                            och balans är nyckeln till långsiktig framgång.
                          </p>
                          <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-start space-x-2">
                              <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                              <span>80/20-regeln</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                              <span>Lyssna på kroppen</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <GiMeal className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                    <h4 className="text-2xl font-bold text-gray-900">100+</h4>
                    <p className="text-gray-600">Recept lärt</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <FiCalendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h4 className="text-2xl font-bold text-gray-900">6/6</h4>
                    <p className="text-gray-600">Veckor klara</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <GiFruitBowl className="w-12 h-12 text-primary mx-auto mb-3" />
                    <h4 className="text-2xl font-bold text-gray-900">∞</h4>
                    <p className="text-gray-600">Möjligheter</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <FiHeart className="w-12 h-12 text-red-600 mx-auto mb-3" />
                    <h4 className="text-2xl font-bold text-gray-900">100%</h4>
                    <p className="text-gray-600">Klar för framtiden</p>
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
                className="space-y-8"
              >
                <GoalsSection weekNumber={6} />
              </motion.div>
            )}

            {/* Meal Plan Tab */}
            {activeTab === 'mealplan' && (
              <motion.div
                key="mealplan"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Calendar View */}
                <CalendarView mealPlan={mealPlan} weekNumber={6} />
                
                {/* Recipe Highlights */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Avslutande favoriter</h3>
                  <p className="text-gray-600">Sista veckans recept som sammanfattar allt du lärt dig om Functional Foods.</p>
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
                className="space-y-8"
              >
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Inköpslista</h3>
                  <p className="text-gray-600">Din sista guidade inköpslista - snart planerar du helt själv!</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Course Complete Button */}
        <div className="pb-16">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">🎉 Kursen är klar!</h3>
            <p className="text-lg mb-6">
              Du har genomfört hela Functional Basics-kursen. Fortsätt din resa med Flow-kursen eller utforska vårt receptbibliotek.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard/courses/functional-basics/avslutning"
                className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Se avslutning
                <FiAward className="ml-2" />
              </Link>
              <Link
                href="/utbildning/functional-flow"
                className="inline-flex items-center px-6 py-3 bg-white/20 text-white border border-white/30 rounded-lg font-semibold hover:bg-white/30 transition-colors"
              >
                Fortsätt med Flow
                <FiChevronRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
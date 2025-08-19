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

export default function Week3Page() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs: TabProps[] = [
    { id: 'overview', label: 'Översikt', icon: FiBook, color: 'from-[#112A12] to-[#112A12]' },
    { id: 'goals', label: 'Målsättning', icon: FiTarget, color: 'from-[#da695c] to-[#da695c]' },
    { id: 'mealplan', label: 'Kostschema', icon: FiCalendar, color: 'from-[#112A12] to-[#112A12]' },
    { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart, color: 'from-[#da695c] to-[#da695c]' }
  ];

  // Hämta centraliserad måltidsdata för vecka 3
  const weekData = getWeekData(3);
  const mealPlan = weekData?.days || {};

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vecka 3: Fetter & kolhydrater</h1>
        <p className="text-gray-600 mt-2">Optimera din energi med rätt makronutrienter</p>
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
                <h2 className="text-3xl font-bold mb-4">Välkommen till vecka 3!</h2>
                <p className="text-lg leading-relaxed mb-6">
                  Denna vecka dyker vi djupare in i makronutrienternas värld. Du kommer att lära dig 
                  hur rätt balans mellan fetter och kolhydrater kan optimera din energi, förbättra din 
                  koncentration och stödja din övergripande hälsa.
                </p>
                <p className="text-lg leading-relaxed">
                  Fokus ligger på att välja kvalitetsfetter och komplexa kolhydrater som ger långvarig 
                  energi utan blodsockertoppar.
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
                        <h4 className="font-semibold text-gray-900 mb-3">Hälsosamma fetter</h4>
                        <p className="text-gray-700 mb-3">
                          Upptäck kraften i omega-3-fettsyror, avokado och nötter. Lär dig hur 
                          dessa fetter stödjer hjärnhälsa och minskar inflammation.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <span>Omega-3 från fisk</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <span>Växtbaserade fetter</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-background rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Komplexa kolhydrater</h4>
                        <p className="text-gray-700 mb-3">
                          Välj långsamma kolhydrater som ger stabil energi. Fullkorn, quinoa 
                          och grönsaker står i fokus denna vecka.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Stabilt blodsocker</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Långvarig mättnad</span>
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
                  <h4 className="text-2xl font-bold text-gray-900">10</h4>
                  <p className="text-gray-600">Nya recept</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiCalendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">3/6</h4>
                  <p className="text-gray-600">Veckor klara</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <GiFruitBowl className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">35+</h4>
                  <p className="text-gray-600">Ingredienser</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiHeart className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">100%</h4>
                  <p className="text-gray-600">Näringsrikt</p>
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
              <GoalsSection weekNumber={3} />
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
              <CalendarView mealPlan={mealPlan} weekNumber={3} />
              
              {/* Recipe Highlights */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Veckans favoriter</h3>
                <p className="text-gray-600">Balanserade måltider med fokus på hälsosamma fetter och komplexa kolhydrater.</p>
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
                <p className="text-gray-600">Handla smart för vecka 3 - fokus på kvalitetsfetter och fullkorn.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Week Button */}
      <div className="pb-16">
        <div className="bg-primary rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Redo för nästa steg?</h3>
          <p className="text-lg mb-6">
            När du har lärt dig balansera makronutrienter, fortsätt till vecka 4 för vitaminer och mineraler.
          </p>
          <Link
            href="/dashboard/courses/functional-basics/week/4"
            className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Fortsätt till vecka 4
            <FiChevronRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
} 
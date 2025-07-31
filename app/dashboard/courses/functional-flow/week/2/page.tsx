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

export default function Week2Page() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs: TabProps[] = [
    { id: 'overview', label: 'Översikt', icon: FiBook, color: 'from-blue-500 to-indigo-600' },
    { id: 'goals', label: 'Målsättning', icon: FiTarget, color: 'from-orange-500 to-red-600' },
    { id: 'mealplan', label: 'Kostschema', icon: FiCalendar, color: 'from-purple-500 to-pink-600' },
    { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart, color: 'from-green-500 to-teal-600' }
  ];

  // Hämta centraliserad måltidsdata för vecka 2
  const weekData = getWeekData(2);
  const mealPlan = weekData?.days || {};

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vecka 2: Bygg starkare vanor</h1>
        <p className="text-gray-600 mt-2">Fördjupa din kunskap och utforska nya smaker</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative p-4 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r text-white shadow-lg transform scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                } ${activeTab === tab.id ? tab.color : ''}`}
              >
                <tab.icon className={`w-6 h-6 mx-auto mb-2 ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-600'
                }`} />
                <span className={`text-sm font-medium ${
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
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl p-8 text-white shadow-xl">
                <h2 className="text-3xl font-bold mb-4">Välkommen till vecka 2!</h2>
                <p className="text-lg leading-relaxed mb-6">
                  Nu har du kommit igång med din resa och det är dags att bygga vidare på grunderna. 
                  Denna vecka introducerar vi nya spännande recept och tekniker som kommer hjälpa dig 
                  att variera din kost samtidigt som du håller dig till Functional Foods principerna.
                </p>
                <p className="text-lg leading-relaxed">
                  Kom ihåg att lyssna på din kropp och anpassa portionsstorlekarna efter dina behov. 
                  Fokusera på att njuta av maten och känn hur din energi och välmående förbättras dag för dag.
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
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Nya smaker</h4>
                        <p className="text-gray-700 mb-3">
                          Utforska nya kryddor och smakkombinationer. Prova de asiatiska 
                          köttbullarna och den turkiska lammfärsen för inspiration.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <span>Experimentera med kryddor</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <span>Våga prova nya grönsaker</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Meal prep</h4>
                        <p className="text-gray-700 mb-3">
                          Börja förbereda måltider i förväg. Många av veckans recept 
                          lämpar sig utmärkt för att laga i större mängder.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Spara tid i vardagen</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Minska matsvinn</span>
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
                  <h4 className="text-2xl font-bold text-gray-900">8</h4>
                  <p className="text-gray-600">Nya recept</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiCalendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">2/6</h4>
                  <p className="text-gray-600">Veckor klara</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <GiFruitBowl className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">30+</h4>
                  <p className="text-gray-600">Ingredienser</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiHeart className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">100%</h4>
                  <p className="text-gray-600">Hälsosamt</p>
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
              <GoalsSection weekNumber={2} />
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
              <CalendarView mealPlan={mealPlan} weekNumber={2} />
              
              {/* Recipe Highlights */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Veckans recept</h3>
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
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Inköpslista</h3>
                <p className="text-gray-600">Planera dina inköp för vecka 2.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Week Button */}
      <div className="pb-16">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Redo för nästa steg?</h3>
          <p className="text-lg mb-6">
            När du känner dig redo, fortsätt till vecka 3 för att utforska flexibilitet och fasta.
          </p>
          <Link
            href="/dashboard/courses/functional-flow/week/3"
            className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Fortsätt till vecka 3
            <FiChevronRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
} 
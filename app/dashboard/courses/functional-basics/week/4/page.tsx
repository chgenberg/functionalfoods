'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiCalendar, FiShoppingCart, FiBook, FiTarget,
  FiChevronRight, FiClock, FiUsers, FiCheckCircle, FiDownload,
  FiStar, FiHeart, FiAward, FiTrendingUp, FiSun
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

export default function Week4Page() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs: TabProps[] = [
    { id: 'overview', label: 'Översikt', icon: FiBook, color: 'from-[#112A12] to-[#112A12]' },
    { id: 'goals', label: 'Målsättning', icon: FiTarget, color: 'from-[#da695c] to-[#da695c]' },
    { id: 'mealplan', label: 'Kostschema', icon: FiCalendar, color: 'from-[#112A12] to-[#112A12]' },
    { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart, color: 'from-[#da695c] to-[#da695c]' }
  ];

  // Hämta centraliserad måltidsdata för vecka 4
  const weekData = getWeekData(4);
  const mealPlan = weekData?.days || {};

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Course Navigation */}
      <CourseNavigation courseType="basics" currentWeek={4} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vecka 4: Vitaminer & mineraler</h1>
          <p className="text-gray-600 mt-2">Stärk din kropp med viktiga mikronäringsämnen</p>
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
                <h2 className="text-3xl font-bold mb-4">Välkommen till vecka 4!</h2>
                <p className="text-lg leading-relaxed mb-6">
                  Du har tagit det första viktiga steget mot en hälsosammare livsstil! Under denna första vecka 
                  kommer du att lära dig grunderna i Functional Foods och börja upptäcka hur näringsrik mat 
                  kan förändra hur du mår och känner dig.
                </p>
                <p className="text-lg leading-relaxed">
                  Ta det i din egen takt och fokusera på att skapa nya vanor. Varje måltid är en möjlighet 
                  att ge din kropp den näring den behöver för att fungera optimalt.
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
                        <h4 className="font-semibold text-gray-900 mb-3">Grunderna</h4>
                        <p className="text-gray-700 mb-3">
                          Lär dig identifiera funktionella livsmedel och förstå hur de påverkar 
                          din kropp. Fokus ligger på att bygga en stark grund.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <span>Introducera nya råvaror</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <span>Lär dig grundtekniker</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-background rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Vanor</h4>
                        <p className="text-gray-700 mb-3">
                          Börja skapa rutiner kring måltiderna. Planera dina inköp och förbered 
                          enkla mellanmål för veckan.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Ät regelbundet</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Drick tillräckligt med vatten</span>
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
                  <h4 className="text-2xl font-bold text-gray-900">21</h4>
                  <p className="text-gray-600">Måltider</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiCalendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">1/6</h4>
                  <p className="text-gray-600">Veckor klara</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <GiFruitBowl className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">25+</h4>
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
              <GoalsSection weekNumber={4} />
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
              <CalendarView mealPlan={mealPlan} weekNumber={4} />
              
              {/* Daily Meals with Recipe Links */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Veckans måltider</h3>
                
                {Object.entries(mealPlan).map(([dayName, dayMeals]: [string, any]) => (
                  <div key={dayName} className="border-b border-gray-200 pb-4 mb-4 last:border-0">
                    <h4 className="text-lg font-semibold text-[#014421] mb-3">{dayName}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Breakfast */}
                      {dayMeals.breakfast && (
                        <div className="bg-orange-50 rounded-lg p-4 flex items-start gap-3">
                          <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
                            <FiSun className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-[#014421]">Frukost</span>
                              <span className="text-xs text-gray-500 bg-orange-100 px-2 py-0.5 rounded-full">07:00</span>
                            </div>
                            <p className="text-sm text-gray-700">{dayMeals.breakfast.name}</p>
                            {dayMeals.breakfast.slug && (
                              <Link 
                                href={`/kunskapsbank/recept/${dayMeals.breakfast.slug}`}
                                className="text-sm text-orange-600 hover:underline mt-1 inline-block"
                              >
                                Se recept →
                              </Link>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Lunch */}
                      {dayMeals.lunch && (
                        <div className="bg-green-50 rounded-lg p-4 flex items-start gap-3">
                          <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                            <FiSun className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-[#014421]">Lunch</span>
                              <span className="text-xs text-gray-500 bg-green-100 px-2 py-0.5 rounded-full">12:00</span>
                            </div>
                            <p className="text-sm text-gray-700">{dayMeals.lunch.name}</p>
                            {dayMeals.lunch.slug && !dayMeals.lunch.name.includes('rester') && (
                              <Link 
                                href={`/kunskapsbank/recept/${dayMeals.lunch.slug}`}
                                className="text-sm text-green-600 hover:underline mt-1 inline-block"
                              >
                                Se recept →
                              </Link>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Dinner */}
                      {dayMeals.dinner && (
                        <div className="bg-purple-50 rounded-lg p-4 flex items-start gap-3">
                          <div className="bg-purple-100 rounded-full p-2 flex-shrink-0">
                            <FiSun className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-[#014421]">Middag</span>
                              <span className="text-xs text-gray-500 bg-purple-100 px-2 py-0.5 rounded-full">18:00</span>
                            </div>
                            <p className="text-sm text-gray-700">{dayMeals.dinner.name}</p>
                            {dayMeals.dinner.slug && (
                              <Link 
                                href={`/kunskapsbank/recept/${dayMeals.dinner.slug}`}
                                className="text-sm text-purple-600 hover:underline mt-1 inline-block"
                              >
                                Se recept →
                              </Link>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                <p className="text-gray-600">Allt du behöver för din första vecka med Functional Foods.</p>
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
            När du känner dig bekväm med grunderna, fortsätt till vecka 2 för att utforska nya smaker.
          </p>
          <Link
            href="/dashboard/courses/functional-basics/week/2"
            className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Fortsätt till vecka 2
            <FiChevronRight className="ml-2" />
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}

 
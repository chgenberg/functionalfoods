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
import { MealPlanSection, ShoppingListSection, RecipeHighlights } from './components';
import { CalendarView } from '../components/CalendarView';
import { GoalsSection } from '../components/GoalsSection';

interface TabProps {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

export default function Week3Page() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const tabs: TabProps[] = [
    { id: 'overview', label: 'Översikt', icon: FiBook, color: 'from-blue-500 to-indigo-600' },
    { id: 'goals', label: 'Målsättning', icon: FiTarget, color: 'from-orange-500 to-red-600' },
    { id: 'mealplan', label: 'Kostschema', icon: FiCalendar, color: 'from-purple-500 to-pink-600' },
    { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart, color: 'from-green-500 to-teal-600' }
  ];

  const mealPlan = {
    Måndag: {
      breakfast: { name: 'Yoghurt med ketomüsli', recipeLink: '/kunskapsbank/recept/yoghurt-ketomysli' },
      lunch: { name: 'Päronsallad med chevréost (Rester)', recipeLink: '/kunskapsbank/recept/paronsallad' },
      dinner: { name: 'Kycklingfylld aubergine', recipeLink: '/kunskapsbank/recept/kycklingfylld-aubergine' }
    },
    Tisdag: {
      breakfast: { name: 'Äggröra med lax', recipeLink: '/kunskapsbank/recept/aggrora-lax' },
      lunch: { name: 'Kycklingfylld aubergine (Rester)' },
      dinner: { name: 'Rökt lax med blomkålsallad och citronyoghurt', recipeLink: '/kunskapsbank/recept/rokt-lax-blomkalsallad' }
    },
    Onsdag: {
      breakfast: { name: 'Rödbetsjuice', recipeLink: '/kunskapsbank/recept/rodbetsjuice' },
      lunch: { name: 'Rökt lax med blomkålsallad och citronyoghurt (Rester)' },
      dinner: { name: 'Vegetarisk currygryta med panéer', recipeLink: '/kunskapsbank/recept/vegetarisk-currygryta' }
    },
    Torsdag: {
      breakfast: { name: 'Rödbetsjuice (Rester)' },
      lunch: { name: 'Vegetarisk currygryta med panéer (Rester)' },
      dinner: { name: 'Kycklinggryta med bakad spetskål (Rester)' }
    },
    Fredag: {
      breakfast: { name: 'Havrefralla med morötter och torkade aprikoser', recipeLink: '/kunskapsbank/recept/havrefralla' },
      lunch: { name: 'Lax med fetaost och rostade rotfrukter (Rester)' },
      dinner: { name: 'Hamburgare med hummus', recipeLink: '/kunskapsbank/recept/hamburgare-hummus' }
    },
    Lördag: {
      breakfast: { name: 'Keso med granola och fruktsallad', recipeLink: '/kunskapsbank/recept/keso-granola' },
      lunch: { name: 'Hamburgare med hummus (Rester)' },
      dinner: { name: 'Ugnsbakad kyckling med tzatziki och sallad', recipeLink: '/kunskapsbank/recept/ugnsbakad-kyckling' },
      snack: { name: 'Mandel och citronpaj', recipeLink: '/kunskapsbank/recept/mandel-citronpaj' }
    },
    Söndag: {
      breakfast: { name: 'Omelett med hallon', recipeLink: '/kunskapsbank/recept/omelett-hallon' },
      lunch: { name: 'Ugnsbakad kyckling med tzatziki och sallad (Rester)' },
      dinner: { name: 'Lax med waldorfsallad', recipeLink: '/kunskapsbank/recept/lax-waldorfsallad' }
    }
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vecka 3: Flexibilitet & Fasta</h1>
        <p className="text-gray-600 mt-2">Utforska flexibilitet och periodisk fasta</p>
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
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-xl">
                <h2 className="text-3xl font-bold mb-4">Välkommen till vecka 3!</h2>
                <p className="text-lg leading-relaxed mb-6">
                  Ny vecka med nya härliga recept i ditt kostschema! Du kanske har hittat en favoritfrukost 
                  och vill hålla dig till den – kostschemat är en guide och ger dig stor flexibilitet. 
                  Om du vill kan du också prova 16:8 fasta, där du hoppar över frukosten och börjar äta vid lunch. 
                  Det ger fördelar för matsmältningen, men lyssna på din kropp och variera vid behov.
                </p>
                <p className="text-lg leading-relaxed">
                  Nu har du även matlådor i frysen som sparar både tid och pengar. Den här veckan ska du 
                  också läsa dokumenten "Periodisk fasta" och "Reflektion vecka 3".
                </p>
              </div>

              {/* Week Progress */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 rounded-full p-3">
                    <FiTrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Veckans fokus: Flexibilitet</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">16:8 Fasta</h4>
                        <p className="text-gray-700 mb-3">
                          Prova att äta inom ett 8-timmars fönster och fasta i 16 timmar. 
                          Detta kan ge din matsmältning vila och förbättra din energi.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-orange-600 mt-0.5 flex-shrink-0" />
                            <span>Ät mellan 12:00-20:00</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-orange-600 mt-0.5 flex-shrink-0" />
                            <span>Drick vatten, te eller kaffe under fastan</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Meal prep</h4>
                        <p className="text-gray-700 mb-3">
                          Använd dina nya kunskaper för att förbereda måltider i förväg. 
                          Detta sparar tid och säkerställer att du alltid har hälsosam mat tillgänglig.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Laga större portioner</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>Frys in i portioner</span>
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
                  <p className="text-gray-600">Nya recept</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiClock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">16:8</h4>
                  <p className="text-gray-600">Fasta-alternativ</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <GiFruitBowl className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">Flex</h4>
                  <p className="text-gray-600">Anpassa efter dig</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiHeart className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">50%</h4>
                  <p className="text-gray-600">Halvvägs!</p>
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
              
              {/* Traditional Meal Plan View */}
              <MealPlanSection 
                mealPlan={mealPlan}
                expandedDay={expandedDay}
                setExpandedDay={setExpandedDay}
              />

              {/* Recipe Highlights */}
              <RecipeHighlights />
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
              <ShoppingListSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Week Button */}
      <div className="pb-16">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Halvvägs där!</h3>
          <p className="text-lg mb-6">
            Du har klarat halva kursen! Fortsätt med samma energi in i vecka 4.
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
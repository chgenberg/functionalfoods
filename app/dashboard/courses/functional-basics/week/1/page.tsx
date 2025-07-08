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
import { GoalsSection, MealPlanSection, ShoppingListSection, KnowledgeSection } from './components';

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
    { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart, color: 'from-green-500 to-teal-600' },
    { id: 'knowledge', label: 'Kunskap', icon: FiBook, color: 'from-indigo-500 to-purple-600' }
  ];

  const mealPlan: Record<string, DayMeals> = {
    Måndag: {
      breakfast: { name: 'Yoghurt med ketomüsli', recipeLink: '/kunskapsbank/recept/yoghurt-ketomysli' },
      lunch: { name: 'Tonfisksallad med äpple', recipeLink: '/kunskapsbank/recept/tonfisksallad' },
      dinner: { name: 'Squashspagetti med köttfärssås', recipeLink: '/kunskapsbank/recept/squashspagetti' },
      snack: { name: 'Ketomüsli', recipeLink: '/kunskapsbank/recept/ketomysli' }
    },
    Tisdag: {
      breakfast: { name: 'Stekt ägg med lax', recipeLink: '/kunskapsbank/recept/stekt-agg-lax' },
      lunch: { name: 'Squashspagetti med köttfärssås (Rester)' },
      dinner: { name: 'Het ratatouille', recipeLink: '/kunskapsbank/recept/het-ratatouille' }
    },
    Onsdag: {
      breakfast: { name: 'Grön smoothie', recipeLink: '/kunskapsbank/recept/gron-smoothie' },
      lunch: { name: 'Pokebowl med kyckling', recipeLink: '/kunskapsbank/recept/pokebowl' },
      dinner: { name: 'Köttfärsbiffar med stekt blomkål', recipeLink: '/kunskapsbank/recept/kottfarsbiffar' }
    },
    Torsdag: {
      breakfast: { name: 'Omelett med tomat', recipeLink: '/kunskapsbank/recept/omelett-tomat' },
      lunch: { name: 'Het ratatouille (Rester)' },
      dinner: { name: 'Pokebowl med kyckling (Rester)' },
      snack: { name: 'Havrefrallor med morötter och aprikoser', recipeLink: '/kunskapsbank/recept/havrefrallor' }
    },
    Fredag: {
      breakfast: { name: 'Havrefralla med morötter och torkade aprikoser', recipeLink: '/kunskapsbank/recept/havrefralla' },
      lunch: { name: 'Köttfärsbiffar med stekt blomkål (Rester)' },
      dinner: { name: 'Kycklinggryta med bakad spetskål', recipeLink: '/kunskapsbank/recept/kycklinggryta' }
    },
    Lördag: {
      breakfast: { name: 'Tropisk Smoothiebowl', recipeLink: '/kunskapsbank/recept/smoothiebowl' },
      lunch: { name: 'Kycklinggryta med bakad spetskål (Rester)' },
      dinner: { name: 'Laxburgare med krämig grönsaksröra', recipeLink: '/kunskapsbank/recept/laxburgare' },
      snack: { name: 'Mangoglass', recipeLink: '/kunskapsbank/recept/mangoglass' }
    },
    Söndag: {
      breakfast: { name: 'Tropisk Smoothiebowl (Rester)' },
      lunch: { name: 'Laxburgare med krämig grönsaksröra (Rester)' },
      dinner: { name: 'Ugnsbakad tomat med köttfärs', recipeLink: '/kunskapsbank/recept/ugnsbakad-tomat' }
    }
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vecka 1: Introduktion till Functional Foods</h1>
        <p className="text-gray-600 mt-2">Lär dig grunderna och kom igång med din hälsoresa</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-2">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-16">
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
              <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl">
                <h2 className="text-3xl font-bold mb-4">Välkommen till Functional Basics!</h2>
                <p className="text-lg leading-relaxed mb-6">
                  Nu har du en spännande resa framför dig under dessa 6 veckor med näringsrika och hälsobringade recept 
                  och du kommer att få lära dig grunderna i Functional Foods. Du får praktiska kostscheman att följa, 
                  recept för alla måltider och inköpslistor för varje vecka.
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  Efter dessa 6 veckor har du dels lärt dig mycket om matlagning och hur du får in alla näringsämnen 
                  i din kost samt fördelarna som kommer: ökad näringsnivå, förbättrad matsmältning, bättre hjärthälsa, 
                  minskad inflammation i kroppen, ökade energinivåer och ett bättre immunförsvar.
                </p>
                <p className="text-lg italic">
                  Varmt välkommen till framtidens kost för en god hälsa och ett friskare liv!<br />
                  /Ulrika
                </p>
              </div>

              {/* Week 1 Introduction */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 rounded-full p-3">
                    <FiCalendar className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Välkommen till vecka 1</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      För att skapa nya vanor är planering och förberedelse avgörande. Handla allt du behöver inför 
                      veckan och gör dig redo för kursen. Laga gärna några rätter i förväg och förvara dem i kylen 
                      eller frysen. Följ kostschemat under kursens gång och undvik småätande mellan måltiderna.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Kom ihåg att dricka mycket vatten och njut av en kopp kaffe eller te. Fokusera på vila och 
                      god sömn under första veckan för att ge din kropp bästa möjliga förutsättningar.
                    </p>
                    <div className="bg-blue-50 rounded-xl p-4 mt-6">
                      <p className="text-blue-800 font-medium">
                        💡 Den här veckan vill jag att du tittar på kunskapsdokumenten "Dags att komma igång" 
                        och "Motivation och reflektion" – läs igenom dem för att ta dig an kursen på bästa sätt. 
                        Nu kör vi igång!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <GiMeal className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">21</h4>
                  <p className="text-gray-600">Recept</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiCalendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">7</h4>
                  <p className="text-gray-600">Dagar</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <GiFruitBowl className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">10</h4>
                  <p className="text-gray-600">Kategorier</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiHeart className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">∞</h4>
                  <p className="text-gray-600">Hälsofördelar</p>
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
              <GoalsSection 
                completedGoals={completedGoals}
                setCompletedGoals={setCompletedGoals}
              />
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
              <MealPlanSection 
                mealPlan={mealPlan}
                expandedDay={expandedDay}
                setExpandedDay={setExpandedDay}
              />
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

          {/* Knowledge Tab */}
          {activeTab === 'knowledge' && (
            <motion.div
              key="knowledge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <KnowledgeSection />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Week Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Redo för nästa steg?</h3>
          <p className="text-lg mb-6">
            När du känner dig redo, fortsätt till vecka 2 för att fördjupa din kunskap och bygga starkare vanor.
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
  );
}

 
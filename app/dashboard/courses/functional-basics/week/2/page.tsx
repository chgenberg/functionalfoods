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
import { MealPlanSection, ShoppingListSection } from './components';

interface TabProps {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

export default function Week2Page() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const tabs: TabProps[] = [
    { id: 'overview', label: 'Översikt', icon: FiBook, color: 'from-blue-500 to-indigo-600' },
    { id: 'mealplan', label: 'Kostschema', icon: FiCalendar, color: 'from-purple-500 to-pink-600' },
    { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart, color: 'from-green-500 to-teal-600' }
  ];

  const mealPlan = {
    Måndag: {
      breakfast: { name: 'Yoghurt med ketomüsli', recipeLink: '/kunskapsbank/recept/yoghurt-ketomysli' },
      lunch: { name: 'Ugnsbakad tomat med köttfärs (Rester)', recipeLink: '/kunskapsbank/recept/ugnsbakad-tomat' },
      dinner: { name: 'Nudelsoppa med grönsaker', recipeLink: '/kunskapsbank/recept/nudelsoppa' }
    },
    Tisdag: {
      breakfast: { name: 'Omelett med champinjoner', recipeLink: '/kunskapsbank/recept/omelett-champinjoner' },
      lunch: { name: 'Nudelsoppa med grönsaker (Rester)' },
      dinner: { name: 'Torskrygg med ägghack och sparris', recipeLink: '/kunskapsbank/recept/torskrygg' }
    },
    Onsdag: {
      breakfast: { name: 'Morotsjuice', recipeLink: '/kunskapsbank/recept/morotsjuice' },
      lunch: { name: 'Torskrygg med ägghack och sparris (Rester)' },
      dinner: { name: 'Turkiska lammfärsspett med raita och sallad', recipeLink: '/kunskapsbank/recept/lammfarsspett' }
    },
    Torsdag: {
      breakfast: { name: 'Morotsjuice (Rester)' },
      lunch: { name: 'Turkiska lammfärsspett med raita och sallad (Rester)' },
      dinner: { name: 'Kycklingröra med örter och tomat', recipeLink: '/kunskapsbank/recept/kycklingrora' }
    },
    Fredag: {
      breakfast: { name: 'Havrefralla med morötter och torkade aprikoser', recipeLink: '/kunskapsbank/recept/havrefralla' },
      lunch: { name: 'Kycklingröra med örter och tomat (Rester)' },
      dinner: { name: 'Lax med fetaost och rostade rotfrukter', recipeLink: '/kunskapsbank/recept/lax-feta' }
    },
    Lördag: {
      breakfast: { name: 'Bärsmoothiebowl', recipeLink: '/kunskapsbank/recept/smoothiebowl' },
      lunch: { name: 'Lax med fetaost och rostade rotfrukter (Rester)' },
      dinner: { name: 'Asiatiska köttbullar med nudelsallad', recipeLink: '/kunskapsbank/recept/asiatiska-kottbullar' },
      snack: { name: 'Jordgubbar och mango med vit chokladkräm', recipeLink: '/kunskapsbank/recept/chokladkram' }
    },
    Söndag: {
      breakfast: { name: 'Bärsmoothiebowl (Rester)' },
      lunch: { name: 'Asiatiska köttbullar med nudelsallad (Rester)' },
      dinner: { name: 'Päronsallad med chevréost', recipeLink: '/kunskapsbank/recept/paronsallad' }
    }
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vecka 2: Bygga hälsosamma vanor</h1>
        <p className="text-gray-600 mt-2">Fördjupa din kunskap och etablera rutiner</p>
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
                  Nu har du kommit in i din nya livsstil och kroppen börjar ge dig positiv återkoppling. 
                  Genom att ge den näring i form av antioxidanter, fibrer, probiotika, mineraler och vitaminer 
                  håller du blodsockret på en jämn nivå, vilket gör det lättare att stå emot socker och snabba 
                  kolhydrater. Den nya rutinen ger dig mer energi, och du märker säkert redan skillnad.
                </p>
                <p className="text-lg leading-relaxed">
                  För att fortsätta på bästa sätt, planera veckan noggrant. Den här veckan ska du också läsa 
                  dokumentet "Functional foods - 3 steg till ett friskare liv" för att ta nästa steg i din utveckling.
                </p>
              </div>

              {/* Week Progress */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 rounded-full p-3">
                    <FiTrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Din utveckling</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Vad du har uppnått:</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">Etablerat nya matrutiner</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">Lärt dig grunderna i Functional Foods</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">Börjat känna positiva effekter</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Veckans fokus:</h4>
                        <ul className="space-y-2">
                          <li className="flex items-start space-x-2">
                            <FiStar className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">Fördjupa kunskapen om mervärdesmat</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiStar className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">Stabilisera blodsockernivåerna</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiStar className="text-purple-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">Öka energinivåerna ytterligare</span>
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
                  <FiCalendar className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">7</h4>
                  <p className="text-gray-600">Dagar</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <GiFruitBowl className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">5+</h4>
                  <p className="text-gray-600">Nya ingredienser</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiHeart className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">100%</h4>
                  <p className="text-gray-600">Energiboost</p>
                </div>
              </div>
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


        </AnimatePresence>
      </div>

      {/* Next Week Button */}
      <div className="pb-16">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Redo för nästa steg?</h3>
          <p className="text-lg mb-6">
            När du känner dig redo, fortsätt till vecka 3 för att utforska flexibilitet och periodisk fasta.
          </p>
          <Link
            href="/dashboard/courses/functional-basics/week/3"
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
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiCalendar, FiShoppingCart, FiBook, FiTarget,
  FiChevronRight, FiClock, FiUsers, FiCheckCircle, FiDownload,
  FiStar, FiHeart, FiAward, FiTrendingUp, FiCheck
} from 'react-icons/fi';
import { 
  GiFruitBowl, GiMeal, GiCookingPot, GiHealthNormal,
  GiWheat, GiMeat, GiWaterBottle
} from 'react-icons/gi';
import { CalendarView } from '../components/CalendarView';
import { GoalsSection } from '../components/GoalsSection';
import { getFlowWeekData } from '@/app/data/mealPlans';

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

// Hämta centraliserad måltidsdata för vecka 4
const weekData = getFlowWeekData(4);
const mealPlan = weekData?.days || {};

const shoppingList = {
  'Frukt/grönt': [
    '2 morötter',
    '3.25 paprikor',
    '4 klyftor vitlök',
    'ca 5 cm ingefära',
    '0.75 lime',
    '2 cocktailtomater',
    '1.25 rödlök',
    '1.25 apelsiner',
    '1 granatäpple',
    '1 gul lök',
    '45 gram bladspenat',
    '2 bananer',
    '0.5 fänkål',
    'ca 12 cm purjolök',
    '5 aprikoser',
    '15 färska hallon',
    '1 salladslök',
    '0.75 squash',
    '0.5 röd chili',
    '100 gram sockerärtor',
    '150 gram böngroddar',
    '1.5 tomater',
    '0.75 citron',
    '100 gram ananas',
    '1 sötpotatis',
    '4 färska jordgubbar',
    '12 körsbär',
    '150 gram fryst mango',
    '50 gram fryst spenat'
  ],
  'Kryddor/smaksättare': [
    'salt',
    'svartpeppar',
    '1 msk furikakekrydda',
    '0.5 msk köftekrydda',
    '1 tsk vaniljpulver',
    '0.5 tsk örtkryddor provencale',
    '1 tsk örtagårdskrydda',
    '1.5 tsk sambal oelek',
    '3 msk teriyakisås',
    '1 tsk rödvinsvinäger',
    '0.75 tsk srirachasås',
    '0.75 dl ajvar relish',
    '2 tsk gul currypasta',
    '0.5 fiskbuljongtärning',
    '2.5 krukor färsk persilja',
    '4 msk färsk dill',
    '2 msk färsk basilika',
    '2 msk färsk gräslök',
    '2 msk färsk mynta'
  ],
  'Mejeri': [
    '2 dl grekisk yoghurt',
    '225 gram smör',
    '0.5 msk grädde',
    '125 gram fetaost',
    '70 gram mozzarella'
  ],
  'Kött/fisk/fågel/ägg/vego': [
    '500 gram kycklingfärs',
    '300 gram nötfärs',
    '150 gram fryst scampi',
    '300 gram laxfilé',
    '8.5 ägg',
    '250 gram fryst torskrygg',
    '150 gram frysta musslor (utan skal)'
  ],
  'Torrvaror': [
    '5 tsk olivolja',
    '2 msk pekannötter',
    '1 dl havregryn',
    '0.5 dl kokosskivor',
    '4 dl mandelmjöl',
    '1.5 tsk bakpulver',
    '200 gram krossade tomater',
    '1 tsk sesamolja',
    '2 msk chiafrön',
    '2 msk pumpafrön',
    '1 dl röda linser',
    '1 dl agavesirap',
    '25 gram mandelspån'
  ],
  'Övrigt': [
    '1.5 dl mandelmjölk',
    '0.75 tsk flytande honung',
    '200 ml kokosmjölk',
    '5 svarta oliver',
    '4 träspett'
  ]
};

export default function Week4Page() {
  const [activeTab, setActiveTab] = useState('overview');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const tabs: TabProps[] = [
    { id: 'overview', label: 'Översikt', icon: FiBook, color: 'from-[#112A12] to-[#112A12]' },
    { id: 'goals', label: 'Målsättning', icon: FiTarget, color: 'from-[#da695c] to-[#da695c]' },
    { id: 'mealplan', label: 'Kostschema', icon: FiCalendar, color: 'from-[#112A12] to-[#112A12]' },
    { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart, color: 'from-[#da695c] to-[#da695c]' }
  ];

  const toggleItem = (item: string) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(item)) {
      newCheckedItems.delete(item);
    } else {
      newCheckedItems.add(item);
    }
    setCheckedItems(newCheckedItems);
  };

  return (
    <div>
      <div className="relative h-[300px] md:h-[400px] bg-[#112A12] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image 
            src="/Ulrika_portratt/udavidssondesktop.png" 
            alt="Ulrika Davidsson"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Din Functional Flow Resa
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl"
          >
            {weekTitle}
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowVideoModal(true)}
            className="bg-[#014421] hover:bg-[#112A12] text-white px-8 py-4 rounded-full font-semibold flex items-center gap-3 transition-all shadow-lg"
          >
            <FiPlay className="w-5 h-5" />
            Se introduktionsvideo
          </motion.button>
        </div>

        {/* Help Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowHelpGuide(true)}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-10"
          title="Öppna hjälpguide"
        >
          <FiHelpCircle className="w-5 h-5 md:w-6 md:h-6" />
        </motion.button>
      </div><div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Vecka 4 - Functional Flow
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl"
          >
            Avancerat program för optimal hälsa
          </motion.p>
        </div>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vecka 4: Experimentera med nya smaker</h1>
        <p className="text-gray-600 mt-2">Utveckla din kunskap och utforska nya kombinationer</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
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
                  Nu har du kommit halvvägs genom kursen! Den här veckan fokuserar vi på att utveckla 
                  din kunskap om functional foods och experimentera med nya smaker och kombinationer.
                </p>
                <p className="text-lg leading-relaxed">
                  Du kommer att upptäcka hur olika kryddor och örter kan förstärka näringsupptaget 
                  och hur du kan variera dina måltider för optimal hälsa.
                </p>
              </div>

              {/* Week 4 Highlights */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 rounded-full p-3">
                    <FiTrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Veckans fokus: Experimentera med nya smaker</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-background rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Kryddor & Örter</h4>
                        <p className="text-gray-700 mb-3">
                          Upptäck hur rätt kryddor kan förstärka både smak och näringsupptag. 
                          Experimentera med antiinflammatoriska kryddor som gurkmeja och ingefära.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-orange-600 mt-0.5 flex-shrink-0" />
                            <span>Prova nya kryddkombinationer</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-orange-600 mt-0.5 flex-shrink-0" />
                            <span>Fokusera på antiinflammatoriska kryddor</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Näringssynergier</h4>
                        <p className="text-gray-700 mb-3">
                          Lär dig skapa smarta matkombinationer som förstärker varandra. 
                          Vissa näringsämnen fungerar bättre tillsammans än var för sig.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-primary mt-0.5 flex-shrink-0" />
                            <span>Kombinera järn med C-vitamin</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-primary mt-0.5 flex-shrink-0" />
                            <span>Fett förbättrar upptag av fettlösliga vitaminer</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiCalendar className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">21</h4>
                  <p className="text-gray-600">Dagar klara</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <GiMeal className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">84</h4>
                  <p className="text-gray-600">Måltider</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiTrendingUp className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">50%</h4>
                  <p className="text-gray-600">Av kursen</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <FiHeart className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <h4 className="text-2xl font-bold text-gray-900">15+</h4>
                  <p className="text-gray-600">Nya vanor</p>
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
              <CalendarView mealPlan={mealPlan} weekNumber={4} />
              
              {/* Recipe Highlights */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Veckans höjdpunkter</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -8,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Background with gradient overlay */}
                    <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-indigo-500/20 to-purple-600/20" />
                      
                      {/* Decorative elements */}
                      <div className="absolute inset-0">
                        <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-full blur-sm"></div>
                        <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/30 rounded-full blur-sm"></div>
                        <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/25 rounded-full blur-sm"></div>
                      </div>
                      
                      {/* Icon */}
                      <div className="flex items-center justify-center relative z-10">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                          <span className="text-2xl">🍛</span>
                        </div>
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 bg-white relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      
                      <h4 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        Kyckling i grön curry
                      </h4>
                      <p className="text-gray-600 text-sm mb-3 group-hover:text-gray-700 transition-colors duration-300">
                        Antiinflammatorisk rätt med gurkmeja och ingefära som stärker immunförsvaret
                      </p>
                      
                      <div className="flex gap-2 flex-wrap mb-3">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Protein</span>
                        <span className="bg-background-secondary text-secondary text-xs px-2 py-1 rounded-full">Antiinflammatorisk</span>
                      </div>
                      
                      {/* Action indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <FiClock className="w-3 h-3" />
                          <span>35 min</span>
                        </div>
                        <div className="w-8 h-8 bg-[#112A12] rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <FiChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -8,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer bg-gradient-to-br from-orange-50 to-red-50 hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Background with gradient overlay */}
                    <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-orange-100 via-red-100 to-pink-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-red-500/20 to-pink-600/20" />
                      
                      {/* Decorative elements */}
                      <div className="absolute inset-0">
                        <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-full blur-sm"></div>
                        <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/30 rounded-full blur-sm"></div>
                        <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/25 rounded-full blur-sm"></div>
                      </div>
                      
                      {/* Icon */}
                      <div className="flex items-center justify-center relative z-10">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                          <span className="text-2xl">🐟</span>
                        </div>
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 bg-white relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      
                      <h4 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                        Lax med fetaost
                      </h4>
                      <p className="text-gray-600 text-sm mb-3 group-hover:text-gray-700 transition-colors duration-300">
                        Omega-3 rik måltid med rostade rotfrukter för optimal hjärnhälsa
                      </p>
                      
                      <div className="flex gap-2 flex-wrap mb-3">
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">Omega-3</span>
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">Hjärnhälsa</span>
                      </div>
                      
                      {/* Action indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <FiClock className="w-3 h-3" />
                          <span>25 min</span>
                        </div>
                        <div className="w-8 h-8 bg-[#da695c] rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <FiChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ 
                      scale: 1.05,
                      y: -8,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer bg-gradient-to-br from-green-50 to-teal-50 hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Background with gradient overlay */}
                    <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-teal-500/20 to-blue-600/20" />
                      
                      {/* Decorative elements */}
                      <div className="absolute inset-0">
                        <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-full blur-sm"></div>
                        <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/30 rounded-full blur-sm"></div>
                        <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/25 rounded-full blur-sm"></div>
                      </div>
                      
                      {/* Icon */}
                      <div className="flex items-center justify-center relative z-10">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                          <span className="text-2xl">🌱</span>
                        </div>
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 bg-white relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      
                      <h4 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-primary transition-colors duration-300">
                        Chiafrögrön
                      </h4>
                      <p className="text-gray-600 text-sm mb-3 group-hover:text-gray-700 transition-colors duration-300">
                        Energigivande frukost med superfrön och antioxidanter
                      </p>
                      
                      <div className="flex gap-2 flex-wrap mb-3">
                        <span className="bg-background-secondary text-secondary text-xs px-2 py-1 rounded-full">Fiber</span>
                        <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full">Antioxidanter</span>
                      </div>
                      
                      {/* Action indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <FiClock className="w-3 h-3" />
                          <span>5 min</span>
                        </div>
                        <div className="w-8 h-8 bg-[#da695c] rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <FiChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
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
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Inköpslista vecka 4</h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(shoppingList).map(([category, items]) => (
                    <div key={category} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        {category === 'Frukt/grönt' && '🥬'}
                        {category === 'Kryddor/smaksättare' && '🌿'}
                        {category === 'Mejeri' && '🥛'}
                        {category === 'Kött/fisk/fågel/ägg/vego' && '🥩'}
                        {category === 'Torrvaror' && '🌾'}
                        {category === 'Övrigt' && '📦'}
                        {category}
                      </h3>
                      <ul className="space-y-2">
                        {items.map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <button
                              onClick={() => toggleItem(`${category}-${index}`)}
                              className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
                                checkedItems.has(`${category}-${index}`)
                                  ? 'bg-primary border-primary'
                                  : 'border-gray-300 hover:border-primary'
                              }`}
                            >
                              {checkedItems.has(`${category}-${index}`) && (
                                <FiCheck className="w-3 h-3 text-white" />
                              )}
                            </button>
                            <span className={`text-gray-700 ${
                              checkedItems.has(`${category}-${index}`) ? 'line-through opacity-50' : ''
                            }`}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Week Button */}
      <div className="pb-16">
        <div className="bg-primary rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Halvvägs där!</h3>
          <p className="text-lg mb-6">
            Du har gjort fantastiska framsteg. Fortsätt till vecka 5 för att lära dig om flexibilitet och anpassning.
          </p>
          <Link
            href="/dashboard/courses/functional-flow/week/5"
            className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Fortsätt till vecka 5
            <FiChevronRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
} 
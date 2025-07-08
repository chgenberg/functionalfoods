'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  dessert?: MealItem;
}

// Hämta centraliserad måltidsdata för vecka 5
const weekData = getWeekData(5);
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

export default function Week5Page() {
  const [activeTab, setActiveTab] = useState('overview');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const tabs: TabProps[] = [
    { id: 'overview', label: 'Översikt', icon: FiBook, color: 'from-blue-500 to-indigo-600' },
    { id: 'goals', label: 'Målsättning', icon: FiTarget, color: 'from-orange-500 to-red-600' },
    { id: 'mealplan', label: 'Kostschema', icon: FiCalendar, color: 'from-purple-500 to-pink-600' },
    { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart, color: 'from-green-500 to-teal-600' }
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
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vecka 5: Flexibilitet och egna val</h1>
        <p className="text-gray-600 mt-2">Utveckla din självständighet och experimentera med nya idéer</p>
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
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
                <h2 className="text-3xl font-bold mb-4">Välkommen till vecka 5!</h2>
                <p className="text-lg leading-relaxed mb-6">
                  Tycker du att det är bra att allt är planerat för dig, eller önskar du mer flexibilitet? 
                  Vill du byta ut några recept eller skapa egna, använd dokumentet "Topplistan Functional Foods" 
                  för att välja råvaror du har hemma eller vill börja använda mer av. Ju mer du lär dig desto 
                  mer självständig blir du i att skapa hälsosamma vanor för din framtida hälsa.
                </p>
                <p className="text-lg leading-relaxed">
                  Vill du boosta kroppen ytterligare kan du börja använda superpulver som spirulina, 
                  chlorella eller vetegräs i shots på morgonen, eller göra egen benbuljong för att få 
                  i dig mer kollagen. Det finns många sätt att utvecklas inom Functional Foods och du 
                  läsa mer i dokumenten "Drycker", "Benbuljong" och "Superpulver".
                </p>
              </div>

              {/* Week 5 Focus */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 rounded-full p-3">
                    <FiTrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Veckans fokus: Flexibilitet och egna val</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Utveckla din självständighet</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-orange-600 mt-0.5 flex-shrink-0" />
                            <span>Skapa egna recept-variationer</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-orange-600 mt-0.5 flex-shrink-0" />
                            <span>Anpassa efter dina smakpreferenser</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-orange-600 mt-0.5 flex-shrink-0" />
                            <span>Använd "Topplistan Functional Foods"</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Experimentera med superpulver</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Prova spirulina, chlorella eller vetegräs</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Gör egen benbuljong för kollagen</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <FiCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
                            <span>Skapa egna variationer av recepten</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Week 5 Resources */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Veckans resurser</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Link href="/dashboard/courses/functional-basics/downloads" className="block">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 text-center cursor-pointer h-full"
                    >
                      <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                        <FiDownload className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Topplistan Functional Foods</h4>
                      <p className="text-sm text-gray-600">Komplett guide över de bästa råvarorna</p>
                    </motion.div>
                  </Link>
                  
                  <Link href="/dashboard/courses/functional-basics/downloads" className="block">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center cursor-pointer h-full"
                    >
                      <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                        <FiDownload className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Drycker & Benbuljong</h4>
                      <p className="text-sm text-gray-600">Recept för hälsosamma drycker</p>
                    </motion.div>
                  </Link>
                  
                  <Link href="/dashboard/courses/functional-basics/downloads" className="block">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center cursor-pointer h-full"
                    >
                      <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                        <FiDownload className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Superpulver Guide</h4>
                      <p className="text-sm text-gray-600">Lär dig om spirulina, chlorella & mer</p>
                    </motion.div>
                  </Link>
                </div>
              </div>

              {/* Week 5 Highlights */}
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
                    className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Background with gradient overlay */}
                    <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-yellow-100 via-orange-100 to-red-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-red-600/20" />
                      
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
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      
                      <h4 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-yellow-600 transition-colors duration-300">
                        Torsk från mellanöstern
                      </h4>
                      <p className="text-gray-600 text-sm mb-3 group-hover:text-gray-700 transition-colors duration-300">
                        Exotisk smakkombination med orientaliska kryddor som väcker smaklökarna
                      </p>
                      
                      <div className="flex gap-2 flex-wrap mb-3">
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">Protein</span>
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">Kryddstark</span>
                      </div>
                      
                      {/* Action indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <FiClock className="w-3 h-3" />
                          <span>30 min</span>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
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
                          <span className="text-2xl">🥘</span>
                        </div>
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 bg-white relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      
                      <h4 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-green-600 transition-colors duration-300">
                        Vegetarisk currygryta
                      </h4>
                      <p className="text-gray-600 text-sm mb-3 group-hover:text-gray-700 transition-colors duration-300">
                        Proteinrik vegetarisk rätt med paneer som ger mättnad och näring
                      </p>
                      
                      <div className="flex gap-2 flex-wrap mb-3">
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Vegetarisk</span>
                        <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full">Fiber</span>
                      </div>
                      
                      {/* Action indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <FiClock className="w-3 h-3" />
                          <span>45 min</span>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
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
                    className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer bg-gradient-to-br from-pink-50 to-purple-50 hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Background with gradient overlay */}
                    <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-purple-500/20 to-indigo-600/20" />
                      
                      {/* Decorative elements */}
                      <div className="absolute inset-0">
                        <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-full blur-sm"></div>
                        <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/30 rounded-full blur-sm"></div>
                        <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/25 rounded-full blur-sm"></div>
                      </div>
                      
                      {/* Icon */}
                      <div className="flex items-center justify-center relative z-10">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                          <span className="text-2xl">🍰</span>
                        </div>
                      </div>
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 bg-white relative">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                      
                      <h4 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-pink-600 transition-colors duration-300">
                        Mandelkaka med frukt
                      </h4>
                      <p className="text-gray-600 text-sm mb-3 group-hover:text-gray-700 transition-colors duration-300">
                        Hälsosam efterrätt utan tillsatt socker som tillfredsställer sötsug
                      </p>
                      
                      <div className="flex gap-2 flex-wrap mb-3">
                        <span className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full">Efterrätt</span>
                        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">Glutenfri</span>
                      </div>
                      
                      {/* Action indicator */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <FiClock className="w-3 h-3" />
                          <span>25 min</span>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <FiChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
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
              <GoalsSection weekNumber={5} />
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
              <CalendarView mealPlan={mealPlan} weekNumber={5} />
              
              {/* Recipe Highlights */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2">
                    <FiStar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Veckans höjdpunkter</h3>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100 hover:border-yellow-300 transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">🐟</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">Torsk från mellanöstern</h4>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      Exotisk smakkombination med orientaliska kryddor som väcker smaklökarna och ger en spännande twist på klassisk fisk.
                    </p>
                    <div className="flex gap-2 flex-wrap mb-3">
                      <span className="bg-yellow-200 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium">🍽️ Protein</span>
                      <span className="bg-orange-200 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">🌶️ Kryddstark</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <FiClock className="w-4 h-4 mr-1" />
                      <span>30 min</span>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="bg-gradient-to-r from-green-400 to-teal-500 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">🥘</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">Vegetarisk currygryta</h4>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      Proteinrik vegetarisk rätt med paneer som ger mättnad och näring. Perfekt för en hälsosam och smakrik middag.
                    </p>
                    <div className="flex gap-2 flex-wrap mb-3">
                      <span className="bg-green-200 text-green-800 text-xs px-3 py-1 rounded-full font-medium">🌱 Vegetarisk</span>
                      <span className="bg-teal-200 text-teal-800 text-xs px-3 py-1 rounded-full font-medium">🌾 Fiber</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <FiClock className="w-4 h-4 mr-1" />
                      <span>45 min</span>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-100 hover:border-pink-300 transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="bg-gradient-to-r from-pink-400 to-purple-500 rounded-full w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">🍰</span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-3 text-lg">Mandelkaka med frukt</h4>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      Hälsosam efterrätt utan tillsatt socker som tillfredsställer sötsug på ett naturligt sätt.
                    </p>
                    <div className="flex gap-2 flex-wrap mb-3">
                      <span className="bg-pink-200 text-pink-800 text-xs px-3 py-1 rounded-full font-medium">🍰 Efterrätt</span>
                      <span className="bg-purple-200 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">🌾 Glutenfri</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <FiClock className="w-4 h-4 mr-1" />
                      <span>25 min</span>
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
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Inköpslista vecka 5</h2>
                
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
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-gray-300 hover:border-green-500'
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
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Snart i mål!</h3>
          <p className="text-lg mb-6">
            Du har kommit långt på din resa. Sista veckan väntar med sammanfattning och nästa steg.
          </p>
          <Link
            href="/dashboard/courses/functional-basics/week/6"
            className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Fortsätt till vecka 6
            <FiChevronRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
} 
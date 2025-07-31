'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiCalendar, FiShoppingCart, FiBookOpen, FiClock,
  FiChevronRight, FiCheck, FiStar, FiAward, FiDownload
} from 'react-icons/fi';
import Link from 'next/link';
import { CalendarView } from '../components/CalendarView';
import { GoalsSection } from '../components/GoalsSection';
import { getWeekData } from '@/app/data/mealPlans';

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

// Hämta centraliserad måltidsdata för vecka 6
const weekData = getWeekData(6);
const mealPlan = weekData?.days || {};

const shoppingList = {
  'Frukt/grönt': [
    '6 klyftor vitlök',
    '2 röd chili',
    '2 paprikor',
    '0.25 squash',
    '0.25 fänkål',
    '5 cocktailtomater',
    '3 morötter',
    '10 brysselkål',
    '0.5 kiwi',
    '0.25 rödlök',
    '2 dl rucola',
    'ca 10 cm purjolök',
    '1 pak choi',
    '0.25 lime',
    '0.5 ananas',
    'ca 7 cm ingefära',
    '1 salladslök',
    '2 gul lök',
    '100 gram haricots verts',
    '0.25 aubergine',
    '5 färska champinjoner',
    '0.75 färsk mango',
    '1 palsternacka',
    '0.75 granatäpple',
    '0.5 citron',
    '160 gram majs',
    '1.5 apelsin',
    '1 banan',
    '1 cantaloupemelon',
    '2 dl frysta blåbär',
    '2 dl frysta hallon',
    '300 gram frysta wokgrönsaker'
  ],
  'Kryddor/smaksättare': [
    'salt',
    'svartpeppar',
    '1.5 tsk örtagårdskrydda',
    '1 krm paprikapulver',
    '0.75 tsk kardemumma',
    '1 tsk curry',
    '1 tsk garam masala',
    '0.5 msk furikakekrydda',
    '1 tsk malen kanel',
    '0.5 tsk spiskummin',
    '1 dl teriyakisås',
    '1 tsk srirachasås',
    '1 msk ketjap manis',
    '1 köttbuljongtärning',
    '1 hönsbuljongtärning',
    '1 msk färsk koriander',
    '2 msk färsk basilika',
    '1 dl färsk mynta',
    '1.75 dl färsk persilja'
  ],
  'Mejeri': [
    '1 dl keso',
    '2 msk smör',
    '1 dl grekisk yoghurt',
    '0.5 dl gräddfil',
    '150 gram halloumi'
  ],
  'Kött/fisk/fågel/ägg/vego': [
    '300 gram kycklingfilé',
    '300 gram nötfärs',
    '350 gram torskrygg',
    '4 ägg',
    '500 gram laxfilé',
    '800 gram lammstek'
  ],
  'Torrvaror': [
    '1 tsk rapsolja',
    '2.5 msk olivolja',
    '1 msk pekannötter',
    '600 gram krossade tomater',
    '5 torkade aprikoser',
    '1 dl havregryn',
    '6 torkade plommon',
    '1 msk jordnötter',
    '3 soltorkade tomater',
    '0.5 msk pistagenötter',
    '1 dl röda linser',
    '1 dl vit quinoa',
    '3 dl bulgur',
    '1 msk kokosflingor',
    '2 msk kokosskivor'
  ],
  'Övrigt': [
    '0.5 msk majonnäs',
    '1 dl mandelmjölk',
    '1 dl syltlök',
    'valfritt pålägg till en fralla',
    '10 cornichongurkor',
    '1 dl lingonsylt'
  ]
};

export default function Week6Page() {
  const [activeTab, setActiveTab] = useState('overview');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vecka 6</h1>
          <p className="text-lg text-gray-600">Sista veckan - dags att fira din resa!</p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Översikt', icon: FiBookOpen },
              { id: 'goals', label: 'Mål', icon: FiStar },
              { id: 'meals', label: 'Kostschema', icon: FiCalendar },
              { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-lg p-8 text-white">
                <div className="flex items-start gap-4">
                  <FiAward className="w-12 h-12 flex-shrink-0" />
                  <div>
                    <h2 className="text-3xl font-bold mb-4">Välkommen till vecka 6!</h2>
                    <p className="text-lg leading-relaxed mb-4">
                      Nu är det sista veckan i baskursen och du har lärt dig grunderna för hur råvaror och 
                      tillagning påverkar din hälsa. Under dessa veckor har du fått prova många maträtter och 
                      lärt dig recept som du kan anpassa efter egna smakpreferenser.
                    </p>
                    <p className="text-lg leading-relaxed mb-4">
                      Förhoppningsvis har du också blivit inspirerad att använda näringsrika grönsaker som kål, 
                      rotfrukter och bladgrönsaker, som är rika på antioxidanter och fibrer.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Du har ätit en naturligt glutenfri kost och ersatt mindre hälsosamma alternativ som pasta, 
                      vete och socker med bättre val. Du får i dig mer protein, grönsaker, frukt, baljväxter och 
                      omega-3, samt både prebiotika och probiotika. Nu är det dags att anamma detta som livsstil!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Din fantastiska resa</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-6 text-center"
                  >
                    <div className="text-3xl font-bold text-green-600 mb-2">42</div>
                    <div className="text-gray-700">Dagar av hälsosam mat</div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-6 text-center"
                  >
                    <div className="text-3xl font-bold text-blue-600 mb-2">126+</div>
                    <div className="text-gray-700">Näringsrika måltider</div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-6 text-center"
                  >
                    <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
                    <div className="text-gray-700">Glutenfri kost</div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-pink-100 to-pink-200 rounded-xl p-6 text-center"
                  >
                    <div className="text-3xl font-bold text-pink-600 mb-2">∞</div>
                    <div className="text-gray-700">Kunskap för livet</div>
                  </motion.div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Nästa steg</h3>
                <p className="text-gray-700 mb-6">
                  Nu är det dags att anamma Functional Foods som livsstil. Läs dokumentet 
                  "Functional Foods som livsstil" för att få vägledning om hur du fortsätter din resa.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    href="/dashboard/courses/functional-flow/downloads"
                    className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <FiDownload className="w-5 h-5" />
                    Ladda ner "Functional Foods som livsstil"
                  </Link>
                  <Link 
                    href="/dashboard/courses"
                    className="inline-flex items-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Utforska fler kurser
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <GoalsSection weekNumber={6} />
          )}

          {activeTab === 'meals' && (
            <div className="space-y-8">
              <CalendarView mealPlan={mealPlan} weekNumber={6} />
              
              {/* Recipe Highlights */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Veckans avslutande rätter</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Indisk laxgryta</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Smakrik gryta med antiinflammatoriska kryddor
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Omega-3</span>
                      <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded-full">Kryddor</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Lammgryta med plommon</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Näringsrik proteinrätt med naturlig sötma
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">Protein</span>
                      <span className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full">Antioxidanter</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Tropisk fruktsallad</h4>
                    <p className="text-gray-600 text-sm mb-3">
                      Färgglad avslutning med C-vitaminrika frukter
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">C-vitamin</span>
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">Efterrätt</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shopping' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Inköpslista vecka 6</h2>
              
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

              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-8 mb-6">
                  <FiAward className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Grattis!</h3>
                  <p className="text-gray-700">
                    Du har klarat alla 6 veckor av Functional Basics kursen. 
                    Nu har du kunskapen att fortsätta din hälsoresa!
                  </p>
                </div>
                
                <Link 
                  href="/dashboard/courses/functional-flow/week/5"
                  className="text-gray-600 hover:text-gray-900 mr-4"
                >
                  ← Tillbaka till vecka 5
                </Link>
                <Link 
                  href="/dashboard/courses"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                >
                  Avsluta kursen <FiChevronRight />
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 
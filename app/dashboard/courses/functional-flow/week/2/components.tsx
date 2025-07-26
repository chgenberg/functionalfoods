'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiCalendar, FiShoppingCart, FiChevronRight, 
  FiClock, FiCheckCircle, FiDownload, FiExternalLink
} from 'react-icons/fi';
import { 
  GiFruitBowl, GiMeal, GiCookingPot, GiMeat, 
  GiWheat, GiWaterBottle, GiHerbsBundle
} from 'react-icons/gi';

interface MealItem {
  name: string;
  recipeLink?: string;
}

interface DayMeals {
  breakfast: MealItem;
  lunch: MealItem;
  dinner: MealItem;
  snack?: MealItem;
}

// Recipe Highlights with improved design
export function RecipeHighlights() {
  const recipes = [
    { name: 'Nudelsoppa med grönsaker', time: 'Måndag - Middag', image: '/images/nudelsoppa.jpg' },
    { name: 'Turkiska lammfärsspett', time: 'Onsdag - Middag', image: '/images/lammfarsspett.jpg' },
    { name: 'Lax med fetaost', time: 'Fredag - Middag', image: '/images/lax-feta.jpg' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Veckans höjdpunkter</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {recipes.map((recipe, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.05,
              y: -8,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-2xl transition-all duration-300"
          >
            {/* Background with gradient overlay */}
            <div className="aspect-w-16 aspect-h-12 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-500/20 to-orange-600/20" />
              
              {/* Decorative elements */}
              <div className="absolute inset-0">
                <div className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-full blur-sm"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/30 rounded-full blur-sm"></div>
                <div className="absolute top-1/3 left-1/4 w-4 h-4 bg-white/25 rounded-full blur-sm"></div>
              </div>
              
              {/* Icon */}
              <div className="flex items-center justify-center relative z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                  <GiMeal className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Content */}
            <div className="p-4 bg-white relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              
              <h4 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                {recipe.name}
              </h4>
              <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors duration-300">
                {recipe.time}
              </p>
              
              {/* Action indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <FiClock className="w-3 h-3" />
                  <span>25 min</span>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <FiChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Meal Plan Section Component
export function MealPlanSection({ 
  mealPlan, 
  expandedDay, 
  setExpandedDay 
}: {
  mealPlan: Record<string, DayMeals>;
  expandedDay: string | null;
  setExpandedDay: (day: string | null) => void;
}) {
  const mealIcons = {
    breakfast: { icon: GiCookingPot, color: 'text-orange-600', bg: 'bg-orange-100' },
    lunch: { icon: GiMeal, color: 'text-blue-600', bg: 'bg-blue-100' },
    dinner: { icon: GiFruitBowl, color: 'text-purple-600', bg: 'bg-purple-100' },
    snack: { icon: GiWaterBottle, color: 'text-green-600', bg: 'bg-green-100' }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Veckans kostschema</h2>
        
        <div className="space-y-4">
          {Object.entries(mealPlan).map(([day, meals]) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <button
                onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between hover:from-gray-100 hover:to-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg px-4 py-2">
                    <span className="font-bold text-lg">{day}</span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <span className="flex items-center">
                      <GiCookingPot className="mr-1" />
                      Frukost
                    </span>
                    <span className="flex items-center">
                      <GiMeal className="mr-1" />
                      Lunch
                    </span>
                    <span className="flex items-center">
                      <GiFruitBowl className="mr-1" />
                      Middag
                    </span>
                    {meals.snack && (
                      <span className="flex items-center">
                        <GiWaterBottle className="mr-1" />
                        Mellanmål
                      </span>
                    )}
                  </div>
                </div>
                <FiChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedDay === day ? 'rotate-90' : ''
                }`} />
              </button>

              {expandedDay === day && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 py-4 bg-white border-t border-gray-100"
                >
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(meals).map(([mealType, meal]) => {
                      const icon = mealIcons[mealType as keyof typeof mealIcons];
                      return (
                        <div key={mealType} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div className={`${icon.bg} rounded-full p-2 mr-2`}>
                              <icon.icon className={`w-5 h-5 ${icon.color}`} />
                            </div>
                            <h4 className="font-semibold text-gray-900 capitalize">{mealType}</h4>
                          </div>
                          {meal.recipeLink ? (
                            <Link 
                              href={meal.recipeLink}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                            >
                              {meal.name}
                              <FiExternalLink className="ml-1 w-3 h-3" />
                            </Link>
                          ) : (
                            <p className="text-sm text-gray-700">{meal.name}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Shopping List Section Component
export function ShoppingListSection() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const shoppingList = {
    'Frukt & Grönt': [
      '4 klyftor vitlök',
      '1,3kg morötter',
      '100 gram blomkål',
      'ca 5 cm färsk ingefära',
      '4 skogschampinjoner',
      '1.5 dl granatäppelkärnor',
      '1 äpple',
      '0.5 gul lök',
      '1 rödlök',
      '10 cocktailtomater',
      '2 tomater',
      '1 sötpotatis',
      '250 gram brysselkål',
      '14 färska jordgubbar',
      '1 chili',
      '1 paprika',
      '1 päron',
      '1 salladslök',
      '100 gram broccoli',
      '200 gram sockerärtor',
      '1 apelsin',
      '1 msk gräslök',
      '5 cm gurka',
      '1 citron',
      '1 hjärtsallad',
      '1 palsternacka',
      '1 banan',
      '1 dl purjolök',
      '0.5 mango',
      '20 gram bladspenat',
      '250 gram grön sparris',
      '2 dl frysta hallon',
      '2 dl frysta blåbär'
    ],
    'Kryddor & Smaksättare': [
      'salt',
      'svartpeppar',
      '0.5 msk curry mango krydda',
      '0.5 msk ketjap manis',
      '2 krukor färsk persilja',
      '5 dl färsk persilja',
      '1 krm torkad oregano',
      '1 kruka färsk basilika',
      '1 tsk örtagårdskrydda',
      '2 msk färsk timjan',
      '0.5 hönsbuljongtärning',
      '2 msk färsk koriander',
      '2 färska dillkvistar',
      '0.5 msk köftekrydda',
      '1 msk färsk mynta',
      '3 msk teriyakisås'
    ],
    'Mejeri': [
      '3 dl grekisk yoghurt',
      '150 gram fetaost',
      '75 gram chevreost',
      '2 tsk smör',
      '50 gram philadelphiaost'
    ],
    'Kött, Fisk & Ägg': [
      '5 ägg',
      '300 gram lammfärs',
      '600 gram laxfilé',
      '300 gram torskrygg',
      '0.5 grillad kyckling',
      '350 gram nötfärs'
    ],
    'Torrvaror': [
      '5.5 tsk olivolja',
      '0.25 dl saltade jordnötter',
      '3 soltorkade tomater',
      '1 dl pekannötter',
      '80 gram glasnudlar',
      '1 msk torkade tranbär',
      '100 gram ramennudlar',
      '1 dl bulgur',
      '3 msk pumpafrön',
      '4 tsk rapsolja',
      '1 tsk balsamvinäger'
    ],
    'Övrigt': [
      '2 msk majonäs',
      '4 träspett',
      'valfritt pålägg till ett bröd',
      '1 dl mandelmjölk',
      '30 gram vit choklad'
    ]
  };

  const toggleItem = (item: string) => {
    setCheckedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const categoryIcons = {
    'Frukt & Grönt': GiFruitBowl,
    'Kryddor & Smaksättare': GiHerbsBundle,
    'Mejeri': GiMeal,
    'Kött, Fisk & Ägg': GiMeat,
    'Torrvaror': GiWheat,
    'Övrigt': GiWaterBottle
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Inköpslista vecka 2</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <FiDownload />
            <span>Ladda ner PDF</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(shoppingList).map(([category, items]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || GiMeal;
            return (
              <div key={category} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full p-3 mr-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {items.map((item, index) => (
                    <label
                      key={index}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checkedItems.includes(`${category}-${index}`)}
                        onChange={() => toggleItem(`${category}-${index}`)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className={`text-sm ${
                        checkedItems.includes(`${category}-${index}`)
                          ? 'line-through text-gray-400'
                          : 'text-gray-700'
                      }`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-purple-50 rounded-xl p-6">
          <p className="text-purple-800">
            <strong>Tips!</strong> Planera din vecka och förbered några rätter i förväg. 
            Följ kostschemat och undvik småätande mellan måltiderna för bästa resultat.
          </p>
        </div>
      </div>
    </div>
  );
}

// Knowledge Section Component
export function KnowledgeSection() {
  const knowledgeSections = [
    {
      id: 'functional-foods-3-steg',
      title: 'Functional Foods - 3 steg till ett friskare liv',
      icon: GiFruitBowl,
      color: 'from-purple-500 to-pink-600',
      content: `Upptäck de tre grundläggande stegen för att integrera functional foods i din vardag och skapa en hållbar livsstilsförändring.`,
      link: '/dashboard/courses/functional-basics/material/functional-foods-3-steg'
    },
    {
      id: 'att-ata-ute',
      title: 'Att äta ute med Functional Foods',
      icon: GiMeal,
      color: 'from-green-500 to-teal-600',
      content: `Praktiska tips för hur du kan göra hälsosamma val på restaurang och hålla dig till dina nya matvanor även när du äter ute.`,
      link: '/dashboard/courses/functional-basics/material/att-ata-ute'
    },
    {
      id: 'naturens-halsobomber',
      title: 'Naturens egna hälsobomber',
      icon: GiCookingPot,
      color: 'from-orange-500 to-red-600',
      content: `Lär dig mer om de mest kraftfulla functional foods-ingredienserna och hur de kan boosta din hälsa på naturlig väg.`,
      link: '/dashboard/courses/functional-basics/material/naturens-halsobomber'
    },
    {
      id: 'ersattningsguide',
      title: 'Ersättningsguide för kolhydrater',
      icon: GiWheat,
      color: 'from-blue-500 to-indigo-600',
      content: `En praktisk guide för hur du kan ersätta snabba kolhydrater med näringsrika alternativ som håller blodsockret stabilt.`,
      link: '/dashboard/courses/functional-basics/material/ersattningsguide-kolhydrater'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Veckans kunskapsmaterial</h2>
        <p className="text-gray-700 mb-8">
          Den här veckan fördjupar vi kunskapen om functional foods och lär oss praktiska strategier 
          för att integrera dem i vardagen.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {knowledgeSections.map((section) => (
            <motion.div
              key={section.id}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r p-[2px] rounded-xl shadow-lg"
            >
              <div className={`bg-gradient-to-r ${section.color} p-[2px] rounded-xl`}>
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`bg-gradient-to-r ${section.color} rounded-full p-3`}>
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{section.content}</p>
                      <Link
                        href={section.link}
                        className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800"
                      >
                        Läs mer
                        <FiChevronRight className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📚 Veckans fokus: "Functional Foods - 3 steg till ett friskare liv"
          </h3>
          <p className="text-gray-700">
            Detta dokument är särskilt viktigt denna vecka. Det ger dig en tydlig struktur för hur du kan 
            fortsätta din hälsoresa och bygga hållbara vanor som varar livet ut.
          </p>
        </div>
      </div>
    </div>
  );
} 

export { GoalsSection } from '../components/GoalsSection'; 
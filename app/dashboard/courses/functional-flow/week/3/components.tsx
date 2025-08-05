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
    snack: { icon: GiWaterBottle, color: 'text-primary', bg: 'bg-background-secondary' }
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
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg px-4 py-2">
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

// Recipe Highlights with improved design
export function RecipeHighlights() {
  const recipes = [
    { name: 'Kycklingfylld aubergine', time: 'Måndag - Middag', image: '/images/kycklingfylld-aubergine.jpg' },
    { name: 'Rökt lax med blomkålsallad', time: 'Tisdag - Middag', image: '/images/rokt-lax-blomkalsallad.jpg' },
    { name: 'Vegetarisk currygryta', time: 'Onsdag - Middag', image: '/images/vegetarisk-currygryta.jpg' }
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
                  <GiMeal className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Content */}
            <div className="p-4 bg-white relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              
              <h4 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                {recipe.name}
              </h4>
              <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors duration-300">
                {recipe.time}
              </p>
              
              {/* Action indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <FiClock className="w-3 h-3" />
                  <span>30 min</span>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
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

// Shopping List Section Component
export function ShoppingListSection() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const shoppingList = {
    'Frukt & Grönt': [
      '1 aubergine',
      '1.5 granatäpplen',
      '3.25 citroner',
      'ca 12 cm purjolök',
      '1 avokado',
      '1 dl rucola',
      'ca 8 cm ingefära',
      '5 morötter',
      '0.5 broccolistånd',
      '3 hjärtsallad',
      '100 gram färsk mango',
      '0.5 rödlök',
      '0.5 äpple',
      '3.5 klyftor vitlök',
      '1 salladsblad',
      '0.75 blomkålshuvud',
      '5 cocktailtomater',
      '1 kg rödbetor',
      '1 gul lök',
      '2.5 paprikor',
      '3 selleristjälkar',
      '100 gram vattenmelon',
      '1 dl färska blåbär',
      '25 cm gurka',
      '2 färska jordgubbar',
      '1 rättika',
      '2 dl frysta hallon'
    ],
    'Kryddor & Smaksättare': [
      'salt',
      'svartpeppar',
      '3 krm örtagårdskrydda',
      '2 krm paprikapulver',
      '1 msk tandoorikrydda',
      '0.75 tsk curry',
      '1 krm spiskummin',
      '20 gram kerala curry kryddmix',
      '3 msk mango chutney',
      '1 msk ketjap manis',
      '1 msk sötstark senap',
      '5 msk färsk dill',
      '2.5 dl färsk persilja',
      '1 msk färsk mynta'
    ],
    'Mejeri': [
      '2.25 dl grekisk yoghurt',
      '50 gram fetaost',
      '2 tsk smör',
      '1 dl keso',
      '0.75 dl creme fraiche',
      '3 msk grädde',
      '225 gram Apetina panéer'
    ],
    'Kött, Fisk & Ägg': [
      '0.75 grillad kyckling',
      '130 gram rökt lax',
      '300 gram högrevsburgare',
      '300 gram laxfilé',
      '6 ägg',
      '300 gram kycklinglårfilé'
    ],
    'Torrvaror': [
      '2 dl olivolja',
      '250 gram konserverade kikärtor',
      '4 dl mandelmjöl',
      '2 dl sukrin',
      '1 tsk bakpulver',
      '0.5 dl valnötter',
      '3 msk pistagenötter',
      '1 dl mandelspån'
    ],
    'Övrigt': [
      '1 msk majonäs',
      'valfritt pålägg till ett bröd',
      '400 ml kokosmjölk light'
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
          <h2 className="text-3xl font-bold text-gray-900">Inköpslista vecka 3</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
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
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-full p-3 mr-3">
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
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
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

        <div className="mt-8 bg-orange-50 rounded-xl p-6">
          <p className="text-orange-800">
            <strong>Tips för vecka 3!</strong> Om du vill prova 16:8 fasta kan du hoppa över frukosten 
            och börja äta vid lunch. Lyssna på din kropp och anpassa efter dina behov.
          </p>
        </div>
      </div>
    </div>
  );
} 
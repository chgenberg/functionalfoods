'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronLeft, FiChevronRight, FiClock, FiUsers, FiShoppingCart,
  FiCheckCircle, FiPrinter, FiDownload, FiCalendar, FiInfo
} from 'react-icons/fi';
import { GiMeal, GiFruitBowl, GiCookingPot, GiShoppingBag } from 'react-icons/gi';

interface Meal {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description: string;
  time?: string;
  recipe?: boolean;
  recipeId?: string;
}

interface DayPlan {
  day: string;
  meals: Meal[];
}

interface ShoppingItem {
  category: string;
  items: { name: string; amount: string; checked: boolean }[];
}

export default function Week1Page() {
  const [activeTab, setActiveTab] = useState<'plan' | 'recipes' | 'shopping'>('plan');
  const [selectedDay, setSelectedDay] = useState(1);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const weekPlan: DayPlan[] = [
    {
      day: 'Måndag',
      meals: [
        { type: 'breakfast', name: 'Yoghurt med ketomüsli', description: 'Grekisk yoghurt toppad med hemgjord ketomüsli och blåbär', recipe: true },
        { type: 'lunch', name: 'Tonfisksallad med äpple', description: 'Fräsch sallad med tonfisk, äpple, selleri och valnötter', recipe: true },
        { type: 'snack', name: 'Ketomüsli', description: 'Nyttigt mellanmål rikt på fiber och protein', time: '15:00' },
        { type: 'dinner', name: 'Squashspagetti med köttfärssås', description: 'Lågkolhydratalternativ till pasta med mustig köttfärssås', recipe: true }
      ]
    },
    {
      day: 'Tisdag',
      meals: [
        { type: 'breakfast', name: 'Stekt ägg med lax', description: 'Proteinrik frukost med omega-3 fettsyror', recipe: true },
        { type: 'lunch', name: 'Squashspagetti med köttfärssås', description: 'Rester från gårdagen', time: '12:00' },
        { type: 'snack', name: 'Havrefrallor med morötter och aprikoser', description: 'Fiberrika frallor perfekta som mellanmål', recipe: true },
        { type: 'dinner', name: 'Het ratatouille', description: 'Smakrik grönsaksgratäng med fetaost', recipe: true }
      ]
    },
    {
      day: 'Onsdag',
      meals: [
        { type: 'breakfast', name: 'Grön smoothie', description: 'Näringsrik smoothie med spenat, avokado och bär', recipe: true },
        { type: 'lunch', name: 'Pokebowl med kyckling', description: 'Färgglad bowl med marinerad kyckling och grönsaker', recipe: true },
        { type: 'dinner', name: 'Köttfärsbiffar med stekt blomkål', description: 'Saftiga biffar med krämig blomkålspuré', recipe: true }
      ]
    },
    {
      day: 'Torsdag',
      meals: [
        { type: 'breakfast', name: 'Omelett med tomat', description: 'Fluffig omelett fylld med färska tomater och örter', recipe: true },
        { type: 'lunch', name: 'Het ratatouille', description: 'Uppvärmd från tisdag', time: '12:30' },
        { type: 'dinner', name: 'Kyclinggryta med bakad spetskål', description: 'Krämig gryta med mycket grönsaker', recipe: true }
      ]
    },
    {
      day: 'Fredag',
      meals: [
        { type: 'breakfast', name: 'Havrefrallor med morötter och torkade aprikoser', description: 'Start dagen med fiber och vitaminer', recipe: true },
        { type: 'lunch', name: 'Köttfärsbiffar med stekt blomkål', description: 'Rester från onsdag', time: '12:00' },
        { type: 'dinner', name: 'Kyclinggryta med bakad spetskål', description: 'Fredagsmys med god gryta', recipe: true }
      ]
    },
    {
      day: 'Lördag',
      meals: [
        { type: 'breakfast', name: 'Tropisk smoothiebowl', description: 'Exotisk smoothiebowl med mango och kokos', recipe: true },
        { type: 'lunch', name: 'Kyclinggryta med bakad spetskål', description: 'Lördagslunch med rester', time: '13:00' },
        { type: 'dinner', name: 'Laxburgare med krämig grönsaksröra', description: 'Helgmiddag med omega-3 rika laxburgare', recipe: true }
      ]
    },
    {
      day: 'Söndag',
      meals: [
        { type: 'breakfast', name: 'Tropisk smoothiebowl', description: 'Lyxig helgfrukost', recipe: true },
        { type: 'lunch', name: 'Laxburgare med krämig grönsaksröra', description: 'Söndagslunch', time: '13:00' },
        { type: 'dinner', name: 'Ugnsbakad tomat med köttfärs', description: 'Avsluta veckan med en enkel och god rätt', recipe: true }
      ]
    }
  ];

  const shoppingList: ShoppingItem[] = [
    {
      category: 'Kött & Fisk',
      items: [
        { name: 'Nötfärs', amount: '800g', checked: false },
        { name: 'Kycklingfilé', amount: '600g', checked: false },
        { name: 'Lax (fryst eller färsk)', amount: '400g', checked: false },
        { name: 'Tonfisk i vatten', amount: '2 burkar', checked: false },
        { name: 'Bacon', amount: '1 paket', checked: false }
      ]
    },
    {
      category: 'Mejeri & Ägg',
      items: [
        { name: 'Grekisk yoghurt', amount: '500g', checked: false },
        { name: 'Ägg', amount: '18 st', checked: false },
        { name: 'Fetaost', amount: '200g', checked: false },
        { name: 'Parmesan', amount: '100g', checked: false },
        { name: 'Crème fraiche', amount: '3 dl', checked: false },
        { name: 'Smör', amount: '200g', checked: false }
      ]
    },
    {
      category: 'Grönsaker & Frukt',
      items: [
        { name: 'Squash', amount: '2 st', checked: false },
        { name: 'Blomkål', amount: '1 st', checked: false },
        { name: 'Broccoli', amount: '300g', checked: false },
        { name: 'Spenat (fryst)', amount: '200g', checked: false },
        { name: 'Tomater', amount: '6 st', checked: false },
        { name: 'Körsbärstomater', amount: '250g', checked: false },
        { name: 'Avokado', amount: '3 st', checked: false },
        { name: 'Spetskål', amount: '1 st', checked: false },
        { name: 'Rödlök', amount: '2 st', checked: false },
        { name: 'Vitlök', amount: '1 st', checked: false },
        { name: 'Selleri', amount: '2 stjälkar', checked: false },
        { name: 'Morötter', amount: '4 st', checked: false },
        { name: 'Paprika', amount: '2 st', checked: false },
        { name: 'Zucchini', amount: '1 st', checked: false },
        { name: 'Blåbär', amount: '200g', checked: false },
        { name: 'Äpple', amount: '2 st', checked: false },
        { name: 'Citron', amount: '2 st', checked: false },
        { name: 'Lime', amount: '1 st', checked: false },
        { name: 'Mango (fryst)', amount: '200g', checked: false }
      ]
    },
    {
      category: 'Skafferi',
      items: [
        { name: 'Kokosmjöl', amount: '200g', checked: false },
        { name: 'Mandelmjöl', amount: '300g', checked: false },
        { name: 'Chiafrön', amount: '200g', checked: false },
        { name: 'Linfrön', amount: '200g', checked: false },
        { name: 'Pumpakärnor', amount: '150g', checked: false },
        { name: 'Valnötter', amount: '200g', checked: false },
        { name: 'Mandlar', amount: '200g', checked: false },
        { name: 'Kokosflingor', amount: '100g', checked: false },
        { name: 'Havregryn', amount: '300g', checked: false },
        { name: 'Psylliumhusk', amount: '100g', checked: false },
        { name: 'Torkade aprikoser', amount: '100g', checked: false },
        { name: 'Olivolja', amount: '500ml', checked: false },
        { name: 'Kokosolja', amount: '200ml', checked: false },
        { name: 'Krossade tomater', amount: '2 burkar', checked: false },
        { name: 'Tomatpuré', amount: '1 tub', checked: false },
        { name: 'Buljong (kyckling/grönsak)', amount: '1 paket', checked: false }
      ]
    },
    {
      category: 'Kryddor & Örter',
      items: [
        { name: 'Färsk basilika', amount: '1 kruka', checked: false },
        { name: 'Färsk persilja', amount: '1 bunt', checked: false },
        { name: 'Oregano (torkad)', amount: '1 burk', checked: false },
        { name: 'Timjan (torkad)', amount: '1 burk', checked: false },
        { name: 'Paprikapulver', amount: '1 burk', checked: false },
        { name: 'Spiskummin', amount: '1 burk', checked: false },
        { name: 'Gurkmeja', amount: '1 burk', checked: false },
        { name: 'Ingefära (färsk)', amount: '50g', checked: false },
        { name: 'Salt & peppar', amount: '', checked: false }
      ]
    }
  ];

  const handleItemCheck = (itemName: string) => {
    setCheckedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/courses/functional-basics"
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vecka 1 - Introduktion till Functional Foods</h1>
                <p className="text-gray-600">Lär dig grunderna och kom igång med din hälsoresa</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <FiPrinter className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <FiDownload className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px:6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('plan')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'plan'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiCalendar className="w-5 h-5" />
                <span>Kostschema</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'recipes'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <GiCookingPot className="w-5 h-5" />
                <span>Veckans recept</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'shopping'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FiShoppingCart className="w-5 h-5" />
                <span>Inköpslista</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Meal Plan Tab */}
          {activeTab === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Day Selector */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Välj dag</h3>
                  <div className="space-y-2">
                    {weekPlan.map((day, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedDay(index)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                          selectedDay === index
                            ? 'bg-gradient-to-r from-primary to-accent text-white'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="font-medium">{day.day}</div>
                        <div className="text-sm opacity-80">
                          {day.meals.length} måltider
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Daily Meal Plan */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {weekPlan[selectedDay].day}s måltider
                  </h2>
                  
                  <div className="space-y-6">
                    {weekPlan[selectedDay].meals.map((meal, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className="text-3xl">{getMealIcon(meal.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{meal.name}</h3>
                              {meal.time && (
                                <span className="text-sm text-gray-500 flex items-center gap-1">
                                  <FiClock className="w-4 h-4" />
                                  {meal.time}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{meal.description}</p>
                            {meal.recipe && (
                              <Link
                                href={`/kunskapsbank/recept/${meal.recipeId || meal.name.toLowerCase().replace(/ /g, '-')}`}
                                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium"
                              >
                                <GiCookingPot className="w-4 h-4" />
                                Se recept
                                <FiChevronRight className="w-4 h-4" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <FiInfo className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Tips för veckan</p>
                        <p className="text-sm text-gray-600">
                          Förbered gärna flera portioner när du lagar mat. Många av veckans recept 
                          fungerar utmärkt som matlådor och sparar tid under vardagarna.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <motion.div
              key="recipes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Veckans recept</h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: 'Yoghurt med ketomüsli', time: '15 min', servings: '4 portioner', difficulty: 'Lätt' },
                    { name: 'Tonfisksallad med äpple', time: '20 min', servings: '2 portioner', difficulty: 'Lätt' },
                    { name: 'Squashspagetti med köttfärssås', time: '45 min', servings: '4 portioner', difficulty: 'Medel' },
                    { name: 'Stekt ägg med lax', time: '15 min', servings: '1 portion', difficulty: 'Lätt' },
                    { name: 'Het ratatouille', time: '40 min', servings: '4 portioner', difficulty: 'Medel' },
                    { name: 'Grön smoothie', time: '10 min', servings: '2 portioner', difficulty: 'Lätt' },
                    { name: 'Pokebowl med kyckling', time: '30 min', servings: '2 portioner', difficulty: 'Medel' },
                    { name: 'Köttfärsbiffar med stekt blomkål', time: '35 min', servings: '4 portioner', difficulty: 'Medel' },
                    { name: 'Kyclinggryta med bakad spetskål', time: '50 min', servings: '4 portioner', difficulty: 'Medel' },
                    { name: 'Laxburgare med krämig grönsaksröra', time: '30 min', servings: '4 portioner', difficulty: 'Medel' },
                    { name: 'Tropisk smoothiebowl', time: '15 min', servings: '1 portion', difficulty: 'Lätt' },
                    { name: 'Ugnsbakad tomat med köttfärs', time: '40 min', servings: '4 portioner', difficulty: 'Lätt' }
                  ].map((recipe, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all"
                    >
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center">
                        <GiMeal className="w-12 h-12 text-primary/60" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{recipe.name}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiClock className="w-4 h-4" />
                          <span>{recipe.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiUsers className="w-4 h-4" />
                          <span>{recipe.servings}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            recipe.difficulty === 'Lätt' 
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {recipe.difficulty}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
            >
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Inköpslista vecka 1</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {checkedItems.length} av {shoppingList.reduce((acc, cat) => acc + cat.items.length, 0)} markerade
                    </span>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                      <FiPrinter className="w-4 h-4" />
                      Skriv ut
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {shoppingList.map((category, categoryIndex) => (
                    <div key={categoryIndex}>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <GiShoppingBag className="w-5 h-5 text-primary" />
                        {category.category}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {category.items.map((item, itemIndex) => (
                          <label
                            key={itemIndex}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              checkedItems.includes(item.name)
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-200 hover:border-primary/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checkedItems.includes(item.name)}
                              onChange={() => handleItemCheck(item.name)}
                              className="w-5 h-5 text-primary rounded focus:ring-primary"
                            />
                            <span className={`flex-1 ${
                              checkedItems.includes(item.name) ? 'line-through text-gray-500' : 'text-gray-700'
                            }`}>
                              {item.name}
                            </span>
                            <span className="text-sm text-gray-500">{item.amount}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <FiInfo className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Inköpstips</p>
                      <p className="text-sm text-gray-600">
                        Många av ingredienserna används i flera recept under veckan. 
                        Köp gärna lite extra av basvaror som används ofta för att ha hemma till kommande veckor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 
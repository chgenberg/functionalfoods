'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronLeft, FiChevronRight, FiClock, FiUsers, FiShoppingCart,
  FiCheckCircle, FiPrinter, FiDownload, FiCalendar, FiInfo, FiBookOpen
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

export default function Week2Page() {
  const [activeTab, setActiveTab] = useState<'plan' | 'recipes' | 'shopping'>('plan');
  const [selectedDay, setSelectedDay] = useState(0);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const weekPlan: DayPlan[] = [
    {
      day: 'Måndag',
      meals: [
        { type: 'breakfast', name: 'Yoghurt med ketomüsli', description: 'Start dagen med probiotika och fiber', recipe: true },
        { type: 'lunch', name: 'Ugnsbakad tomat med köttfärs', description: 'Mättande lunch fylld med grönsaker', recipe: true },
        { type: 'dinner', name: 'Nudelsoppa med grönsaker', description: 'Värmande soppa full av näringsämnen', recipe: true }
      ]
    },
    {
      day: 'Tisdag',
      meals: [
        { type: 'breakfast', name: 'Omelett med champinjoner', description: 'Proteinrik start med svamp', recipe: true },
        { type: 'lunch', name: 'Nudelsoppa med grönsaker', description: 'Rester från gårdagen', time: '12:00' },
        { type: 'dinner', name: 'Torskrygg med ägghack och sparris', description: 'Omega-3 rik middag', recipe: true }
      ]
    },
    {
      day: 'Onsdag',
      meals: [
        { type: 'breakfast', name: 'Morotsjuice', description: 'Färskpressad juice full av betakaroten', recipe: true },
        { type: 'lunch', name: 'Torskrygg med ägghack och sparris', description: 'Gårdagens middag som lunch', time: '12:30' },
        { type: 'dinner', name: 'Turkiska lammfärsspett med raita och sallad', description: 'Kryddig och proteinrik rätt', recipe: true }
      ]
    },
    {
      day: 'Torsdag',
      meals: [
        { type: 'breakfast', name: 'Morotsjuice', description: 'Vitaminer och mineraler i ett glas', recipe: true },
        { type: 'lunch', name: 'Turkiska lammfärsspett med raita och sallad', description: 'Rester från gårdagens middag', time: '12:00' },
        { type: 'dinner', name: 'Kycklingröra med örter och tomat', description: 'Enkel och näringsrik vardagsmiddag', recipe: true }
      ]
    },
    {
      day: 'Fredag',
      meals: [
        { type: 'breakfast', name: 'Havrefralla med morötter och torkade aprikoser', description: 'Fiberrik start på dagen', recipe: true },
        { type: 'lunch', name: 'Kycklingröra med örter och tomat', description: 'Torsdagens middag blir fredagslunch', time: '12:30' },
        { type: 'dinner', name: 'Lax med fetaost och rostade rotfrukter', description: 'Omega-3 och antioxidanter', recipe: true }
      ]
    },
    {
      day: 'Lördag',
      meals: [
        { type: 'breakfast', name: 'Bärsmoothiebowl', description: 'Antioxidantrik helgfrukost', recipe: true },
        { type: 'lunch', name: 'Lax med fetaost och rostade rotfrukter', description: 'Gårdagens middag', time: '13:00' },
        { type: 'dinner', name: 'Asiatiska köttbullar med nudelsallad', description: 'Smakrik helgmiddag', recipe: true },
        { type: 'snack', name: 'Jordgubbar och mango med vit chokladkräm', description: 'Helgens efterrätt', recipe: true }
      ]
    },
    {
      day: 'Söndag',
      meals: [
        { type: 'breakfast', name: 'Bärsmoothiebowl', description: 'Söndagens lyxfrukost', recipe: true },
        { type: 'lunch', name: 'Asiatiska köttbullar med nudelsallad', description: 'Lördagens middag som söndagslunch', time: '13:00' },
        { type: 'dinner', name: 'Päronsallad med chevréost', description: 'Lätt och elegant avslutning på veckan', recipe: true }
      ]
    }
  ];

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const handleItemCheck = (itemName: string) => {
    setCheckedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
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
                <h1 className="text-2xl font-bold text-gray-900">Vecka 2 - Bygga hälsosamma vanor</h1>
                <p className="text-gray-600">Fördjupa din kunskap och etablera rutiner</p>
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

      {/* Week Introduction */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Veckans fokus</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nu har du kommit in i din nya livsstil och kroppen börjar ge dig positiv återkoppling. 
                Genom att ge den näring i form av antioxidanter, fibrer, probiotika, mineraler och vitaminer 
                håller du blodsockret på en jämn nivå, vilket gör det lättare att stå emot socker och snabba 
                kolhydrater. Den nya rutinen ger dig mer energi, och du märker säkert redan skillnad.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                För att fortsätta på bästa sätt, planera veckan noggrant. Den här veckan ska du också läsa 
                dokumentet "Functional foods - 3 steg till ett friskare liv" för att ta nästa steg i din utveckling.
              </p>
              <Link
                href="/dashboard/courses/functional-basics/material/functional-foods-3-steg"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium"
              >
                <FiBookOpen className="w-5 h-5" />
                Läs "Functional foods - 3 steg till ett friskare liv"
                <FiChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
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
                        <p className="font-medium text-gray-900 mb-1">Tips för vecka 2</p>
                        <p className="text-sm text-gray-600">
                          Denna vecka fokuserar vi på att etablera rutiner. Försök att äta måltiderna vid 
                          ungefär samma tid varje dag för att hålla blodsockret stabilt. Kom ihåg att dricka 
                          vatten mellan måltiderna!
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
                    { name: 'Yoghurt med ketomüsli', time: '10 min', servings: '1 portion', difficulty: 'Lätt' },
                    { name: 'Ugnsbakad tomat med köttfärs', time: '40 min', servings: '4 portioner', difficulty: 'Medel' },
                    { name: 'Nudelsoppa med grönsaker', time: '30 min', servings: '4 portioner', difficulty: 'Lätt' },
                    { name: 'Omelett med champinjoner', time: '15 min', servings: '1 portion', difficulty: 'Lätt' },
                    { name: 'Torskrygg med ägghack och sparris', time: '35 min', servings: '4 portioner', difficulty: 'Medel' },
                    { name: 'Morotsjuice', time: '10 min', servings: '2 portioner', difficulty: 'Lätt' },
                    { name: 'Turkiska lammfärsspett med raita och sallad', time: '45 min', servings: '4 portioner', difficulty: 'Medel' },
                    { name: 'Kycklingröra med örter och tomat', time: '30 min', servings: '4 portioner', difficulty: 'Lätt' },
                    { name: 'Havrefralla med morötter och torkade aprikoser', time: '20 min', servings: '8 st', difficulty: 'Medel' },
                    { name: 'Lax med fetaost och rostade rotfrukter', time: '40 min', servings: '4 portioner', difficulty: 'Medel' },
                    { name: 'Bärsmoothiebowl', time: '15 min', servings: '1 portion', difficulty: 'Lätt' },
                    { name: 'Asiatiska köttbullar med nudelsallad', time: '45 min', servings: '4 portioner', difficulty: 'Medel' },
                    { name: 'Jordgubbar och mango med vit chokladkräm', time: '20 min', servings: '4 portioner', difficulty: 'Lätt' },
                    { name: 'Päronsallad med chevréost', time: '15 min', servings: '2 portioner', difficulty: 'Lätt' }
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
                  <h2 className="text-2xl font-bold text-gray-900">Inköpslista vecka 2</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {checkedItems.length} markerade
                    </span>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                      <FiPrinter className="w-4 h-4" />
                      Skriv ut
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  {[
                    {
                      category: 'Kött & Fisk',
                      items: [
                        { name: 'Nötfärs', amount: '600g', checked: false },
                        { name: 'Lammfärs', amount: '500g', checked: false },
                        { name: 'Kycklingfilé', amount: '400g', checked: false },
                        { name: 'Torskfilé', amount: '600g', checked: false },
                        { name: 'Laxfilé', amount: '400g', checked: false }
                      ]
                    },
                    {
                      category: 'Mejeri & Ägg',
                      items: [
                        { name: 'Grekisk yoghurt', amount: '500g', checked: false },
                        { name: 'Ägg', amount: '12 st', checked: false },
                        { name: 'Fetaost', amount: '200g', checked: false },
                        { name: 'Chevréost', amount: '150g', checked: false },
                        { name: 'Crème fraiche', amount: '2 dl', checked: false },
                        { name: 'Vit choklad', amount: '100g', checked: false }
                      ]
                    },
                    {
                      category: 'Grönsaker & Frukt',
                      items: [
                        { name: 'Tomater', amount: '8 st', checked: false },
                        { name: 'Champinjoner', amount: '200g', checked: false },
                        { name: 'Sparris', amount: '250g', checked: false },
                        { name: 'Morötter', amount: '1 kg', checked: false },
                        { name: 'Potatis', amount: '1 kg', checked: false },
                        { name: 'Rotselleri', amount: '1 st', checked: false },
                        { name: 'Rödbetor', amount: '500g', checked: false },
                        { name: 'Gul lök', amount: '4 st', checked: false },
                        { name: 'Vitlök', amount: '2 st', checked: false },
                        { name: 'Ingefära', amount: '50g', checked: false },
                        { name: 'Gurka', amount: '1 st', checked: false },
                        { name: 'Sallad', amount: '2 huvuden', checked: false },
                        { name: 'Päron', amount: '3 st', checked: false },
                        { name: 'Jordgubbar', amount: '250g', checked: false },
                        { name: 'Mango', amount: '1 st', checked: false },
                        { name: 'Frysta bär', amount: '400g', checked: false },
                        { name: 'Citron', amount: '2 st', checked: false },
                        { name: 'Lime', amount: '1 st', checked: false }
                      ]
                    },
                    {
                      category: 'Skafferi',
                      items: [
                        { name: 'Risnudlar', amount: '200g', checked: false },
                        { name: 'Havregryn', amount: '300g', checked: false },
                        { name: 'Vetemjöl', amount: '200g', checked: false },
                        { name: 'Torkade aprikoser', amount: '100g', checked: false },
                        { name: 'Valnötter', amount: '100g', checked: false },
                        { name: 'Sesamfrön', amount: '50g', checked: false },
                        { name: 'Kokosmjölk', amount: '400ml', checked: false },
                        { name: 'Soja', amount: '100ml', checked: false },
                        { name: 'Fisksås', amount: '50ml', checked: false },
                        { name: 'Olivolja', amount: '200ml', checked: false },
                        { name: 'Sesamolja', amount: '50ml', checked: false },
                        { name: 'Honung', amount: '100ml', checked: false },
                        { name: 'Buljong', amount: '2 tärningar', checked: false }
                      ]
                    },
                    {
                      category: 'Kryddor & Örter',
                      items: [
                        { name: 'Färsk koriander', amount: '1 bunt', checked: false },
                        { name: 'Färsk mynta', amount: '1 bunt', checked: false },
                        { name: 'Färsk persilja', amount: '1 bunt', checked: false },
                        { name: 'Spiskummin', amount: '1 burk', checked: false },
                        { name: 'Kanel', amount: '1 burk', checked: false },
                        { name: 'Kardemumma', amount: '1 burk', checked: false },
                        { name: 'Chiliflakes', amount: '1 burk', checked: false }
                      ]
                    }
                  ].map((category, categoryIndex) => (
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
                      <p className="font-medium text-gray-900 mb-1">Inköpstips vecka 2</p>
                      <p className="text-sm text-gray-600">
                        Den här veckan introducerar vi fler kryddor och örter. Färska örter ger mycket 
                        smak och näring. Om du inte hittar färska kan du använda frysta eller torkade 
                        (använd då hälften så mycket).
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
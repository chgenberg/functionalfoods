'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaUtensils, FaBook, FaShoppingCart, FaLock, FaClock, FaSnowflake, FaLeaf } from 'react-icons/fa'
import Link from 'next/link'

interface MealOption {
  name: string
  isLocked?: boolean
  recipeLink?: string
}

interface DayMeals {
  breakfast: MealOption
  lunch: MealOption
  snack: MealOption
  dinner: MealOption
  eveningSnack?: MealOption
}

const mealPlan: Record<string, DayMeals> = {
  Måndag: {
    breakfast: { name: 'Smoothie med spenat och banan (draft)' },
    lunch: { name: 'Kycklingsallad med quinoa (draft)', isLocked: true, recipeLink: '/kunskapsbank/recept/kycklingsallad-quinoa' },
    snack: { name: 'Välj' },
    dinner: { name: 'Laxfilé med rostad broccoli (draft)', isLocked: true, recipeLink: '/kunskapsbank/recept/lax-broccoli' }
  },
  Tisdag: {
    breakfast: { name: 'Havregrynsgröt med bär (draft)' },
    lunch: { name: 'Linssoppa med grönsaker (draft)', isLocked: true, recipeLink: '/kunskapsbank/recept/linssoppa' },
    snack: { name: 'Välj' },
    dinner: { name: 'Köttfärssås med zucchinipasta (draft)', isLocked: true, recipeLink: '/kunskapsbank/recept/kottfarssas-zucchini' }
  },
  Onsdag: {
    breakfast: { name: 'Äggröra med tomat (draft)' },
    lunch: { name: 'Tonfisksallad med bönor (draft)', isLocked: true, recipeLink: '/kunskapsbank/recept/tonfisksallad' },
    snack: { name: 'Välj' },
    dinner: { name: 'Vegetarisk curry med blomkål (draft)', isLocked: true, recipeLink: '/kunskapsbank/recept/curry-blomkal' }
  },
  Torsdag: {
    breakfast: { name: 'Chiapudding med mango (draft)' },
    lunch: { name: 'Köttfärssås med zucchinipasta (matlåda) (draft)' },
    snack: { name: 'Välj' },
    dinner: { name: 'Fiskgryta med tomat och fänkål (draft)', isLocked: true, recipeLink: '/kunskapsbank/recept/fiskgryta' }
  },
  Fredag: {
    breakfast: { name: 'Proteinpannkakor med bär (draft)' },
    lunch: { name: 'Vegetarisk curry med blomkål (matlåda) (draft)' },
    snack: { name: 'Välj' },
    dinner: { name: 'Biff med sötpotatispommes (draft)', isLocked: true, recipeLink: '/kunskapsbank/recept/biff-sotpotatis' }
  },
  Lördag: {
    breakfast: { name: 'Omelett med svamp och ost (draft)' },
    lunch: { name: 'Fiskgryta med tomat och fänkål (matlåda) (draft)' },
    snack: { name: 'Välj' },
    dinner: { name: 'Kyckling med rostade rotfrukter (draft)', isLocked: true, recipeLink: '/kunskapsbank/recept/kyckling-rotfrukter' }
  },
  Söndag: {
    breakfast: { name: 'Yoghurt med granola och frukt (draft)' },
    lunch: { name: 'Biff med sötpotatispommes (matlåda) (draft)' },
    snack: { name: 'Välj' },
    dinner: { name: 'Lax i ugn med grönsaker (draft)', isLocked: true, recipeLink: '/kunskapsbank/recept/lax-ugn' }
  }
}

const shoppingList = {
  'Frukt & Grönt': [
    'Spenat (200g)',
    'Bananer (7 st)',
    'Broccoli (2 st)',
    'Tomater (500g)',
    'Zucchini (3 st)',
    'Blomkål (1 st)',
    'Mango (2 st)',
    'Fänkål (2 st)',
    'Sötpotatis (1 kg)',
    'Svamp (200g)',
    'Rotfrukter (morötter, palsternacka)',
    'Citron (3 st)',
    'Färska bär (blåbär, hallon)',
    'Lök (3 st)',
    'Vitlök (1 st)'
  ],
  'Protein': [
    'Laxfilé (600g)',
    'Kycklingfilé (600g)',
    'Nötfärs (500g)',
    'Tonfisk i vatten (2 burkar)',
    'Vit fisk (torsk/kolja, 500g)',
    'Biff (4 st)',
    'Ägg (18 st)'
  ],
  'Skafferi': [
    'Quinoa (300g)',
    'Röda linser (200g)',
    'Havregryn (500g)',
    'Chiafrön (100g)',
    'Proteinpulver (vanilj)',
    'Kokosmjölk (2 burkar)',
    'Krossade tomater (2 burkar)',
    'Bönor (2 burkar)',
    'Granola',
    'Olivolja',
    'Kokosolja',
    'Curry',
    'Spiskummin',
    'Paprikapulver'
  ],
  'Mejeri': [
    'Grekisk yoghurt (1 liter)',
    'Mjölk/växtmjölk (1 liter)',
    'Ost (200g)',
    'Smör'
  ],
  'Övrigt': [
    'Mandlar (200g)',
    'Valnötter (150g)',
    'Nötter efter eget val',
    'Mörk choklad 70%+'
  ]
}

const recipes = [
  {
    id: 1,
    title: 'Kycklingsallad med quinoa',
    time: '25 min',
    difficulty: 'Enkel',
    image: '/images/recept/kyckling-quinoa.jpg',
    isLocked: true,
    link: '/kunskapsbank/recept/kycklingsallad-quinoa'
  },
  {
    id: 2,
    title: 'Laxfilé med rostad broccoli',
    time: '30 min',
    difficulty: 'Enkel',
    image: '/images/recept/lax-broccoli.jpg',
    isLocked: true,
    link: '/kunskapsbank/recept/lax-broccoli'
  },
  {
    id: 3,
    title: 'Linssoppa med grönsaker',
    time: '35 min',
    difficulty: 'Enkel',
    image: '/images/recept/linssoppa.jpg',
    isLocked: true,
    link: '/kunskapsbank/recept/linssoppa'
  },
  {
    id: 4,
    title: 'Köttfärssås med zucchinipasta',
    time: '25 min',
    difficulty: 'Medel',
    image: '/images/recept/zucchini-pasta.jpg',
    isLocked: true,
    link: '/kunskapsbank/recept/kottfarssas-zucchini'
  },
  {
    id: 5,
    title: 'Vegetarisk curry med blomkål',
    time: '30 min',
    difficulty: 'Enkel',
    image: '/images/recept/curry-blomkal.jpg',
    isLocked: true,
    link: '/kunskapsbank/recept/curry-blomkal'
  },
  {
    id: 6,
    title: 'Fiskgryta med tomat och fänkål',
    time: '35 min',
    difficulty: 'Medel',
    image: '/images/recept/fiskgryta.jpg',
    isLocked: true,
    link: '/kunskapsbank/recept/fiskgryta'
  },
  {
    id: 7,
    title: 'Biff med sötpotatispommes',
    time: '30 min',
    difficulty: 'Enkel',
    image: '/images/recept/biff-sotpotatis.jpg',
    isLocked: true,
    link: '/kunskapsbank/recept/biff-sotpotatis'
  },
  {
    id: 8,
    title: 'Kyckling med rostade rotfrukter',
    time: '40 min',
    difficulty: 'Enkel',
    image: '/images/recept/kyckling-rotfrukter.jpg',
    isLocked: true,
    link: '/kunskapsbank/recept/kyckling-rotfrukter'
  }
]

export default function Week3Page() {
  const [activeTab, setActiveTab] = useState<'meal-plan' | 'recipes' | 'shopping'>('meal-plan')
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({})

  const toggleCheck = (day: string, meal: string) => {
    const key = `${day}-${meal}`
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleIngredient = (ingredient: string) => {
    setCheckedIngredients(prev => ({ ...prev, [ingredient]: !prev[ingredient] }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard/courses/functional-basics" className="text-purple-600 hover:text-purple-700 mb-4 inline-block">
            ← Tillbaka till kursen
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Vecka 3 - Flexibilitet & Fasta</h1>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
              <FaClock className="mr-2 text-purple-600" />
              Veckans fokus
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ny vecka med nya härliga recept i ditt kostschema! Du kanske har hittat en favoritfrukost och vill hålla dig till den – kostschemat är en guide och ger dig stor flexibilitet. 
            </p>
            <div className="bg-purple-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-purple-800 mb-2">16:8 Fasta (Valfritt)</h3>
              <p className="text-purple-700">
                Om du vill kan du också prova 16:8 fasta, där du hoppar över frukosten och börjar äta vid lunch. Det ger fördelar för matsmältningen, men lyssna på din kropp och variera vid behov.
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
                <FaSnowflake className="mr-2" />
                Matlådor i frysen
              </h3>
              <p className="text-blue-700">
                Nu har du även matlådor i frysen som sparar både tid och pengar. Perfekt för stressiga dagar!
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                <FaBook className="mr-2" />
                Veckans läsning
              </h3>
              <ul className="text-green-700 space-y-1">
                <li>• Periodisk fasta - Fördjupa dig i fastans fördelar</li>
                <li>• Reflektion vecka 3 - Utvärdera din resa hittills</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('meal-plan')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'meal-plan'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaUtensils className="inline-block mr-2" />
              Kostschema
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'recipes'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaBook className="inline-block mr-2" />
              Recept
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'shopping'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaShoppingCart className="inline-block mr-2" />
              Inköpslista
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'meal-plan' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {Object.entries(mealPlan).map(([day, meals]) => (
                  <div key={day} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">{day}</h3>
                    <div className="space-y-3">
                      {Object.entries(meals).map(([mealType, meal]) => meal && (
                        <div key={mealType} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={checkedItems[`${day}-${mealType}`] || false}
                              onChange={() => toggleCheck(day, mealType)}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                              disabled={meal.name === 'Välj'}
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-600 capitalize">
                                {mealType === 'breakfast' ? 'Frukost' :
                                 mealType === 'lunch' ? 'Lunch' :
                                 mealType === 'snack' ? 'Mellanmål' :
                                 mealType === 'dinner' ? 'Middag' :
                                 'Kvällssnack'}:
                              </span>
                              <span className={`ml-2 ${meal.name === 'Välj' ? 'text-gray-400' : 'text-gray-700'}`}>
                                {meal.name}
                              </span>
                            </div>
                          </div>
                          {meal.isLocked && (
                            <Link 
                              href={meal.recipeLink || '#'}
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <FaLock className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                    {day === 'Måndag' && (
                      <div className="mt-3 text-sm text-gray-500 italic">
                        Räkna ej med i kaloriuträkningen: {checkedItems[`${day}-snack`] ? '✓' : '☐'}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'recipes' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {recipes.map((recipe) => (
                  <Link
                    key={recipe.id}
                    href={recipe.link}
                    className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="aspect-video bg-gray-200 relative">
                      {recipe.isLocked && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <FaLock className="text-white text-3xl" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <FaClock className="mr-1" />
                          {recipe.time}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          recipe.difficulty === 'Enkel' ? 'bg-green-100 text-green-700' :
                          recipe.difficulty === 'Medel' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </motion.div>
            )}

            {activeTab === 'shopping' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <p className="text-amber-800 text-sm">
                    <strong>Tips:</strong> Kryssa av ingredienser du redan har hemma. Listan är beräknad för hela veckan.
                  </p>
                </div>
                {Object.entries(shoppingList).map(([category, items]) => (
                  <div key={category} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <FaLeaf className="mr-2 text-green-600" />
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {items.map((item) => (
                        <label key={item} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={checkedIngredients[item] || false}
                            onChange={() => toggleIngredient(item)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className={`text-gray-700 ${checkedIngredients[item] ? 'line-through text-gray-400' : ''}`}>
                            {item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
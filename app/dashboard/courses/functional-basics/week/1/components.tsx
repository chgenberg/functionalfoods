'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Calendar, ShoppingCart, Book, ChevronRight, Clock, CheckCircle, Download, ExternalLink } from 'lucide-react';
import { 
  GiFruitBowl, GiMeal, GiCookingPot, GiMeat, 
  GiWheat, GiWaterBottle, GiHerbsBundle
} from 'react-icons/gi';

// Helper function to format meal names with bold "rester" and "rester från frysen"
const formatMealName = (mealName: string) => {
  if (mealName.toLowerCase().includes('rester')) {
    const parts = mealName.split(/(rester\s+från\s+frysen|rester)/gi);
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase().match(/^rester(\s+från\s+frysen)?$/i) ? (
            <span key={index} className="font-bold text-[#014421]">rester</span>
          ) : (
            part
          )
        )}
      </span>
    );
  }
  return mealName;
};

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

// Goals Section Component
export function GoalsSection({ completedGoals, setCompletedGoals }: {
  completedGoals: string[];
  setCompletedGoals: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [goals, setGoals] = useState({
    mainGoal: '',
    currentState: '',
    desiredState: '',
    actions: '',
    progress: ''
  });

  const goalOptions = [
    'Bli mer hälsosam',
    'Lära mig mer om mervärdesmat',
    'Förebygga eller minska fysiska besvär',
    'Öka energinivåerna',
    'Förbättra matsmältningen',
    'Stärka immunförsvaret',
    'Annat'
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Målsättning för vecka 1</h2>
        <p className="text-gray-700 leading-relaxed">
          I den här övningen kommer vi att gå in på vad ett mål är och hur man kan göra sin egna målplanering. 
          Denna övning går även att applicera på övriga faktorer i livet. Först när du vet vad du vill kan du 
          aktivt börja verka för att det ska bli verklighet.
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">För att uppnå ett mål är det viktigt att ha:</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Tydligt formulerade mål',
            'Ambition',
            'Självdisciplin',
            'Handlingsplan',
            'Rutiner',
            'Uppföljning',
            'Ta och få hjälp av andra'
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <CheckCircle className="text-primary flex-shrink-0" />
              <span className="text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mitt huvudmål
          </label>
          <select
            value={goals.mainGoal}
            onChange={(e) => setGoals({ ...goals, mainGoal: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Välj ditt huvudmål</option>
            {goalOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nuläge - Var befinner jag mig idag?
          </label>
          <textarea
            value={goals.currentState}
            onChange={(e) => setGoals({ ...goals, currentState: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Beskriv din nuvarande situation..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Önskat läge - Var vill jag vara?
          </label>
          <textarea
            value={goals.desiredState}
            onChange={(e) => setGoals({ ...goals, desiredState: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Beskriv ditt önskade läge..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vad jag ska göra - Mina handlingar
          </label>
          <textarea
            value={goals.actions}
            onChange={(e) => setGoals({ ...goals, actions: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Lista konkreta handlingar du ska göra..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hur jag ska kontrollera framsteg
          </label>
          <textarea
            value={goals.progress}
            onChange={(e) => setGoals({ ...goals, progress: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Hur kommer du mäta dina framsteg?"
          />
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
            Radera mål
          </button>
          <button className="px-6 py-3 bg-primary text-white rounded-xl hover:shadow-lg transition-all">
            Spara ändringar
          </button>
        </div>
      </div>
    </div>
  );
}

// Recipe Images with improved design
export function RecipeHighlights() {
  const recipes = [
    { name: 'Omelett med champinjoner', time: 'Måndag - Frukost', image: '/images/omelett-champinjoner.jpg' },
    { name: 'Torskrygg med ägghack', time: 'Tisdag - Middag', image: '/images/torskrygg.jpg' },
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
              y: -5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer bg-background hover:shadow-2xl transition-all duration-300"
          >
            {/* Background with gradient overlay */}
            <div className="aspect-w-4 aspect-h-3 bg-background-secondary relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/10" />
              
              {/* Decorative elements */}
              <div className="absolute inset-0">
                <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full blur-sm"></div>
                <div className="absolute bottom-4 left-4 w-5 h-5 md:w-6 md:h-6 bg-white/30 rounded-full blur-sm"></div>
                <div className="absolute top-1/2 left-1/3 w-4 h-4 bg-white/25 rounded-full blur-sm"></div>
              </div>
              
              {/* Icon */}
              <div className="flex items-center justify-center relative z-10">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                  <GiMeal className="w-8 h-8 text-primary" />
                </div>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Content */}
            <div className="p-4 bg-white relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              
              <h4 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-primary transition-colors duration-300">
                {recipe.name}
              </h4>
              <p className="text-sm text-gray-600 mb-3 group-hover:text-gray-700 transition-colors duration-300">
                {recipe.time}
              </p>
              
              {/* Action indicator */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>15 min</span>
                </div>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <ChevronRight className="w-4 h-4" />
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
export { MealPlanSectionWithPrint as MealPlanSection } from '../../components/MealPlanSectionWithPrint';
    breakfast: { icon: GiCookingPot, color: 'text-orange-600', bg: 'bg-orange-100' },
    lunch: { icon: GiMeal, color: 'text-blue-600', bg: 'bg-blue-100' },
    dinner: { icon: GiFruitBowl, color: 'text-purple-600', bg: 'bg-purple-100' },
    snack: { icon: GiWaterBottle, color: 'text-primary', bg: 'bg-background-secondary' }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Veckans måltidsplan</h2>
        
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
                  <div className="bg-primary text-white rounded-lg px-4 py-2">
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
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
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
                              {formatMealName(meal.name)}
                              <ExternalLink className="ml-1 w-3 h-3" />
                            </Link>
                          ) : (
                            <p className="text-sm text-gray-700">{formatMealName(meal.name)}</p>
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

      {/* Recipe Images Grid */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Veckans höjdpunkter</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Yoghurt med ketomüsli', time: 'Måndag - Frukost', image: '/images/yoghurt-ketomysli.jpg' },
            { name: 'Tonfisksallad med äpple', time: 'Måndag - Lunch', image: '/images/tonfisksallad.jpg' },
            { name: 'Squashspagetti med köttfärssås', time: 'Måndag - Middag', image: '/images/squashspagetti.jpg' },
            { name: 'Stekt ägg med lax', time: 'Tisdag - Frukost', image: '/images/stekt-agg-lax.jpg' },
            { name: 'Het ratatouille', time: 'Tisdag - Middag', image: '/images/het-ratatouille.jpg' },
            { name: 'Grön smoothie', time: 'Onsdag - Frukost', image: '/images/gron-smoothie.jpg' }
          ].map((recipe, index) => (
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
                  <div className="absolute bottom-4 left-4 w-5 h-5 md:w-6 md:h-6 bg-white/30 rounded-full blur-sm"></div>
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
                    <Clock className="w-3 h-3" />
                    <span>20 min</span>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
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
      '1.25 rödlök',
      '0.5 äpple',
      '2 citronklyftor',
      '7.5 klyftor vitlök',
      '2 selleristjälkar',
      '1,25 blomkålshuvud',
      '40 gram bladspenat',
      '1 apelsin',
      '2.5 lime',
      '150 gram sockerärtor',
      '2 rädisor',
      '4 cocktailtomater',
      '1 spetskålshuvud',
      '1 dl oliver',
      '1 passionsfrukt',
      '7 bifftomater',
      '2.5 paprika',
      '1 hjärtsallad',
      '1.75 gul lök',
      '3.5 morötter',
      '1.25 squash',
      '7 dl rucola',
      '0.5 gurka',
      'ca 2.5 cm ingefära',
      '4 dl isbergssallad',
      '0.75 färsk mango',
      '0.75 dl granatäppelkärnor',
      '25 gram ärtskott',
      '1 banan',
      '2.5 salladslök',
      '275 gram frysta sojabönor',
      '350 gram fryst mango',
      '100 gram fryst ananas'
    ],
    'Kryddor & Smaksättare': [
      'salt',
      'svartpeppar',
      '1 msk kanel',
      '7 msk färsk persilja',
      '2 tsk srirachasås',
      '1 kvist färsk basilika',
      '0.5 krm chiliflakes',
      '1 msk ketjap manis',
      '1 tsk soja',
      '1.5 msk röd pesto',
      '4 msk färsk timjan',
      '0.5 msk curry',
      '1,25 tsk torkade örter',
      '1 tsk kardemumma',
      '2 msk färsk koriander',
      '1 tsk örtagårdskrydda',
      '1 hönsbuljongtärning',
      '1 msk furikakekrydda'
    ],
    'Mejeri': [
      '4,25 dl grekisk yoghurt',
      '4 msk grädde',
      '3 tsk smör',
      '0.5 dl gräddfil',
      '25 gram fetaost',
      '3 dl keso'
    ],
    'Kött, Fisk & Ägg': [
      '125 gram tonfisk i vatten',
      '10 ägg',
      '50 gram kallrökt lax',
      '800 gram kycklinglårfilé',
      '250 gram laxfilé',
      '800 gram nötfärs',
      '250 gram kycklingfilé',
      '250 gram kabanoss',
      '100 gram kräftstjärtar i lag'
    ],
    'Torrvaror': [
      '400 gram krossade tomater',
      '1 dl valnötter',
      '1 dl mandel',
      '4 dl mandelmjöl',
      '1 msk rapsolja',
      '2 dl kokosflingor',
      '5 msk olivolja',
      '1 dl rostad lök',
      '2 msk pistagenötter',
      '1 dl paranötter',
      '1 dl hasselnötter',
      '1 dl pekannötter',
      '1 msk fiberhonung Nicks',
      '2.5 dl kokosskivor',
      '1.5 dl sesamfrön',
      '4 dl havregryn',
      '4 torkade aprikoser',
      '1 dl pumpafrön',
      '1 dl solroskärnor',
      '1.5 dl hampafrön',
      '1.5 tsk bakpulver'
    ],
    'Övrigt': [
      '1.5 tsk flytande honung',
      '25 gram picklad rödlök',
      '1 dl mandelmjölk',
      '2 msk majonäs',
      '1.5 msk gröna oliver',
      '0.5 dl ajvar relish',
      'valfritt pålägg till en fralla'
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
          <h2 className="text-3xl font-bold text-gray-900">Inköpslista vecka 1</h2>
          <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors">
            <Download />
            <span>Ladda ner PDF</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(shoppingList).map(([category, items]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || GiMeal;
            return (
              <div key={category} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-primary rounded-full p-3 mr-3">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
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
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
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

        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <p className="text-blue-800">
            <strong>Tips!</strong> Planera dina inköp och förbered gärna några maträtter i förväg. 
            Förvara i kylen eller frysen för en smidigare vecka.
          </p>
        </div>
      </div>
    </div>
  );
}

// Knowledge Section Component
export function KnowledgeSection() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const knowledgeSections = [
    {
      id: 'vad-ar-functional-foods',
      title: 'Vad är Functional Foods?',
      icon: GiFruitBowl,
      color: 'from-purple-500 to-pink-600',
      content: `Functional Foods även känt som mervärdesmat eller hälsofrämjande livsmedel är naturliga livsmedel som innehåller biologiskt aktiva ämnen, som ger en kliniskt bevisad och dokumenterad hälsofördel när det gäller förebyggande eller behandling av kroniska sjukdomar eller dess symtom.`,
      link: '/dashboard/courses/functional-basics/material/vad-ar-functional-foods'
    },
    {
      id: 'fordelarna',
      title: 'Fördelarna med Functional Foods',
      icon: GiMeal,
      color: 'from-green-500 to-teal-600',
      content: `Functional Foods ger positiva hälsoeffekter som ökar din energi, boostar ditt immunförsvar, ger en lugnare mage och gör att du tappar i vikt. Mervärdesmat minskar dessutom risken för utveckling av störningar i ämnesomsättningen.`,
      link: '/dashboard/courses/functional-basics/material/fordelarna-med-functional-foods'
    },
    {
      id: 'dags-att-komma-igang',
      title: 'Dags att komma igång',
      icon: GiCookingPot,
      color: 'from-orange-500 to-red-600',
      content: `Mycket handlar om vanor och när du startar kan det kännas som att det är mycket att tänka på, planera och förbereda – men jag har förenklat för dig med lättlagade recept och praktiska inköpslistor vecka för vecka.`,
      link: '/dashboard/courses/functional-basics/material/dags-att-komma-igang'
    },
    {
      id: 'functional-foods-topplista',
      title: 'Functional Foods Topplista',
      icon: GiFruitBowl,
      color: 'from-blue-500 to-indigo-600',
      content: `De tio livsmedelskategorierna som har hälsofrämjande egenskaper utöver näringsinnehållet. Livsmedlen innehåller specifika näringsämnen eller ingredienser som är kända för att främja hälsan.`,
      link: '/dashboard/courses/functional-basics/material/functional-foods-topplista'
    },
    {
      id: 'motivation-reflektion',
      title: 'Motivation & Reflektion',
      icon: GiMeal,
      color: 'from-indigo-500 to-purple-600',
      content: `Fokusera på att vara nöjd med dig själv dag efter dag, och på att skapa en hållbar förändring. Om du någon gång unnar dig eller väljer något onyttigt, så tappa inte motivationen.`,
      link: '/dashboard/courses/functional-basics/material/motivation-reflektion'
    },
    {
      id: 'fragor-svar',
      title: 'Frågor och svar',
      icon: GiWaterBottle,
      color: 'from-teal-500 to-green-600',
      content: `Här hittar du svar på de vanligaste frågorna om kursen, kosten och eventuella biverkningar. Tveka inte att höra av dig om du har fler frågor!`,
      link: '/dashboard/courses/functional-basics/material/fragor-svar'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Kunskap & Information</h2>
        <p className="text-gray-700 mb-8">
          Här hittar du all kunskap och information från kursmaterialet. Klicka på ett ämne för att läsa mer.
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
                      <section.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{section.content}</p>
                      <Link
                        href={section.link}
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Läs mer
                        <ChevronRight className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 
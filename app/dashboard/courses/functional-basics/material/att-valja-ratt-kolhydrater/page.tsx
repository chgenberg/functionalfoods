'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiChevronRight, FiAlertCircle, FiTrendingUp, FiTrendingDown, FiActivity } from 'react-icons/fi';
import { GiWheat, GiGrainBundle, GiSugarCane, GiBread, GiCarrot, GiFruitBowl, GiPotato, GiRiceCooker } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';

interface CarbSource {
  id: string;
  name: string;
  icon: React.ElementType;
  type: 'fast' | 'slow';
  gi: number; // Glycemic Index
  examples: string[];
  effects: string[];
  color: string;
}

interface BloodSugarLevel {
  time: string;
  fastCarbs: number;
  slowCarbs: number;
}

export default function AttValjaRattKolhydraterPage() {
  const [selectedType, setSelectedType] = useState<'fast' | 'slow' | null>(null);
  const [showBloodSugar, setShowBloodSugar] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  const carbSources: CarbSource[] = [
    {
      id: 'sugar',
      name: 'Socker & Godis',
      icon: GiSugarCane,
      type: 'fast',
      gi: 100,
      examples: ['Läsk', 'Godis', 'Kakor', 'Glass'],
      effects: ['Snabb blodsockerhöjning', 'Kort energi', 'Sockerkrasch', 'Ökat sötsug'],
      color: 'from-red-400 to-pink-400'
    },
    {
      id: 'whitebread',
      name: 'Vitt bröd & Pasta',
      icon: GiBread,
      type: 'fast',
      gi: 85,
      examples: ['Vitt bröd', 'Pasta', 'Bullar', 'Croissant'],
      effects: ['Högt GI', 'Lite fiber', 'Snabb nedbrytning', 'Kort mättnad'],
      color: 'from-orange-400 to-amber-400'
    },
    {
      id: 'potato',
      name: 'Potatis',
      icon: GiPotato,
      type: 'fast',
      gi: 78,
      examples: ['Kokt potatis', 'Pommes frites', 'Potatismos'],
      effects: ['Relativt högt GI', 'Snabb energi', 'Bra näring om med skal'],
      color: 'from-yellow-400 to-orange-400'
    },
    {
      id: 'oats',
      name: 'Havre & Fullkorn',
      icon: GiGrainBundle,
      type: 'slow',
      gi: 55,
      examples: ['Havregryn', 'Fullkornsbröd', 'Rågbröd', 'Müsli utan socker'],
      effects: ['Långsam energi', 'Rik på fiber', 'Stabil blodsockernivå', 'Lång mättnad'],
      color: 'from-green-400 to-teal-400'
    },
    {
      id: 'vegetables',
      name: 'Grönsaker',
      icon: GiCarrot,
      type: 'slow',
      gi: 15,
      examples: ['Broccoli', 'Spenat', 'Blomkål', 'Zucchini'],
      effects: ['Mycket lågt GI', 'Rik på näring', 'Mycket fiber', 'Antiinflammatoriskt'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'legumes',
      name: 'Baljväxter',
      icon: GiRiceCooker,
      type: 'slow',
      gi: 35,
      examples: ['Linser', 'Bönor', 'Kikärter', 'Ärtor'],
      effects: ['Lågt GI', 'Protein + fiber', 'Långvarig energi', 'Mättande'],
      color: 'from-amber-600 to-yellow-600'
    },
    {
      id: 'berries',
      name: 'Bär',
      icon: GiFruitBowl,
      type: 'slow',
      gi: 40,
      examples: ['Blåbär', 'Hallon', 'Jordgubbar', 'Björnbär'],
      effects: ['Lågt GI', 'Antioxidanter', 'Naturlig sötma', 'Fiberrikt'],
      color: 'from-purple-400 to-pink-400'
    }
  ];

  const bloodSugarData: BloodSugarLevel[] = [
    { time: '0 min', fastCarbs: 5, slowCarbs: 5 },
    { time: '15 min', fastCarbs: 9, slowCarbs: 5.5 },
    { time: '30 min', fastCarbs: 10, slowCarbs: 6 },
    { time: '45 min', fastCarbs: 7, slowCarbs: 6.5 },
    { time: '60 min', fastCarbs: 4, slowCarbs: 6.5 },
    { time: '90 min', fastCarbs: 3, slowCarbs: 6 },
    { time: '120 min', fastCarbs: 4, slowCarbs: 5.5 },
    { time: '180 min', fastCarbs: 5, slowCarbs: 5 }
  ];

  const fastCarbs = carbSources.filter(c => c.type === 'fast');
  const slowCarbs = carbSources.filter(c => c.type === 'slow');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/courses/functional-basics/material" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-4">
            <FiArrowLeft className="mr-2" />
            Tillbaka till kursmaterial
          </Link>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mr-4">
              <GiWheat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Att välja rätt kolhydrater</h1>
              <p className="text-gray-600">För stabil energi och bättre hälsa</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Kolhydrater är kroppens favoritbränsle eftersom de snabbt omvandlas till glukos och förser kroppen med energi. 
              Men alla kolhydrater är inte skapade lika – det gäller att hålla isär de bra och de dåliga kolhydraterna.
            </p>
            
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 my-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <FiAlertCircle className="w-5 h-5 mr-2 text-primary" />
                Viktigt att veta:
              </h3>
              <p className="text-gray-700">
                Lågkolhydratkost fungerar utmärkt som livsstil för de flesta, så länge man äter rikligt med grönsaker 
                och hittar en balans som passar ens individuella behov och livsstil.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Fast vs Slow Carbs Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Fast Carbs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all ${
              selectedType === 'fast' ? 'ring-2 ring-red-400 transform scale-105' : 'hover:shadow-xl'
            }`}
            onClick={() => setSelectedType(selectedType === 'fast' ? null : 'fast')}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Snabba kolhydrater</h2>
              <FiTrendingUp className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-gray-600 mb-4">
              Innehåller ofta lite näring, mycket socker och ger kort mättnad.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-red-600">
                <FiAlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Snabb blodsockerhöjning</span>
              </div>
              <div className="flex items-center text-red-600">
                <FiAlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Kort energi & sockerkrasch</span>
              </div>
              <div className="flex items-center text-red-600">
                <FiAlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Ökar inflammation</span>
              </div>
            </div>
          </motion.div>

          {/* Slow Carbs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all ${
              selectedType === 'slow' ? 'ring-2 ring-primary transform scale-105' : 'hover:shadow-xl'
            }`}
            onClick={() => setSelectedType(selectedType === 'slow' ? null : 'slow')}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Långsamma kolhydrater</h2>
              <FiActivity className="w-6 h-6 text-primary" />
            </div>
            <p className="text-gray-600 mb-4">
              Tar längre tid att bryta ner och påverkar blodsockret mindre.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-primary">
                <FiCheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Stabil blodsockernivå</span>
              </div>
              <div className="flex items-center text-primary">
                <FiCheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Långvarig energi</span>
              </div>
              <div className="flex items-center text-primary">
                <FiCheckCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Mättande & näringsrika</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Carb Sources Grid */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                {selectedType === 'fast' ? 'Exempel på snabba kolhydrater' : 'Exempel på långsamma kolhydrater'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {carbSources
                  .filter(carb => carb.type === selectedType)
                  .map((carb, index) => {
                    const Icon = carb.icon;
                    const isExpanded = expandedInfo === carb.id;
                    
                    return (
                      <motion.div
                        key={carb.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => setExpandedInfo(isExpanded ? null : carb.id)}
                      >
                        <div className="flex items-center mb-3">
                          <div className={`w-10 h-10 bg-gradient-to-r ${carb.color} rounded-full flex items-center justify-center mr-3`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-semibold text-gray-800">{carb.name}</h4>
                            <p className="text-sm text-gray-600">GI: {carb.gi}</p>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-3"
                            >
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">Exempel:</p>
                                <div className="flex flex-wrap gap-1">
                                  {carb.examples.map((ex, idx) => (
                                    <span key={idx} className="text-xs px-2 py-1 bg-gray-100 rounded">
                                      {ex}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-700 mb-1">Effekter:</p>
                                <ul className="space-y-1">
                                  {carb.effects.map((effect, idx) => (
                                    <li key={idx} className="text-xs text-gray-600 flex items-start">
                                      <span className={`mr-1 ${carb.type === 'fast' ? 'text-red-500' : 'text-primary'}`}>•</span>
                                      {effect}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blood Sugar Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Blodsockerpåverkan</h2>
            <button
              onClick={() => setShowBloodSugar(!showBloodSugar)}
              className="text-primary hover:text-primary-dark font-medium"
            >
              {showBloodSugar ? 'Dölj' : 'Visa'} graf
            </button>
          </div>
          
          <AnimatePresence>
            {showBloodSugar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="relative h-64 mb-4">
                  <div className="absolute inset-0 grid grid-rows-5 gap-0">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border-b border-gray-200" />
                    ))}
                  </div>
                  
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 256">
                    {/* Fast carbs line */}
                    <motion.path
                      d={`M 0,${256 - bloodSugarData[0].fastCarbs * 25} ${bloodSugarData.map((d, i) => 
                        `L ${i * 100},${256 - d.fastCarbs * 25}`).join(' ')}`}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2 }}
                    />
                    
                    {/* Slow carbs line */}
                    <motion.path
                      d={`M 0,${256 - bloodSugarData[0].slowCarbs * 25} ${bloodSugarData.map((d, i) => 
                        `L ${i * 100},${256 - d.slowCarbs * 25}`).join(' ')}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, delay: 0.5 }}
                    />
                  </svg>
                  
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 -mb-5">
                    {bloodSugarData.map((d, i) => (
                      <span key={i}>{d.time}</span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-6 mt-8">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded mr-2" />
                    <span className="text-sm text-gray-700">Snabba kolhydrater</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-primary rounded mr-2" />
                    <span className="text-sm text-gray-700">Långsamma kolhydrater</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 text-center mt-4">
                  Notera hur snabba kolhydrater ger en snabb topp följt av ett kraftigt fall (sockerkrasch), 
                  medan långsamma kolhydrater ger en jämn och stabil energinivå.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Nyckeln till framgång</h2>
          <div className="space-y-3">
            <p className="text-lg leading-relaxed">
              Om vi undviker eller drar ner på snabba kolhydrater hjälper vi kroppen att använda fett istället 
              för socker som primärbränsle, vilket ger oss:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start">
                <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Jämnare blodsocker och energinivåer</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Minskad inflammation i kroppen</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Bättre humör och mental klarhet</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Ökad fettförbränning</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Vill du lära dig mer?</h3>
              <p className="text-gray-600 mb-4">Se vår ersättningsguide för smarta kolhydratalternativ</p>
              <Link href="/dashboard/courses/functional-basics/material/ersattningsguide-for-kolhydrater" 
                className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
                Fortsätt till ersättningsguiden
                <FiChevronRight className="ml-1" />
              </Link>
            </div>
            <GiGrainBundle className="w-16 h-16 text-primary opacity-20" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
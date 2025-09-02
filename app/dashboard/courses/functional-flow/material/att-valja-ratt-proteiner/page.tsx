'use client';

import Link from 'next/link';
import { useState } from 'react';

import { GiMuscleUp, GiMeat, GiChicken, GiGrainBundle, GiBodyBalance } from 'react-icons/gi';
import { FaFish, FaEgg, FaSeedling } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, ChevronRight, Info, Target, Zap, Shield } from 'lucide-react';

interface ProteinSource {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  benefits: string[];
  tips: string[];
  color: string;
  category: 'animal' | 'plant';
}

interface ProteinNeed {
  category: string;
  amount: string;
  description: string;
}

export default function AttValjaRattProteinerPage() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('normal');

  const proteinSources: ProteinSource[] = [
    {
      id: 'fish',
      name: 'Fisk & Skaldjur',
      icon: FaFish,
      description: 'Lax, tonfisk, torsk och räkor - rika på omega-3 och högkvalitativt protein.',
      benefits: ['Omega-3 fettsyror', 'Komplett protein', 'D-vitamin', 'Selen'],
      tips: ['Välj MSC-märkt fisk', 'Ät fet fisk 2-3 ggr/vecka', 'Variera mellan olika sorter'],
      color: 'from-blue-400 to-cyan-400',
      category: 'animal'
    },
    {
      id: 'meat',
      name: 'Kött',
      icon: GiMeat,
      description: 'Nötkött, lamm och viltkött - rikt på järn, zink och B12-vitamin.',
      benefits: ['Järn', 'Zink', 'B12-vitamin', 'Kreatin'],
      tips: ['Välj närproducerat', 'Satsa på gräsbeteskött', 'Viltkött är magert och näringsrikt'],
      color: 'from-red-400 to-pink-400',
      category: 'animal'
    },
    {
      id: 'poultry',
      name: 'Fågel',
      icon: GiChicken,
      description: 'Kyckling och kalkon - magra proteinkällor med viktiga näringsämnen.',
      benefits: ['Magert protein', 'B-vitaminer', 'Selen', 'Fosfor'],
      tips: ['Välj ekologiskt', 'Ta bort skinnet för mindre fett', 'Perfekt för meal prep'],
      color: 'from-orange-400 to-amber-400',
      category: 'animal'
    },
    {
      id: 'eggs',
      name: 'Ägg',
      icon: FaEgg,
      description: 'KRAV-märkta ägg - komplett protein med alla essentiella aminosyror.',
      benefits: ['Komplett protein', 'Kolin', 'D-vitamin', 'Lutein'],
      tips: ['Välj ekologiska/KRAV', 'Ät hela ägget', 'Perfekt till frukost'],
      color: 'from-yellow-400 to-orange-400',
      category: 'animal'
    },
    {
      id: 'legumes',
      name: 'Baljväxter',
      icon: FaSeedling,
      description: 'Linser, bönor och kikärter - vegetabiliska proteinkällor med fiber.',
      benefits: ['Fiber', 'Folat', 'Järn', 'Långsamma kolhydrater'],
      tips: ['Kombinera med spannmål', 'Blötlägg före tillagning', 'Perfekt i grytor'],
      color: 'from-green-400 to-teal-400',
      category: 'plant'
    },
    {
      id: 'grains',
      name: 'Fullkorn & Frön',
      icon: GiGrainBundle,
      description: 'Quinoa, hampafrön och chiafrön - kompletta vegetabiliska proteiner.',
      benefits: ['Komplett protein', 'Omega-3', 'Magnesium', 'Fiber'],
      tips: ['Quinoa är komplett protein', 'Strö frön på sallader', 'Perfekt i smoothies'],
      color: 'from-amber-600 to-yellow-600',
      category: 'plant'
    }
  ];

  const proteinNeeds: ProteinNeed[] = [
    {
      category: 'Normalaktiv vuxen',
      amount: '0.8-1.0 g/kg kroppsvikt',
      description: 'För att bibehålla muskelmassa och normal kroppsfunktion'
    },
    {
      category: 'Aktiv/Tränar regelbundet',
      amount: '1.2-1.6 g/kg kroppsvikt',
      description: 'För muskelåterhämtning och prestationsförbättring'
    },
    {
      category: 'Styrketräning/Muskelbygge',
      amount: '1.6-2.2 g/kg kroppsvikt',
      description: 'För optimal muskelsyntes och tillväxt'
    },
    {
      category: 'Äldre (65+)',
      amount: '1.0-1.2 g/kg kroppsvikt',
      description: 'För att motverka åldersrelaterad muskelförlust'
    }
  ];

  const calculateProteinNeed = () => {
    if (!weight) return 0;
    const weightNum = parseFloat(weight);
    
    switch (activityLevel) {
      case 'low': return weightNum * 0.8;
      case 'normal': return weightNum * 1.0;
      case 'active': return weightNum * 1.4;
      case 'athlete': return weightNum * 1.8;
      default: return weightNum * 1.0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/courses/functional-flow/material" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-4">
            <ArrowLeft className="mr-2" />
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
              <GiMuscleUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Att välja rätt proteiner</h1>
              <p className="text-gray-600">Kroppens byggstenar för optimal hälsa</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-4">
              Ordet protein kommer från grekiskans <em>proteos</em> och betyder "den förste eller den viktigaste" – 
              och det är precis det som protein är. Protein är kroppens byggnadsmaterial. Nästan allt i våra kroppar 
              är uppbyggt av proteiner som hud, hår, naglar, senor och muskler.
            </p>
            
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 my-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Proteinets viktiga funktioner:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Bygger och reparerar muskler</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Stärker immunförsvaret</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Balanserar hormoner</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Stabiliserar blodsockret</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Protein Sources Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Bra proteinkällor</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proteinSources.map((source, index) => {
              const Icon = source.icon;
              const isSelected = selectedSource === source.id;
              
              return (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelectedSource(isSelected ? null : source.id)}
                  className="cursor-pointer"
                >
                  <div className={`relative bg-white rounded-xl shadow-lg p-6 h-full transition-all duration-300 ${
                    isSelected ? 'ring-2 ring-primary transform scale-105' : 'hover:shadow-xl'
                  }`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${source.color} opacity-5 rounded-xl`} />
                    
                    <div className="relative">
                      <div className={`w-14 h-14 bg-gradient-to-r ${source.color} rounded-full flex items-center justify-center mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{source.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{source.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          source.category === 'animal' ? 'bg-red-100 text-red-700' : 'bg-background-secondary text-secondary'
                        }`}>
                          {source.category === 'animal' ? 'Animaliskt' : 'Vegetabiliskt'}
                        </span>
                        <ChevronRight className={`w-5 h-5 text-primary transition-transform ${
                          isSelected ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Detailed Source Information */}
          <AnimatePresence>
            {selectedSource && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6"
              >
                {proteinSources
                  .filter(source => source.id === selectedSource)
                  .map(source => {
                    const Icon = source.icon;
                    return (
                      <div key={source.id} className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="flex items-center mb-6">
                          <div className={`w-12 h-12 bg-gradient-to-r ${source.color} rounded-full flex items-center justify-center mr-4`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800">{source.name}</h3>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3">Näringsfördelar:</h4>
                            <ul className="space-y-2">
                              {source.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-center">
                                  <Shield className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
                                  <span className="text-gray-600">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3">Tips & råd:</h4>
                            <ul className="space-y-2">
                              {source.tips.map((tip, idx) => (
                                <li key={idx} className="flex items-start">
                                  <Target className="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                                  <span className="text-gray-600">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Protein Needs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Hur mycket protein behöver du?</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {proteinNeeds.map((need, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-800 mb-1">{need.category}</h3>
                <p className="text-primary font-medium mb-2">{need.amount}</p>
                <p className="text-sm text-gray-600">{need.description}</p>
              </div>
            ))}
          </div>

          {/* Protein Calculator */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Beräkna ditt proteinbehov</h3>
              <button
                onClick={() => setShowCalculator(!showCalculator)}
                className="text-primary hover:text-primary-dark font-medium"
              >
                {showCalculator ? 'Dölj' : 'Visa'} kalkylator
              </button>
            </div>
            
            <AnimatePresence>
              {showCalculator && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Din vikt (kg)
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="70"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aktivitetsnivå
                    </label>
                    <select
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="low">Stillasittande</option>
                      <option value="normal">Normalaktiv</option>
                      <option value="active">Tränar regelbundet</option>
                      <option value="athlete">Elitidrottare</option>
                    </select>
                  </div>
                  
                  {weight && (
                    <div className="bg-white rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-2">Ditt dagliga proteinbehov:</p>
                      <p className="text-3xl font-bold text-primary">
                        {Math.round(calculateProteinNeed())} g
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Fördelat på 3-4 måltider = {Math.round(calculateProteinNeed() / 3)}-{Math.round(calculateProteinNeed() / 4)} g per måltid
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Key Takeaway */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center mb-4">
            <GiBodyBalance className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-bold">Kom ihåg!</h2>
          </div>
          <p className="text-lg leading-relaxed">
            Att satsa på högkvalitativa proteiner är som att ge din kropp de finaste byggmaterialen. 
            Det skapar en stark, uthållig och dynamisk kropp. Variera dina proteinkällor och kombinera 
            dem med hälsosamma fetter och fibrer för en balanserad måltid.
          </p>
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
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Nästa steg</h3>
              <p className="text-gray-600 mb-4">Lär dig välja rätt kolhydrater för stabil energi</p>
              <Link href="/dashboard/courses/functional-flow/material/att-valja-ratt-kolhydrater" 
                className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
                Fortsätt till nästa modul
                <ChevronRight className="ml-1" />
              </Link>
            </div>
            <Zap className="w-16 h-16 text-primary opacity-20" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
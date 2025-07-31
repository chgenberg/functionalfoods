'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiChevronRight, FiHeart, FiActivity, FiTarget, FiShield, FiZap, FiTrendingUp } from 'react-icons/fi';
import { GiBrain, GiStomach, GiFruitBowl, GiHeartBeats, GiMuscleUp, GiWeightScale, GiFireBowl } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';

interface Benefit {
  id: number;
  title: string;
  icon: React.ElementType;
  description: string;
  examples: string[];
  color: string;
  tips: string[];
}

export default function FordelarnaPage() {
  const [selectedBenefit, setSelectedBenefit] = useState<number | null>(null);
  const [completedReading, setCompletedReading] = useState(false);

  const benefits: Benefit[] = [
    {
      id: 1,
      title: 'Ökad näringsnivå',
      icon: GiFruitBowl,
      description: 'Functional foods är rika på mineraler, antioxidanter och essentiella fettsyror som är avgörande för att kroppen ska fungera optimalt.',
      examples: ['Blåbär med chiafrön till frukost', 'Grön smoothie med spirulina', 'Nötter som mellanmål'],
      color: 'from-green-400 to-emerald-400',
      tips: [
        'Börja dagen med en näringsrik frukost',
        'Inkludera färgglada grönsaker i varje måltid',
        'Välj hela livsmedel framför processade'
      ]
    },
    {
      id: 2,
      title: 'Hålla en hälsosam vikt',
      icon: GiWeightScale,
      description: 'Många Functional Foods har få kalorier och högt näringsvärde, vilket gör dem utmärkta för viktkontroll.',
      examples: ['Proteinrika livsmedel för mättnad', 'Färgglada grönsaker', 'Hälsosamma fetter i måttliga mängder'],
      color: 'from-blue-400 to-cyan-400',
      tips: [
        'Ät mycket grönsaker, gärna råkost',
        'Välj bra proteinkällor till varje måltid',
        'Använd hälsosamma fetter med måtta'
      ]
    },
    {
      id: 3,
      title: 'Förbättrar matsmältningen',
      icon: GiStomach,
      description: 'Fiberrika grönsaker, frukter och fullkorn främjar en sund matsmältning och regelbunden tarmfunktion.',
      examples: ['Avokado', 'Baljväxter', 'Råris', 'Fermenterade livsmedel'],
      color: 'from-purple-400 to-pink-400',
      tips: [
        'Öka fiberintaget gradvis',
        'Drick mycket vatten',
        'Inkludera fermenterade livsmedel dagligen'
      ]
    },
    {
      id: 4,
      title: 'Inflammationssänkande',
      icon: GiFireBowl,
      description: 'Vissa Functional Foods hjälper till att minska inflammation i kroppen, vilket kan lindra kroniska tillstånd.',
      examples: ['Ingefära', 'Gurkmeja', 'Fet fisk', 'Grönt te'],
      color: 'from-orange-400 to-red-400',
      tips: [
        'Använd gurkmeja i matlagningen',
        'Drick ingefärste dagligen',
        'Ät fet fisk 2-3 gånger i veckan'
      ]
    },
    {
      id: 5,
      title: 'Stödjer hjärthälsan',
      icon: GiHeartBeats,
      description: 'Bär, nötter, frön och fet fisk är rika på hjärthälsosamma näringsämnen som omega-3 och antioxidanter.',
      examples: ['Valnötter', 'Lax', 'Blåbär', 'Avokado', 'Olivolja'],
      color: 'from-red-400 to-pink-400',
      tips: [
        'Ät en handfull nötter dagligen',
        'Välj fet fisk framför magert kött',
        'Använd olivolja som huvudsaklig fettkälla'
      ]
    },
    {
      id: 6,
      title: 'Ökade energinivåer',
      icon: FiZap,
      description: 'Functional Foods innehåller komplexa kolhydrater, protein och järn som ökar energi och mental klarhet.',
      examples: ['Grön smoothie', 'Hemgjord granola', 'Quinoa', 'Ägg'],
      color: 'from-yellow-400 to-amber-400',
      tips: [
        'Starta dagen med en näringsrik smoothie',
        'Välj komplexa kolhydrater',
        'Ät regelbundet för jämn energi'
      ]
    },
    {
      id: 7,
      title: 'Stärker immunförsvaret',
      icon: FiShield,
      description: 'Många Functional Foods är rika på vitamin C, D och zink som stärker immunförsvaret.',
      examples: ['Citrusfrukter', 'Yoghurt', 'Kimchi', 'Svamp', 'Vitlök'],
      color: 'from-teal-400 to-green-400',
      tips: [
        'Ät probiotikarika livsmedel dagligen',
        'Inkludera C-vitaminrika frukter',
        'Glöm inte D-vitamin från fisk och svamp'
      ]
    }
  ];

  const handleBenefitClick = (benefitId: number) => {
    setSelectedBenefit(selectedBenefit === benefitId ? null : benefitId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/courses/functional-flow/material" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-4">
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
              <FiHeart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Fördelarna med Functional Foods</h1>
              <p className="text-gray-600">Upptäck hur din kropp kan blomstra</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed">
              Functional Foods är livsmedel som inte bara ger näring utan också erbjuder specifika hälsofördelar. 
              Genom att inkludera dessa näringsrika livsmedel i din kost kan du stödja viktminskning, förbättra matsmältning, 
              minska inflammation och stärka ditt immunförsvar – allt medan du ökar din energi och förbättrar hjärthälsan.
            </p>
          </div>
        </motion.div>

        {/* Interactive Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                onClick={() => handleBenefitClick(benefit.id)}
                className="cursor-pointer"
              >
                <div className={`relative bg-white rounded-xl shadow-lg p-6 h-full transition-all duration-300 ${
                  selectedBenefit === benefit.id ? 'ring-2 ring-primary transform scale-105' : 'hover:shadow-xl'
                }`}>
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-5 rounded-xl`} />
                  
                  {/* Content */}
                  <div className="relative">
                    <div className={`w-14 h-14 bg-gradient-to-r ${benefit.color} rounded-full flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{benefit.description}</p>
                    
                    <div className="flex items-center text-primary text-sm font-medium">
                      <span>Läs mer</span>
                      <FiChevronRight className={`ml-1 transition-transform ${
                        selectedBenefit === benefit.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Benefit Information */}
        <AnimatePresence>
          {selectedBenefit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              {benefits.map((benefit) => {
                if (benefit.id === selectedBenefit) {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.id} className="bg-white rounded-2xl shadow-xl p-8">
                      <div className="flex items-center mb-6">
                        <div className={`w-12 h-12 bg-gradient-to-r ${benefit.color} rounded-full flex items-center justify-center mr-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">{benefit.title}</h3>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">Exempel på livsmedel:</h4>
                          <ul className="space-y-2">
                            {benefit.examples.map((example, idx) => (
                              <li key={idx} className="flex items-center">
                                <FiCheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                <span className="text-gray-600">{example}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-3">Praktiska tips:</h4>
                          <ul className="space-y-2">
                            {benefit.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-start">
                                <FiTarget className="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-gray-600">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Sammanfattning</h2>
          <p className="text-lg leading-relaxed mb-6">
            Genom att göra Functional Foods till en naturlig del av din vardag investerar du i din långsiktiga hälsa. 
            Varje måltid blir en möjlighet att ge din kropp det bästa – näring som läker, stärker och energiserar.
          </p>
          <div className="flex items-center">
            <FiActivity className="w-6 h-6 mr-2" />
            <span className="font-medium">Din hälsoresa börjar med varje medvetet val du gör!</span>
          </div>
        </motion.div>

        {/* Progress Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Din progress</h3>
            {!completedReading ? (
              <button
                onClick={() => setCompletedReading(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Markera som slutförd
              </button>
            ) : (
              <div className="flex items-center text-green-600">
                <FiCheckCircle className="w-6 h-6 mr-2" />
                <span className="font-medium">Slutförd!</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">Redo för nästa steg?</p>
              <Link href="/dashboard/courses/functional-flow/material/dags-att-komma-igang" 
                className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
                Fortsätt till "Dags att komma igång"
                <FiChevronRight className="ml-1" />
              </Link>
            </div>
            <FiTrendingUp className="w-12 h-12 text-primary opacity-20" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiBook, FiArrowLeft, FiCheckCircle, FiLock, FiPlay, FiFileText, FiTarget, FiHeart, FiZap, FiShoppingCart, FiCoffee, FiAward, FiTrendingUp, FiActivity, FiSun, FiDroplet, FiUsers, FiCompass, FiRefreshCw } from 'react-icons/fi';
import { GiBrain, GiStomach, GiWheat, GiHeartBeats, GiMuscleUp, GiMeal, GiFruitBowl, GiHotMeal, GiWaterBottle } from 'react-icons/gi';
import { motion } from 'framer-motion';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  duration: string;
  completed?: boolean;
  locked?: boolean;
}

export default function FunctionalBasicsMaterialPage() {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  const modules: Module[] = [
    {
      id: 'vad-ar-functional-foods',
      title: 'Vad är Functional Foods?',
      description: 'Lär dig grunderna om mervärdesmat och de tio livsmedelskategorierna',
      icon: GiBrain,
      duration: '15 min',
      completed: true
    },
    {
      id: 'fordelarna-med-functional-foods',
      title: 'Fördelarna med Functional Foods',
      description: 'Upptäck alla hälsofördelar och hur din kropp påverkas positivt',
      icon: FiHeart,
      duration: '20 min',
      completed: true
    },
    {
      id: 'dags-att-komma-igang',
      title: 'Dags att komma igång',
      description: 'Praktiska tips för att starta din resa med functional foods',
      icon: FiPlay,
      duration: '25 min',
      completed: true
    },
    {
      id: 'att-valja-ratt-proteiner',
      title: 'Att välja rätt proteiner',
      description: 'Guide för högkvalitativa proteinkällor och hur du använder dem',
      icon: GiMuscleUp,
      duration: '20 min',
      completed: false
    },
    {
      id: 'att-valja-ratt-kolhydrater',
      title: 'Att välja rätt kolhydrater',
      description: 'Lär dig om långsamma kolhydrater och blodsockerbalans',
      icon: GiWheat,
      duration: '25 min',
      completed: false
    },
    {
      id: 'ersattningsguide-for-kolhydrater',
      title: 'Ersättningsguide för kolhydrater',
      description: 'Smarta alternativ till traditionella kolhydratkällor',
      icon: FiRefreshCw,
      duration: '15 min',
      completed: false
    },
    {
      id: 'functional-foods-topplista',
      title: 'Functional Foods Topplista',
      description: 'De viktigaste livsmedlen inom varje kategori',
      icon: FiAward,
      duration: '30 min',
      completed: false
    },
    {
      id: 'naturens-egna-halsobomber',
      title: 'Naturens egna hälsobomber',
      description: 'Superfoods och kraftfulla näringsämnen från naturen',
      icon: GiFruitBowl,
      duration: '20 min',
      completed: false
    },
    {
      id: 'benbuljong',
      title: 'Benbuljong - Flytande guld',
      description: 'Allt om benbuljong och dess läkande egenskaper',
      icon: GiHotMeal,
      duration: '15 min',
      completed: false
    },
    {
      id: 'drycker',
      title: 'Hälsosamma drycker',
      description: 'Guide till functional drinks och vätskebehov',
      icon: GiWaterBottle,
      duration: '15 min',
      completed: false
    },
    {
      id: 'att-ata-ute-med-functional-foods',
      title: 'Äta ute med Functional Foods',
      description: 'Tips för att göra hälsosamma val på restaurang',
      icon: FiShoppingCart,
      duration: '20 min',
      completed: false
    },
    {
      id: 'at-mer-functional-foods-pa-ett-enkelt-satt',
      title: 'Ät mer Functional Foods enkelt',
      description: 'Praktiska tips för att öka intaget i vardagen',
      icon: GiMeal,
      duration: '15 min',
      completed: false
    },
    {
      id: 'periodisk-fasta-ger-klarhet-och-energi',
      title: 'Periodisk fasta',
      description: 'Lär dig om intermittent fasta och dess fördelar',
      icon: FiSun,
      duration: '25 min',
      completed: false
    },
    {
      id: 'functional-foods-3-steg-till-ett-friskare-liv',
      title: '3 steg till ett friskare liv',
      description: 'En holistisk approach med kost, träning och mental hälsa',
      icon: FiTrendingUp,
      duration: '30 min',
      completed: false
    },
    {
      id: 'functional-foods-som-livsstil',
      title: 'Functional Foods som livsstil',
      description: 'Hur du gör functional foods till en hållbar vana',
      icon: FiCompass,
      duration: '20 min',
      completed: false
    },
    {
      id: 'maldokument-styrelsemote-1',
      title: 'Målsättning - Styrelsemöte 1',
      description: 'Sätt upp dina personliga hälsomål och analysera nuläget',
      icon: FiTarget,
      duration: '30 min',
      completed: false
    },
    {
      id: 'motivation-och-reflektion',
      title: 'Motivation och reflektion',
      description: 'Verktyg för att hålla motivationen uppe',
      icon: FiActivity,
      duration: '20 min',
      completed: false
    },
    {
      id: 'reflektion-vecka-3',
      title: 'Reflektion vecka 3',
      description: 'Utvärdera dina framsteg och justera kursen',
      icon: FiCheckCircle,
      duration: '15 min',
      completed: false
    },
    {
      id: 'maldokument-styrelsemote-2',
      title: 'Målsättning - Styrelsemöte 2',
      description: 'Reflektera över din resa och planera framåt',
      icon: FiAward,
      duration: '30 min',
      completed: false
    },
    {
      id: 'fragor-och-svars',
      title: 'Vanliga frågor och svar',
      description: 'Svar på de vanligaste frågorna om functional foods',
      icon: FiUsers,
      duration: '25 min',
      completed: false
    }
  ];

  const completedCount = modules.filter(m => m.completed).length;
  const progressPercentage = (completedCount / modules.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/courses/functional-basics" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-4">
            <FiArrowLeft className="mr-2" />
            Tillbaka till kursen
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Kursmaterial - Functional Basics</h1>
                <p className="text-gray-600">Utforska alla moduler och fördjupa din kunskap om functional foods</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{completedCount}/{modules.length}</div>
                <p className="text-sm text-gray-600">Moduler slutförda</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onMouseEnter={() => setHoveredModule(module.id)}
                onMouseLeave={() => setHoveredModule(null)}
              >
                <Link href={`/dashboard/courses/functional-basics/material/${module.id}`}>
                  <div className={`relative bg-white rounded-xl shadow-lg p-6 h-full transition-all duration-300 ${
                    hoveredModule === module.id ? 'transform -translate-y-2 shadow-2xl' : ''
                  } ${module.locked ? 'opacity-75' : ''}`}>
                    {/* Status indicator */}
                    <div className="absolute top-4 right-4">
                      {module.completed ? (
                        <FiCheckCircle className="w-6 h-6 text-green-500" />
                      ) : module.locked ? (
                        <FiLock className="w-6 h-6 text-gray-400" />
                      ) : null}
                    </div>

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                      module.completed ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      <Icon className={`w-8 h-8 ${
                        module.completed ? 'text-green-600' : 'text-primary'
                      }`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{module.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{module.description}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500 flex items-center">
                        <FiFileText className="w-4 h-4 mr-1" />
                        {module.duration}
                      </span>
                      <span className={`text-sm font-medium ${
                        module.completed ? 'text-green-600' : 'text-primary'
                      }`}>
                        {module.completed ? 'Slutförd' : module.locked ? 'Låst' : 'Starta →'}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Tips section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">💡 Tips för att lyckas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">Gå igenom modulerna i ordning för bästa lärupplevelse</p>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">Ta anteckningar och reflektera över varje modul</p>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">Applicera kunskapen direkt i din vardag</p>
            </div>
            <div className="flex items-start">
              <FiCheckCircle className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
              <p className="text-gray-700">Dela dina erfarenheter i kursforumet</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
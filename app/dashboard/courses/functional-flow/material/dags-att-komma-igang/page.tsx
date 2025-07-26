'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiArrowLeft, FiCheckCircle, FiChevronRight, FiPlay, FiCalendar, FiShoppingCart, FiUsers, FiDroplet, FiHeart, FiTarget, FiClock } from 'react-icons/fi';
import { GiMeal, GiWaterBottle, GiCookingPot, GiTargetArrows } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';

interface ChecklistItem {
  id: string;
  text: string;
  icon: React.ElementType;
  tips?: string[];
}

interface TipSection {
  id: string;
  title: string;
  icon: React.ElementType;
  content: string;
  color: string;
  expanded?: boolean;
}

export default function DagsAttKommaIgangPage() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [expandedTips, setExpandedTips] = useState<string[]>([]);
  const [showMotivation, setShowMotivation] = useState(false);

  const checklistItems: ChecklistItem[] = [
    {
      id: 'planera',
      text: 'Planera när du ska starta och välj en lämplig vecka',
      icon: FiCalendar,
      tips: ['Välj en vecka utan stora evenemang', 'Starta helst på en måndag', 'Markera i kalendern']
    },
    {
      id: 'handla',
      text: 'Handla hem allt du behöver för första veckan',
      icon: FiShoppingCart,
      tips: ['Använd inköpslistan', 'Handla på helgen', 'Köp färska råvaror']
    },
    {
      id: 'matlådor',
      text: 'Förbered några maträtter och matlådor',
      icon: GiCookingPot,
      tips: ['Laga 2-3 rätter i förväg', 'Portionera i matlådor', 'Märk med datum']
    },
    {
      id: 'vatten',
      text: 'Förbered för att dricka minst 2 liter vatten per dag',
      icon: GiWaterBottle,
      tips: ['Köp en vattenflaska', 'Förbered smaksatt vatten', 'Sätt påminnelser']
    },
    {
      id: 'berätta',
      text: 'Berätta för din omgivning om din hälsoresa',
      icon: FiUsers,
      tips: ['Be om stöd', 'Inspirera andra', 'Hitta en träningskompis']
    },
    {
      id: 'träning',
      text: 'Planera för daglig rörelse (minst 15 min)',
      icon: FiHeart,
      tips: ['Boka in i kalendern', 'Välj aktiviteter du gillar', 'Börja försiktigt']
    }
  ];

  const tipSections: TipSection[] = [
    {
      id: 'vanor',
      title: 'Nya vanor tar tid',
      icon: FiClock,
      content: 'Det kan kännas som mycket att tänka på i början, men med kostscheman, recept och inköpslistor har vi förenklat allt för dig. Efter några dagar blir det naturligt!',
      color: 'from-purple-400 to-pink-400'
    },
    {
      id: 'måltider',
      title: 'Måltidsrutiner',
      icon: GiMeal,
      content: 'Kostschemat innehåller 2-3 måltider per dag. Om du är van vid att småäta blir det en omställning. Drick vatten, ta en kaffe och håll dig sysselsatt mellan måltiderna.',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      id: 'socialt',
      title: 'Sociala situationer',
      icon: FiUsers,
      content: 'Vid restaurangbesök eller bjudningar - planera i förväg! Ta med egen mat eller välj grönsaker och protein. Förklara att du följer ett speciellt kostschema.',
      color: 'from-green-400 to-teal-400'
    },
    {
      id: 'flexibilitet',
      title: '100% är inte ett måste',
      icon: FiTarget,
      content: 'Du kan byta måltider och anpassa recept efter dina favoriter. Håll dig till Functional Foods-principer med naturliga råvaror, kryddor och örter.',
      color: 'from-orange-400 to-red-400'
    }
  ];

  const handleCheckItem = (itemId: string) => {
    setCheckedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleTip = (tipId: string) => {
    setExpandedTips(prev =>
      prev.includes(tipId)
        ? prev.filter(id => id !== tipId)
        : [...prev, tipId]
    );
  };

  const completionPercentage = (checkedItems.length / checklistItems.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
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
              <FiPlay className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dags att komma igång!</h1>
              <p className="text-gray-600">Din guide för en lyckad start</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed">
              Mycket handlar om vanor och när du startar programmet med sex veckors kostscheman så kan det kännas som att det är mycket att tänka på, 
              planera och förbereda – men jag har förenklat det för dig! Du har kostscheman, lättlagade recept och praktiska inköpslistor vecka för vecka, 
              så det är bara att sätta igång.
            </p>
          </div>
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Din förberedelse</h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Slutfört: {checkedItems.length} av {checklistItems.length}</span>
              <span>{Math.round(completionPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Checklist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Din checklista för start</h2>
          
          <div className="space-y-4">
            {checklistItems.map((item, index) => {
              const Icon = item.icon;
              const isChecked = checkedItems.includes(item.id);
              const isExpanded = expandedTips.includes(item.id);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-xl p-4 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-start">
                    <button
                      onClick={() => handleCheckItem(item.id)}
                      className={`w-6 h-6 rounded-full border-2 mr-4 mt-0.5 flex-shrink-0 transition-all duration-300 ${
                        isChecked 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {isChecked && <FiCheckCircle className="w-full h-full text-white" />}
                    </button>
                    
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className={`w-5 h-5 mr-3 ${isChecked ? 'text-green-600' : 'text-gray-500'}`} />
                          <span className={`text-lg ${isChecked ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                            {item.text}
                          </span>
                        </div>
                        
                        {item.tips && (
                          <button
                            onClick={() => toggleTip(item.id)}
                            className="text-primary hover:text-primary-dark transition-colors"
                          >
                            <FiChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        )}
                      </div>
                      
                      <AnimatePresence>
                        {isExpanded && item.tips && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 pl-8"
                          >
                            <ul className="space-y-1">
                              {item.tips.map((tip, idx) => (
                                <li key={idx} className="flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  <span className="text-sm text-gray-600">{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {tipSections.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${tip.color} rounded-full flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{tip.content}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Motivation Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Tänk positivt! 🌟</h2>
          <p className="text-lg leading-relaxed mb-6">
            Att du både vill och har lust är viktigt för att du ska lyckas. Ha roligt när du handlar råvaror och lagar Functional Foods! 
            Gör det lustfyllt och intressant att följa kroppens förändring både kroppsligt och mentalt.
          </p>
          
          <div className="bg-white/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-3">Kom ihåg:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Fokusera på att vara nöjd med dig själv dag efter dag</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Om du tar ut svängarna någon dag - inget dåligt samvete!</span>
              </li>
              <li className="flex items-start">
                <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Du har tagit beslutet att förändra din hälsa - det kommer du aldrig ångra!</span>
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
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Redo att lära dig mer?</h3>
              <p className="text-gray-600 mb-4">Fortsätt din resa med att lära dig välja rätt proteiner</p>
              <Link href="/dashboard/courses/functional-basics/material/att-valja-ratt-proteiner" 
                className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
                Nästa modul: Att välja rätt proteiner
                <FiChevronRight className="ml-1" />
              </Link>
            </div>
            <GiTargetArrows className="w-16 h-16 text-primary opacity-20" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
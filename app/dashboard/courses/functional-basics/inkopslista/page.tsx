'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShoppingCart, FiCheck, FiChevronDown, FiChevronUp, 
  FiDownload, FiPrinter, FiShare2, FiRefreshCw
} from 'react-icons/fi';
import { GiFruitBowl } from 'react-icons/gi';
import Link from 'next/link';
import ShoppingList from './ShoppingList';

interface WeekSection {
  week: number;
  title: string;
  description: string;
}

const weekSections: WeekSection[] = [
  { week: 1, title: 'Introduktion till Functional Foods', description: 'Lär dig grunderna och kom igång med din hälsoresa' },
  { week: 2, title: 'Att välja rätt proteiner', description: 'Fokus på högkvalitativa proteinkällor' },
  { week: 3, title: 'Att välja rätt kolhydrater', description: 'Lär dig om bra kolhydrater för stabil energi' },
  { week: 4, title: 'Functional Foods Topplista', description: 'De mest kraftfulla livsmedlen för din hälsa' },
  { week: 5, title: 'Fördelarna med Functional Foods', description: 'Fördjupa din förståelse för hälsofördelarna' },
  { week: 6, title: 'Att komma igång', description: 'Sammanfattning och vägen framåt' }
];

export default function InkopslistaPage() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const courseId = '851b830e-9f81-4e92-9b2d-3bcfdac86c9e'; // Functional Basics course ID
  const [loading, setLoading] = useState(false);

  const toggleWeek = (week: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(week)) {
      newExpanded.delete(week);
    } else {
      newExpanded.add(week);
    }
    setExpandedWeeks(newExpanded);
  };

  const expandAll = () => {
    setExpandedWeeks(new Set([1, 2, 3, 4, 5, 6]));
  };

  const collapseAll = () => {
    setExpandedWeeks(new Set());
  };

  const downloadAllLists = () => {
    // Implementera nedladdning av alla listor som PDF eller text
    console.log('Laddar ner alla inköpslistor...');
  };

  const printAllLists = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar inköpslistor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-2xl bg-primary p-6 md:p-8 text-white shadow-xl mb-6 md:mb-8"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FiShoppingCart className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold">Inköpslistor</h1>
                </div>
                <p className="text-green-100 text-base md:text-lg">
                  Alla dina inköpslistor för 6-veckorsprogrammet samlade på ett ställe
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadAllLists}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200"
                >
                  <FiDownload className="w-4 h-4" />
                  <span className="hidden sm:inline">Ladda ner alla</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={printAllLists}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200"
                >
                  <FiPrinter className="w-4 h-4" />
                  <span className="hidden sm:inline">Skriv ut</span>
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </motion.div>

        {/* Action buttons */}
        <div className="flex justify-between items-center mb-6">
          <Link 
            href="/dashboard/courses/functional-basics/kostschema"
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            ← Tillbaka till kostschema
          </Link>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Expandera alla
            </button>
            <button
              onClick={collapseAll}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Stäng alla
            </button>
          </div>
        </div>

        {/* Week sections */}
        <div className="space-y-4">
          {weekSections.map((section) => (
            <motion.div
              key={section.week}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: section.week * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Week header */}
              <button
                onClick={() => toggleWeek(section.week)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white
                    ${section.week === 1 ? 'bg-primary' : ''}
                    ${section.week === 2 ? 'bg-[#0D5C29]' : ''}
                    ${section.week === 3 ? 'bg-[#167531]' : ''}
                    ${section.week === 4 ? 'bg-[#1F8E39]' : ''}
                    ${section.week === 5 ? 'bg-[#28A741]' : ''}
                    ${section.week === 6 ? 'bg-[#31C049]' : ''}
                  `}>
                    {section.week}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Vecka {section.week}: {section.title}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/courses/functional-basics/week/${section.week}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-primary hover:text-secondary px-3 py-1 hover:bg-background rounded-lg transition-colors"
                  >
                    Gå till veckan
                  </Link>
                  {expandedWeeks.has(section.week) ? (
                    <FiChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <FiChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Week content */}
              <AnimatePresence>
                {expandedWeeks.has(section.week) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-6">
                      <ShoppingList 
                        weekNumber={section.week} 
                        courseId={courseId}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Bottom info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="bg-background rounded-xl p-6">
            <GiFruitBowl className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tips för smart shopping</h3>
            <p className="text-gray-700 max-w-2xl mx-auto">
              Planera dina inköp veckovis för att spara tid och pengar. 
              Många ingredienser återkommer mellan veckorna, så köp större kvantiteter av basvaror.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
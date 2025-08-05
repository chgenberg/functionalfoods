'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiDownload, FiPrinter, FiShoppingCart, FiRefreshCw } from 'react-icons/fi';
import ShoppingList from './ShoppingList';

interface WeekSection {
  week: number;
  title: string;
  description: string;
}

const weekSections: WeekSection[] = [
  { week: 1, title: 'Avancerad grund i Functional Foods', description: 'Sofistikerade superfoods och näringsoptimering' },
  { week: 2, title: 'Proteinoptimering och synergier', description: 'Avancerade proteinstrategier och aminosyrabalans' },
  { week: 3, title: 'Kolhydratperiodisering och metabolism', description: 'Strategisk kolhydratanvändning för optimal prestanda' },
  { week: 4, title: 'Maximal näringsabsorption', description: 'Tekniker för förbättrad näringsupptag' },
  { week: 5, title: 'Avancerade Flow-tekniker', description: 'Mästra sofistikerade näringsstrategier' },
  { week: 6, title: 'Mästerskap och framtidsplanering', description: 'Integrera alla tekniker för långsiktig framgång' }
];

export default function InkopslistaPage() {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const courseId = 'a9662c22-3ae1-48d7-9cda-7bcefe4e16b5'; // Functional Flow course ID
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Flow Inköpslistor
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Optimala inköpslistor för varje vecka i ditt Flow-program. 
              Alla ingredienser är noggrant utvalda för maximal näringsnytta.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={expandAll}
              className="flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
            >
              <FiChevronDown className="w-4 h-4" />
              <span>Visa alla</span>
            </button>
            
            <button
              onClick={collapseAll}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Stäng alla</span>
            </button>
            
            <button
              onClick={downloadAllLists}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              <FiDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Ladda ner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Shopping Lists */}
      <div className="space-y-4 md:space-y-6">
        {weekSections.map((weekSection) => (
          <motion.div
            key={weekSection.week}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: weekSection.week * 0.1 }}
            className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {/* Week Header */}
            <div 
              className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleWeek(weekSection.week)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ 
                      backgroundColor: weekSection.week === 1 ? '#014421' :
                                      weekSection.week === 2 ? '#0D5C29' :
                                      weekSection.week === 3 ? '#167531' :
                                      weekSection.week === 4 ? '#1F8E39' :
                                      weekSection.week === 5 ? '#28A741' : '#31C049'
                    }}
                  >
                    {weekSection.week}
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                      {weekSection.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 mt-1">
                      {weekSection.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <FiShoppingCart className="w-5 h-5 text-gray-400" />
                  <FiChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      expandedWeeks.has(weekSection.week) ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </div>
            </div>

            {/* Shopping List Content */}
            <AnimatePresence>
              {expandedWeeks.has(weekSection.week) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="border-t border-gray-100"
                >
                  <div className="p-4 md:p-6 bg-gray-50">
                    <ShoppingList 
                      weekNumber={weekSection.week} 
                      courseId={courseId}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Footer Tips */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl md:rounded-2xl p-6 md:p-8 border border-teal-100"
      >
        <h3 className="text-lg md:text-xl font-semibold text-teal-900 mb-4">
          💡 Tips för optimal inhandling
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm md:text-base text-teal-800">
          <div className="space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-teal-600 font-semibold">•</span>
              Handla ekologiskt när möjligt för bästa näringsinnehåll
            </p>
            <p className="flex items-start gap-2">
              <span className="text-teal-600 font-semibold">•</span>
              Välj säsongsbetonade produkter för optimal fräschör
            </p>
            <p className="flex items-start gap-2">
              <span className="text-teal-600 font-semibold">•</span>
              Frys färska bär och grönsaker för längre hållbarhet
            </p>
          </div>
          <div className="space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-teal-600 font-semibold">•</span>
              Köp nötter och frön i bulk för bättre pris
            </p>
            <p className="flex items-start gap-2">
              <span className="text-teal-600 font-semibold">•</span>
              Förvara superfoods i lufttäta behållare
            </p>
            <p className="flex items-start gap-2">
              <span className="text-teal-600 font-semibold">•</span>
              Planera måltidsprep för effektiv veckostart
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 
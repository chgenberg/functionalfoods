'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTarget, FiCalendar, FiBook, FiShoppingCart, FiChevronRight, FiClock, 
  FiUsers, FiAward, FiTrendingUp
} from 'react-icons/fi';
import Link from 'next/link';
import { GoalsSection } from '../components/GoalsSection';
import { CalendarView } from '../components/CalendarView';
import { 
  KnowledgeSection, 
  MotivationSection, 
  RecipeHighlights,
  WeekSummary
} from './components';
import { getFlowWeekData } from '@/app/data/mealPlans';

interface TabProps {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
}

export default function Week1Page() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [completedGoals, setCompletedGoals] = useState<string[]>([]);

  const tabs: TabProps[] = [
    { id: 'overview', label: 'Översikt', icon: FiBook, color: 'from-[#112A12] to-[#112A12]' },
    { id: 'goals', label: 'Målsättning', icon: FiTarget, color: 'from-[#da695c] to-[#da695c]' },
    { id: 'mealplan', label: 'Kostschema', icon: FiCalendar, color: 'from-[#112A12] to-[#112A12]' },
    { id: 'shopping', label: 'Inköpslista', icon: FiShoppingCart, color: 'from-[#da695c] to-[#da695c]' }
  ];

  // Get meal plan from centralized data
  const weekData = getFlowWeekData(1);
  const mealPlan = weekData?.days || {};

  return (
    <div className="space-y-6 md:space-y-8 pb-20 md:pb-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-teal-600 via-cyan-600 to-teal-700 p-6 md:p-8 text-white shadow-xl md:shadow-2xl"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <div className="bg-white/20 rounded-full p-2 md:p-3">
                  <FiBook className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold">Flow Vecka 1</h1>
                  <p className="text-sm md:text-base text-teal-100">Avancerad grund i Functional Foods</p>
                </div>
              </div>
              
              <p className="text-sm md:text-base text-teal-100 mb-4 md:mb-6 leading-relaxed">
                Välkommen till din Flow-resa! Denna vecka introducerar vi avancerade koncept inom functional foods 
                och sätter grunden för optimal näringsoptimering.
              </p>
              
              <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
                <div className="flex items-center gap-1 md:gap-2 text-white/90">
                  <FiClock className="w-3 h-3 md:w-4 md:h-4" />
                  <span>7 dagar</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 text-white/90">
                  <FiUsers className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Expert-nivå</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2 text-white/90">
                  <FiAward className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Avancerade recept</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 text-center">
                <div className="text-lg md:text-xl font-bold">85%</div>
                <div className="text-xs md:text-sm text-teal-100">Slutförd</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation - Signature colors */}
      <div className="mb-4 md:mb-8">
        <div className="bg-[#F3EFE3] rounded-xl md:rounded-2xl shadow-md md:shadow-lg p-1.5 md:p-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative p-3 md:p-4 rounded-lg md:rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r text-white shadow-md md:shadow-lg transform scale-105'
                    : 'bg-white text-[#112A12] hover:bg-[#F3EFE3]'
                } ${activeTab === tab.id ? tab.color : ''}`}
              >
                <tab.icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                  activeTab === tab.id ? 'text-white' : 'text-[#112A12]'
                }`} />
                <span className={`text-xs md:text-sm font-medium ${
                  activeTab === tab.id ? 'text-white' : 'text-[#112A12]'
                }`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 md:space-y-8"
            >
              <WeekSummary />
              <KnowledgeSection />
              <MotivationSection />
              <RecipeHighlights mealPlan={mealPlan} />
            </motion.div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 md:space-y-8"
            >
              <GoalsSection weekNumber={1} />
            </motion.div>
          )}

          {/* Meal Plan Tab */}
          {activeTab === 'mealplan' && (
            <motion.div
              key="mealplan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 md:space-y-8"
            >
              {/* Calendar View */}
              <CalendarView mealPlan={mealPlan} weekNumber={1} />
              
              {/* Recipe Highlights */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Veckans Flow-recept</h3>
                <p className="text-gray-600">Avancerade recept för optimal näringsoptimering och smakupplevelse.</p>
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
              className="space-y-4 md:space-y-8"
            >
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Flow Inköpslista</h3>
                <p className="text-gray-600">Optimerade ingredienser för vecka 1 av ditt Flow-program.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next Week Button - Mobile Optimized */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <Link 
          href="/dashboard/courses/functional-flow/week/2"
          className="group bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 md:gap-3"
        >
          <span>Nästa vecka</span>
          <FiChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}

 
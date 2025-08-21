'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHelpCircle, FiCheck, FiClock, FiLock, FiBookOpen, FiAward } from 'react-icons/fi';
import CourseNavigation from '../../components/CourseNavigation';
import WeekHeroWithVideo from '../../components/WeekHeroWithVideo';
import { flowMealPlans } from '@/app/data/mealPlans';

export default function FunctionalFlowOverview() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [completedDays, setCompletedDays] = useState(0);
  const totalDays = 42; // 6 weeks * 7 days
  
  // Calculate progress percentage
  const progressPercentage = (completedDays / totalDays) * 100;
  
  // Get current week and day based on start date
  const courseStartDate = new Date('2024-08-19');
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - courseStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.min(Math.floor(daysSinceStart / 7) + 1, 6);
  const currentDay = (daysSinceStart % 7) + 1;
  
  // Calculate completed days based on current progress
  useEffect(() => {
    setCompletedDays(Math.max(0, Math.min(daysSinceStart, totalDays)));
  }, [daysSinceStart]);

  const weekStatuses = Array.from({ length: 6 }, (_, i) => {
    const weekNumber = i + 1;
    if (weekNumber < currentWeek) return 'completed';
    if (weekNumber === currentWeek) return 'current';
    return 'locked';
  });

  return (
    <div className="min-h-screen bg-[#F7F1E8]">
      {/* Hero Section with Video */}
      <WeekHeroWithVideo
        weekNumber={0}
        heroImage="/images/blog-placeholder.jpg"
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
        weekTitle="Översikt"
        weekSubtitle="Se din framsteg och planera din vecka"
      />

      {/* Navigation */}
      <CourseNavigation courseType="flow" currentWeek={currentWeek} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-[#112A12] mb-6">Din kursframsteg</h2>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{completedDays} av {totalDays} dagar genomförda</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#014421] to-[#027A48] rounded-full"
              />
            </div>
          </div>

          {/* Week Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weekStatuses.map((status, index) => {
              const weekNumber = index + 1;
              const weekTitle = [
                "Optimera din energi",
                "Avancerad näringsoptimering",
                "Prestationshöjande kost",
                "Antiinflammatorisk livsstil",
                "Longevity & återhämtning",
                "Personlig optimering"
              ][index];

              return (
                <motion.div
                  key={weekNumber}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all cursor-pointer
                    ${status === 'completed' ? 'bg-green-50 border-green-500' : ''}
                    ${status === 'current' ? 'bg-[#F3EFE3] border-[#014421] shadow-lg' : ''}
                    ${status === 'locked' ? 'bg-gray-50 border-gray-300 opacity-60' : ''}
                  `}
                  onClick={() => {
                    if (status !== 'locked') {
                      window.location.href = weekNumber === 1 
                        ? '/dashboard/courses/functional-flow' 
                        : `/dashboard/courses/functional-flow/week/${weekNumber}`;
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">Vecka {weekNumber}</h3>
                    {status === 'completed' && <FiCheck className="w-5 h-5 text-green-600" />}
                    {status === 'current' && <FiClock className="w-5 h-5 text-[#014421]" />}
                    {status === 'locked' && <FiLock className="w-5 h-5 text-gray-400" />}
                  </div>
                  <p className="text-sm text-gray-600">{weekTitle}</p>
                  
                  {status === 'current' && (
                    <div className="mt-3 pt-3 border-t border-[#014421]/20">
                      <p className="text-xs text-[#014421] font-medium">Dag {currentDay} av 7</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <FiBookOpen className="w-12 h-12 text-[#014421] mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">Recept utforskade</h3>
            <p className="text-3xl font-bold text-[#014421]">{completedDays * 3}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <FiClock className="w-12 h-12 text-[#014421] mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">Dagar kvar</h3>
            <p className="text-3xl font-bold text-[#014421]">{totalDays - completedDays}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <FiAward className="w-12 h-12 text-[#014421] mx-auto mb-3" />
            <h3 className="font-semibold text-lg mb-1">Nästa milstolpe</h3>
            <p className="text-xl font-bold text-[#014421]">Vecka {currentWeek} klar</p>
          </motion.div>
        </div>

        {/* Help Button */}
        <motion.button
          onClick={() => setShowHelpModal(true)}
          className="fixed bottom-8 right-8 bg-[#014421] text-white p-4 rounded-full shadow-lg hover:bg-[#027A48] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiHelpCircle className="w-6 h-6" />
        </motion.button>

        {/* Help Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <h3 className="text-xl font-bold text-[#112A12] mb-4">Så navigerar du kursen</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>🎯 <strong>Översikt:</strong> Här ser du din totala framsteg och kan snabbt navigera till olika veckor.</p>
                <p>📅 <strong>Veckonavigering:</strong> Klicka på veckonummer i menyn ovan för att gå direkt till den veckan.</p>
                <p>🍽️ <strong>Dagskort:</strong> Klicka på en dag för att se dagens recept och information.</p>
                <p>🛒 <strong>Inköpslistor:</strong> Hitta veckans inköpslista under varje vecka.</p>
                <p>👥 <strong>Community:</strong> Dela erfarenheter och få stöd från andra kursdeltagare.</p>
                <p>⚙️ <strong>Inställningar:</strong> Anpassa din kursupplevelse efter dina behov.</p>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="mt-6 w-full bg-[#014421] text-white py-3 rounded-full font-medium hover:bg-[#027A48] transition-colors"
              >
                Stäng
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 
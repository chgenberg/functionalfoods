'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHelpCircle, FiCheck, FiClock, FiLock, FiBookOpen, FiAward, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import CourseNavigation from '../../components/CourseNavigation';
import WeekHeroWithVideo from '../../components/WeekHeroWithVideo';
import { flowMealPlans } from '@/app/data/mealPlans';

export default function FunctionalFlowOverview() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  
  useEffect(() => {
    const savedStartDate = localStorage.getItem('flowStartDate');
    if (savedStartDate) {
      const startDate = new Date(savedStartDate);
      setCourseStartDate(startDate);
      
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const calculatedWeek = Math.max(1, Math.min(6, Math.ceil((daysSinceStart + 1) / 7)));
      const calculatedDay = Math.max(1, Math.min(7, ((daysSinceStart % 7) + 1)));
      
      setCurrentWeek(calculatedWeek);
      setCurrentDay(calculatedDay);
    }
  }, []);

  const totalDays = 42; // 6 weeks * 7 days
  const completedDays = Math.max(0, Math.min((currentWeek - 1) * 7 + currentDay - 1, totalDays));
  const progressPercentage = (completedDays / totalDays) * 100;
  const daysRemaining = totalDays - completedDays;

  const weekData = [
    { number: 1, title: "Optimera din energi", subtitle: "Grundläggande energioptimering", recipes: 22 },
    { number: 2, title: "Avancerad näringsoptimering", subtitle: "Fördjupad näringskunskap", recipes: 20 },
    { number: 3, title: "Prestationshöjande kost", subtitle: "Maximera din prestanda", recipes: 21 },
    { number: 4, title: "Antiinflammatorisk livsstil", subtitle: "Minska inflammation", recipes: 19 },
    { number: 5, title: "Longevity & återhämtning", subtitle: "Långsiktig hälsa", recipes: 18 },
    { number: 6, title: "Personlig optimering", subtitle: "Din personliga plan", recipes: 17 }
  ];

  const getWeekStatus = (weekNumber: number) => {
    if (weekNumber < currentWeek) return 'completed';
    if (weekNumber === currentWeek) return 'current';
    return 'locked';
  };

  const getWeekIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheck className="w-6 h-6 text-green-600" />;
      case 'current': return <FiClock className="w-6 h-6 text-blue-600" />;
      default: return <FiLock className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
      {/* Hero Section with Video */}
      <WeekHeroWithVideo
        weekNumber={0}
        heroImage="/Ulrika_portratt/udavidssondesktop.png"
        videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
        weekTitle="Functional Flow - Översikt"
        weekSubtitle="Avancerad näringsoptimering för optimal prestanda"
      />

      {/* Navigation */}
      <CourseNavigation courseType="flow" currentWeek={currentWeek} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Din kursframsteg</h2>
            <p className="text-gray-600">Du har kommit {Math.round(progressPercentage)}% genom kursen</p>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#014421] to-[#116530] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-2xl">
              <FiCalendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{completedDays}</div>
              <div className="text-sm text-gray-600">Dagar genomförda</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-2xl">
              <FiClock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{daysRemaining}</div>
              <div className="text-sm text-gray-600">Dagar kvar</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-2xl">
              <FiBookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{currentWeek}</div>
              <div className="text-sm text-gray-600">Aktuell vecka</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-2xl">
              <FiTrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">117</div>
              <div className="text-sm text-gray-600">Recept totalt</div>
            </div>
          </div>
        </motion.div>

        {/* Weeks Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Kursinnehåll</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weekData.map((week, index) => {
              const status = getWeekStatus(week.number);
              
              return (
                <motion.div
                  key={week.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`
                    relative bg-white rounded-2xl p-6 shadow-lg transition-all duration-300 cursor-pointer h-48
                    ${status === 'completed' 
                      ? 'border-2 border-green-200 hover:shadow-xl' 
                      : status === 'current'
                      ? 'border-2 border-blue-200 hover:shadow-xl scale-105'
                      : status === 'locked'
                      ? 'border-2 border-gray-200 opacity-60'
                      : 'border-2 border-gray-200 hover:shadow-xl'
                    }
                  `}
                  onClick={() => {
                    if (status !== 'locked') {
                      window.location.href = `/dashboard/courses/functional-flow/week/${week.number}`;
                    }
                  }}
                  whileHover={status !== 'locked' ? { y: -5 } : {}}
                >
                  {/* Status Badge */}
                  <div className={`
                    absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center
                    ${status === 'completed' 
                      ? 'bg-green-500' 
                      : status === 'current'
                      ? 'bg-blue-500'
                      : 'bg-gray-400'
                    }
                  `}>
                    {getWeekIcon(status)}
                  </div>

                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-500 mb-1">Vecka {week.number}</div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{week.title}</h4>
                      <p className="text-sm text-gray-600 mb-4">{week.subtitle}</p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <FiBookOpen className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{week.recipes} recept</span>
                      </div>
                      <div className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : status === 'current'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                        }
                      `}>
                        {status === 'completed' ? 'Klar' : status === 'current' ? 'Pågår' : 'Låst'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Next Steps Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Nästa steg</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <FiBookOpen className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Fortsätt kursen</h4>
              <p className="text-gray-600 mb-4">Du är på vecka {currentWeek}, dag {currentDay}</p>
              <button
                onClick={() => window.location.href = `/dashboard/courses/functional-flow/week/${currentWeek}`}
                className="bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
              >
                Gå till vecka {currentWeek}
              </button>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <FiAward className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">Dina framsteg</h4>
              <p className="text-gray-600 mb-4">{Math.round(progressPercentage)}% av kursen genomförd</p>
              <div className="text-2xl font-bold text-blue-600">{completedDays}/{totalDays} dagar</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="text-center">
              <FiHelpCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">Hur navigerar du?</h3>
              <div className="text-left space-y-3 text-sm text-gray-600">
                <p>• <strong>Översikt:</strong> Se din framsteg och kursöversikt</p>
                <p>• <strong>Vecka 1-6:</strong> Klicka för att gå till specifik vecka</p>
                <p>• <strong>Grön vecka:</strong> Din nuvarande vecka</p>
                <p>• <strong>Grå vecka:</strong> Låst tills du når dit</p>
                <p>• <strong>Avslutning:</strong> Slutför kursen när du är klar</p>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
              >
                Förstått!
              </button>
            </div>
          </motion.div>
        </div>
      )}


    </div>
  );
} 
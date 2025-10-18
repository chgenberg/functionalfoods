'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import CourseNavigation from '../../components/CourseNavigation';
import WeekHeroWithVideo from '../../components/WeekHeroWithVideo';
import HelpGuide from '@/app/components/HelpGuide';
import InfoPopupGrid from '../../components/InfoPopupGrid';
import CompleteCourseDownload from '../../components/CompleteCourseDownload';
import { HelpCircle, Check, Clock, Lock, BookOpen, Award, Calendar, TrendingUp, Users, Instagram } from 'lucide-react';

export default function HormoneOverview() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  
  useEffect(() => {
    // Get user email from auth to make localStorage key user-specific
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let userEmail = '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userEmail = payload.email || payload.userId || '';
      } catch {}
    }
    
    const storageKey = userEmail ? `hormoneStartDate_${userEmail}` : 'hormoneStartDate';
    const savedStartDate = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    
    if (savedStartDate) {
      const startDate = new Date(savedStartDate as string);
      setCourseStartDate(startDate);
      
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const calculatedWeek = Math.max(1, Math.min(6, Math.ceil((daysSinceStart + 1) / 7)));
      const calculatedDay = Math.max(1, Math.min(7, ((daysSinceStart % 7) + 1)));
      
      setCurrentWeek(calculatedWeek);
      setCurrentDay(calculatedDay);
    } else {
      // New user - set start date to TODAY
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, today.toISOString());
      }
      setCourseStartDate(today);
      setCurrentWeek(1);
      setCurrentDay(1);
    }
  }, []);

  // Listen for help button clicks
  useEffect(() => {
    const handler = () => {
      setShowHelpModal(true);
    };
    window.addEventListener('open-dashboard-help', handler as EventListener);
    return () => window.removeEventListener('open-dashboard-help', handler as EventListener);
  }, []);

  const weekData = [
    { number: 1, title: "Vecka 1", subtitle: "Introduktion till hormonell balans", recipes: 13 },
    { number: 2, title: "Vecka 2", subtitle: "Fortsättning", recipes: 11 },
    { number: 3, title: "Vecka 3", subtitle: "Fördjupning", recipes: 0 },
    { number: 4, title: "Vecka 4", subtitle: "Vidareutveckling", recipes: 0 },
    { number: 5, title: "Vecka 5", subtitle: "Integration", recipes: 0 },
    { number: 6, title: "Vecka 6", subtitle: "Avslutning", recipes: 0 }
  ];

  const getWeekStatus = (weekNumber: number) => {
    if (weekNumber < currentWeek) return 'completed';
    if (weekNumber === currentWeek) return 'current';
    return 'locked';
  };

  const getWeekIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-6 h-6 text-green-600" />;
      case 'current': return <Clock className="w-6 h-6 text-blue-600" />;
      default: return <Lock className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F7F5F0] via-[#F7F1E8] to-[#F3EFE3]">
      <div className="h-16 md:h-0" />
      <CourseNavigation courseType="hormone" currentWeek={currentWeek} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#014421] mb-4">
                Välkommen till Hormonell Balans
              </h1>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Under dessa 6 veckor får du lära dig om hormoner, näring och hur mat påverkar din hormonella balans.
                </p>
                <p>
                  Du får praktiska kostscheman, recept och inköpslistor för varje vecka.
                </p>
                <p className="font-semibold">
                  Varmt välkommen!
                </p>
                <p className="text-[#014421] font-signature text-xl">
                  /Ulrika
                </p>
              </div>
            </div>
            
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg bg-gray-100">
              {/* Placeholder för introvideo */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <BookOpen className="w-16 h-16" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <InfoPopupGrid courseType="hormone" courseId="hormonell-balans" />
      </div>

      {/* Week Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-[#014421] mb-6">Välj vecka</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weekData.map((week, index) => {
              const status = getWeekStatus(week.number);
              const isLocked = status === 'locked';
              
              return (
                <motion.div
                  key={week.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    onClick={() => !isLocked && (window.location.href = `/dashboard/courses/hormone/week/${week.number}`)}
                    className={`
                      p-6 rounded-2xl border-2 transition-all cursor-pointer
                      ${status === 'current' ? 'border-[#8B5CF6] bg-[#8B5CF6]/5' : ''}
                      ${status === 'completed' ? 'border-green-200 bg-green-50' : ''}
                      ${isLocked ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' : 'hover:shadow-lg'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center
                          ${status === 'current' ? 'bg-[#8B5CF6] text-white' : ''}
                          ${status === 'completed' ? 'bg-green-600 text-white' : ''}
                          ${isLocked ? 'bg-gray-300 text-gray-500' : ''}
                        `}>
                          <span className="font-bold text-lg">{week.number}</span>
                        </div>
                        {getWeekIcon(status)}
                      </div>
                    </div>
                    <h3 className="font-bold text-[#014421] mb-1">{week.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{week.subtitle}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BookOpen className="w-4 h-4" />
                      <span>{week.recipes} recept</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => window.location.href = '/dashboard/courses/hormone'}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Översikt
            </button>
            <button
              onClick={() => window.location.href = `/dashboard/courses/hormone/week/${currentWeek}`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              Gå till vecka {currentWeek}
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/courses/hormone/kostschema'}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              Alla kostscheman
            </button>
          </div>
        </div>
      </div>

      {showHelpModal && (
        <HelpGuide onClose={() => setShowHelpModal(false)} />
      )}
    </main>
  );
}


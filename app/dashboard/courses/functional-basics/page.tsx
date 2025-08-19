'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlay, FiClock, FiCheckCircle, FiBook, FiDownload,
  FiTrendingUp, FiAward, FiStar, FiChevronRight, FiUsers,
  FiShoppingCart, FiCalendar, FiLock, FiArrowRight
} from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

interface WeekDay {
  day: number;
  name: string;
  completed: boolean;
  current: boolean;
  locked: boolean;
}

export default function FunctionalBasicsPage() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    // Calculate current week and day based on start date
    const savedStartDate = localStorage.getItem('basicsStartDate');
    if (savedStartDate) {
      const startDate = new Date(savedStartDate);
      setCourseStartDate(startDate);
      
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      const calculatedWeek = Math.min(6, Math.max(1, Math.ceil((daysDiff + 1) / 7)));
      const calculatedDay = Math.min(7, Math.max(1, (daysDiff % 7) + 1));
      
      setCurrentWeek(calculatedWeek);
      setCurrentDay(calculatedDay);
    } else {
      const today = new Date();
      localStorage.setItem('basicsStartDate', today.toISOString());
      setCourseStartDate(today);
    }
  }, []);

  const weeks = [
    { number: 1, title: "Grunden i Functional Foods", color: "#014421" },
    { number: 2, title: "Proteiner & aminosyror", color: "#112A12" },
    { number: 3, title: "Fetter & kolhydrater", color: "#014421" },
    { number: 4, title: "Vitaminer & mineraler", color: "#112A12" },
    { number: 5, title: "Antioxidanter & fytokemikalier", color: "#014421" },
    { number: 6, title: "Att komma igång", color: "#112A12" }
  ];

  const getDaysForWeek = (weekNumber: number): WeekDay[] => {
    const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    return dayNames.map((name, index) => {
      const dayNumber = index + 1;
      const totalDayNumber = (weekNumber - 1) * 7 + dayNumber;
      const currentTotalDay = (currentWeek - 1) * 7 + currentDay;
      
      return {
        day: dayNumber,
        name,
        completed: totalDayNumber < currentTotalDay,
        current: weekNumber === currentWeek && dayNumber === currentDay,
        locked: totalDayNumber > currentTotalDay
      };
    });
  };

  const formatDate = (weekNumber: number, dayNumber: number) => {
    if (!courseStartDate) return '';
    const date = new Date(courseStartDate);
    date.setDate(date.getDate() + (weekNumber - 1) * 7 + (dayNumber - 1));
    return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Hero Section with Video */}
      <div className="relative h-[300px] md:h-[400px] bg-gradient-to-br from-[#014421] to-[#112A12] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10"></div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Din Functional Foods Resa
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl"
          >
            Välkommen till vecka {currentWeek} - {weeks[currentWeek - 1].title}
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowVideoModal(true)}
            className="bg-white text-[#014421] px-8 py-4 rounded-full font-semibold flex items-center gap-3 hover:scale-105 transition-transform shadow-lg"
          >
            <FiPlay className="w-5 h-5" />
            Se introduktionsvideo
          </motion.button>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F3EFE3] to-transparent"></div>
      </div>

      {/* Week Navigation */}
      <div className="sticky top-0 z-40 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {weeks.map((week) => (
              <motion.button
                key={week.number}
                onClick={() => week.number <= currentWeek && setCurrentWeek(week.number)}
                className={`
                  px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all
                  ${week.number === currentWeek 
                    ? 'bg-[#014421] text-white shadow-lg' 
                    : week.number < currentWeek
                    ? 'bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
                whileHover={week.number <= currentWeek ? { scale: 1.05 } : {}}
                whileTap={week.number <= currentWeek ? { scale: 0.95 } : {}}
              >
                <span className="flex items-center gap-2">
                  {week.number < currentWeek && <FiCheckCircle className="w-4 h-4" />}
                  Vecka {week.number}
                  {week.number > currentWeek && <FiLock className="w-4 h-4" />}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Days Journey */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#014421] mb-6">Din vecka</h2>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {getDaysForWeek(currentWeek).map((day) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: day.day * 0.05 }}
                className={`
                  relative p-6 rounded-2xl transition-all cursor-pointer
                  ${day.current 
                    ? 'bg-gradient-to-br from-[#FFB5A7] to-[#FCD5CE] shadow-xl scale-105' 
                    : day.completed
                    ? 'bg-white hover:shadow-lg'
                    : day.locked
                    ? 'bg-gray-50 opacity-60'
                    : 'bg-white hover:shadow-lg'
                  }
                `}
                onClick={() => !day.locked && (window.location.href = `/dashboard/courses/functional-basics/week/${currentWeek}/day/${day.day}`)}
              >
                {day.current && (
                  <div className="absolute -top-2 -right-2 bg-[#014421] text-white text-xs px-3 py-1 rounded-full">
                    Idag
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center">
                  <span className="text-sm text-gray-600 mb-1">{formatDate(currentWeek, day.day)}</span>
                  <h3 className="font-bold text-lg mb-3">{day.name}</h3>
                  
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-3
                    ${day.completed ? 'bg-green-100' : day.current ? 'bg-white' : 'bg-gray-100'}
                  `}>
                    {day.completed ? (
                      <FiCheckCircle className="w-6 h-6 text-green-600" />
                    ) : day.current ? (
                      <div className="w-3 h-3 bg-[#014421] rounded-full animate-pulse"></div>
                    ) : (
                      <FiLock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  
                  <span className={`
                    text-sm font-medium
                    ${day.completed ? 'text-green-600' : day.current ? 'text-[#014421]' : 'text-gray-400'}
                  `}>
                    {day.completed ? 'Genomförd' : day.current ? 'Påbörjad' : 'Låst'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Link href={`/dashboard/courses/functional-basics/kostschema?view=week&week=${currentWeek}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F3EFE3] rounded-full flex items-center justify-center">
                  <FiCalendar className="w-6 h-6 text-[#014421]" />
                </div>
                <FiArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Veckans kostschema</h3>
              <p className="text-gray-600">Se alla recept och måltider för vecka {currentWeek}</p>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Link href={`/dashboard/courses/functional-basics/inkopslista?week=${currentWeek}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F3EFE3] rounded-full flex items-center justify-center">
                  <FiShoppingCart className="w-6 h-6 text-[#014421]" />
                </div>
                <FiArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Inköpslista</h3>
              <p className="text-gray-600">Allt du behöver för veckans recept</p>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/dashboard/community">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#F3EFE3] rounded-full flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-[#014421]" />
                </div>
                <FiArrowRight className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="font-bold text-lg mb-2">Community</h3>
              <p className="text-gray-600">Dela erfarenheter med andra deltagare</p>
            </Link>
          </motion.div>
        </div>

        {/* Week Materials */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="text-xl font-bold text-[#014421] mb-6">Veckans material</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#F3EFE3] rounded-lg hover:bg-[#E8E0D4] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FiBook className="w-5 h-5 text-[#014421]" />
                <span className="font-medium">Vecka {currentWeek} - Arbetsbok (PDF)</span>
              </div>
              <FiDownload className="w-5 h-5 text-[#014421]" />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#F3EFE3] rounded-lg hover:bg-[#E8E0D4] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FiBook className="w-5 h-5 text-[#014421]" />
                <span className="font-medium">Receptsamling vecka {currentWeek}</span>
              </div>
              <FiDownload className="w-5 h-5 text-[#014421]" />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#F3EFE3] rounded-lg hover:bg-[#E8E0D4] transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <FiBook className="w-5 h-5 text-[#014421]" />
                <span className="font-medium">Bonusmaterial - Extra recept</span>
              </div>
              <FiDownload className="w-5 h-5 text-[#014421]" />
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {showVideoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-black rounded-2xl overflow-hidden max-w-4xl w-full aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src="https://player.vimeo.com/video/1021859875?badge=0&autopause=0&player_id=0&app_id=58479"
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Functional Basics Intro"
              />
              <button
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
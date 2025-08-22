'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHelpCircle, FiCheck, FiClock, FiLock, FiBookOpen, FiAward, FiCalendar, FiTrendingUp, FiUsers, FiInstagram } from 'react-icons/fi';
import CourseNavigation from '../../components/CourseNavigation';
import WeekHeroWithVideo from '../../components/WeekHeroWithVideo';
import { mealPlans } from '@/app/data/mealPlans';

export default function FunctionalBasicsOverview() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  
  useEffect(() => {
    const savedStartDate = localStorage.getItem('basicsStartDate');
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
    { number: 1, title: "Grunden i Functional Foods", subtitle: "Lär dig grunderna", recipes: 21 },
    { number: 2, title: "Proteiner & aminosyror", subtitle: "Fördjupa dig i proteiner", recipes: 18 },
    { number: 3, title: "Fetter & kolhydrater", subtitle: "Lär dig om fetter", recipes: 19 },
    { number: 4, title: "Vitaminer & mineraler", subtitle: "Upptäck vitaminer", recipes: 17 },
    { number: 5, title: "Antioxidanter & fytokemikalier", subtitle: "Utforska antioxidanter", recipes: 20 },
    { number: 6, title: "Att komma igång", subtitle: "Implementera allt", recipes: 16 }
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
        weekTitle="Functional Basics - Översikt"
        weekSubtitle="Din personliga resa mot optimal hälsa"
      />

      {/* Navigation */}
      <CourseNavigation courseType="basics" currentWeek={currentWeek} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Coaching Button at Top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.button
            onClick={() => setShowCoachingModal(true)}
            className="bg-[#014421] text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiUsers className="w-5 h-5" />
            COACHNING OCH FUNCTIONAL FOODS - KLICKA HÄR
          </motion.button>
        </motion.div>
        
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
              <div className="text-2xl font-bold text-gray-900">111</div>
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
                      window.location.href = `/dashboard/courses/functional-basics/week/${week.number}`;
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
                onClick={() => window.location.href = `/dashboard/courses/functional-basics/week/${currentWeek}`}
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

      {/* Coaching Modal */}
      {showCoachingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">COACHNING OCH FUNCTIONAL FOODS PÅ SOCIALA MEDIER</h2>
              <button
                onClick={() => setShowCoachingModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 text-gray-700">
              <p>
                För att du ska få en så värdefull och lärorik tid i din kurs som möjligt så erbjuder vi coachning via vår plattform Mighty. 
                När du laddar ned appen Mighty Network kan du hålla kontakt med oss coacher som finns tillgängliga för att svara på dina frågor. 
                Följ den länk som du fick i ditt bekräftelsemejl när du köpte kursen för att gå med i vår community via appen Mighty Network.
              </p>
              
              <p>
                Du kan alltid kontakta oss via vår kundsupport: <a href="mailto:info@functionalfoods.se" className="text-[#014421] font-medium hover:underline">info@functionalfoods.se</a>
              </p>
              
              <p className="font-medium">
                Vill du följa vad som händer kring Functional Foods och ta del av tips, recept, nyheter, erbjudanden och vår härliga gemenskap så häng med oss här →
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <a
                  href="https://functional-foods-with-ulrika.mn.co/sign_up?auto_join=true&from=https%3A%2F%2Ffunctional-foods-with-ulrika.mn.co%2F%3Fautojoin%3D1&space_id=17961010"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-[#014421] text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <FiUsers className="w-6 h-6" />
                  <div>
                    <div className="font-bold">MIGHTY NETWORKS</div>
                    <div className="text-sm opacity-90">Gå med i vår community</div>
                  </div>
                </a>
                
                <a
                  href="https://www.instagram.com/functionalfoods.se/?hl=sv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-[#F4B4C3] text-[#014421] rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <FiInstagram className="w-6 h-6" />
                  <div>
                    <div className="font-bold">INSTAGRAM</div>
                    <div className="text-sm opacity-90">@functionalfoods.se</div>
                  </div>
                </a>
              </div>
            </div>
            
            <button
              onClick={() => setShowCoachingModal(false)}
              className="mt-8 w-full bg-[#014421] text-white px-6 py-3 rounded-full font-bold hover:bg-[#116530] transition-colors"
            >
              Stäng
            </button>
          </motion.div>
        </div>
      )}


    </div>
  );
} 
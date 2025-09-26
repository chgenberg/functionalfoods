'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import CourseNavigation from '../../components/CourseNavigation';
import WeekHeroWithVideo from '../../components/WeekHeroWithVideo';
import HelpGuide from '@/app/components/HelpGuide';
import InfoPopupGrid from '../../components/InfoPopupGrid';
import CompleteCourseDownload from '../../components/CompleteCourseDownload';
import { mealPlans } from '@/app/data/mealPlans';
import { HelpCircle, Check, Clock, Lock, BookOpen, Award, Calendar, TrendingUp, Users, Instagram } from 'lucide-react';

export default function FunctionalBasicsOverview() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  
  useEffect(() => {
    const savedStartDate = typeof window !== 'undefined' ? localStorage.getItem('basicsStartDate') : null;
    if (savedStartDate) {
      const startDate = new Date(savedStartDate as string);
      setCourseStartDate(startDate);
      
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const calculatedWeek = Math.max(1, Math.min(6, Math.ceil((daysSinceStart + 1) / 7)));
      const calculatedDay = Math.max(1, Math.min(7, ((daysSinceStart % 7) + 1)));
      
      setCurrentWeek(calculatedWeek);
      setCurrentDay(calculatedDay);
    }
  }, []);

  // Listen for help button clicks
  useEffect(() => {
    const handler = () => {
      console.log('Dashboard help event received in Overview!');
      setShowHelpModal(true);
    };
    window.addEventListener('open-dashboard-help', handler as EventListener);
    return () => window.removeEventListener('open-dashboard-help', handler as EventListener);
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
      case 'completed': return <Check className="w-6 h-6 text-green-600" />;
      case 'current': return <Clock className="w-6 h-6 text-blue-600" />;
      default: return <Lock className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
      {/* Top spacer to avoid header overlap */}
      <div className="h-16 md:h-0" />
      {/* Navigation */}
      <CourseNavigation courseType="basics" currentWeek={currentWeek} />

      {/* Welcome Video Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#014421] mb-4">
                Välkommen till Functional Basics
              </h1>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Nu har du en spännande resa framför dig under dessa 6 veckor med näringsrika och hälsobringade recept och du kommer att få lära dig grunderna i Functional Foods. Du får praktiska kostscheman att följa, recept för alla måltider och inköpslistor för varje vecka.
                </p>
                <p>
                  Efter dessa 6 veckor har du dels lärt dig mycket om matlagning och hur du får in alla näringsämnen i din kost samt fördelarna som kommer: ökad näringsnivå, förbättrad matsmältning, bättre hjärthälsa, minskad inflammation i kroppen, ökade energinivåer och ett bättre immunförsvar.
                </p>
                <p>
                  Du kommer att tacka dig själv, även om det kan finnas dagar när det känns tufft. Mitt bästa tips är planering! Förbered dig för veckan och laga gärna upp flera maträtter på samma gång så att du är väl förberedd.
                </p>
                <p className="font-semibold">
                  Varmt välkommen till framtidens kost för en god hälsa och ett friskare liv!
                </p>
                <p className="text-[#014421] font-signature text-xl">
                  /Ulrika
                </p>
              </div>
            </div>
            
            {/* Video */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://player.vimeo.com/video/1058943393"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Välkommen till Functional Basics"
              />
            </div>
          </div>
          
          {/* Course Help Section */}
          <div className="mt-8 text-center">
            <motion.button
              onClick={() => setShowHelpModal(true)}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#014421] to-[#116530] text-white rounded-full font-medium shadow-lg hover:shadow-xl transform transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Animated background glow */}
              <motion.div
                className="absolute inset-0 rounded-full bg-[#93C560] opacity-0 group-hover:opacity-20 blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Icon with rotation on hover */}
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <HelpCircle className="w-6 h-6" />
              </motion.div>
              
              <span className="relative z-10 text-lg">Så använder du kursen</span>
              
              {/* Arrow animation */}
              <motion.svg 
                className="w-5 h-5 ml-1"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        
        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-[#014421] mb-2">Din kursframsteg</h2>
            <p className="text-gray-600">Du har kommit {Math.round(progressPercentage)}% genom kursen</p>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#93C560] to-[#7BA94D] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-[#93C560]/10 rounded-2xl border border-[#93C560]/20">
              <Calendar className="w-8 h-8 text-[#93C560] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#014421]">{completedDays}</div>
              <div className="text-sm text-gray-600">Dagar genomförda</div>
            </div>
            <div className="text-center p-4 bg-[#6B8DD6]/10 rounded-2xl border border-[#6B8DD6]/20">
              <Clock className="w-8 h-8 text-[#6B8DD6] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#014421]">{daysRemaining}</div>
              <div className="text-sm text-gray-600">Dagar kvar</div>
            </div>
            <div className="text-center p-4 bg-[#F0B45A]/10 rounded-2xl border border-[#F0B45A]/20">
              <BookOpen className="w-8 h-8 text-[#F0B45A] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#014421]">{currentWeek}</div>
              <div className="text-sm text-gray-600">Aktuell vecka</div>
            </div>
            <div className="text-center p-4 bg-[#E07A5F]/10 rounded-2xl border border-[#E07A5F]/20">
              <TrendingUp className="w-8 h-8 text-[#E07A5F] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[#014421]">111</div>
              <div className="text-sm text-gray-600">Recept totalt</div>
            </div>
          </div>
        </motion.div>

        {/* Coaching Button after Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
            <Users className="w-5 h-5" />
            COACHNING OCH FUNCTIONAL FOODS - KLICKA HÄR
          </motion.button>
        </motion.div>

        {/* Info Popup Grid */}
        <InfoPopupGrid courseType="basics" courseId="functional-basics" />

        {/* Course Downloads */}
        <div className="grid grid-cols-1 gap-6">
          <CompleteCourseDownload courseType="basics" />
        </div>

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
              <BookOpen className="w-12 h-12 text-green-600 mx-auto mb-4" />
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
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
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
              <HelpCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
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
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-8"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 pr-4">COACHNING OCH FUNCTIONAL FOODS PÅ SOCIALA MEDIER</h2>
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
                För att du ska få en så värdefull och lärorik tid i din kurs som möjligt så erbjuder vi coachning via vår Facebook-grupp. 
                I vår community kan du hålla kontakt med oss coacher som finns tillgängliga för att svara på dina frågor. 
                Klicka på knappen nedan för att gå med i vår Facebook-grupp och bli en del av vår växande community.
              </p>
              
              <p>
                Du kan alltid kontakta oss via vår kundsupport: <a href="mailto:info@functionalfoods.se" className="text-[#014421] font-medium hover:underline">info@functionalfoods.se</a>
              </p>
              
              <p className="font-medium">
                Vill du följa vad som händer kring Functional Foods och ta del av tips, recept, nyheter, erbjudanden och vår härliga gemenskap så häng med oss här →
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <a
                  href="/dashboard/community"
                  className="flex items-center gap-3 p-4 bg-[#014421] text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Users className="w-6 h-6" />
                  <div>
                    <div className="font-bold">COMMUNITY</div>
                    <div className="text-sm opacity-90">Gå med i vår grupp</div>
                  </div>
                </a>
                
                <a
                  href="https://www.instagram.com/functionalfoods.se/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-[#F4B4C3] text-[#014421] rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <Instagram className="w-6 h-6" />
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

      {/* Help Guide Modal */}
      <HelpGuide 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />

    </div>
  );
} 
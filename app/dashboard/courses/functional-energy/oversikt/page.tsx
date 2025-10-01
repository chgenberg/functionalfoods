'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import CourseNavigation from '../../components/CourseNavigation';
import WeekHeroWithVideo from '../../components/WeekHeroWithVideo';
import HelpGuide from '@/app/components/HelpGuide';
import InfoPopupGrid from '../../components/InfoPopupGrid';
import CompleteCourseDownload from '../../components/CompleteCourseDownload';
import { energyMealPlans } from '@/app/data/mealPlans';
import { HelpCircle, Check, Clock, Lock, BookOpen, Award, Calendar, TrendingUp, Users, Instagram } from 'lucide-react';

export default function FunctionalEnergyOverview() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  
  useEffect(() => {
    const savedStartDate = typeof window !== 'undefined' ? localStorage.getItem('energyStartDate') : null;
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
      console.log('Dashboard help event received in Energy Overview!');
      setShowHelpModal(true);
    };
    window.addEventListener('open-dashboard-help', handler as EventListener);
    return () => window.removeEventListener('open-dashboard-help', handler as EventListener);
  }, []);

  // Listen for help button clicks
  useEffect(() => {
    const handler = () => {
      console.log('Dashboard help event received in Energy Overview!');
      setShowHelpModal(true);
    };
    window.addEventListener('dashboard-help-click', handler as EventListener);
    return () => window.removeEventListener('dashboard-help-click', handler as EventListener);
  }, []);

  const totalDays = 42; // 6 weeks * 7 days
  const completedDays = courseStartDate ? Math.min(
    Math.floor((new Date().getTime() - courseStartDate.getTime()) / (1000 * 60 * 60 * 24)),
    totalDays
  ) : 0;
  const progressPercentage = Math.round((completedDays / totalDays) * 100);
  const daysRemaining = Math.max(0, totalDays - completedDays);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F7F5F0] via-[#F7F1E8] to-[#F3EFE3]">
      {/* Top spacer to avoid header overlap */}
      <div className="h-16 md:h-0" />
      {/* Navigation */}
      <CourseNavigation courseType="energy" currentWeek={currentWeek} />

      {/* Welcome Video Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#014421] mb-4">
                Välkommen till Functional Insulin balance/Energy
              </h1>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Nu har du en viktig och spännande resa framför dig under 6 veckor med näringsrika recept och grunderna i Functional Foods, särskilt utformade för att stödja din hälsa och hjälpa dig att hantera typ 2-diabetes eller prediabetes. Du kommer att få praktiska kostscheman, recept för alla måltider och inköpslistor varje vecka.
                </p>
                <p>
                  Under dessa veckor kommer du att lära dig hur en näringsrik kost kan bidra till att stabilisera ditt blodsocker, minska inflammation och öka din energi. Genom att följa denna kostplan och förstå hur maten påverkar din kropp, kan du förbättra både ditt blodsocker och ditt allmänna välbefinnande.
                </p>
                <p>
                  Mitt bästa tips är planering – laga gärna flera maträtter i förväg så att du är väl förberedd och kan hålla dig till din nya, hälsosamma livsstil.
                </p>
                <p>
                  Varmt välkommen till en livsstil som kan förbättra din hälsa och hjälpa dig att kontrollera blodsockret för ett friskare liv!
                </p>
                <p className="text-[#014421] font-signature text-xl">
                  /Ulrika
                </p>
              </div>
            </div>
            
            {/* Video */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://player.vimeo.com/video/1099287748"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Välkommen till Functional Energy"
              />
            </div>
          </div>
          
          {/* Course Help Section + Facebook Group */}
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <motion.button
              onClick={() => setShowHelpModal(true)}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#014421] to-[#116530] text-white rounded-full font-medium shadow-lg hover:shadow-xl transform transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-[#93C560] opacity-0 group-hover:opacity-20 blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                <HelpCircle className="w-6 h-6" />
              </motion.div>
              <span className="relative z-10 text-lg">Så använder du kursen</span>
              <motion.svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={{ x: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </motion.svg>
            </motion.button>

            <a
              href="https://www.facebook.com/groups/1168295381877412/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-[#1877F2] text-white font-medium shadow-lg hover:shadow-xl transition-all hover:bg-[#166FE1]"
              aria-label="Gå med i Facebook-gruppen"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.19 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.75 8.44-4.92 8.44-9.94Z" />
              </svg>
              Facebook‑grupp
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
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
              <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{completedDays}</div>
              <div className="text-sm text-gray-600">Dagar genomförda</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-2xl">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{daysRemaining}</div>
              <div className="text-sm text-gray-600">Dagar kvar</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-2xl">
              <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{currentWeek}</div>
              <div className="text-sm text-gray-600">Aktuell vecka</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-2xl">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">85</div>
              <div className="text-sm text-gray-600">Recept totalt</div>
            </div>
          </div>

        </motion.div>

        {/* Info Popup Grid */}
        <InfoPopupGrid courseType="energy" courseId="functional-energy" />

        {/* Course Downloads */}
        <div className="grid grid-cols-1 gap-6">
          <CompleteCourseDownload courseType="energy" />
        </div>

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
                <p>• <strong>Inköpslista:</strong> Veckans alla ingredienser</p>
                <p>• <strong>Kostschema:</strong> Dina dagliga måltider</p>
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

      {/* Bottom navigation for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 md:hidden z-20">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => window.location.href = '/dashboard/courses/functional-energy'}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#014421]"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Översikt</span>
          </button>
          <button
            onClick={() => window.location.href = `/dashboard/courses/functional-energy/week/${currentWeek}`}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#014421]"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Vecka {currentWeek}</span>
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/courses/functional-energy/kostschema'}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#014421]"
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Kostschema</span>
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/courses/functional-energy/material'}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#014421]"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Material</span>
          </button>
        </div>
      </div>
    </main>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { HelpCircle, Calendar, Book, ShoppingCart, Users, ChevronRight, Play, CheckCircle, BookOpen, Instagram } from 'lucide-react';
import HelpGuide from '@/app/components/HelpGuide';
import CourseNavigation from '../../components/CourseNavigation';
import InfoPopupGrid from '../../components/InfoPopupGrid';

export default function ProvaPaVeckaOverview() {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    // Save this course as the last visited for navigation persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastVisitedCourse', 'prova-pa-vecka');
    }

    // Get user email from auth to make localStorage key user-specific
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let userEmail = '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userEmail = payload.email || payload.userId || '';
      } catch {}
    }

    const storageKey = userEmail ? `provaPaVeckaStartDate_${userEmail}` : 'provaPaVeckaStartDate';
    const savedStartDate = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

    if (savedStartDate) {
      const startDate = new Date(savedStartDate as string);
      setCourseStartDate(startDate);

      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const calculatedDay = Math.max(1, Math.min(7, daysSinceStart + 1));

      setCurrentDay(calculatedDay);
    } else {
      // New user - set start date to TODAY
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, today.toISOString());
      }
      setCourseStartDate(today);
      setCurrentDay(1);
    }
  }, []);


  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F7F5F0] via-[#F7F1E8] to-[#F3EFE3]">
      {/* Top spacer to avoid header overlap */}
      <div className="h-16 md:h-0" />
      
      {/* Navigation - Same style as other courses */}
      <CourseNavigation courseType="prova-pa-vecka" currentWeek={1} />

      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#014421] mb-4">
                Välkommen till Prova på-veckan! 🌿
              </h1>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Den här veckan får du en inspirerande introduktion till Functional Foods – genom ett noga utvalt urval av recept som ger dig en stabil och näringsrik start. Här får du grunderna för hur du enkelt kommer igång med mat som gör verklig skillnad för både kropp och energi.
                </p>
                <p>
                  I alla Ulrikas kurser ligger fokus på Functional Foods – mat som stöttar både kropp och själ. Vi är övertygade om att du kommer att känna skillnad redan under denna vecka.
                </p>
                <p>
                  Eftersom planering är en av nycklarna till bättre hälsa och jämn energi har vi gjort det enkelt för dig. Du får ett färdigt kostschema, smakrika och lättlagade recept samt en praktisk inköpslista.
                </p>
                <p className="font-semibold text-[#014421]">
                  Vi hoppas att denna vecka ska inspirera dig till nya vanor!
                </p>
                <p className="text-[#014421] font-signature text-xl">
                  /Ulrika
                </p>
              </div>
            </div>

            {/* Video */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src="https://player.vimeo.com/video/1156756899"
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Välkommen till Prova på-veckan"
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
              href="https://www.facebook.com/groups/provapavecka/"
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
        {/* Info Popup Grid - Same as other courses */}
        <div className="relative z-10">
          <InfoPopupGrid courseType="prova-pa-vecka" courseId="prova-pa-vecka" />
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
                <p>• <strong>Översikt:</strong> Din kursöversikt och välkomstmeddelande</p>
                <p>• <strong>Vecka 1:</strong> Gå till veckans innehåll</p>
                <p>• <strong>Kostschema:</strong> Se alla dina dagliga måltider</p>
                <p>• <strong>Inköpslista:</strong> Veckans ingredienser</p>
                <p>• <strong>Material:</strong> Kunskapsdokument och läsning</p>
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

      {/* Help Guide Modal */}
      <HelpGuide 
        isOpen={showHelpModal} 
        onClose={() => setShowHelpModal(false)} 
      />

      {/* Bottom navigation for mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 md:hidden z-20">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => window.location.href = '/dashboard/courses/prova-pa-vecka'}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#014421]"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs">Översikt</span>
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/courses/prova-pa-vecka/kostschema'}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#014421]"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Kostschema</span>
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/courses/prova-pa-vecka/inkopslista'}
            className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#014421]"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs">Inköpslista</span>
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/courses/prova-pa-vecka/material'}
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

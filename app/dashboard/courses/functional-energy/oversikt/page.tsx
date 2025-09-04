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
    const savedStartDate = localStorage.getItem('energyStartDate');
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
      {/* Navigation */}
      <CourseNavigation courseType="energy" currentWeek={currentWeek} />

      {/* Welcome Video Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Text Content */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#014421] mb-4">
                Välkommen till Functional Energy
              </h1>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="text-gray-500 italic">
                  [Texten kommer snart - inväntar innehåll från Ulrika]
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

        {/* Complete Course Download */}
        <CompleteCourseDownload courseType="energy" />

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
                onClick={() => window.location.href = `/dashboard/courses/functional-energy/week/${currentWeek}`}
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

        {/* Info Popup Grid */}
        <InfoPopupGrid courseType="energy" />
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
                className="mt-6 bg-[#014421] text-white px-6 py-2 rounded-full hover:bg-[#116530] transition-colors"
              >
                Stäng
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
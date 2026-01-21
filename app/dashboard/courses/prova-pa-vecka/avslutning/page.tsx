'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Award, Star, ChevronRight, Heart, Sparkles, Gift, ArrowRight } from 'lucide-react';
import CourseNavigation from '../../components/CourseNavigation';

export default function ProvaPaVeckaAvslutning() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastVisitedCourse', 'prova-pa-vecka');
    }
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F7F5F0] via-[#F7F1E8] to-[#F3EFE3]">
      {/* Top spacer */}
      <div className="h-16 md:h-0" />

      {/* Navigation */}
      <CourseNavigation courseType="prova-pa-vecka" currentWeek={1} />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Celebration Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 bg-gradient-to-br from-[#93C560] to-[#014421] rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Award className="w-12 h-12 text-white" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#014421] mb-4">
            Grattis till din prova på-vecka! 🎉
          </h1>
          
          <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
            Du har slutfört en hel vecka med Functional Foods! Vi hoppas att du har känt skillnad 
            och blivit inspirerad att fortsätta din resa mot bättre hälsa.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-[#93C560]/20 text-[#014421] px-4 py-2 rounded-full">
              <Star className="w-5 h-5" />
              <span className="font-medium">7 dagar avklarade</span>
            </div>
            <div className="flex items-center gap-2 bg-[#93C560]/20 text-[#014421] px-4 py-2 rounded-full">
              <Heart className="w-5 h-5" />
              <span className="font-medium">21+ recept</span>
            </div>
          </div>
        </motion.div>

        {/* What's Next Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#014421] rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#014421]">Vad händer nu?</h2>
          </div>

          <p className="text-gray-600 mb-6">
            Nu när du har fått smak på Functional Foods finns det ännu mer att upptäcka! 
            Våra kompletta kurser ger dig djupare kunskap, fler recept och långsiktigt stöd 
            för att verkligen förändra din hälsa.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/utbildning/functional-basics"
              className="bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3] rounded-2xl p-6 hover:shadow-lg transition-all group"
            >
              <h3 className="font-bold text-[#014421] mb-2 flex items-center gap-2">
                Functional Basics
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-sm text-gray-600">
                Lär dig grunderna i functional foods under 6 veckor med komplett stöd.
              </p>
            </Link>

            <Link
              href="/utbildning/functional-energy"
              className="bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3] rounded-2xl p-6 hover:shadow-lg transition-all group"
            >
              <h3 className="font-bold text-[#014421] mb-2 flex items-center gap-2">
                Functional Energy
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-sm text-gray-600">
                Fokus på blodsocker och stabil energi genom hela dagen.
              </p>
            </Link>

            <Link
              href="/utbildning/functional-flow"
              className="bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3] rounded-2xl p-6 hover:shadow-lg transition-all group"
            >
              <h3 className="font-bold text-[#014421] mb-2 flex items-center gap-2">
                Functional Flow
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-sm text-gray-600">
                Optimera din tarmhälsa och upptäck kopplingen till välmående.
              </p>
            </Link>

            <Link
              href="/utbildning/hormonell-balans"
              className="bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3] rounded-2xl p-6 hover:shadow-lg transition-all group"
            >
              <h3 className="font-bold text-[#014421] mb-2 flex items-center gap-2">
                Hormonell Balans
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </h3>
              <p className="text-sm text-gray-600">
                Stötta dina hormoner med rätt mat och livsstilsvanor.
              </p>
            </Link>
          </div>
        </motion.div>

        {/* Special Offer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#014421] to-[#116530] rounded-3xl shadow-xl p-8 md:p-12 text-white text-center"
        >
          <Gift className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Tack för att du testade prova på-veckan!
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Vi hoppas att du har fått en bra start och känner dig inspirerad. 
            Har du frågor eller vill veta mer? Tveka inte att höra av dig!
          </p>
          <Link
            href="/utbildning"
            className="inline-flex items-center gap-2 bg-white text-[#014421] px-8 py-4 rounded-full font-bold hover:bg-[#93C560] transition-colors"
          >
            Se alla våra kurser
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}

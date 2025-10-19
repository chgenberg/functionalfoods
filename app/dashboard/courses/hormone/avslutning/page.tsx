'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Award, Heart, Star, TrendingUp, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import CourseNavigation from '../../components/CourseNavigation';

export default function HormoneAvslutningPage() {
  const [showCelebration, setShowCelebration] = useState(true);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F7F5F0] via-[#F7F1E8] to-[#F3EFE3]">
      <div className="h-16 md:h-0" />
      <CourseNavigation courseType="hormone" currentWeek={6} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showCelebration && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="inline-block mb-6"
            >
              <Award className="w-24 h-24 text-[#8B5CF6] mx-auto" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#014421] mb-4">
              Grattis! Du har genomfört kursen! 🎉
            </h1>
            <p className="text-xl text-gray-600">
              6 veckor av transformation och lärande
            </p>
          </motion.div>
        )}

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#014421] mb-6">Din resa med Hormonell Balans</h2>
          
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Under dessa 6 veckor har du lärt dig om hormonell balans, functional foods och hur mat påverkar din hälsa.
            </p>
            <p>
              Du har nu kunskapen och verktygen för att fortsätta din hälsoresa på egen hand.
            </p>
            <p className="font-semibold text-[#014421]">
              Tack för att du var med på denna resa!
            </p>
            <p className="text-[#014421] font-signature text-2xl">
              /Ulrika
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-[#8B5CF6]/10 to-white rounded-2xl p-6 border border-[#8B5CF6]/20"
          >
            <CheckCircle className="w-12 h-12 text-[#8B5CF6] mb-4" />
            <h3 className="text-xl font-bold text-[#014421] mb-2">Vad har du lärt dig?</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <Star className="w-5 h-5 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                <span>Hur hormoner påverkas av mat</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-5 h-5 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                <span>Functional foods för hormonell balans</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-5 h-5 text-[#8B5CF6] mt-0.5 flex-shrink-0" />
                <span>Praktisk matplanering</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border border-green-200"
          >
            <Heart className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-bold text-[#014421] mb-2">Fortsätt din resa</h3>
            <p className="text-gray-700 mb-4">
              Utforska fler kurser och fördjupa din kunskap om functional foods
            </p>
            <Link
              href="/utbildning"
              className="inline-flex items-center gap-2 text-[#014421] font-semibold hover:text-[#116530] transition-colors"
            >
              Se fler kurser
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-[#014421] mb-6">Nästa steg</h2>
          <div className="space-y-4">
            <Link
              href="/dashboard/courses/hormone/oversikt"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-[#014421]">Tillbaka till kursöversikt</span>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
            <Link
              href="/utbildning"
              className="flex items-center justify-between p-4 bg-[#8B5CF6]/10 rounded-xl hover:bg-[#8B5CF6]/20 transition-colors"
            >
              <span className="font-medium text-[#014421]">Utforska fler kurser</span>
              <ArrowRight className="w-5 h-5 text-[#8B5CF6]" />
            </Link>
            <Link
              href="/mina-kurser"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <span className="font-medium text-[#014421]">Mina kurser</span>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}


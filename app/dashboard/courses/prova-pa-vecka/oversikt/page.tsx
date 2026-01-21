'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { HelpCircle, Calendar, Book, ShoppingCart, Users, ChevronRight, Play, CheckCircle } from 'lucide-react';
import HelpGuide from '@/app/components/HelpGuide';

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

  const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

  const quickLinks = [
    {
      title: 'Veckans kostschema',
      description: 'Se alla måltider för veckan',
      href: '/dashboard/courses/prova-pa-vecka/kostschema',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      title: 'Inköpslista',
      description: 'Ladda ner veckans inköpslista',
      href: '/dashboard/courses/prova-pa-vecka/inkopslista',
      icon: ShoppingCart,
      color: 'bg-green-500'
    },
    {
      title: 'Kunskapsdokument',
      description: 'Lär dig grunderna i functional foods',
      href: '/dashboard/courses/prova-pa-vecka/material',
      icon: Book,
      color: 'bg-purple-500'
    }
  ];

  const knowledgeDocs = [
    {
      title: 'Vad är functional foods?',
      slug: 'vad-a-r-functional-foods',
      readTime: '5 min'
    },
    {
      title: 'Topplista med functional foods',
      slug: 'topplista-med-functional-foods',
      readTime: '4 min'
    },
    {
      title: 'Att äta ute med functional foods',
      slug: 'att-a-ta-ute-med-functional-foods',
      readTime: '3 min'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
      {/* Top spacer to avoid header overlap */}
      <div className="h-16 md:h-0" />

      {/* Simple Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/mina-kurser" className="text-gray-500 hover:text-gray-700">
                ← Mina kurser
              </Link>
              <span className="text-[#014421] font-bold">Prova på-veckan</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Dag {currentDay} av 7</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#014421] rounded-full transition-all duration-500"
                  style={{ width: `${(currentDay / 7) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

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

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <motion.button
              onClick={() => setShowHelpModal(true)}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#014421] to-[#116530] text-white rounded-full font-medium shadow-lg hover:shadow-xl transform transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HelpCircle className="w-6 h-6" />
              <span>Så använder du kursen</span>
            </motion.button>

            <a
              href="https://www.facebook.com/groups/provapavecka/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-[#1877F2] text-white font-medium shadow-lg hover:shadow-xl transition-all hover:bg-[#166FE1]"
            >
              <Users className="w-5 h-5" />
              Facebook-community
            </a>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <h2 className="text-2xl font-bold text-[#014421] mb-6">Snabblänkar</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quickLinks.map((link, index) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={link.href}
                className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center mb-4`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{link.title}</h3>
                <p className="text-gray-600 text-sm">{link.description}</p>
                <div className="mt-4 flex items-center text-[#014421] font-medium">
                  Öppna <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Knowledge Documents */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <h2 className="text-2xl font-bold text-[#014421] mb-6">Veckans läsning</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {knowledgeDocs.map((doc, index) => (
            <motion.div
              key={doc.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link
                href={`/dashboard/courses/prova-pa-vecka/knowledge/${doc.slug}`}
                className="block bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#014421]/10 rounded-lg flex items-center justify-center">
                    <Book className="w-5 h-5 text-[#014421]" />
                  </div>
                  <span className="text-sm text-gray-500">{doc.readTime} läsning</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{doc.title}</h3>
                <div className="mt-4 flex items-center text-[#014421] font-medium">
                  Läs mer <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Day Progress */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <h2 className="text-2xl font-bold text-[#014421] mb-6">Veckans dagar</h2>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {dayNames.map((day, index) => {
              const dayNumber = index + 1;
              const isCompleted = dayNumber < currentDay;
              const isCurrent = dayNumber === currentDay;

              return (
                <div
                  key={day}
                  className={`text-center p-3 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-[#014421] text-white shadow-lg'
                      : isCompleted
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <div className="text-xs md:text-sm font-medium mb-1">
                    {day.slice(0, 3)}
                  </div>
                  <div className="text-lg md:text-xl font-bold">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 mx-auto" />
                    ) : (
                      dayNumber
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <HelpGuide isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
    </div>
  );
}

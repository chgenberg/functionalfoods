'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiCalendar, FiCheckCircle, FiClock, FiDownload,
  FiAward, FiTrendingUp, FiBook, FiUsers,
  FiPlay, FiLock, FiUnlock, FiStar
} from 'react-icons/fi';
import { 
  GiFruitBowl, GiMeal, GiHealthNormal, GiMeat
} from 'react-icons/gi';

interface WeekProgress {
  week: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  completedLessons: number;
  totalLessons: number;
  icon: React.ElementType;
}

export default function FunctionalBasicsOverview() {
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    // Load progress from localStorage
    const saved = localStorage.getItem('functionalBasicsProgress');
    if (saved) {
      const progress = JSON.parse(saved);
      setCompletedWeeks(progress.completedWeeks || []);
      setCurrentWeek(progress.currentWeek || 1);
    }
  }, []);

  const weekProgress: WeekProgress[] = [
    {
      week: 1,
      title: 'Introduktion',
      description: 'Lär dig grunderna i Functional Foods',
      status: completedWeeks.includes(1) ? 'completed' : currentWeek === 1 ? 'current' : 'locked',
      completedLessons: completedWeeks.includes(1) ? 7 : currentWeek === 1 ? 3 : 0,
      totalLessons: 7,
      icon: GiFruitBowl
    },
    {
      week: 2,
      title: 'Bygga vanor',
      description: 'Etablera hälsosamma matvanor',
      status: completedWeeks.includes(2) ? 'completed' : currentWeek === 2 ? 'current' : 'locked',
      completedLessons: completedWeeks.includes(2) ? 7 : currentWeek === 2 ? 2 : 0,
      totalLessons: 7,
      icon: GiMeal
    },
    {
      week: 3,
      title: 'Fördjupning',
      description: 'Utforska avancerade koncept',
      status: completedWeeks.includes(3) ? 'completed' : currentWeek === 3 ? 'current' : 'locked',
      completedLessons: completedWeeks.includes(3) ? 7 : currentWeek === 3 ? 1 : 0,
      totalLessons: 7,
      icon: GiHealthNormal
    },
    {
      week: 4,
      title: 'Experimentera',
      description: 'Nya smaker och kombinationer',
      status: completedWeeks.includes(4) ? 'completed' : currentWeek === 4 ? 'current' : 'locked',
      completedLessons: completedWeeks.includes(4) ? 7 : currentWeek === 4 ? 0 : 0,
      totalLessons: 7,
      icon: GiMeat
    },
    {
      week: 5,
      title: 'Flexibilitet',
      description: 'Anpassa efter dina behov',
      status: completedWeeks.includes(5) ? 'completed' : currentWeek === 5 ? 'current' : 'locked',
      completedLessons: 0,
      totalLessons: 7,
      icon: FiStar
    },
    {
      week: 6,
      title: 'Mastery',
      description: 'Bli din egen hälsoexpert',
      status: 'locked',
      completedLessons: 0,
      totalLessons: 7,
      icon: FiAward
    }
  ];

  const totalProgress = Math.round(
    (weekProgress.reduce((acc, week) => acc + week.completedLessons, 0) / 
    weekProgress.reduce((acc, week) => acc + week.totalLessons, 0)) * 100
  );

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50">
      {/* Hero Section with Vimeo Video */}
      <div className="relative">
        {/* Clean container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            {/* Video Container */}
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              {!isVideoPlaying ? (
                // Minimalistic video thumbnail with beautiful background
                <div className="absolute inset-0 flex items-center justify-center">
                  
                  {/* Background image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: 'url(/ulrika3.png)'
                    }}
                  ></div>
                  
                  {/* Dark overlay for better contrast */}
                  <div className="absolute inset-0 bg-black/40"></div>
                  
                  {/* Beautiful gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/30 via-teal-500/30 to-blue-600/30"></div>
                  
                  {/* Overlay with organic shapes */}
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-teal-500/10 to-blue-500/10"></div>
                    <div className="absolute top-0 left-0 w-full h-full opacity-5">
                      <div className="absolute top-8 left-8 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                      <div className="absolute bottom-12 right-12 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                      <div className="absolute top-1/3 right-1/4 w-20 h-20 bg-white rounded-full blur-2xl"></div>
                      <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
                    </div>
                  </div>
                  
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '40px 40px'
                    }}></div>
                  </div>
                  
                  {/* Main content - perfectly centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center z-10 w-full px-8">
                      {/* Play button */}
                      <motion.button
                        onClick={handlePlayVideo}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group mb-8 bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white mx-auto"
                      >
                        <FiPlay className="w-12 h-12 text-green-600 ml-1" />
                      </motion.button>
                      
                      {/* Course title */}
                      <div className="mb-4">
                        <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                          FUNCTIONAL BASICS
                        </h2>
                        <p className="text-xl text-white/90 mb-4 drop-shadow">
                          Introduktionsvideo med Ulrika Davidsson
                        </p>
                        
                        {/* Duration */}
                        <div className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                          <FiClock className="w-4 h-4 mr-2" />
                          5:32
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Actual video iframe
                <iframe
                  src="https://player.vimeo.com/video/1056709544?h=9265a3d6ae&autoplay=1&title=0&byline=0&portrait=0"
                  className="absolute top-0 left-0 w-full h-full rounded-3xl"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>

        {/* Hero Content Below Video */}
        <div className="text-center px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900">
              Functional Basics
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto text-gray-700">
              Din 6-veckors resa mot optimal hälsa genom functional foods
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href={`/dashboard/courses/functional-basics/week/${currentWeek}`}
                className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105"
              >
                Fortsätt där du slutade
              </Link>
              <Link 
                href="/dashboard/courses/functional-basics/material"
                className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 border border-gray-300"
              >
                Utforska kursmaterial
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Din framgång</h2>
              <p className="text-gray-600">Du är på rätt väg mot ett hälsosammare liv!</p>
            </div>
            <div className="mt-4 md:mt-0 text-center">
              <div className="text-5xl font-bold text-green-600">{totalProgress}%</div>
              <p className="text-gray-600">Genomfört</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-8">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-teal-600"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <FiCalendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{completedWeeks.length}</div>
              <p className="text-gray-600">Veckor klara</p>
            </div>
            <div className="text-center">
              <GiMeal className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">84</div>
              <p className="text-gray-600">Recept lagade</p>
            </div>
            <div className="text-center">
              <FiTrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">15</div>
              <p className="text-gray-600">Nya vanor</p>
            </div>
            <div className="text-center">
              <FiAward className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">3</div>
              <p className="text-gray-600">Certifikat</p>
            </div>
          </div>
        </motion.div>

        {/* Week Progress Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Kursöversikt</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weekProgress.map((week, index) => (
              <motion.div
                key={week.week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                  week.status === 'locked' ? 'opacity-75' : ''
                }`}
              >
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
                  week.status === 'completed' ? 'bg-green-100 text-green-800' :
                  week.status === 'current' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {week.status === 'completed' ? 'Klar' :
                   week.status === 'current' ? 'Pågående' : 'Låst'}
                </div>

                <div className="p-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    week.status === 'completed' ? 'bg-green-100' :
                    week.status === 'current' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    <week.icon className={`w-8 h-8 ${
                      week.status === 'completed' ? 'text-green-600' :
                      week.status === 'current' ? 'text-blue-600' :
                      'text-gray-400'
                    }`} />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Vecka {week.week}: {week.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{week.description}</p>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Framsteg</span>
                      <span>{week.completedLessons}/{week.totalLessons} lektioner</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          week.status === 'completed' ? 'bg-green-500' :
                          week.status === 'current' ? 'bg-blue-500' :
                          'bg-gray-300'
                        }`}
                        style={{ width: `${(week.completedLessons / week.totalLessons) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  {week.status !== 'locked' ? (
                    <Link
                      href={`/dashboard/courses/functional-basics/week/${week.week}`}
                      className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
                        week.status === 'completed' 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                      }`}
                    >
                      {week.status === 'completed' ? 'Se igen' : 'Fortsätt'}
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="block w-full text-center py-3 rounded-lg font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
                    >
                      <FiLock className="inline-block mr-2" />
                      Låst
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <Link href="/dashboard/courses/functional-basics/material" className="group">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg transform transition-all group-hover:scale-105">
              <FiBook className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Kunskapsmaterial</h3>
              <p className="opacity-90">Fördjupa din kunskap med våra artiklar</p>
            </div>
          </Link>

          <Link href="/dashboard/courses/functional-basics/downloads" className="group">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg transform transition-all group-hover:scale-105">
              <FiDownload className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Nedladdningar</h3>
              <p className="opacity-90">Hämta PDF:er och guider</p>
            </div>
          </Link>

          <Link href="/dashboard/courses/functional-basics/community" className="group">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg transform transition-all group-hover:scale-105">
              <FiUsers className="w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="opacity-90">Dela erfarenheter med andra</p>
            </div>
          </Link>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl p-8 text-center"
        >
          <p className="text-2xl font-medium text-gray-800 italic mb-4">
            "Mat är inte bara bränsle, det är information som talar till din DNA och berättar vad den ska göra."
          </p>
          <p className="text-gray-600">- Ulrika Davidsson</p>
        </motion.div>
      </div>
    </div>
  );
} 
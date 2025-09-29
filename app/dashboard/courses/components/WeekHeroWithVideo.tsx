'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Play } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';

interface WeekHeroWithVideoProps {
  weekNumber: number;
  weekTitle: string;
  weekSubtitle: string;
  heroImage?: string;
  videoUrl?: string;
}

export default function WeekHeroWithVideo({ 
  weekNumber, 
  weekTitle, 
  weekSubtitle,
  heroImage = '/Ulrika_portratt/udavidssondesktop.png',
  videoUrl = '' // No default video - must be provided
}: WeekHeroWithVideoProps) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { user } = useAuth();
  const hasMultipleCourses = typeof window !== 'undefined' && localStorage.getItem('hasMultipleCourses') === 'true';
  useEffect(() => {
    // Simple flag based on purchases fetched elsewhere; fallback to token presence
    // This keeps component decoupled. If we want exact detection, we can wire an API later.
  }, []);

  return (
    <>
      {/* Hero Section with Clickable Image */}
      <div className="relative h-[300px] sm:h-[400px] md:h-[500px] bg-[#112A12] overflow-hidden">
        {/* Background image with click handler */}
        <div 
          className="absolute inset-0 cursor-pointer group"
          onClick={() => setShowVideoModal(true)}
        >
          <Image 
            src={heroImage}
            alt={weekTitle}
            fill
            className="object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300"
            priority
          />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/90 rounded-full p-4 sm:p-5 md:p-6 shadow-2xl backdrop-blur-sm"
            >
              <Play className="text-3xl sm:text-4xl md:text-5xl text-[#014421] ml-1 sm:ml-2" />
            </motion.div>
          </div>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none w-full"
          >
            <p className="text-white/80 text-base sm:text-lg mb-1 sm:mb-2">Vecka {weekNumber}</p>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-2 sm:mb-4">
              {weekTitle}
            </h1>
            <p className="text-white/90 text-sm sm:text-lg md:text-xl max-w-2xl mx-auto px-4">
              {weekSubtitle}
            </p>
          </motion.div>

          {/* Course Switcher if multiple courses purchased */}
          <div className="mt-4">
            <div className="inline-flex gap-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md">
              <Link href="/dashboard/courses/functional-basics/oversikt" className="px-3 py-1.5 rounded-full text-sm bg-white hover:bg-gray-100 text-[#014421]">Basics</Link>
              <Link href="/dashboard/courses/functional-flow/oversikt" className="px-3 py-1.5 rounded-full text-sm bg-white hover:bg-gray-100 text-[#014421]">Flow</Link>
              <Link href="/dashboard/courses/functional-energy/oversikt" className="px-3 py-1.5 rounded-full text-sm bg-white hover:bg-gray-100 text-[#014421]">Energy</Link>
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
              className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                <h3 className="text-lg sm:text-xl font-semibold text-[#112A12]">
                  Vecka {weekNumber}: {weekTitle}
                </h3>
                <button
                  onClick={() => setShowVideoModal(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X className="text-xl sm:text-2xl" />
                </button>
              </div>

              {/* Video Container */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoUrl}
                  title={`Vecka ${weekNumber} video`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 
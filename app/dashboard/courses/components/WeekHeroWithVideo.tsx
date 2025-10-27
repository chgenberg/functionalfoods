'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Play } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [ownedCourses, setOwnedCourses] = useState<Array<{ key: string; label: string; path: string }>>([]);

  // Map course name from DB to dashboard overview path and label
  function mapCourseToLink(courseName: string): { key: string; label: string; path: string } | null {
    const mappings: Array<{ names: string[]; key: string; label: string; path: string }> = [
      {
        names: ['Functional Basics'],
        key: 'basics',
        label: 'Basics',
        path: '/dashboard/courses/functional-basics/oversikt'
      },
      {
        names: ['Functional Flow', 'Functional Gut Health/Flow'],
        key: 'flow',
        label: 'Flow',
        path: '/dashboard/courses/functional-flow/oversikt'
      },
      {
        names: ['Functional Energy', 'Functional Insulin balance/Energy'],
        key: 'energy',
        label: 'Energy',
        path: '/dashboard/courses/functional-energy/oversikt'
      },
      {
        names: ['Hormonell Balans'],
        key: 'hormone',
        label: 'Hormonell Balans',
        path: '/dashboard/courses/functional-hormone/oversikt'
      }
    ];
    for (const m of mappings) {
      if (m.names.includes(courseName)) return { key: m.key, label: m.label, path: m.path };
    }
    return null;
  }

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    (async () => {
      try {
        const res = await fetch('/api/user/purchases', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const purchases = Array.isArray(data) ? data : data.purchases || [];
        const links = purchases
          .map((p: any) => mapCourseToLink(p.course?.name))
          .filter(Boolean) as Array<{ key: string; label: string; path: string }>;
        // Deduplicate by key
        const dedup: Record<string, { key: string; label: string; path: string }> = {};
        links.forEach(l => { dedup[l.key] = l; });
        const finalLinks = Object.values(dedup);
        if (finalLinks.length > 1) {
          setOwnedCourses(finalLinks);
        } else {
          setOwnedCourses([]);
        }
      } catch (_) {
        // ignore
      }
    })();
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

          {/* Course Switcher if user owns multiple courses */}
          {ownedCourses.length > 1 && (
            <div className="mt-4">
              <div className="inline-flex gap-2 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md">
                {ownedCourses.map((c) => {
                  const isActive = pathname.startsWith(c.path.replace('/oversikt', ''));
                  return (
                    <Link
                      key={c.key}
                      href={c.path}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        isActive ? 'bg-[#014421] text-white' : 'bg-white hover:bg-gray-100 text-[#014421]'
                      }`}
                    >
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
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
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCheckCircle, FiAward, FiUsers, FiSettings } from 'react-icons/fi';
import { usePathname } from 'next/navigation';

interface CourseNavigationProps {
  courseType: 'basics' | 'flow';
  currentWeek?: number;
}

export default function CourseNavigation({ courseType, currentWeek = 1 }: CourseNavigationProps) {
  const pathname = usePathname();
  const basePath = `/dashboard/courses/functional-${courseType}`;
  
  const weeks = [
    { number: 1, title: courseType === 'basics' ? "Grunden i Functional Foods" : "Optimera din energi" },
    { number: 2, title: courseType === 'basics' ? "Proteiner & aminosyror" : "Avancerad näringsoptimering" },
    { number: 3, title: courseType === 'basics' ? "Fetter & kolhydrater" : "Prestationshöjande kost" },
    { number: 4, title: courseType === 'basics' ? "Vitaminer & mineraler" : "Antiinflammatorisk livsstil" },
    { number: 5, title: courseType === 'basics' ? "Antioxidanter & fytokemikalier" : "Longevity & återhämtning" },
    { number: 6, title: courseType === 'basics' ? "Att komma igång" : "Personlig optimering" }
  ];

  // Determine active week from URL
  const activeWeek = pathname.includes('/week/') 
    ? parseInt(pathname.split('/week/')[1].split('/')[0]) 
    : currentWeek;

  return (
    <div className="bg-white shadow-lg border-b-4 border-[#014421] relative z-50">
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-4">
        {/* Mobile scroll wrapper with gradient indicators */}
        <div className="relative">
          <div className="flex items-center justify-center gap-2 md:gap-3 overflow-x-auto scrollbar-hide scroll-smooth">
            {weeks.map((week) => (
              <motion.button
                key={week.number}
                onClick={() => window.location.href = (week.number === 1 ? `${basePath}` : `${basePath}/week/${week.number}`)}
                className={`
                  px-4 py-2 text-sm md:px-5 md:py-2.5 lg:px-6 lg:py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0
                  ${week.number === activeWeek 
                    ? 'bg-[#014421] text-white shadow-lg' 
                    : 'bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4]'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-1">
                  <span className="hidden sm:inline">Vecka</span>
                  <span className="sm:hidden">V.</span> {week.number}
                </span>
              </motion.button>
            ))}
            
            {/* Completion, Community and Settings Links */}
            <Link
              href={`${basePath}/avslutning`}
              className="px-4 py-2 text-sm md:px-5 md:py-2.5 lg:px-6 lg:py-3 rounded-full font-medium whitespace-nowrap transition-all bg-primary text-white hover:bg-secondary flex-shrink-0"
            >
              <span className="flex items-center gap-1">
                <FiAward className="w-4 h-4" />
                <span>Avslutning</span>
              </span>
            </Link>
            
            <Link
              href="/dashboard/community"
              className="px-4 py-2 text-sm md:px-5 md:py-2.5 lg:px-6 lg:py-3 rounded-full font-medium whitespace-nowrap transition-all bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4] flex-shrink-0"
            >
              <span className="flex items-center gap-1">
                <FiUsers className="w-4 h-4" />
                <span>Community</span>
              </span>
            </Link>
            
            <Link
              href="/dashboard/settings"
              className="px-4 py-2 text-sm md:px-5 md:py-2.5 lg:px-6 lg:py-3 rounded-full font-medium whitespace-nowrap transition-all bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4] flex-shrink-0"
            >
              <span className="flex items-center gap-1">
                <FiSettings className="w-4 h-4" />
                <span>Inställningar</span>
              </span>
            </Link>
          </div>
          
          {/* Mobile scroll indicators */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#F3EFE3] to-transparent pointer-events-none md:hidden" />
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#F3EFE3] to-transparent pointer-events-none md:hidden" />
        </div>
      </div>
    </div>
  );
} 
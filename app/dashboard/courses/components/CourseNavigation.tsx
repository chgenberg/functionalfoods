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
    <div className="sticky top-0 z-40 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-2 md:px-4 py-3">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
          {weeks.map((week) => (
            <motion.button
              key={week.number}
              onClick={() => window.location.href = basePath}
              className={`
                px-2 py-1.5 text-xs md:px-4 md:py-2 md:text-sm rounded-full font-medium whitespace-nowrap transition-all
                ${week.number === activeWeek 
                  ? 'bg-[#014421] text-white shadow-lg' 
                  : 'bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4]'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-1">
                <span className="hidden sm:inline">Vecka</span> {week.number}
              </span>
            </motion.button>
          ))}
          
          {/* Completion, Community and Settings Links */}
          <Link
            href={`${basePath}/avslutning`}
            className="px-2 py-1.5 text-xs md:px-4 md:py-2 md:text-sm rounded-full font-medium whitespace-nowrap transition-all bg-gradient-to-r from-[#FFB5A7] to-[#FCD5CE] text-white hover:shadow-lg"
          >
            <span className="flex items-center gap-1">
              <FiAward className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Avslutning</span>
              <span className="sm:hidden">Slut</span>
            </span>
          </Link>
          
          <Link
            href="/dashboard/community"
            className="px-2 py-1.5 text-xs md:px-4 md:py-2 md:text-sm rounded-full font-medium whitespace-nowrap transition-all bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4]"
          >
            <span className="flex items-center gap-1">
              <FiUsers className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Community</span>
            </span>
          </Link>
          
          <Link
            href="/dashboard/settings"
            className="px-2 py-1.5 text-xs md:px-4 md:py-2 md:text-sm rounded-full font-medium whitespace-nowrap transition-all bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4]"
          >
            <span className="flex items-center gap-1">
              <FiSettings className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Inställningar</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
} 
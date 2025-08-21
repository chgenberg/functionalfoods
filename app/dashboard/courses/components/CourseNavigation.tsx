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

  // Check if we're on specific pages
  const isOnCompletion = pathname.includes('/avslutning');
  const isOnCommunity = pathname.includes('/community');
  const isOnSettings = pathname.includes('/settings');
  const isOnShoppingList = pathname.includes('/inkopslista');
  const isOnOverview = pathname.includes('/oversikt');

  // Determine active week from URL
  let activeWeek = currentWeek;
  
  if (pathname.includes('/week/')) {
    // We're on a specific week page
    activeWeek = parseInt(pathname.split('/week/')[1].split('/')[0]);
  } else if (isOnShoppingList) {
    // We're on shopping list - use currentWeek passed as prop
    activeWeek = currentWeek || 1;
  } else if (!isOnOverview && !isOnCompletion && !isOnCommunity && !isOnSettings) {
    // We're on the main course page (which redirects to overview)
    activeWeek = 0;
  }

  return (
    <div className="bg-white shadow-lg border-b-4 border-[#014421] relative z-10">
      <div className="max-w-full mx-auto px-1 md:px-2 py-4">
        {/* Mobile scroll wrapper with gradient indicators */}
        <div className="relative overflow-visible">
          <div className="flex items-center justify-center gap-1 md:gap-2 overflow-x-auto scrollbar-hide scroll-smooth">
            {/* Overview Link */}
            <Link
              href={`${basePath}/oversikt`}
              className={`
                px-3 py-2 text-sm md:px-4 md:py-2.5 lg:px-5 lg:py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0
                ${pathname.includes('/oversikt') 
                  ? 'bg-[#014421] text-white shadow-lg' 
                  : 'bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4]'
                }
              `}
            >
              <span className="flex items-center gap-1">
                <span>Översikt</span>
              </span>
            </Link>
            
            {weeks.map((week) => (
              <motion.button
                key={week.number}
                onClick={() => window.location.href = `${basePath}/week/${week.number}`}
                className={`
                  px-3 py-2 text-sm md:px-4 md:py-2.5 lg:px-5 lg:py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0
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
              className={`px-3 py-2 text-sm md:px-4 md:py-2.5 lg:px-5 lg:py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                isOnCompletion 
                  ? 'bg-[#014421] text-white shadow-lg' 
                  : 'bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4]'
              }`}
            >
              <span className="flex items-center gap-1">
                <FiAward className="w-4 h-4" />
                <span>Avslutning</span>
              </span>
            </Link>
            
            <Link
              href="/dashboard/community"
              className={`px-3 py-2 text-sm md:px-4 md:py-2.5 lg:px-5 lg:py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                isOnCommunity 
                  ? 'bg-[#014421] text-white shadow-lg' 
                  : 'bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4]'
              }`}
            >
              <span className="flex items-center gap-1">
                <FiUsers className="w-4 h-4" />
                <span>Community</span>
              </span>
            </Link>
            
            <Link
              href="/dashboard/settings"
              className={`px-3 py-2 text-sm md:px-4 md:py-2.5 lg:px-5 lg:py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                isOnSettings 
                  ? 'bg-[#014421] text-white shadow-lg' 
                  : 'bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4]'
              }`}
            >
              <span className="flex items-center gap-1">
                <FiSettings className="w-4 h-4" />
                <span className="hidden sm:inline">Inställningar</span>
                <span className="sm:hidden">Inst.</span>
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
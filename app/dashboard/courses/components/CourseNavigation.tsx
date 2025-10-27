'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Award, CheckCircle, HelpCircle, Settings, Star, Users } from "lucide-react";;

interface CourseNavigationProps {
  courseType: 'basics' | 'flow' | 'energy' | 'hormone';
  currentWeek?: number;
}

export default function CourseNavigation({ courseType, currentWeek = 1 }: CourseNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const basePath = courseType === 'hormone' ? '/dashboard/courses/functional-hormone' : `/dashboard/courses/functional-${courseType}`;
  
  // Auto-scroll to left on mobile when component mounts
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Always start from the left on mobile
      scrollContainerRef.current.scrollLeft = 0;
      
      // Also scroll to left when window is resized to mobile
      const handleResize = () => {
        if (window.innerWidth < 768 && scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft = 0;
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [pathname]); // Re-run when pathname changes
  
  const weeks = [
    { number: 1, title: courseType === 'basics' ? "Grunden i Functional Foods" : courseType === 'flow' ? "Optimera din energi" : courseType === 'hormone' ? "Vecka 1" : "Introduktion" },
    { number: 2, title: courseType === 'basics' ? "Proteiner & aminosyror" : courseType === 'flow' ? "Avancerad näringsoptimering" : courseType === 'hormone' ? "Vecka 2" : "Blodsocker & energi" },
    { number: 3, title: courseType === 'basics' ? "Fetter & kolhydrater" : courseType === 'flow' ? "Prestationshöjande kost" : courseType === 'hormone' ? "Vecka 3" : "Måltidsplanering" },
    { number: 4, title: courseType === 'basics' ? "Vitaminer & mineraler" : courseType === 'flow' ? "Antiinflammatorisk livsstil" : courseType === 'hormone' ? "Vecka 4" : "Smarta kolhydrater" },
    { number: 5, title: courseType === 'basics' ? "Antioxidanter & fytokemikalier" : courseType === 'flow' ? "Longevity & återhämtning" : courseType === 'hormone' ? "Vecka 5" : "Energistabila vanor" },
    { number: 6, title: courseType === 'basics' ? "Att komma igång" : courseType === 'flow' ? "Personlig optimering" : courseType === 'hormone' ? "Vecka 6" : "Långsiktig hållbarhet" }
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
  } else if (isOnOverview || isOnCompletion || isOnSettings || isOnCommunity) {
    // We're on overview, completion, settings, or community page - no week should be active
    activeWeek = 0;
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block bg-white shadow-lg relative z-10">
        <div className="max-w-full mx-auto px-1 md:px-2 py-4">
          <div className="flex items-center justify-center gap-1 md:gap-2">
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
                <Award className="w-4 h-4" />
                <span>Avslutning</span>
              </span>
            </Link>
            
            <a
              href="https://www.facebook.com/groups/1168295381877412/"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-2 text-sm md:px-4 md:py-2.5 lg:px-5 lg:py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                isOnCommunity 
                  ? 'bg-[#014421] text-white shadow-lg' 
                  : 'bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4]'
              }`}
            >
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Community</span>
              </span>
            </a>
            
            <Link
              href="/dashboard/settings"
              className={`px-3 py-2 text-sm md:px-4 md:py-2.5 lg:px-5 lg:py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                isOnSettings 
                  ? 'bg-[#014421] text-white shadow-lg' 
                  : 'bg-[#F3EFE3] text-[#014421] hover:bg-[#E8E0D4]'
              }`}
            >
              <span className="flex items-center gap-1">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Inställningar</span>
                <span className="sm:hidden">Inst.</span>
              </span>
            </Link>

            {/* Help button - Dark green with ? symbol */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Help button clicked!');
                window.dispatchEvent(new CustomEvent('open-dashboard-help'));
              }}
              className="w-10 h-10 rounded-full bg-[#014421] text-white hover:bg-[#116530] transition-all flex-shrink-0 flex items-center justify-center font-bold text-lg shadow-md hover:shadow-lg relative z-30 cursor-pointer"
              title="Hjälp med dashboard"
              type="button"
              style={{ minWidth: '40px', minHeight: '40px' }}
            >
              ?
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="relative">
          {/* Subtle scroll indicators - positioned to not cover content */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-white z-10 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#014421] opacity-40"></div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white z-10 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#014421] opacity-40"></div>
          </div>
          
          <div 
            ref={scrollContainerRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-2 py-3"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {/* Overview - Always visible first */}
            <Link
              href={`${basePath}/oversikt`}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[75px]
                ${pathname.includes('/oversikt') 
                  ? 'bg-[#014421] text-white' 
                  : 'text-[#014421] hover:bg-[#014421]/10'
                }
              `}
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                pathname.includes('/oversikt') ? 'bg-white text-[#014421]' : 'bg-[#014421] text-white'
              }`}>
                <Star className="w-5 h-5 inline" />
              </div>
              <span className="text-xs font-medium">Översikt</span>
            </Link>
            
            {/* Week buttons */}
            {weeks.map((week) => (
              <Link
                key={week.number}
                href={`${basePath}/week/${week.number}`}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[60px]
                  ${week.number === activeWeek 
                    ? 'bg-[#014421] text-white' 
                    : 'text-[#014421] hover:bg-[#014421]/10'
                  }
                `}
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  week.number === activeWeek ? 'bg-white text-[#014421]' : 'bg-[#014421] text-white'
                }`}>
                  {week.number}
                </div>
                <span className="text-xs font-medium">V. {week.number}</span>
              </Link>
            ))}
            
            {/* Completion */}
            <Link
              href={`${basePath}/avslutning`}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[70px]
                ${isOnCompletion 
                  ? 'bg-[#014421] text-white' 
                  : 'text-[#014421] hover:bg-[#014421]/10'
                }
              `}
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                isOnCompletion ? 'bg-white text-[#014421]' : 'bg-[#014421] text-white'
              }`}>
                <Award className="w-3 h-3" />
              </div>
              <span className="text-xs font-medium">Avslut</span>
            </Link>
            
            {/* Community */}
            <a
              href="https://www.facebook.com/groups/1168295381877412/"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[70px]
                ${isOnCommunity 
                  ? 'bg-[#014421] text-white' 
                  : 'text-[#014421] hover:bg-[#014421]/10'
                }
              `}
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                isOnCommunity ? 'bg-white text-[#014421]' : 'bg-[#014421] text-white'
              }`}>
                <Users className="w-3 h-3" />
              </div>
              <span className="text-xs font-medium">Community</span>
            </a>
            
            {/* Settings */}
            <Link
              href="/dashboard/settings"
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[60px]
                ${isOnSettings 
                  ? 'bg-[#014421] text-white' 
                  : 'text-[#014421] hover:bg-[#014421]/10'
                }
              `}
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                isOnSettings ? 'bg-white text-[#014421]' : 'bg-[#014421] text-white'
              }`}>
                <Settings className="w-3 h-3" />
              </div>
              <span className="text-xs font-medium">Inst.</span>
            </Link>

            {/* Help button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Help button clicked!');
                window.dispatchEvent(new CustomEvent('open-dashboard-help'));
              }}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all flex-shrink-0 min-w-[50px] text-[#014421] hover:bg-[#014421]/10"
              title="Hjälp med dashboard"
              type="button"
            >
              <div className="w-6 h-6 rounded-full bg-[#014421] text-white flex items-center justify-center font-bold text-sm">
                ?
              </div>
              <span className="text-xs font-medium">Hjälp</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 
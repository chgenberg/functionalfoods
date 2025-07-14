'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiBook, FiSettings, FiMenu, FiX, FiCalendar,
  FiAward, FiUsers, FiDownload, FiChevronRight, FiTarget,
  FiChevronLeft, FiChevronUp
} from 'react-icons/fi';
import { GiFruitBowl, GiMeal } from 'react-icons/gi';

export default function FunctionalBasicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      label: 'Översikt',
      href: '/dashboard/courses/functional-basics',
      icon: FiHome,
    },
    {
      label: 'Kostschema',
      href: '/dashboard/courses/functional-basics/kostschema',
      icon: GiMeal,
    },
    {
      label: 'Vecka 1',
      href: '/dashboard/courses/functional-basics/week/1',
      icon: FiCalendar,
    },
    {
      label: 'Vecka 2',
      href: '/dashboard/courses/functional-basics/week/2',
      icon: FiCalendar,
    },
    {
      label: 'Vecka 3',
      href: '/dashboard/courses/functional-basics/week/3',
      icon: FiCalendar,
    },
    {
      label: 'Vecka 4',
      href: '/dashboard/courses/functional-basics/week/4',
      icon: FiCalendar,
    },
    {
      label: 'Vecka 5',
      href: '/dashboard/courses/functional-basics/week/5',
      icon: FiCalendar,
    },
    {
      label: 'Vecka 6',
      href: '/dashboard/courses/functional-basics/week/6',
      icon: FiCalendar,
    },
    {
      label: 'Mål',
      href: '/dashboard/courses/functional-basics/goals',
      icon: FiTarget,
    },
    {
      label: 'Material',
      href: '/dashboard/courses/functional-basics/material',
      icon: FiBook,
    },
    {
      label: 'Community',
      href: '/dashboard/courses/functional-basics/community',
      icon: FiUsers,
    },
    {
      label: 'Ladda ner',
      href: '/dashboard/courses/functional-basics/downloads',
      icon: FiDownload,
    },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header - Desktop & Mobile */}
      <header className="bg-background-secondary shadow-sm border-b border-border sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Course Title */}
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/courses" className="lg:hidden">
                <FiChevronLeft className="w-6 h-6 text-text-secondary" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-accent rounded-full p-2">
                  <GiFruitBowl className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-text-primary">Functional Basics</h1>
                  <p className="text-xs sm:text-sm text-text-secondary hidden sm:block">6 veckors hälsoprogram</p>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-background-secondary shadow-lg">
          <div className="flex flex-col h-full pt-5">
            {/* Course Navigation */}
            <nav className="flex-1 px-4 pb-4 space-y-1">
              <h3 className="px-3 text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Kursinnehåll
              </h3>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-accent text-white shadow-md' 
                        : 'text-text-primary hover:bg-background hover:text-primary'
                      }
                    `}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-text-secondary'}`} />
                    {item.label}
                    {isActive && (
                      <FiChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background-secondary border-t border-border z-50">
        {/* Scrollable navigation */}
        <div className="flex overflow-x-auto scrollbar-hide py-2 px-2 gap-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all flex-shrink-0
                  ${isActive 
                    ? 'bg-accent text-white shadow-md' 
                    : 'text-text-secondary hover:bg-background'
                  }
                `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-text-secondary'}`} />
                <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        
        {/* Toggle button for full menu */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="absolute -top-12 right-4 bg-background-secondary shadow-lg rounded-full p-2 border border-border"
        >
          <FiChevronUp className={`w-5 h-5 text-text-secondary transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Mobile Full Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-background-secondary rounded-t-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-primary">Kursnavigation</h3>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-background rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5 text-text-secondary" />
                  </button>
                </div>
                
                <nav className="space-y-2">
                  {navigationItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center px-4 py-3 rounded-lg transition-all
                          ${isActive 
                            ? 'bg-accent text-white shadow-md' 
                            : 'text-text-primary hover:bg-background'
                          }
                        `}
                      >
                        <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-text-secondary'}`} />
                        <span className="font-medium">{item.label}</span>
                        {isActive && (
                          <FiChevronRight className="ml-auto h-4 w-4" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add custom scrollbar hide styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
} 
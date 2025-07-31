'use client';

// Force cache invalidation v5 - Matching Basic design

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, FiBook, FiSettings, FiMenu, FiX, FiCalendar,
  FiAward, FiUsers, FiDownload, FiChevronRight, FiTarget,
  FiChevronLeft, FiChevronUp, FiShoppingCart
} from 'react-icons/fi';
import { GiFruitBowl, GiMeal } from 'react-icons/gi';
import CourseSwitcher from '@/app/components/CourseSwitcher';

export default function FunctionalFlowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      label: 'Översikt',
      href: '/dashboard/courses/functional-flow',
      icon: FiHome,
    },
    {
      label: 'Kostschema',
      href: '/dashboard/courses/functional-flow/kostschema',
      icon: GiMeal,
    },
    {
      label: 'Inköpslistor',
      href: '/dashboard/courses/functional-flow/inkopslista',
      icon: FiShoppingCart,
    },
    {
      label: 'Vecka 1',
      href: '/dashboard/courses/functional-flow/week/1',
      icon: FiCalendar,
    },
    {
      label: 'Vecka 2',
      href: '/dashboard/courses/functional-flow/week/2',
      icon: FiCalendar,
    },
    {
      label: 'Vecka 3',
      href: '/dashboard/courses/functional-flow/week/3',
      icon: FiCalendar,
    },
    {
      label: 'Vecka 4',
      href: '/dashboard/courses/functional-flow/week/4',
      icon: FiCalendar,
    },
    {
      label: 'Vecka 5',
      href: '/dashboard/courses/functional-flow/week/5',
      icon: FiCalendar,
    },
    {
      label: 'Vecka 6',
      href: '/dashboard/courses/functional-flow/week/6',
      icon: FiCalendar,
    },
    {
      label: 'Mål',
      href: '/dashboard/courses/functional-flow/goals',
      icon: FiTarget,
    },
    {
      label: 'Material',
      href: '/dashboard/courses/functional-flow/material',
      icon: FiBook,
    },
    {
      label: 'Community',
      href: '/dashboard/courses/functional-flow/community',
      icon: FiUsers,
    },
    {
      label: 'Ladda ner',
      href: '/dashboard/courses/functional-flow/downloads',
      icon: FiDownload,
    },
    {
      label: 'Inställningar',
      href: '/dashboard/settings',
      icon: FiSettings,
    },
  ];

  useEffect(() => {
    // Add Flow-specific styles to body
    document.body.classList.add('functional-flow');
    return () => {
      document.body.classList.remove('functional-flow');
    };
  }, []);

  return (
    <div className="min-h-screen flow-layout">
      {/* Top Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Course Title */}
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/courses" className="lg:hidden">
                <FiChevronLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-[#1a4d78] rounded-full p-2">
                  <GiFruitBowl className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">Functional Flow</h1>
                  <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Avancerat hälsoprogram</p>
                </div>
              </div>
            </div>

            {/* Course Switcher and User Menu */}
            <div className="flex items-center space-x-4">
              <CourseSwitcher />
              <div className="w-10 h-10 bg-[#1a4d78] rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-gray-50 shadow-lg">
          <div className="flex flex-col h-full pt-5">
            {/* Course Navigation */}
            <nav className="flex-1 px-4 pb-4 space-y-1">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
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
                        ? 'bg-[#1a4d78] text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-[#1a4d78]'
                      }
                    `}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 z-50">
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
                    ? 'bg-[#1a4d78] text-white shadow-md' 
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        
        {/* Scroll indicator for mobile */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute top-1/2 -translate-y-1/2 right-2 pointer-events-none"
        >
          <div className="flex items-center gap-1 text-gray-400">
            <span className="text-xs">Scrolla</span>
            <FiChevronRight className="w-4 h-4" />
          </div>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Functional Flow</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors
                        ${pathname === item.href
                          ? 'bg-[#1a4d78] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .functional-flow {
          --color-primary: #1a4d78;
          --color-primary-light: #2563a8;
          --color-primary-dark: #0f3050;
        }

        .flow-layout .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .flow-layout .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
} 
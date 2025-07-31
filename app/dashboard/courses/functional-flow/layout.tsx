'use client';

// Force cache invalidation v3 - Update for flowonly fix

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
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen functional-flow-layout" style={{ backgroundColor: '#0f2c1a', minHeight: '100vh' }}>
      {/* Top Header - Desktop & Mobile */}
      <header className="shadow-lg sticky top-0 z-40 functional-flow-header" style={{ backgroundColor: '#1a4324' }}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Course Title */}
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/courses" className="lg:hidden">
                <FiChevronLeft className="w-6 h-6 text-white/80 hover:text-white" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                  <GiFruitBowl className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white">Functional Flow</h1>
                  <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Avancerat hälsoprogram</p>
                </div>
              </div>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigationItems.slice(0, 6).map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile menu button for desktop overflow */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <FiMenu className="w-4 h-4" />
                <span>Mer</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center space-x-4">
              <CourseSwitcher />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
              </button>
            </div>

            {/* Course Switcher and User Menu - Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              <CourseSwitcher />
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

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
              <div className="p-6 border-b border-gray-200" style={{ backgroundColor: '#1a4324' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <GiFruitBowl className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">Functional Flow</h1>
                      <p className="text-sm text-white/80">Avancerat hälsoprogram</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2 h-[calc(100vh-140px)] overflow-y-auto">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'text-white shadow-lg'
                          : 'text-gray-700 hover:text-white'
                      }`}
                      style={{
                        backgroundColor: isActive ? '#1a4324' : 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = '#1a4324';
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#374151';
                        }
                      }}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {isActive && <FiChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 
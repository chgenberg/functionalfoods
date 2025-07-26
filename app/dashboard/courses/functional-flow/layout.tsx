'use client';

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
      label: 'Downloads',
      href: '/dashboard/courses/functional-flow/downloads',
      icon: FiDownload,
    },
  ];

  // Stäng mobilmenyn när användaren navigerar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-80 bg-white shadow-xl border-r border-gray-200 z-40">
        <div className="p-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-3 mb-4 text-gray-600 hover:text-orange-600 transition-colors">
            <FiChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Tillbaka till Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl">
              <GiFruitBowl className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Functional Flow</h1>
              <p className="text-sm text-gray-600">Avancerad näringslära</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2 h-[calc(100vh-140px)] overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-green-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {isActive && <FiChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-gray-600">
            <FiChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-green-600 rounded-lg">
              <GiFruitBowl className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Functional Flow</h1>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>
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
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl">
                      <GiFruitBowl className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Functional Flow</h1>
                      <p className="text-sm text-gray-600">Avancerad näringslära</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-600 hover:text-teal-600 hover:bg-gray-100 rounded-lg transition-colors"
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
                          ? 'bg-gradient-to-r from-teal-500 to-green-600 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-teal-600'
                      }`}
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
      <main className="lg:ml-80 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
} 
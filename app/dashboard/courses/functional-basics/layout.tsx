'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FiHome, FiBook, FiSettings, FiMenu, FiX, FiCalendar,
  FiAward, FiUsers, FiDownload, FiChevronRight, FiTarget
} from 'react-icons/fi';
import { GiFruitBowl, GiMeal } from 'react-icons/gi';

export default function FunctionalBasicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    {
      label: 'Kursöversikt',
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
      label: 'Målsättning',
      href: '/dashboard/courses/functional-basics/goals',
      icon: FiTarget,
    },
    {
      label: 'Kunskapsmaterial',
      href: '/dashboard/courses/functional-basics/material',
      icon: FiBook,
    },
    {
      label: 'Community',
      href: '/dashboard/courses/functional-basics/community',
      icon: FiUsers,
    },
    {
      label: 'Nedladdningar',
      href: '/dashboard/courses/functional-basics/downloads',
      icon: FiDownload,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Course Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiMenu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-full p-2">
                  <GiFruitBowl className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Functional Basics</h1>
                  <p className="text-sm text-gray-600">6 veckors hälsoprogram</p>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full pt-20 lg:pt-5">
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
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
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

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 
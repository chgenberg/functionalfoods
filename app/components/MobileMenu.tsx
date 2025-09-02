"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ArrowRight, User, LogOut, Search } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { useT } from '../lib/i18n/LanguageProvider';

interface MenuItem {
  label: string;
  href: string;
  submenu?: Array<{ label: string; href: string }>;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  user: any;
  onLogin: () => void;
  onLogout: () => void;
  onSearch: () => void;
  getDirectDashboardLink: (email: string) => string;
}

export default function MobileMenu({ 
  isOpen, 
  onClose, 
  menuItems, 
  user, 
  onLogin, 
  onLogout,
  onSearch,
  getDirectDashboardLink 
}: MobileMenuProps) {
  const t = useT();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && menuRef.current) {
      const firstFocusable = menuRef.current.querySelector('button, a') as HTMLElement;
      firstFocusable?.focus();
    }
  }, [isOpen]);

  const handleLinkClick = () => {
    setActiveDropdown(null);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            ref={menuRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
              <Link href="/" onClick={handleLinkClick}>
                <Image 
                  src="/FF_logo.svg" 
                  alt="Functional Foods" 
                  width={140} 
                  height={56} 
                  className="h-10 w-auto" 
                />
              </Link>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                aria-label="Stäng meny"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <nav className="py-4 px-4">
                {/* Language switcher */}
                <div className="mb-6">
                  <LanguageSwitcher />
                </div>

                {/* Main menu items */}
                <div className="space-y-1">
                  {menuItems.map((item, index) => (
                    <motion.div 
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {item.submenu ? (
                        <div className="mb-1">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                            className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#014421] focus:ring-offset-2"
                            aria-expanded={activeDropdown === item.label}
                          >
                            <span>{item.label}</span>
                            <motion.div
                              animate={{ rotate: activeDropdown === item.label ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {activeDropdown === item.label && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mt-1 space-y-1 overflow-hidden"
                              >
                                {item.submenu.map((subItem, subIndex) => (
                                  <motion.div
                                    key={subItem.label}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: subIndex * 0.03 }}
                                  >
                                    <Link
                                      href={subItem.href}
                                      className="block px-4 py-2.5 pl-8 text-sm text-gray-600 hover:text-[#014421] hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#014421] focus:ring-offset-2"
                                      onClick={handleLinkClick}
                                    >
                                      {subItem.label}
                                    </Link>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#014421] focus:ring-offset-2"
                          onClick={handleLinkClick}
                        >
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
              </nav>
            </div>

            {/* Search section */}
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => { onSearch(); onClose(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 mb-4"
              >
                <Search className="w-5 h-5" />
                <span>{t('nav.search','Sök')}</span>
              </button>
            </div>

            {/* User section */}
            <div className="border-t border-gray-200 p-4">
              {user ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <Link
                    href="/mina-kurser"
                    className="flex items-center justify-between px-4 py-3 text-base font-medium text-white bg-[#014421] hover:bg-[#116530] rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#014421] focus:ring-offset-2"
                    onClick={handleLinkClick}
                  >
                    <span>{t('nav.myCourses','Mitt konto')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href={getDirectDashboardLink(user.email)}
                    className="flex items-center justify-between px-4 py-3 text-base font-medium text-[#014421] bg-[#014421]/10 hover:bg-[#014421]/20 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#014421] focus:ring-offset-2"
                    onClick={handleLinkClick}
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    <span>{t('nav.logout','Logga ut')}</span>
                    <LogOut className="w-5 h-5" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => { onLogin(); onClose(); }}
                  className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-white bg-[#014421] hover:bg-[#116530] rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#014421] focus:ring-offset-2"
                >
                  <span>{t('nav.login','Logga in')}</span>
                  <User className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 
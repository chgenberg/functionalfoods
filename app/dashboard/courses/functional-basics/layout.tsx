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
import CourseSwitcher from '@/app/components/CourseSwitcher';
import { useAuth } from '@/app/hooks/useAuth';
import { useT } from '@/app/lib/i18n/LanguageProvider';

export default function FunctionalBasicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 
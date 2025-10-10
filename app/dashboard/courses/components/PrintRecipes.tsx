'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

interface PrintRecipesProps {
  weekNumber: number;
  courseName: string;
}

export default function PrintRecipes({ weekNumber, courseName }: PrintRecipesProps) {
  const handlePrint = () => {
    const courseSlug = courseName.includes('Basics') 
      ? 'basics' 
      : courseName.includes('Flow') 
      ? 'flow' 
      : 'energy';
    window.location.href = `/print-recipes?week=${weekNumber}&course=${courseSlug}`;
  };

  return (
    <motion.button
      onClick={handlePrint}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-2 bg-white border-2 border-[#014421] text-[#014421] px-4 py-2.5 rounded-xl hover:bg-[#014421] hover:text-white transition-all shadow-md hover:shadow-lg font-medium"
    >
      <FileText className="w-4 h-4" />
      <span>Skriv ut recept</span>
    </motion.button>
  );
}

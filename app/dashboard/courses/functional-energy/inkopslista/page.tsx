"use client";
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ShoppingListTemplate from '../../components/ShoppingListTemplate';

export default function FunctionalEnergyInkopslistaPage() {
  const [selectedWeek, setSelectedWeek] = useState(1);

  const weekTitles = [
    'Introduktion till stabil energi',
    'Blodsocker & energi', 
    'Måltidsplanering för energi',
    'Smarta kolhydrater',
    'Energistabila vanor',
    'Långsiktig hållbarhet'
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/courses/functional-energy/oversikt" className="text-gray-600 hover:text-[#014421]">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#014421]">Inköpslistor - Functional Energy</h1>
                <p className="text-sm text-gray-600">Veckovisa inköpslistor för stabilt blodsocker</p>
              </div>
            </div>
            
            {/* Week selector for desktop */}
            <div className="hidden md:flex items-center gap-2">
              <Link 
                href="/dashboard/courses/functional-energy/kostschema"
                className="bg-[#93C560] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#7FBA3D] transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Kostschema
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Week Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Välj vecka</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedWeek(Math.max(1, selectedWeek - 1))}
                disabled={selectedWeek === 1}
                className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-[#014421]" />
              </button>
              <span className="px-4 py-2 bg-white rounded-lg shadow-md font-medium text-[#014421]">
                Vecka {selectedWeek}
              </span>
              <button
                onClick={() => setSelectedWeek(Math.min(6, selectedWeek + 1))}
                disabled={selectedWeek === 6}
                className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-[#014421]" />
              </button>
            </div>
          </div>

          {/* Week Pills */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6].map((week) => (
              <button
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`py-3 px-4 rounded-xl font-medium transition-all ${
                  selectedWeek === week
                    ? 'bg-gradient-to-r from-[#93C560] to-[#7FBA3D] text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:shadow-md'
                }`}
              >
                Vecka {week}
              </button>
            ))}
          </div>

          {/* Week Description */}
          <div className="bg-gradient-to-r from-[#F7F1E8] to-[#F3EFE3] rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-[#014421] mb-2">
              Vecka {selectedWeek}: {weekTitles[selectedWeek - 1]}
            </h3>
            <p className="text-gray-700">
              Inköpslista för alla råvaror som behövs för veckans blodsockerstabila måltider.
            </p>
          </div>
        </div>

        {/* Shopping List Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedWeek}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ShoppingListTemplate 
              courseType="energy" 
              weekNumber={selectedWeek}
            />
          </motion.div>
        </AnimatePresence>

        {/* Mobile Actions */}
        <div className="md:hidden mt-8">
          <Link 
            href="/dashboard/courses/functional-energy/kostschema"
            className="w-full bg-[#93C560] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#7FBA3D] transition-colors flex items-center justify-center gap-2"
          >
            <Calendar className="w-5 h-5" />
            Se kostschema
          </Link>
        </div>
      </div>
    </main>
  );
} 
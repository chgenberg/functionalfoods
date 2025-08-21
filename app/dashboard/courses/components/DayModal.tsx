'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiClock, FiShoppingCart } from 'react-icons/fi';
import Link from 'next/link';

interface Meal {
  mealType: string;
  time: string;
  meal: string;
  calories: string;
  recipeLink?: string;
}

interface DayModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  dayNumber: number;
  dayName: string;
  meals: Meal[];
}

export default function DayModal({
  isOpen,
  onClose,
  weekNumber,
  dayNumber,
  dayName,
  meals
}: DayModalProps) {
  const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'frukost':
        return '🌅';
      case 'lunch':
        return '🌞';
      case 'middag':
        return '🌙';
      default:
        return '🍽️';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#014421] to-[#116530] text-white p-4 sm:p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Vecka {weekNumber} - {dayName}</h2>
                <p className="text-white/80 text-sm sm:text-base mt-1">Dag {dayNumber}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition flex-shrink-0"
              >
                <FiX className="text-xl sm:text-2xl" />
              </button>
            </div>

            {/* Meals Container */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)] sm:max-h-[calc(85vh-120px)]">
              <div className="space-y-4 sm:space-y-6">
                {meals.map((meal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-[#F3EFE3]/50 to-[#F8F5EE]/50 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getMealIcon(meal.mealType)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-[#112A12]">{meal.mealType}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <FiClock className="text-sm" />
                            <span>{meal.time}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-[#014421] bg-[#014421]/10 px-3 py-1 rounded-full">
                        {meal.calories}
                      </span>
                    </div>
                    
                    <p className="text-gray-800 font-medium mb-3">{meal.meal}</p>
                    
                    {meal.recipeLink && (
                      <Link
                        href={meal.recipeLink}
                        className="inline-flex items-center gap-2 text-[#014421] hover:text-[#116530] transition-colors text-sm font-medium"
                      >
                        <span>Se recept</span>
                        <span className="text-lg">→</span>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Shopping List Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 text-center"
              >
                <button className="inline-flex items-center gap-2 bg-[#014421] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-[#116530] transition-colors shadow-lg text-sm sm:text-base">
                  <FiShoppingCart />
                  <span>Skapa inköpslista för denna dag</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
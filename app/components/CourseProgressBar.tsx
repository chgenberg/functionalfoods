'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, PartyPopper } from "lucide-react";;

interface CourseProgressBarProps {
  startDate: string; // ISO date string
  courseName: string;
}

export default function CourseProgressBar({ startDate, courseName }: CourseProgressBarProps) {
  const [currentDay, setCurrentDay] = useState(1);
  const [totalDays] = useState(42); // 6 veckor * 7 dagar
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const calculateCurrentDay = () => {
      const start = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset tid för korrekt jämförelse
      start.setHours(0, 0, 0, 0);
      
      const diffTime = today.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 1) {
        setCurrentDay(1);
      } else if (diffDays > totalDays) {
        setCurrentDay(totalDays);
        setIsCompleted(true);
      } else {
        setCurrentDay(diffDays);
      }
    };

    calculateCurrentDay();
    
    // Uppdatera vid midnatt
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const midnightTimeout = setTimeout(() => {
      calculateCurrentDay();
      // Sätt upp interval för daglig uppdatering
      const dailyInterval = setInterval(calculateCurrentDay, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, [startDate, totalDays]);

  const progressPercentage = (currentDay / totalDays) * 100;
  const currentWeek = Math.ceil(currentDay / 7);
  const daysInCurrentWeek = currentDay % 7 || 7;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            {isCompleted ? (
              <CheckCircle className="w-6 h-6 text-primary" />
            ) : (
              <Calendar className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{courseName}</h3>
            <p className="text-sm text-gray-600">
              {isCompleted ? (
                'Grattis! Du har genomfört kursen! <PartyPopper className="w-5 h-5 inline" />'
              ) : (
                <>Dag {currentDay} av {totalDays} • Vecka {currentWeek}</>
              )}
            </p>
          </div>
        </div>
        
        {!isCompleted && (
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{Math.round(progressPercentage)}%</p>
            <p className="text-xs text-gray-600">slutfört</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Glanseffekt */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </motion.div>
        </div>

        {/* Veckomarkeringar */}
        <div className="absolute inset-0 flex justify-between pointer-events-none">
          {[...Array(6)].map((_, weekIndex) => (
            <div
              key={weekIndex}
              className="flex-1 border-r border-gray-300 last:border-r-0"
              style={{ opacity: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Veckoöversikt */}
      <div className="mt-4 grid grid-cols-6 gap-2">
        {[...Array(6)].map((_, weekIndex) => {
          const weekNumber = weekIndex + 1;
          const isCurrentWeek = weekNumber === currentWeek;
          const isPastWeek = weekNumber < currentWeek;
          
          return (
            <div
              key={weekIndex}
              className={`text-center py-2 rounded-lg text-sm font-medium transition-all ${
                isCurrentWeek
                  ? 'bg-primary text-white shadow-md'
                  : isPastWeek
                  ? 'bg-primary/20 text-primary'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              V{weekNumber}
            </div>
          );
        })}
      </div>

      {/* Dagens status */}
      {!isCompleted && (
        <div className="mt-4 p-4 bg-background rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-gray-700">
              Idag är dag {daysInCurrentWeek} i vecka {currentWeek}
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
} 
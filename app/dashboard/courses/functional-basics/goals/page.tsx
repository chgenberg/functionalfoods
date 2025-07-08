'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTarget, FiCheckCircle, FiCalendar, FiTrendingUp,
  FiAward, FiStar
} from 'react-icons/fi';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  weekNumber: number;
}

export default function GoalsOverviewPage() {
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  useEffect(() => {
    const savedGoals = localStorage.getItem('functionalBasicsGoals');
    if (savedGoals) {
      setAllGoals(JSON.parse(savedGoals));
    }
  }, []);

  const weeks = [1, 2, 3, 4, 5, 6];
  const goalsByWeek = weeks.reduce((acc, week) => {
    acc[week] = allGoals.filter(goal => goal.weekNumber === week);
    return acc;
  }, {} as Record<number, Goal[]>);

  const totalGoals = allGoals.length;
  const completedGoals = allGoals.filter(g => g.completed).length;
  const completionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mina målsättningar</h1>
        <p className="text-gray-600 mt-2">Översikt över alla dina mål genom kursen</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Total framgång</h2>
            <p className="text-gray-600">Din övergripande måluppfyllelse</p>
          </div>
          <div className="text-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - completionRate / 100)}`}
                  className="text-green-600 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">{completionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <FiTarget className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
            <p className="text-sm text-gray-600">Totala mål</p>
          </div>
          <div>
            <FiCheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{completedGoals}</p>
            <p className="text-sm text-gray-600">Avklarade</p>
          </div>
          <div>
            <FiTrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalGoals - completedGoals}</p>
            <p className="text-sm text-gray-600">Kvar att göra</p>
          </div>
        </div>
      </div>

      {/* Week by Week Goals */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weeks.map((week) => {
          const weekGoals = goalsByWeek[week] || [];
          const weekCompleted = weekGoals.filter(g => g.completed).length;
          const weekTotal = weekGoals.length;
          
          return (
            <motion.div
              key={week}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedWeek(selectedWeek === week ? null : week)}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg px-3 py-1">
                    <span className="font-bold">Vecka {week}</span>
                  </div>
                  {weekTotal > 0 && weekCompleted === weekTotal && (
                    <FiAward className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
                <span className="text-sm text-gray-600">
                  {weekCompleted}/{weekTotal}
                </span>
              </div>

              {weekTotal > 0 ? (
                <>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(weekCompleted / weekTotal) * 100}%` }}
                      className="h-full bg-gradient-to-r from-green-500 to-teal-600"
                    />
                  </div>
                  
                  {selectedWeek === week && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2 mt-4"
                    >
                      {weekGoals.map((goal) => (
                        <div
                          key={goal.id}
                          className={`flex items-start space-x-2 p-2 rounded ${
                            goal.completed ? 'bg-green-50' : 'bg-gray-50'
                          }`}
                        >
                          {goal.completed ? (
                            <FiCheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${
                            goal.completed ? 'text-gray-600 line-through' : 'text-gray-800'
                          }`}>
                            {goal.text}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  <p className="text-sm">Inga mål satta ännu</p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Motivational Section */}
      <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
        <FiStar className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-4">Fortsätt så!</h3>
        <p className="text-lg">
          Varje mål du sätter och uppnår tar dig närmare en hälsosammare livsstil. 
          Kom ihåg att fira dina framsteg, stora som små!
        </p>
      </div>
    </div>
  );
} 
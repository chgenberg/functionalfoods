'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTarget, FiCheckCircle, FiCalendar, FiTrendingUp,
  FiAward, FiStar, FiClock, FiFlag,
  FiFilter, FiPlus, FiEdit3
} from 'react-icons/fi';
import { useGoals, Goal } from '@/app/hooks/useGoals';
import Link from 'next/link';

type FilterType = 'all' | 'active' | 'completed' | 'overdue';
type CategoryFilter = 'all' | 'weekly' | 'health' | 'nutrition' | 'exercise' | 'general';

export default function GoalsOverviewPage() {
  const { goals, loading, getGoalStats, getGoalsByCategory } = useGoals();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const stats = getGoalStats();
  const goalsByCategory = getGoalsByCategory();

  // Filter goals based on current filters
  const filteredGoals = goals.filter(goal => {
    if (filterType === 'active' && goal.status !== 'active') return false;
    if (filterType === 'completed' && goal.status !== 'completed') return false;
    if (filterType === 'overdue' && (goal.status === 'completed' || !goal.targetDate || new Date(goal.targetDate) >= new Date())) return false;
    if (categoryFilter !== 'all' && goal.category !== categoryFilter) return false;
    return true;
  });

  // Group goals by week
  const weeks = [1, 2, 3, 4, 5, 6];
  const goalsByWeek = weeks.reduce((acc, week) => {
    acc[week] = goals.filter(goal => goal.weekNumber === week);
    return acc;
  }, {} as Record<number, Goal[]>);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weekly': return <FiCalendar className="w-4 h-4" />;
      case 'health': return <FiTarget className="w-4 h-4" />;
      case 'nutrition': return <FiStar className="w-4 h-4" />;
      case 'exercise': return <FiTrendingUp className="w-4 h-4" />;
      default: return <FiFlag className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'weekly': return 'from-blue-500 to-blue-600';
      case 'health': return 'from-green-500 to-green-600';
      case 'nutrition': return 'from-purple-500 to-purple-600';
      case 'exercise': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mina målsättningar</h1>
          <p className="text-gray-600 mt-1 text-sm">Översikt över alla dina mål genom kursen</p>
        </div>
        <Link 
          href="/dashboard/courses/functional-basics"
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
        >
          <FiPlus className="w-4 h-4" />
          <span>Nytt mål</span>
        </Link>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Total framgång</h2>
            <p className="text-gray-600 text-sm">Din övergripande måluppfyllelse</p>
          </div>
          <div className="text-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - stats.completionRate / 100)}`}
                  className="text-green-600 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{stats.completionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <FiTarget className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-600">Totala mål</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <FiCheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
            <p className="text-xs text-gray-600">Avklarade</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <FiClock className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{stats.active}</p>
            <p className="text-xs text-gray-600">Aktiva</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <FiFlag className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-gray-900">{stats.overdue}</p>
            <p className="text-xs text-gray-600">Försenade</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <FiFilter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          
          <div className="flex space-x-1">
            {[
              { key: 'all', label: 'Alla' },
              { key: 'active', label: 'Aktiva' },
              { key: 'completed', label: 'Klara' },
              { key: 'overdue', label: 'Försenade' }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key as FilterType)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterType === filter.key
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="border-l pl-3 flex space-x-1">
            {[
              { key: 'all', label: 'Alla kategorier' },
              { key: 'weekly', label: 'Veckomål' },
              { key: 'health', label: 'Hälsa' },
              { key: 'nutrition', label: 'Näring' },
              { key: 'exercise', label: 'Träning' }
            ].map(category => (
              <button
                key={category.key}
                onClick={() => setCategoryFilter(category.key as CategoryFilter)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  categoryFilter === category.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goals by Category */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(goalsByCategory).map(([category, categoryGoals]) => {
          const completed = categoryGoals.filter(g => g.status === 'completed').length;
          const total = categoryGoals.length;
          
          return (
            <motion.div
              key={category}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`bg-gradient-to-r ${getCategoryColor(category)} text-white rounded-lg p-1.5`}>
                    {getCategoryIcon(category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm capitalize">{category}</h3>
                    <p className="text-xs text-gray-600">{completed}/{total} klara</p>
                  </div>
                </div>
                {total > 0 && completed === total && (
                  <FiAward className="w-5 h-5 text-yellow-500" />
                )}
              </div>

              {total > 0 && (
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completed / total) * 100}%` }}
                    className={`h-full bg-gradient-to-r ${getCategoryColor(category)}`}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Week by Week Goals */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mål per vecka</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weeks.map((week) => {
            const weekGoals = goalsByWeek[week] || [];
            const weekCompleted = weekGoals.filter(g => g.status === 'completed').length;
            const weekTotal = weekGoals.length;
            
            return (
              <motion.div
                key={week}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedWeek(selectedWeek === week ? null : week)}
                className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded px-2 py-0.5 text-sm">
                      <span className="font-semibold">Vecka {week}</span>
                    </div>
                    {weekTotal > 0 && weekCompleted === weekTotal && (
                      <FiAward className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <span className="text-xs text-gray-600">
                    {weekCompleted}/{weekTotal}
                  </span>
                </div>

                {weekTotal > 0 ? (
                  <>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
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
                        className="space-y-2 mt-3"
                      >
                        {weekGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className={`flex items-center justify-between p-2 rounded ${
                              goal.status === 'completed' ? 'bg-green-50' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {goal.status === 'completed' ? (
                                <FiCheckCircle className="w-3 h-3 text-green-600" />
                              ) : (
                                <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                              )}
                              <span className={`text-xs ${
                                goal.status === 'completed' ? 'text-gray-600 line-through' : 'text-gray-800'
                              }`}>
                                {goal.title}
                              </span>
                            </div>
                          </div>
                        ))}
                        <Link
                          href={`/dashboard/courses/functional-basics/week/${week}`}
                          className="block w-full text-center py-1.5 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors"
                        >
                          Hantera mål
                        </Link>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-3 text-gray-400">
                    <p className="text-xs">Inga mål satta</p>
                    <Link
                      href={`/dashboard/courses/functional-basics/week/${week}`}
                      className="text-orange-600 hover:text-orange-700 text-xs font-medium"
                    >
                      Sätt mål →
                    </Link>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Detailed Goals List */}
      {filteredGoals.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Alla mål</h2>
          
          <div className="space-y-3">
            {filteredGoals.map((goal) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg border ${
                  goal.status === 'completed'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {goal.status === 'completed' ? (
                      <FiCheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                    <div>
                      <h4 className={`font-medium text-sm ${
                        goal.status === 'completed' ? 'text-gray-600 line-through' : 'text-gray-900'
                      }`}>
                        {goal.title}
                      </h4>
                      {goal.description && (
                        <p className="text-xs text-gray-600 mt-0.5">{goal.description}</p>
                      )}
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(goal.priority)}`}>
                          {goal.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {goal.category} • Vecka {goal.weekNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {goal.status !== 'completed' && goal.progress > 0 && (
                      <div className="text-right">
                        <div className="text-xs font-medium text-gray-700">{goal.progress}%</div>
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                          <div 
                            className="h-1.5 bg-orange-600 rounded-full transition-all duration-300"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {goal.weekNumber && (
                      <Link
                        href={`/dashboard/courses/functional-basics/week/${goal.weekNumber}`}
                        className="p-1.5 text-gray-400 hover:text-orange-600 transition-colors"
                      >
                        <FiEdit3 className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Back to course link */}
      <div className="text-center">
        <Link
          href="/dashboard/courses/functional-basics"
          className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium"
        >
          <span>← Tillbaka till kursen</span>
        </Link>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTarget, FiCheckCircle, FiPlus, FiX, FiSave, FiCalendar,
  FiTrendingUp, FiFlag, FiClock, FiEdit3, FiTrash2
} from 'react-icons/fi';
import { useGoals, Goal, CreateGoalData } from '@/app/hooks/useGoals';

interface GoalsSectionProps {
  weekNumber: number;
}

export function GoalsSection({ weekNumber }: GoalsSectionProps) {
  const { 
    goals, 
    loading, 
    error, 
    createGoal, 
    updateGoal, 
    deleteGoal, 
    toggleGoalStatus,
    updateProgress,
    getGoalStats 
  } = useGoals(weekNumber, 'weekly');

  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoalData, setNewGoalData] = useState<CreateGoalData>({
    title: '',
    description: '',
    category: 'weekly',
    priority: 'medium'
  });

  const stats = getGoalStats();

  const handleCreateGoal = async () => {
    if (!newGoalData.title.trim()) return;

    const goalData = {
      ...newGoalData,
      weekNumber,
      courseId: 'functional-basics'
    };

    const success = await createGoal(goalData);
    if (success) {
      setNewGoalData({
        title: '',
        description: '',
        category: 'weekly',
        priority: 'medium'
      });
      setIsAdding(false);
    }
  };

  const handleUpdateGoal = async (goal: Goal) => {
    if (!editingGoal) return;

    await updateGoal({
      id: editingGoal.id,
      title: editingGoal.title,
      description: editingGoal.description,
      priority: editingGoal.priority
    });
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (id: string) => {
    if (window.confirm('Är du säker på att du vill ta bort detta mål?')) {
      await deleteGoal(id);
    }
  };

  const handleProgressUpdate = async (id: string, progress: number) => {
    await updateProgress(id, progress);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <FiFlag className="w-4 h-4" />;
      case 'medium': return <FiTrendingUp className="w-4 h-4" />;
      case 'low': return <FiClock className="w-4 h-4" />;
      default: return <FiTarget className="w-4 h-4" />;
    }
  };

  if (loading && goals.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 rounded-full p-3">
            <FiTarget className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mina mål för vecka {weekNumber}</h2>
            <p className="text-gray-600 text-sm">Sätt och följ upp dina veckomål</p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
        >
          <FiPlus className="w-4 h-4" />
          <span>Nytt mål</span>
        </button>
      </div>

      {/* Stats */}
      {goals.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-600">Totalt</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-green-600">Klara</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.active}</div>
            <div className="text-sm text-yellow-600">Aktiva</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
            <div className="text-sm text-purple-600">Klarat</div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        <AnimatePresence>
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                goal.status === 'completed'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:border-orange-200'
              }`}
            >
              {editingGoal?.id === goal.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingGoal.title}
                    onChange={(e) => setEditingGoal({...editingGoal, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                  />
                  <textarea
                    value={editingGoal.description || ''}
                    onChange={(e) => setEditingGoal({...editingGoal, description: e.target.value})}
                    placeholder="Beskrivning (valfritt)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                    rows={2}
                  />
                  <div className="flex items-center space-x-3">
                    <select
                      value={editingGoal.priority}
                      onChange={(e) => setEditingGoal({...editingGoal, priority: e.target.value as Goal['priority']})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                    >
                      <option value="low">Låg prioritet</option>
                      <option value="medium">Medium prioritet</option>
                      <option value="high">Hög prioritet</option>
                    </select>
                    <button
                      onClick={() => handleUpdateGoal(goal)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FiSave className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingGoal(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <button
                      onClick={() => toggleGoalStatus(goal.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        goal.status === 'completed'
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-300 hover:border-orange-600'
                      }`}
                    >
                      {goal.status === 'completed' && (
                        <FiCheckCircle className="w-4 h-4 text-white" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-lg font-medium ${
                          goal.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {goal.title}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(goal.priority)}`}>
                          {getPriorityIcon(goal.priority)}
                          <span className="ml-1 capitalize">{goal.priority}</span>
                        </span>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                      
                      {/* Progress Bar */}
                      {goal.status !== 'completed' && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Framsteg</span>
                            <span>{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {goal.status !== 'completed' && (
                      <div className="flex items-center space-x-1">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={goal.progress}
                          onChange={(e) => handleProgressUpdate(goal.id, parseInt(e.target.value))}
                          className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                    
                    <button
                      onClick={() => setEditingGoal(goal)}
                      className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add New Goal Form */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-orange-50 rounded-lg border-2 border-orange-200"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={newGoalData.title}
                onChange={(e) => setNewGoalData({...newGoalData, title: e.target.value})}
                placeholder="Vad vill du uppnå denna vecka?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                autoFocus
              />
              <textarea
                value={newGoalData.description || ''}
                onChange={(e) => setNewGoalData({...newGoalData, description: e.target.value})}
                placeholder="Beskrivning (valfritt)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                rows={2}
              />
              <div className="flex items-center space-x-3">
                <select
                  value={newGoalData.priority}
                  onChange={(e) => setNewGoalData({...newGoalData, priority: e.target.value as Goal['priority']})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-600"
                >
                  <option value="low">Låg prioritet</option>
                  <option value="medium">Medium prioritet</option>
                  <option value="high">Hög prioritet</option>
                </select>
                <button
                  onClick={handleCreateGoal}
                  disabled={!newGoalData.title.trim() || loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setNewGoalData({
                      title: '',
                      description: '',
                      category: 'weekly',
                      priority: 'medium'
                    });
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Empty State */}
      {goals.length === 0 && !isAdding && !loading && (
        <div className="text-center py-12">
          <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4">
            <FiTarget className="w-12 h-12 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Inga mål ännu</h3>
          <p className="text-gray-600 mb-4">Sätt ditt första mål för vecka {weekNumber}</p>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Skapa mål</span>
          </button>
        </div>
      )}

      {/* Progress Summary */}
      {goals.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Veckans framsteg</h4>
              <p className="text-sm text-gray-600">
                {stats.completed} av {stats.total} mål klara
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-600">{stats.completionRate}%</div>
              <div className="text-sm text-gray-600">Genomfört</div>
            </div>
          </div>
          <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.completionRate}%` }}
              className="h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      )}
    </div>
  );
} 
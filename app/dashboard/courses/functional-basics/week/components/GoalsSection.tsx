'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiTarget, FiCheckCircle, FiPlus, FiX, FiSave
} from 'react-icons/fi';

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  weekNumber: number;
}

interface GoalsSectionProps {
  weekNumber: number;
}

export function GoalsSection({ weekNumber }: GoalsSectionProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('functionalBasicsGoals');
    if (savedGoals) {
      const allGoals = JSON.parse(savedGoals);
      setGoals(allGoals.filter((g: Goal) => g.weekNumber === weekNumber));
    }
  }, [weekNumber]);

  // Save goals to localStorage
  const saveGoals = (updatedGoals: Goal[]) => {
    const savedGoals = localStorage.getItem('functionalBasicsGoals');
    let allGoals = savedGoals ? JSON.parse(savedGoals) : [];
    
    // Remove old goals for this week
    allGoals = allGoals.filter((g: Goal) => g.weekNumber !== weekNumber);
    
    // Add updated goals
    allGoals = [...allGoals, ...updatedGoals];
    
    localStorage.setItem('functionalBasicsGoals', JSON.stringify(allGoals));
    setGoals(updatedGoals);
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      const goal: Goal = {
        id: Date.now().toString(),
        text: newGoal,
        completed: false,
        weekNumber
      };
      saveGoals([...goals, goal]);
      setNewGoal('');
      setIsAdding(false);
    }
  };

  const toggleGoal = (id: string) => {
    const updatedGoals = goals.map(goal =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    );
    saveGoals(updatedGoals);
  };

  const deleteGoal = (id: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== id);
    saveGoals(updatedGoals);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 rounded-full p-3">
            <FiTarget className="w-6 h-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Mina mål för vecka {weekNumber}</h2>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Lägg till mål</span>
        </button>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              goal.completed
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200 hover:border-orange-200'
            }`}
          >
            <div className="flex items-center space-x-3 flex-1">
              <button
                onClick={() => toggleGoal(goal.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  goal.completed
                    ? 'bg-green-600 border-green-600'
                    : 'border-gray-300 hover:border-orange-600'
                }`}
              >
                {goal.completed && <FiCheckCircle className="w-4 h-4 text-white" />}
              </button>
              <span className={`text-lg ${
                goal.completed ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}>
                {goal.text}
              </span>
            </div>
            <button
              onClick={() => deleteGoal(goal.id)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </motion.div>
        ))}

        {/* Add new goal form */}
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg border-2 border-orange-200"
          >
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              placeholder="Skriv ditt mål här..."
              className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-200 focus:outline-none focus:border-orange-600"
              autoFocus
            />
            <button
              onClick={addGoal}
              className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <FiSave className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewGoal('');
              }}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>

      {goals.length === 0 && !isAdding && (
        <div className="text-center py-8 text-gray-500">
          <p>Du har inga mål satta för denna vecka än.</p>
          <p className="text-sm mt-2">Klicka på "Lägg till mål" för att sätta ditt första mål!</p>
        </div>
      )}

      {/* Progress Summary */}
      {goals.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Framsteg</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(goals.filter(g => g.completed).length / goals.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {goals.filter(g => g.completed).length}/{goals.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
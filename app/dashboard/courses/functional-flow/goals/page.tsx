'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Check, Clock } from 'lucide-react';

interface Goal {
  id: string;
  week: number;
  title: string;
  description: string;
  completed: boolean;
}

const weeklyGoals: Goal[] = [
  {
    id: 'flow-w1',
    week: 1,
    title: 'Antiinflammatorisk start',
    description: 'Påbörja din resa med fokus på antiinflammatoriska livsmedel. Introducera gurkmeja, ingefära och omega-3-rika fetter i din dagliga kost.',
    completed: false,
  },
  {
    id: 'flow-w2',
    week: 2,
    title: 'Tarmhälsa i fokus',
    description: 'Optimera din tarmflora med fermenterade livsmedel och prebiotika. Inkludera kimchi, kombucha och fibrer från grönsaker.',
    completed: false,
  },
  {
    id: 'flow-w3',
    week: 3,
    title: 'Avancerad näringsdensitet',
    description: 'Maximera näringsintaget genom superfoods och adaptogener. Integrera spirulina, ashwagandha och andra kraftfulla råvaror.',
    completed: false,
  },
  {
    id: 'flow-w4',
    week: 4,
    title: 'Energioptimering',
    description: 'Stabilisera blodsockernivåer och öka uthålligheten. Fokusera på komplexa kolhydrater och balanserade måltider.',
    completed: false,
  },
  {
    id: 'flow-w5',
    week: 5,
    title: 'Mental klarhet',
    description: 'Förbättra kognitiv funktion med hjärnmat. Inkludera omega-3, antioxidanter och B-vitaminer för optimal hjärnhälsa.',
    completed: false,
  },
  {
    id: 'flow-w6',
    week: 6,
    title: 'Livslång transformation',
    description: 'Konsolidera dina nya vanor och planera för framtiden. Skapa en hållbar livsstil baserad på functional foods-principerna.',
    completed: false,
  },
];

export default function FlowGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(weeklyGoals);

  const toggleGoal = (goalId: string) => {
    setGoals(prevGoals =>
      prevGoals.map(goal =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const completedGoals = goals.filter(goal => goal.completed).length;
  const completionPercentage = (completedGoals / goals.length) * 100;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dina mål - Functional Flow</h1>
        <p className="text-gray-600">
          Följ din utveckling genom de avancerade veckorna av Functional Flow
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Din framgång</h2>
          <span className="text-2xl font-bold text-[#1a4d78]">
            {Math.round(completionPercentage)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <motion.div
            className="bg-primary h-4 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        <p className="text-gray-600">
          {completedGoals} av {goals.length} mål uppnådda
        </p>
      </div>

      {/* Weekly Goals */}
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all ${
              goal.completed ? 'ring-2 ring-[#1a4d78] ring-opacity-50' : ''
            }`}
            onClick={() => toggleGoal(goal.id)}
          >
            <div className="flex items-start gap-4">
              <button
                className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  goal.completed
                    ? 'bg-[#1a4d78] border-[#1a4d78]'
                    : 'border-gray-300 hover:border-[#1a4d78]'
                }`}
              >
                {goal.completed && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-[#1a4d78] bg-[#1a4d78]/10 px-3 py-1 rounded-full">
                    Vecka {goal.week}
                  </span>
                  <h3 className={`text-lg font-semibold ${
                    goal.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}>
                    {goal.title}
                  </h3>
                </div>
                
                <p className={`text-gray-600 ${
                  goal.completed ? 'opacity-60' : ''
                }`}>
                  {goal.description}
                </p>
              </div>
              
              <div className="text-gray-400">
                {goal.completed ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 bg-gradient-to-r from-[#1a4d78] to-[#2563a8] rounded-xl p-6 text-white"
      >
        <div className="flex items-center gap-3 mb-3">
          <Target className="w-6 h-6" />
          <h3 className="text-xl font-semibold">Fortsätt din avancerade resa!</h3>
        </div>
        <p className="leading-relaxed">
          Functional Flow tar dig till nästa nivå av hälsa och välmående. Varje vecka bygger på den förra, 
          och tillsammans skapar de en kraftfull transformation. Fortsätt utforska de avancerade koncepten 
          och känn hur din kropp och sinne optimeras!
        </p>
      </motion.div>
    </div>
  );
} 
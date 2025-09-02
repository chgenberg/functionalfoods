'use client';

import { motion } from 'framer-motion';

import Link from 'next/link';
import { Book, Heart, Clock, TrendingUp, Award, Star, ChevronRight } from 'lucide-react';

interface DayMeals {
  breakfast?: { name: string; recipeLink?: string };
  lunch?: { name: string; recipeLink?: string };
  dinner?: { name: string; recipeLink?: string };
}

export function WeekSummary() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4 text-gray-900">Välkommen till Functional Flow!</h2>
      <div className="prose prose-lg text-gray-700">
        <p>
          Denna vecka introducerar vi avancerade Functional Foods-koncept som bygger vidare på 
          grunderna från Basic-kursen. Du kommer att lära dig om:
        </p>
        <ul className="space-y-2 mt-4">
          <li className="flex items-start gap-2">
            <Star className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <span>Optimering av näringsupptag genom strategisk måltidsplanering</span>
          </li>
          <li className="flex items-start gap-2">
            <Star className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <span>Avancerade tillagningsmetoder för maximal näringsbevaring</span>
          </li>
          <li className="flex items-start gap-2">
            <Star className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
            <span>Synergistiska livsmedelskombinationer för förbättrad hälsa</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}

export function KnowledgeSection() {
  const topics = [
    {
      icon: Book,
      title: "Nutrient Timing",
      description: "Lär dig när på dagen olika näringsämnen har maximal effekt",
      link: "/dashboard/courses/functional-flow/week/1/nutrient-timing"
    },
    {
      icon: Heart,
      title: "Anti-inflammatorisk kost",
      description: "Fördjupning i livsmedel som minskar inflammation",
      link: "/dashboard/courses/functional-flow/week/1/anti-inflammatory"
    },
    {
      icon: Clock,
      title: "Intermittent fasting",
      description: "Introduktion till strategisk fasta för optimal hälsa",
      link: "/dashboard/courses/functional-flow/week/1/intermittent-fasting"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-900">Veckans kunskapsområden</h3>
      <div className="grid gap-4">
        {topics.map((topic, index) => (
          <Link
            key={index}
            href={topic.link}
            className="group flex items-start gap-4 p-4 rounded-lg hover:bg-teal-50 transition-colors"
          >
            <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
              <topic.icon className="w-6 h-6 text-teal-700" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                {topic.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{topic.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 mt-2 transition-colors" />
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export function MotivationSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 shadow-lg"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-full shadow-md">
          <Award className="w-8 h-8 text-teal-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2 text-gray-900">Veckans utmaning</h3>
          <p className="text-gray-700 mb-4">
            Testa minst 3 nya Flow-recept denna vecka och dokumentera hur du känner dig efter varje måltid. 
            Notera energinivåer, mättnadskänsla och eventuella positiva förändringar.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-teal-700">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Svårighetsgrad: Medium</span>
            </span>
            <span className="flex items-center gap-1 text-teal-700">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Tid: 7 dagar</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function RecipeHighlights({ mealPlan }: { mealPlan: Record<string, DayMeals> }) {
  const featuredRecipes = [
    {
      day: 'Måndag',
      meal: 'Frukost',
      recipe: mealPlan['Måndag']?.breakfast?.name || 'Yoghurt med bovetegranola',
      benefits: 'Rik på probiotika och långsamma kolhydrater'
    },
    {
      day: 'Onsdag',
      meal: 'Middag',
      recipe: mealPlan['Onsdag']?.dinner?.name || 'Lax med quinoasallad',
      benefits: 'Omega-3 fettsyror och komplett protein'
    },
    {
      day: 'Fredag',
      meal: 'Lunch',
      recipe: mealPlan['Fredag']?.lunch?.name || 'Grönkålssallad',
      benefits: 'Antioxidanter och järn'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold mb-4 text-gray-900">Veckans höjdpunkter</h3>
      <div className="space-y-4">
        {featuredRecipes.map((item, index) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Star className="w-5 h-5 text-teal-700" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">
                {item.day} - {item.meal}
              </h4>
              <p className="text-teal-700 font-medium">{item.recipe}</p>
              <p className="text-sm text-gray-600 mt-1">{item.benefits}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
} 
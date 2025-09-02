'use client';

import Link from 'next/link';
import { useState } from 'react';

import { GiBrain, GiStomach, GiFruitBowl, GiWheat, GiMeal, GiHerbsBundle, GiWaterBottle, GiMeat, GiAlgae } from 'react-icons/gi';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Book, Coffee, Heart, Activity, Target, Award, ChevronRight } from 'lucide-react';

interface FoodCategory {
  id: number;
  name: string;
  icon: React.ElementType;
  description: string;
  examples: string[];
  color: string;
}

export default function VadArFunctionalFoodsPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const foodCategories: FoodCategory[] = [
    {
      id: 1,
      name: 'Antioxidantrik mat',
      icon: GiFruitBowl,
      description: 'Färgglada frukter och grönsaker som stödjer cellulär hälsa och bekämpar oxidativ stress.',
      examples: ['Blåbär', 'Granatäpple', 'Grönt te', 'Mörk choklad', 'Röd paprika'],
      color: 'from-purple-400 to-pink-400'
    },
    {
      id: 2,
      name: 'Grön mat, vitaminer och mineraler',
      icon: GiAlgae,
      description: 'Havsgrönsaker och mikroalger som är riktiga näringsbomber.',
      examples: ['Spirulina', 'Chlorella', 'Nori', 'Wakame', 'Grönkål'],
      color: 'from-green-400 to-teal-400'
    },
    {
      id: 3,
      name: 'Fiberrika livsmedel',
      icon: GiWheat,
      description: 'Främjar en sund matsmältning och regelbunden tarmfunktion.',
      examples: ['Havregryn', 'Quinoa', 'Linfrön', 'Äpplen', 'Broccoli'],
      color: 'from-yellow-400 to-orange-400'
    },
    {
      id: 4,
      name: 'Probiotikarika livsmedel',
      icon: GiStomach,
      description: 'Stödjer tarmhälsan med goda bakterier.',
      examples: ['Yoghurt', 'Kefir', 'Kimchi', 'Sauerkraut', 'Kombucha'],
      color: 'from-blue-400 to-indigo-400'
    },
    {
      id: 5,
      name: 'Prebiotikarika livsmedel',
      icon: GiMeal,
      description: 'Näring för de goda bakterierna i tarmen.',
      examples: ['Vitlök', 'Lök', 'Sparris', 'Banan', 'Havre'],
      color: 'from-indigo-400 to-purple-400'
    },
    {
      id: 6,
      name: 'Omega-3-rika livsmedel',
      icon: Heart,
      description: 'Essentiella fettsyror för hjärta och hjärna.',
      examples: ['Lax', 'Sardiner', 'Valnötter', 'Chiafrön', 'Hampafrön'],
      color: 'from-red-400 to-pink-400'
    },
    {
      id: 7,
      name: 'Nötter och frön',
      icon: GiBrain,
      description: 'Kraftpaket av näringsämnen och hälsosamma fetter.',
      examples: ['Mandlar', 'Cashewnötter', 'Pumpafrön', 'Solrosfrön', 'Paranötter'],
      color: 'from-amber-400 to-yellow-400'
    },
    {
      id: 8,
      name: 'Kryddor, örter och te',
      icon: GiHerbsBundle,
      description: 'Naturens egna läkemedel med kraftfulla hälsoegenskaper.',
      examples: ['Gurkmeja', 'Ingefära', 'Kanel', 'Rosmarin', 'Grönt te'],
      color: 'from-orange-400 to-red-400'
    },
    {
      id: 9,
      name: 'Benbuljong',
      icon: GiWaterBottle,
      description: 'Rik på kollagen, mineraler och aminosyror.',
      examples: ['Kycklingbuljong', 'Nötbuljong', 'Fiskbuljong'],
      color: 'from-gray-400 to-gray-600'
    },
    {
      id: 10,
      name: 'Animaliskt protein',
      icon: GiMeat,
      description: 'Högkvalitativa proteinkällor för stark kropp.',
      examples: ['Närproducerat kött', 'Ekologisk kyckling', 'MSC-märkt fisk', 'KRAV-märkta ägg'],
      color: 'from-red-500 to-red-700'
    }
  ];

  const quizQuestions = [
    {
      question: 'Vad betyder Functional Foods?',
      options: ['Snabbmat', 'Mervärdesmat med hälsofördelar', 'Kosttillskott', 'Lågkalorimat'],
      correct: 1
    },
    {
      question: 'Vilken av dessa är INTE en kategori inom Functional Foods?',
      options: ['Antioxidantrik mat', 'Processad mat', 'Omega-3-rika livsmedel', 'Probiotikarika livsmedel'],
      correct: 1
    },
    {
      question: 'Vad är huvudsyftet med Functional Foods?',
      options: ['Gå ner i vikt', 'Ge mervärde utöver att mätta', 'Ersätta medicin', 'Spara pengar'],
      correct: 1
    }
  ];

  const handleQuizAnswer = (answerIndex: number) => {
    if (answerIndex === quizQuestions[currentQuestion].correct) {
      setQuizScore(quizScore + 1);
    }
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed
      setTimeout(() => {
        setShowQuiz(false);
        setCurrentQuestion(0);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/courses/functional-basics/material" className="inline-flex items-center text-primary hover:text-primary-dark transition-colors mb-4">
            <ArrowLeft className="mr-2" />
            Tillbaka till kursmaterial
          </Link>
        </div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mr-4">
              <GiBrain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Vad är Functional Foods?</h1>
              <p className="text-gray-600">Grunderna i mervärdesmat</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              <span className="font-semibold text-primary">Functional Foods</span>, även känt som mervärdesmat eller hälsofrämjande livsmedel, 
              är naturliga livsmedel som innehåller biologiskt aktiva ämnen. Dessa ger en kliniskt bevisad och dokumenterad hälsofördel 
              när det gäller förebyggande eller behandling av kroniska sjukdomar eller dess symtom.
            </p>

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-6">
              <p className="text-lg font-medium text-gray-800 mb-0">
                💡 Tänk dig "läkande" livsmedel som mättar, gynnar ditt immunförsvar, förbättrar din matsmältning 
                och ger din hjärna en riktig boost!
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed">
              Mervärdesmat minskar dessutom risken för utveckling av störningar i ämnesomsättningen som hotar hälsan (metabolt syndrom).
              Det handlar om mat som inte bara mättar utan också förbättrar din hälsa, stärker immunförsvaret och ger din matsmältning en boost.
            </p>
          </div>
        </motion.div>

        {/* Interactive Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">De 10 livsmedelskategorierna</h2>
          <p className="text-gray-600 mb-8">Klicka på varje kategori för att lära dig mer!</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {foodCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                  className="cursor-pointer"
                >
                  <div className={`relative overflow-hidden rounded-xl p-4 transition-all duration-300 ${
                    selectedCategory === category.id ? 'ring-2 ring-primary shadow-lg' : 'shadow-md hover:shadow-lg'
                  }`}>
                    <div className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-10`} />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className="w-8 h-8 text-gray-700 mr-3" />
                        <span className="font-medium text-gray-800">{category.name}</span>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${
                        selectedCategory === category.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Category Details */}
          <AnimatePresence>
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {foodCategories.map((category) => {
                  if (category.id === selectedCategory) {
                    return (
                      <div key={category.id} className="bg-gray-50 rounded-xl p-6 mb-4">
                        <h3 className="font-semibold text-lg text-gray-800 mb-2">{category.name}</h3>
                        <p className="text-gray-600 mb-4">{category.description}</p>
                        <div>
                          <p className="font-medium text-gray-700 mb-2">Exempel:</p>
                          <div className="flex flex-wrap gap-2">
                            {category.examples.map((example, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm">
                                {example}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Origins Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Functional Foods ursprung</h2>
          <p className="text-gray-700 leading-relaxed">
            Functional Foods har rötter i tidig medicinsk användning av mat, örter och drycker. 
            Konceptet har sedan utvecklats till en vetenskapligt stödd industri driven av forskning, 
            teknologiska framsteg och ökad konsumentmedvetenhet. Idag är Functional Foods en integrerad 
            del av den globala livsmedelsmarknaden, med ett ständigt växande utbud av produkter som 
            stödjer olika aspekter av hälsan.
          </p>
        </motion.div>

        {/* Interactive Quiz */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-primary to-accent text-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Testa din kunskap! 🎯</h2>
          
          {!showQuiz ? (
            <div>
              <p className="mb-6">Klar att testa vad du lärt dig om Functional Foods?</p>
              <button
                onClick={() => setShowQuiz(true)}
                className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Starta quiz
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {currentQuestion < quizQuestions.length ? (
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <p className="text-lg mb-6">{quizQuestions[currentQuestion].question}</p>
                  <div className="space-y-3">
                    {quizQuestions[currentQuestion].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(idx)}
                        className="w-full text-left bg-white/20 hover:bg-white/30 p-4 rounded-lg transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <Award className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-2xl font-bold mb-2">Quiz slutfört!</p>
                  <p className="text-lg">Du fick {quizScore} av {quizQuestions.length} rätt!</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Nästa steg</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">Nu när du förstår grunderna, är det dags att upptäcka alla fördelar!</p>
              <Link href="/dashboard/courses/functional-basics/material/fordelarna-med-functional-foods" 
                className="inline-flex items-center text-primary hover:text-primary-dark font-medium">
                Fortsätt till nästa modul
                <ChevronRight className="ml-1" />
              </Link>
            </div>
            <CheckCircle className="w-12 h-12 text-primary" />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
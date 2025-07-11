"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiX, FiCheckCircle } from 'react-icons/fi';
import Image from 'next/image';
import QuizResultScreen from './QuizResultScreen';

interface QuizOption {
  label: string;
  description: string;
  value: string;
  icon: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  subtitle: string;
  icon: string;
  options: QuizOption[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Hur skulle du beskriva din nuvarande energinivå?",
    subtitle: "Vi vill förstå hur du känner dig under en typisk dag",
    icon: "⚡",
    options: [
      {
        label: "Hög energi genom hela dagen",
        description: "Jag känner mig pigg och alert från morgon till kväll",
        value: "high_energy",
        icon: "🚀"
      },
      {
        label: "Bra energi men trötthet på eftermiddagen",
        description: "Jag börjar bra men får ofta en energidipp runt lunch",
        value: "afternoon_dip",
        icon: "📈"
      },
      {
        label: "Varierande energi under dagen",
        description: "Vissa dagar är bra, andra känns tunga",
        value: "variable_energy",
        icon: "🎢"
      },
      {
        label: "Låg energi och konstant trötthet",
        description: "Jag känner mig trött och utmattad det mesta av tiden",
        value: "low_energy",
        icon: "😴"
      }
    ]
  },
  {
    id: 2,
    question: "Hur ser din typiska sömn ut?",
    subtitle: "Sömnkvalitet påverkar allt från energi till immunförsvar",
    icon: "🌙",
    options: [
      {
        label: "Utmärkt sömn (7-9 timmar, vaknar utvilad)",
        description: "Jag somnar lätt och vaknar pigg på morgonen",
        value: "excellent_sleep",
        icon: "✨"
      },
      {
        label: "Bra sömn men vaknar ibland under natten",
        description: "Generellt bra men inte alltid djup sömn",
        value: "good_sleep",
        icon: "🌟"
      },
      {
        label: "Svårt att somna eller vaknar ofta",
        description: "Det tar tid att somna eller jag vaknar flera gånger",
        value: "disrupted_sleep",
        icon: "🌀"
      },
      {
        label: "Dålig sömn (för lite eller dålig kvalitet)",
        description: "Jag sover för kort eller vaknar inte utvilad",
        value: "poor_sleep",
        icon: "😵"
      }
    ]
  },
  {
    id: 3,
    question: "Hur hanterar du stress i vardagen?",
    subtitle: "Stress påverkar både fysisk och mental hälsa betydligt",
    icon: "🧠",
    options: [
      {
        label: "Hanterar stress mycket bra",
        description: "Jag har bra strategier och känner mig sällan överväldigad",
        value: "low_stress",
        icon: "🧘"
      },
      {
        label: "Måttlig stress, klarar det mesta",
        description: "Ibland stressig men hittar balans",
        value: "moderate_stress",
        icon: "⚖️"
      },
      {
        label: "Ofta stressad och överväldigad",
        description: "Känner press från jobb, familj eller andra åtaganden",
        value: "high_stress",
        icon: "😰"
      },
      {
        label: "Konstant stress och ångest",
        description: "Jag känner mig nästan alltid stressad eller orolig",
        value: "chronic_stress",
        icon: "🌪️"
      }
    ]
  },
  {
    id: 4,
    question: "Hur ofta tränar du per vecka?",
    subtitle: "Motion är grundläggande för hälsa och välmående",
    icon: "🏃‍♀️",
    options: [
      {
        label: "5+ gånger per vecka",
        description: "Jag tränar regelbundet och motion är en viktig del av min vardag",
        value: "very_active",
        icon: "💪"
      },
      {
        label: "3-4 gånger per vecka",
        description: "Jag tränar regelbundet men inte varje dag",
        value: "active",
        icon: "🏋️"
      },
      {
        label: "1-2 gånger per vecka",
        description: "Jag tränar ibland men skulle vilja göra det mer",
        value: "somewhat_active",
        icon: "🚶"
      },
      {
        label: "Sällan eller aldrig",
        description: "Jag får för lite motion i min vardag",
        value: "sedentary",
        icon: "🛋️"
      }
    ]
  },
  {
    id: 5,
    question: "Hur ser dina matvanor ut?",
    subtitle: "Kosten är grunden för all hälsa och energi",
    icon: "🥗",
    options: [
      {
        label: "Mycket hälsosam och balanserad kost",
        description: "Jag äter varierat med mycket grönsaker, protein och fullkorn",
        value: "excellent_diet",
        icon: "🌱"
      },
      {
        label: "Ganska hälsosam men kan förbättras",
        description: "Jag försöker äta hälsosamt men lyckas inte alltid",
        value: "good_diet",
        icon: "🥙"
      },
      {
        label: "Blandat - vissa måltider hälsosamma",
        description: "Vissa dagar bra, andra mer snabbmat och socker",
        value: "mixed_diet",
        icon: "🍕"
      },
      {
        label: "Ohälsosam kost med mycket processad mat",
        description: "Jag äter ofta snabbmat, socker och processade produkter",
        value: "poor_diet",
        icon: "🍟"
      }
    ]
  },
  {
    id: 6,
    question: "Hur är din mage och matsmältning?",
    subtitle: "Tarmhälsan är central för immunförsvar och välmående",
    icon: "🦠",
    options: [
      {
        label: "Utmärkt - inga problem",
        description: "Min mage mår bra och jag har regelbunden matsmältning",
        value: "excellent_digestion",
        icon: "✅"
      },
      {
        label: "Mest bra med tillfälliga problem",
        description: "Ibland uppblåst eller obekväm efter vissa måltider",
        value: "occasional_issues",
        icon: "🤔"
      },
      {
        label: "Regelbundna magproblem",
        description: "Ofta uppblåst, gaser eller oregelbunden matsmältning",
        value: "frequent_issues",
        icon: "😣"
      },
      {
        label: "Konstanta besvär",
        description: "Dagliga problem med magen, smärta eller discomfort",
        value: "chronic_issues",
        icon: "😖"
      }
    ]
  },
  {
    id: 7,
    question: "Hur ofta blir du sjuk (förkylning, influensa)?",
    subtitle: "Immunförsvaret speglar din allmänna hälsostatus",
    icon: "🛡️",
    options: [
      {
        label: "Sällan eller aldrig sjuk",
        description: "Jag har stark immunitet och blir knappt sjuk",
        value: "strong_immunity",
        icon: "💪"
      },
      {
        label: "1-2 gånger per år",
        description: "Normalt immunförsvar, blir sjuk ibland",
        value: "normal_immunity",
        icon: "🌡️"
      },
      {
        label: "3-4 gånger per år",
        description: "Blir sjuk ganska ofta, särskilt under vintermånaderna",
        value: "frequent_illness",
        icon: "🤧"
      },
      {
        label: "Mycket ofta sjuk",
        description: "Jag verkar fånga upp allt som går omkring",
        value: "weak_immunity",
        icon: "🤒"
      }
    ]
  },
  {
    id: 8,
    question: "Hur är ditt fokus och koncentration?",
    subtitle: "Mental klarhet är viktig för produktivitet och livskvalitet",
    icon: "🎯",
    options: [
      {
        label: "Utmärkt fokus och mental klarhet",
        description: "Jag kan koncentrera mig lätt och tänka klart hela dagen",
        value: "excellent_focus",
        icon: "🔍"
      },
      {
        label: "Bra fokus men trötthet påverkar",
        description: "Generellt bra men svårare när jag är trött",
        value: "good_focus",
        icon: "👁️"
      },
      {
        label: "Svårt att koncentrera sig",
        description: "Jag distraheras lätt och har svårt att fokusera länge",
        value: "poor_focus",
        icon: "🌀"
      },
      {
        label: "Ständig hjärndimma och förvirring",
        description: "Jag känner mig ofta förvirrad och har svårt att tänka klart",
        value: "brain_fog",
        icon: "☁️"
      }
    ]
  },
  {
    id: 9,
    question: "Vilken är din största hälsoutmaning just nu?",
    subtitle: "Vi vill förstå vad som oroar dig mest med din hälsa",
    icon: "⚠️",
    options: [
      {
        label: "Vikthantering",
        description: "Jag vill gå ner eller upp i vikt på ett hälsosamt sätt",
        value: "weight_management",
        icon: "⚖️"
      },
      {
        label: "Energi och trötthet",
        description: "Jag känner mig ofta trött och vill ha mer energi",
        value: "energy_fatigue",
        icon: "🔋"
      },
      {
        label: "Stress och återhämtning",
        description: "Jag behöver bättre stresshantering och vila",
        value: "stress_recovery",
        icon: "🧘"
      },
      {
        label: "Allmän hälsa och prevention",
        description: "Jag vill optimera min hälsa och förebygga sjukdom",
        value: "general_health",
        icon: "🌟"
      }
    ]
  },
  {
    id: 10,
    question: "Vad är ditt huvudsakliga mål med functional food?",
    subtitle: "Slutligen, vad hoppas du uppnå genom förbättrad näring?",
    icon: "🎯",
    options: [
      {
        label: "Mer energi och vitalitet",
        description: "Jag vill känna mig piggare och mer livlig",
        value: "energy_vitality",
        icon: "⚡"
      },
      {
        label: "Bättre immunförsvar",
        description: "Jag vill stärka min motståndskraft mot sjukdomar",
        value: "immunity_boost",
        icon: "🛡️"
      },
      {
        label: "Förbättrad matsmältning",
        description: "Jag vill ha en hälsosammare mage och tarm",
        value: "digestive_health",
        icon: "🦠"
      },
      {
        label: "Mental klarhet och fokus",
        description: "Jag vill tänka klarare och vara mer fokuserad",
        value: "mental_clarity",
        icon: "🧠"
      }
    ]
  }
];

interface HealthQuizProps {
  onComplete?: (answers: Record<number, string>) => void;
  onClose?: () => void;
}

const HealthQuiz: React.FC<HealthQuizProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'quiz' | 'result'>('quiz');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  const startQuiz = () => {
    setCurrentStep('quiz');
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = {
      ...answers,
      [currentQuestion]: answer
    };
    setAnswers(newAnswers);

    setIsAnimating(true);
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setCurrentStep('result');
        onComplete?.(newAnswers);
      }
      setIsAnimating(false);
    }, 300);
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const resetQuiz = () => {
    setCurrentStep('welcome');
    setCurrentQuestion(0);
    setAnswers({});
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const question = quizQuestions[currentQuestion];

  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="absolute top-20 left-20 w-96 h-96 bg-green-300 rounded-full filter blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.1, scale: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl"
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto relative z-10"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left side - Content */}
              <div className="p-8 md:p-12 order-2 lg:order-1">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-8"
                >
                  <h1 className="text-3xl md:text-5xl font-light mb-4 text-gray-800 leading-tight">
                    UPPTÄCK DIN PERFEKTA
                    <span className="text-green-600 font-bold block">FUNCTIONAL FOOD</span>
                  </h1>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    Få personaliserade rekommendationer baserat på din livsstil och hälsobehov enligt <strong className="text-green-700">Ulrika Davidssons</strong> beprövade metod.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="space-y-4 mb-8"
                >
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-2xl hover:shadow-md transition-shadow">
                    <div className="text-2xl">🎯</div>
                    <span className="text-gray-700 font-medium">Personaliserade rekommendationer</span>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl hover:shadow-md transition-shadow">
                    <div className="text-2xl">🧬</div>
                    <span className="text-gray-700 font-medium">Vetenskapligt baserade råd</span>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl hover:shadow-md transition-shadow">
                    <div className="text-2xl">⚡</div>
                    <span className="text-gray-700 font-medium">Snabb analys på 2 minuter</span>
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startQuiz}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-5 rounded-full font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-xl flex items-center space-x-3 group"
                >
                  <span>Starta Ditt Personliga Quiz</span>
                  <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-gray-500 mt-6 text-sm"
                >
                  10 smarta frågor • Kostnadsfritt • Inga mejl krävs
                </motion.p>
              </div>

              {/* Right side - Ulrika's image */}
              <div className="relative p-8 md:p-12 order-1 lg:order-2 bg-gradient-to-br from-green-50 to-blue-50">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="relative"
                >
                  {/* Organic shape frame */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 shadow-2xl"
                    style={{
                      clipPath: "polygon(30% 0%, 70% 0%, 100% 20%, 100% 70%, 80% 100%, 20% 100%, 0% 80%, 0% 30%)",
                      transform: "scale(1.05)"
                    }}
                  />
                  
                  {/* Image container with organic shape */}
                  <div 
                    className="relative overflow-hidden"
                    style={{
                      clipPath: "polygon(30% 0%, 70% 0%, 100% 20%, 100% 70%, 80% 100%, 20% 100%, 0% 80%, 0% 30%)"
                    }}
                  >
                    <Image 
                      src="/davidsson.png" 
                      alt="Ulrika Davidsson"
                      width={400}
                      height={500}
                      className="w-full h-full object-cover"
                      priority
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-green-600/20 to-transparent" />
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-4 cursor-default"
                  >
                    <p className="text-sm font-semibold text-gray-800">Ulrika Davidsson</p>
                    <p className="text-xs text-gray-600">Functional Foods Expert</p>
                  </motion.div>

                  <motion.div
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="absolute -top-4 -left-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg cursor-default"
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold">25+</div>
                      <div className="text-xs">års erfarenhet</div>
                    </div>
                  </motion.div>
                  
                  {/* Additional floating decorative elements */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                    className="absolute top-1/2 -right-8 w-16 h-16 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full filter blur-xl"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                    className="absolute -bottom-8 left-1/3 w-20 h-20 bg-gradient-to-br from-blue-300 to-purple-400 rounded-full filter blur-xl"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'quiz') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 z-50 flex items-center justify-center">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full h-full flex flex-col bg-white/80 backdrop-blur-xl lg:max-w-7xl lg:h-auto lg:max-h-[98vh] lg:rounded-3xl lg:shadow-2xl lg:my-2 lg:border lg:border-white/50 relative"
        >
          {/* Header - Smaller and more compact */}
          <div className="p-3 sm:p-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm lg:rounded-t-3xl">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm text-gray-600 font-medium">
                Fråga {currentQuestion + 1} av {quizQuestions.length}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-full"
                >
                  <FiX className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full shadow-sm"
              />
            </div>
          </div>

          {/* Question Content - Optimized for mobile */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col p-3 sm:p-4 lg:p-6 overflow-hidden"
            >
              {/* Question Header - More compact */}
              <div className="text-center mb-4 sm:mb-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="text-3xl sm:text-4xl mb-2 sm:mb-3"
                >
                  {question.icon}
                </motion.div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 mb-1 px-2">
                  {question.question}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 px-2">
                  {question.subtitle}
                </p>
              </div>

              {/* Options Grid - Responsive layout without scrolling */}
              <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-4xl">
                  {question.options.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option.value)}
                      className={`relative p-2.5 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left group overflow-hidden ${
                        answers[currentQuestion] === option.value
                          ? 'border-green-500 bg-gradient-to-br from-green-50 via-green-50 to-green-100 shadow-lg transform scale-[1.02]'
                          : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-green-400 hover:shadow-md'
                      }`}
                    >
                      {/* Hover gradient effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-green-50/0 via-green-100/0 to-green-200/0 group-hover:from-green-50/40 group-hover:via-green-100/40 group-hover:to-green-200/40 transition-all duration-300 ${
                        answers[currentQuestion] === option.value ? 'opacity-0' : ''
                      }`} />
                      
                      {/* Selected indicator */}
                      {answers[currentQuestion] === option.value && (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <FiCheckCircle className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                      
                      <div className="flex items-start space-x-2.5 relative z-10">
                        <motion.div 
                          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                          transition={{ duration: 0.5 }}
                          className="text-lg sm:text-2xl flex-shrink-0"
                        >
                          {option.icon}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm sm:text-base leading-tight transition-colors ${
                            answers[currentQuestion] === option.value ? 'text-green-800' : 'text-gray-800'
                          }`}>
                            {option.label}
                          </div>
                          <div className={`text-xs leading-relaxed hidden sm:block mt-0.5 transition-colors ${
                            answers[currentQuestion] === option.value ? 'text-green-700' : 'text-gray-600'
                          }`}>
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Navigation - Compact and fixed at bottom */}
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                {currentQuestion > 0 ? (
                  <motion.button
                    whileHover={{ x: -3 }}
                    onClick={goToPrevious}
                    className="flex items-center space-x-1.5 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    <FiArrowLeft className="w-3.5 h-3.5" />
                    <span>Tillbaka</span>
                  </motion.button>
                ) : (
                  <div />
                )}
                <div className="text-xs text-gray-500 text-center">
                  {currentQuestion === quizQuestions.length - 1 ? 'Sista frågan!' : 'Välj ett alternativ'}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // Result state
  return (
    <QuizResultScreen 
      quizData={answers} 
      onRestart={resetQuiz}
    />
  );
};

export default HealthQuiz; 
"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiX } from 'react-icons/fi';
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
  const [currentStep, setCurrentStep] = useState<'welcome' | 'quiz' | 'result'>('welcome');
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-6xl font-light mb-4 text-gray-800">
                UPPTÄCK DIN PERFEKTA
                <span className="text-green-600 font-medium"> FUNCTIONAL FOOD</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Få personaliserade rekommendationer baserat på din livsstil och hälsobehov enligt <strong>Ulrika Davidssons</strong> beprövade metod. 
                Vårt intelligenta quiz analyserar dina vanor och ger dig skräddarsydda råd för optimal hälsa genom functional foods.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="grid md:grid-cols-3 gap-6 mb-8"
            >
              <div className="flex items-center justify-center space-x-3 p-4 bg-green-50 rounded-xl">
                <div className="text-2xl">🎯</div>
                <span className="text-gray-700">Personaliserade rekommendationer</span>
              </div>
              <div className="flex items-center justify-center space-x-3 p-4 bg-blue-50 rounded-xl">
                <div className="text-2xl">🧬</div>
                <span className="text-gray-700">Vetenskapligt baserade råd</span>
              </div>
              <div className="flex items-center justify-center space-x-3 p-4 bg-purple-50 rounded-xl">
                <div className="text-2xl">⚡</div>
                <span className="text-gray-700">Snabb analys på 2 minuter</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startQuiz}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-medium text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            >
              <span>Starta Ditt Personliga Quiz</span>
              <FiArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-gray-500 mt-4"
            >
              10 smarta frågor • Kostnadsfritt • Inga mejl krävs
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentStep === 'quiz') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                Fråga {currentQuestion + 1} av {quizQuestions.length}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
              />
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">{question.icon}</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  {question.question}
                </h2>
                <p className="text-gray-600">{question.subtitle}</p>
              </div>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left hover:border-green-300 hover:bg-green-50 ${
                      answers[currentQuestion] === option.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl flex-shrink-0">{option.icon}</div>
                      <div>
                        <div className="font-medium text-gray-800 mb-1">
                          {option.label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8">
                {currentQuestion > 0 ? (
                  <button
                    onClick={goToPrevious}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    <span>Föregående</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="text-sm text-gray-500">
                  {currentQuestion === quizQuestions.length - 1 ? 'Sista frågan!' : 'Välj ett alternativ för att fortsätta'}
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
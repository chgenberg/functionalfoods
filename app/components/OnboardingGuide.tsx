"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Play, 
  BookOpen, 
  Users, 
  Target,
  Coffee,
  Utensils,
  Calendar
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
}

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  courseType: 'basics' | 'flow' | 'energy';
  userName?: string;
}

const onboardingSteps: Record<string, OnboardingStep[]> = {
  basics: [
    {
      id: 'welcome',
      title: 'Välkommen till Functional Basics! 🎉',
      description: 'Du har nu tillgång till 6 veckors grundläggande utbildning i functional foods. Vi guidar dig steg för steg mot bättre hälsa.',
      icon: <Target className="w-8 h-8" />,
    },
    {
      id: 'structure',
      title: 'Så fungerar kursen',
      description: 'Varje vecka innehåller en introduktionsvideo, måltidsplan, recept och bonusmaterial. Gå i din egen takt!',
      icon: <Calendar className="w-8 h-8" />,
    },
    {
      id: 'videos',
      title: 'Titta på introduktionsvideon',
      description: 'Börja med att titta på veckans video för att förstå vad du ska fokusera på.',
      icon: <Play className="w-8 h-8" />,
      action: {
        text: 'Se introduktionsvideo',
        href: '/dashboard/courses/functional-basics/week/1'
      }
    },
    {
      id: 'meals',
      title: 'Utforska måltidsplanen',
      description: 'Klicka på varje dag för att se måltider och recept. Bocka av när du har ätit måltiderna!',
      icon: <Utensils className="w-8 h-8" />,
    },
    {
      id: 'community',
      title: 'Anslut till communityn',
      description: 'Ställ frågor, dela framsteg och få stöd från andra deltagare i vår community.',
      icon: <Users className="w-8 h-8" />,
      action: {
        text: 'Gå till community',
        href: '/dashboard/community'
      }
    }
  ],
  flow: [
    {
      id: 'welcome',
      title: 'Välkommen till Functional Flow! 🌟',
      description: 'Du har tagit steget till vårt avancerade program för optimal hälsa och livsstil. Här fördjupar vi kunskaperna!',
      icon: <Target className="w-8 h-8" />,
    },
    {
      id: 'advanced',
      title: 'Avancerat innehåll',
      description: 'Flow-kursen bygger vidare på grunderna med mer avancerade koncept, personlig anpassning och djupare förståelse.',
      icon: <BookOpen className="w-8 h-8" />,
    },
    {
      id: 'personalization',
      title: 'Personlig anpassning',
      description: 'Använd våra verktyg för att anpassa måltider och recept efter dina specifika behov och preferenser.',
      icon: <Coffee className="w-8 h-8" />,
    },
    {
      id: 'start-journey',
      title: 'Börja din resa',
      description: 'Starta med vecka 1 och följ din personliga utvecklingsplan mot optimal hälsa.',
      icon: <Play className="w-8 h-8" />,
      action: {
        text: 'Starta Functional Flow',
        href: '/dashboard/courses/functional-flow/week/1'
      }
    }
  ],
  energy: [
    {
      id: 'welcome',
      title: 'Välkommen till Functional Energy! ⚡',
      description: 'Maximera din energi och prestanda med vårt mest avancerade program för optimal hälsa.',
      icon: <Target className="w-8 h-8" />,
    },
    {
      id: 'energy-focus',
      title: 'Fokus på energi',
      description: 'Lär dig optimera din energi genom kost, sömn, träning och stresshantering på en djupare nivå.',
      icon: <Coffee className="w-8 h-8" />,
    },
    {
      id: 'advanced-tools',
      title: 'Avancerade verktyg',
      description: 'Få tillgång till personliga analyser, energitracking och skräddarsydda rekommendationer.',
      icon: <BookOpen className="w-8 h-8" />,
    },
    {
      id: 'start-energy',
      title: 'Optimera din energi',
      description: 'Börja din resa mot maximal energi och prestanda med vårt expertutformade program.',
      icon: <Play className="w-8 h-8" />,
      action: {
        text: 'Starta Functional Energy',
        href: '/dashboard/courses/functional-energy/week/1'
      }
    }
  ]
};

export default function OnboardingGuide({
  isOpen,
  onClose,
  courseType,
  userName = 'Kursdeltagare'
}: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  
  const steps = onboardingSteps[courseType] || onboardingSteps.basics;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Check if user has seen onboarding before
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(`onboarding-${courseType}-completed`);
    if (hasSeenOnboarding) {
      setHasCompleted(true);
    }
  }, [courseType]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`onboarding-${courseType}-completed`, 'true');
    setHasCompleted(true);
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem(`onboarding-${courseType}-completed`, 'true');
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      {isOpen && !hasCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  {currentStepData.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Kom igång</h3>
                  <p className="text-sm text-gray-500">Steg {currentStep + 1} av {steps.length}</p>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-6 pt-4">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      index <= currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {currentStepData.title}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {currentStepData.description}
                </p>

                {/* Action button if available */}
                {currentStepData.action && (
                  <div className="mb-6">
                    {currentStepData.action.href ? (
                      <a
                        href={currentStepData.action.href}
                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        onClick={handleComplete}
                      >
                        {currentStepData.action.text}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </a>
                    ) : (
                      <button
                        onClick={currentStepData.action.onClick}
                        className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        {currentStepData.action.text}
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-6 border-t border-gray-100">
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isFirstStep 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Föregående
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Hoppa över
                </button>
                
                <button
                  onClick={handleNext}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {isLastStep ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Slutför
                    </>
                  ) : (
                    <>
                      Nästa
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
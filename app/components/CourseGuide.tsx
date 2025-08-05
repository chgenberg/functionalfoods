'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronRight, FiChevronLeft } from 'react-icons/fi';

interface GuideStep {
  id: number;
  title: string;
  description: string;
  targetElement: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  mobilePosition?: 'top' | 'bottom' | 'left' | 'right';
}

const guideSteps: GuideStep[] = [
  {
    id: 1,
    title: 'Välkommen till din kurs!',
    description: 'Här är din översikt där du kan se alla veckors innehåll och din progress.',
    targetElement: '.week-overview',
    position: 'bottom',
    mobilePosition: 'bottom'
  },
  {
    id: 2,
    title: 'Veckans material',
    description: 'Klicka på en vecka för att se kostschema, recept och utbildningsmaterial.',
    targetElement: '.week-navigation',
    position: 'top',
    mobilePosition: 'bottom'
  },
  {
    id: 3,
    title: 'Dina mål',
    description: 'Här kan du sätta och följa upp dina personliga hälsomål.',
    targetElement: '.goals-section',
    position: 'left',
    mobilePosition: 'top'
  },
  {
    id: 4,
    title: 'Nedladdningar',
    description: 'Ladda ner veckans material, inköpslistor och bonus-innehåll.',
    targetElement: '.downloads-section',
    position: 'left',
    mobilePosition: 'top'
  },
  {
    id: 5,
    title: 'Community',
    description: 'Dela erfarenheter och få stöd från andra kursdeltagare.',
    targetElement: '.community-link',
    position: 'right',
    mobilePosition: 'bottom'
  }
];

interface CourseGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CourseGuide({ isOpen, onClose }: CourseGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && guideSteps[currentStep]) {
      const updatePosition = () => {
        const element = document.querySelector(guideSteps[currentStep].targetElement);
        console.log('Looking for element:', guideSteps[currentStep].targetElement, 'Found:', element);
        if (element) {
          const rect = element.getBoundingClientRect();
          console.log('Element rect:', rect);
          setHighlightPosition({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
          });
          
          // Scrolla till elementet om det är utanför viewport
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          console.warn('Element not found:', guideSteps[currentStep].targetElement);
          // Fallback position - center av skärmen
          setHighlightPosition({
            top: window.innerHeight / 2,
            left: window.innerWidth / 2,
            width: 200,
            height: 200
          });
        }
      };

      // Vänta lite så att DOM hinner uppdateras
      setTimeout(updatePosition, 500);
      
      // Uppdatera vid resize
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isOpen, currentStep]);

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTooltipPosition = () => {
    const step = guideSteps[currentStep];
    const position = isMobile ? (step.mobilePosition || step.position) : step.position;
    
    switch (position) {
      case 'top':
        return {
          top: highlightPosition.top - 120,
          left: highlightPosition.left + highlightPosition.width / 2,
          transform: 'translateX(-50%)'
        };
      case 'bottom':
        return {
          top: highlightPosition.top + highlightPosition.height + 20,
          left: highlightPosition.left + highlightPosition.width / 2,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          top: highlightPosition.top + highlightPosition.height / 2,
          left: highlightPosition.left - 320,
          transform: 'translateY(-50%)'
        };
      case 'right':
        return {
          top: highlightPosition.top + highlightPosition.height / 2,
          left: highlightPosition.left + highlightPosition.width + 20,
          transform: 'translateY(-50%)'
        };
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
      >
        {/* Mörk overlay */}
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />

        {/* Highlight område */}
        <motion.div
          className="absolute border-4 border-primary rounded-lg shadow-2xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            top: highlightPosition.top - 10,
            left: highlightPosition.left - 10,
            width: highlightPosition.width + 20,
            height: highlightPosition.height + 20
          }}
          transition={{ duration: 0.3 }}
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          }}
        />

        {/* Tooltip */}
        <motion.div
          className="absolute bg-white rounded-xl shadow-2xl p-6 max-w-sm z-60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={getTooltipPosition()}
        >
          {/* Stäng-knapp */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>

          {/* Innehåll */}
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {guideSteps[currentStep].title}
            </h3>
            <p className="text-gray-600">
              {guideSteps[currentStep].description}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                currentStep === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FiChevronLeft className="w-4 h-4" />
              <span className="text-sm">Tillbaka</span>
            </button>

            {/* Progress dots */}
            <div className="flex gap-2">
              {guideSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              <span className="text-sm">
                {currentStep === guideSteps.length - 1 ? 'Slutför' : 'Nästa'}
              </span>
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 
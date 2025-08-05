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
        
        if (element) {
          // Scrolla först så elementet är synligt
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Vänta på scroll och få korrekt position
          setTimeout(() => {
            const rect = element.getBoundingClientRect();
            
            // Kontrollera att rect är giltig
            if (rect.width > 0 && rect.height > 0) {
              setHighlightPosition({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height
              });
                          } else {
              // Bättre fallback baserat på vilket steg
              const fallbackPositions = [
                { top: 200, left: 50, width: window.innerWidth - 100, height: 400 }, // Video
                { top: 650, left: 50, width: window.innerWidth - 100, height: 300 }, // Veckor
                { top: 500, left: 50, width: 300, height: 150 }, // Mål
                { top: 500, left: 400, width: 300, height: 150 }, // Nedladdningar
                { top: 100, left: 50, width: 200, height: 300 }, // Community
              ];
              const fallback = fallbackPositions[currentStep] || fallbackPositions[0];
              setHighlightPosition(fallback);
            }
          }, 300);
                  } else {
          // Bättre fallback
          const fallbackPositions = [
            { top: 200, left: 50, width: window.innerWidth - 100, height: 400 }, // Video
            { top: 650, left: 50, width: window.innerWidth - 100, height: 300 }, // Veckor
            { top: 500, left: 50, width: 300, height: 150 }, // Mål
            { top: 500, left: 400, width: 300, height: 150 }, // Nedladdningar
            { top: 100, left: 50, width: 200, height: 300 }, // Community
          ];
          const fallback = fallbackPositions[currentStep] || fallbackPositions[0];
          setHighlightPosition(fallback);
        }
      };

      // Vänta lite så att DOM hinner uppdateras
      setTimeout(updatePosition, 1000);
      
      // Uppdatera vid resize (med debounce)
      let resizeTimeout: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updatePosition, 300);
      };
      
      window.addEventListener('resize', handleResize);
      // Ta bort scroll listener för att undvika spam
      
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
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
    const tooltipWidth = 320;
    const tooltipHeight = 150;
    
    let calculatedPosition;
    
    switch (position) {
      case 'top':
        calculatedPosition = {
          top: highlightPosition.top - tooltipHeight - 20,
          left: highlightPosition.left + highlightPosition.width / 2,
          transform: 'translateX(-50%)'
        };
        break;
      case 'bottom':
        calculatedPosition = {
          top: highlightPosition.top + highlightPosition.height + 20,
          left: highlightPosition.left + highlightPosition.width / 2,
          transform: 'translateX(-50%)'
        };
        break;
      case 'left':
        calculatedPosition = {
          top: highlightPosition.top + highlightPosition.height / 2,
          left: highlightPosition.left - tooltipWidth - 20,
          transform: 'translateY(-50%)'
        };
        break;
      case 'right':
        calculatedPosition = {
          top: highlightPosition.top + highlightPosition.height / 2,
          left: highlightPosition.left + highlightPosition.width + 20,
          transform: 'translateY(-50%)'
        };
        break;
    }
    
    // Säkerställ att tooltip inte hamnar utanför skärmen
    if (calculatedPosition) {
      // För centrerade tooltips (top/bottom), justera om de hamnar utanför
      if (calculatedPosition.transform === 'translateX(-50%)') {
        const actualLeft = calculatedPosition.left - (tooltipWidth / 2);
        if (actualLeft < 20) {
          calculatedPosition.left = 20 + (tooltipWidth / 2);
        }
        if (actualLeft + tooltipWidth > window.innerWidth - 20) {
          calculatedPosition.left = window.innerWidth - 20 - (tooltipWidth / 2);
        }
      } else {
        // För icke-centrerade tooltips (left/right)
        if (calculatedPosition.left < 20) {
          calculatedPosition.left = 20;
        }
        if (calculatedPosition.left + tooltipWidth > window.innerWidth - 20) {
          calculatedPosition.left = window.innerWidth - tooltipWidth - 20;
        }
      }
    }
    if (calculatedPosition && calculatedPosition.top < 20) {
      calculatedPosition.top = 20;
    }
    if (calculatedPosition && calculatedPosition.top + tooltipHeight > window.innerHeight - 20) {
      calculatedPosition.top = window.innerHeight - tooltipHeight - 20;
    }
    
    return calculatedPosition;
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
          className="absolute border-4 border-primary rounded-lg shadow-2xl bg-white/5 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            top: highlightPosition.top - 10,
            left: highlightPosition.left - 10,
            width: highlightPosition.width + 20,
            height: highlightPosition.height + 20,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          }}
        />

        {/* Tooltip */}
        <motion.div
          className="absolute bg-white rounded-xl shadow-2xl p-6 w-80 z-60"
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
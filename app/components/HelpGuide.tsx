'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Image from 'next/image';

interface HelpStep {
  id: number;
  title: string;
  description: string;
  imageSrc?: string; // För framtida screenshots
  imageAlt?: string;
}

const helpSteps: HelpStep[] = [
  {
    id: 1,
    title: 'Kursöversikt',
    description: 'I den gröna sektionen ovanför ser du din kurs-video och grundläggande information om kursen. Här kan du spela introduktionsvideon och se din totala progress.',
    imageSrc: '/images/help/course-overview.jpg', // Placeholder
    imageAlt: 'Kursöversikt med video och progress'
  },
  {
    id: 2,
    title: 'Veckonavigation',
    description: 'Nedanför hittar du alla 6 veckor i kursen. Klicka på en vecka för att se dess innehåll, kostschema och recept. Vecka 1 är alltid tillgänglig från start.',
    imageSrc: '/images/help/week-navigation.jpg', // Placeholder
    imageAlt: 'Veckonavigation med V1-V6'
  },
  {
    id: 3,
    title: 'Målsättning',
    description: 'Klicka på "Målsättning" för att sätta och följa upp dina personliga hälsomål. Här kan du skapa veckovis mål och markera dem som slutförda.',
    imageSrc: '/images/help/goals-section.jpg', // Placeholder
    imageAlt: 'Målsättningssektion'
  },
  {
    id: 4,
    title: 'Kursmaterial',
    description: 'Under "Kursmaterial" hittar du alla artiklar, guider och utbildningsmaterial sorterat efter kategori och svårighetsgrad.',
    imageSrc: '/images/help/course-material.jpg', // Placeholder
    imageAlt: 'Kursmaterial sektion'
  },
  {
    id: 5,
    title: 'Nedladdningar',
    description: 'I "Nedladdningar" kan du ladda ner PDF:er, inköpslistor, veckomenyer och andra hjälpmaterial som du kan använda offline.',
    imageSrc: '/images/help/downloads.jpg', // Placeholder
    imageAlt: 'Nedladdningssektion'
  },
  {
    id: 6,
    title: 'Community & Navigation',
    description: 'I vänstermenyn hittar du "Community" för att diskutera med andra kursdeltagare och alla andra kurssektioner som kostschema, mål och inställningar.',
    imageSrc: '/images/help/community.jpg', // Placeholder
    imageAlt: 'Community och navigation'
  }
];

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpGuide({ isOpen, onClose }: HelpGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < helpSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  if (!isOpen) return null;

  const currentHelpStep = helpSteps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={onClose} 
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center space-x-4">
              <div className="bg-primary rounded-full p-2">
                <span className="text-white font-bold text-lg">{currentStep + 1}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{currentHelpStep.title}</h2>
                <p className="text-sm text-gray-600">Steg {currentStep + 1} av {helpSteps.length}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Placeholder för bild */}
            <div className="mb-6">
              {currentHelpStep.imageSrc ? (
                <div className="relative h-64 bg-gray-100 rounded-xl overflow-hidden">
                  <Image
                    src={currentHelpStep.imageSrc}
                    alt={currentHelpStep.imageAlt || currentHelpStep.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-2xl">{currentStep + 1}</span>
                    </div>
                    <p className="text-gray-600">Screenshot kommer att läggas till här</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                {currentHelpStep.description}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            {/* Progress dots */}
            <div className="flex space-x-2">
              {helpSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentStep 
                      ? 'bg-primary' 
                      : index < currentStep 
                        ? 'bg-primary/50' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex space-x-3">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft className="w-4 h-4" />
                <span>Föregående</span>
              </button>
              
              {currentStep === helpSteps.length - 1 ? (
                <button
                  onClick={onClose}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-all"
                >
                  <span>Slutför</span>
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-all"
                >
                  <span>Nästa</span>
                  <FiChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 
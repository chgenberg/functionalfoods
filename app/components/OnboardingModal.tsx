"use client";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface OnboardingData {
  diet?: string;
  allergies?: string;
  mealTimes?: string;
  goals?: string;
}

export default function OnboardingModal({ 
  isOpen, 
  onClose, 
  storageKey = 'onboarding_v1' 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  storageKey?: string; 
}) {
  const [data, setData] = useState<OnboardingData>({});
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  const save = () => {
    try { 
      localStorage.setItem(storageKey, JSON.stringify(data)); 
      localStorage.setItem('onboarding_completed', 'true');
    } catch {}
    onClose();
  };

  const steps = [
    {
      title: 'Välkommen till din Functional Foods-resa!',
      subtitle: 'Låt oss anpassa din upplevelse',
      field: 'diet',
      label: 'Vilken typ av kost föredrar du?',
      placeholder: 'T.ex. allt, vegetariskt, pescetarian, veganskt',
      icon: '🥗'
    },
    {
      title: 'Allergier & intoleranser',
      subtitle: 'Så vi kan anpassa recepten för dig',
      field: 'allergies',
      label: 'Har du några allergier eller intoleranser?',
      placeholder: 'T.ex. laktos, gluten, nötter, eller "inga"',
      icon: '⚠️'
    },
    {
      title: 'Dina måltidsrutiner',
      subtitle: 'För att optimera din kostplan',
      field: 'mealTimes',
      label: 'När brukar du äta dina huvudmåltider?',
      placeholder: 'T.ex. 07:30, 12:00, 18:30',
      icon: '⏰'
    },
    {
      title: 'Ditt viktigaste mål',
      subtitle: 'Vad vill du uppnå med Functional Foods?',
      field: 'goals',
      label: 'Välj ditt primära fokusområde',
      placeholder: 'T.ex. mer energi, bättre sömn, viktkontroll, maghälsa',
      icon: '🎯'
    }
  ];

  const currentStepData = steps[currentStep];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" 
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#014421] to-[#112A12] p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="text-6xl mb-4">{currentStepData.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{currentStepData.title}</h3>
              <p className="text-white/80">{currentStepData.subtitle}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-[#F3EFE3] px-6 py-3">
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    index <= currentStep ? 'bg-[#014421]' : 'bg-white'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2 text-center">
              Steg {currentStep + 1} av {steps.length}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">
                {currentStepData.label}
              </span>
              <input 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#014421] focus:border-transparent transition-all"
                value={data[currentStepData.field as keyof OnboardingData] || ''} 
                onChange={e => setData(prev => ({...prev, [currentStepData.field]: e.target.value}))} 
                placeholder={currentStepData.placeholder}
                autoFocus
              />
            </label>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            {currentStep > 0 && (
              <button 
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
              >
                Tillbaka
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button 
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#014421] text-white hover:bg-[#112A12] transition-colors font-medium flex items-center justify-center gap-2"
              >
                Nästa
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={save}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#FFB5A7] to-[#FCD5CE] text-white hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2"
              >
                Slutför
                <Check className="w-4 h-4" />
              </button>
            )}
            
            {currentStep === 0 && (
              <button 
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
              >
                Hoppa över
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 
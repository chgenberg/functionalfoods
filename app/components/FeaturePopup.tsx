"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, ArrowRight, Check, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { useT } from '@/app/lib/i18n/LanguageProvider';

interface FeaturePopupProps {
  isOpen: boolean;
  onClose: () => void;
  feature: {
    icon: JSX.Element;
    title: string;
    description: string;
    color: string;
  };
}

export default function FeaturePopup({ isOpen, onClose, feature }: FeaturePopupProps) {
  const detailedContent = {
    'Functional Foods': {
      subtitle: 'Mat som medicin för optimal hälsa',
      benefits: [
        'Naturliga livsmedel med bevisade hälsoeffekter',
        'Rika på antioxidanter och bioaktiva ämnen',
        'Stödjer kroppens självläkande processer',
        'Förebygger kroniska sjukdomar',
        'Ökar energi och vitalitet naturligt'
      ],
      examples: [
        { name: 'Blåbär', effect: 'Rika på antocyaniner för hjärnhälsa' },
        { name: 'Grönkål', effect: 'Fullpackad med vitaminer och mineraler' },
        { name: 'Valnötter', effect: 'Omega-3 för hjärta och hjärna' },
        { name: 'Kurkuma', effect: 'Anti-inflammatorisk superfood' }
      ],
      cta: 'Upptäck våra functional food-kurser',
      link: '/utbildning'
    },
    'Personaliserat': {
      subtitle: 'Skräddarsydd kost för dina unika behov',
      benefits: [
        'Anpassat efter din kropp och livsstil',
        'Baserat på senaste forskningen',
        'Tar hänsyn till dina hälsomål',
        'Justeras efter dina preferenser',
        'Utvecklas med dina framsteg'
      ],
      examples: [
        { name: 'DNA-analys', effect: 'Förstå din genetiska profil' },
        { name: 'Livsstilskartläggning', effect: 'Optimera för din vardag' },
        { name: 'Målsättning', effect: 'Tydlig väg mot dina mål' },
        { name: 'Uppföljning', effect: 'Kontinuerlig anpassning' }
      ],
      cta: 'Starta din personliga hälsoresa',
      link: '/?quiz=true'
    },
    'Snabba resultat': {
      subtitle: 'Känn skillnad redan inom några veckor',
      benefits: [
        'Ökad energi efter 3-7 dagar',
        'Bättre sömn inom första veckan',
        'Förbättrad matsmältning snabbt',
        'Tydligare fokus och koncentration',
        'Synliga resultat inom 30 dagar'
      ],
      examples: [
        { name: 'Vecka 1', effect: 'Mer energi och bättre sömn' },
        { name: 'Vecka 2', effect: 'Stabilare humör och fokus' },
        { name: 'Vecka 3', effect: 'Bättre matsmältning' },
        { name: 'Vecka 4', effect: 'Synliga förändringar' }
      ],
      cta: 'Börja din transformation idag',
      link: '/utbildning'
    }
  };

  const content = detailedContent[feature.title as keyof typeof detailedContent];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 flex items-center justify-center p-4 z-[9999]"
            onClick={onClose}
          >
            <div 
              className="w-full max-w-2xl bg-white rounded-2xl md:rounded-3xl shadow-2xl 
                         overflow-hidden flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
          >
            {/* Header with solid color */}
            <div 
              className="relative p-6 md:p-8 text-white"
              style={{ backgroundColor: feature.color }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 
                         transition-colors backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center 
                              justify-center shadow-lg">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold">{feature.title}</h3>
                  <p className="text-white/90 mt-1">{content.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              {/* Benefits */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Fördelar</h4>
                <div className="space-y-3">
                  {content.benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center 
                                    flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-gray-700">{benefit}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Examples */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  {feature.title === 'Snabba resultat' ? 'Tidslinje' : 'Exempel'}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {content.examples.map((example, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    >
                      <h5 className="font-semibold text-primary mb-1">{example.name}</h5>
                      <p className="text-sm text-gray-600">{example.effect}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <motion.a
                href={content.link}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="block w-full bg-primary text-white text-center py-4 rounded-xl 
                         font-semibold hover:bg-secondary hover:text-white transition-all 
                         shadow-lg hover:shadow-xl group"
              >
                <span className="flex items-center justify-center gap-2">
                  {content.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.a>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 
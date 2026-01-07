"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';

interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

type Variant = 'page' | 'embedded';

interface FaqAccordionProps {
  variant?: Variant;
  title?: string;
  subtitle?: string;
  showSearch?: boolean;
  className?: string;
}

const FALLBACK_FAQS: FAQ[] = [
  {
    question: 'Vem står bakom sajten?',
    answer: 'Functional Foods drivs av kostrådgivaren och kokboksförfattaren Ulrika Davidsson och hennes team.'
  }
];

export default function FaqAccordion({
  variant = 'embedded',
  title = 'Vanliga frågor & svar',
  subtitle = 'Hitta snabbt svar på dina frågor om Functional Foods',
  showSearch = variant === 'page',
  className = ''
}: FaqAccordionProps) {
  const [faqs, setFaqs] = useState<FAQ[]>(FALLBACK_FAQS);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch('/api/faq');
        if (response.ok) {
          const data = await response.json();
          if (data.faqs && Array.isArray(data.faqs) && data.faqs.length > 0) {
            setFaqs(data.faqs);
          }
        }
      } catch {
        // Keep fallback on error
      }
    };
    fetchFAQs();
  }, []);

  const filteredFaqs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(f =>
      (f.question || '').toLowerCase().includes(q) ||
      (f.answer || '').toLowerCase().includes(q)
    );
  }, [faqs, searchTerm]);

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const content = (
    <div className={className}>
      {variant === 'page' && (
        <>
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="bg-primary rounded-full p-4">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h1>
            <p className="text-lg text-gray-600">{subtitle}</p>
          </div>

          {showSearch && (
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Sök bland frågor och svar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}
        </>
      )}

      <div className="space-y-2">
        {filteredFaqs.map((faq, index) => {
          const questionId = `faq-${index}`;
          const isExpanded = expandedQuestions.includes(questionId);

          return (
            <div key={faq.id || questionId} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => toggleQuestion(questionId)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start justify-between gap-3"
              >
                <span className="font-medium text-gray-800">{faq.question}</span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 mt-0.5"
                >
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-gray-700 whitespace-pre-line">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (variant === 'page') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {content}
      </div>
    );
  }

  return content;
}



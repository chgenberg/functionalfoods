"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, MessageCircle } from 'lucide-react';

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
          {/* Hero Header */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#93C560] rounded-full blur-xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-br from-[#014421] to-[#016630] rounded-2xl p-5 shadow-lg">
                  <HelpCircle className="w-10 h-10 text-white" />
                </div>
              </div>
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-[#014421] mb-4"
            >
              {title}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="relative mb-10 max-w-2xl mx-auto"
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Sök bland frågor och svar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#93C560] focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
              />
            </motion.div>
          )}
        </>
      )}

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFaqs.map((faq, index) => {
          const questionId = `faq-${index}`;
          const isExpanded = expandedQuestions.includes(questionId);

          return (
            <motion.div 
              key={faq.id || questionId} 
              initial={variant === 'page' ? { y: 20, opacity: 0 } : false}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: variant === 'page' ? 0.4 + index * 0.05 : 0 }}
              className={`rounded-xl overflow-hidden transition-all duration-300 ${
                isExpanded 
                  ? 'bg-white shadow-lg ring-1 ring-[#93C560]/30' 
                  : 'bg-white shadow-sm hover:shadow-md border border-gray-100'
              }`}
            >
              <button
                onClick={() => toggleQuestion(questionId)}
                className={`w-full px-6 py-5 text-left flex items-start justify-between gap-4 transition-colors ${
                  isExpanded ? 'bg-gradient-to-r from-[#014421]/5 to-transparent' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isExpanded 
                      ? 'bg-[#014421] text-white' 
                      : 'bg-[#93C560]/20 text-[#014421]'
                  }`}>
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className={`font-medium text-base md:text-lg leading-relaxed ${
                    isExpanded ? 'text-[#014421]' : 'text-gray-800'
                  }`}>
                    {faq.question}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isExpanded 
                      ? 'bg-[#014421] text-white' 
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      {/* Divider */}
                      <div className="border-t border-gray-100 mb-5" />
                      
                      {/* Answer Content */}
                      <div className="pl-12">
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFaqs.length === 0 && searchTerm && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Inga resultat</h3>
          <p className="text-gray-600">
            Vi hittade inga frågor som matchar "{searchTerm}"
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-4 text-[#014421] hover:underline font-medium"
          >
            Rensa sökning
          </button>
        </motion.div>
      )}
    </div>
  );

  if (variant === 'page') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        {content}
      </div>
    );
  }

  return content;
}

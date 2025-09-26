'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { GiFruitBowl } from 'react-icons/gi';
import { useT } from '@/app/lib/i18n/LanguageProvider';
import { ChevronDown, Search, Book, ShoppingCart, CreditCard, Shield, HelpCircle } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  faqs: FAQ[];
}

const sections: Section[] = [
  {
    id: 'general',
    title: 'Vanliga frågor',
    icon: GiFruitBowl,
    faqs: [
      {
        question: 'Vem står bakom sajten?',
        answer: 'Functional Foods drivs av kostrådgivaren och kokboksförfattaren Ulrika Davidsson och hennes team på Ulrikas Kickstart AB.'
      },
      {
        question: 'Hur skiljer sig era program från vanliga kost- och receptsajter?',
        answer: 'Ulrika har kreerat och lagat upp alla functional foods‑recept som ingår i kurserna, gjort måltidsplaner och inköpslistor – allt är planerat och förberett för dig. Coachningen sker av Ulrika och hennes team.'
      },
      {
        question: 'Vilka kurser erbjuder ni?',
        answer: 'Functional Basics – grunderna i functional foods och hållbara matvanor. Functional Gut Health/Flow – fokus på tarmflora, antiinflammatorisk kost och bättre matsmältning. Functional insulin balance/Energy – stabilisera blodsockret och få jämn energi.'
      },
      {
        question: 'Ingår personlig coaching?',
        answer: 'Ja, Ulrika och hennes team coachar i kurserna söndag–fredag. Live‑ och Q&A‑träffar sker regelbundet.'
      },
      {
        question: 'Vilka betalningssätt accepterar ni?',
        answer: 'Vi använder Stripe samt SVEA som betalningslösning. Du kan betala med kort, Swish, faktura samt delbetalning.'
      },
      {
        question: 'Har ni öppet köp?',
        answer: 'Vi följer distanshandelslagen. Som privatkund har du 14 dagars ångerrätt från att du fått bokningsbekräftelse/leverans. Ångerrätten upphör efter 14 dagar eller när du tagit del av kursen om det sker tidigare. Kontakta oss på info@functionalfoods.se inom 14 dagar eller innan du påbörjar kursen.'
      },
      {
        question: 'Kan jag köpa kursen som present?',
        answer: 'Ja. Välj “Ge bort som gåva” i kassan så får du ett presentkort via e‑post.'
      },
      {
        question: 'Hur kontaktar jag er?',
        answer: 'info@ulrikadavidsson.se'
      },
      {
        question: 'Kan jag använda mitt friskvårdsbidrag?',
        answer: 'Ja. Spara kvittot från “Mitt konto” och lämna till din arbetsgivare, eller köp via din friskvårdsleverantör (Epassi, Benefix, Wellnet, Benefits).'
      }
    ]
  }
];

export default function QAPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['general']);
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  const t = useT();

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredSections = sections.map((section) => ({
    ...section,
    faqs: section.faqs.filter(
      (faq) =>
        searchTerm === '' ||
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((section) => searchTerm === '' || section.faqs.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="bg-primary rounded-full p-4">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          {t('qa.title','Vanliga frågor & svar')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('qa.subtitle','Hitta snabbt svar på dina frågor om Functional Foods')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t('qa.search.placeholder','Sök bland frågor och svar...')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* FAQ Sections */}
      <div className="space-y-4">
        {filteredSections.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const Icon = section.icon;

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({section.faqs.length} {t('qa.questions','frågor')})
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                </motion.div>
              </button>

              {/* Questions */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 space-y-2">
                      {section.faqs.map((faq, index) => {
                        const questionId = `${section.id}-${index}`;
                        const isQuestionExpanded = expandedQuestions.includes(questionId);

                        return (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() => toggleQuestion(questionId)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start justify-between gap-3"
                            >
                              <span className="font-medium text-gray-800">
                                {faq.question}
                              </span>
                              <motion.div
                                animate={{ rotate: isQuestionExpanded ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex-shrink-0 mt-0.5"
                              >
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              </motion.div>
                            </button>
                            <AnimatePresence>
                              {isQuestionExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-3 text-gray-600">
                                    {faq.answer}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Contact Support */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('qa.noAnswerTitle','Hittade du inte svaret?')}
        </h3>
        <p className="text-gray-600 mb-4">
          {t('qa.noAnswerSubtitle','Kontakta vår support så hjälper vi dig!')}
        </p>
        <a
          href="mailto:info@functionalfoods.se"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          {t('qa.contact','Kontakta oss')}
        </a>
      </div>
    </div>
  );
} 
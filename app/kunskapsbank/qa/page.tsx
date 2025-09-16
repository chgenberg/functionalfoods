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
    title: 'Allmänt om Functional Foods',
    icon: GiFruitBowl,
    faqs: [
      {
        question: 'Vad är functional foods?',
        answer: 'Livsmedel eller ingredienser som ger en mätbar hälsoeffekt utöver grundläggande näring, tack vare bioaktiva ämnen som antocyaniner, probiotika eller omega-3.',
      },
      {
        question: 'Är det samma sak som kosttillskott?',
        answer: 'Nej. Functional foods äts som vanlig mat, medan tillskott är koncentrerade doser i piller/pulver.',
      },
      {
        question: 'Vad skiljer functional foods från "superfoods"?',
        answer: 'Superfood är ett marknadsbegrepp; functional foods kräver att den extra hälsoeffekten kan förklaras och, helst, beläggas av forskning.',
      },
      {
        question: 'Vilka fördelar lyfter ni fram?',
        answer: 'Ökad energi, starkare immunförsvar, bättre fokus, humör och sömn.',
      },
      {
        question: 'Hur snabbt märker jag effekt?',
        answer: 'Många upplever skillnad redan efter några veckor.',
      },
      {
        question: 'Vem står bakom sajten?',
        answer: 'Ulrika Davidsson, kostrådgivare & kokboksförfattare med 25+ års erfarenhet.',
      },
      {
        question: 'På vilket sätt är upplägget vetenskapligt?',
        answer: 'Kursmaterialet är vetenskapligt baserat och lutar sig på aktuell forskning om bioaktiva ämnen.',
      },
      {
        question: 'Hur funkar hälsoquizet?',
        answer: 'Du svarar på livsstilsfrågor → AI analyserar svaren → du får en personlig plan.',
      },
      {
        question: 'Vad innebär "personlig plan"?',
        answer: 'Kost- och receptrekommendationer skräddarsys efter dina mål, baserade på quizanalysen.',
      },
      {
        question: 'Hur anmäler jag mig till nyhetsbrevet?',
        answer: 'Fyll i e-post i fältet "Få de senaste tipsen…" på startsidan och godkänn integritetspolicyn.',
      },
    ],
  },
  {
    id: 'courses',
    title: 'Kurser',
    icon: Book,
    faqs: [
      {
        question: 'Vilka kurser erbjuder ni?',
        answer: 'Functional Basics (grund) och Functional Flow (avancerad).',
      },
      {
        question: 'Hur långa är kurserna?',
        answer: 'Båda löper över sex veckor.',
      },
      {
        question: 'Vad ingår i Functional Basics?',
        answer: '75 recept, veckovisa videolektioner, 1-på-1-coaching, 1 års åtkomst.',
      },
      {
        question: 'Vad ingår i Functional Flow?',
        answer: '85 recept, videolektioner, premiumsupport, 1 års åtkomst och fokus på maghälsa & antiinflammation.',
      },
      {
        question: 'Ingår gemenskap?',
        answer: 'Ja, Functional Basics har "Community & support" och Flow erbjuder "Premium support".',
      },
      {
        question: 'Ingår personlig coachning?',
        answer: 'Ja, båda kurserna inkluderar 1-på-1 coaching.',
      },
      {
        question: 'Behöver jag förkunskaper?',
        answer: 'Nej. Basics beskrivs som en familjevänlig grundkurs som passar nybörjare.',
      },
      {
        question: 'Passar kurserna barnfamiljer?',
        answer: 'Ja, Basics markeras som "familjevänlig".',
      },
      {
        question: 'Är kurserna helt online?',
        answer: 'Ja, allt material (videor, recept, planer) levereras digitalt; ingen fysisk träff krävs.',
      },
      {
        question: 'Hur köper jag en kurs?',
        answer: 'Klicka på kurssidan → "Lägg i varukorg" → betala med Swish eller kort/Stripe.',
      },
      {
        question: 'Hur länge har jag tillgång till materialet?',
        answer: '1 års åtkomst utlovas för båda kurserna.',
      },
      {
        question: 'Kan jag gå kursen flera gånger?',
        answer: 'Ja – 1 års åtkomst betyder att du kan repetera när du vill under det året.',
      },
      {
        question: 'Får jag intyg efter avslutad kurs?',
        answer: 'Kontakta supporten för information om kursintyg.',
      },
      {
        question: 'Kan jag använda mitt friskvårdsbidrag?',
        answer: 'Ja, spara kvittot och lämna in till arbetsgivaren; personnummer kan anges vid köp om det krävs.',
      },
      {
        question: 'Är recepten vegetarisk/vegan-vänliga?',
        answer: 'Ja, Basics innehåller t.ex. "Vegetarisk currygryta" och flera växtbaserade rätter.',
      },
      {
        question: 'Kan gravida/ammande gå kurserna?',
        answer: 'Rådet är att rådfråga vår kundsupport för individuell bedömning.',
      },
      {
        question: 'Hur mycket tid krävs per vecka?',
        answer: 'Räkna med ca 2–3 timmar (video + matlagning).',
      },
      {
        question: 'Kan jag kombinera kursen med periodisk fasta?',
        answer: 'Ja – anpassa planen eller fråga coachen vid behov.',
      },
      {
        question: 'Finns rabattkoder?',
        answer: 'Functional Flow visar just nu −20% lanseringsrabatt. Håll utkik på kampanjsidan för fler erbjudanden.',
      },
      {
        question: 'Är priset engångsbetalning eller abonnemang?',
        answer: 'Båda kurserna säljs som engångsbetalning (ej prenumeration).',
      },
    ],
  },
  {
    id: 'recipes',
    title: 'Recept & Kunskapsbank',
    icon: Book,
    faqs: [
      {
        question: 'Var hittar jag gratis recept?',
        answer: 'Under menyn Kunskapsbank → Recept.',
      },
      {
        question: 'Kan jag filtrera recept efter allergier?',
        answer: 'Använd sökfunktionen i kunskapsbanken för att filtrera på "glutenfritt", "laktosfritt" osv.',
      },
      {
        question: 'Vad är en "funktionell råvara"?',
        answer: 'En näringsrik ingrediens med specifika hälsoeffekter, listade i vår råvarudatabas.',
      },
      {
        question: 'Kan jag söka efter råvaror direkt?',
        answer: 'Ja, via Råvaror-fliken eller sökfältet i kunskapsbanken.',
      },
      {
        question: 'Exempel på en functional food-stjärna?',
        answer: 'Blåbär – rik på antocyaniner som skyddar kärl & hjärna.',
      },
    ],
  },
  {
    id: 'book',
    title: 'Boken "Functional Foods: Mat för ett friskare liv"',
    icon: Book,
    faqs: [
      {
        question: 'Vad handlar boken om?',
        answer: 'En guide till smart kost som höjer energi, immunförsvar och maghälsa med 60+ recept.',
      },
      {
        question: 'Vad kostar boken?',
        answer: '239 kr (inkl. moms).',
      },
      {
        question: 'Hur många sidor är det?',
        answer: '240 sidor.',
      },
      {
        question: 'Var kan jag köpa den?',
        answer: 'Klicka "Köp nu" – länken leder till thebookaffair.se.',
      },
      {
        question: 'Vilket ISBN har boken?',
        answer: '978-91-89740-64-8.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Betalning & Villkor',
    icon: CreditCard,
    faqs: [
      {
        question: 'Vilka betalningsmetoder accepterar ni?',
        answer: 'Swish eller kort via Stripe.',
      },
      {
        question: 'Hur fungerar ångerrätten?',
        answer: 'Du har 14 dagar från köp eller leverans att ångra dig; kontakta supporten.',
      },
      {
        question: 'Var hittar jag mina kvitton?',
        answer: 'Logga in på "Mitt konto" → Kontodetaljer → Mina köp.',
      },
      {
        question: 'Hur byter jag lösenord?',
        answer: 'Logga in → Mina Sidor → Kontouppgifter och ange nytt lösenord.',
      },
      {
        question: 'Är betalningen säker?',
        answer: 'Ja, all kortdata hanteras krypterat av Stripe och hela sajten använder SSL-kryptering.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Integritet & Cookies',
    icon: Shield,
    faqs: [
      {
        question: 'Hur skyddar ni mina personuppgifter?',
        answer: 'SSL-kryptering, säkra servrar, begränsad åtkomst och regelbundna uppdateringar.',
      },
      {
        question: 'Vilka rättigheter har jag enligt GDPR?',
        answer: 'Rätt till information, rättelse, radering, portabilitet, invändning och begränsning.',
      },
      {
        question: 'Hur länge sparas mina data?',
        answer: 'Kontouppgifter: kontotiden + 24 mån; köphistorik: 7 år; statistik: 26 mån etc.',
      },
      {
        question: 'Hur hanterar ni cookies?',
        answer: 'Grundläggande och tredjepartscookies används efter samtycke; inställningar kan ändras när som helst.',
      },
      {
        question: 'Vem kontaktar jag vid integritetsfrågor?',
        answer: 'Skicka e-post till info@functionalfoods.se (kundsupport).',
      },
    ],
  },
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
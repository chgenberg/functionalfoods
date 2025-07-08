'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronRight, FiBook, FiVideo, FiFileText, FiUsers, 
  FiAward, FiCheckCircle, FiLock, FiPlayCircle, FiExternalLink,
  FiGrid, FiList, FiCalendar, FiShoppingCart
} from 'react-icons/fi';
import { GiFruitBowl, GiCookingPot, GiHealthNormal } from 'react-icons/gi';
import { FaInstagram } from 'react-icons/fa';

interface Section {
  id: string;
  title: string;
  description: string;
  type: 'onboarding' | 'content' | 'knowledge' | 'social' | 'offboarding';
  videoUrl?: string;
  links?: { title: string; url: string; icon?: React.ElementType }[];
  completed?: boolean;
}

interface WeeklyContent {
  week: number;
  title: string;
  description: string;
  recipes: number;
  shoppingList: boolean;
  mealPlan: boolean;
  locked: boolean;
}

export default function FunctionalBasicsCoursePage() {
  const [activeSection, setActiveSection] = useState<string>('onboarding');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const sections: Section[] = [
    {
      id: 'onboarding',
      title: 'Välkommen till Functional Basics',
      type: 'onboarding',
      description: `Nu har du en spännande resa framför dig under dessa 6 veckor med näringsrika och hälsobringade recept och du kommer att få lära dig grunderna i Functional Foods. Du får praktiska kostscheman att följa, recept för alla måltider och inköpslistor för varje vecka.

Efter dessa 6 veckor har du dels lärt dig mycket om matlagning och hur du får in alla näringsämnen i din kost samt fördelarna som kommer: ökad näringsnivå, förbättrad matsmältning, bättre hjärthälsa, minskad inflammation i kroppen, ökade energinivåer och ett bättre immunförsvar.

Du kommer att tacka dig själv, även om det kan finnas dagar när det känns tufft. Mitt bästa tips är planering! Förbered dig för veckan och laga gärna upp flera maträtter på samma gång så att du är väl förberedd.

Varmt välkommen till framtidens kost för en god hälsa och ett friskare liv!

/Ulrika`,
      videoUrl: 'https://player.vimeo.com/video/1056709544?h=9265a3d6ae&badge=0&autopause=0&player_id=0&app_id=58479',
      links: [
        { 
          title: 'Läs mer om vad Functional Foods är', 
          url: '/dashboard/courses/functional-basics/material/vad-ar-functional-foods',
          icon: FiBook
        },
        { 
          title: 'Frågor och svar om kursen', 
          url: '/dashboard/courses/functional-basics/material/fragor-och-svars',
          icon: FiFileText
        }
      ]
    },
    {
      id: 'knowledge',
      title: 'Kunskapsdokument och artiklar',
      type: 'knowledge',
      description: `För att göra det enkelt för dig finns det en guide med Functional Foods råvaror med livsmedel som verkligen gör nytta i din kropp och du lär dig vad råvarorna ger för hälsoeffekt.

Du kommer att använda råvaror från de 10 livsmedelskategorierna som ingår i den så kallade mervärdesmaten i nya recept som jag har skapat som är rika på antioxidanter, probiotika, prebiotika, fibrer, omega-3, vitaminer och mineraler. Jag har också samlat en del av de studier som jag har inspirerats av för den här kursen i en artikel.

Jag uppmuntrar er att läsa igenom artiklarna och kunskapsdokumenten som finns i kursen.`,
      links: [
        { 
          title: 'Topplista med Functional Foods', 
          url: '/dashboard/courses/functional-basics/material/functional-foods-topplista',
          icon: GiFruitBowl
        },
        { 
          title: 'Studie - Functional foods for health', 
          url: '/dashboard/courses/functional-basics/material/studie-om-functional-foods',
          icon: FiFileText
        }
      ]
    },
    {
      id: 'social',
      title: 'COACHNING OCH FUNCTIONAL FOODS PÅ SOCIALA MEDIER',
      type: 'social',
      description: `För att du ska få en så värdefull och lärorik tid i din kurs som möjligt så erbjuder vi coachning via vår plattform Mighty. När du laddar ned appen Mighty Network kan du hålla kontakt med oss coacher som finns tillgängliga för att svara på dina frågor. Följ den länk som du fick i ditt bekräftelsemejl när du köpte kursen för att gå med i vår community via appen Mighty Network.

Du kan alltid kontakta oss via vår kundsupport: info@functionalfoods.se

Vill du följa vad som händer kring Functional Foods och ta del av tips, recept, nyheter, erbjudanden och vår härliga gemenskap så häng med oss här -->`,
      links: [
        { 
          title: 'Mighty Networks', 
          url: 'https://functional-foods-with-ulrika.mn.co/share/HkMuGsHR6elHab44?utm_source=manual',
          icon: FiUsers
        },
        { 
          title: 'Functional Foods på Instagram', 
          url: 'https://www.instagram.com/functionalfoods.se/?hl=sv',
          icon: FaInstagram
        }
      ]
    }
  ];

  const weeklyContent: WeeklyContent[] = [
    {
      week: 1,
      title: 'Introduktion till Functional Foods',
      description: 'Lär dig grunderna och kom igång med din hälsoresa',
      recipes: 21,
      shoppingList: true,
      mealPlan: true,
      locked: false
    },
    {
      week: 2,
      title: 'Bygga hälsosamma vanor',
      description: 'Fördjupa din kunskap och etablera rutiner',
      recipes: 21,
      shoppingList: true,
      mealPlan: true,
      locked: false
    },
    {
      week: 3,
      title: 'Flexibilitet & Fasta',
      description: 'Utforska flexibilitet och periodisk fasta',
      recipes: 21,
      shoppingList: true,
      mealPlan: true,
      locked: false
    },
    {
      week: 4,
      title: 'Stärk immunförsvaret',
      description: 'Mat som boostar ditt immunförsvar',
      recipes: 21,
      shoppingList: true,
      mealPlan: true,
      locked: true
    },
    {
      week: 5,
      title: 'Antiinflammatorisk kost',
      description: 'Minska inflammation med rätt mat',
      recipes: 21,
      shoppingList: true,
      mealPlan: true,
      locked: true
    },
    {
      week: 6,
      title: 'Livslång hälsa',
      description: 'Sammanfattning och vägen framåt',
      recipes: 21,
      shoppingList: true,
      mealPlan: true,
      locked: true
    }
  ];

  const knowledgeModules = [
    {
      id: 'vad-ar-functional-foods',
      title: 'Vad är Functional Foods?',
      description: 'Grundläggande introduktion till funktionella livsmedel',
      icon: GiFruitBowl,
      completed: completedSections.includes('vad-ar-functional-foods')
    },
    {
      id: 'fordelarna-med-functional-foods',
      title: 'Fördelarna med Functional Foods',
      description: 'Upptäck alla hälsofördelar',
      icon: GiHealthNormal,
      completed: completedSections.includes('fordelarna-med-functional-foods')
    },
    {
      id: 'dags-att-komma-igang',
      title: 'Dags att komma igång',
      description: 'Praktiska tips för att starta din resa',
      icon: FiPlayCircle,
      completed: completedSections.includes('dags-att-komma-igang')
    },
    {
      id: 'att-valja-ratt-proteiner',
      title: 'Att välja rätt proteiner',
      description: 'Guide till proteinrika livsmedel',
      icon: GiCookingPot,
      completed: completedSections.includes('att-valja-ratt-proteiner')
    },
    {
      id: 'att-valja-ratt-kolhydrater',
      title: 'Att välja rätt kolhydrater',
      description: 'Smarta kolhydrater för stabil energi',
      icon: FiGrid,
      completed: completedSections.includes('att-valja-ratt-kolhydrater')
    },
    {
      id: 'functional-foods-topplista',
      title: 'Functional Foods Topplista',
      description: 'De 10 viktigaste kategorierna',
      icon: FiAward,
      completed: completedSections.includes('functional-foods-topplista')
    }
  ];

  const handleSectionComplete = (sectionId: string) => {
    setCompletedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Functional Basics</h1>
              <p className="text-gray-600 mt-1">6 veckors program för optimal hälsa</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Din progress</p>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedSections.length / knowledgeModules.length) * 100}%` }}
                      className="h-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round((completedSections.length / knowledgeModules.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Kursinnehåll</h2>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-primary to-accent text-white'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="font-medium">{section.title}</span>
                    <FiChevronRight className={`w-5 h-5 transition-transform ${
                      activeSection === section.id ? 'rotate-90' : 'group-hover:translate-x-1'
                    }`} />
                  </button>
                ))}
                
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() => setActiveSection('weekly')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                      activeSection === 'weekly'
                        ? 'bg-gradient-to-r from-primary to-accent text-white'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-5 h-5" />
                      <span className="font-medium">Veckoplaner & Recept</span>
                    </div>
                    <FiChevronRight className={`w-5 h-5 transition-transform ${
                      activeSection === 'weekly' ? 'rotate-90' : 'group-hover:translate-x-1'
                    }`} />
                  </button>
                  
                  <button
                    onClick={() => setActiveSection('knowledge-modules')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                      activeSection === 'knowledge-modules'
                        ? 'bg-gradient-to-r from-primary to-accent text-white'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FiBook className="w-5 h-5" />
                      <span className="font-medium">Kunskapsmoduler</span>
                    </div>
                    <FiChevronRight className={`w-5 h-5 transition-transform ${
                      activeSection === 'knowledge-modules' ? 'rotate-90' : 'group-hover:translate-x-1'
                    }`} />
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Onboarding Section */}
              {activeSection === 'onboarding' && (
                <motion.div
                  key="onboarding"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Video Section */}
                    <div className="aspect-video bg-gray-100">
                      <iframe
                        src={sections[0].videoUrl}
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{sections[0].title}</h2>
                      <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line">
                        {sections[0].description}
                      </div>
                      
                      {/* Links */}
                      <div className="mt-8 space-y-3">
                        {sections[0].links?.map((link, index) => (
                          <Link
                            key={index}
                            href={link.url}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              {link.icon && <link.icon className="w-5 h-5 text-primary" />}
                              <span className="font-medium text-gray-700">{link.title}</span>
                            </div>
                            <FiExternalLink className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Knowledge Section */}
              {activeSection === 'knowledge' && (
                <motion.div
                  key="knowledge"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{sections[1].title}</h2>
                    <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line mb-8">
                      {sections[1].description}
                    </div>
                    
                    {/* Links */}
                    <div className="space-y-3">
                      {sections[1].links?.map((link, index) => (
                        <Link
                          key={index}
                          href={link.url}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            {link.icon && <link.icon className="w-5 h-5 text-primary" />}
                            <span className="font-medium text-gray-700">{link.title}</span>
                          </div>
                          <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Social Section */}
              {activeSection === 'social' && (
                <motion.div
                  key="social"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{sections[2].title}</h2>
                    <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-line mb-8">
                      {sections[2].description}
                    </div>
                    
                    {/* Social Links */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {sections[2].links?.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all group"
                        >
                          {link.icon && <link.icon className="w-6 h-6 text-primary" />}
                          <span className="font-medium text-gray-700">{link.title}</span>
                          <FiExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Weekly Content Section */}
              {activeSection === 'weekly' && (
                <motion.div
                  key="weekly"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Veckoplaner & Recept</h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`p-2 rounded-lg transition-colors ${
                            viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <FiGrid className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`p-2 rounded-lg transition-colors ${
                            viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <FiList className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Weekly Grid/List */}
                    <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}>
                      {weeklyContent.map((week) => (
                        <motion.div
                          key={week.week}
                          whileHover={{ scale: week.locked ? 1 : 1.02 }}
                          className={`relative rounded-xl p-6 transition-all ${
                            week.locked 
                              ? 'bg-gray-50 opacity-60' 
                              : 'bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (!week.locked) {
                              if (week.week === 1) {
                                window.location.href = '/dashboard/courses/functional-basics/week/1';
                              } else if (week.week === 2) {
                                window.location.href = '/dashboard/courses/functional-basics/week/2';
                              } else if (week.week === 3) {
                                window.location.href = '/dashboard/courses/functional-basics/week/3';
                              } else {
                                setCurrentWeek(week.week);
                              }
                            }
                          }}
                        >
                          {week.locked && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                              <FiLock className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Vecka {week.week}</h3>
                              <p className="text-sm text-gray-600 mt-1">{week.title}</p>
                            </div>
                            {currentWeek === week.week && !week.locked && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Aktiv</span>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-4">{week.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <GiCookingPot className="w-4 h-4 text-primary" />
                              <span className="text-gray-600">{week.recipes} recept</span>
                            </div>
                            {week.mealPlan && (
                              <div className="flex items-center gap-1">
                                <FiCalendar className="w-4 h-4 text-primary" />
                                <span className="text-gray-600">Kostschema</span>
                              </div>
                            )}
                            {week.shoppingList && (
                              <div className="flex items-center gap-1">
                                <FiShoppingCart className="w-4 h-4 text-primary" />
                                <span className="text-gray-600">Inköpslista</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Knowledge Modules Section */}
              {activeSection === 'knowledge-modules' && (
                <motion.div
                  key="knowledge-modules"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Kunskapsmoduler</h2>
                    
                    <div className="space-y-4">
                      {knowledgeModules.map((module, index) => {
                        const Icon = module.icon;
                        return (
                          <motion.div
                            key={module.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Link
                              href={`/dashboard/courses/functional-basics/material/${module.id}`}
                              className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  module.completed 
                                    ? 'bg-green-100 text-green-600' 
                                    : 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary'
                                }`}>
                                  {module.completed ? (
                                    <FiCheckCircle className="w-6 h-6" />
                                  ) : (
                                    <Icon className="w-6 h-6" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{module.title}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                                </div>
                              </div>
                              <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">Tips:</span> Gå igenom modulerna i ordning för bästa lärupplevelse. 
                        Varje modul bygger på den föregående.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiBook, FiClock, FiArrowRight, FiSearch, FiFilter,
  FiBookOpen, FiTarget, FiHeart, FiStar, FiAward
} from 'react-icons/fi';
import { GiMeal, GiFruitBowl, GiHealthNormal, GiWheat, GiMeat } from 'react-icons/gi';
import Link from 'next/link';

interface KnowledgeModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  readTime: string;
  category: string;
}

export default function KnowledgeMaterialPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('alla');
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  const modules: KnowledgeModule[] = [
    {
      id: 'vad-ar-functional-foods-2',
      title: 'Vad är Functional Foods?',
      description: 'Lär dig grunderna om mervärdesmat och dess 10 livsmedelskategorier',
      icon: GiFruitBowl,
      color: '#014421',
      readTime: '6 min',
      category: 'Grundläggande'
    },
    {
      id: 'functional-foods-topplista',
      title: 'Functional Foods Topplista',
      description: 'De mest kraftfulla livsmedlen för din hälsa',
      icon: FiStar,
      color: '#112A12',
      readTime: '8 min',
      category: 'Grundläggande'
    },
    {
      id: 'fordelarna-med-functional-foods',
      title: 'Fördelarna med Functional Foods',
      description: 'Upptäck de omfattande hälsofördelarna',
      icon: FiHeart,
      color: '#014421',
      readTime: '10 min',
      category: 'Hälsofördelar'
    },
    {
      id: 'functional-foods-3-steg-till-ett-friskare-liv',
      title: 'Functional Foods - 3 steg till ett friskare liv',
      description: 'En steg-för-steg guide till bättre hälsa',
      icon: FiBookOpen,
      color: '#112A12',
      readTime: '12 min',
      category: 'Praktisk guide'
    },
    {
      id: 'dags-att-komma-igang',
      title: 'Dags att komma igång',
      description: 'Praktiska tips för att starta din resa',
      icon: FiTarget,
      color: '#014421',
      readTime: '12 min',
      category: 'Praktisk guide'
    },
    {
      id: 'att-valja-ratt-kolhydrater',
      title: 'Att välja rätt kolhydrater',
      description: 'Skillnaden mellan bra och dåliga kolhydrater',
      icon: GiWheat,
      color: '#112A12',
      readTime: '10 min',
      category: 'Näringslära'
    },
    {
      id: 'att-valja-ratt-proteiner',
      title: 'Att välja rätt proteiner',
      description: 'Kompletta proteinkällor för optimal hälsa',
      icon: GiMeal,
      color: '#014421',
      readTime: '10 min',
      category: 'Näringslära'
    },
    {
      id: 'ersattningsguide-for-kolhydrater',
      title: 'Ersättningsguide för kolhydrater',
      description: 'Hälsosamma alternativ till traditionella kolhydrater',
      icon: GiWheat,
      color: '#112A12',
      readTime: '6 min',
      category: 'Näringslära'
    },
    {
      id: 'motivation-och-reflektion',
      title: 'Motivation och reflektion',
      description: 'Verktyg för att hålla motivationen uppe',
      icon: FiAward,
      color: '#014421',
      readTime: '15 min',
      category: 'Mindset'
    },
    {
      id: 'functional-foods-som-livsstil',
      title: 'Functional Foods som livsstil',
      description: 'Gör hälsosam mat till en naturlig del av vardagen',
      icon: FiHeart,
      color: '#112A12',
      readTime: '6 min',
      category: 'Mindset'
    },
    {
      id: 'benbuljong',
      title: 'Benbuljong - Naturens healing elixir',
      description: 'Lär dig tillaga näringsrik benbuljong',
      icon: GiMeal,
      color: '#014421',
      readTime: '8 min',
      category: 'Recept & Tips'
    },
    {
      id: 'drycker',
      title: 'Hälsosamma drycker',
      description: 'Upptäck näringsrika drycker för optimal hälsa',
      icon: GiFruitBowl,
      color: '#112A12',
      readTime: '6 min',
      category: 'Recept & Tips'
    },
    {
      id: 'superfoods',
      title: 'Naturens egna hälsobomber',
      description: 'Superfoods som förvandlar din hälsa',
      icon: FiStar,
      color: '#014421',
      readTime: '8 min',
      category: 'Superfoods'
    },
    {
      id: 'att-ata-ute-med-functional-foods',
      title: 'Att äta ute med Functional Foods',
      description: 'Tips för hälsosamma val på restaurang',
      icon: GiMeal,
      color: '#112A12',
      readTime: '10 min',
      category: 'Praktisk guide'
    },
    {
      id: 'at-mer-functional-foods-pa-ett-enkelt-satt',
      title: 'Ät mer Functional Foods på ett enkelt sätt',
      description: 'Enkla strategier för att öka näringsintaget',
      icon: FiBook,
      color: '#014421',
      readTime: '8 min',
      category: 'Praktisk guide'
    },
    {
      id: 'periodisk-fasta',
      title: 'Periodisk fasta ger klarhet och energi',
      description: 'Fördelarna med kontrollerad fasta',
      icon: GiHealthNormal,
      color: '#112A12',
      readTime: '8 min',
      category: 'Hälsofördelar'
    },
    {
      id: 'reflektion-vecka-3',
      title: 'Reflektion vecka 3',
      description: 'Utvärdera dina framsteg och lärdomar',
      icon: FiBook,
      color: '#014421',
      readTime: '5 min',
      category: 'Reflektion'
    },
    {
      id: 'fragor-och-svar',
      title: 'Frågor och svar',
      description: 'Svar på vanliga frågor om Functional Foods',
      icon: FiBook,
      color: '#112A12',
      readTime: '15 min',
      category: 'FAQ'
    },
    {
      id: 'malsattning-och-planering',
      title: 'Målsättning och planering',
      description: 'Strukturerad planering för hälsomål',
      icon: FiTarget,
      color: '#014421',
      readTime: '8 min',
      category: 'Planering'
    },
    {
      id: 'utvardering-och-nasta-steg',
      title: 'Utvärdering och nästa steg',
      description: 'Reflektera och planera framåt',
      icon: FiAward,
      color: '#112A12',
      readTime: '6 min',
      category: 'Planering'
    }
  ];

  const categories = [
    'alla',
    'Grundläggande',
    'Hälsofördelar', 
    'Praktisk guide',
    'Näringslära',
    'Mindset',
    'Recept & Tips',
    'Superfoods',
    'Reflektion',
    'FAQ',
    'Planering'
  ];

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'alla' || module.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleModule = (moduleId: string) => {
    if (completedModules.includes(moduleId)) {
      setCompletedModules(completedModules.filter(id => id !== moduleId));
    } else {
      setCompletedModules([...completedModules, moduleId]);
    }
  };

  return (
            <div className="min-h-screen bg-background">
      {/* Hero Section */}
              <div className="bg-primary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Kunskapsmaterial
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Fördjupa din kunskap om Functional Foods med våra expertskrivna artiklar
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="text-2xl font-bold">{modules.length}</span>
                <span className="text-sm opacity-90 ml-2">Artiklar</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="text-2xl font-bold">{categories.length - 1}</span>
                <span className="text-sm opacity-90 ml-2">Kategorier</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="text-2xl font-bold">{completedModules.length}</span>
                <span className="text-sm opacity-90 ml-2">Lästa</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Sök artiklar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'alla' ? 'Alla kategorier' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="group"
            >
              <Link href={`/dashboard/courses/functional-basics/material/${module.id}`}>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full">
                  {/* Header with gradient */}
                  <div className="p-6 text-white relative overflow-hidden" style={{ backgroundColor: module.color }}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                    
                    <div className="relative z-10">
                      <module.icon className="w-8 h-8 mb-3" />
                      <div className="text-sm opacity-90 mb-2">{module.category}</div>
                      <h3 className="text-xl font-bold leading-tight">{module.title}</h3>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-3">{module.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiClock className="w-4 h-4 mr-1" />
                        <span>{module.readTime}</span>
                      </div>
                      
                      <div className="flex items-center text-primary font-semibold group-hover:text-secondary">
                        <span className="mr-2">Läs mer</span>
                        <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    
                    {/* Progress indicator */}
                    {completedModules.includes(module.id) && (
                      <div className="mt-4 flex items-center text-primary">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        <span className="text-sm font-medium">Läst</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* No results */}
        {filteredModules.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Inga artiklar hittades</h3>
            <p className="text-gray-500">Prova att ändra dina sökkriterier</p>
          </motion.div>
        )}

        {/* Back to Course */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/dashboard/courses/functional-basics"
                            className="inline-flex items-center px-8 py-4 bg-secondary text-white rounded-full font-semibold hover:shadow-lg transition-all transform hover:scale-105"
          >
            <FiArrowRight className="w-5 h-5 mr-2 rotate-180" />
            Tillbaka till kursen
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 
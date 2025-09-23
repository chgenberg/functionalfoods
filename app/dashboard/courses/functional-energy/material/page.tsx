'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Book, Clock, ArrowRight, Search, Filter, BookOpen, Target, Heart, Star, Award, FileText, Brain, Activity } from 'lucide-react';
import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';

interface KnowledgeModule {
  title: string;
  slug: string;
  content: string;
  headerImage: string;
  readTime: number;
  course: string;
  order: number;
  weekNumber?: number;
  category: string;
  excerpt?: string;
}

export default function KnowledgeMaterialPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [knowledgeModules, setKnowledgeModules] = useState<KnowledgeModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const res = await fetch('/api/knowledge?course=energy');
        const data = await res.json();
        const docs = data.documents || [];
        
        // Kategorisera dokumenten
        const categorizedDocs = docs.map((doc: any) => ({
          ...doc,
          category: getCategoryForDocument(doc)
        }));
        
        setKnowledgeModules(categorizedDocs);
      } catch (error) {
        console.error('Error loading knowledge:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchKnowledge();
  }, []);

  const getCategoryForDocument = (doc: any) => {
    if (doc.weekNumber > 0) return `Vecka ${doc.weekNumber}`;
    if (doc.slug.includes('diabetes') || doc.slug.includes('insulin')) return 'Diabetes & Blodsocker';
    if (doc.slug.includes('kolhydrat') || doc.slug.includes('ersattning')) return 'Kost & Nutrition';
    if (doc.slug.includes('livsstil') || doc.slug.includes('ata-ute')) return 'Livsstil';
    return 'Grundläggande';
  };

  const categories = [
    { id: 'all', name: 'Alla artiklar', icon: BookOpen },
    { id: 'Grundläggande', name: 'Grundläggande', icon: Book },
    { id: 'Diabetes & Blodsocker', name: 'Diabetes & Blodsocker', icon: Activity },
    { id: 'Kost & Nutrition', name: 'Kost & Nutrition', icon: Heart },
    { id: 'Livsstil', name: 'Livsstil', icon: Star }
  ];

  // Lägg till vecko-kategorier
  const weekCategories = [1, 2, 3, 4, 5, 6].map(week => ({
    id: `Vecka ${week}`,
    name: `Vecka ${week}`,
    icon: FileText
  }));

  const allCategories = [...categories, ...weekCategories];

  const filteredModules = knowledgeModules.filter(module => {
    if (selectedCategory === 'all') return true;
    return module.category === selectedCategory;
  });

  const getCategoryIcon = (category: string) => {
    const cat = allCategories.find(c => c.id === category);
    return cat?.icon || BookOpen;
  };

  const getIconForDocument = (doc: KnowledgeModule) => {
    if (doc.slug.includes('diabetes') || doc.slug.includes('insulin')) return Activity;
    if (doc.slug.includes('kolhydrat')) return Brain;
    if (doc.slug.includes('livsstil')) return Star;
    if (doc.slug.includes('fragor')) return FileText;
    return Heart;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Laddar kunskapsmaterial...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      <CourseNavigation courseType="energy" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            Kunskapsmaterial
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Fördjupa din kunskap om Functional Foods och blodsockerkontroll
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {allCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full transition-all
                    ${selectedCategory === category.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:shadow-md'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Knowledge Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module, index) => {
            const Icon = getIconForDocument(module);
            const CategoryIcon = getCategoryIcon(module.category);
            
            return (
              <motion.div
                key={module.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/dashboard/courses/functional-energy/material/${module.slug}`}>
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden h-full">
                    {module.headerImage && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={module.headerImage}
                          alt={module.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <CategoryIcon className="w-4 h-4 text-primary" />
                        <span className="text-sm text-gray-600">{module.category}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {module.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {module.excerpt || 'Läs mer om ' + module.title.toLowerCase()}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{module.readTime} min läsning</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Inga artiklar hittades i denna kategori.</p>
          </div>
        )}
      </div>
    </div>
  );
}
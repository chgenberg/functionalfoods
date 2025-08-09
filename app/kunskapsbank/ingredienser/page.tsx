"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiGrid, FiList, FiFilter, FiX, FiChevronRight } from 'react-icons/fi';
import { GiWheat, GiFruitBowl, GiMeat, GiHerbsBundle } from 'react-icons/gi';
import { FaCheese, FaFish, FaLeaf } from 'react-icons/fa';
import { useT } from '@/app/lib/i18n/LanguageProvider';

interface RawMaterial {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  'Spannmål': GiWheat,
  'Frukt & Bär': GiFruitBowl,
  'Kött': GiMeat,
  'Fisk & Skaldjur': FaFish,
  'Mejeri': FaCheese,
  'Örter & Kryddor': GiHerbsBundle,
  'Övrigt': FaLeaf,
};

function getCategoryFromName(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('bär') || lowerName.includes('frukt') || lowerName.includes('äpple') || lowerName.includes('päron') || lowerName.includes('citrus')) return 'Frukt & Bär';
  if (lowerName.includes('kött') || lowerName.includes('nöt') || lowerName.includes('fläsk') || lowerName.includes('kyckling')) return 'Kött';
  if (lowerName.includes('fisk') || lowerName.includes('lax') || lowerName.includes('torsk') || lowerName.includes('räkor')) return 'Fisk & Skaldjur';
  if (lowerName.includes('mjölk') || lowerName.includes('ost') || lowerName.includes('yoghurt') || lowerName.includes('smör')) return 'Mejeri';
  if (lowerName.includes('havre') || lowerName.includes('vete') || lowerName.includes('råg') || lowerName.includes('korn')) return 'Spannmål';
  if (lowerName.includes('krydd') || lowerName.includes('örter') || lowerName.includes('basilika') || lowerName.includes('timjan')) return 'Örter & Kryddor';
  return 'Övrigt';
}

// Function to render description with paragraph breaks
const renderDescription = (description: string | undefined, isExpanded: boolean = true) => {
  if (!description) return null;
  
  const paragraphs = description.split('\n\n').filter(p => p.trim());
  
  if (!isExpanded) {
    return <p className="text-text-secondary text-sm line-clamp-2">{paragraphs[0]}</p>;
  }
  
  return (
    <div className="text-text-secondary text-sm leading-relaxed space-y-3">
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph.trim()}</p>
      ))}
    </div>
  );
};

export default function IngrediensPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    fetchMaterials();
  }, []);

  useEffect(() => {
    filterMaterials();
  }, [materials, searchQuery, selectedCategory]);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/raw-materials');
      const data = await response.json();
      setMaterials(data.materials || []);
    } catch (error) {
      console.error('Error fetching raw materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterMaterials = () => {
    let filtered = materials;

    if (searchQuery) {
      filtered = filtered.filter(material =>
        material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => getCategoryFromName(material.name) === selectedCategory);
    }

    setFilteredMaterials(filtered);
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const categories = ['all', 'Frukt & Bär', 'Kött', 'Fisk & Skaldjur', 'Mejeri', 'Spannmål', 'Örter & Kryddor', 'Övrigt'];
  const categoryLabel = (cat: string) => {
    if (cat === 'all') return t('ingredients.categories.all','Alla kategorier');
    return t(`ingredients.category.${cat}` as any, cat);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      <div className="container-custom section-padding">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent font-extrabold">
              {t('ingredients.title','Funktionella Råvaror')}
            </span>
          </h1>
          <p className="text-lg text-text-secondary">
            {t('ingredients.subtitle','Utforska vår databas av näringsrika råvaror och deras hälsofördelar')}
          </p>
        </motion.div>

        {/* Search and Filters Bar */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div ref={searchRef} className="flex-1 relative">
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('ingredients.search.placeholder','Sök efter råvara eller näringsämne...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-accent/20 focus:border-accent focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-full border-2 transition-all flex items-center gap-2 ${
                  showFilters ? 'bg-accent text-white border-accent' : 'border-accent/20 hover:border-accent'
                }`}
              >
                <FiFilter className="w-5 h-5" />
                <span className="hidden sm:inline">{t('ingredients.filter','Filter')}</span>
              </button>
              
              <div className="flex rounded-full border-2 border-accent/20 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-accent text-white' : 'hover:bg-accent/10'}`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-accent text-white' : 'hover:bg-accent/10'}`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 p-4 bg-white rounded-2xl shadow-sm">
                  {categories.map((category) => {
                    const Icon = categoryIcons[category] || FaLeaf;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-full transition-all flex items-center gap-2 ${
                          selectedCategory === category
                            ? 'bg-accent text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-text-primary'
                        }`}
                      >
                        {category !== 'all' && <Icon className="w-4 h-4" />}
                        <span>{category === 'all' ? t('ingredients.categories.all','Alla kategorier') : categoryLabel(category)}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-text-secondary">
          {t('ingredients.results.showing','Visar')} <span className="font-medium text-text-primary">{filteredMaterials.length}</span> {t('ingredients.results.of','av')}{' '}
          <span className="font-medium text-text-primary">{materials.length}</span> {t('ingredients.results.items','råvaror')}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : viewMode === 'grid' ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredMaterials.map((mat) => {
              const category = getCategoryFromName(mat.name);
              const Icon = categoryIcons[category] || FaLeaf;
              const isExpanded = expandedItems.has(mat.id);
              
              return (
                <motion.div
                  key={mat.id}
                  variants={itemVariants}
                  whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer"
                  onClick={() => toggleExpanded(mat.id)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-3 bg-accent/10 rounded-full group-hover:bg-accent/20 transition-colors">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <FiChevronRight className="w-5 h-5 text-text-secondary" />
                      </motion.div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                      {mat.name}
                    </h3>
                    
                    <AnimatePresence>
                      {isExpanded ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          {renderDescription(mat.description, true)}
                        </motion.div>
                      ) : (
                        renderDescription(mat.description, false)
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredMaterials.map((mat) => {
              const category = getCategoryFromName(mat.name);
              const Icon = categoryIcons[category] || FaLeaf;
              
              return (
                <motion.div
                  key={mat.id}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4 group"
                >
                  <div className="p-3 bg-accent/10 rounded-full group-hover:bg-accent/20 transition-colors shrink-0">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                      {mat.name}
                    </h3>
                    {renderDescription(mat.description, true)}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* No Results */}
        {!loading && filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">{t('ingredients.empty','Inga råvaror hittades som matchar din sökning.')}</p>
          </div>
        )}
      </div>
    </main>
  );
} 
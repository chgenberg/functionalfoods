'use client';

import { motion } from 'framer-motion';

import { GiFruitBowl, GiMeal, GiHealthNormal } from 'react-icons/gi';
import { useState } from 'react';
import { Download, FileText, Book, List, CheckCircle, Info, Award } from 'lucide-react';

interface Download {
  id: string;
  title: string;
  description: string;
  category: 'guide' | 'recipe' | 'shopping' | 'knowledge';
  size: string;
  icon: React.ElementType;
  popular?: boolean;
}

export default function DownloadsPage() {
  const downloads: Download[] = [
    {
      id: 'functional-foods-topplista',
      title: 'Topplistan Functional Foods',
      description: 'Komplett guide över de 10 viktigaste livsmedelskategorierna',
      category: 'guide',
      size: '2.4 MB',
      icon: GiFruitBowl,
      popular: true
    },
    {
      id: 'vecka-1-inkopslista',
      title: 'Vecka 1 - Inköpslista',
      description: 'Komplett inköpslista för första veckan',
      category: 'shopping',
      size: '245 KB',
      icon: List
    },
    {
      id: 'vecka-2-inkopslista',
      title: 'Vecka 2 - Inköpslista',
      description: 'Komplett inköpslista för andra veckan',
      category: 'shopping',
      size: '248 KB',
      icon: List
    },
    {
      id: 'vecka-3-inkopslista',
      title: 'Vecka 3 - Inköpslista',
      description: 'Komplett inköpslista för tredje veckan',
      category: 'shopping',
      size: '251 KB',
      icon: List
    },
    {
      id: 'drycker-guide',
      title: 'Drycker & Smoothies',
      description: 'Recept på hälsosamma drycker och smoothies',
      category: 'recipe',
      size: '1.8 MB',
      icon: GiMeal
    },
    {
      id: 'benbuljong-guide',
      title: 'Benbuljong Guide',
      description: 'Lär dig göra näringsrik benbuljong hemma',
      category: 'recipe',
      size: '1.2 MB',
      icon: GiHealthNormal
    },
    {
      id: 'superpulver-guide',
      title: 'Superpulver Guide',
      description: 'Allt om spirulina, chlorella och andra superpulver',
      category: 'knowledge',
      size: '3.1 MB',
      icon: Award,
      popular: true
    },
    {
      id: 'motivation-reflektion',
      title: 'Motivation & Reflektion',
      description: 'Arbetsmaterial för personlig utveckling',
      category: 'knowledge',
      size: '892 KB',
      icon: Book
    },
    {
      id: 'ersattningsguide-kolhydrater',
      title: 'Ersättningsguide Kolhydrater',
      description: 'Smarta alternativ till vanliga kolhydrater',
      category: 'guide',
      size: '1.5 MB',
      icon: FileText
    },
    {
      id: 'periodisk-fasta-guide',
      title: 'Periodisk Fasta Guide',
      description: 'Introduktion till 16:8 metoden',
      category: 'knowledge',
      size: '2.2 MB',
      icon: Info
    }
  ];

  const categories = [
    { id: 'all', label: 'Alla', icon: FileText },
    { id: 'guide', label: 'Guider', icon: GiFruitBowl },
    { id: 'recipe', label: 'Recept', icon: GiMeal },
    { id: 'shopping', label: 'Inköpslistor', icon: List },
    { id: 'knowledge', label: 'Kunskap', icon: Book }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredDownloads = selectedCategory === 'all' 
    ? downloads 
    : downloads.filter(d => d.category === selectedCategory);

  const handleDownload = (download: Download) => {
    // Simulate download
    console.log('Downloading:', download.title);
    // In real implementation, this would trigger actual file download
  };

  return (
            <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nedladdningar</h1>
          <p className="text-lg text-gray-600">Ladda ner guider, recept och arbetsmaterial</p>
        </motion.div>

        {/* Category Filter */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <category.icon className="inline-block w-4 h-4 mr-2" />
                {category.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Downloads Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDownloads.map((download, index) => (
            <motion.div
              key={download.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {download.popular && (
                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-1 text-sm font-semibold">
                  Populär
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    download.category === 'guide' ? 'bg-purple-100 text-purple-600' :
                    download.category === 'recipe' ? 'bg-background-secondary text-primary' :
                    download.category === 'shopping' ? 'bg-blue-100 text-blue-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <download.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <span className="text-sm text-gray-500">{download.size}</span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">{download.title}</h3>
                <p className="text-gray-600 mb-4">{download.description}</p>

                <button
                  onClick={() => handleDownload(download)}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Ladda ner
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8"
        >
          <div className="flex items-start gap-4">
            <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tips för nedladdningar</h3>
              <p className="text-gray-600">
                Alla dokument är i PDF-format och kan skrivas ut eller sparas på din enhet. 
                Vi rekommenderar att du skapar en mapp för kursmaterialet så du enkelt hittar allt du behöver.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
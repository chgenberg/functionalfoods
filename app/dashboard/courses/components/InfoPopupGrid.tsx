'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, BookOpen, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface KnowledgeDocument {
  title: string;
  slug: string;
  content: string;
  headerImage: string;
  relatedImages: string[];
  keyTakeaways: string[];
  readTime: number;
  course: 'basic' | 'flow';
  order: number;
}

interface InfoPopupGridProps {
  courseType: 'basics' | 'flow' | 'energy';
}

// Icons for different document types
const documentIcons: { [key: string]: string } = {
  'vad är functional foods': '🤔',
  'dags att komma igång': '🚀',
  'min resa till en lugnare mage': '🌟',
  'vanliga mag- och tarmproblem': '🤧',
  'kosten – en guide till en bättre mage och tarm': '📖',
  'fermenterade livsmedel, probiotika och prebiotika': '🥒',
  'tillskott som kan stödja mag- och tarmhälsa': '💊',
  'livsstilsfaktorer': '🧘',
  'att välja rätt kolhydrater': '🌾',
  'att välja rätt proteiner': '🥩',
  'drycker': '🥤',
  'superpulver': '✨',
  'benbuljong': '🍲',
  'ersättningsguide för kolhydrater': '🔄',
  'att äta ute med functional foods': '🍽️',
  'topplista med functional foods': '🏆',
  'frågor och svar': '❓',
  'sammanfattning och källor': '📚',
  'functional foods - 3 steg till ett friskare liv': '🎯',
  'fördelarna-med-functional-foods': '💪',
  'periodisk fasta': '⏰',
  'ät mer functional foods på ett enkelt sätt': '🥗',
  'functional foods som livsstil': '🌱',
  'motivation och reflektion': '💭',
  'måldokument - styrelsemöte 1': '📋',
  'måldokument - styrelsemöte 2': '📊',
  'reflektion - vecka 3': '💭'
};

export default function InfoPopupGrid({ courseType }: InfoPopupGridProps) {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const course = courseType === 'basics' ? 'basic' : courseType;
        const response = await fetch(`/data/knowledge-documents-${course}.json`);
        
        if (response.ok) {
          const data: KnowledgeDocument[] = await response.json();
          setDocuments(data);
        }
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [courseType]);

  const getCourseSlug = () => {
    return courseType === 'basics' ? 'functional-basics' : 
           courseType === 'flow' ? 'functional-flow' : 
           'functional-energy';
  };

  const openPreview = (doc: KnowledgeDocument) => {
    setSelectedDoc(doc);
  };

  const formatTitle = (title: string) => {
    return title.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C560]"></div>
      </div>
    );
  }

  return (
    <>
      {/* Knowledge Documents Grid */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-[#014421] mb-4">Kunskapsdokument</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Utforska våra omfattande guider och fördjupa din kunskap om functional foods
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc, index) => (
            <Link
              key={doc.slug}
              href={`/dashboard/courses/${getCourseSlug()}/knowledge/${doc.slug}`}
              className="group"
            >
              <motion.div
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                {/* Image preview */}
                <div className="relative h-32 overflow-hidden bg-gray-100">
                  <Image 
                    src={doc.headerImage.startsWith('/api/images/') ? doc.headerImage : `/api/images${doc.headerImage.startsWith('/') ? '' : '/'}${doc.headerImage}`}
                    alt={doc.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-2 left-2 text-white">
                    <span className="text-2xl">{documentIcons[doc.title.toLowerCase()] || '📄'}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h4 className="font-semibold text-sm text-[#014421] mb-1 line-clamp-2 group-hover:text-[#116530] transition-colors">
                    {formatTitle(doc.title)}
                  </h4>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500">
                      {doc.readTime} min läsning
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openPreview(doc);
                      }}
                      className="text-xs text-gray-600 hover:text-[#93C560] transition-colors"
                    >
                      Förhandsgranska
                    </button>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {selectedDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header with Image */}
              <div className="relative h-48 md:h-64">
                <Image 
                  src={selectedDoc.headerImage} 
                  alt={selectedDoc.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {formatTitle(selectedDoc.title)}
                  </h2>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {selectedDoc.readTime} min läsning
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                      Del {selectedDoc.order + 1}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 320px)' }}>
                {/* Key Takeaways */}
                {selectedDoc.keyTakeaways.length > 0 && (
                  <div className="mb-6 p-4 bg-[#F3EFE3] rounded-xl">
                    <h3 className="font-semibold text-[#014421] mb-2">Huvudpunkter:</h3>
                    <ul className="space-y-1">
                      {selectedDoc.keyTakeaways.map((takeaway, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-[#93C560] mt-0.5">•</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Content preview */}
                <div 
                  className="prose prose-lg max-w-none line-clamp-6"
                  dangerouslySetInnerHTML={{ 
                    __html: selectedDoc.content.substring(0, 500) + '...' 
                  }}
                />
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Info className="w-4 h-4" />
                  <span>Functional {courseType === 'basics' ? 'Basics' : 'Flow'} kunskapsdokument</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedDoc(null)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    Stäng
                  </button>
                  <Link
                    href={`/dashboard/courses/${getCourseSlug()}/knowledge/${selectedDoc.slug}`}
                    className="px-6 py-2 bg-gradient-to-r from-[#93C560] to-[#7BA94D] text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2"
                  >
                    Läs hela dokumentet
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 
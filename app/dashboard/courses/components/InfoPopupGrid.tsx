'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Loader2 } from 'lucide-react';

interface Document {
  title: string;
  slug: string;
  excerpt?: string;
  headerImage: string;
  readTime: number;
  course: 'basic' | 'flow' | 'energy';
  order: number;
  weekNumber?: number;
}

interface InfoPopupGridProps {
  courseType: 'basics' | 'flow' | 'energy';
  courseId: string;
  currentWeek?: number;
}

// Slug mapping for Basics course weeks
const basicsWeekSlugs: Record<number, string[]> = {
  1: ['vad-a-r-functional-foods', 'dags-att-komma-iga-ng'],
  2: ['functional-foods-3-steg-till-ett-friskare-liv'],
  3: ['periodisk-fasta'],
  4: ['ma-ldokument-styrelsemo-te-1', 'ma-ldokument-styrelsemo-te-2', 'motivation-och-reflektion'],
  5: ['drycker', 'superpulver', 'benbuljong'],
  6: ['topplista-med-functional-foods', 'functional-foods-som-livsstil']
};

// Slug mapping for Flow course weeks
const flowWeekSlugs: Record<number, string[]> = {
  1: ['vad-a-r-functional-foods'],
  2: ['vanliga-mag-och-tarmproblem', 'kosten-en-guide-till-en-ba-ttre-mage-och-tarm'],
  3: ['tillskott-som-kan-sto-dja-mag-och-tarmha-lsa', 'fermenterade-livsmedel-probiotika-och-prebiotika'],
  4: ['livsstilsfaktorer'],
  5: ['att-va-lja-ra-tt-proteiner', 'att-va-lja-ra-tt-kolhydrater'],
  6: ['topplista-med-functional-foods']
};

// Slug mapping for Energy course weeks
const energyWeekSlugs: Record<number, string[]> = {
  1: ['vad-ar-functional-foods', 'dags-att-komma-igang', 'fragor-och-svar'],
  2: ['functional-foods-for-diabetiker'],
  3: ['lagkolhydratskost-functional-foods'],
  4: ['insulinresistens-betacellsfunktion'],
  5: ['halsosam-livsstil-blodsocker'],
  6: []
};

const InfoPopupGrid: React.FC<InfoPopupGridProps> = ({ courseType, courseId, currentWeek }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Map courseType to API course param
        const course = courseType === 'basics' ? 'basic' : courseType === 'flow' ? 'flow' : 'energy';
        const res = await fetch(`/api/knowledge?course=${course}`);
        const data = await res.json();
        
        let docs = data.documents || [];
        
        // Filter by current week using slug mappings for all courses
        if (currentWeek !== undefined) {
          let weekSlugs: string[] = [];
          
          if (courseType === 'basics') {
            weekSlugs = basicsWeekSlugs[currentWeek] || [];
          } else if (courseType === 'flow') {
            weekSlugs = flowWeekSlugs[currentWeek] || [];
          } else if (courseType === 'energy') {
            weekSlugs = energyWeekSlugs[currentWeek] || [];
          }
          
          docs = docs.filter((doc: Document) => weekSlugs.includes(doc.slug));
          console.log(`📚 InfoPopupGrid: Filtering ${courseType} week ${currentWeek} with slugs:`, weekSlugs);
          console.log(`📚 InfoPopupGrid: Found ${docs.length} documents`);
        }
        
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading documents:', error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [courseType, currentWeek]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Inga kunskapsdokument tillgängliga för denna vecka.</p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {documents.map((doc) => (
        <Link
          key={doc.slug}
          href={`/dashboard/courses/${courseId}/knowledge/${doc.slug}`}
          className="block"
        >
          <motion.div
            variants={item}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden h-full"
          >
            {doc.headerImage && (
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <Image
                  src={(doc.headerImage.startsWith('/api/images') ? doc.headerImage : `/api/images${doc.headerImage.startsWith('/') ? '' : '/'}${doc.headerImage}`) + `?cb=${Date.now()}`}
                  alt={doc.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.error(`Failed to load image for ${doc.title}:`, doc.headerImage);
                    // @ts-ignore
                    e.currentTarget.src = '/images/recipe-placeholder.svg';
                  }}
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 group-hover:text-green-600 transition-colors">
                {doc.title}
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{doc.readTime} min läsning</span>
                </div>
                
                <div className="flex items-center text-green-600 group-hover:translate-x-1 transition-transform">
                  <span className="text-sm font-medium">Läs mer</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  );
};

export default InfoPopupGrid; 
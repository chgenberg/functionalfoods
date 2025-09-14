'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Loader2 } from 'lucide-react';

interface Document {
  title: string;
  slug: string;
  excerpt: string;
  readTime: number;
  headerImage?: string;
  relatedImages?: { src: string; alt: string }[];
  keyTakeaways?: string[];
  content?: string;
  course?: string;
  weekNumber?: number | null;
}

interface InfoPopupGridProps {
  courseType: 'basics' | 'flow';
  courseId: string;
  currentWeek?: number;
}

const InfoPopupGrid: React.FC<InfoPopupGridProps> = ({ courseType, courseId, currentWeek }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // Map courseType to API course param
        const course = courseType === 'basics' ? 'basic' : 'flow';
        const res = await fetch(`/api/knowledge?course=${course}`);
        const data = await res.json();
        
        let docs = data.documents || [];
        
        // Filter by current week if provided
        if (currentWeek !== undefined) {
          docs = docs.filter((doc: Document) => doc.weekNumber === currentWeek);
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
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={`/api/images${doc.headerImage}`}
                  alt={doc.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-green-600 transition-colors">
                {doc.title}
              </h3>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {doc.excerpt}
              </p>
              
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
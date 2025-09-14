"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import KnowledgeDocumentTemplate from '@/app/components/KnowledgeDocumentTemplate';
import { motion } from 'framer-motion';

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
  previousDocument?: {
    title: string;
    slug: string;
    href?: string;
  };
  nextDocument?: {
    title: string;
    slug: string;
    href?: string;
  };
}

export default function KnowledgeDocumentPage() {
  const params = useParams();
  const { courseId, documentSlug } = params;
  const [document, setDocument] = useState<KnowledgeDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        // Bestäm kurs baserat på courseId
        const course = courseId === 'functional-basics' ? 'basic' : 'flow';
        
        // Ladda dokumentdata
        const response = await fetch(`/data/knowledge-documents-${course}.json`);
        const documents: KnowledgeDocument[] = await response.json();
        
        // Hitta rätt dokument
        const doc = documents.find(d => d.slug === documentSlug);
        
        if (doc) {
          // Uppdatera navigeringslänkar
          if (doc.previousDocument) {
            doc.previousDocument = {
              ...doc.previousDocument,
              href: `/dashboard/courses/${courseId}/knowledge/${doc.previousDocument.slug}`
            };
          }
          if (doc.nextDocument) {
            doc.nextDocument = {
              ...doc.nextDocument,
              href: `/dashboard/courses/${courseId}/knowledge/${doc.nextDocument.slug}`
            };
          }
          
          setDocument(doc);
        }
      } catch (error) {
        console.error('Error loading document:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [courseId, documentSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-[#93C560] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-500 mt-4 font-light">Laddar dokument...</p>
        </motion.div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-light text-gray-600 mb-4">Dokumentet hittades inte</h2>
          <a 
            href={`/dashboard/courses/${courseId}`}
            className="text-[#93C560] hover:text-[#7BA94D] font-medium"
          >
            Tillbaka till kursen
          </a>
        </div>
      </div>
    );
  }

  return (
    <KnowledgeDocumentTemplate
      title={document.title.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')}
      subtitle={`Del ${document.order + 1} av kursen`}
      headerImage={document.headerImage}
      content={document.content}
      readTime={document.readTime}
      course={document.course}
      relatedImages={document.relatedImages}
      keyTakeaways={document.keyTakeaways}
      nextDocument={document.nextDocument ? {
        title: document.nextDocument.title,
        href: document.nextDocument.href || `/dashboard/courses/${courseId}/knowledge/${document.nextDocument.slug}`
      } : undefined}
      previousDocument={document.previousDocument ? {
        title: document.previousDocument.title,
        href: document.previousDocument.href || `/dashboard/courses/${courseId}/knowledge/${document.previousDocument.slug}`
      } : undefined}
    />
  );
} 
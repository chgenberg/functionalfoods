'use client';

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
  const { courseId, documentSlug } = params as { courseId: string; documentSlug: string };
  const [document, setDocument] = useState<KnowledgeDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const course = courseId === 'functional-basics' ? 'basic' : 'flow';
        const response = await fetch(`/data/knowledge-documents-${course}.json`);
        const documents: KnowledgeDocument[] = await response.json();
        const doc = documents.find(d => d.slug === documentSlug);
        if (doc) {
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
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C560]"></div>
      </div>
    );
  }

  if (!document) return null;

  return (
    <KnowledgeDocumentTemplate
      title={document.title}
      headerImage={document.headerImage}
      content={document.content}
      readTime={document.readTime}
      course={document.course}
      relatedImages={document.relatedImages}
      keyTakeaways={document.keyTakeaways}
      nextDocument={document.nextDocument as any}
      previousDocument={document.previousDocument as any}
    />
  );
} 
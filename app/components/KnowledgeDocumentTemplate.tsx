"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, BookOpen, Download, Printer, Loader2 } from 'lucide-react';

interface Document {
  title: string;
  slug: string;
  content: string;
  headerImage?: string;
  relatedImages?: { src: string; alt: string }[];
  keyTakeaways?: string[];
  readTime: number;
  excerpt?: string;
}

interface KnowledgeDocumentTemplateProps {
  documentSlug: string;
  courseId: string;
  courseType: 'basics' | 'flow' | 'energy';
  nextDocument?: { title: string; slug: string };
  previousDocument?: { title: string; slug: string };
}

const KnowledgeDocumentTemplate: React.FC<KnowledgeDocumentTemplateProps> = ({
  documentSlug,
  courseId,
  courseType,
  nextDocument,
  previousDocument
}) => {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        console.log('Fetching document with slug:', documentSlug);
        const res = await fetch(`/api/knowledge?slug=${documentSlug}`);
        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Response data:', data);
        
        if (data.documents && data.documents.length > 0) {
          setDocument(data.documents[0]);
          console.log('Document set:', data.documents[0].title);
        } else {
          console.error('No documents found in response');
        }
      } catch (error) {
        console.error('Error loading document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentSlug]);

  const handlePrint = () => {
    const printUrl = `/dashboard/courses/${courseId}/knowledge/print/${documentSlug}`;
    const printWindow = window.open(printUrl, '_blank', 'width=800,height=600');
    
    if (printWindow) {
      printWindow.addEventListener('load', () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      });
    }
  };

  const handleDownloadPDF = async () => {
    // First open print view
    handlePrint();
    
    // Then trigger server-side PDF download
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/knowledge/pdf?courseId=${courseId}&slug=${documentSlug}`);
        
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = window.document.createElement('a');
          a.href = url;
          a.download = `${documentSlug}.pdf`;
          window.document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          window.document.body.removeChild(a);
        }
      } catch (error) {
        console.error('PDF download error:', error);
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Dokumentet kunde inte hittas.</p>
      </div>
    );
  }

  return (
    <motion.article 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto"
    >
      {/* Header Image - Square format for both portrait and landscape */}
      {document.headerImage && (
        <motion.div 
          className="relative w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
            <Image
              src={document.headerImage.startsWith('/api/images') ? document.headerImage : `/api/images${document.headerImage.startsWith('/') ? '' : '/'}${document.headerImage}`}
              alt={document.title}
              fill
              className="object-cover"
              priority
              unoptimized
              onError={(e) => {
                console.error(`Failed to load header image for ${document.title}:`, document.headerImage);
                try {
                  // @ts-ignore
                  e.currentTarget.src = '/images/recipe-placeholder.svg';
                } catch {}
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <div className="max-w-3xl mx-auto text-white">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">{document.title}</h1>
                <div className="flex items-center gap-4 text-sm md:text-base">
                  <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4" />
                    {document.readTime} min läsning
                  </span>
                  <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <BookOpen className="w-4 h-4" />
                    Functional {courseType === 'basics' ? 'Basics' : courseType === 'flow' ? 'Flow' : 'Energy'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="border-b px-6 py-4 flex justify-end gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Skriv ut</span>
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Ladda ner PDF</span>
        </button>
      </div>

      <div className="p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          {/* Key Takeaways */}
          {document.keyTakeaways && document.keyTakeaways.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-10 p-6 md:p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-sm"
            >
              <h2 className="text-xl md:text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Huvudpunkter
              </h2>
              <ul className="space-y-3">
                {document.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-600 mt-1 text-xl">•</span>
                    <span className="text-gray-700 leading-relaxed">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="prose prose-lg max-w-none prose-headings:text-[#014421] prose-h1:text-3xl prose-h1:mb-6 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-relaxed prose-p:mb-5 prose-ul:my-6 prose-li:my-2 prose-a:text-green-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />

          {/* Related Images */}
          {document.relatedImages && document.relatedImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Relaterade bilder</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {document.relatedImages.map((image, index) => (
                  <div key={index} className="relative h-64 rounded-lg overflow-hidden shadow-md">
                    <Image
                      src={image.src.startsWith('/api/images') ? image.src : `/api/images${image.src.startsWith('/') ? '' : '/'}${image.src}`}
                      alt={image.alt || 'Relaterad bild'}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        console.error('Failed to load related image:', image.src);
                        try {
                          // @ts-ignore
                          e.currentTarget.src = '/images/recipe-placeholder.svg';
                        } catch {}
                      }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 pt-8 border-t flex justify-between items-center"
          >
            {previousDocument ? (
              <Link
                href={`/dashboard/courses/${courseId}/knowledge/${previousDocument.slug}`}
                className="group flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Föregående</p>
                  <p className="font-medium">{previousDocument.title}</p>
                </div>
              </Link>
            ) : (
              <div />
            )}
            
            {nextDocument ? (
              <Link
                href={`/dashboard/courses/${courseId}/knowledge/${nextDocument.slug}`}
                className="group flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors text-right"
              >
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Nästa</p>
                  <p className="font-medium">{nextDocument.title}</p>
                </div>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <div />
            )}
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
};

export default KnowledgeDocumentTemplate; 
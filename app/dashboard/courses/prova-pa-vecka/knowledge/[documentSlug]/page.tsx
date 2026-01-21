'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Clock, Download, Book } from 'lucide-react';
import { motion } from 'framer-motion';

interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  readingTime?: number;
  headerImage?: string;
  keyTakeaways?: string[];
}

export default function KnowledgeDocumentPage() {
  const params = useParams();
  const slug = params.documentSlug as string;
  const [document, setDocument] = useState<KnowledgeDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await fetch(`/api/knowledge-documents/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setDocument(data);
        } else {
          setError('Dokumentet hittades inte');
        }
      } catch (err) {
        setError('Kunde inte ladda dokumentet');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDocument();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#014421] border-t-transparent"></div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
        <div className="h-16 md:h-0" />
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Link href="/dashboard/courses/prova-pa-vecka/material" className="text-gray-500 hover:text-gray-700 flex items-center">
                <ChevronLeft className="w-5 h-5" /> Tillbaka
              </Link>
            </div>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <Book className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
          <Link href="/dashboard/courses/prova-pa-vecka/material" className="text-[#014421] font-medium hover:underline">
            Tillbaka till kunskapsdokument
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3]">
      {/* Top spacer */}
      <div className="h-16 md:h-0" />

      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/courses/prova-pa-vecka/material" className="text-gray-500 hover:text-gray-700 flex items-center">
                <ChevronLeft className="w-5 h-5" /> Tillbaka
              </Link>
            </div>
            <span className="text-[#014421] font-bold text-sm truncate max-w-[200px]">{document.title}</span>
            <div className="w-20" />
          </div>
        </div>
      </nav>

      {/* Header Image */}
      {document.headerImage && (
        <div className="relative h-64 md:h-96 bg-gray-200">
          <img
            src={document.headerImage}
            alt={document.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 md:p-10"
        >
          {/* Title */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#014421] mb-4">
              {document.title}
            </h1>
            {document.readingTime && (
              <div className="flex items-center gap-2 text-gray-500">
                <Clock className="w-5 h-5" />
                <span>{document.readingTime} min läsning</span>
              </div>
            )}
          </header>

          {/* Key Takeaways */}
          {document.keyTakeaways && document.keyTakeaways.length > 0 && (
            <div className="bg-[#014421]/5 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-bold text-[#014421] mb-4">Nyckelinsikter</h2>
              <ul className="space-y-2">
                {document.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-[#014421] text-white rounded-full flex items-center justify-center text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Content */}
          <div 
            className="prose prose-lg max-w-none prose-headings:text-[#014421] prose-a:text-[#014421] prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
        </motion.article>
      </div>

      {/* Navigation Footer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
        <div className="flex justify-between items-center">
          <Link
            href="/dashboard/courses/prova-pa-vecka/material"
            className="inline-flex items-center gap-2 text-[#014421] font-medium hover:underline"
          >
            <ChevronLeft className="w-5 h-5" />
            Alla kunskapsdokument
          </Link>
        </div>
      </div>
    </div>
  );
}

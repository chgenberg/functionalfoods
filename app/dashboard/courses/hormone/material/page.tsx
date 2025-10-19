'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText, Download } from 'lucide-react';
import CourseNavigation from '../../components/CourseNavigation';

interface KnowledgeDocument {
  id: string;
  title: string;
  slug: string;
  readTime: number;
  weekNumber?: number;
}

export default function HormoneMaterialPage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch('/api/knowledge?course=hormone');
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        }
      } catch (e) {
        console.error('Error fetching knowledge documents:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F7F5F0] via-[#F7F1E8] to-[#F3EFE3]">
      <div className="h-16 md:h-0" />
      <CourseNavigation courseType="hormone" currentWeek={1} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/courses/hormone/oversikt"
          className="inline-flex items-center gap-2 text-[#014421] hover:text-[#116530] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Tillbaka till översikt
        </Link>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-[#014421] mb-6">Kursmaterial</h1>
          <p className="text-gray-600 mb-8">
            Här hittar du alla kunskapsdokument och material för kursen Hormonell Balans
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto"></div>
              <p className="text-gray-600 mt-4">Laddar material...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Inget kursmaterial tillgängligt än</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={`/kunskapsbank/${doc.slug}`}
                    className="block p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-[#8B5CF6] hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-[#8B5CF6]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-[#014421] mb-2">{doc.title}</h3>
                        {doc.weekNumber && (
                          <span className="text-xs bg-[#8B5CF6]/10 text-[#8B5CF6] px-2 py-1 rounded-full">
                            Vecka {doc.weekNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{doc.readTime} min läsning</span>
                      <FileText className="w-4 h-4" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}


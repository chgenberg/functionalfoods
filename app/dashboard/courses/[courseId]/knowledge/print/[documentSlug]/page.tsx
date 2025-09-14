'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface KnowledgeDocument {
  title: string;
  slug: string;
  content: string;
  headerImage: string;
  readTime: number;
  course: 'basic' | 'flow';
}

export default function KnowledgeDocumentPrintPage() {
  const params = useParams();
  const { courseId, documentSlug } = params as { courseId: string; documentSlug: string };
  const [doc, setDoc] = useState<KnowledgeDocument | null>(null);

  useEffect(() => {
    const load = async () => {
      const course = courseId === 'functional-basics' ? 'basic' : 'flow';
      const res = await fetch(`/data/knowledge-documents-${course}.json`);
      const data: KnowledgeDocument[] = await res.json();
      const d = data.find(x => x.slug === documentSlug) || null;
      setDoc(d);
      // Trigger print when loaded
      setTimeout(() => window.print(), 500);
    };
    load();
  }, [courseId, documentSlug]);

  if (!doc) return null;

  const headerSrc = doc.headerImage?.startsWith('/api/images/') ? doc.headerImage : `/api/images${doc.headerImage?.startsWith('/') ? '' : '/'}${doc.headerImage}`;

  return (
    <div className="p-6 print:p-0">
      <div className="max-w-3xl mx-auto">
        <img src={headerSrc} alt={doc.title} className="w-full h-64 object-cover rounded-md mb-6" />
        <h1 className="text-3xl font-semibold mb-2">{doc.title}</h1>
        <p className="text-gray-600 mb-6">{doc.readTime} min läsning · Functional {doc.course === 'basic' ? 'Basics' : 'Flow'}</p>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: doc.content }} />
      </div>
      <style jsx global>{`
        @media print {
          html, body { background: white; }
          a { color: black; text-decoration: none; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
} 
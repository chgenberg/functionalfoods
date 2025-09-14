'use client';

import { useParams } from 'next/navigation';
import KnowledgeDocumentTemplate from '@/app/components/KnowledgeDocumentTemplate';

export default function KnowledgeDocumentPage() {
  const params = useParams();
  const { courseId, documentSlug } = params as { courseId: string; documentSlug: string };
  
  // Determine course type from courseId
  const courseType = courseId === 'functional-basics' ? 'basics' : 'flow';

  return (
    <KnowledgeDocumentTemplate
      documentSlug={documentSlug}
      courseId={courseId}
      courseType={courseType}
    />
  );
} 
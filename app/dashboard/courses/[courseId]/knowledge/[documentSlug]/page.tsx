'use client';

import { useParams } from 'next/navigation';
import KnowledgeDocumentTemplate from '@/app/components/KnowledgeDocumentTemplate';

export default function KnowledgeDocumentPage() {
  const params = useParams();
  const { courseId, documentSlug } = params as { courseId: string; documentSlug: string };
  
  // Determine course type from courseId
  const courseType = courseId === 'functional-basics' ? 'basics' : courseId === 'functional-flow' ? 'flow' : courseId === 'functional-energy' ? 'energy' : courseId === 'hormonell-balans' || courseId === 'functional-hormone' ? 'hormone' : 'basics';

  return (
    <KnowledgeDocumentTemplate
      documentSlug={documentSlug}
      courseId={courseId}
      courseType={courseType}
    />
  );
} 
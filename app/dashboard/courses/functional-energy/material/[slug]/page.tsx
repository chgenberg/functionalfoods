'use client';

import { useParams } from 'next/navigation';
import KnowledgeDocumentTemplate from '@/app/components/KnowledgeDocumentTemplate';

export default function KnowledgeDocumentPage() {
  const params = useParams();
  const { slug } = params as { slug: string };
  
  return (
    <KnowledgeDocumentTemplate
      documentSlug={slug}
      courseId="functional-energy"
      courseType="energy"
    />
  );
}
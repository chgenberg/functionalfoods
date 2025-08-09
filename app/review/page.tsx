"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import CourseReviewForm from '@/app/components/CourseReviewForm';

export const dynamic = 'force-dynamic';

function ReviewInner() {
  const sp = useSearchParams();
  const { user } = useAuth();
  const courseId = sp.get('courseId') || 'functional-basics';

  if (!user?.id) {
    return <div className="max-w-2xl mx-auto p-6">Logga in för att lämna ditt omdöme.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Lämna ditt omdöme</h1>
      <CourseReviewForm courseId={courseId} userId={user.id} />
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto p-6">Laddar...</div>}>
      <ReviewInner />
    </Suspense>
  );
} 
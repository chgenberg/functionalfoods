'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import KostschemaTemplate from '@/app/dashboard/courses/components/KostschemaTemplate';

function KostschemaContent() {
  const searchParams = useSearchParams();
  const view = searchParams?.get('view') || 'week';
  const week = searchParams ? parseInt(searchParams.get('week') || '1') : 1;

  return <KostschemaTemplate courseType="hormone" view={view as 'week' | 'all'} initialWeek={week} />;
}

export default function KostschemaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]"></div>
      </div>
    }>
      <KostschemaContent />
    </Suspense>
  );
}


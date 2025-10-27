'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import ShoppingList from './ShoppingList';

function ShoppingListContent() {
  const searchParams = useSearchParams();
  const week = searchParams ? parseInt(searchParams.get('week') || '1') : 1;

  return <ShoppingList weekNumber={week} courseId="hormonell-balans" />;
}

export default function ShoppingListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421]"></div>
      </div>
    }>
      <ShoppingListContent />
    </Suspense>
  );
}


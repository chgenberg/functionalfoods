import { Suspense } from 'react';
import Client from './print-shopping-list.client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PrintShoppingListPage() {
  return (
    <Suspense
      fallback={(
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto mb-4"></div>
            <p className="text-gray-600">Förbereder inköpslista...</p>
          </div>
        </div>
      )}
    >
      <Client />
    </Suspense>
  );
}

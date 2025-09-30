'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FlowCommunityPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the shared community page
    router.replace('/dashboard/community');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d78] mx-auto mb-4"></div>
        <p className="text-gray-600">Omdirigerar till community...</p>
      </div>
    </div>
  );
} 
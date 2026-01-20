'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminCoursesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/course-builder');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--primary-green)] rounded-full animate-spin border-t-transparent mx-auto"></div>
        <p className="text-[var(--text-secondary)] mt-4 text-sm">Omdirigerar till Course Builder...</p>
      </div>
    </div>
  );
}

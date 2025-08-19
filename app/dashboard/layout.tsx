'use client';

import CourseNavigation from './courses/components/CourseNavigation';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [courseType, setCourseType] = useState<'basics' | 'flow'>('basics');

  useEffect(() => {
    // Determine course type based on URL
    if (pathname.includes('functional-flow')) {
      setCourseType('flow');
    } else {
      // Default to basics for all other pages
      setCourseType('basics');
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      <CourseNavigation courseType={courseType} />
      {children}
    </div>
  );
} 
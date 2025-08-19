'use client';

import { usePathname } from 'next/navigation';
import CourseNavigation from '@/app/dashboard/courses/components/CourseNavigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Determine which course type we're in based on the URL
  const courseType = pathname.includes('/functional-flow') ? 'flow' : 'basics';
  
  // Extract current week from URL if available
  const weekMatch = pathname.match(/week\/(\d+)/);
  const currentWeek = weekMatch ? parseInt(weekMatch[1]) : 1;

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Global Course Navigation - shows on ALL dashboard pages */}
      <CourseNavigation courseType={courseType} currentWeek={currentWeek} />
      
      {/* Page content */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
} 
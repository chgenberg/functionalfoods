'use client';

import { ReactNode } from 'react';
import CourseNavigation from '../components/CourseNavigation';

export default function FunctionalBasicsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      <CourseNavigation courseType="basics" />
      {children}
    </div>
  );
} 
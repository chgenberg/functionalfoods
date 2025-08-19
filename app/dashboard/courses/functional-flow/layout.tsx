'use client';

import { ReactNode } from 'react';
import CourseNavigation from '../components/CourseNavigation';

export default function FunctionalFlowLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      <CourseNavigation courseType="flow" />
      {children}
    </div>
  );
}

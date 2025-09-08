'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';
import { flowMealPlans } from '@/app/data/mealPlans';

export default function Week5Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    const savedStartDate = typeof window !== 'undefined' ? localStorage.getItem('flowStartDate') : null;
    if (savedStartDate) {
      setCourseStartDate(new Date(savedStartDate as string));
    } else if (typeof window !== 'undefined') {
      const startDate = new Date();
      localStorage.setItem('flowStartDate', startDate.toISOString());
      setCourseStartDate(startDate);
    }
  }, []);

  return (
    <WeekTemplate
      courseType="flow"
      weekNumber={5}
      weekTitle="Longevity & återhämtning"
      weekSubtitle="Vecka 5 - Långsiktig hälsa och optimal återhämtning"
      heroImage="/Ulrika_portratt/udavidssondesktop.png"
      videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      mealPlans={flowMealPlans}
      courseStartDate={courseStartDate}
    />
  );
}
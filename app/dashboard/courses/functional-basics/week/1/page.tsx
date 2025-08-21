'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';
import { mealPlans } from '@/app/data/mealPlans';

export default function Week1Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    const savedStartDate = localStorage.getItem('basicsStartDate');
    if (savedStartDate) {
      setCourseStartDate(new Date(savedStartDate));
    } else {
      const startDate = new Date();
      localStorage.setItem('basicsStartDate', startDate.toISOString());
      setCourseStartDate(startDate);
    }
  }, []);

  return (
    <WeekTemplate
      courseType="basics"
      weekNumber={1}
      weekTitle="Grunden i Functional Foods"
      weekSubtitle="Vecka 1 - Lär dig grunderna i functional foods och hur du optimerar din hälsa"
      heroImage="/Ulrika_portratt/udavidssondesktop.png"
      videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      mealPlans={mealPlans}
      courseStartDate={courseStartDate}
    />
  );
}

 
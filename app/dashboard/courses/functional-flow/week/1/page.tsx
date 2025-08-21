'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';
import { flowMealPlans } from '@/app/data/mealPlans';

export default function Week1Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    const savedStartDate = localStorage.getItem('flowStartDate');
    if (savedStartDate) {
      setCourseStartDate(new Date(savedStartDate));
    } else {
      const today = new Date();
      const day = today.getDay();
      const daysUntilMonday = (1 - day + 7) % 7 || 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      localStorage.setItem('flowStartDate', nextMonday.toISOString());
      setCourseStartDate(nextMonday);
    }
  }, []);

  return (
    <WeekTemplate
      courseType="flow"
      weekNumber={1}
      weekTitle="Optimera din energi"
      weekSubtitle="Vecka 1 - Grundläggande energioptimering och avancerade näringsstrategier"
      heroImage="/Ulrika_portratt/udavidssondesktop.png"
      videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      mealPlans={flowMealPlans}
      courseStartDate={courseStartDate}
    />
  );
}
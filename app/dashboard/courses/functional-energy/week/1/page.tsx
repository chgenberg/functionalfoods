'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';
import { energyMealPlans } from '@/app/data/mealPlans';

export default function Week1Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    const savedStartDate = localStorage.getItem('energyStartDate');
    if (savedStartDate) {
      setCourseStartDate(new Date(savedStartDate));
    } else {
      const today = new Date();
      const day = today.getDay();
      const daysUntilMonday = (1 - day + 7) % 7 || 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      localStorage.setItem('energyStartDate', nextMonday.toISOString());
      setCourseStartDate(nextMonday);
    }
  }, []);

  return (
    <WeekTemplate
      courseType="energy"
      weekNumber={1}
      weekTitle="Introduktion till stabilt blodsocker"
      weekSubtitle="Vecka 1 - Lär dig grunderna om blodsocker och börja din energiresa"
      heroImage="/lax-med-sellerisallad-och-valnotter.JPG"
      videoUrl="https://player.vimeo.com/video/1054236789?h=0c219534c4"
      mealPlans={energyMealPlans}
      courseStartDate={courseStartDate}
    />
  );
} 
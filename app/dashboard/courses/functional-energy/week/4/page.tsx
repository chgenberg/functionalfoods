'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';
import { energyMealPlans } from '@/app/data/mealPlans';

export default function Week4Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    const savedStartDate = localStorage.getItem('energyStartDate');
    if (savedStartDate) {
      setCourseStartDate(new Date(savedStartDate));
    }
  }, []);

  return (
    <WeekTemplate
      courseType="energy"
      weekNumber={4}
      weekTitle="Smarta kolhydrater"
      weekSubtitle="Vecka 4 - Välj rätt kolhydrater för stabil energi"
      heroImage="/lax-med-sellerisallad-och-valnotter.JPG"
      videoUrl="https://player.vimeo.com/video/1054236789?h=0c219534c4"
      mealPlans={energyMealPlans}
      courseStartDate={courseStartDate}
    />
  );
} 
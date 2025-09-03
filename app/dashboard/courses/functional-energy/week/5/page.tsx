'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';
import { energyMealPlans } from '@/app/data/mealPlans';

export default function Week5Page() {
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
      weekNumber={5}
      weekTitle="Energistabila vanor"
      weekSubtitle="Vecka 5 - Bygg vanor som håller energin stabil"
      heroImage="/lax-med-sellerisallad-och-valnotter.JPG"
      videoUrl="https://player.vimeo.com/video/1054236789?h=0c219534c4"
      mealPlans={energyMealPlans}
      courseStartDate={courseStartDate}
    />
  );
} 
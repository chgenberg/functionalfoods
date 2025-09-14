'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';

export default function Week3Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);

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

  useEffect(() => {
    const loadMealPlan = async () => {
      try {
        const res = await fetch('/api/meal-plans?course=flow&week=3');
        const data = await res.json();
        setMealPlan({ week3: data });
      } catch (e) {
        setMealPlan(null);
      }
    };
    loadMealPlan();
  }, []);

  if (!mealPlan) return null;

  return (
    <WeekTemplate
      courseType="flow"
      weekNumber={3}
      weekTitle="Prestationshöjande kost"
      weekSubtitle="Vecka 3 - Optimera din kost för maximal prestanda och återhämtning"
      heroImage="/Ulrika_portratt/udavidssondesktop.png"
      videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      mealPlans={mealPlan}
      courseStartDate={courseStartDate}
    />
  );
}
'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';

export default function Week4Page() {
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
        const res = await fetch('/api/meal-plans?course=flow&week=4');
        const data = await res.json();
        setMealPlan({ week4: data });
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
      weekNumber={4}
      weekTitle="Antiinflammatorisk livsstil"
      weekSubtitle="Vecka 4 - Minska inflammation och förbättra din hälsa"
      heroImage="/Ulrika_portratt/udavidssondesktop.png"
      videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      mealPlans={mealPlan}
      courseStartDate={courseStartDate}
    />
  );
}
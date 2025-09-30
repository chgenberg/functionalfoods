'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';
import { energyMealPlans } from '@/app/data/mealPlans';

export default function Week2Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);

  useEffect(() => {
    const savedStartDate = typeof window !== 'undefined' ? localStorage.getItem('energyStartDate') : null;
    if (savedStartDate) {
      setCourseStartDate(new Date(savedStartDate as string));
    } else if (typeof window !== 'undefined') {
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

  useEffect(() => {
    setMealPlan(energyMealPlans);
  }, []);

  if (!mealPlan) return null;

  return (
    <WeekTemplate
      courseType="energy"
      weekNumber={2}
      weekTitle="Fördjupning i blodsockerbalans"
      weekSubtitle="Vecka 2 - Lär dig förstå kolhydrater och deras effekt på energin"
      heroImage="/Functional_Energy/energy-week2.jpg"
      videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      mealPlans={mealPlan}
      courseStartDate={courseStartDate}
    />
  );
}
'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';

export default function Week1Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);

  useEffect(() => {
    const savedStartDate = typeof window !== 'undefined' ? localStorage.getItem('flowStartDate') : null;
    if (savedStartDate) {
      setCourseStartDate(new Date(savedStartDate as string));
    } else if (typeof window !== 'undefined') {
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

  useEffect(() => {
    const loadMealPlan = async () => {
      try {
        const res = await fetch('/api/meal-plans?course=flow&week=1');
        const data = await res.json();
        setMealPlan({ week1: data });
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
      weekNumber={1}
      weekTitle="Optimera din energi"
      weekSubtitle="Vecka 1 - Grundläggande energioptimering och avancerade näringsstrategier"
      heroImage="/Ulrika_portratt/udavidssondesktop.png"
      videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      mealPlans={mealPlan}
      courseStartDate={courseStartDate}
    />
  );
}
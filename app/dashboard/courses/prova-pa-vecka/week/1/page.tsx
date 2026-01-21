'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';

export default function ProvaPaVeckaWeek1Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);

  useEffect(() => {
    // Save this course as the last visited
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastVisitedCourse', 'prova-pa-vecka');
    }

    // Get user email from auth to make localStorage key user-specific
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let userEmail = '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userEmail = payload.email || payload.userId || '';
      } catch {}
    }

    const storageKey = userEmail ? `provaPaVeckaStartDate_${userEmail}` : 'provaPaVeckaStartDate';
    const savedStartDate = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

    if (savedStartDate) {
      setCourseStartDate(new Date(savedStartDate));
    } else {
      // New user - set start date to TODAY
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, today.toISOString());
      }
      setCourseStartDate(today);
    }
  }, []);

  useEffect(() => {
    const loadMealPlan = async () => {
      try {
        const res = await fetch('/api/meal-plans?course=prova-pa-vecka&week=1');
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
      courseType="prova-pa-vecka"
      weekNumber={1}
      weekTitle="Prova på-veckan med Functional Foods!"
      weekSubtitle="En inspirerande introduktion till Functional Foods med smakrika recept"
      heroImage="/kurser/prova-pa/prova-pa.png"
      videoUrl="https://player.vimeo.com/video/1156756899"
      mealPlans={mealPlan}
      courseStartDate={courseStartDate}
    />
  );
}

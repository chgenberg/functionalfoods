'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';

export default function Week4Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let userEmail = '';
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        userEmail = payload.email || payload.userId || '';
      } catch {}
    }
    
    const storageKey = userEmail ? `hormoneStartDate_${userEmail}` : 'hormoneStartDate';
    const savedStartDate = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    
    if (savedStartDate) {
      setCourseStartDate(new Date(savedStartDate as string));
    } else if (typeof window !== 'undefined') {
      const today = new Date();
      const day = today.getDay();
      const daysUntilMonday = (1 - day + 7) % 7 || 7;
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      nextMonday.setHours(0, 0, 0, 0);
      localStorage.setItem(storageKey, nextMonday.toISOString());
      setCourseStartDate(nextMonday);
    }
  }, []);

  useEffect(() => {
    const loadMealPlan = async () => {
      try {
        const res = await fetch('/api/meal-plans?course=hormone&week=4');
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
      courseType="hormone"
      weekNumber={4}
      weekTitle="Vecka 4"
      weekSubtitle="Vecka 4 - Vidareutveckling"
      heroImage="/Ulrika_portratt/udavidssondesktop.png"
      videoUrl=""
      mealPlans={mealPlan}
      courseStartDate={courseStartDate}
    />
  );
}


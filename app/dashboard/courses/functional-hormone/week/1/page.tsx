'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';

export default function Week1Page() {
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
      setCourseStartDate(new Date(savedStartDate));
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
        const res = await fetch('/api/meal-plans?course=hormone&week=1');
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
      courseType="hormone"
      weekNumber={1}
      weekTitle="Introduktion till Hormonell Balans"
      weekSubtitle="Vecka 1 - Börja din resa mot bättre hormonell balans"
      heroImage="/Ulrika_portratt/udavidssondesktop.png"
      videoUrl="https://player.vimeo.com/video/1131199521"
      mealPlans={mealPlan}
      courseStartDate={courseStartDate}
    />
  );
}


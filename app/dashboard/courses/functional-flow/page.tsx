'use client';

import { useState, useEffect } from 'react';
import CourseTemplate from '@/app/dashboard/courses/components/CourseTemplate';
import { flowMealPlans } from '@/app/data/mealPlans';

export default function FunctionalFlowPage() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    // Calculate current week and day based on start date
    const savedStartDate = localStorage.getItem('flowStartDate');
    if (savedStartDate) {
      const startDate = new Date(savedStartDate);
      setCourseStartDate(startDate);
      
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
      // Always start at week 1 for new users, but allow progression for existing users
      const calculatedWeek = daysDiff < 0 ? 1 : Math.min(6, Math.max(1, Math.ceil((daysDiff + 1) / 7)));
      const calculatedDay = daysDiff < 0 ? 1 : Math.min(7, Math.max(1, (daysDiff % 7) + 1));
      
      setCurrentWeek(calculatedWeek);
      setCurrentDay(calculatedDay);
    } else {
      // New user - start course today
      const startDate = new Date();
      localStorage.setItem('flowStartDate', startDate.toISOString());
      setCourseStartDate(startDate);
      setCurrentWeek(1);
      setCurrentDay(1);
    }
  }, []);

  return (
    <CourseTemplate
      courseType="flow"
      heroTitle="Functional Flow"
      heroSubtitle="Vecka 1 - Avancerad näringsoptimering för optimal prestanda"
      heroImage="/Ulrika_portratt/udavidssondesktop.png"
      videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      weekTitle="Functional Flow"
      mealPlans={flowMealPlans}
      currentWeek={currentWeek}
      currentDay={currentDay}
      courseStartDate={courseStartDate}
    />
  );
} 
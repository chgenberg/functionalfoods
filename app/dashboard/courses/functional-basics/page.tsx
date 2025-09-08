'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CourseTemplate from '@/app/dashboard/courses/components/CourseTemplate';
import { mealPlans } from '@/app/data/mealPlans';

export default function FunctionalBasicsPage() {
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    // Redirect to overview page and stop executing the rest of this effect
    router.push('/dashboard/courses/functional-basics/oversikt');
  }, [router]);

  // The rest is kept for potential future use if redirect is removed
  useEffect(() => {
    const savedStartDate = typeof window !== 'undefined' ? localStorage.getItem('basicsStartDate') : null;
    if (savedStartDate) {
      const start = new Date(savedStartDate as string);
      setCourseStartDate(start);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - start.getTime()) / (1000 * 3600 * 24));
      const calculatedWeek = daysDiff < 0 ? 1 : Math.min(6, Math.max(1, Math.ceil((daysDiff + 1) / 7)));
      const calculatedDay = daysDiff < 0 ? 1 : Math.min(7, Math.max(1, (daysDiff % 7) + 1));
      setCurrentWeek(calculatedWeek);
      setCurrentDay(calculatedDay);
    } else if (typeof window !== 'undefined') {
      const start = new Date();
      localStorage.setItem('basicsStartDate', start.toISOString());
      setCourseStartDate(start);
      setCurrentWeek(1);
      setCurrentDay(1);
    }
  }, []);

  return (
    <CourseTemplate
      courseType="basics"
      heroTitle="Functional Basics"
      heroSubtitle="Vecka 1 - Lär dig grunderna i functional foods och hur du optimerar din hälsa"
      heroImage="/Ulrika_portratt/udavidssondesktop.png"
      videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      weekTitle="Functional Basics"
      mealPlans={mealPlans}
      currentWeek={currentWeek}
      currentDay={currentDay}
      courseStartDate={courseStartDate}
    />
  );
} 
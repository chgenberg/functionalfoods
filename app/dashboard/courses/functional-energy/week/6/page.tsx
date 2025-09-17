'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';
import { WeekInfoSection, CelebrationSection, FutureGoalsSection } from './components';

export default function Week6Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);

  useEffect(() => {
    const savedStartDate = localStorage.getItem('energyStartDate');
    if (savedStartDate) {
      setCourseStartDate(new Date(savedStartDate));
    }
  }, []);

  useEffect(() => {
    const loadMealPlan = async () => {
      try {
        const res = await fetch('/api/meal-plans?course=energy&week=6');
        const data = await res.json();
        setMealPlan({ week6: data });
      } catch (e) {
        setMealPlan(null);
      }
    };
    loadMealPlan();
  }, []);

  if (!mealPlan) return null;

  const customContent = (
    <>
      <WeekInfoSection />
      <div className="mb-8" />
      <CelebrationSection />
      <div className="mb-8" />
      <FutureGoalsSection />
    </>
  );

  return (
    <WeekTemplate
      courseType="energy"
      weekNumber={6}
      weekTitle="Långsiktig hållbarhet"
      weekSubtitle="Vecka 6 - Planera för en hållbar energiresa efter kursen"
      heroImage="/lax-med-sellerisallad-och-valnotter.JPG"
      videoUrl="https://player.vimeo.com/video/1054236789?h=0c219534c4"
      mealPlans={mealPlan}
      courseStartDate={courseStartDate}
      customContent={customContent}
    />
  );
} 
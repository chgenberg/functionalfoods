'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';
import { WeekInfoSection, DocumentsSection, LifestyleFactorsSection } from './components';

export default function Week5Page() {
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
        const res = await fetch('/api/meal-plans?course=energy&week=5');
        const data = await res.json();
        setMealPlan({ week5: data });
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
      <DocumentsSection />
      <div className="mb-8" />
      <LifestyleFactorsSection />
    </>
  );

  return (
    <WeekTemplate
      courseType="energy"
      weekNumber={5}
      weekTitle="Energistabila vanor"
      weekSubtitle="Vecka 5 - Bygg vanor som håller energin stabil"
      heroImage="/lax-med-sellerisallad-och-valnotter.JPG"
      videoUrl="https://player.vimeo.com/video/1054236789?h=0c219534c4"
      mealPlans={mealPlan}
      courseStartDate={courseStartDate}
      customContent={customContent}
    />
  );
} 
'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';
import { WeekInfoSection, DocumentsSection, TipsSection } from './components';

export default function Week2Page() {
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
        const res = await fetch('/api/meal-plans?course=energy&week=2');
        const data = await res.json();
        setMealPlan({ week2: data });
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
      <TipsSection />
    </>
  );

  return (
    <WeekTemplate
      courseType="energy"
      weekNumber={2}
      weekTitle="Blodsocker & energi"
      weekSubtitle="Vecka 2 - Fördjupning i sambandet mellan mat och energi"
      heroImage="/lax-med-sellerisallad-och-valnotter.JPG"
      videoUrl="https://player.vimeo.com/video/1054236789?h=0c219534c4"
      mealPlans={mealPlan}
      courseStartDate={courseStartDate}
      customContent={customContent}
    />
  );
} 
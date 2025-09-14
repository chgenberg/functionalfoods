'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';

export default function Week4Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [mealPlan, setMealPlan] = useState<any>(null);

  useEffect(() => {
    const savedStartDate = localStorage.getItem('basicsStartDate');
    if (savedStartDate) {
      setCourseStartDate(new Date(savedStartDate));
    } else {
      const startDate = new Date();
      localStorage.setItem('basicsStartDate', startDate.toISOString());
      setCourseStartDate(startDate);
    }
  }, []);

  useEffect(() => {
    const loadMealPlan = async () => {
      try {
        const res = await fetch('/api/meal-plans?course=basic&week=4');
        const data = await res.json();
        setMealPlan({ week4: data });
      } catch (e) {
        setMealPlan(null);
      }
    };
    loadMealPlan();
  }, []);

  const weekTitles = {
    2: 'Proteiner & aminosyror',
    3: 'Fetter & kolhydrater', 
    4: 'Vitaminer & mineraler',
    5: 'Antioxidanter & fytokemikalier',
    6: 'Att komma igång'
  };

  const weekSubtitles = {
    2: 'Vecka 2 - Fördjupa dig i proteiners roll och aminosyrornas betydelse',
    3: 'Vecka 3 - Lär dig om fetter och kolhydrater för optimal hälsa',
    4: 'Vecka 4 - Upptäck vitaminer och mineraler som bygger din hälsa',
    5: 'Vecka 5 - Utforska antioxidanter och fytokemikalier för skydd och återställning',
    6: 'Vecka 6 - Implementera allt du lärt dig i din vardag'
  };

  if (!mealPlan) return null;

  return (
    <WeekTemplate
      courseType="basics"
      weekNumber={4}
      weekTitle={weekTitles[4]}
      weekSubtitle={weekSubtitles[4]}
      heroImage="/Ulrika_portratt/udavidssondesktop.png"
      videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      mealPlans={mealPlan}
      courseStartDate={courseStartDate}
    />
  );
}

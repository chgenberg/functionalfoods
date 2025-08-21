const fs = require('fs');
const path = require('path');

/**
 * Script to sync template changes from Basic to Flow courses
 * Run this whenever you make changes to Basic course design
 */

function syncBasicsToFlow() {
  console.log('🔄 Syncing Basic course design to Flow course...');
  
  // Files to sync (source -> destination)
  const filesToSync = [
    {
      source: 'app/dashboard/courses/functional-basics/page.tsx',
      destination: 'app/dashboard/courses/functional-flow/page.tsx',
      transform: (content) => {
        return content
          .replace(/functional-basics/g, 'functional-flow')
          .replace(/basicsStartDate/g, 'flowStartDate')
          .replace(/mealPlans/g, 'flowMealPlans')
          .replace(/courseType="basics"/g, 'courseType="flow"')
          .replace(/Functional Basics/g, 'Functional Flow')
          .replace(/Grunderna/g, 'Optimera din energi')
          .replace(/Lär dig grunderna i functional foods och hur du optimerar din hälsa/g, 'Avancerad näringsoptimering för optimal prestanda');
      }
    },
    {
      source: 'app/dashboard/courses/functional-basics/inkopslista/page.tsx',
      destination: 'app/dashboard/courses/functional-flow/inkopslista/page.tsx',
      transform: (content) => {
        return content
          .replace(/functional-basics/g, 'functional-flow')
          .replace(/basics/g, 'flow')
          .replace(/courseType="basics"/g, 'courseType="flow"');
      }
    }
  ];
  
  // Week pages to sync
  for (let week = 1; week <= 6; week++) {
    filesToSync.push({
      source: `app/dashboard/courses/functional-basics/week/${week}/page.tsx`,
      destination: `app/dashboard/courses/functional-flow/week/${week}/page.tsx`,
      transform: (content) => {
        // Replace with WeekTemplate approach
        const weekTitles = {
          1: { title: "Optimera din energi", subtitle: "Vecka 1 - Grundläggande energioptimering och avancerade näringsstrategier" },
          2: { title: "Avancerad näringsoptimering", subtitle: "Vecka 2 - Fördjupning i näringsoptimering och prestationshöjande strategier" },
          3: { title: "Prestationshöjande kost", subtitle: "Vecka 3 - Optimera din kost för maximal prestanda och återhämtning" },
          4: { title: "Antiinflammatorisk livsstil", subtitle: "Vecka 4 - Minska inflammation och förbättra din hälsa" },
          5: { title: "Longevity & återhämtning", subtitle: "Vecka 5 - Långsiktig hälsa och optimal återhämtning" },
          6: { title: "Personlig optimering", subtitle: "Vecka 6 - Skräddarsy din kost för dina unika behov" }
        };
        
        return `'use client';

import { useState, useEffect } from 'react';
import WeekTemplate from '@/app/dashboard/courses/components/WeekTemplate';
import { flowMealPlans } from '@/app/data/mealPlans';

export default function Week${week}Page() {
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);

  useEffect(() => {
    const savedStartDate = localStorage.getItem('flowStartDate');
    if (savedStartDate) {
      setCourseStartDate(new Date(savedStartDate));
    } else {
      const startDate = new Date();
      localStorage.setItem('flowStartDate', startDate.toISOString());
      setCourseStartDate(startDate);
    }
  }, []);

  return (
    <WeekTemplate
      courseType="flow"
      weekNumber={${week}}
      weekTitle="${weekTitles[week].title}"
      weekSubtitle="${weekTitles[week].subtitle}"
      heroImage="/Ulrika_portratt/udavidssondesktop.png"
      videoUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
      mealPlans={flowMealPlans}
      courseStartDate={courseStartDate}
    />
  );
}`;
      }
    });
  }
  
  // Perform the sync
  let syncedFiles = 0;
  
  for (const fileSync of filesToSync) {
    try {
      const sourcePath = path.join(process.cwd(), fileSync.source);
      const destPath = path.join(process.cwd(), fileSync.destination);
      
      if (!fs.existsSync(sourcePath)) {
        console.log(`⚠️  Source file not found: ${fileSync.source}`);
        continue;
      }
      
      const sourceContent = fs.readFileSync(sourcePath, 'utf8');
      const transformedContent = fileSync.transform ? fileSync.transform(sourceContent) : sourceContent;
      
      // Create destination directory if it doesn't exist
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      fs.writeFileSync(destPath, transformedContent);
      console.log(`✅ Synced: ${fileSync.source} → ${fileSync.destination}`);
      syncedFiles++;
      
    } catch (error) {
      console.error(`❌ Error syncing ${fileSync.source}:`, error.message);
    }
  }
  
  console.log(`🎉 Sync complete! ${syncedFiles} files synced.`);
  console.log('📝 Flow course now has the same design as Basic course with Flow-specific content.');
}

// Run the sync
syncBasicsToFlow(); 
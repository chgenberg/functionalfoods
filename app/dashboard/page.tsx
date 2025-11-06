'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Immediate redirect - no loading screen flash
    const checkUserAccess = async () => {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        router.replace('/login');
        return;
      }

      try {
        // Check user's course purchases
        const res = await fetch('/api/user/purchases', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          const purchases = data.purchases || data;
          
          if (purchases.length > 0) {
            const ownedCourses = purchases.map((p: any) => p.course.name);
            
            // Redirect based on course ownership
            const hasFlow = ownedCourses.includes('Functional Gut Health/Flow') || ownedCourses.includes('Functional Flow');
            const hasBasics = ownedCourses.includes('Functional Basics');
            const hasEnergy = ownedCourses.includes('Functional Insulin balance/Energy') || ownedCourses.includes('Functional Energy');
            const hasHormone = ownedCourses.includes('Hormonell Balans');
            
            if (hasHormone && !hasFlow && !hasBasics && !hasEnergy) {
              router.replace('/dashboard/courses/functional-hormone');
            } else if (hasEnergy && !hasFlow && !hasBasics && !hasHormone) {
              router.replace('/dashboard/courses/functional-energy');
            } else if (hasFlow && !hasBasics && !hasEnergy && !hasHormone) {
              router.replace('/dashboard/courses/functional-flow');
            } else if (hasBasics && !hasFlow && !hasEnergy && !hasHormone) {
              router.replace('/dashboard/courses/functional-basics');
            } else if (ownedCourses.length > 1) {
              router.replace('/mina-kurser');
            } else {
              router.replace('/mina-kurser');
            }
          } else {
            router.replace('/utbildning');
          }
        } else {
          router.replace('/mina-kurser');
        }
      } catch (error) {
        console.error('Error checking user access:', error);
        router.replace('/mina-kurser');
      }
    };

    checkUserAccess();
  }, [router, user]);

  // Return null to avoid any flash of content
  return null;
} 
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import { useT } from '@/app/lib/i18n/LanguageProvider';

export default function DashboardPage() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const checkUserAccess = async () => {
      const token = localStorage.getItem('token');
      
      if (!token || !user) {
        router.push('/login');
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
            if (ownedCourses.includes('Functional Gut Health/Flow') && !ownedCourses.includes('Functional Basics')) {
              // Only Flow course
              router.push('/dashboard/courses/functional-flow');
            } else if (ownedCourses.includes('Functional Basics') && !ownedCourses.includes('Functional Gut Health/Flow')) {
              // Only Basic course
              router.push('/dashboard/courses/functional-basics');
            } else if (ownedCourses.includes('Functional Gut Health/Flow') && ownedCourses.includes('Functional Basics')) {
              // Has both courses - show course selection
              router.push('/mina-kurser');
            } else if (ownedCourses.includes('Functional Insulin balance/Energy')) {
              // Has Energy course (alone or with others)
              if (ownedCourses.length === 1) {
                router.push('/dashboard/courses/functional-energy');
              } else {
                router.push('/mina-kurser');
              }
            } else {
              // Has other courses or no specific handling
              router.push('/mina-kurser');
            }
          } else {
            // No courses purchased
            router.push('/utbildning');
          }
        } else {
          // Error fetching purchases
          router.push('/mina-kurser');
        }
      } catch (error) {
        console.error('Error checking user access:', error);
        router.push('/mina-kurser');
      }
    };

    checkUserAccess();
  }, [router, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-gray-600">{t('dashboard.loading','Laddar din dashboard...')}</p>
      </div>
    </div>
  );
} 
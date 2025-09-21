'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit3, Plus, Calendar, FileText, Video, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseWeek {
  weekNumber: number;
  title: string;
  subtitle?: string;
  welcomeMessage?: string;
  videoUrl?: string;
  heroImage?: string;
}

interface Course {
  id: string;
  name: string;
  weeks: CourseWeek[];
}

export default function CourseWeeksPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseWeeks();
  }, [params.courseId]);

  const fetchCourseWeeks = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const courseData: Course = {
        id: params.courseId,
        name: getCourseName(params.courseId),
        weeks: [
          {
            weekNumber: 1,
            title: 'Introduktion till Functional Foods',
            subtitle: 'Grunderna för en hälsosam livsstil',
            welcomeMessage: 'Välkommen till din resa mot bättre hälsa...',
            videoUrl: 'https://player.vimeo.com/video/123456789',
            heroImage: '/images/week1-hero.jpg'
          },
          {
            weekNumber: 2,
            title: 'Näringsrik kost',
            subtitle: 'Lär dig välja rätt mat',
            welcomeMessage: 'Den här veckan fokuserar vi på näringsrik mat...',
            videoUrl: 'https://player.vimeo.com/video/123456790',
            heroImage: '/images/week2-hero.jpg'
          },
          {
            weekNumber: 3,
            title: 'Matlagningstekniker',
            subtitle: 'Bevara näringen i maten',
            welcomeMessage: 'Nu ska vi lära oss de bästa matlagningsmetoderna...',
            videoUrl: 'https://player.vimeo.com/video/123456791',
            heroImage: '/images/week3-hero.jpg'
          },
          {
            weekNumber: 4,
            title: 'Planera din kost',
            subtitle: 'Skapa hållbara matvanor',
            welcomeMessage: 'Planering är nyckeln till framgång...',
            videoUrl: 'https://player.vimeo.com/video/123456792',
            heroImage: '/images/week4-hero.jpg'
          },
          {
            weekNumber: 5,
            title: 'Kropp och hälsa',
            subtitle: 'Förstå din kropp',
            welcomeMessage: 'Den här veckan fördjupar vi oss i kroppens funktioner...',
            videoUrl: 'https://player.vimeo.com/video/123456793',
            heroImage: '/images/week5-hero.jpg'
          },
          {
            weekNumber: 6,
            title: 'Livsstilsförändring',
            subtitle: 'Gör det till en vana',
            welcomeMessage: 'Sista veckan handlar om att befästa dina nya vanor...',
            videoUrl: 'https://player.vimeo.com/video/123456794',
            heroImage: '/images/week6-hero.jpg'
          }
        ]
      };

      setCourse(courseData);
    } catch (error) {
      console.error('Error fetching course weeks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseName = (courseId: string) => {
    const names = {
      'functional-basics': 'Functional Basics',
      'functional-flow': 'Functional Flow',
      'functional-energy': 'Functional Energy'
    };
    return names[courseId as keyof typeof names] || 'Kurs';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-green)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Laddar kursveckor...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="admin-alert admin-alert-error">
        Kunde inte ladda kursveckor
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--primary-green)] mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till kurser
          </Link>
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">
            {course.name} - Veckor
          </h1>
          <p className="text-[var(--text-secondary)]">
            Redigera veckovisa kurstexter och innehåll
          </p>
        </div>
        
        <Link
          href={`/admin/courses/${course.id}/weeks/new`}
          className="admin-btn admin-btn-primary"
        >
          <Plus className="w-4 h-4" />
          Lägg till vecka
        </Link>
      </div>

      {/* Weeks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {course.weeks.map((week, index) => (
          <motion.div
            key={week.weekNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="admin-card hover:shadow-lg transition-shadow"
          >
            {/* Week Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-[var(--primary-green)]">
                    {week.weekNumber}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">
                    Vecka {week.weekNumber}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {week.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Week Content Preview */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-[var(--text-secondary)]">Underrubrik:</span>
                <span className="text-[var(--text-primary)] truncate flex-1">
                  {week.subtitle || 'Ingen underrubrik'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Video className="w-4 h-4 text-[var(--text-secondary)]" />
                <span className="text-[var(--text-secondary)]">Video:</span>
                <span className={week.videoUrl ? 'text-green-600' : 'text-gray-400'}>
                  {week.videoUrl ? 'Uppladdad' : 'Saknas'}
                </span>
              </div>
              
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                  <span className="text-[var(--text-secondary)]">Välkomstmeddelande:</span>
                </div>
                <p className="text-[var(--text-primary)] line-clamp-2 text-xs bg-[var(--primary-beige)] p-2 rounded">
                  {week.welcomeMessage || 'Inget välkomstmeddelande'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/admin/courses/${course.id}/weeks/${week.weekNumber}/edit`}
                className="admin-btn admin-btn-primary justify-center text-sm"
              >
                <Edit3 className="w-4 h-4" />
                Redigera
              </Link>
              
              <Link
                href={`/dashboard/courses/${course.id}/week/${week.weekNumber}`}
                target="_blank"
                className="admin-btn admin-btn-secondary justify-center text-sm"
              >
                <Eye className="w-4 h-4" />
                Förhandsgranska
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

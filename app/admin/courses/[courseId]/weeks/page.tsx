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
      
      // Hämta verklig kursdata
      const response = await fetch('/api/admin/functional-courses', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const courses = await response.json();
      const courseData = courses.find((c: any) => c.id === params.courseId);
      
      if (courseData) {
        setCourse({
          id: courseData.id,
          name: courseData.name,
          weeks: courseData.weeks || []
        });
      } else {
        setCourse(null);
      }
    } catch (error) {
      console.error('Error fetching course weeks:', error);
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  const getCourseName = (courseId: string) => {
    const names = {
      'functional-basics': 'Functional Basics',
      'functional-flow': 'Functional Flow',
      'functional-energy': 'Functional Energy',
      'hormonell-balans': 'Hormonell Balans'
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
            className="admin-card hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
          >
            {/* Progress indicator */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary-green)] to-[var(--primary-light-green)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            
            {/* Week Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary-green)] to-[var(--primary-light-green)] rounded-2xl flex items-center justify-center shadow-md">
                  <span className="text-xl font-bold text-white">
                    {week.weekNumber}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[var(--primary-green)] text-lg">
                    Vecka {week.weekNumber}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
                    {week.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Week Content Preview */}
            <div className="space-y-3 mb-5">
              {/* Subtitle */}
              <div className="bg-[var(--primary-beige)]/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-[var(--primary-green)] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Underrubrik</span>
                    <p className="text-sm text-[var(--text-primary)] mt-1">
                      {week.subtitle || 'Ingen underrubrik angiven'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Video Status */}
              <div className="bg-[var(--primary-beige)]/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[var(--primary-green)]" />
                    <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Video</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    week.videoUrl 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {week.videoUrl ? 'Uppladdad' : 'Saknas'}
                  </span>
                </div>
              </div>
              
              {/* Welcome Message */}
              <div className="bg-[var(--primary-beige)]/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-[var(--primary-green)] mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">Välkomstmeddelande</span>
                    <p className="text-sm text-[var(--text-primary)] line-clamp-2 mt-1">
                      {week.welcomeMessage || 'Inget välkomstmeddelande angivet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 mt-auto">
              <Link
                href={`/admin/courses/${course.id}/weeks/${week.weekNumber}/edit`}
                className="admin-btn admin-btn-primary justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <Edit3 className="w-4 h-4" />
                Redigera
              </Link>
              
              <Link
                href={`/dashboard/courses/${course.id}/week/${week.weekNumber}`}
                target="_blank"
                className="admin-btn admin-btn-secondary justify-center"
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

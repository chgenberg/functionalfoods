'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Edit3, Eye, Calendar, BookOpen, Users, Clock, ChevronRight } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description?: string;
  price: number;
  enrollments: number;
  weeks: CourseWeek[];
}

interface CourseWeek {
  weekNumber: number;
  title: string;
  subtitle?: string;
  welcomeMessage?: string;
  heroImage?: string;
  videoUrl?: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Hämta verklig data från API
      const response = await fetch('/api/admin/functional-courses', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Fallback till tom array om något går fel
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-[var(--text-secondary)] mt-4">Laddar kurser...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">Kurshantering</h1>
        <p className="text-[var(--text-secondary)]">Redigera kursinnehåll, veckor och texter</p>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="admin-card hover:shadow-xl transition-all duration-300 h-full flex flex-col relative overflow-hidden group"
          >
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary-green)] to-[var(--primary-light-green)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            
            {/* Course Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-medium text-[var(--primary-green)] mb-2">
                    {course.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                    {course.description}
                  </p>
                </div>
              </div>
              
              {/* Price Badge */}
              <div className="inline-flex items-baseline gap-1 px-3 py-1 bg-[var(--primary-beige)] rounded-full">
                <span className="text-2xl font-semibold text-[var(--primary-green)]">
                  {course.price.toLocaleString('sv-SE')}
                </span>
                <span className="text-sm text-[var(--text-secondary)]">kr</span>
              </div>
            </div>

            {/* Course Stats - Improved design */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gradient-to-br from-[var(--primary-beige)] to-[var(--cream-white)] p-3 rounded-xl text-center">
                <div className="text-2xl font-bold text-[var(--primary-green)]">
                  {course.weeks.length}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Veckor</div>
              </div>
              <div className="bg-gradient-to-br from-[var(--primary-beige)] to-[var(--cream-white)] p-3 rounded-xl text-center">
                <div className="text-2xl font-bold text-[var(--primary-green)]">
                  {course.enrollments}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Deltagare</div>
              </div>
              <div className="bg-gradient-to-br from-[var(--primary-beige)] to-[var(--cream-white)] p-3 rounded-xl text-center">
                <div className="text-2xl font-bold text-[var(--primary-green)]">
                  {Math.round(course.price / course.weeks.length)}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">kr/vecka</div>
              </div>
            </div>

            {/* Course Actions - Improved layout */}
            <div className="space-y-3 flex-1">
              <Link
                href={`/admin/courses/${course.id}/edit`}
                className="admin-btn admin-btn-primary w-full justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <Edit3 className="w-4 h-4" />
                Redigera kurs
              </Link>
              
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/admin/courses/${course.id}/weeks`}
                  className="admin-btn admin-btn-secondary justify-center text-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Veckor
                </Link>
                
                <Link
                  href={`/admin/courses/${course.id}/recipes`}
                  className="admin-btn admin-btn-secondary justify-center text-sm"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Recept
                </Link>
              </div>
            </div>

            {/* Quick Week Preview - Improved design */}
            <div className="mt-6 pt-4 border-t border-[var(--border-light)]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
                Senaste veckorna
              </h4>
              <div className="space-y-2">
                {course.weeks.slice(0, 3).map((week) => (
                  <Link
                    key={week.weekNumber}
                    href={`/admin/courses/${course.id}/weeks/${week.weekNumber}`}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--primary-beige)]/50 hover:bg-[var(--primary-beige)] transition-all group/week"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs font-semibold text-[var(--primary-green)]">
                        {week.weekNumber}
                      </span>
                      <span className="text-sm text-[var(--text-primary)] truncate">
                        {week.title}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0 transform group-hover/week:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-card bg-gradient-to-br from-white to-[var(--cream-white)]">
        <h2 className="text-xl font-medium text-[var(--primary-green)] mb-6">Snabbåtgärder</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/admin/meal-plans"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center group-hover:bg-[var(--primary-light-green)] transition-colors">
              <Calendar className="w-6 h-6 text-[var(--primary-green)] group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] text-center">Kostscheman</span>
          </Link>
          
          <Link 
            href="/admin/knowledge"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center group-hover:bg-[var(--primary-light-green)] transition-colors">
              <BookOpen className="w-6 h-6 text-[var(--primary-green)] group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] text-center">Kunskapsdokument</span>
          </Link>
          
          <Link 
            href="/admin/recipes?filter=unassigned"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center group-hover:bg-[var(--primary-light-green)] transition-colors">
              <BookOpen className="w-6 h-6 text-[var(--primary-green)] group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] text-center">Okopplade recept</span>
          </Link>
          
          <Link 
            href="/admin/users?filter=course-students"
            className="group flex flex-col items-center gap-3 p-6 rounded-xl bg-white border border-[var(--border-light)] hover:border-[var(--primary-light-green)] hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-[var(--primary-beige)] rounded-full flex items-center justify-center group-hover:bg-[var(--primary-light-green)] transition-colors">
              <Users className="w-6 h-6 text-[var(--primary-green)] group-hover:text-white transition-colors" />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)] text-center">Kursdeltagare</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
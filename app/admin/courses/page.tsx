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
      
      // Simulera kursdata (skulle komma från API)
      const mockCourses: Course[] = [
        {
          id: 'functional-basics',
          name: 'Functional Basics',
          description: 'Grundkurs i funktionell kost',
          price: 1497,
          enrollments: 156,
          weeks: [
            {
              weekNumber: 1,
              title: 'Vecka 1: Introduktion till Functional Foods',
              subtitle: 'Grunderna för en hälsosam livsstil',
              welcomeMessage: 'Välkommen till din resa mot bättre hälsa...',
              heroImage: '/kurser/basic-week1.jpg',
              videoUrl: ''
            },
            // ... fler veckor
          ]
        },
        {
          id: 'functional-flow',
          name: 'Functional Flow',
          description: 'Fördjupningskurs i mag- och tarmhälsa',
          price: 1497,
          enrollments: 89,
          weeks: [
            {
              weekNumber: 1,
              title: 'Vecka 1: Mag- och tarmhälsa',
              subtitle: 'Förstå din mage och tarm',
              welcomeMessage: 'Välkommen till Flow-kursen...',
              heroImage: '/kurser/flow-week1.jpg',
              videoUrl: ''
            },
            // ... fler veckor
          ]
        },
        {
          id: 'functional-energy',
          name: 'Functional Energy',
          description: 'Specialkurs för blodsockerkontroll',
          price: 1497,
          enrollments: 34,
          weeks: [
            {
              weekNumber: 1,
              title: 'Vecka 1: Blodsockerkontroll',
              subtitle: 'Stabila energinivåer hela dagen',
              welcomeMessage: 'Välkommen till Energy-kursen...',
              heroImage: '/kurser/energy-week1.jpg',
              videoUrl: ''
            },
            // ... fler veckor
          ]
        }
      ];

      setCourses(mockCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
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
          <p className="text-[var(--text-secondary)] mt-4 font-light">Laddar kurser...</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="admin-card hover:shadow-lg transition-all"
          >
            {/* Course Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-[var(--primary-green)] mb-1">
                  {course.name}
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  {course.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-[var(--primary-green)]">
                  {course.price.toLocaleString('sv-SE')} kr
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {course.enrollments} deltagare
                </p>
              </div>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-2 bg-[var(--primary-beige)] rounded-lg">
                <div className="text-lg font-semibold text-[var(--primary-green)]">
                  {course.weeks.length}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Veckor</div>
              </div>
              <div className="text-center p-2 bg-[var(--primary-beige)] rounded-lg">
                <div className="text-lg font-semibold text-[var(--primary-green)]">
                  {course.enrollments}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">Deltagare</div>
              </div>
              <div className="text-center p-2 bg-[var(--primary-beige)] rounded-lg">
                <div className="text-lg font-semibold text-[var(--primary-green)]">
                  {Math.round(course.price / course.weeks.length)}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">kr/vecka</div>
              </div>
            </div>

            {/* Course Actions */}
            <div className="space-y-2">
              <Link
                href={`/admin/courses/${course.id}/edit`}
                className="admin-btn admin-btn-primary w-full justify-center"
              >
                <Edit3 className="w-4 h-4" />
                Redigera kurs
              </Link>
              
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/admin/courses/${course.id}/weeks`}
                  className="admin-btn admin-btn-secondary justify-center"
                >
                  <Calendar className="w-4 h-4" />
                  Veckor
                </Link>
                
                <Link
                  href={`/admin/courses/${course.id}/recipes`}
                  className="admin-btn admin-btn-secondary justify-center"
                >
                  <BookOpen className="w-4 h-4" />
                  Recept
                </Link>
              </div>
            </div>

            {/* Quick Week Preview */}
            <div className="mt-4 pt-4 border-t border-[var(--border-light)]">
              <h4 className="text-sm font-medium text-[var(--text-primary)] mb-2">Senaste veckor:</h4>
              <div className="space-y-1">
                {course.weeks.slice(0, 3).map((week) => (
                  <Link
                    key={week.weekNumber}
                    href={`/admin/courses/${course.id}/weeks/${week.weekNumber}`}
                    className="flex items-center justify-between p-2 rounded hover:bg-[var(--primary-beige)] transition-colors"
                  >
                    <span className="text-sm text-[var(--text-primary)]">
                      Vecka {week.weekNumber}: {week.title.slice(0, 30)}...
                    </span>
                    <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Snabbåtgärder</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/admin/meal-plans"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-[var(--primary-beige)] transition-colors"
          >
            <Calendar className="w-5 h-5 text-[var(--primary-green)]" />
            <span className="text-sm text-[var(--text-primary)]">Kostscheman</span>
          </Link>
          
          <Link 
            href="/admin/knowledge"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-[var(--primary-beige)] transition-colors"
          >
            <BookOpen className="w-5 h-5 text-[var(--primary-green)]" />
            <span className="text-sm text-[var(--text-primary)]">Kunskapsdokument</span>
          </Link>
          
          <Link 
            href="/admin/recipes?filter=unassigned"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-[var(--primary-beige)] transition-colors"
          >
            <BookOpen className="w-5 h-5 text-[var(--primary-green)]" />
            <span className="text-sm text-[var(--text-primary)]">Okopplade recept</span>
          </Link>
          
          <Link 
            href="/admin/users?filter=course-students"
            className="flex items-center gap-3 p-4 rounded-lg border hover:bg-[var(--primary-beige)] transition-colors"
          >
            <Users className="w-5 h-5 text-[var(--primary-green)]" />
            <span className="text-sm text-[var(--text-primary)]">Kursdeltagare</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
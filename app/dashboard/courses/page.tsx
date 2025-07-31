'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiBook, FiCalendar, FiUsers, FiAward, FiChevronRight,
  FiClock, FiCheckCircle, FiLock, FiStar, FiArrowRight
} from 'react-icons/fi';
import { GiFruitBowl, GiHealthNormal } from 'react-icons/gi';
import { useAuth } from '@/app/hooks/useAuth';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  modules: number;
  progress: number;
  status: 'active' | 'completed' | 'locked';
  icon: React.ElementType;
  color: string;
  gradient: string;
  link: string;
  isPurchased: boolean;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserCourses();
    }
  }, [user]);

  const fetchUserCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/purchases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const purchases = Array.isArray(data) ? data : (data.purchases || []);
        const purchasedCourseNames = purchases.map((p: any) => p.course.name);
        
        const allCourses: Course[] = [
          {
            id: 'functional-basics',
            title: 'Functional Basics',
            description: '6 veckors hälsoprogram med grunderna i functional foods',
            duration: '6 veckor',
            modules: 6,
            progress: 30,
            status: purchasedCourseNames.includes('Functional Basics') ? 'active' : 'locked',
            icon: GiFruitBowl,
            color: 'accent',
            gradient: 'from-green-500 to-teal-600',
            link: '/dashboard/courses/functional-basics',
            isPurchased: purchasedCourseNames.includes('Functional Basics')
          },
                     {
             id: 'functional-flow',
             title: 'Functional Flow',
             description: 'Avancerat program för optimal hälsa och livsstil',
             duration: '6 veckor',
             modules: 6,
             progress: 0,
             status: purchasedCourseNames.includes('Functional Flow') ? 'active' : 'locked',
             icon: GiHealthNormal,
             color: 'primary',
             gradient: 'from-green-800 to-green-900',
             link: '/dashboard/courses/functional-flow',
             isPurchased: purchasedCourseNames.includes('Functional Flow')
           }
        ];
        
        setCourses(allCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const purchasedCourses = courses.filter(c => c.isPurchased);
  const availableCourses = courses.filter(c => !c.isPurchased);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Mina kurser</h1>
        <p className="text-text-secondary">Hantera och fortsätt dina kurser</p>
      </div>

      {/* Purchased Courses */}
      {purchasedCourses.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-text-primary">Aktiva kurser</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {purchasedCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={course.link}>
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                    {/* Course Header */}
                    <div 
                      className="p-6 text-white"
                      style={{
                        background: course.id === 'functional-flow' ? '#1a4324' : 
                                   course.id === 'functional-basics' ? 'linear-gradient(to right, #10b981, #0d9488)' : 
                                   '#1a4324'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <course.icon className="w-12 h-12 mb-3 opacity-90" />
                          <h3 className="text-2xl font-bold mb-1">{course.title}</h3>
                          <p className="opacity-90">{course.description}</p>
                        </div>
                        <FiArrowRight className="w-6 h-6 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <FiCalendar className="w-4 h-4" />
                          <span className="text-sm">{course.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary">
                          <FiBook className="w-4 h-4" />
                          <span className="text-sm">{course.modules} moduler</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-text-secondary">Framsteg</span>
                          <span className="text-sm font-medium text-primary">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-2 rounded-full"
                            style={{
                              background: course.id === 'functional-flow' ? '#1a4324' : 
                                         course.id === 'functional-basics' ? 'linear-gradient(to right, #10b981, #0d9488)' : 
                                         '#1a4324'
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-green-600 font-medium flex items-center gap-1`}>
                          <FiCheckCircle />
                          Aktiv
                        </span>
                        <span className="text-primary font-medium flex items-center gap-1">
                          Fortsätt
                          <FiChevronRight />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Available Courses */}
      {availableCourses.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-text-primary">Tillgängliga kurser</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {availableCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden opacity-75">
                                     {/* Course Header */}
                   <div 
                     className="p-6 text-white opacity-60"
                     style={{
                       background: course.id === 'functional-flow' ? '#1a4324' : 
                                  course.id === 'functional-basics' ? 'linear-gradient(to right, #10b981, #0d9488)' : 
                                  '#1a4324'
                     }}
                   >
                    <course.icon className="w-12 h-12 mb-3" />
                    <h3 className="text-2xl font-bold mb-1">{course.title}</h3>
                    <p>{course.description}</p>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <FiCalendar className="w-4 h-4" />
                        <span className="text-sm">{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary">
                        <FiBook className="w-4 h-4" />
                        <span className="text-sm">{course.modules} moduler</span>
                      </div>
                    </div>

                    <Link
                      href="/utbildning"
                      className="block w-full text-center bg-gray-100 text-gray-600 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Köp kurs
                    </Link>
                  </div>
                </div>

                {/* Lock Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white rounded-full p-4 shadow-lg">
                    <FiLock className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* If no courses at all */}
      {courses.length === 0 && (
        <div className="text-center py-12">
          <FiBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Inga kurser ännu</h3>
          <p className="text-gray-500 mb-6">Utforska vårt kursutbud och börja din hälsoresa idag!</p>
          <Link
            href="/utbildning"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <FiBook />
            Utforska kurser
          </Link>
        </div>
      )}
    </div>
  );
} 
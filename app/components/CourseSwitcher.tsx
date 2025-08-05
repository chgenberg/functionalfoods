'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheck, FiBook, FiLock } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

interface Course {
  id: string;
  name: string;
  displayName: string;
  color: string;
  gradient: string;
  icon?: string;
}

const availableCourses: Course[] = [
  {
    id: 'functional-basics',
    name: 'Functional Basics',
    displayName: 'Functional Basics',
    color: 'text-primary',
    gradient: 'from-green-500 to-teal-600',
    icon: '🌱'
  },
  {
    id: 'functional-flow',
    name: 'Functional Flow',
    displayName: 'Functional Flow',
    color: 'text-secondary',
    gradient: 'from-green-800 to-green-900',
    icon: '🌊'
  }
];

export default function CourseSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [userCourses, setUserCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine current course from URL
  const currentCourse = availableCourses.find(course => 
    pathname?.includes(`/courses/${course.id}`)
  ) || null;

  useEffect(() => {
    if (user) {
      fetchUserCourses();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        const courseNames = purchases.map((p: any) => {
          if (p.course.name === 'Functional Basics') return 'functional-basics';
          if (p.course.name === 'Functional Flow') return 'functional-flow';
          return null;
        }).filter(Boolean);
        
        setUserCourses(courseNames);
      }
    } catch (error) {
      console.error('Error fetching user courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchCourse = (courseId: string) => {
    if (!userCourses.includes(courseId)) return;
    
    // Navigate to the same relative path in the new course
    const currentPath = pathname?.replace(/\/courses\/[^/]+/, '') || '';
    const newPath = `/dashboard/courses/${courseId}${currentPath}`;
    
    router.push(newPath);
    setIsOpen(false);
  };

  // Don't show switcher if not in a course or user has only one course
  if (!currentCourse || userCourses.length <= 1 || loading) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          text-white font-medium shadow-lg
          hover:shadow-xl transition-all duration-200
          transform hover:scale-105
        `}
        style={{
          background: currentCourse.id === 'functional-flow' ? '#1a4324' : 
                     currentCourse.id === 'functional-basics' ? 'linear-gradient(to right, #10b981, #0d9488)' : 
                     '#1a4324'
        }}
      >
        <span className="text-xl">{currentCourse.icon}</span>
        <span>{currentCourse.displayName}</span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-2">
              <p className="text-xs text-gray-500 px-3 py-2 uppercase tracking-wider">
                Byt kurs
              </p>
              {availableCourses.map((course) => {
                const isCurrentCourse = course.id === currentCourse.id;
                const hasAccess = userCourses.includes(course.id);
                
                return (
                  <button
                    key={course.id}
                    onClick={() => hasAccess && switchCourse(course.id)}
                    disabled={!hasAccess || isCurrentCourse}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-lg
                      transition-all duration-200
                      ${isCurrentCourse 
                        ? 'bg-gray-100 text-gray-900 cursor-default' 
                        : hasAccess
                          ? 'hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                          : 'opacity-50 cursor-not-allowed text-gray-400'
                      }
                    `}
                  >
                    <span className={`text-2xl ${!hasAccess ? 'grayscale' : ''}`}>
                      {course.icon}
                    </span>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{course.displayName}</p>
                      {!hasAccess && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <FiLock className="w-3 h-3" />
                          Låst
                        </p>
                      )}
                    </div>
                    {isCurrentCourse && (
                      <FiCheck className="w-5 h-5 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {userCourses.length < availableCourses.length && (
              <div className="border-t border-gray-100 p-3">
                <button
                  onClick={() => router.push('/utbildning')}
                  className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Köp fler kurser →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
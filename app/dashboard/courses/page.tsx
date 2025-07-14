'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiBook, FiCalendar, FiUsers, FiAward, FiChevronRight,
  FiClock, FiCheckCircle, FiLock, FiStar, FiArrowRight
} from 'react-icons/fi';
import { GiFruitBowl, GiHealthNormal } from 'react-icons/gi';

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
  link: string;
}

export default function CoursesPage() {
  const courses: Course[] = [
    {
      id: 'functional-basics',
      title: 'Functional Basics',
      description: '6 veckors hälsoprogram',
      duration: '6 veckor',
      modules: 6,
      progress: 30,
      status: 'active',
      icon: GiFruitBowl,
      color: 'accent',
      link: '/dashboard/courses/functional-basics'
    },
    {
      id: 'functional-flow',
      title: 'Functional Flow',
      description: 'Avancerat program för optimal hälsa',
      duration: '8 veckor',
      modules: 8,
      progress: 0,
      status: 'locked',
      icon: GiHealthNormal,
      color: 'primary',
      link: '/dashboard/courses/functional-flow'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">Mina kurser</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-background-secondary rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Course Header with Image */}
              <div className={`bg-${course.color} p-6 text-white`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                    <p className="text-white/90">{course.description}</p>
                  </div>
                  <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                    {course.duration}
                  </div>
                </div>
                
                {/* Progress Section */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Framsteg</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full bg-white`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Course Content */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-text-primary">{course.duration}</p>
                      <p className="text-sm text-text-secondary">Veckor</p>
                    </div>
                    <div className="h-12 w-px bg-border" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-text-primary">{Math.floor(course.duration.includes('veckor') ? parseInt(course.duration.replace(' veckor', '')) * 2 : 0)}</p>
                      <p className="text-sm text-text-secondary">Lektioner</p>
                    </div>
                  </div>
                  
                  <Link 
                    href={course.link}
                    className={`py-3 px-4 bg-${course.color} text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2`}
                  >
                    <span>{course.progress > 0 ? 'Fortsätt' : 'Börja'}</span>
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiBook, FiCalendar, FiUsers, FiAward, FiChevronRight,
  FiClock, FiCheckCircle, FiLock, FiStar
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
      description: '6 veckors program för optimal hälsa',
      duration: '6 veckor',
      modules: 6,
      progress: 33,
      status: 'active',
      icon: GiFruitBowl,
      color: 'from-green-500 to-teal-600',
      link: '/dashboard/courses/functional-basics'
    },
    {
      id: 'functional-flow',
      title: 'Functional Flow',
      description: 'Avancerad kurs i functional foods',
      duration: '8 veckor',
      modules: 8,
      progress: 0,
      status: 'locked',
      icon: GiHealthNormal,
      color: 'from-purple-500 to-pink-600',
      link: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mina kurser</h1>
          <p className="text-xl text-gray-600">
            Välkommen till dina kurser inom Functional Foods
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative ${course.status === 'locked' ? 'opacity-75' : ''}`}
            >
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Course Header */}
                <div className={`bg-gradient-to-r ${course.color} p-6 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <course.icon className="w-12 h-12 mb-4" />
                      <h2 className="text-2xl font-bold mb-2">{course.title}</h2>
                      <p className="text-white/90">{course.description}</p>
                    </div>
                    {course.status === 'active' && (
                      <div className="bg-white/20 rounded-full px-3 py-1 text-sm">
                        Aktiv
                      </div>
                    )}
                    {course.status === 'completed' && (
                      <div className="bg-green-500 rounded-full px-3 py-1 text-sm">
                        Slutförd
                      </div>
                    )}
                    {course.status === 'locked' && (
                      <FiLock className="w-6 h-6" />
                    )}
                  </div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <FiClock className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiBook className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{course.modules} moduler</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {course.status !== 'locked' && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${course.progress}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full bg-gradient-to-r ${course.color}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {course.status === 'locked' ? (
                    <button
                      disabled
                      className="w-full py-3 px-4 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                    >
                      Låst
                    </button>
                  ) : (
                    <Link
                      href={course.link}
                      className={`w-full py-3 px-4 bg-gradient-to-r ${course.color} text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2`}
                    >
                      <span>
                        {course.status === 'active' ? 'Fortsätt' : 'Se certifikat'}
                      </span>
                      <FiChevronRight className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-100 rounded-full p-3">
              <FiStar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fler kurser kommer snart!
              </h3>
              <p className="text-gray-600">
                Vi arbetar på att ta fram fler spännande kurser inom functional foods. 
                Håll utkik efter uppdateringar och nya möjligheter att fördjupa din kunskap.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { FiPlus, FiMoreVertical, FiCopy, FiEdit, FiTrash2, FiUsers, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';

const courses = [
  {
    id: 1,
    title: 'Functional Flow',
    subtitle: '6 veckors avancerad kurs',
    students: 124,
    publishedDate: '2024-03-01',
    status: 'Publicerad',
    image: '/functional_flow.png',
    color: 'bg-primary',
  },
  {
    id: 2,
    title: 'Functional Basics',
    subtitle: 'Grundkurs i funktionell kost',
    students: 258,
    publishedDate: '2024-01-15',
    status: 'Publicerad',
    image: '/functional_basics.png',
    color: 'bg-secondary',
  },
];

export default function AdminCoursesPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary uppercase tracking-wider">KURSER</h1>
          <p className="text-lg text-text-secondary mt-1">Hantera allt kursmaterial.</p>
        </div>
        <Link 
          href="/admin/courses/new" 
          className="flex items-center gap-2 bg-primary hover:bg-secondary text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 mt-4 sm:mt-0 uppercase text-sm tracking-wider group"
        >
          <FiPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Skapa ny kurs</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-primary/10 overflow-hidden flex flex-col group">
            <div className={`h-40 ${course.color} relative flex items-center justify-center`}>
                <h2 className="text-2xl font-bold text-white text-center px-4 uppercase tracking-wider">{course.title}</h2>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <p className="text-text-secondary text-sm mb-2">{course.subtitle}</p>
              
              <div className="flex-grow" />

              <div className="flex items-center gap-4 text-sm text-text-secondary mt-4">
                <div className="flex items-center gap-2">
                  <FiUsers className="w-4 h-4 text-primary" />
                  <span className="font-medium">{course.students} deltagare</span>
                </div>
                <span className={`font-bold uppercase tracking-wider ${course.status === 'Publicerad' ? 'text-success' : 'text-warning'}`}>
                  {course.status}
                </span>
              </div>
              
              <div className="border-t border-primary/10 my-4"></div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <FiCalendar className="w-4 h-4" />
                  <span>{course.status === 'Publicerad' ? `${course.publishedDate}` : 'Ej publicerad'}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200">
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all duration-200">
                    <FiCopy className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-error hover:bg-error/10 rounded-lg transition-all duration-200">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
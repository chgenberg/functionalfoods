'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: string;
  level: string;
  enrollments?: number;
}

export default function EditCoursePage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [params.courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      
      // Mock course data
      const courseData: Course = {
        id: params.courseId,
        name: getCourseInfo(params.courseId).name,
        description: getCourseInfo(params.courseId).description,
        price: 1497,
        duration: '6 veckor',
        level: getCourseInfo(params.courseId).level,
        enrollments: getCourseInfo(params.courseId).enrollments,
      };

      setCourse(courseData);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseInfo = (courseId: string) => {
    const courses = {
      'functional-basics': {
        name: 'Functional Basics',
        description: 'Grundkursen för en hälsosam livsstil',
        level: 'Nybörjare',
        enrollments: 1245
      },
      'functional-flow': {
        name: 'Functional Flow',
        description: 'Fördjupningskurs för optimal matsmältning',
        level: 'Medel',
        enrollments: 892
      },
      'functional-energy': {
        name: 'Functional Energy',
        description: 'Avancerad kurs för energioptimering',
        level: 'Avancerad',
        enrollments: 634
      }
    };
    return courses[courseId as keyof typeof courses] || courses['functional-basics'];
  };

  const saveCourse = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Kursen har sparats!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar kursdata...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Kurs hittades inte</h2>
        <Link href="/admin/courses" className="text-[#014421] hover:underline">
          ← Tillbaka till kurser
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/courses" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tillbaka till kurser</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.name}</h1>
              <p className="text-gray-600 text-lg">{course.description}</p>
            </div>
            <div className="flex gap-3">
              <Link 
                href={`/dashboard/courses/${params.courseId}/oversikt`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Förhandsgranska
              </Link>
              <button
                onClick={saveCourse}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#014421] text-white rounded-lg hover:bg-[#012A14] transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sparar...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Spara ändringar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Course Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-gray-600 block">Pris</span>
              <span className="font-semibold text-lg">{course.price} kr</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-gray-600 block">Längd</span>
              <span className="font-semibold text-lg">{course.duration}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-gray-600 block">Nivå</span>
              <span className="font-semibold text-lg">{course.level}</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-gray-600 block">Deltagare</span>
              <span className="font-semibold text-lg">{course.enrollments}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Course Editor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Kursredigering</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kursnamn</label>
            <input
              type="text"
              value={course.name}
              onChange={(e) => setCourse(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Beskrivning</label>
            <textarea
              value={course.description || ''}
              onChange={(e) => setCourse(prev => prev ? { ...prev, description: e.target.value } : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pris (kr)</label>
              <input
                type="number"
                value={course.price}
                onChange={(e) => setCourse(prev => prev ? { ...prev, price: parseInt(e.target.value) } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Längd</label>
              <input
                type="text"
                value={course.duration}
                onChange={(e) => setCourse(prev => prev ? { ...prev, duration: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nivå</label>
              <select
                value={course.level}
                onChange={(e) => setCourse(prev => prev ? { ...prev, level: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
              >
                <option value="Nybörjare">Nybörjare</option>
                <option value="Medel">Medel</option>
                <option value="Avancerad">Avancerad</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Information</h3>
              <p className="text-sm text-blue-700">
                Detta är en förenklad version av kursredigeringen. Mer avancerad funktionalitet kommer att läggas till senare.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../../admin-ulrika-design.css';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Course {
  id: string;
  name: string;
  courseCode: string;
  productId: string;
}

export default function ManageCoursePage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'meals' | 'recipes' | 'shopping' | 'knowledge'>('meals');
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [params.courseId]);

  const loadCourse = async () => {
    try {
      const res = await fetch('/api/admin/functional-courses', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const list: Course[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.courses)
          ? data.courses
          : [];
        const found = list.find(
          (c: Course) => c.id === params.courseId || c.productId === params.courseId
        );
        setCourse(found || null);
      }
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F3EFE3] to-[#FEFDF9] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="admin-skeleton h-12 w-64 mb-8"></div>
          <div className="admin-skeleton h-96 w-full"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#F3EFE3] to-[#FEFDF9] p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Kursen hittades inte</h1>
          <Link href="/admin/courses" className="admin-btn admin-btn-secondary">
            Tillbaka till kurser
          </Link>
        </div>
      </div>
    );
  }

  // Map course IDs to course codes for API calls
  const courseCodeMap: Record<string, string> = {
    'functional-basics': 'basic',
    'functional-flow': 'flow',
    'functional-energy': 'energy',
    'hormonell-balans': 'hormone'
  };
  const courseCode = courseCodeMap[params.courseId] || 'basic';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F3EFE3] to-[#FEFDF9]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{course.name}</h1>
              <p className="text-sm text-gray-600 mt-1">Hantera kursinnehåll</p>
            </div>
            <div className="flex gap-3">
              {params.courseId === 'hormonell-balans' && (
                <Link 
                  href="/admin/hormone"
                  className="admin-btn admin-btn-primary"
                >
                  Förenklad vy
                </Link>
              )}
              <Link href="/admin/courses" className="admin-btn admin-btn-secondary">
                Tillbaka
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('meals')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all relative ${
                activeTab === 'meals'
                  ? 'text-[#014421] bg-[#F3EFE3]/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Kostscheman
              {activeTab === 'meals' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#014421]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all relative ${
                activeTab === 'recipes'
                  ? 'text-[#014421] bg-[#F3EFE3]/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Recept
              {activeTab === 'recipes' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#014421]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all relative ${
                activeTab === 'shopping'
                  ? 'text-[#014421] bg-[#F3EFE3]/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Inköpslistor
              {activeTab === 'shopping' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#014421]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('knowledge')}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all relative ${
                activeTab === 'knowledge'
                  ? 'text-[#014421] bg-[#F3EFE3]/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Kunskapsdokument
              {activeTab === 'knowledge' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#014421]"></div>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="admin-card">
          {activeTab === 'meals' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kostscheman</h3>
              <p className="text-sm text-gray-600 mb-6">
                Hantera veckokostscheman för {course.name}.
              </p>
              <Link
                href={`/admin/courses/${params.courseId}/meal-plans?course=${courseCode}`}
                className="admin-btn admin-btn-primary"
              >
                Öppna kostscheman
              </Link>
            </div>
          )}

          {activeTab === 'recipes' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recept</h3>
              <p className="text-sm text-gray-600 mb-6">
                Hantera recept som används i {course.name}.
              </p>
              <Link
                href={`/admin/recipes?tag=${params.courseId}`}
                className="admin-btn admin-btn-primary"
              >
                Öppna recepthantering
              </Link>
            </div>
          )}

          {activeTab === 'shopping' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Inköpslistor</h3>
              <p className="text-sm text-gray-600 mb-6">
                Hantera veckoinköpslistor för {course.name}.
              </p>
              <Link
                href={`/admin/shopping-lists?course=${courseCode}`}
                className="admin-btn admin-btn-primary"
              >
                Öppna inköpslistor
              </Link>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kunskapsdokument</h3>
              <p className="text-sm text-gray-600 mb-6">
                Hantera kunskapsdokument och utbildningsmaterial för {course.name}.
              </p>
              <Link
                href={`/admin/knowledge?course=${courseCode}`}
                className="admin-btn admin-btn-primary"
              >
                Öppna kunskapsbanken
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
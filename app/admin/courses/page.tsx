"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Book, Calendar, Clock, Edit3, Eye, MoreVertical, Plus, Search, Trash2, TrendingUp, Users, GraduationCap, BarChart3 } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  progress: number;
  createdAt: string;
  price?: number;
  coverImage?: string;
  user: {
    name: string | null;
    email: string;
  };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [search, levelFilter]);

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (levelFilter !== 'all') params.append('level', levelFilter);

      const response = await fetch(`/api/admin/courses?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna kurs?')) return;

    try {
      const response = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCourses(courses.filter(course => course.id !== id));
      }
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'Nybörjare';
      case 'Intermediate':
        return 'Medel';
      case 'Advanced':
        return 'Avancerad';
      default:
        return level;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kurser</h1>
        <p className="text-gray-600">Hantera dina kurser och utbildningar</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Sök kurser..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* View Mode Toggle */}
            <div className="bg-gray-100 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">Alla nivåer</option>
              <option value="Beginner">Nybörjare</option>
              <option value="Intermediate">Medel</option>
              <option value="Advanced">Avancerad</option>
            </select>
            
            <Link
              href="/admin/courses/new"
              className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-[#014421] transition-colors flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Ny kurs</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Totalt antal kurser</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12% denna månad
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Book className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Aktiva deltagare</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-xs text-blue-600 mt-2">23 nya denna vecka</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Genomsnittlig längd</p>
              <p className="text-2xl font-bold text-gray-900">6v</p>
              <p className="text-xs text-purple-600 mt-2">Mest populära: 6 veckor</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Slutförandegrad</p>
              <p className="text-2xl font-bold text-gray-900">84%</p>
              <p className="text-xs text-green-600 mt-2">Över genomsnittet</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Courses List/Grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Laddar kurser...</p>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Book className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-4">Inga kurser hittades</p>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-[#014421] transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Skapa din första kurs
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all relative group"
            >
              {/* Course Image */}
              <div className="h-48 bg-gradient-to-br from-[#93C560] to-[#014421] relative overflow-hidden">
                {course.coverImage ? (
                  <img 
                    src={course.coverImage} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <GraduationCap className="w-16 h-16 text-white/30" />
                  </div>
                )}
                
                {/* Level Badge */}
                <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                  {getLevelText(course.level)}
                </div>

                {/* More Options */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === course.id ? null : course.id)}
                    className="w-8 h-8 bg-white/90 backdrop-blur rounded-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {activeDropdown === course.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 overflow-hidden border border-gray-200">
                      <Link
                        href={`/admin/courses/${course.id}/edit`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-primary" />
                        <span>Redigera</span>
                      </Link>
                      <Link
                        href={`/utbildning/functional-basics`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span>Förhandsgranska</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-red-600 w-full text-left"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Ta bort</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Info */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>0 deltagare</span>
                  </div>
                </div>

                {/* Price */}
                {course.price && (
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-gray-900">{course.price} kr</span>
                    <span className="text-xs text-gray-500">exkl. moms</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/courses/${course.id}/edit`}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium text-sm"
                  >
                    Redigera
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-5 pb-5">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Slutförandegrad</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kurs
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nivå
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Längd
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pris
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skapad
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Åtgärder
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr 
                    key={course.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{course.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                        {getLevelText(course.level)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {course.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {course.price ? `${course.price} kr` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(course.createdAt).toLocaleDateString('sv-SE')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="p-2 text-gray-500 hover:text-primary transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 
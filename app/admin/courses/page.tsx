"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiFilter, FiEdit, FiTrash2, FiUsers, FiClock, FiBook, FiTrendingUp, FiAward, FiCalendar, FiMoreVertical, FiEye } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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
        return 'bg-primary text-white';
      case 'Intermediate':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'Advanced':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
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

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Beginner':
        return '🌱';
      case 'Intermediate':
        return '🌿';
      case 'Advanced':
        return '🌳';
      default:
        return '📚';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Kurser
        </h1>
        <p className="text-gray-600 text-lg">Hantera dina kurser och utbildningar</p>
      </motion.div>

      {/* Actions Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Sök kurser..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            {/* View Mode Toggle */}
            <div className="bg-gray-100 rounded-xl p-1 flex">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-orange-600 shadow-sm' 
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
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
            >
              <option value="all">Alla nivåer</option>
              <option value="Beginner">Nybörjare</option>
              <option value="Intermediate">Medel</option>
              <option value="Advanced">Avancerad</option>
            </select>
            
            <Link
              href="/admin/courses/new"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FiPlus className="text-xl" />
              <span className="hidden sm:inline">Ny kurs</span>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Totalt antal kurser</p>
              <p className="text-3xl font-bold text-gray-900">{courses.length}</p>
              <p className="text-xs text-primary mt-2 flex items-center gap-1">
                <FiTrendingUp />
                +12% denna månad
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <FiBook className="w-7 h-7" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Aktiva deltagare</p>
              <p className="text-3xl font-bold text-gray-900">156</p>
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <FiUsers />
                23 nya denna vecka
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <FiUsers className="w-7 h-7" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Genomsnittlig längd</p>
              <p className="text-3xl font-bold text-gray-900">6v</p>
              <p className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                <FiClock />
                Mest populära: 6 veckor
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <FiClock className="w-7 h-7" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Slutförandegrad</p>
              <p className="text-3xl font-bold text-gray-900">84%</p>
              <p className="text-xs text-primary mt-2 flex items-center gap-1">
                <FiAward />
                Över genomsnittet
              </p>
            </div>
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
              <FiAward className="w-7 h-7" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Courses List/Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg">Laddar kurser...</p>
          </div>
        </div>
      ) : courses.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-12 text-center"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiBook className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-6">Inga kurser hittades</p>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FiPlus />
            Skapa din första kurs
          </Link>
        </motion.div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 relative group"
              >
                {/* Course Image */}
                <div className="h-48 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 relative overflow-hidden">
                  {course.coverImage ? (
                    <img 
                      src={course.coverImage} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiBook className="w-20 h-20 text-white/30" />
                    </div>
                  )}
                  
                  {/* Level Badge */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold ${getLevelColor(course.level)} shadow-lg`}>
                    <span className="mr-1">{getLevelIcon(course.level)}</span>
                    {getLevelText(course.level)}
                  </div>

                  {/* More Options */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === course.id ? null : course.id)}
                      className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                    >
                      <FiMoreVertical />
                    </button>
                    
                    {activeDropdown === course.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-10 overflow-hidden">
                        <Link
                          href={`/admin/courses/${course.id}/edit`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <FiEdit className="text-orange-600" />
                          <span>Redigera</span>
                        </Link>
                        <Link
                          href={`/utbildning/functional-basics`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <FiEye className="text-blue-600" />
                          <span>Förhandsgranska</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-red-600 w-full text-left"
                        >
                          <FiTrash2 />
                          <span>Ta bort</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <FiClock className="text-gray-400" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiUsers className="text-gray-400" />
                      <span>0 deltagare</span>
                    </div>
                  </div>

                  {/* Price */}
                  {course.price && (
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-gray-900">{course.price} kr</span>
                      <span className="text-sm text-gray-500">exkl. moms</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                      className="flex-1 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors text-center font-medium"
                    >
                      Redigera
                    </Link>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Slutförandegrad</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                      className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        // List View
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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
                <AnimatePresence>
                  {courses.map((course, index) => (
                    <motion.tr 
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                            {course.title.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1">{course.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${getLevelColor(course.level)} shadow-sm`}>
                          <span className="mr-1">{getLevelIcon(course.level)}</span>
                          {getLevelText(course.level)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center gap-1">
                          <FiClock className="text-gray-400" />
                          {course.duration}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {course.price ? `${course.price} kr` : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <FiCalendar className="text-gray-400" />
                          {new Date(course.createdAt).toLocaleDateString('sv-SE')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/courses/${course.id}/edit`}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                          >
                            <FiEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 
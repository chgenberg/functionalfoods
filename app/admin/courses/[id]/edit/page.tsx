"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiSave, FiBook, FiClock, FiUsers } from 'react-icons/fi';

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  progress: number;
  createdAt: string;
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    duration: '4 weeks'
  });

  useEffect(() => {
    fetchCourse();
  }, [params.id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${params.id}`);
      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);
        setFormData({
          title: courseData.title,
          description: courseData.description,
          level: courseData.level,
          duration: courseData.duration
        });
      } else {
        alert('Kunde inte hämta kurs');
        router.push('/admin/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      alert('Ett fel uppstod');
      router.push('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/courses/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/admin/courses');
      } else {
        const error = await response.json();
        alert(error.error || 'Kunde inte uppdatera kurs');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Ett fel uppstod');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar kurs...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Kursen hittades inte</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft />
          Tillbaka
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Redigera kurs</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          {/* Course Info */}
          <div className="flex items-center gap-4 pb-6 border-b">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <FiBook className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="text-gray-500">ID: {course.id}</p>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kursnamn *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beskrivning *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          {/* Level and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivå
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="Beginner">Nybörjare</option>
                <option value="Intermediate">Medel</option>
                <option value="Advanced">Avancerad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Längd
              </label>
              <div className="relative">
                <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="T.ex. 6 veckor"
                />
              </div>
            </div>
          </div>

          {/* Meta Information */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Skapad:</span>
              <span>{new Date(course.createdAt).toLocaleDateString('sv-SE')}</span>
            </div>
            <div className="flex justify-between">
              <span>Progress:</span>
              <span>{course.progress}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sparar...
                </>
              ) : (
                <>
                  <FiSave />
                  Spara ändringar
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/courses')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Avbryt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
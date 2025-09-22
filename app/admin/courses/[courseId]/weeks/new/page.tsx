'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewWeekPage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [weekData, setWeekData] = useState({
    weekNumber: 1,
    title: '',
    subtitle: '',
    welcomeMessage: '',
    heroImage: '',
    videoUrl: ''
  });

  const getCourseName = (courseId: string) => {
    const names = {
      'functional-basics': 'Functional Basics',
      'functional-flow': 'Functional Flow',
      'functional-energy': 'Functional Energy'
    };
    return names[courseId as keyof typeof names] || 'Kurs';
  };

  const saveWeek = async () => {
    setSaving(true);
    try {
      // Map courseId to course name for API
      const courseMap: Record<string, string> = {
        'functional-basics': 'basic',
        'functional-flow': 'flow',
        'functional-energy': 'energy'
      };
      
      const courseName = courseMap[params.courseId];
      
      const response = await fetch('/api/admin/course-weeks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          course: courseName,
          weekNumber: weekData.weekNumber,
          weekTitle: weekData.title,
          weekSubtitle: weekData.subtitle,
          heroImage: weekData.heroImage,
          videoUrl: weekData.videoUrl,
          welcomeMessage: weekData.welcomeMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create week');
      }

      // Redirect back to weeks list
      router.push(`/admin/courses/${params.courseId}/weeks`);
    } catch (error) {
      console.error('Error creating week:', error);
      alert('Ett fel uppstod vid skapandet av veckan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href={`/admin/courses/${params.courseId}/weeks`}
            className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--primary-green)] mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till veckor
          </Link>
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">
            Skapa ny vecka
          </h1>
          <p className="text-[var(--text-secondary)]">
            Lägg till en ny vecka för {getCourseName(params.courseId)}
          </p>
        </div>
        
        <button
          onClick={saveWeek}
          disabled={saving || !weekData.title}
          className="admin-btn admin-btn-primary"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Sparar...' : 'Skapa vecka'}
        </button>
      </div>

      {/* Form */}
      <div className="admin-card bg-gradient-to-br from-white to-[var(--cream-white)]">
        <div className="space-y-6">
          <div>
            <label className="admin-label text-[var(--primary-green)] font-semibold">
              Veckonummer
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={weekData.weekNumber}
              onChange={(e) => setWeekData({ ...weekData, weekNumber: parseInt(e.target.value) })}
              className="admin-input mt-2"
            />
          </div>

          <div>
            <label className="admin-label text-[var(--primary-green)] font-semibold">
              Veckotitel *
            </label>
            <input
              type="text"
              value={weekData.title}
              onChange={(e) => setWeekData({ ...weekData, title: e.target.value })}
              className="admin-input mt-2"
              placeholder="T.ex. Introduktion till Functional Foods"
              required
            />
          </div>

          <div>
            <label className="admin-label text-[var(--primary-green)] font-semibold">
              Underrubrik
            </label>
            <input
              type="text"
              value={weekData.subtitle}
              onChange={(e) => setWeekData({ ...weekData, subtitle: e.target.value })}
              className="admin-input mt-2"
              placeholder="T.ex. Grunderna för en hälsosam livsstil"
            />
          </div>

          <div>
            <label className="admin-label text-[var(--primary-green)] font-semibold">
              Välkomstmeddelande
            </label>
            <textarea
              value={weekData.welcomeMessage}
              onChange={(e) => setWeekData({ ...weekData, welcomeMessage: e.target.value })}
              className="admin-textarea mt-2"
              rows={4}
              placeholder="Skriv ett inspirerande välkomstmeddelande för veckan..."
            />
          </div>

          <div>
            <label className="admin-label text-[var(--primary-green)] font-semibold">
              Hero-bild URL
            </label>
            <input
              type="text"
              value={weekData.heroImage}
              onChange={(e) => setWeekData({ ...weekData, heroImage: e.target.value })}
              className="admin-input mt-2"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="admin-label text-[var(--primary-green)] font-semibold">
              Video URL (Vimeo)
            </label>
            <input
              type="text"
              value={weekData.videoUrl}
              onChange={(e) => setWeekData({ ...weekData, videoUrl: e.target.value })}
              className="admin-input mt-2"
              placeholder="https://player.vimeo.com/video/123456789"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Link
          href={`/admin/courses/${params.courseId}/weeks`}
          className="admin-btn admin-btn-secondary"
        >
          Avbryt
        </Link>
        
        <button
          onClick={saveWeek}
          disabled={saving || !weekData.title}
          className="admin-btn admin-btn-primary"
        >
          <Plus className="w-4 h-4" />
          {saving ? 'Skapar...' : 'Skapa vecka'}
        </button>
      </div>
    </div>
  );
}

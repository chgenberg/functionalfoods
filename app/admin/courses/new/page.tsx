'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Info } from 'lucide-react';
import ImageUpload from '@/app/components/admin/ImageUpload';

export default function AdminNewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    duration: '6 veckor',
    price: 1497,
    targetAudience: '',
    coverImage: '',
    welcomeMessage: '',
    introVideoUrl: '',
    enableCommunity: false,
    communityDescription: '',
    objectives: ['', '', ''] // Start med 3 tomma mål
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Filtrera bort tomma objectives
      const objectives = formData.objectives.filter(obj => obj.trim() !== '');
      
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          objectives
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create course');
      }

      const newCourse = await response.json();
      
      // Visa success-meddelande
      alert(`✅ Kursen "${newCourse.title}" har skapats!\n\n` +
            `📋 Kurs-slug: ${newCourse.courseSlug}\n` +
            `📅 ${newCourse.message}\n\n` +
            `Nästa steg:\n` +
            `1. Lägg till recept för kursen\n` +
            `2. Fyll i kostscheman för varje vecka\n` +
            `3. Lägg till kunskapsdokument`);
      
      // Redirecta till kursöversikten
      router.push('/admin/courses');
    } catch (err: any) {
      console.error('Error creating course:', err);
      setError(err.message || 'Ett fel uppstod när kursen skulle skapas');
    } finally {
      setSaving(false);
    }
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData({ ...formData, objectives: newObjectives });
  };

  const addObjective = () => {
    setFormData({ ...formData, objectives: [...formData.objectives, ''] });
  };

  const removeObjective = (index: number) => {
    const newObjectives = formData.objectives.filter((_, i) => i !== index);
    setFormData({ ...formData, objectives: newObjectives });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
        <div className="flex items-center gap-4 mb-3">
          <Link 
            href="/admin/courses"
            className="text-gray-600 hover:text-[#014421] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-4xl font-bold text-[#014421]">Skapa ny kurs</h1>
        </div>
        <p className="text-gray-600 text-lg ml-10">Fyll i kursinformation för att skapa en helt ny kurs</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-8">
          {/* Grundläggande information */}
          <div>
            <h2 className="text-2xl font-bold text-[#014421] mb-6">Grundläggande information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#014421] mb-2">
                  Kursnamn *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20 transition-all"
                  placeholder="t.ex. Functional Balance"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#014421] mb-2">
                  Pris (SEK) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#014421] mb-2">
                  Nivå *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20 transition-all"
                >
                  <option value="Beginner">Nybörjare</option>
                  <option value="Intermediate">Medel</option>
                  <option value="Advanced">Avancerad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#014421] mb-2">
                  Längd *
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20 transition-all"
                  placeholder="t.ex. 6 veckor"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-[#014421] mb-2">
                Beskrivning *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20 transition-all"
                rows={4}
                placeholder="Beskriv vad kursen handlar om..."
                required
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-[#014421] mb-2">
                Målgrupp
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20 transition-all"
                placeholder="t.ex. Personer som vill förbättra sin energi och minska stress"
              />
            </div>
          </div>

          {/* Kursmål */}
          <div>
            <h2 className="text-2xl font-bold text-[#014421] mb-6">Kursmål</h2>
            <div className="space-y-3">
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20 transition-all"
                    placeholder={`Mål ${index + 1}`}
                  />
                  {formData.objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addObjective}
                className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                + Lägg till mål
              </button>
            </div>
          </div>

          {/* Media och innehåll */}
          <div>
            <h2 className="text-2xl font-bold text-[#014421] mb-6">Media och innehåll</h2>
            <div className="space-y-6">
              <div>
                <ImageUpload
                  value={formData.coverImage}
                  onChange={(url) => setFormData({ ...formData, coverImage: url })}
                  label="Omslagsbild"
                  uploadType="course"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#014421] mb-2">
                  Introduktionsvideo URL
                </label>
                <input
                  type="url"
                  value={formData.introVideoUrl}
                  onChange={(e) => setFormData({ ...formData, introVideoUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20 transition-all"
                  placeholder="https://vimeo.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#014421] mb-2">
                  Välkomstmeddelande
                </label>
                <textarea
                  value={formData.welcomeMessage}
                  onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20 transition-all"
                  rows={6}
                  placeholder="Välkommen till kursen! Här kommer du att..."
                />
              </div>
            </div>
          </div>

          {/* Community */}
          <div>
            <h2 className="text-2xl font-bold text-[#014421] mb-6">Community-inställningar</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enableCommunity"
                  checked={formData.enableCommunity}
                  onChange={(e) => setFormData({ ...formData, enableCommunity: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-[#014421] focus:ring-[#014421]"
                />
                <label htmlFor="enableCommunity" className="font-semibold text-gray-700">
                  Aktivera community för denna kurs
                </label>
              </div>

              {formData.enableCommunity && (
                <div>
                  <label className="block text-sm font-bold text-[#014421] mb-2">
                    Community-beskrivning
                  </label>
                  <textarea
                    value={formData.communityDescription}
                    onChange={(e) => setFormData({ ...formData, communityDescription: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#014421] focus:ring-2 focus:ring-[#014421]/20 transition-all"
                    rows={4}
                    placeholder="Beskriv vad community-delen erbjuder..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-2">✨ Vad händer när du skapar kursen:</p>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Kursen skapas i databasen</li>
                  <li>Veckostruktur skapas automatiskt (baserat på duration)</li>
                  <li>Tomma kostscheman skapas för varje vecka</li>
                  <li>Vecko-metadata skapas för varje vecka</li>
                </ul>
                <p className="font-semibold mb-2">📋 Nästa steg efter att kursen skapats:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Tagga recept med kursens namn via "Recept" (admin/recipes)</li>
                  <li>Fyll i kostscheman via "Kostscheman" (admin/meal-plans)</li>
                  <li>Lägg till kunskapsdokument via "Kunskapsdokument" (admin/knowledge)</li>
                  <li>Konfigurera veckovisa videoklipp via "Veckor" (admin/course-weeks)</li>
                  <li>Inköpslistor genereras automatiskt från kostscheman</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#112A12] transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Skapar kurs...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Skapa kurs
                </>
              )}
            </button>
            
            <Link
              href="/admin/courses"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              Avbryt
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
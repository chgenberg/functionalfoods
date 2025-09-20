'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Edit3, Trash2, Upload, Image as ImageIcon, Video, FileText } from 'lucide-react';

interface CourseWeek {
  weekNumber: number;
  title: string;
  subtitle?: string;
  welcomeMessage?: string;
  heroImage?: string;
  videoUrl?: string;
}

interface Course {
  id: string;
  name: string;
  description?: string;
  price: number;
  weeks: CourseWeek[];
}

export default function EditCoursePage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingWeek, setEditingWeek] = useState<number | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [params.courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      
      // Mock data baserat på courseId
      const courseData: Record<string, Course> = {
        'functional-basics': {
          id: 'functional-basics',
          name: 'Functional Basics',
          description: 'Grundkurs i funktionell kost för en hälsosam livsstil',
          price: 1497,
          weeks: [
            {
              weekNumber: 1,
              title: 'Vecka 1: Introduktion till Functional Foods',
              subtitle: 'Grunderna för en hälsosam livsstil',
              welcomeMessage: 'Välkommen till din resa mot bättre hälsa! Den här veckan lär du dig grunderna...',
              heroImage: '/kurser/basic-week1.jpg',
              videoUrl: ''
            },
            {
              weekNumber: 2,
              title: 'Vecka 2: Planering och struktur',
              subtitle: '3 steg till ett friskare liv',
              welcomeMessage: 'Nu när du förstår grunderna, låt oss skapa struktur...',
              heroImage: '/kurser/basic-week2.jpg',
              videoUrl: 'https://player.vimeo.com/video/1119774775'
            },
            // ... fortsätt för alla 6 veckor
          ]
        },
        'functional-flow': {
          id: 'functional-flow',
          name: 'Functional Flow',
          description: 'Fördjupningskurs i mag- och tarmhälsa',
          price: 1497,
          enrollments: 89,
          weeks: [
            {
              weekNumber: 1,
              title: 'Vecka 1: Mag- och tarmhälsa',
              subtitle: 'Förstå din mage och tarm',
              welcomeMessage: 'Välkommen till Flow-kursen där vi fokuserar på mag- och tarmhälsa...',
              heroImage: '/kurser/flow-week1.jpg',
              videoUrl: ''
            },
            // ... fler veckor
          ]
        },
        'functional-energy': {
          id: 'functional-energy',
          name: 'Functional Energy',
          description: 'Specialkurs för blodsockerkontroll och energibalans',
          price: 1497,
          enrollments: 34,
          weeks: [
            {
              weekNumber: 1,
              title: 'Vecka 1: Blodsockerkontroll',
              subtitle: 'Stabila energinivåer hela dagen',
              welcomeMessage: 'Välkommen till Energy-kursen! Här lär du dig att kontrollera ditt blodsocker...',
              heroImage: '/kurser/energy-week1.jpg',
              videoUrl: ''
            },
            // ... fler veckor
          ]
        }
      };

      setCourse(courseData[params.courseId] || null);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCourse = async () => {
    if (!course) return;

    try {
      setSaving(true);
      
      // Här skulle vi spara till API/databas
      console.log('Saving course:', course);
      
      // Simulera API-anrop
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Kurs sparad framgångsrikt!');
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Fel vid sparning av kurs');
    } finally {
      setSaving(false);
    }
  };

  const updateWeek = (weekNumber: number, field: keyof CourseWeek, value: string) => {
    if (!course) return;

    setCourse(prev => ({
      ...prev!,
      weeks: prev!.weeks.map(week => 
        week.weekNumber === weekNumber
          ? { ...week, [field]: value }
          : week
      )
    }));
  };

  const addWeek = () => {
    if (!course) return;

    const newWeekNumber = Math.max(...course.weeks.map(w => w.weekNumber)) + 1;
    setCourse(prev => ({
      ...prev!,
      weeks: [...prev!.weeks, {
        weekNumber: newWeekNumber,
        title: `Vecka ${newWeekNumber}: Ny vecka`,
        subtitle: '',
        welcomeMessage: '',
        heroImage: '',
        videoUrl: ''
      }]
    }));
  };

  const removeWeek = (weekNumber: number) => {
    if (!course || !confirm('Är du säker på att du vill ta bort denna vecka?')) return;

    setCourse(prev => ({
      ...prev!,
      weeks: prev!.weeks.filter(week => week.weekNumber !== weekNumber)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-[var(--text-secondary)] mt-4 font-light">Laddar kurs...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-[var(--text-primary)] mb-2">Kurs hittades inte</h2>
        <Link href="/admin/courses" className="admin-btn admin-btn-primary">
          Tillbaka till kurser
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/admin/courses" 
            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary-green)] mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Tillbaka till kurser</span>
          </Link>
          
          <h1 className="text-3xl font-light text-[var(--primary-green)]">
            Redigera {course.name}
          </h1>
          <p className="text-[var(--text-secondary)] mt-1">{course.description}</p>
        </div>

        <button
          onClick={saveCourse}
          disabled={saving}
          className="admin-btn admin-btn-primary"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Sparar...' : 'Spara ändringar'}
        </button>
      </div>

      {/* Course Info */}
      <div className="admin-card">
        <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Kursinformation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="admin-label">Kursnamn</label>
            <input
              type="text"
              value={course.name}
              onChange={(e) => setCourse(prev => ({ ...prev!, name: e.target.value }))}
              className="admin-input"
            />
          </div>
          
          <div>
            <label className="admin-label">Pris (SEK)</label>
            <input
              type="number"
              value={course.price}
              onChange={(e) => setCourse(prev => ({ ...prev!, price: parseInt(e.target.value) || 0 }))}
              className="admin-input"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="admin-label">Beskrivning</label>
            <textarea
              value={course.description}
              onChange={(e) => setCourse(prev => ({ ...prev!, description: e.target.value }))}
              className="admin-textarea"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Weeks Management */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-[var(--primary-green)]">Veckohantering</h2>
          <button
            onClick={addWeek}
            className="admin-btn admin-btn-secondary"
          >
            <Plus className="w-4 h-4" />
            Lägg till vecka
          </button>
        </div>

        <div className="space-y-4">
          {course.weeks.map((week) => (
            <motion.div
              key={week.weekNumber}
              layout
              className="border rounded-lg p-4 hover:bg-[var(--primary-beige)] transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-[var(--text-primary)]">
                  Vecka {week.weekNumber}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingWeek(editingWeek === week.weekNumber ? null : week.weekNumber)}
                    className="admin-btn admin-btn-secondary text-xs"
                  >
                    <Edit3 className="w-3 h-3" />
                    {editingWeek === week.weekNumber ? 'Stäng' : 'Redigera'}
                  </button>
                  
                  {course.weeks.length > 1 && (
                    <button
                      onClick={() => removeWeek(week.weekNumber)}
                      className="admin-btn admin-btn-danger text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {editingWeek === week.weekNumber ? (
                <div className="space-y-4">
                  <div>
                    <label className="admin-label">Veckorubrik</label>
                    <input
                      type="text"
                      value={week.title}
                      onChange={(e) => updateWeek(week.weekNumber, 'title', e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  
                  <div>
                    <label className="admin-label">Underrubrik</label>
                    <input
                      type="text"
                      value={week.subtitle || ''}
                      onChange={(e) => updateWeek(week.weekNumber, 'subtitle', e.target.value)}
                      className="admin-input"
                    />
                  </div>
                  
                  <div>
                    <label className="admin-label">Välkomstmeddelande</label>
                    <textarea
                      value={week.welcomeMessage || ''}
                      onChange={(e) => updateWeek(week.weekNumber, 'welcomeMessage', e.target.value)}
                      className="admin-textarea"
                      rows={4}
                      placeholder="Skriv välkomstmeddelandet för denna vecka..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="admin-label">Hero-bild URL</label>
                      <input
                        type="text"
                        value={week.heroImage || ''}
                        onChange={(e) => updateWeek(week.weekNumber, 'heroImage', e.target.value)}
                        className="admin-input"
                        placeholder="/kurser/week1.jpg"
                      />
                    </div>
                    
                    <div>
                      <label className="admin-label">Video URL (Vimeo)</label>
                      <input
                        type="text"
                        value={week.videoUrl || ''}
                        onChange={(e) => updateWeek(week.weekNumber, 'videoUrl', e.target.value)}
                        className="admin-input"
                        placeholder="https://player.vimeo.com/video/..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-[var(--text-secondary)]">
                  <p className="font-medium">{week.title}</p>
                  {week.subtitle && <p>{week.subtitle}</p>}
                  {week.welcomeMessage && (
                    <p className="mt-2 line-clamp-2">{week.welcomeMessage}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    {week.heroImage && (
                      <span className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Bild
                      </span>
                    )}
                    {week.videoUrl && (
                      <span className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Video
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="admin-card">
        <h2 className="text-lg font-medium text-[var(--primary-green)] mb-4">Förhandsvisning</h2>
        <div className="bg-[var(--primary-beige)] rounded-lg p-4">
          <p className="text-sm text-[var(--text-secondary)] mb-2">
            Så här ser kursen ut för användarna:
          </p>
          <div className="bg-white rounded-lg p-4 border">
            <h3 className="text-lg font-semibold text-[var(--primary-green)] mb-2">
              {course.name}
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">{course.description}</p>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-[var(--primary-green)]">
                {course.price.toLocaleString('sv-SE')} kr
              </span>
              <span className="text-sm text-[var(--text-secondary)]">
                {course.weeks.length} veckor
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

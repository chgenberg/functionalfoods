'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Plus, Edit3, Trash2, Upload, 
  Image as ImageIcon, Video, FileText, Clock, Users,
  ChevronDown, ChevronUp, Eye, Calendar, BookOpen,
  Target, Sparkles, CheckCircle, AlertCircle
} from 'lucide-react';

interface CourseWeek {
  weekNumber: number;
  title: string;
  subtitle?: string;
  welcomeMessage?: string;
  heroImage?: string;
  videoUrl?: string;
  goals?: string[];
  keyLearnings?: string[];
}

interface Course {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: string;
  level: string;
  enrollments?: number;
  weeks: CourseWeek[];
}

export default function EditCoursePage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [showOverviewEdit, setShowOverviewEdit] = useState(false);
  const [overviewData, setOverviewData] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    description: '',
    benefits: [] as string[],
    targetAudience: [] as string[],
    includesFeatures: [] as string[],
    communityLink: '',
    communityTitle: '',
    communityDescription: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCourse();
  }, [params.courseId]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      
      // Create mock weeks for all 6 weeks
      const weeks: CourseWeek[] = Array.from({ length: 6 }, (_, index) => ({
        weekNumber: index + 1,
        title: `Vecka ${index + 1}`,
        subtitle: getWeekSubtitle(params.courseId, index + 1),
        welcomeMessage: getWeekWelcomeMessage(params.courseId, index + 1),
        heroImage: `/kurser/${params.courseId}-week${index + 1}.jpg`,
        videoUrl: getWeekVideoUrl(params.courseId, index + 1),
        goals: getWeekGoals(params.courseId, index + 1),
        keyLearnings: getWeekKeyLearnings(params.courseId, index + 1)
      }));

      const courseData: Course = {
        id: params.courseId,
        name: getCourseInfo(params.courseId).name,
        description: getCourseInfo(params.courseId).description,
        price: 1497,
        duration: '6 veckor',
        level: getCourseInfo(params.courseId).level,
        enrollments: getCourseInfo(params.courseId).enrollments,
        weeks
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

  const getWeekSubtitle = (courseId: string, weekNumber: number) => {
    const subtitles = {
      'functional-basics': [
        'Introduktion till Functional Foods',
        'Planering och struktur',
        'Grundläggande näringslära',
        'Måltidsplanering',
        'Hållbara vanor',
        'Framtiden och underhåll'
      ],
      'functional-flow': [
        'Matsmältningens grunder',
        'Tarmbakteriernas roll',
        'Inflammationsprocesser',
        'Stresshantering',
        'Sömnens betydelse',
        'Livslång hälsa'
      ],
      'functional-energy': [
        'Energimetabolism',
        'Hormonell balans',
        'Näringsabsorption',
        'Träning och återhämtning',
        'Mental klarhet',
        'Optimal prestanda'
      ]
    };
    return subtitles[courseId as keyof typeof subtitles]?.[weekNumber - 1] || `Vecka ${weekNumber}`;
  };

  const getWeekWelcomeMessage = (courseId: string, weekNumber: number) => {
    return `Välkommen till vecka ${weekNumber}! Den här veckan kommer vi att fokusera på viktiga koncept för din hälsoresa.`;
  };

  const getWeekVideoUrl = (courseId: string, weekNumber: number) => {
    return `/videos/${courseId}-week${weekNumber}.mp4`;
  };

  const getWeekGoals = (courseId: string, weekNumber: number) => {
    return [
      `Mål 1 för vecka ${weekNumber}`,
      `Mål 2 för vecka ${weekNumber}`,
      `Mål 3 för vecka ${weekNumber}`
    ];
  };

  const getWeekKeyLearnings = (courseId: string, weekNumber: number) => {
    return [
      `Nyckellärdomar 1 för vecka ${weekNumber}`,
      `Nyckellärdomar 2 för vecka ${weekNumber}`,
      `Nyckellärdomar 3 för vecka ${weekNumber}`
    ];
  };

  const saveCourse = async () => {
    setSaving(true);
    try {
      // Mock save functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('Kursen har sparats!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving course:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateWeek = (weekNumber: number, field: keyof CourseWeek, value: any) => {
    if (!course) return;
    
    const updatedWeeks = course.weeks.map(week => 
      week.weekNumber === weekNumber ? { ...week, [field]: value } : week
    );
    
    setCourse({ ...course, weeks: updatedWeeks });
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
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
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
      </motion.div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overview Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div 
          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowOverviewEdit(!showOverviewEdit)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Kursöversikt</h3>
                <p className="text-gray-600">Redigera översiktssidan för kursen</p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: showOverviewEdit ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {showOverviewEdit && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-gray-50 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Huvudrubrik</label>
                    <input
                      type="text"
                      value={overviewData.heroTitle}
                      onChange={(e) => setOverviewData(prev => ({ ...prev, heroTitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                      placeholder="T.ex. Välkommen till Functional Basics"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Underrubrik</label>
                    <input
                      type="text"
                      value={overviewData.heroSubtitle}
                      onChange={(e) => setOverviewData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                      placeholder="T.ex. Din resa mot bättre hälsa börjar här"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kursbeskrivning</label>
                  <textarea
                    value={overviewData.description}
                    onChange={(e) => setOverviewData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                    rows={4}
                    placeholder="Beskriv kursen mer detaljerat..."
                  />
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500">Fler inställningar kommer snart...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Weeks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Kursinnehåll per vecka</h2>
        
        {course.weeks.map((week, index) => (
          <motion.div
            key={week.weekNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Week Header */}
            <div 
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedWeek(expandedWeek === week.weekNumber ? null : week.weekNumber)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#014421] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                    {week.weekNumber}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Vecka {week.weekNumber}: {week.title}
                    </h3>
                    <p className="text-gray-600">{week.subtitle}</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedWeek === week.weekNumber ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </div>
            </div>

            {/* Week Content */}
            <AnimatePresence>
              {expandedWeek === week.weekNumber && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-gray-50 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vecko-titel</label>
                        <input
                          type="text"
                          value={week.title}
                          onChange={(e) => updateWeek(week.weekNumber, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Underrubrik</label>
                        <input
                          type="text"
                          value={week.subtitle}
                          onChange={(e) => updateWeek(week.weekNumber, 'subtitle', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Välkomstmeddelande</label>
                      <textarea
                        value={week.welcomeMessage}
                        onChange={(e) => updateWeek(week.weekNumber, 'welcomeMessage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hero-bild URL</label>
                        <input
                          type="text"
                          value={week.heroImage}
                          onChange={(e) => updateWeek(week.weekNumber, 'heroImage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                          placeholder="/kurser/hero-image.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                        <input
                          type="text"
                          value={week.videoUrl}
                          onChange={(e) => updateWeek(week.weekNumber, 'videoUrl', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                          placeholder="/videos/video.mp4"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
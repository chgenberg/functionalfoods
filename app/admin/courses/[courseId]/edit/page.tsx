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
import { mealPlans, flowMealPlans, energyMealPlans } from '@/app/data/mealPlans';

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
      
      // Get meal plan data based on courseId
      const mealPlanData = params.courseId === 'functional-basics' ? mealPlans 
        : params.courseId === 'functional-flow' ? flowMealPlans 
        : params.courseId === 'functional-energy' ? energyMealPlans 
        : null;

      if (!mealPlanData) {
        setCourse(null);
        return;
      }

      // Extract weeks from meal plans - ensure we get all 6 weeks
      const weekKeys = ['week1', 'week2', 'week3', 'week4', 'week5', 'week6'];
      const weeks: CourseWeek[] = weekKeys.map((key, index) => {
        const weekData = mealPlanData[key] || {};
        return {
          weekNumber: index + 1,
          title: weekData.title || `Vecka ${index + 1}`,
          subtitle: getWeekSubtitle(params.courseId, index + 1),
          welcomeMessage: getWeekWelcomeMessage(params.courseId, index + 1),
          heroImage: `/kurser/${params.courseId}-week${index + 1}.jpg`,
          videoUrl: getWeekVideoUrl(params.courseId, index + 1),
          goals: getWeekGoals(params.courseId, index + 1),
          keyLearnings: getWeekKeyLearnings(params.courseId, index + 1)
        };
      });

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
        description: 'Grundkurs i funktionell kost för en hälsosam livsstil',
        level: 'Nybörjare',
        enrollments: 234
      },
      'functional-flow': {
        name: 'Functional Gut Health/Flow',
        description: 'Fördjupningskurs i mag- och tarmhälsa',
        level: 'Medel',
        enrollments: 156
      },
      'functional-energy': {
        name: 'Functional Insulin balance/Energy',
        description: 'Specialkurs för blodsockerkontroll och energibalans',
        level: 'Avancerad',
        enrollments: 89
      }
    };
    return courses[courseId] || courses['functional-basics'];
  };

  const getWeekSubtitle = (courseId: string, weekNumber: number) => {
    const subtitles = {
      'functional-basics': [
        'Grunderna för en hälsosam livsstil',
        'Planering och struktur för framgång',
        'Näringsrik mat för kropp och själ',
        'Balansera din kost för optimal hälsa',
        'Hållbara vanor för livet',
        'Sammanfattning och vägen framåt'
      ],
      'functional-flow': [
        'Förstå din mage och tarm',
        'Mat för en frisk tarmflora',
        'Inflammation och matens påverkan',
        'Stresshantering och matsmältning',
        'Fermenterad mat och probiotika',
        'Långsiktig tarmhälsa'
      ],
      'functional-energy': [
        'Stabila energinivåer hela dagen',
        'Blodsockerkontroll genom kosten',
        'Insulin och metabolism',
        'Träning och energibalans',
        'Sömn och återhämtning',
        'Optimera din energi långsiktigt'
      ]
    };
    return subtitles[courseId]?.[weekNumber - 1] || '';
  };

  const getWeekWelcomeMessage = (courseId: string, weekNumber: number) => {
    if (weekNumber === 1) {
      return 'Välkommen till din resa mot bättre hälsa! Den här veckan lär du dig grunderna som kommer att förändra ditt liv.';
    }
    return `Välkommen till vecka ${weekNumber}! Den här veckan bygger vi vidare på dina kunskaper och tar nästa steg.`;
  };

  const getWeekVideoUrl = (courseId: string, weekNumber: number) => {
    // Här kan vi hämta från databas senare
    if (courseId === 'functional-basics' && weekNumber === 2) {
      return 'https://player.vimeo.com/video/1119774775';
    }
    return '';
  };

  const getWeekGoals = (courseId: string, weekNumber: number) => {
    return [
      `Förstå veckans huvudkoncept`,
      `Implementera minst 3 nya vanor`,
      `Planera och genomföra veckans recept`,
      `Reflektera över din utveckling`
    ];
  };

  const getWeekKeyLearnings = (courseId: string, weekNumber: number) => {
    return [
      `Viktiga näringsämnen och deras funktion`,
      `Praktiska tips för vardagen`,
      `Vanliga misstag att undvika`,
      `Verktyg för långsiktig framgång`
    ];
  };

  const saveCourse = async () => {
    if (!course) return;

    try {
      setSaving(true);
      
      // Här skulle vi spara till API/databas
      console.log('Saving course:', course);
      
      // Simulera API-anrop
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Kursen har sparats framgångsrikt!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Fel vid sparning av kurs');
    } finally {
      setSaving(false);
    }
  };

  const updateWeek = (weekNumber: number, field: keyof CourseWeek, value: any) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-20 h-20 border-3 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-3 border-[#014421] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 mt-4">Laddar kursinnehåll...</p>
        </motion.div>
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
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

          {/* Course Stats */}
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Users className="w-8 h-8 text-[#014421] mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{course.enrollments || 0}</div>
              <div className="text-sm text-gray-600">Deltagare</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Clock className="w-8 h-8 text-[#93C560] mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{course.duration}</div>
              <div className="text-sm text-gray-600">Längd</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <Target className="w-8 h-8 text-[#FFB5A7] mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{course.level}</div>
              <div className="text-sm text-gray-600">Nivå</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{course.weeks.length}</div>
              <div className="text-sm text-gray-600">Veckor</div>
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
                {/* Hero Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Hero Sektion</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Huvudrubrik</label>
                      <input
                        type="text"
                        value={overviewData.heroTitle}
                        onChange={(e) => setOverviewData(prev => ({ ...prev, heroTitle: e.target.value }))}
                        className="admin-input"
                        placeholder="T.ex. Välkommen till Functional Basics"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Underrubrik</label>
                      <input
                        type="text"
                        value={overviewData.heroSubtitle}
                        onChange={(e) => setOverviewData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                        className="admin-input"
                        placeholder="T.ex. Din resa mot bättre hälsa börjar här"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hero Bild URL</label>
                      <input
                        type="text"
                        value={overviewData.heroImage}
                        onChange={(e) => setOverviewData(prev => ({ ...prev, heroImage: e.target.value }))}
                        className="admin-input"
                        placeholder="/kurser/hero-image.jpg"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kursbeskrivning</label>
                  <textarea
                    value={overviewData.description}
                    onChange={(e) => setOverviewData(prev => ({ ...prev, description: e.target.value }))}
                    className="admin-textarea"
                    rows={4}
                    placeholder="Beskriv kursen mer detaljerat..."
                  />
                </div>

                {/* Benefits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fördelar (en per rad)</label>
                  <textarea
                    value={overviewData.benefits.join('\n')}
                    onChange={(e) => setOverviewData(prev => ({ ...prev, benefits: e.target.value.split('\n').filter(b => b.trim()) }))}
                    className="admin-textarea"
                    rows={5}
                    placeholder="Lär dig grunderna i functional foods\nFörbättra din matsmältning\nÖka din energi"
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Målgrupp (en per rad)</label>
                  <textarea
                    value={overviewData.targetAudience.join('\n')}
                    onChange={(e) => setOverviewData(prev => ({ ...prev, targetAudience: e.target.value.split('\n').filter(t => t.trim()) }))}
                    className="admin-textarea"
                    rows={4}
                    placeholder="Nybörjare inom functional foods\nPersoner som vill förbättra sin hälsa"
                  />
                </div>

                {/* Included Features */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vad som ingår (en per rad)</label>
                  <textarea
                    value={overviewData.includesFeatures.join('\n')}
                    onChange={(e) => setOverviewData(prev => ({ ...prev, includesFeatures: e.target.value.split('\n').filter(f => f.trim()) }))}
                    className="admin-textarea"
                    rows={5}
                    placeholder="6 veckors strukturerat program\nRecept och måltidsplaner\nTillgång till community"
                  />
                </div>

                {/* Community Settings */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Community Inställningar</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Community Länk</label>
                      <input
                        type="text"
                        value={overviewData.communityLink}
                        onChange={(e) => setOverviewData(prev => ({ ...prev, communityLink: e.target.value }))}
                        className="admin-input"
                        placeholder="/dashboard/community"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Community Titel</label>
                      <input
                        type="text"
                        value={overviewData.communityTitle}
                        onChange={(e) => setOverviewData(prev => ({ ...prev, communityTitle: e.target.value }))}
                        className="admin-input"
                        placeholder="COMMUNITY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Community Beskrivning</label>
                      <textarea
                        value={overviewData.communityDescription}
                        onChange={(e) => setOverviewData(prev => ({ ...prev, communityDescription: e.target.value }))}
                        className="admin-textarea"
                        rows={2}
                        placeholder="Gå med i vår community och dela dina erfarenheter"
                      />
                    </div>
                  </div>
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
                      Vecka {week.weekNumber}: {week.title || `Vecka ${week.weekNumber}`}
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
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-100"
                >
                  <div className="p-6 space-y-6">
                    {/* Title & Subtitle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Veckotitel
                        </label>
                        <input
                          type="text"
                          value={week.title}
                          onChange={(e) => updateWeek(week.weekNumber, 'title', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                          placeholder="T.ex. Introduktion till Functional Foods"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Undertitel
                        </label>
                        <input
                          type="text"
                          value={week.subtitle}
                          onChange={(e) => updateWeek(week.weekNumber, 'subtitle', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                          placeholder="Kort beskrivning av veckans fokus"
                        />
                      </div>
                    </div>

                    {/* Welcome Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Välkomstmeddelande
                      </label>
                      <textarea
                        value={week.welcomeMessage}
                        onChange={(e) => updateWeek(week.weekNumber, 'welcomeMessage', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent resize-none"
                        placeholder="Välkommen till vecka X! Den här veckan kommer vi att..."
                      />
                    </div>

                    {/* Media */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <ImageIcon className="w-4 h-4 inline mr-1" />
                          Hero-bild URL
                        </label>
                        <input
                          type="text"
                          value={week.heroImage}
                          onChange={(e) => updateWeek(week.weekNumber, 'heroImage', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                          placeholder="/kurser/week1-hero.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Video className="w-4 h-4 inline mr-1" />
                          Video URL (Vimeo)
                        </label>
                        <input
                          type="text"
                          value={week.videoUrl}
                          onChange={(e) => updateWeek(week.weekNumber, 'videoUrl', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                          placeholder="https://player.vimeo.com/video/..."
                        />
                      </div>
                    </div>

                    {/* Goals & Key Learnings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Target className="w-4 h-4 inline mr-1" />
                          Veckans mål
                        </label>
                        <div className="space-y-2">
                          {(week.goals || []).map((goal, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-[#014421]">•</span>
                              <input
                                type="text"
                                value={goal}
                                onChange={(e) => {
                                  const newGoals = [...(week.goals || [])];
                                  newGoals[idx] = e.target.value;
                                  updateWeek(week.weekNumber, 'goals', newGoals);
                                }}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Sparkles className="w-4 h-4 inline mr-1" />
                          Viktiga lärdomar
                        </label>
                        <div className="space-y-2">
                          {(week.keyLearnings || []).map((learning, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-[#93C560]">•</span>
                              <input
                                type="text"
                                value={learning}
                                onChange={(e) => {
                                  const newLearnings = [...(week.keyLearnings || [])];
                                  newLearnings[idx] = e.target.value;
                                  updateWeek(week.weekNumber, 'keyLearnings', newLearnings);
                                }}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#014421] focus:border-transparent"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Senast uppdaterad: {new Date().toLocaleDateString('sv-SE')}
                      </div>
                      <Link
                        href={`/dashboard/courses/${params.courseId}/week${week.weekNumber}`}
                        className="text-[#014421] hover:underline text-sm"
                      >
                        Visa vecka →
                      </Link>
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
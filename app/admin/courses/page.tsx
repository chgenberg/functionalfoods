'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Edit3, Eye, Calendar, BookOpen, Users, Clock, ChevronRight, FileText, Settings, Database } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description?: string;
  price: number;
  enrollments: number;
  weeks: CourseWeek[];
}

interface CourseWeek {
  weekNumber: number;
  title: string;
  subtitle?: string;
  welcomeMessage?: string;
  heroImage?: string;
  videoUrl?: string;
}

interface MealPlanWeek {
  course: string;
  weekNumber: number;
  title?: string;
  days: any;
}

interface KnowledgeDocument {
  id: string;
  title: string;
  slug: string;
  course: string;
  weekNumber?: number;
  order: number;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [mealPlans, setMealPlans] = useState<MealPlanWeek[]>([]);
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'meals' | 'knowledge'>('overview');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse && activeTab === 'meals') {
      fetchMealPlans();
    }
    if (selectedCourse && activeTab === 'knowledge') {
      fetchKnowledgeDocs();
    }
  }, [selectedCourse, activeTab]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Hämta verklig data från API
      const response = await fetch('/api/admin/functional-courses', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data);
      
      // Auto-select first course
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMealPlans = async () => {
    if (!selectedCourse) return;
    try {
      const courseMap: Record<string, string> = {
        'functional-basics': 'basic',
        'functional-flow': 'flow',
        'functional-energy': 'energy'
      };
      const courseType = courseMap[selectedCourse] || 'basic';
      
      const response = await fetch(`/api/admin/meal-plans?course=${courseType}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMealPlans(data.weeks || []);
      }
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    }
  };

  const fetchKnowledgeDocs = async () => {
    if (!selectedCourse) return;
    try {
      const courseMap: Record<string, string> = {
        'functional-basics': 'basic',
        'functional-flow': 'flow',
        'functional-energy': 'energy'
      };
      const courseType = courseMap[selectedCourse] || 'basic';
      
      const response = await fetch(`/api/admin/knowledge?course=${courseType}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setKnowledgeDocs(data || []);
      }
    } catch (error) {
      console.error('Error fetching knowledge docs:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-2 border-[var(--border-light)] rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-2 border-[var(--primary-light-green)] rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-[var(--text-secondary)] mt-4">Laddar kurser...</p>
        </motion.div>
      </div>
    );
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
        <h1 className="text-4xl font-bold text-[#014421] mb-3">Kurshantering</h1>
        <p className="text-gray-600 text-lg">Redigera kursinnehåll, kostscheman, kunskapsdokument och veckor</p>
        
        {/* Course Selector */}
        <div className="mt-6">
          <label className="block text-sm font-bold text-[#014421] mb-3">Välj kurs att hantera</label>
          <div className="flex gap-3">
            {courses.map(course => (
              <button
            key={course.id}
                onClick={() => setSelectedCourse(course.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedCourse === course.id
                    ? 'bg-[#014421] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                    {course.name}
              </button>
            ))}
                </div>
              </div>
              
        {/* Tab Navigation */}
        {selectedCourse && (
          <div className="mt-8 border-b border-gray-200">
            <div className="flex gap-1">
              {[
                { id: 'overview', label: 'Översikt', icon: Eye },
                { id: 'meals', label: 'Kostscheman', icon: Calendar },
                { id: 'knowledge', label: 'Kunskapsdokument', icon: FileText }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all duration-300 border-b-2 ${
                      activeTab === tab.id
                        ? 'border-[#014421] text-[#014421] bg-[#014421]/5'
                        : 'border-transparent text-gray-600 hover:text-[#014421] hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {selectedCourse && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          {activeTab === 'overview' && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-[#014421] mb-6">Kursöversikt: {selectedCourseData?.name}</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Course Info */}
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg text-[#014421] mb-3">Kursinformation</h3>
                    <div className="space-y-3">
                      <div><span className="font-semibold">Pris:</span> {selectedCourseData?.price.toLocaleString('sv-SE')} kr</div>
                      <div><span className="font-semibold">Deltagare:</span> {selectedCourseData?.enrollments}</div>
                      <div><span className="font-semibold">Veckor:</span> {selectedCourseData?.weeks.length}</div>
                    </div>
            </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h3 className="font-bold text-lg text-[#014421] mb-3">Beskrivning</h3>
                    <p className="text-gray-700">{selectedCourseData?.description}</p>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-[#014421]">Snabbåtgärder</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setActiveTab('meals')}
                      className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-left"
                    >
                      <Calendar className="w-6 h-6 text-blue-600" />
                      <div>
                        <div className="font-semibold text-blue-800">Hantera kostscheman</div>
                        <div className="text-sm text-blue-600">Redigera veckoscheman direkt</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('knowledge')}
                      className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-left"
                    >
                      <FileText className="w-6 h-6 text-green-600" />
                      <div>
                        <div className="font-semibold text-green-800">Hantera kunskapsdokument</div>
                        <div className="text-sm text-green-600">Redigera artiklar och material</div>
              </div>
                    </button>
                    
                    <Link
                      href={`/admin/shopping-lists`}
                      className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                    >
                      <Database className="w-6 h-6 text-purple-600" />
                      <div>
                        <div className="font-semibold text-purple-800">Hantera inköpslistor</div>
                        <div className="text-sm text-purple-600">Redigera veckolistor</div>
                </div>
                    </Link>
              </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'meals' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#014421]">Kostscheman: {selectedCourseData?.name}</h2>
                <button
                  onClick={fetchMealPlans}
                  className="bg-[#014421] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#112A12] transition-colors"
                >
                  Uppdatera
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map(week => {
                  const mealPlan = mealPlans.find(mp => mp.weekNumber === week);
                  return (
                    <div key={week} className={`p-6 rounded-xl border-2 transition-all ${
                      mealPlan 
                        ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          mealPlan ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'
                        }`}>
                          {week}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Vecka {week}</div>
                          <div className="text-sm text-gray-600">
                            {mealPlan ? mealPlan.title || 'Kostschema finns' : 'Saknas i DB'}
                          </div>
                        </div>
                      </div>
                      
                      {mealPlan && (
                        <div className="text-sm text-gray-600">
                          <div>Dagar: {Object.keys(mealPlan.days || {}).length}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {activeTab === 'knowledge' && (
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#014421]">Kunskapsdokument: {selectedCourseData?.name}</h2>
                <button
                  onClick={fetchKnowledgeDocs}
                  className="bg-[#014421] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#112A12] transition-colors"
                >
                  Uppdatera
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {knowledgeDocs.map(doc => (
                  <div key={doc.id} className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{doc.title}</h3>
                        <div className="text-sm text-gray-600">
                          {doc.weekNumber ? `Vecka ${doc.weekNumber}` : 'Allmän'} • Ordning: {doc.order}
                        </div>
              </div>
            </div>

                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/admin/knowledge/edit?course=${doc.course}&slug=${doc.slug}`}
                        className="flex-1 bg-[#014421] text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-[#112A12] transition-colors text-center"
                      >
                        Redigera
                      </Link>
                  <Link
                        href={`/kunskapsbank/${doc.slug}`}
                        target="_blank"
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Visa
                      </Link>
                    </div>
                  </div>
                ))}
                
                {knowledgeDocs.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Inga kunskapsdokument hittades för denna kurs</p>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
      )}

      {/* Global Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-[#014421] mb-6">Globala åtgärder</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Link 
            href="/admin/recipes"
            className="group flex flex-col items-center gap-4 p-6 rounded-xl bg-gray-50 border-2 border-gray-200 hover:border-[#014421] hover:bg-gray-100 transition-all"
          >
            <div className="w-14 h-14 bg-[#014421] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <span className="text-base font-bold text-gray-800 text-center">Alla recept</span>
          </Link>
          
          <Link 
            href="/admin/shopping-lists"
            className="group flex flex-col items-center gap-4 p-6 rounded-xl bg-gray-50 border-2 border-gray-200 hover:border-[#014421] hover:bg-gray-100 transition-all"
          >
            <div className="w-14 h-14 bg-[#014421] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Database className="w-7 h-7 text-white" />
            </div>
            <span className="text-base font-bold text-gray-800 text-center">Inköpslistor</span>
          </Link>
          
          <Link 
            href="/admin/users"
            className="group flex flex-col items-center gap-4 p-6 rounded-xl bg-gray-50 border-2 border-gray-200 hover:border-[#014421] hover:bg-gray-100 transition-all"
          >
            <div className="w-14 h-14 bg-[#014421] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
            <span className="text-base font-bold text-gray-800 text-center">Användare</span>
          </Link>
          
          <Link 
            href="/admin/settings"
            className="group flex flex-col items-center gap-4 p-6 rounded-xl bg-gray-50 border-2 border-gray-200 hover:border-[#014421] hover:bg-gray-100 transition-all"
          >
            <div className="w-14 h-14 bg-[#014421] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <span className="text-base font-bold text-gray-800 text-center">Inställningar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
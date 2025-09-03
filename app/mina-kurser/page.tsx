"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Video, FileText, Lock, LogOut, User, Download, Play, ChevronRight, BookOpen, Clock, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseContent {
  videos?: Array<{
    id: string;
    title: string;
    url: string;
    duration: string;
    description: string;
  }>;
  pdfs?: Array<{
    id: string;
    title: string;
    url: string;
    pages: number;
  }>;
}

interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  content: CourseContent;
  features: string[];
}

interface Purchase {
  id: string;
  courseId: string;
  course: Course;
  amount: number;
  status: string;
  createdAt: string;
}

// Course metadata for enhanced display
const courseMetadata: Record<string, { 
  color: string; 
  icon: string; 
  dashboardPath: string;
  duration: string;
  level: string;
}> = {
  'Functional Basics': {
    color: 'from-green-400 to-green-600',
    icon: '🌱',
    dashboardPath: '/dashboard/courses/functional-basics',
    duration: '6 veckor',
    level: 'Nybörjare'
  },
  'Functional Flow': {
    color: 'from-blue-400 to-blue-600',
    icon: '🌊',
    dashboardPath: '/dashboard/courses/functional-flow',
    duration: '6 veckor',
    level: 'Fortsättning'
  },
  'Functional Energy': {
    color: 'from-orange-400 to-red-500',
    icon: '⚡',
    dashboardPath: '/dashboard/courses/functional-energy',
    duration: '6 veckor',
    level: 'Avancerad'
  }
};

export default function MyCoursesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Kontrollera om användaren är inloggad
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    setUser(user);
    
    // Fetch purchases first to determine smart redirect
    fetchPurchases(token, user);
  }, [router]);

  const fetchPurchases = async (token: string, user: any) => {
    try {
      const res = await fetch('/api/user/purchases', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch purchases');
      }

      const data = await res.json();
      const purchases = data.purchases || data;
      setPurchases(purchases);
      
      // Smart redirect logic - only redirect if user has exactly one course
      if (purchases.length === 1) {
        const courseName = purchases[0].course.name;
        const metadata = courseMetadata[courseName];
        if (metadata) {
          router.push(metadata.dashboardPath);
          return;
        }
      }
      
      // For multiple courses or no redirect, show course selection
      if (purchases.length > 0) {
        setSelectedCourse(purchases[0].course);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleCourseAccess = (courseName: string) => {
    const metadata = courseMetadata[courseName];
    if (metadata) {
      router.push(metadata.dashboardPath);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3EFE3]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C560] mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar dina kurser...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3EFE3]">
      {/* Header with proper spacing */}
      <div className="bg-white shadow-sm fixed top-0 left-0 right-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-[#014421]">
              Functional Foods
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{user?.name || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logga ut</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with padding for fixed header */}
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#014421] mb-2">Mina Kurser</h1>
          <p className="text-gray-600">Välj en kurs för att fortsätta din resa</p>
        </motion.div>

        {purchases.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md mx-auto"
          >
            <Lock className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">Inga kurser ännu</h2>
            <p className="text-gray-600 mb-8">Du har inte köpt några kurser än.</p>
            <Link
              href="/utbildning"
              className="inline-block bg-[#FF7E70] hover:bg-[#ff6b5a] text-white px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              Utforska våra kurser
            </Link>
          </motion.div>
        ) : purchases.length > 1 ? (
          // Multiple courses - show interactive grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {purchases.map((purchase, index) => {
              const metadata = courseMetadata[purchase.course.name];
              if (!metadata) return null;
              
              return (
                <motion.div
                  key={purchase.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                  onClick={() => handleCourseAccess(purchase.course.name)}
                >
                  <div className="bg-white rounded-3xl shadow-lg overflow-hidden transform transition-all duration-300 group-hover:shadow-2xl">
                    {/* Gradient header */}
                    <div className={`h-32 bg-gradient-to-br ${metadata.color} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute top-4 right-4 text-6xl opacity-50">
                        {metadata.icon}
                      </div>
                      <div className="absolute bottom-4 left-6">
                        <h3 className="text-white text-2xl font-bold">{purchase.course.name}</h3>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-6 line-clamp-2">
                        {purchase.course.description}
                      </p>
                      
                      {/* Metadata */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{metadata.duration}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Award className="w-4 h-4" />
                          <span>{metadata.level}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <BookOpen className="w-4 h-4" />
                          <span>Köpt {new Date(purchase.createdAt).toLocaleDateString('sv-SE')}</span>
                        </div>
                      </div>
                      
                      {/* CTA Button */}
                      <button className="w-full bg-[#014421] text-white py-3 rounded-full font-medium group-hover:bg-[#116530] transition-colors flex items-center justify-center gap-2">
                        Gå till kurs
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          // Single course view (legacy - should redirect)
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Kurslista */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Dina kurser</h2>
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <button
                    key={purchase.id}
                    onClick={() => setSelectedCourse(purchase.course)}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedCourse?.id === purchase.course.id
                        ? 'bg-[#93C560] text-white shadow-lg'
                        : 'bg-white hover:bg-gray-50 shadow'
                    }`}
                  >
                    <h3 className="font-medium">{purchase.course.name}</h3>
                    <p className={`text-sm mt-1 ${
                      selectedCourse?.id === purchase.course.id
                        ? 'text-white/80'
                        : 'text-gray-600'
                    }`}>
                      Köpt {new Date(purchase.createdAt).toLocaleDateString('sv-SE')}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Kursinnehåll */}
            {selectedCourse && (
              <div className="lg:col-span-3">
                <div className="bg-white rounded-3xl shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedCourse.name}</h2>
                  <p className="text-gray-600 mb-8">{selectedCourse.description}</p>

                  {/* Access button */}
                  <button 
                    onClick={() => handleCourseAccess(selectedCourse.name)}
                    className="mb-8 bg-[#FF7E70] hover:bg-[#ff6b5a] text-white px-8 py-4 rounded-full font-medium transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Gå till kursdashboard
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Videor */}
                  {selectedCourse.content.videos && selectedCourse.content.videos.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Video className="text-[#93C560]" />
                        Kursvideor
                      </h3>
                      <div className="space-y-4">
                        {selectedCourse.content.videos.map((video) => (
                          <div key={video.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#93C560] transition-colors">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-800">{video.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                                <p className="text-sm text-gray-500 mt-2">Längd: {video.duration}</p>
                              </div>
                              <button className="bg-[#93C560] hover:bg-[#84b351] text-white p-3 rounded-lg transition-colors">
                                <Play className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PDFs */}
                  {selectedCourse.content.pdfs && selectedCourse.content.pdfs.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText className="text-[#93C560]" />
                        Kursmaterial
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCourse.content.pdfs.map((pdf) => (
                          <div key={pdf.id} className="border border-gray-200 rounded-xl p-4 hover:border-[#93C560] transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-800">{pdf.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{pdf.pages} sidor</p>
                              </div>
                              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg transition-colors">
                                <Download className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Funktioner */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Inkluderat i kursen:</h3>
                    <ul className="space-y-2">
                      {selectedCourse.features.map((feature, index) => {
                        const isString = typeof feature === 'string';
                        const title = isString ? (feature as string) : (feature as any).title || '';
                        const description = isString ? '' : (feature as any).description || '';
                        return (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-[#93C560] mt-1">✓</span>
                            <div>
                              <span className="text-gray-700">{title}</span>
                              {description && (
                                <div className="text-sm text-gray-500">{description}</div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
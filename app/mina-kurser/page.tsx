"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Award, BookOpen, ChevronRight, Clock, LogOut, Sparkles, Sprout, TrendingUp, User, Waves, Zap } from "lucide-react";;
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

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
  bgColor: string;
  icon: string; 
  dashboardPath: string;
  duration: string;
  level: string;
  image: string;
  progress?: number;
  nextLesson?: string;
}> = {
  'Functional Basics': {
    color: '#93C560',
    bgColor: 'bg-[#93C560]/10',
    icon: '🌱',
    dashboardPath: '/dashboard/courses/functional-basics',
    duration: '6 veckor',
    level: 'Nybörjare',
    image: '/functional_basic.png',
    progress: 35,
    nextLesson: 'Vecka 2: Antiinflammatorisk kost'
  },
  'Functional Gut Health/Flow': {
    color: '#6B8DD6',
    bgColor: 'bg-[#6B8DD6]/10',
    icon: '🌊',
    dashboardPath: '/dashboard/courses/functional-flow',
    duration: '6 veckor',
    level: 'Fortsättning',
    image: '/functional_flow.png',
    progress: 60,
    nextLesson: 'Vecka 4: Stresshantering'
  },
  'Functional Insulin balance/Energy': {
    color: '#FF7E70',
    bgColor: 'bg-[#FF7E70]/10',
    icon: '⚡',
    dashboardPath: '/dashboard/courses/functional-energy',
    duration: '6 veckor',
    level: 'Avancerad',
    image: '/functional_energy.png',
    progress: 20,
    nextLesson: 'Vecka 1: Energimetabolism'
  }
};

export default function MyCoursesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(userStr);
    setUser(user);
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
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#014421] mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar dina kurser...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Minimalist Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-[#014421]">
              Functional Foods
            </Link>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-10 h-10 bg-[#014421]/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-[#014421]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Välkommen tillbaka</p>
                  <p className="font-medium text-[#014421]">{user?.name || user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-[#014421] transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {purchases.length === 0 ? (
          // No courses view
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center py-16"
          >
            <div className="text-6xl mb-6">🎓</div>
            <h2 className="text-2xl font-bold text-[#014421] mb-3">Inga kurser ännu</h2>
            <p className="text-gray-600 mb-8">
              Börja din resa mot bättre hälsa med våra evidensbaserade kurser.
            </p>
            <Link
              href="/utbildning"
              className="inline-flex items-center gap-2 bg-[#014421] hover:bg-[#116530] text-white px-8 py-4 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
            >
              Utforska våra kurser
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        ) : purchases.length === 1 ? (
          // Single course - should auto-redirect, but show as fallback
          <div className="text-center py-8">
            <p className="text-gray-600">Dirigerar om till din kurs...</p>
          </div>
        ) : (
          // Multiple courses - beautiful selection interface
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 text-center"
            >
              <h1 className="text-4xl font-bold text-[#014421] mb-4">Välj din kurs</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Du har tillgång till {purchases.length} kurser. Välj den du vill fortsätta med idag.
              </p>
            </motion.div>

            {/* Course cards grid */}
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
                    onHoverStart={() => setHoveredCourse(purchase.course.name)}
                    onHoverEnd={() => setHoveredCourse(null)}
                    onClick={() => handleCourseAccess(purchase.course.name)}
                    className="cursor-pointer"
                  >
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                      {/* Course image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={metadata.image}
                          alt={purchase.course.name}
                          fill
                          className="object-cover transition-transform duration-300"
                          style={{ 
                            transform: hoveredCourse === purchase.course.name ? 'scale(1.05)' : 'scale(1)' 
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        {/* Course icon overlay */}
                        <div className="absolute top-4 right-4 text-4xl bg-white/90 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                          {metadata.icon}
                        </div>
                        
                        {/* Course name overlay */}
                        <div className="absolute bottom-4 left-6 right-6">
                          <h3 className="text-white text-2xl font-bold">{purchase.course.name}</h3>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        {/* Progress bar */}
                        {metadata.progress && (
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Framsteg</span>
                              <span className="text-sm font-medium text-[#014421]">{metadata.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metadata.progress}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: metadata.color }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${metadata.bgColor} flex items-center justify-center`}>
                              <Clock className="w-5 h-5" style={{ color: metadata.color }} />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Kurslängd</p>
                              <p className="font-medium text-gray-900">{metadata.duration}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${metadata.bgColor} flex items-center justify-center`}>
                              <TrendingUp className="w-5 h-5" style={{ color: metadata.color }} />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Nivå</p>
                              <p className="font-medium text-gray-900">{metadata.level}</p>
                            </div>
                          </div>

                          {metadata.nextLesson && (
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg ${metadata.bgColor} flex items-center justify-center`}>
                                <BookOpen className="w-5 h-5" style={{ color: metadata.color }} />
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Nästa lektion</p>
                                <p className="font-medium text-gray-900 text-sm">{metadata.nextLesson}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* CTA Button removed per request */}
                        {/* Previously here: Fortsätt kursen button */}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 bg-white rounded-2xl shadow-sm p-8"
            >
              <h2 className="text-xl font-bold text-[#014421] mb-6 text-center">Din lärande resa</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#93C560]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-[#93C560]" />
                  </div>
                  <p className="text-3xl font-bold text-[#014421]">{purchases.length}</p>
                  <p className="text-gray-600">Aktiva kurser</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#6B8DD6]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-[#6B8DD6]" />
                  </div>
                  <p className="text-3xl font-bold text-[#014421]">
                    {Math.round(purchases.reduce((acc, p) => acc + (courseMetadata[p.course.name]?.progress || 0), 0) / purchases.length)}%
                  </p>
                  <p className="text-gray-600">Total framsteg</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#FF7E70]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-8 h-8 text-[#FF7E70]" />
                  </div>
                  <p className="text-3xl font-bold text-[#014421]">∞</p>
                  <p className="text-gray-600">1 års åtkomst</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
} 
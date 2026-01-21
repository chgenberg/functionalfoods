"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Award, BookOpen, ChevronRight, Clock, LogOut, Sparkles, Sprout, TrendingUp, User, Waves, Zap } from "lucide-react";;
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { optimizeImageUrl, getResponsiveSizes } from '@/app/lib/imageOptimization';

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
    image: '/Kurser_bilder/Functional_Basics - Grunden i functional foods.jpg',
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
    image: '/Kurser_bilder/Functional_Gut Health.jpg',
    progress: 60,
    nextLesson: 'Vecka 4: Stresshantering'
  },
  'Functional Flow': {
    color: '#6B8DD6',
    bgColor: 'bg-[#6B8DD6]/10',
    icon: '🌊',
    dashboardPath: '/dashboard/courses/functional-flow',
    duration: '6 veckor',
    level: 'Fortsättning',
    image: '/Kurser_bilder/Functional_Gut Health.jpg',
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
    image: '/Kurser_bilder/Functional_insulin balance.jpg',
  },
  'Hormonell Balans': {
    color: '#8B5CF6',
    bgColor: 'bg-[#8B5CF6]/10',
    icon: '✨',
    dashboardPath: '/dashboard/courses/functional-hormone',
    duration: '6 veckor',
    level: 'Avancerad',
    image: '/LAX_MED_SAFFRANSSAS_OCH_QUINOASALLAD.avif',
    progress: 0,
    nextLesson: 'Vecka 1'
  },
  'Functional Energy': {
    color: '#FF7E70',
    bgColor: 'bg-[#FF7E70]/10',
    icon: '⚡',
    dashboardPath: '/dashboard/courses/functional-energy',
    duration: '6 veckor',
    level: 'Avancerad',
    image: '/Kurser_bilder/Functional_insulin balance.jpg',
    progress: 20,
    nextLesson: 'Vecka 1: Energimetabolism'
  },
  'Prova på vecka med Functional Foods!': {
    color: '#014421',
    bgColor: 'bg-[#014421]/10',
    icon: '🌿',
    dashboardPath: '/dashboard/courses/prova-pa-vecka',
    duration: '1 vecka',
    level: 'Nybörjare',
    image: '/kurser/prova-pa/prova-pa.png',
    progress: 0,
    nextLesson: 'Dag 1: Kom igång'
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
      
      // Debug logging
      console.log('📦 API Response - purchases:', purchases);
      console.log('📦 Course names:', purchases.map((p: any) => p.course?.name));
      console.log('📦 Available metadata keys:', Object.keys(courseMetadata));
      console.log('🔑 DEBUG INFO:', data._debug);
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0]">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <p className="text-xl text-gray-600">Välkommen tillbaka</p>
              <p className="text-3xl font-bold text-[#014421]">Laddar dina kurser...</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#014421] mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg">Hämtar kursinformation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      {/* Minimalist Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-6">
            <div className="flex items-center gap-4 text-gray-700">
              <div className="w-12 h-12 bg-[#014421]/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-[#014421]" />
              </div>
              <div className="text-center">
                <p className="text-lg text-gray-600">Välkommen tillbaka</p>
                <p className="text-2xl font-bold text-[#014421]">{user?.name || user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-8 text-gray-500 hover:text-[#014421] transition-colors p-2 rounded-lg hover:bg-gray-100"
                title="Logga ut"
              >
                <LogOut className="w-6 h-6" />
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
          // Single course - show course info and manual access
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-[#014421] mb-4">Din kurs</h1>
              <p className="text-lg text-gray-600">Klicka för att fortsätta där du slutade</p>
            </div>
            
            {purchases.map(purchase => {
              const metadata = courseMetadata[purchase.course.name];
              if (!metadata) {
                return (
                  <div key={purchase.id} className="bg-white rounded-2xl p-8 shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-[#014421] mb-4">{purchase.course.name}</h2>
                    <p className="text-gray-600 mb-6">Kurs-metadata saknas. Kontakta support.</p>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 bg-[#014421] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#112A12] transition-colors"
                    >
                      Gå till dashboard
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                );
              }
              
              return (
                <div key={purchase.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="relative h-64">
                    <Image
                      src={optimizeImageUrl(metadata.image, 'large', 'landscape')}
                      alt={purchase.course.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                      priority
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-6 left-6 right-6 text-white">
                      <h2 className="text-3xl font-bold mb-2">{purchase.course.name}</h2>
                      <p className="text-lg opacity-90">{metadata.duration} • {metadata.level}</p>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <Link
                      href={metadata.dashboardPath}
                      className="w-full bg-[#014421] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#112A12] transition-colors flex items-center justify-center gap-3"
                    >
                      Fortsätt kursen
                      <ArrowRight className="w-6 h-6" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </motion.div>
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
                console.log(`Course: "${purchase.course.name}", Metadata found:`, !!metadata);
                if (!metadata) {
                  console.log('Available metadata keys:', Object.keys(courseMetadata));
                  return null;
                }
                
                return (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onHoverStart={() => setHoveredCourse(purchase.course.name)}
                    onHoverEnd={() => setHoveredCourse(null)}
                    className="cursor-pointer"
                  >
                    <Link href={metadata.dashboardPath} className="block h-full">
                      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                        {/* Course image */}
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={optimizeImageUrl(metadata.image, 'large', 'landscape')}
                            alt={purchase.course.name}
                            fill
                            className="object-cover transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            priority={index < 3}
                            loading={index < 3 ? "eager" : "lazy"}
                            style={{ 
                              transform: hoveredCourse === purchase.course.name ? 'scale(1.05)' : 'scale(1)' 
                            }}
                          />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        {/* Course icon overlay removed per request */}
                        
                        {/* Course name overlay */}
                        <div className="absolute bottom-4 left-6 right-6">
                          <h3 className="text-white text-2xl font-bold">{purchase.course.name}</h3>
                        </div>
                      </div>
                      
                      {/* No progress/metadata content as requested */}
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Quick stats removed per request */}
          </>
        )}
      </div>
    </div>
  );
} 
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiVideo, FiFileText, FiLock, FiLogOut, FiUser, FiDownload, FiPlay } from 'react-icons/fi';

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
      
      // Smart redirect logic based on actual purchases
      if (purchases.length > 0) {
        const ownedCourses = purchases.map((p: any) => p.course.name);
        
        if (ownedCourses.includes('Functional Flow') && !ownedCourses.includes('Functional Basics')) {
          // Only Flow course - redirect to Flow dashboard
          router.push('/dashboard/courses/functional-flow');
          return;
        } else if (ownedCourses.includes('Functional Basics') && !ownedCourses.includes('Functional Flow')) {
          // Only Basic course - redirect to Basic dashboard
          router.push('/dashboard/courses/functional-basics');
          return;
        } else if (ownedCourses.includes('Functional Flow') && ownedCourses.includes('Functional Basics')) {
          // Has both courses - prioritize Flow (advanced course)
          router.push('/dashboard/courses/functional-flow');
          return;
        }
        
        // If they have other courses or multiple, stay on this page
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fffdf3' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar dina kurser...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffdf3' }}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-2xl font-bold text-primary">
              Functional Foods
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <FiUser />
                <span>{user?.name || user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <FiLogOut />
                <span>Logga ut</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8">Mina Kurser</h1>

        {purchases.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <FiLock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Inga kurser ännu</h2>
            <p className="text-gray-600 mb-6">Du har inte köpt några kurser än.</p>
            <Link
              href="/utbildning"
              className="inline-block bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-full font-medium transition-all"
            >
              Utforska våra kurser
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Kurslista */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Dina kurser</h2>
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <button
                    key={purchase.id}
                    onClick={() => setSelectedCourse(purchase.course)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedCourse?.id === purchase.course.id
                        ? 'bg-accent text-white'
                        : 'bg-white hover:bg-gray-50'
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
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedCourse.name}</h2>
                  <p className="text-gray-600 mb-8">{selectedCourse.description}</p>

                  {/* Videor */}
                  {selectedCourse.content.videos && selectedCourse.content.videos.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiVideo className="text-accent" />
                        Kursvideor
                      </h3>
                      <div className="space-y-4">
                        {selectedCourse.content.videos.map((video) => (
                          <div key={video.id} className="border border-gray-200 rounded-lg p-4 hover:border-accent transition-colors">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-800">{video.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                                <p className="text-sm text-gray-500 mt-2">Längd: {video.duration}</p>
                              </div>
                              <button className="bg-accent hover:bg-accent-hover text-white p-3 rounded-lg transition-colors">
                                <FiPlay />
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
                        <FiFileText className="text-accent" />
                        Kursmaterial
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCourse.content.pdfs.map((pdf) => (
                          <div key={pdf.id} className="border border-gray-200 rounded-lg p-4 hover:border-accent transition-colors">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-800">{pdf.title}</h4>
                                <p className="text-sm text-gray-500 mt-1">{pdf.pages} sidor</p>
                              </div>
                              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg transition-colors">
                                <FiDownload />
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
                      {selectedCourse.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-accent mt-1">✓</span>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
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
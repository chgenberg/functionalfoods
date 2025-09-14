"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Book, CheckCircle, ChevronLeft, Clock, Download, FileText, Heart, Pause, Play, PlayCircle, Share2, SkipForward, Star, Users, Video, Volume2 } from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  type: string;
  duration: string;
}

interface Week {
  week: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  name: string;
  description: string;
  weeks: Week[];
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentWeek, setCurrentWeek] = useState(1);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([1, 2, 3]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(`/api/courses/${courseId}`, {
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
          } else if (res.status === 403) {
            setError('Du har inte tillgång till denna kurs');
            return;
          }
          throw new Error('Failed to fetch course');
        }

        const courseData = await res.json();
        setCourse(courseData);
      } catch (error) {
        console.error('Error fetching course:', error);
        setError('Ett fel uppstod vid laddning av kursen');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, router]);

  const toggleLessonComplete = (lessonId: number) => {
    if (completedLessons.includes(lessonId)) {
      setCompletedLessons(completedLessons.filter(id => id !== lessonId));
    } else {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return Play;
      case 'pdf': return FileText;
      case 'recipe': return Book;
      default: return FileText;
    }
  };

  const calculateProgress = () => {
    if (!course || !course.weeks) return 0;
    const totalLessons = course.weeks.reduce((total, week) => total + week.lessons.length, 0);
    return totalLessons > 0 ? Math.round((completedLessons.length / totalLessons) * 100) : 0;
  };

  const getTotalLessons = () => {
    if (!course || !course.weeks) return 0;
    return course.weeks.reduce((total, week) => total + week.lessons.length, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Laddar kurs...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">{error || 'Kursen hittades inte'}</h1>
          <Link 
            href="/mina-kurser"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Tillbaka till mina kurser
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const totalLessons = getTotalLessons();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/mina-kurser" 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{course.name}</h1>
              <p className="text-sm text-gray-600">{course.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Course Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Din progress</h2>
                <span className="text-2xl font-bold text-primary">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="h-3 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{completedLessons.length} av {totalLessons} lektioner slutförda</span>
                <span>Vecka {currentWeek} av {course.weeks.length}</span>
              </div>
            </div>

            {/* Current Video Player */}
            {playingVideo && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="aspect-video bg-gray-900 rounded-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <p className="text-lg font-medium">Video Player</p>
                      <p className="text-sm opacity-80">Lektion {playingVideo} spelas</p>
                    </div>
                  </div>
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center gap-4 text-white">
                      <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <Pause className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <SkipForward className="w-5 h-5" />
                      </button>
                      <div className="flex-1 h-1 bg-white/30 rounded-full">
                        <div className="w-1/3 h-1 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm">8:32 / 18:45</span>
                      <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Video spelar</h3>
                    <p className="text-gray-600">Vecka {currentWeek} • Lektion {playingVideo}</p>
                  </div>
                  <button
                    onClick={() => toggleLessonComplete(playingVideo)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      completedLessons.includes(playingVideo)
                        ? 'bg-background-secondary text-secondary'
                        : 'bg-primary text-white hover:bg-accent'
                    }`}
                  >
                    {completedLessons.includes(playingVideo) ? 'Slutförd' : 'Markera som klar'}
                  </button>
                </div>
              </div>
            )}

            {/* Week Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Kursinnehåll</h2>
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {course.weeks.map((week) => (
                  <button
                    key={week.week}
                    onClick={() => setCurrentWeek(week.week)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      currentWeek === week.week
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Vecka {week.week}
                  </button>
                ))}
              </div>

              {/* Current Week Content */}
              {course.weeks
                .filter((week) => week.week === currentWeek)
                .map((week) => (
                  <div key={week.week}>
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{week.title}</h3>
                      <p className="text-gray-600">{week.description}</p>
                    </div>

                    <div className="space-y-4">
                      {week.lessons.map((lesson) => {
                        const Icon = getLessonIcon(lesson.type);
                        const isCompleted = completedLessons.includes(lesson.id);
                        
                        return (
                          <div
                            key={lesson.id}
                            className={`border rounded-lg p-4 transition-all cursor-pointer ${
                              isCompleted 
                                ? 'border-border bg-background' 
                                : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                            }`}
                            onClick={() => lesson.type === 'video' && setPlayingVideo(lesson.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${
                                isCompleted 
                                  ? 'bg-background-secondary' 
                                  : lesson.type === 'video' 
                                    ? 'bg-blue-100' 
                                    : lesson.type === 'recipe'
                                      ? 'bg-orange-100'
                                      : 'bg-gray-100'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className={`w-5 h-5 text-primary`} />
                                ) : (
                                  <Icon className={`w-5 h-5 ${
                                    lesson.type === 'video' 
                                      ? 'text-blue-600' 
                                      : lesson.type === 'recipe'
                                        ? 'text-orange-600'
                                        : 'text-gray-600'
                                  }`} />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800">{lesson.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Clock className="w-4 h-4" />
                                  {lesson.duration}
                                  <span className="text-gray-400">•</span>
                                  <span className="capitalize">{lesson.type === 'recipe' ? 'Recept' : lesson.type === 'pdf' ? 'PDF' : 'Video'}</span>
                                </div>
                              </div>

                              {lesson.type === 'pdf' && (
                                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                  <Download className="w-5 h-5 text-gray-600" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Om kursen</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">U</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Ulrika Davidsson</p>
                    <p className="text-sm text-gray-600">Kursansvarig</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm">{course.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kurslängd:</span>
                    <span className="font-medium">{course.weeks.length} veckor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Totalt lektioner:</span>
                    <span className="font-medium">{totalLessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nivå:</span>
                    <span className="font-medium">{course.name === 'Functional Flow' ? 'Avancerad' : 'Grundläggande'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Kursåtgärder</h3>
              <div className="space-y-3">
                {courseId === 'functional-basics' && (
                  <Link href="/dashboard/courses/functional-basics" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Book className="w-5 h-5 text-primary" />
                    <span className="font-medium text-gray-800">Kursmaterial</span>
                  </Link>
                )}
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-800">Ladda ner allt material</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium text-gray-800">Gå med i kursforum</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-800">Dela med vänner</span>
                </button>
              </div>
            </div>

            {/* Course Rating */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Betygsätt kursen</h3>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} className="p-1">
                    <Star className="w-6 h-6 text-yellow-400 fill-current" />
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mb-4">Hur nöjd är du med kursen?</p>
              <button className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:bg-accent transition-colors">
                Lämna omdöme
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
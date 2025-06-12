"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  FiPlay, FiDownload, FiBook, FiChevronLeft, FiCheckCircle,
  FiClock, FiUsers, FiStar, FiHeart, FiShare2, FiFileText,
  FiVideo, FiPlayCircle, FiPause, FiSkipForward, FiVolume2
} from "react-icons/fi";

export default function CoursePage() {
  const params = useParams();
  const courseId = params.id;
  const [currentWeek, setCurrentWeek] = useState(1);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([1, 2, 3]);

  // Dummy course data
  const courseData = {
    "1": {
      title: "Functional Flow",
      subtitle: "6 veckors avancerad kurs i funktionell kost",
      description: "Djupdyka i anti-inflammatorisk kost och tarmhälsa för optimal välmående",
      instructor: "Ulrika Davidsson",
      totalWeeks: 6,
      totalLessons: 18,
      completedLessons: 12,
      progress: 65
    },
    "2": {
      title: "Functional Basics",
      subtitle: "Grundkurs i funktionell kost",
      description: "Lär dig grunderna inom funktionell kost för bättre hälsa och välmående",
      instructor: "Ulrika Davidsson",
      totalWeeks: 6,
      totalLessons: 15,
      completedLessons: 15,
      progress: 100
    }
  };

  const course = courseData[courseId as keyof typeof courseData];

  const weeks = [
    {
      week: 1,
      title: "Grunderna i funktionell kost",
      description: "Introduktion till funktionella livsmedel och deras hälsoeffekter",
      lessons: [
        { id: 1, title: "Välkommen till kursen", type: "video", duration: "12 min", completed: true },
        { id: 2, title: "Vad är funktionell kost?", type: "video", duration: "18 min", completed: true },
        { id: 3, title: "Kursmaterial vecka 1", type: "pdf", duration: "15 sidor", completed: true }
      ]
    },
    {
      week: 2,
      title: "Tarmhälsa och mikrobiom",
      description: "Förstå tarmens roll för din övergripande hälsa",
      lessons: [
        { id: 4, title: "Tarmens ekosystem", type: "video", duration: "22 min", completed: true },
        { id: 5, title: "Probiotika vs prebiotika", type: "video", duration: "16 min", completed: true },
        { id: 6, title: "Recept: Fermenterade livsmedel", type: "recipe", duration: "5 recept", completed: false }
      ]
    },
    {
      week: 3,
      title: "Anti-inflammatorisk kost",
      description: "Minska inflammation genom medveten måltidsplanering",
      lessons: [
        { id: 7, title: "Inflammation och kost", type: "video", duration: "20 min", completed: false },
        { id: 8, title: "Omega-3 och dess betydelse", type: "video", duration: "14 min", completed: false },
        { id: 9, title: "Måltidsplanering vecka 3", type: "pdf", duration: "Veckoplan", completed: false }
      ]
    },
    {
      week: 4,
      title: "Adaptogener och superfoods",
      description: "Upptäck kraftfulla växter för stresshantering",
      lessons: [
        { id: 10, title: "Introduktion till adaptogener", type: "video", duration: "19 min", completed: false },
        { id: 11, title: "Populära superfoods", type: "video", duration: "17 min", completed: false },
        { id: 12, title: "Smoothie-recept med adaptogener", type: "recipe", duration: "8 recept", completed: false }
      ]
    }
  ];

  const toggleLessonComplete = (lessonId: number) => {
    if (completedLessons.includes(lessonId)) {
      setCompletedLessons(completedLessons.filter(id => id !== lessonId));
    } else {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return FiPlay;
      case 'pdf': return FiFileText;
      case 'recipe': return FiBook;
      default: return FiFileText;
    }
  };

  if (!course) {
    return <div>Kurs ej hittad</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiChevronLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{course.title}</h1>
              <p className="text-sm text-gray-600">{course.subtitle}</p>
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
                <span className="text-2xl font-bold text-primary">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="h-3 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{course.completedLessons} av {course.totalLessons} lektioner slutförda</span>
                <span>Vecka {currentWeek} av {course.totalWeeks}</span>
              </div>
            </div>

            {/* Current Video Player */}
            {playingVideo && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="aspect-video bg-gray-900 rounded-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <FiPlayCircle className="w-16 h-16 mx-auto mb-4 opacity-80" />
                      <p className="text-lg font-medium">Video Player</p>
                      <p className="text-sm opacity-80">Lektion {playingVideo} spelas</p>
                    </div>
                  </div>
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center gap-4 text-white">
                      <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <FiPause className="w-5 h-5" />
                      </button>
                      <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <FiSkipForward className="w-5 h-5" />
                      </button>
                      <div className="flex-1 h-1 bg-white/30 rounded-full">
                        <div className="w-1/3 h-1 bg-white rounded-full"></div>
                      </div>
                      <span className="text-sm">8:32 / 18:45</span>
                      <button className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <FiVolume2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Vad är funktionell kost?</h3>
                    <p className="text-gray-600">Vecka 1 • 18 minuter</p>
                  </div>
                  <button
                    onClick={() => toggleLessonComplete(playingVideo)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      completedLessons.includes(playingVideo)
                        ? 'bg-green-100 text-green-700'
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
                {weeks.map((week) => (
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
              {weeks
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
                                ? 'border-green-200 bg-green-50' 
                                : 'border-gray-200 hover:border-primary/50 hover:shadow-md'
                            }`}
                            onClick={() => lesson.type === 'video' && setPlayingVideo(lesson.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${
                                isCompleted 
                                  ? 'bg-green-100' 
                                  : lesson.type === 'video' 
                                    ? 'bg-blue-100' 
                                    : lesson.type === 'recipe'
                                      ? 'bg-orange-100'
                                      : 'bg-gray-100'
                              }`}>
                                {isCompleted ? (
                                  <FiCheckCircle className={`w-5 h-5 text-green-600`} />
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
                                  <FiClock className="w-4 h-4" />
                                  {lesson.duration}
                                  <span className="text-gray-400">•</span>
                                  <span className="capitalize">{lesson.type}</span>
                                </div>
                              </div>

                              {lesson.type === 'pdf' && (
                                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                  <FiDownload className="w-5 h-5 text-gray-600" />
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
                    <p className="font-medium text-gray-800">{course.instructor}</p>
                    <p className="text-sm text-gray-600">Kursansvarig</p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm">{course.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kurslängd:</span>
                    <span className="font-medium">{course.totalWeeks} veckor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Totalt lektioner:</span>
                    <span className="font-medium">{course.totalLessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nivå:</span>
                    <span className="font-medium">Avancerad</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Kursåtgärder</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiDownload className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-800">Ladda ner allt material</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiUsers className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-800">Gå med i kursforum</span>
                </button>
                
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiShare2 className="w-5 h-5 text-purple-600" />
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
                    <FiStar className="w-6 h-6 text-yellow-400 fill-current" />
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
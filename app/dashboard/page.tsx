"use client";
import Link from "next/link";
import { 
  FiPlay, FiDownload, FiBook, FiUsers, FiCalendar, FiTrendingUp, FiCheckCircle,
  FiArrowRight, FiActivity, FiZap, FiTarget
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";

// Hårdkodad data för demonstration
const activeCourses = [
  {
    id: 1,
    title: "Functional Flow",
    subtitle: "6 veckors avancerad kurs",
    progress: 65,
    currentWeek: "Vecka 4",
    nextLesson: "Anti-inflammatoriska livsmedel",
    color: "from-blue-500 to-blue-600",
    totalLessons: 18,
    completedLessons: 12
  },
  {
    id: 2,
    title: "Functional Basics",
    subtitle: "Grundkurs i funktionell kost",
    progress: 100,
    currentWeek: "Slutförd",
    nextLesson: "Kurs avslutad!",
    color: "from-green-500 to-green-600",
    totalLessons: 15,
    completedLessons: 15
  }
];

const quickActions = [
  { icon: FiPlay, label: "Fortsätt kurs", href: "/dashboard/courses" },
  { icon: FiBook, label: "Nya recept", href: "/dashboard/recipes" },
  { icon: FiUsers, label: "Community", href: "/dashboard/community" },
  { icon: FiCalendar, label: "Boka coaching", href: "/dashboard/coaching" },
];

const healthMetrics = {
  goals: [
    { title: "Sov 8 timmar", progress: 75, icon: FiZap, color: "bg-blue-100 text-blue-600" },
    { title: "Drick 2.5L vatten", progress: 88, icon: FiTarget, color: "bg-green-100 text-green-600" },
    { title: "30 min träning", progress: 100, icon: FiActivity, color: "bg-purple-100 text-purple-600" }
  ]
};


export default function DashboardOverviewPage() {
  const { user } = useAuth(); // Hämta den inloggade användaren

  const userStats = {
      coursesCompleted: 2,
      totalProgress: 78,
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-primary rounded-3xl p-8 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Välkommen tillbaka, {user?.name?.split(' ')[0] || 'Användare'}! 🌱
          </h1>
          <p className="text-xl opacity-90 mb-6">
            Fortsätt din hälsoresa med funktionella livsmedel
          </p>
          <div className="flex flex-wrap gap-4">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-full transition-all transform hover:scale-105"
              >
                <action.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{userStats.totalProgress}%</h3>
              <p className="text-gray-600 text-sm">Genomsnitt</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">{userStats.coursesCompleted}</h3>
              <p className="text-gray-600 text-sm">Kurser</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
              <FiBook className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">127</h3>
              <p className="text-gray-600 text-sm">Recept</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white">
              <FiCalendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800">2</h3>
              <p className="text-gray-600 text-sm">Coaching</p>
            </div>
          </div>
        </div>
      </div>


      {/* Current Courses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Aktuella kurser</h2>
          <Link href="/dashboard/courses" className="text-primary hover:text-accent font-medium flex items-center gap-2">
            Visa alla <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {activeCourses.map((course) => (
            <div key={course.id} className="group hover:shadow-lg transition-all duration-300 border border-gray-200 rounded-2xl p-6 hover:border-primary/20">
              <div className="flex items-start gap-4 mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${course.color} rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-bold text-xl`}>
                    {course.title[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-gray-800 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.subtitle}</p>
                   <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                    course.progress === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {course.currentWeek}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{course.completedLessons}/{course.totalLessons} lektioner</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${course.color} transition-all duration-500`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>

               <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {course.progress === 100 ? "🎉 Grattis! Kurs slutförd" : `Nästa: ${course.nextLesson}`}
                </p>
                <Link 
                  href={`/dashboard/courses/${course.id}`}
                  className={`px-6 py-2 rounded-xl font-medium text-sm transition-all hover:scale-105 ${
                    course.progress === 100 
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                      : 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg'
                  }`}
                >
                  {course.progress === 100 ? 'Se certifikat' : 'Fortsätt'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Health Metrics */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Hälsomål idag</h2>
          <Link href="/dashboard/health" className="text-primary hover:text-accent font-medium flex items-center gap-2">
            Se detaljer <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {healthMetrics.goals.map((goal, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${goal.color}`}>
                  <goal.icon className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-sm text-gray-800 uppercase tracking-wider">{goal.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-700"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-700">{goal.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
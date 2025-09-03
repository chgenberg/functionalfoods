"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, CheckCircle, Clock, MessageSquare, ShoppingCart, Target, Trophy, User, Video, Zap, Battery, Coffee, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/hooks/useAuth';
import WeekHeroWithVideo from '../../components/WeekHeroWithVideo';

export default function FunctionalEnergyOversiktPage() {
  const { user } = useAuth();
  const [courseStartDate, setCourseStartDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseStartDate = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/user/course-start-date', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id, 
            courseId: 'functional-energy' 
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.startDate) {
            setCourseStartDate(new Date(data.startDate));
          }
        }
      } catch (error) {
        console.error('Error fetching course start date:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseStartDate();
  }, [user]);

  const getCurrentWeek = () => {
    if (!courseStartDate) return 1;
    const daysSinceStart = Math.floor((new Date().getTime() - courseStartDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(Math.floor(daysSinceStart / 7) + 1, 6);
  };

  const currentWeek = getCurrentWeek();

  const weekProgress = [
    { week: 1, title: "Introduktion", status: currentWeek >= 1 ? "completed" : "locked" },
    { week: 2, title: "Blodsocker & energi", status: currentWeek >= 2 ? "completed" : (currentWeek === 1 ? "current" : "locked") },
    { week: 3, title: "Måltidsplanering", status: currentWeek >= 3 ? "completed" : (currentWeek === 2 ? "current" : "locked") },
    { week: 4, title: "Smarta kolhydrater", status: currentWeek >= 4 ? "completed" : (currentWeek === 3 ? "current" : "locked") },
    { week: 5, title: "Energistabila vanor", status: currentWeek >= 5 ? "completed" : (currentWeek === 4 ? "current" : "locked") },
    { week: 6, title: "Långsiktig hållbarhet", status: currentWeek >= 6 ? "completed" : (currentWeek === 5 ? "current" : "locked") }
  ];

  const quickLinks = [
    { icon: Calendar, label: "Kostschema", href: "/dashboard/courses/functional-energy/kostschema", color: "bg-green-100 text-green-600" },
    { icon: ShoppingCart, label: "Inköpslistor", href: "/dashboard/courses/functional-energy/inkopslista", color: "bg-blue-100 text-blue-600" },
    { icon: MessageSquare, label: "Community", href: "/dashboard/courses/functional-energy/community", color: "bg-purple-100 text-purple-600" },
    { icon: Target, label: "Mina mål", href: "/dashboard/courses/functional-energy/goals", color: "bg-orange-100 text-orange-600" }
  ];

  const achievements = [
    { icon: Battery, title: "Energistarten", description: "Genomför din första vecka", earned: currentWeek >= 1 },
    { icon: Coffee, title: "Sockerfri", description: "Minska ditt sockerberoende", earned: currentWeek >= 3 },
    { icon: Zap, title: "Stabil energi", description: "Håll energin uppe en hel vecka", earned: currentWeek >= 4 },
    { icon: Moon, title: "Bättre sömn", description: "Förbättra din sömnkvalitet", earned: currentWeek >= 5 },
    { icon: Trophy, title: "Kursmästare", description: "Slutför hela kursen", earned: currentWeek >= 6 }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <WeekHeroWithVideo
        title="Välkommen till Functional Energy!"
        subtitle="Din 6-veckors resa mot stabilt blodsocker och jämn energi"
        description="Nu har du en viktig och spännande resa framför dig under 6 veckor med näringsrika recept och grunderna i Functional Foods, särskilt utformade för att stödja din hälsa och hjälpa dig att hantera typ 2-diabetes eller prediabetes."
        videoUrl=""
        backgroundImage="/Bilder_flow/gron-smoothie-med-avokado-och-hampaprotein.jpg"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message from Ulrika */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3] rounded-3xl p-8 md:p-12">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <User className="w-8 h-8 md:w-10 md:h-10 text-[#014421]" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-[#014421] mb-4">Välkommen till Functional Energy</h2>
                <div className="prose prose-lg text-gray-700 leading-relaxed space-y-4">
                  <p>
                    Nu har du en viktig och spännande resa framför dig under 6 veckor med näringsrika recept och grunderna i Functional Foods, särskilt utformade för att stödja din hälsa och hjälpa dig att hantera typ 2-diabetes eller prediabetes. Du kommer att få praktiska kostscheman, recept för alla måltider och inköpslistor varje vecka.
                  </p>
                  <p>
                    Under dessa veckor kommer du att lära dig hur en näringsrik kost kan bidra till att stabilisera ditt blodsocker, minska inflammation och öka din energi. Genom att följa denna kostplan och förstå hur maten påverkar din kropp, kan du förbättra både ditt blodsocker och ditt allmänna välbefinnande.
                  </p>
                  <p>
                    Mitt bästa tips är planering – laga gärna flera maträtter i förväg så att du är väl förberedd och kan hålla dig till din nya, hälsosamma livsstil.
                  </p>
                  <p className="font-medium text-[#014421]">
                    Varmt välkommen till en livsstil som kan förbättra din hälsa och hjälpa dig att kontrollera blodsockret för ett friskare liv!
                  </p>
                  <p className="text-right font-medium text-[#014421] mt-6">
                    /Ulrika
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Knowledge Documents Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kunskapsdokument och artiklar</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <BookOpen className="w-8 h-8 text-[#93C560] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-[#014421] mb-3">Viktiga kunskapsartiklar</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  I kursen har vi samlat flera viktiga kunskapsartiklar som vi rekommenderar att ni läser för att få en bättre förståelse. Dessa artiklar handlar om både Functional Foods och hur ni kan äta rätt för att stödja en hälsosam kropp.
                </p>
                <div className="bg-[#F3EFE3] rounded-xl p-4 border-l-4 border-[#93C560]">
                  <p className="text-[#014421] font-medium">
                    📚 Vi rekommenderar att ni börjar med att läsa dokumentet "Vad drabbas man av diabetes typ-2 och vad innebär det?" för att få en grundläggande förståelse för sjukdomen och hur den påverkar kroppen.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <Link 
                href="/dashboard/courses/functional-energy/material"
                className="bg-[#014421] text-white px-6 py-3 rounded-full font-medium hover:bg-[#116530] transition-colors"
              >
                Läs kunskapsmaterial
              </Link>
              <Link 
                href="/kunskapsbank/artiklar"
                className="bg-white text-[#014421] px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors border border-gray-200"
              >
                Utforska kunskapsbank
              </Link>
            </div>
          </div>
        </section>

        {/* Progress Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Din kursresa</h2>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-600">Du är nu i</p>
                <p className="text-2xl font-bold text-[#014421]">Vecka {currentWeek}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Kursframsteg</p>
                <p className="text-2xl font-bold text-[#93C560]">{Math.round((currentWeek / 6) * 100)}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#93C560] to-[#7FBA3D]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentWeek / 6) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              {/* Week Markers */}
              <div className="absolute -top-1 left-0 right-0 flex justify-between">
                {weekProgress.map((week) => (
                  <div key={week.week} className="relative group">
                    <div className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-all
                      ${week.status === 'completed' ? 'bg-[#93C560] border-[#93C560]' : 
                        week.status === 'current' ? 'bg-white border-[#93C560]' : 
                        'bg-gray-300 border-gray-300'}`}
                    >
                      {week.status === 'completed' && (
                        <CheckCircle className="w-3 h-3 text-white absolute top-0.5 left-0.5" />
                      )}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Vecka {week.week}: {week.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Week Details */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
              {weekProgress.map((week) => (
                <Link
                  key={week.week}
                  href={week.status === 'locked' ? '#' : `/dashboard/courses/functional-energy/week/${week.week}`}
                  className={`text-center p-4 rounded-xl transition-all ${
                    week.status === 'completed' ? 'bg-green-50 hover:bg-green-100' :
                    week.status === 'current' ? 'bg-blue-50 hover:bg-blue-100 ring-2 ring-blue-500' :
                    'bg-gray-100 cursor-not-allowed opacity-50'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-600">Vecka {week.week}</p>
                  <p className="text-xs text-gray-500 mt-1">{week.title}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Snabblänkar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all group"
              >
                <div className={`w-16 h-16 rounded-2xl ${link.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <link.icon className="w-8 h-8" />
                </div>
                <p className="font-medium text-gray-900">{link.label}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Current Week Focus */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Denna veckas fokus</h2>
          <div className="bg-gradient-to-br from-[#F7F1E8] to-[#F3EFE3] rounded-2xl p-8">
            <div className="flex items-start gap-6">
              <div className="bg-white rounded-xl p-4">
                <Calendar className="w-12 h-12 text-[#93C560]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#014421] mb-2">
                  Vecka {currentWeek}: {weekProgress[currentWeek - 1]?.title}
                </h3>
                <p className="text-gray-700 mb-4">
                  {currentWeek === 1 && "Denna vecka lägger vi grunden för din energiresa. Du kommer lära dig grunderna om blodsocker och börja med enkla förändringar."}
                  {currentWeek === 2 && "Nu fördjupar vi oss i sambandet mellan mat och energi. Du får praktiska verktyg för att stabilisera blodsockret."}
                  {currentWeek === 3 && "Dags att lära dig planera måltider som ger långvarig energi. Vi fokuserar på timing och sammansättning."}
                  {currentWeek === 4 && "Denna vecka handlar om att välja rätt kolhydrater. Du lär dig skilja på snabba och långsamma kolhydrater."}
                  {currentWeek === 5 && "Nu bygger vi vanor som håller. Du får strategier för att hantera utmaningar och hålla energin stabil."}
                  {currentWeek === 6 && "Sista veckan! Vi sammanfattar och planerar för hur du fortsätter din energiresa efter kursen."}
                </p>
                <div className="flex gap-4">
                  <Link
                    href={`/dashboard/courses/functional-energy/week/${currentWeek}`}
                    className="bg-[#FF7E70] text-white px-6 py-3 rounded-full font-medium hover:bg-[#FF6B5C] transition-colors"
                  >
                    Gå till veckan
                  </Link>
                  <Link
                    href="/dashboard/courses/functional-energy/kostschema"
                    className="bg-white text-[#014421] px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
                  >
                    Se kostschema
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dina prestationer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl p-6 text-center ${
                  achievement.earned ? 'ring-2 ring-[#93C560]' : 'opacity-50'
                }`}
              >
                <div className={`w-16 h-16 rounded-full ${
                  achievement.earned ? 'bg-[#93C560]/20' : 'bg-gray-100'
                } flex items-center justify-center mx-auto mb-4`}>
                  <achievement.icon className={`w-8 h-8 ${
                    achievement.earned ? 'text-[#93C560]' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{achievement.title}</h3>
                <p className="text-xs text-gray-600">{achievement.description}</p>
                {achievement.earned && (
                  <CheckCircle className="w-5 h-5 text-[#93C560] mx-auto mt-3" />
                )}
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
} 
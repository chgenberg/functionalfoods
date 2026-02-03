"use client";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Clock, TrendingUp } from 'lucide-react';

export default function UtbildningPage() {
  const courses = [
    {
      id: 'prova-pa',
      title: 'Prova på vecka',
      description: 'Gratis prova-på-kurs med functional foods-recept som ger dig en stabil start. Perfekt för att testa innan du väljer längre kurs.',
      href: '/utbildning/prova-pa-vecka',
      image: '/prova-pa/prova-pa.png',
      duration: '1 vecka',
      level: 'Gratis',
      highlights: ['7 dagars kostschema', '15 näringsrika recept', 'Inköpslista & kunskapsdokument'],
      isFree: true
    },
      {
      id: 'ny-testkurs',
      title: 'Prova på vecka test',
      description: 'Gratis prova-på-kurs med functional foods-recept som ger dig en stabil start. Perfekt för att testa innan du väljer längre kurs.',
      href: '/utbildning/ny-testkurs',
      image: '/prova-pa/prova-pa.png',
      duration: '1 vecka',
      level: 'Gratis',
      highlights: ['7 dagars kostschema', '15 näringsrika recept', 'Inköpslista & kunskapsdokument'],
      isFree: true
    },
    {
      id: 'basics',
      title: 'Functional Basics',
      description: 'Lär dig grunderna i Functional Foods och bygg hållbara vanor som ger energi och balans.',
      href: '/utbildning/functional-basics',
      image: '/Kurser_bilder/Functional_Basics - Grunden i functional foods.jpg',
      duration: '6 veckor',
      level: 'Nybörjare',
      highlights: ['Grunderna i functional foods', 'Veckomenyer och recept', 'Praktiska verktyg och mål']
    },
    {
      id: 'flow',
      title: 'Functional Gut Health/Flow',
      description: 'Fördjupning med fokus på maghälsa, antiinflammation och naturligt flöde i vardagen.',
      href: '/utbildning/functional-flow',
      image: '/Kurser_bilder/Functional_Gut Health.jpg',
      duration: '6 veckor',
      level: 'Fortsättning',
      highlights: ['Maghälsa & mikrobiom', 'Antiinflammatorisk kost', 'Vanor som håller över tid']
    },
    {
      id: 'energy',
      title: 'Functional Insulin balance/Energy',
      description: 'För dig som vill stabilisera blodsockret och få jämn energi. Perfekt vid prediabetes eller energidippar.',
      href: '/utbildning/functional-energy',
      image: '/Kurser_bilder/Functional_insulin balance.jpg',
      duration: '6 veckor',
      level: 'Alla nivåer',
      highlights: ['Stabilt blodsocker', 'Jämn energi hela dagen', 'Minska sötsug och trötthet']
    },
    {
      id: 'hormone',
      title: 'Hormonell Balans',
      description: 'För dig som vill få koll på dina hormoner. Kombinera rätt kost och coachning för hormonell balans.',
      href: '/utbildning/hormonell-balans',
      image: '/LAX_MED_SAFFRANSSAS_OCH_QUINOASALLAD.avif',
      duration: '6 veckor',
      level: 'Alla nivåer',
      highlights: ['Hormonell balans', 'Antiinflammatorisk kost', 'Styrketräning & coaching']
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mb-8 md:mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">Alla kurser</h1>
          <p className="mt-3 md:mt-4 text-gray-600 max-w-2xl mx-auto">
            Välj den kurs som passar dig bäst. Oavsett om du vill komma igång eller fördjupa dig – här hittar du vägen framåt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {courses.map((course, idx) => (
            <div key={course.id} className={`group relative overflow-hidden rounded-2xl border ${course.isFree ? 'border-[#014421] ring-2 ring-[#014421]/20' : 'border-gray-100'} bg-white shadow-sm hover:shadow-lg transition-shadow`}>
              {/* Free badge */}
              {course.isFree && (
                <div className="absolute top-4 right-4 z-20 bg-[#014421] text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">
                  GRATIS!
                </div>
              )}
              <div className="relative h-48 md:h-60 w-full overflow-hidden">
                {/* Make image clickable to course page */}
                <Link href={course.href} className="absolute inset-0 z-10" aria-label={course.title} />
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  priority
                  loading="eager"
                  decoding="async"
                  quality={60}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  unoptimized={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                <div className="absolute left-4 bottom-4 flex items-center gap-3 text-white">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span>{course.level}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{course.title}</h2>
                <p className="mt-2 text-gray-600">{course.description}</p>

                <ul className="mt-4 space-y-2 text-gray-700 text-sm">
                  {course.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2">
                      <BookOpen className="mt-0.5 w-4 h-4 text-primary" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  <Link
                    href={course.href}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${course.isFree ? 'bg-[#014421] hover:bg-[#116530]' : 'bg-primary hover:bg-secondary'} text-white transition-colors`}
                  >
                    {course.isFree ? 'Starta gratis' : 'Läs mer'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>
    </main>
  );
} 

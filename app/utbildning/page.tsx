"use client";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Clock, TrendingUp } from 'lucide-react';

export default function UtbildningPage() {
  const courses = [
    {
      id: 'basics',
      title: 'Functional Basics',
      description: 'Lär dig grunderna i Functional Foods och bygg hållbara vanor som ger energi och balans.',
      href: '/utbildning/functional-basics',
      image: '/basic.JPG',
      duration: '6 veckor',
      level: 'Nybörjare',
      highlights: ['Grunderna i functional foods', 'Veckomenyer och recept', 'Praktiska verktyg och mål']
    },
    {
      id: 'flow',
      title: 'Functional Flow',
      description: 'Fördjupning med fokus på maghälsa, antiinflammation och naturligt flöde i vardagen.',
      href: '/utbildning/functional-flow',
      image: '/flow.JPG',
      duration: '6 veckor',
      level: 'Fortsättning',
      highlights: ['Maghälsa & mikrobiom', 'Antiinflammatorisk kost', 'Vanor som håller över tid']
    },
    {
      id: 'energy',
      title: 'Functional Energy',
      description: 'För dig som vill stabilisera blodsockret och få jämn energi. Perfekt vid prediabetes eller energidippar.',
      href: '/utbildning/functional-energy',
      image: '/Bilder_flow/lax-med-sellerisallad-och-valnotter.JPG',
      duration: '6 veckor',
      level: 'Alla nivåer',
      highlights: ['Stabilt blodsocker', 'Jämn energi hela dagen', 'Minska sötsug och trötthet']
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
          {courses.map((course) => (
            <div key={course.id} className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow">
              <div className="relative h-48 md:h-60 w-full overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
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

                <div className="mt-5 flex items-center justify-between">
                  <Link
                    href={course.href}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-secondary transition-colors"
                  >
                    Läs mer
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href={course.id === 'basics' ? '/dashboard/courses/functional-basics' : '/dashboard/courses/functional-flow'}
                    className="text-primary hover:text-secondary font-medium"
                  >
                    Gå till kursen →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-14 text-center">
          <Link
            href="/utbildning/kurskatalog"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-primary font-medium"
          >
            Visa hela kurskatalogen
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
} 